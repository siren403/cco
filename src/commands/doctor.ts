import React from "react";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { resolveShellSubprocessEnvScrubMode } from "../core/services/permission-mode.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { findConflictingAuthEnv } from "../infra/bun/env.ts";
import { DoctorInkScreen } from "../ui/ink/doctor-ink-screen.ts";
import { renderInkHost } from "../ui/ink/render-ink.ts";

const text = getStaticUiText();

export const doctorCommand = buildCommand<{}, [], AppContext>({
  async func(this: AppContext) {
    const profiles = await this.runtime.profileStore.list();
    const conflicts = findConflictingAuthEnv(this.process.env);
    const claudeBinary = this.runtime.resolveClaudeBinary();
    const hostConfigDir =
      this.process.env.CLAUDE_CONFIG_DIR ?? text.doctor.defaultHostConfig;
    const shellSubprocessEnvScrub =
      resolveShellSubprocessEnvScrubMode(this.process.env);

    await renderInkHost(
      React.createElement(DoctorInkScreen, {
        data: {
          claudeBinary,
          ccoHome: this.runtime.paths.root,
          profiles: profiles.length,
          hostConfigDir,
          conflicts,
          launchMode: text.doctor.launchMode,
          shellSubprocessEnvScrub,
        },
        locale: this.runtime.locale,
      }),
      {
        stdin: this.process.stdin,
        stdout: this.process.stdout,
        stderr: this.process.stderr,
      },
    );
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
