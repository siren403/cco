import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { inspectIsolateHome, removeIsolateHome } from "../core/services/isolate-home.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { promptToConfirmIsolateRemove } from "../ui/prompts/confirm-isolate-remove.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

const text = getStaticUiText();

interface IsolateFreshFlags {
  readonly yes?: boolean;
}

export const isolateFreshCommand = buildCommand<
  IsolateFreshFlags,
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

    const current = await inspectIsolateHome(this, profile);
    if ((current.homeExists || current.metadataExists) && flags.yes !== true) {
      const confirmed = await promptToConfirmIsolateRemove(profileId);
      if (!confirmed) {
        this.process.stdout.write(`${text.misc.noChangesMade}\n`);
        return;
      }
    }

    await removeIsolateHome(this, profile);

    await launchClaudeForProfile(this, {
      requestedProfileId: profileId,
      isolate: true,
    });
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
    brief: text.commandBriefs.isolateFresh,
  },
});
