import type { Profile } from "./profile.ts";

export interface LaunchPlan {
  readonly profile: Profile;
  readonly binary: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: Record<string, string>;
}

export interface BuildLaunchPlanInput {
  readonly profile: Profile;
  readonly binary: string;
  readonly cwd: string;
  readonly parentEnv: NodeJS.ProcessEnv;
  readonly token?: string;
  readonly explicitArgs?: readonly string[];
  readonly subprocessEnvScrubOverride?: "0" | "1";
}
