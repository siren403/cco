import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

const text = getStaticUiText();

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
