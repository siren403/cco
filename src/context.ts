import type { CommandContext } from "@stricli/core";
import { createRuntime, type AppRuntime } from "./runtime.ts";

export interface AppContext extends CommandContext {
  readonly process: typeof process;
  readonly runtime: AppRuntime;
}

export function buildContext(proc: typeof process): AppContext {
  return {
    process: proc,
    runtime: createRuntime(proc),
  };
}
