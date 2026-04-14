import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import type { OverlayProfile } from "../../core/model/profile.ts";
import type { ProfileStore } from "../../core/ports/profile-store.ts";

interface ProfileFileShape {
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
        profiles: next.sort((a, b) => a.id.localeCompare(b.id)),
      });
    });
  }

  async remove(id: string): Promise<void> {
    await this.withWriteLock(async () => {
      const data = await this.readFile();
      await this.writeFile({
        profiles: data.profiles.filter((profile) => profile.id !== id),
      });
    });
  }

  private async readFile(): Promise<ProfileFileShape> {
    try {
      const content = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(content) as Partial<ProfileFileShape>;
      return {
        profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { profiles: [] };
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
