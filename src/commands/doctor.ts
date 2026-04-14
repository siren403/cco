import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { resolveShellSubprocessEnvScrubMode } from "../core/services/permission-mode.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { findConflictingAuthEnv } from "../infra/bun/env.ts";
import { resolveAnsiColor } from "../ui/theme.ts";
import { renderDoctorPage } from "../ui/views/doctor-page.ts";

const text = getStaticUiText();

export const doctorCommand = buildCommand<{}, [], AppContext>({
  async func(this: AppContext) {
    const ansiColor = resolveAnsiColor(this.process.stdout, this.process.env);
    const profiles = await this.runtime.profileStore.list();
    const conflicts = findConflictingAuthEnv(this.process.env);
    const claudeBinary = this.runtime.resolveClaudeBinary();
    const hostConfigDir =
      this.process.env.CLAUDE_CONFIG_DIR ?? text.doctor.defaultHostConfig;
    const shellSubprocessEnvScrub =
      resolveShellSubprocessEnvScrubMode(this.process.env);

    const report = renderDoctorPage(
      {
        claudeBinary,
        ccoHome: this.runtime.paths.root,
        profiles: profiles.length,
        hostConfigDir,
        conflicts,
        launchMode: text.doctor.launchMode,
        shellSubprocessEnvScrub,
      },
      { ansiColor, locale: this.runtime.locale },
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
    brief: text.commandBriefs.doctor,
  },
});
