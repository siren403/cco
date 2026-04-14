import type { LaunchPlan } from "../../core/model/launch.ts";

export interface CaptureResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

function assertPlan(plan: LaunchPlan): string[] {
  return [plan.binary, ...plan.args];
}

export async function spawnClaudeInteractive(plan: LaunchPlan): Promise<number> {
  const processHandle = Bun.spawn({
    cmd: assertPlan(plan),
    cwd: plan.cwd,
    env: plan.env,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  return await processHandle.exited;
}

export async function spawnClaudeCapture(plan: LaunchPlan): Promise<CaptureResult> {
  const processHandle = Bun.spawn({
    cmd: assertPlan(plan),
    cwd: plan.cwd,
    env: plan.env,
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });

  const [exitCode, stdout, stderr] = await Promise.all([
    processHandle.exited,
    new Response(processHandle.stdout).text(),
    new Response(processHandle.stderr).text(),
  ]);

  return {
    exitCode,
    stdout,
    stderr,
  };
}
