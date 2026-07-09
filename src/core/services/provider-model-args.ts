export function resolveProviderModelArgs(
  explicitArgs: readonly string[],
  model?: string,
): readonly string[] {
  if (!model || hasModelArg(explicitArgs)) {
    return explicitArgs;
  }

  return ["--model", model, ...explicitArgs];
}

function hasModelArg(args: readonly string[]): boolean {
  return args.some((arg) => arg === "--model" || arg.startsWith("--model="));
}
