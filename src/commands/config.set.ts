import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { describeSubprocessEnvScrubMode } from "../core/model/profile.ts";
import {
  applyProfileConfigAssignment,
  parseProfileConfigAssignment,
} from "../core/services/profile-config.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { renderPanel } from "../ui/layout/primitives.ts";
import { resolveAnsiColor } from "../ui/theme.ts";

const text = getStaticUiText();

interface ConfigSetFlags {
  readonly profile: string;
}

export const configSetCommand = buildCommand<ConfigSetFlags, [assignment: string], AppContext>({
  async func(this: AppContext, flags, assignmentText) {
    const profileId = flags.profile;
    const profile = await resolveProfile(this.runtime.profileStore, profileId);

    if (profile.kind !== "overlay") {
      throw new DomainError(
        "HOST_CONFIG_NOT_SUPPORTED",
        "The host profile does not have editable overlay config.",
        { profileId },
      );
    }

    const assignment = parseProfileConfigAssignment(assignmentText);
    const nextProfile = applyProfileConfigAssignment(profile, assignment);
    const now = this.runtime.now().toISOString();

    await this.runtime.profileStore.put({
      ...nextProfile,
      updatedAt: now,
    });

    const ansiColor = resolveAnsiColor(this.process.stdout, this.process.env);
    const message = renderPanel(
      {
        title: text.config.setSuccessTitle,
        tone: "ok",
        badge: { label: profileId, tone: "ok" },
        body: [
          `${assignment.key} = ${assignment.value}`,
          "",
          text.config.setSuccessSummary(
            describeSubprocessEnvScrubMode(assignment.value),
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
        brief: text.commandBriefs.configSetFlagProfile,
        optional: false,
        placeholder: "profile",
      },
    },
    aliases: {
      p: "profile",
    },
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: text.commandBriefs.configSetArgAssignment,
          parse: String,
          placeholder: "key=value",
        },
      ],
    },
  },
  docs: {
    brief: text.commandBriefs.configSet,
  },
});
