import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

export const runCommand = buildCommand<{}, [profileId?: string], AppContext>({
  async func(this: AppContext, _flags, profileId) {
    await launchClaudeForProfile(this, {
      requestedProfileId: profileId,
    });
  },
  parameters: {
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
