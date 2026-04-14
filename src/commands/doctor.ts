import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { findConflictingAuthEnv } from "../infra/bun/env.ts";
import { resolveAnsiColor } from "../ui/theme.ts";
import { renderDoctorPage } from "../ui/views/doctor-page.ts";

export const doctorCommand = buildCommand<{}, [], AppContext>({
  async func(this: AppContext) {
    const ansiColor = resolveAnsiColor(this.process.stdout, this.process.env);
    const profiles = await this.runtime.profileStore.list();
    const conflicts = findConflictingAuthEnv(this.process.env);
    const claudeBinary = this.runtime.resolveClaudeBinary();
    const hostConfigDir = this.process.env.CLAUDE_CONFIG_DIR ?? "(default Claude host config)";

    const report = renderDoctorPage(
      {
        claudeBinary,
        ccoHome: this.runtime.paths.root,
        profiles: profiles.length,
        hostConfigDir,
        conflicts,
        launchMode: "host config + process-local auth overlay",
      },
      { ansiColor },
    );

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
