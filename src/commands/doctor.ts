import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { findConflictingAuthEnv } from "../infra/bun/env.ts";
import { renderStatusCard } from "../ui/renderers/status-card.ts";

export const doctorCommand = buildCommand<{}, [], AppContext>({
  async func(this: AppContext) {
    const profiles = await this.runtime.profileStore.list();
    const conflicts = findConflictingAuthEnv(this.process.env);
    const claudeBinary = this.runtime.resolveClaudeBinary();

    const report = renderStatusCard([
      ["claude-binary", claudeBinary],
      ["cco-home", this.runtime.paths.root],
      ["profiles", String(profiles.length)],
      [
        "env-conflicts",
        conflicts.length > 0 ? conflicts.join(", ") : "none detected",
      ],
      ["session-binding", "storage scaffolded; auto-capture deferred"],
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
