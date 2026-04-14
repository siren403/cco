import { intro, outro } from "@clack/prompts";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import type { OverlayProfile } from "../core/model/profile.ts";
import { buildLaunchPlan } from "../core/services/build-launch-plan.ts";
import { HOST_PROFILE } from "../core/model/profile.ts";
import { spawnClaudeCapture, spawnClaudeInteractive } from "../infra/bun/spawn-claude.ts";
import { promptForToken } from "../ui/prompts/token-entry.ts";

export const authAddCommand = buildCommand<{}, [profileId: string], AppContext>({
  async func(this: AppContext, _flags, profileId) {
    if (!isValidProfileId(profileId)) {
      throw new DomainError(
        "INVALID_PROFILE_ID",
        `Profile ids must use lowercase letters, numbers, "-", or "_". Received "${profileId}".`,
      );
    }

    intro(`cco auth add ${profileId}`);
    this.process.stdout.write(
      "Running official `claude setup-token` now. Copy the token from that flow, then paste it back here.\n\n",
    );

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
      );
    }

    const token = await promptForToken(profileId);
    await verifyToken(this, token);

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

    outro(`Saved overlay profile "${profileId}".`);
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

async function verifyToken(context: AppContext, token: string): Promise<void> {
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
    );
  }

  JSON.parse(result.stdout);
}

function isValidProfileId(profileId: string): boolean {
  return /^[a-z0-9_-]+$/.test(profileId);
}
