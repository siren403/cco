import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

interface RunFlags {
  readonly fresh?: boolean;
}

export const runCommand = buildCommand<RunFlags, [profileId?: string], AppContext>({
  async func(this: AppContext, flags, profileId) {
    await launchClaudeForProfile(this, {
      requestedProfileId: profileId,
      fresh: flags.fresh,
    });
  },
  parameters: {
    flags: {
      fresh: {
        kind: "boolean",
        brief: "Start Claude without using a saved session binding",
        optional: true,
      },
    },
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Overlay profile id to use, or omit for profile picker",
          parse: String,
          optional: true,
          placeholder: "profile",
        },
      ],
    },
  },
  docs: {
    brief: "Launch Claude with the host login or a selected overlay profile",
  },
});
