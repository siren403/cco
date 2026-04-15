import { outro } from "@clack/prompts";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { removeIsolateHome } from "../core/services/isolate-home.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { promptToConfirmIsolateRemove } from "../ui/prompts/confirm-isolate-remove.ts";

const text = getStaticUiText();

interface IsolateRemoveFlags {
  readonly yes?: boolean;
}

export const isolateRemoveCommand = buildCommand<
  IsolateRemoveFlags,
  [profileId: string],
  AppContext
>({
  async func(this: AppContext, flags, profileId) {
    const profile = await resolveProfile(this.runtime.profileStore, profileId);
    if (profile.kind !== "overlay") {
      throw new DomainError(
        "ISOLATE_OVERLAY_ONLY",
        "Isolate mode currently supports saved overlay profiles only.",
        { profileId },
      );
    }

    const confirmed = flags.yes === true
      ? true
      : await promptToConfirmIsolateRemove(profileId);
    if (!confirmed) {
      this.process.stdout.write(`${text.misc.noChangesMade}\n`);
      return;
    }

    const result = await removeIsolateHome(this, profile);
    if (!result.changed) {
      this.process.stdout.write(`${text.misc.isolateAlreadyMissing(profileId)}\n`);
      return;
    }

    outro(text.misc.removedIsolate(profileId));
  },
  parameters: {
    flags: {
      yes: {
        kind: "boolean",
        optional: true,
        brief: text.commandBriefs.isolateFlagYes,
      },
    },
    aliases: {
      y: "yes",
    },
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: text.commandBriefs.isolateArgProfile,
          parse: String,
          placeholder: "profile",
        },
      ],
    },
  },
  docs: {
    brief: text.commandBriefs.isolateRemove,
  },
});
