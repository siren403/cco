import type { SubprocessEnvScrubMode } from "../model/profile.ts";

export function requestsBypassPermissions(
  claudeArgs: readonly string[] | undefined,
): boolean {
  if (!claudeArgs || claudeArgs.length === 0) {
    return false;
  }

  for (let index = 0; index < claudeArgs.length; index += 1) {
    const arg = claudeArgs[index]!;

    if (arg === "--permission-mode") {
      if (claudeArgs[index + 1] === "bypassPermissions") {
        return true;
      }

      continue;
    }

    if (arg === "--permission-mode=bypassPermissions") {
      return true;
    }

    if (arg === "--dangerously-skip-permissions") {
      return true;
    }
  }

  return false;
}

export function resolveShellSubprocessEnvScrubMode(
  env: NodeJS.ProcessEnv,
): SubprocessEnvScrubMode | undefined {
  const raw = env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB?.trim();
  if (raw === "0" || raw === "1") {
    return raw;
  }

  return undefined;
}
