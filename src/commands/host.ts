import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

interface HostFlags {
  readonly fresh?: boolean;
}

export const hostCommand = buildCommand<HostFlags, [], AppContext>({
  async func(this: AppContext, flags) {
    await launchClaudeForProfile(this, {
      requestedProfileId: "host",
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
      parameters: [],
    },
  },
  docs: {
    brief: "Launch Claude with the host Claude Code login",
  },
});
