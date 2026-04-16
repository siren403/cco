import React from "react";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { listProfiles } from "../core/services/list-profiles.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { renderInkHost } from "../ui/ink/render-ink.ts";
import { ProfilesInkScreen } from "../ui/ink/profiles-ink-screen.ts";

const text = getStaticUiText();

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

    await renderInkHost(
      React.createElement(ProfilesInkScreen, {
        profiles,
        tokenPresence,
        profilesFile: this.runtime.paths.profilesFile,
        locale: this.runtime.locale,
      }),
      {
        stdin: this.process.stdin,
        stdout: this.process.stdout,
        stderr: this.process.stderr,
      },
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
