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

    const overlays = profiles.filter((profile) => profile.kind === "overlay");
    const lines = [renderProfileTable(profiles, tokenPresence)];

    if (overlays.length === 0) {
      lines.push(
        "",
        "No overlay profiles saved yet.",
        "",
        "Create one with:",
        "  cco auth add work",
      );
    }

    this.process.stdout.write(`${lines.join("\n")}\n`);
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
