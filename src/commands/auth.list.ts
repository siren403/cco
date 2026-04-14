import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { listProfiles } from "../core/services/list-profiles.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { renderProfilesPage } from "../ui/views/profiles-page.ts";
import { resolveAnsiColor } from "../ui/theme.ts";

const text = getStaticUiText();

export const authListCommand = buildCommand<{}, [], AppContext>({
  async func(this: AppContext) {
    const ansiColor = resolveAnsiColor(this.process.stdout, this.process.env);
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

    this.process.stdout.write(
      `${renderProfilesPage(
        profiles,
        tokenPresence,
        this.runtime.paths.profilesFile,
        { ansiColor, locale: this.runtime.locale },
      )}\n`,
    );
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: text.commandBriefs.authList,
  },
});
