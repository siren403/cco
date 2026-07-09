import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import {
  isAllowedProviderEnvKey,
  type OverlayProfile,
  type OverlayProfileEnv,
  type OverlayProviderConfig,
  type IsolateProfileMetadata,
  type IsolateSessionContinuityMetadata,
  type IsolateProfileSource,
  type ProfileAuthKind,
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
  const authKind: ProfileAuthKind = profile.authKind === "provider" ? "provider" : "oauth";

  if (
    typeof profile.id !== "string" ||
    typeof profile.label !== "string" ||
    profile.kind !== "overlay" ||
    typeof profile.createdAt !== "string" ||
    typeof profile.updatedAt !== "string"
  ) {
    return null;
  }

  const base = {
    id: profile.id,
    label: profile.label,
    kind: "overlay" as const,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    lastUsedAt:
      typeof profile.lastUsedAt === "string" ? profile.lastUsedAt : undefined,
    env: normalizeProfileEnv(profile.env),
    isolate: normalizeIsolateProfile(profile.isolate),
  };

  if (authKind === "provider") {
    const provider = normalizeProviderConfig(profile.provider);
    if (!provider) {
      return null;
    }

    return {
      ...base,
      authKind: "provider",
      provider,
    };
  }

  if (typeof profile.tokenRef !== "string") {
    return null;
  }

  return {
    ...base,
    authKind: profile.authKind === "oauth" ? "oauth" : undefined,
    tokenRef: profile.tokenRef,
  };
}

function normalizeProviderConfig(value: unknown): OverlayProviderConfig | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const provider = value as Partial<OverlayProviderConfig>;
  if (typeof provider.baseUrl !== "string") {
    return undefined;
  }

  return {
    baseUrl: provider.baseUrl,
    model: typeof provider.model === "string" ? provider.model : undefined,
    env: normalizeProviderEnv(provider.env),
  };
}

function normalizeProviderEnv(
  value: unknown,
): Readonly<Record<string, string>> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && isAllowedProviderEnvKey(entry[0]),
  );

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
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

function normalizeIsolateProfile(value: unknown): IsolateProfileMetadata | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const isolate = value as Partial<IsolateProfileMetadata>;
  if (
    isolate.enabled !== true ||
    typeof isolate.homeDir !== "string" ||
    (isolate.state !== "ready" &&
      isolate.state !== "stale" &&
      isolate.state !== "broken") ||
    isolate.seedPreset !== "host-lite" ||
    typeof isolate.manifestPath !== "string"
  ) {
    return undefined;
  }

  const source = normalizeIsolateSource(isolate.source);
  if (!source) {
    return undefined;
  }

  return {
    enabled: true,
    homeDir: isolate.homeDir,
    state: isolate.state,
    seedPreset: "host-lite",
    source,
    manifestPath: isolate.manifestPath,
    lastSeededAt:
      typeof isolate.lastSeededAt === "string" ? isolate.lastSeededAt : undefined,
    lastSyncedAt:
      typeof isolate.lastSyncedAt === "string" ? isolate.lastSyncedAt : undefined,
    continuity: normalizeIsolateContinuity(isolate.continuity),
  };
}

function normalizeIsolateSource(value: unknown): IsolateProfileSource | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Partial<IsolateProfileSource>;
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

function normalizeIsolateContinuity(
  value: unknown,
): IsolateSessionContinuityMetadata | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const continuity = value as Partial<IsolateSessionContinuityMetadata>;
  if (
    typeof continuity.importedSessionId !== "string" ||
    typeof continuity.projectKey !== "string" ||
    typeof continuity.importedAt !== "string"
  ) {
    return undefined;
  }

  return {
    importedSessionId: continuity.importedSessionId,
    projectKey: continuity.projectKey,
    importedAt: continuity.importedAt,
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
