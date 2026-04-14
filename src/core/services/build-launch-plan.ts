import type { BuildLaunchPlanInput, LaunchPlan } from "../model/launch.ts";
import { resolveSubprocessEnvScrubMode } from "../model/profile.ts";
import { buildClaudeEnv } from "../../infra/bun/env.ts";

export function buildLaunchPlan(input: BuildLaunchPlanInput): LaunchPlan {
  return {
    profile: input.profile,
    binary: input.binary,
    args: [...(input.explicitArgs ?? [])],
    cwd: input.cwd,
    env: buildClaudeEnv(
      input.parentEnv,
      input.token,
      input.subprocessEnvScrubOverride ??
        (input.profile.kind === "overlay"
          ? resolveSubprocessEnvScrubMode(input.profile)
          : "1"),
    ),
  };
}
