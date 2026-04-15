import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import type {
  OverlayProfile,
  OverlayProfileEnv,
  TeamsProfileMetadata,
  TeamsProfileSource,
} from "../../core/model/profile.ts";
import type { ProfileStore } from "../../core/ports/profile-store.ts";

interface ProfileFileShape {
  readonly schemaVersion: 1;
  readonly profiles: readonly OverlayProfile[];
}

export class JsonProfileStore implements ProfileStore {
  private readonly lockPath: string;

  constructor(private readonly filePath: string) {
    this.lockPath = join(dirname(filePath), `.${basename(filePath)}.lock`);
  }

  async list(): Promise<readonly OverlayProfile[]> {
    return (await this.readFile()).profiles;
  }

  async get(id: string): Promise<OverlayProfile | null> {
    const profiles = await this.list();
    return profiles.find((profile) => profile.id === id) ?? null;
  }

  async put(profile: OverlayProfile): Promise<void> {
    await this.withWriteLock(async () => {
      const data = await this.readFile();
      const next = data.profiles.filter((item) => item.id !== profile.id);
      next.push(profile);
      await this.writeFile({
        schemaVersion: 1,
        profiles: next.sort((a, b) => a.id.localeCompare(b.id)),
      });
    });
  }

  async remove(id: string): Promise<void> {
    await this.withWriteLock(async () => {
      const data = await this.readFile();
      await this.writeFile({
        schemaVersion: 1,
        profiles: data.profiles.filter((profile) => profile.id !== id),
      });
    });
  }

  private async readFile(): Promise<ProfileFileShape> {
    try {
      const content = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(content) as Partial<ProfileFileShape>;
      return {
        schemaVersion: 1,
        profiles: Array.isArray(parsed.profiles)
          ? parsed.profiles
              .map((profile) => normalizeProfile(profile))
              .filter((profile): profile is OverlayProfile => profile != null)
          : [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { schemaVersion: 1, profiles: [] };
      }

      throw error;
    }
  }

  private async writeFile(data: ProfileFileShape): Promise<void> {
    const tempFilePath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempFilePath, JSON.stringify(data, null, 2), "utf8");
    await rename(tempFilePath, this.filePath);
  }

  private async withWriteLock<T>(work: () => Promise<T>): Promise<T> {
    await acquireLock(this.lockPath);

    try {
      return await work();
    } finally {
      await rm(this.lockPath, { recursive: true, force: true });
    }
  }
}

function normalizeProfile(value: unknown): OverlayProfile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const profile = value as Partial<OverlayProfile>;
  if (
    typeof profile.id !== "string" ||
    typeof profile.label !== "string" ||
    profile.kind !== "overlay" ||
    typeof profile.tokenRef !== "string" ||
    typeof profile.createdAt !== "string" ||
    typeof profile.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: profile.id,
    label: profile.label,
    kind: "overlay",
    tokenRef: profile.tokenRef,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    lastUsedAt:
      typeof profile.lastUsedAt === "string" ? profile.lastUsedAt : undefined,
    env: normalizeProfileEnv(profile.env),
    teams: normalizeTeamsProfile(profile.teams),
  };
}

function normalizeProfileEnv(value: unknown): OverlayProfileEnv | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const env = value as Partial<OverlayProfileEnv>;
  if (
    env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB !== "0" &&
    env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB !== "1"
  ) {
    return undefined;
  }

  return {
    CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB,
  };
}

function normalizeTeamsProfile(value: unknown): TeamsProfileMetadata | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const teams = value as Partial<TeamsProfileMetadata>;
  if (
    teams.enabled !== true ||
    typeof teams.homeDir !== "string" ||
    (teams.state !== "ready" &&
      teams.state !== "stale" &&
      teams.state !== "broken") ||
    teams.seedPreset !== "host-lite" ||
    typeof teams.manifestPath !== "string"
  ) {
    return undefined;
  }

  const source = normalizeTeamsSource(teams.source);
  if (!source) {
    return undefined;
  }

  return {
    enabled: true,
    homeDir: teams.homeDir,
    state: teams.state,
    seedPreset: "host-lite",
    source,
    manifestPath: teams.manifestPath,
    lastSeededAt:
      typeof teams.lastSeededAt === "string" ? teams.lastSeededAt : undefined,
    lastSyncedAt:
      typeof teams.lastSyncedAt === "string" ? teams.lastSyncedAt : undefined,
  };
}

function normalizeTeamsSource(value: unknown): TeamsProfileSource | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Partial<TeamsProfileSource>;
  if (
    source.kind !== "overlay" ||
    typeof source.profileId !== "string" ||
    typeof source.configDir !== "string"
  ) {
    return undefined;
  }

  return {
    kind: "overlay",
    profileId: source.profileId,
    configDir: source.configDir,
    fingerprint:
      typeof source.fingerprint === "string" ? source.fingerprint : undefined,
  };
}

const LOCK_WAIT_MS = 25;
const LOCK_TIMEOUT_MS = 5_000;
const STALE_LOCK_MS = 15_000;

async function acquireLock(lockPath: string): Promise<void> {
  const deadline = Date.now() + LOCK_TIMEOUT_MS;

  while (true) {
    try {
      await mkdir(lockPath);
      return;
    } catch (error) {
      const errno = error as NodeJS.ErrnoException;
      if (errno.code !== "EEXIST") {
        throw error;
      }

      await clearStaleLock(lockPath);

      if (Date.now() >= deadline) {
        throw new Error(`Timed out waiting for profile store lock at ${lockPath}.`);
      }

      await sleep(LOCK_WAIT_MS);
    }
  }
}

async function clearStaleLock(lockPath: string): Promise<void> {
  try {
    const metadata = await stat(lockPath);
    if (Date.now() - metadata.mtimeMs >= STALE_LOCK_MS) {
      await rm(lockPath, { recursive: true, force: true });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
