import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { inspectTeamsHome, removeTeamsHome } from "../core/services/teams-home.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { promptToConfirmTeamsRemove } from "../ui/prompts/confirm-teams-remove.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

const text = getStaticUiText();

interface TeamsFreshFlags {
  readonly yes?: boolean;
}

export const teamsFreshCommand = buildCommand<
  TeamsFreshFlags,
  [profileId: string],
  AppContext
>({
  async func(this: AppContext, flags, profileId) {
    const profile = await resolveProfile(this.runtime.profileStore, profileId);
    if (profile.kind !== "overlay") {
      throw new DomainError(
        "TEAMS_OVERLAY_ONLY",
        "Isolate mode currently supports saved overlay profiles only.",
        { profileId },
      );
    }

    const current = await inspectTeamsHome(this, profile);
    if ((current.homeExists || current.metadataExists) && flags.yes !== true) {
      const confirmed = await promptToConfirmTeamsRemove(profileId);
      if (!confirmed) {
        this.process.stdout.write(`${text.misc.noChangesMade}\n`);
        return;
      }
    }

    await removeTeamsHome(this, profile);

    await launchClaudeForProfile(this, {
      requestedProfileId: profileId,
      teams: true,
    });
  },
  parameters: {
    flags: {
      yes: {
        kind: "boolean",
        optional: true,
        brief: text.commandBriefs.teamsFlagYes,
      },
    },
    aliases: {
      y: "yes",
    },
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: text.commandBriefs.teamsArgProfile,
          parse: String,
          placeholder: "profile",
        },
      ],
    },
  },
  docs: {
    brief: text.commandBriefs.teamsFresh,
  },
});
