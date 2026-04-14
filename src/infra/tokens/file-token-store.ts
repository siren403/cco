import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { TokenStore } from "../../core/ports/token-store.ts";

export class FileTokenStore implements TokenStore {
  constructor(private readonly tokensDir: string) {}

  async get(profileId: string): Promise<string | null> {
    try {
      return (await readFile(this.resolvePath(profileId), "utf8")).trim() || null;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }

      throw error;
    }
  }

  async put(profileId: string, token: string): Promise<void> {
    await writeFile(this.resolvePath(profileId), `${token.trim()}\n`, "utf8");
  }

  async remove(profileId: string): Promise<void> {
    await rm(this.resolvePath(profileId), { force: true });
  }

  private resolvePath(profileId: string): string {
    return join(this.tokensDir, `${profileId}.token`);
  }
}
