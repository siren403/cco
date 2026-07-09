import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

const text = getStaticUiText();

interface HostFlags {
  readonly "env-compat"?: boolean;
}

export const hostCommand = buildCommand<HostFlags, [], AppContext>({
  async func(this: AppContext, flags) {
    await launchClaudeForProfile(this, {
      requestedProfileId: "host",
      envCompat: flags["env-compat"],
    });
  },
  parameters: {
    flags: {
      "env-compat": {
        kind: "boolean",
        optional: true,
        brief: text.commandBriefs.hostFlagEnvCompat,
      },
    },
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: text.commandBriefs.host,
  },
});
