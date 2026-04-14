import { readFile, writeFile } from "node:fs/promises";
import type { SessionBinding } from "../../core/model/session.ts";
import type { SessionStore } from "../../core/ports/session-store.ts";

interface SessionFileShape {
  readonly bindings: readonly SessionBinding[];
}

export class JsonSessionStore implements SessionStore {
  constructor(private readonly filePath: string) {}

  async get(projectKey: string, profileId: string): Promise<SessionBinding | null> {
    const data = await this.readFile();
    return (
      data.bindings.find(
        (binding) =>
          binding.projectKey === projectKey && binding.profileId === profileId,
      ) ?? null
    );
  }

  async put(binding: SessionBinding): Promise<void> {
    const data = await this.readFile();
    const next = data.bindings.filter(
      (item) =>
        !(
          item.projectKey === binding.projectKey &&
          item.profileId === binding.profileId
        ),
    );
    next.push(binding);
    await this.writeFile({ bindings: next });
  }

  private async readFile(): Promise<SessionFileShape> {
    try {
      const content = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(content) as Partial<SessionFileShape>;
      return {
        bindings: Array.isArray(parsed.bindings) ? parsed.bindings : [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { bindings: [] };
      }

      throw error;
    }
  }

  private async writeFile(data: SessionFileShape): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }
}
