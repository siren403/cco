import React from "react";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import {
  describeSubprocessEnvScrubMode,
  resolveSubprocessEnvScrubMode,
} from "../core/model/profile.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { ConfigGetInkScreen } from "../ui/ink/config-ink-screen.ts";
import { renderInkHost } from "../ui/ink/render-ink.ts";

const text = getStaticUiText();

interface ConfigGetFlags {
  readonly profile: string;
}

export const configGetCommand = buildCommand<ConfigGetFlags, [], AppContext>({
  async func(this: AppContext, flags) {
    const profileId = flags.profile;
    const profile = await resolveProfile(this.runtime.profileStore, profileId);

    if (profile.kind !== "overlay") {
      throw new DomainError(
        "HOST_CONFIG_NOT_SUPPORTED",
        "The host profile does not have editable profile config.",
        { profileId },
      );
    }

    const mode = resolveSubprocessEnvScrubMode(profile);

    await renderInkHost(
      React.createElement(ConfigGetInkScreen, {
        profileId,
        modeDescription: `${mode} (${describeSubprocessEnvScrubMode(mode)})`,
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
    flags: {
      profile: {
        kind: "parsed",
        parse: String,
        brief: text.commandBriefs.configGetFlagProfile,
        placeholder: "profile",
      },
    },
    aliases: {
      p: "profile",
    },
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: text.commandBriefs.configGet,
  },
});
