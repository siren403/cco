import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

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
    brief: "Launch Claude with the host Claude Code login",
  },
});
