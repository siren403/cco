import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { listProfiles } from "../core/services/list-profiles.ts";
import { renderProfileTable } from "../ui/renderers/profile-table.ts";

export const authListCommand = buildCommand<{}, [], AppContext>({
  async func(this: AppContext) {
    const profiles = await listProfiles(this.runtime.profileStore);
    const tokenPresence = new Map<string, boolean>();

    await Promise.all(
      profiles.map(async (profile) => {
        if (profile.kind === "host") {
          return;
        }

        tokenPresence.set(profile.id, !!(await this.runtime.tokenStore.get(profile.id)));
      }),
    );

    this.process.stdout.write(`${renderProfileTable(profiles, tokenPresence)}\n`);
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: "List local overlay profiles and token presence",
  },
});
