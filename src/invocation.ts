export interface DirectLaunchInvocation {
  readonly mode: "direct-launch";
  readonly profileId: string;
  readonly claudeArgs: readonly string[];
}

export interface StricliInvocation {
  readonly mode: "stricli";
}

export type Invocation = DirectLaunchInvocation | StricliInvocation;

const STRICT_CLI_COMMANDS = new Set([
  "auth",
  "doctor",
  "run",
  "--help",
  "-h",
  "--version",
  "-v",
]);

export function resolveInvocation(argv: readonly string[]): Invocation {
  const [first, ...rest] = argv;

  if (!first) {
    return { mode: "stricli" };
  }

  if (STRICT_CLI_COMMANDS.has(first)) {
    return { mode: "stricli" };
  }

  if (first === "host") {
    if (rest[0] === "--help" || rest[0] === "-h") {
      return { mode: "stricli" };
    }

    return {
      mode: "direct-launch",
      profileId: "host",
      claudeArgs: rest,
    };
  }

  if (first.startsWith("-")) {
    return { mode: "stricli" };
  }

  return {
    mode: "direct-launch",
    profileId: first,
    claudeArgs: rest,
  };
}
