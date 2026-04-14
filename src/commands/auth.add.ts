import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import type { OverlayProfile } from "../core/model/profile.ts";
import { buildLaunchPlan } from "../core/services/build-launch-plan.ts";
import { HOST_PROFILE } from "../core/model/profile.ts";
import { assertProfileIdUsable } from "../core/services/profile-id.ts";
import { spawnClaudeCapture, spawnClaudeInteractive } from "../infra/bun/spawn-claude.ts";
import { promptForToken } from "../ui/prompts/token-entry.ts";
import { resolveAnsiColor } from "../ui/theme.ts";
import {
  renderAuthAddIntro,
  renderAuthAddSuccess,
} from "../ui/views/auth-add-page.ts";

export const authAddCommand = buildCommand<{}, [profileId: string], AppContext>({
  async func(this: AppContext, _flags, profileId) {
    assertProfileIdUsable(profileId);
    const ansiColor = resolveAnsiColor(this.process.stdout, this.process.env);

    this.process.stdout.write(`${renderAuthAddIntro(profileId, { ansiColor })}\n\n`);

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
      createdAt: now,
      updatedAt: now,
    };

    await this.runtime.profileStore.put(profile);
    await this.runtime.tokenStore.put(profileId, token);

    this.process.stdout.write(`${renderAuthAddSuccess(profileId, { ansiColor })}\n`);
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Profile id to save, such as work or backup",
          parse: String,
          placeholder: "profile",
        },
      ],
    },
  },
  docs: {
    brief: "Create or replace an overlay profile using the official setup-token flow",
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
