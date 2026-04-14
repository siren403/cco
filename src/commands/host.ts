import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

const text = getStaticUiText();

export const hostCommand = buildCommand<{}, [], AppContext>({
  async func(this: AppContext) {
    await launchClaudeForProfile(this, {
      requestedProfileId: "host",
    });
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: text.commandBriefs.host,
  },
});
