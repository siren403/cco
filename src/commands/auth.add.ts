import React from "react";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import {
  describeSubprocessEnvScrubMode,
  type OverlayProfile,
} from "../core/model/profile.ts";
import { buildLaunchPlan } from "../core/services/build-launch-plan.ts";
import { HOST_PROFILE } from "../core/model/profile.ts";
import { assertProfileIdUsable } from "../core/services/profile-id.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { spawnClaudeCapture, spawnClaudeInteractive } from "../infra/bun/spawn-claude.ts";
import {
  AuthAddIntroInkScreen,
  AuthAddSuccessInkScreen,
} from "../ui/ink/auth-add-ink-screen.ts";
import { renderInkHost } from "../ui/ink/render-ink.ts";
import { promptForProfileEnvMode } from "../ui/prompts/profile-env-mode.ts";
import { promptForToken } from "../ui/prompts/token-entry.ts";

const text = getStaticUiText();

export const authAddCommand = buildCommand<{}, [profileId: string], AppContext>({
  async func(this: AppContext, _flags, profileId) {
    assertProfileIdUsable(profileId);
    const existingProfile = await this.runtime.profileStore.get(profileId);

    await renderInkHost(
      React.createElement(AuthAddIntroInkScreen, {
        profileId,
        locale: this.runtime.locale,
      }),
      {
        stdin: this.process.stdin,
        stdout: this.process.stdout,
        stderr: this.process.stderr,
      },
    );

    this.process.stdout.write("\n");

    const subprocessEnvScrub = await promptForProfileEnvMode(profileId, existingProfile);

    const setupPlan = buildLaunchPlan({
      profile: HOST_PROFILE,
      binary: this.runtime.resolveClaudeBinary(),
      cwd: this.process.cwd(),
      parentEnv: this.process.env,
      explicitArgs: ["setup-token"],
    });

    const setupExitCode = await spawnClaudeInteractive(setupPlan);
    if (setupExitCode !== 0) {
      throw new DomainError(
        "SETUP_TOKEN_FAILED",
        `claude setup-token exited with code ${setupExitCode}.`,
        { exitCode: setupExitCode, profileId },
      );
    }

    const token = await promptForToken(profileId);
    await verifyToken(this, profileId, token);

    const now = this.runtime.now().toISOString();
    const profile: OverlayProfile = {
      id: profileId,
      label: profileId,
      kind: "overlay",
      tokenRef: profileId,
      createdAt: existingProfile?.createdAt ?? now,
      updatedAt: now,
      lastUsedAt: existingProfile?.lastUsedAt,
      env: {
        CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: subprocessEnvScrub,
      },
    };

    await this.runtime.profileStore.put(profile);
    await this.runtime.tokenStore.put(profileId, token);

    await renderInkHost(
      React.createElement(AuthAddSuccessInkScreen, {
        profileId,
        modeLabel: describeSubprocessEnvScrubMode(subprocessEnvScrub),
        profilesFile: this.runtime.paths.profilesFile,
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
      parameters: [
        {
          brief: text.commandBriefs.authAddArgProfile,
          parse: String,
          placeholder: "profile",
        },
      ],
    },
  },
  docs: {
    brief: text.commandBriefs.authAdd,
  },
});

async function verifyToken(
  context: AppContext,
  profileId: string,
  token: string,
): Promise<void> {
  const verifyPlan = buildLaunchPlan({
    profile: {
      id: "verify",
      label: "verify",
      kind: "overlay",
      tokenRef: "verify",
      createdAt: "",
      updatedAt: "",
    },
    binary: context.runtime.resolveClaudeBinary(),
    cwd: context.process.cwd(),
    parentEnv: context.process.env,
    token,
    explicitArgs: ["-p", "reply with OK only", "--output-format", "json"],
  });

  const result = await spawnClaudeCapture(verifyPlan);
  if (result.exitCode !== 0) {
    throw new DomainError(
      "TOKEN_VERIFY_FAILED",
      `Token verification failed.\n${result.stderr.trim() || result.stdout.trim()}`,
      { profileId },
    );
  }

  JSON.parse(result.stdout);
}
