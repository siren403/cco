import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { findConflictingAuthEnv } from "../infra/bun/env.ts";
import { renderStatusCard } from "../ui/renderers/status-card.ts";

export const doctorCommand = buildCommand<{}, [], AppContext>({
  async func(this: AppContext) {
    const profiles = await this.runtime.profileStore.list();
    const conflicts = findConflictingAuthEnv(this.process.env);
    const claudeBinary = this.runtime.resolveClaudeBinary();
    const hostConfigDir = this.process.env.CLAUDE_CONFIG_DIR ?? "(default Claude host config)";

    const report = renderStatusCard([
      ["claude-binary", claudeBinary],
      ["cco-home", this.runtime.paths.root],
      ["profiles", String(profiles.length)],
      ["host-config-dir", hostConfigDir],
      [
        "env-conflicts",
        conflicts.length > 0 ? conflicts.join(", ") : "none detected",
      ],
      ["launch-mode", "host config + process-local auth overlay"],
    ]);

    this.process.stdout.write(`${report}\n`);
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: "Check local storage, env precedence, and Claude binary resolution",
  },
});
