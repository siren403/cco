import type { IsolateBootstrapMode } from "../core/services/isolate-bootstrap.ts";
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
  readonly clean?: boolean;
  readonly "import-latest-host-session"?: boolean;
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
        "Isolate mode currently supports saved profiles only.",
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
      isolateBootstrap: {
        seedMode: resolveSeedMode(flags.clean),
        importLatestHostSession: flags["import-latest-host-session"] === true,
      },
    });
  },
  parameters: {
    flags: {
      yes: {
        kind: "boolean",
        optional: true,
        brief: text.commandBriefs.isolateFlagYes,
      },
      clean: {
        kind: "boolean",
        optional: true,
        brief: text.commandBriefs.isolateFlagClean,
      },
      "import-latest-host-session": {
        kind: "boolean",
        optional: true,
        brief: text.commandBriefs.isolateFlagImportLatestHostSession,
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

function resolveSeedMode(clean: boolean | undefined): IsolateBootstrapMode | undefined {
  return clean === true ? "clean" : undefined;
}
