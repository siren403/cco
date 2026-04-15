import { outro } from "@clack/prompts";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { removeTeamsHome } from "../core/services/teams-home.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { promptToConfirmTeamsRemove } from "../ui/prompts/confirm-teams-remove.ts";

const text = getStaticUiText();

interface TeamsRemoveFlags {
  readonly yes?: boolean;
}

export const teamsRemoveCommand = buildCommand<
  TeamsRemoveFlags,
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

    const confirmed = flags.yes === true
      ? true
      : await promptToConfirmTeamsRemove(profileId);
    if (!confirmed) {
      this.process.stdout.write(`${text.misc.noChangesMade}\n`);
      return;
    }

    const result = await removeTeamsHome(this, profile);
    if (!result.changed) {
      this.process.stdout.write(`${text.misc.teamsAlreadyMissing(profileId)}\n`);
      return;
    }

    outro(text.misc.removedTeams(profileId));
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
    brief: text.commandBriefs.teamsRemove,
  },
});
