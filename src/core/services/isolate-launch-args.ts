export function resolveIsolateLaunchArgs(
  explicitArgs: readonly string[] | undefined,
  importedSessionId: string | undefined,
): readonly string[] | undefined {
  if (!importedSessionId || hasNativeContinuationArgs(explicitArgs)) {
    return explicitArgs;
  }

  return ["--resume", importedSessionId, ...(explicitArgs ?? [])];
}

function hasNativeContinuationArgs(args: readonly string[] | undefined): boolean {
  return (args ?? []).some((arg) =>
    arg === "-c" ||
    arg === "--continue" ||
    arg === "--resume" ||
    arg.startsWith("--resume=")
  );
}
