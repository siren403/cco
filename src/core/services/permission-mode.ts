export type BypassPermissionsPolicy = "ask" | "compat" | "safe";

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

export function resolveBypassPermissionsPolicy(
  env: NodeJS.ProcessEnv,
): BypassPermissionsPolicy {
  const raw = env.CCO_BYPASS_PERMISSIONS_POLICY?.trim().toLowerCase();

  switch (raw) {
    case undefined:
    case "":
    case "ask":
      return "ask";
    case "compat":
      return "compat";
    case "safe":
      return "safe";
    default:
      return "ask";
  }
}
