import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

const text = getStaticUiText();

interface RunFlags {
  readonly "env-compat"?: boolean;
}

export const runCommand = buildCommand<RunFlags, [profileId?: string], AppContext>({
  async func(this: AppContext, flags, profileId) {
    await launchClaudeForProfile(this, {
      requestedProfileId: profileId,
      envCompat: flags["env-compat"],
    });
  },
  parameters: {
    flags: {
      "env-compat": {
        kind: "boolean",
        optional: true,
        brief: text.commandBriefs.runFlagEnvCompat,
      },
    },
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: text.commandBriefs.runArgProfile,
          parse: String,
          optional: true,
          placeholder: "profile",
        },
      ],
    },
  },
  docs: {
    brief: text.commandBriefs.run,
  },
});
