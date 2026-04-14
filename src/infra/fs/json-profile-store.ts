import { readFile, writeFile } from "node:fs/promises";
import type { OverlayProfile } from "../../core/model/profile.ts";
import type { ProfileStore } from "../../core/ports/profile-store.ts";

interface ProfileFileShape {
  readonly profiles: readonly OverlayProfile[];
}

export class JsonProfileStore implements ProfileStore {
  constructor(private readonly filePath: string) {}

  async list(): Promise<readonly OverlayProfile[]> {
    return (await this.readFile()).profiles;
  }

  async get(id: string): Promise<OverlayProfile | null> {
    const profiles = await this.list();
    return profiles.find((profile) => profile.id === id) ?? null;
  }

  async put(profile: OverlayProfile): Promise<void> {
    const data = await this.readFile();
    const next = data.profiles.filter((item) => item.id !== profile.id);
    next.push(profile);
    await this.writeFile({ profiles: next.sort((a, b) => a.id.localeCompare(b.id)) });
  }

  async remove(id: string): Promise<void> {
    const data = await this.readFile();
    await this.writeFile({
      profiles: data.profiles.filter((profile) => profile.id !== id),
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
    await writeFile(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }
}
