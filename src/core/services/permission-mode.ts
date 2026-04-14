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
  }

  return false;
}
