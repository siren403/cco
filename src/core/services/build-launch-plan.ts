import type { BuildLaunchPlanInput, LaunchPlan } from "../model/launch.ts";
import { buildClaudeEnv, hasExplicitResumeArgument } from "../../infra/bun/env.ts";

export function buildLaunchPlan(input: BuildLaunchPlanInput): LaunchPlan {
  const explicitArgs = [...(input.explicitArgs ?? [])];
  const shouldInjectResume =
    !input.fresh &&
    !!input.resumeSessionId &&
    !hasExplicitResumeArgument(explicitArgs);

  const args = shouldInjectResume
    ? ["--resume", input.resumeSessionId!, ...explicitArgs]
    : explicitArgs;

  return {
    profile: input.profile,
    binary: input.binary,
    args,
    cwd: input.cwd,
    env: buildClaudeEnv(input.parentEnv, input.token),
    resumeSessionId: shouldInjectResume ? input.resumeSessionId : undefined,
  };
}
