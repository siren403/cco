import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import {
  describeSubprocessEnvScrubMode,
  resolveSubprocessEnvScrubMode,
} from "../core/model/profile.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { renderKeyValueList, renderPanel } from "../ui/layout/primitives.ts";
import { resolveAnsiColor } from "../ui/theme.ts";

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
        "The host profile does not have editable overlay config.",
        { profileId },
      );
    }

    const ansiColor = resolveAnsiColor(this.process.stdout, this.process.env);
    const mode = resolveSubprocessEnvScrubMode(profile);
    const message = renderPanel(
      {
        title: text.config.getTitle,
        tone: "accent",
        badge: { label: profileId, tone: "accent" },
        body: [
          renderKeyValueList(
            [
              {
                label: "env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB",
                value: `${mode} (${describeSubprocessEnvScrubMode(mode)})`,
              },
              {
                label: "profiles-file",
                value: this.runtime.paths.profilesFile,
              },
            ],
            { ansiColor, locale: this.runtime.locale },
          ),
        ],
      },
      { ansiColor, locale: this.runtime.locale },
    );

    this.process.stdout.write(`${message}\n`);
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
