import { RESERVED_PROFILE_IDS } from "./core/services/profile-id.ts";

export interface DirectLaunchInvocation {
  readonly mode: "direct-launch";
  readonly profileId: string;
  readonly claudeArgs: readonly string[];
}

export interface StricliInvocation {
  readonly mode: "stricli";
}

export type Invocation = DirectLaunchInvocation | StricliInvocation;

const ROOT_HELP_FLAGS = new Set(["--help", "-h", "help"]);
const ROOT_VERSION_FLAGS = new Set(["--version", "-v", "version"]);
const STRICT_CLI_COMMANDS = new Set([
  "auth",
  "config",
  "doctor",
  "run",
  "showcase",
  ...ROOT_HELP_FLAGS,
  ...ROOT_VERSION_FLAGS,
]);

export function isRootHelpRequest(argv: readonly string[]): boolean {
  return argv.length === 1 && ROOT_HELP_FLAGS.has(argv[0]!);
}

export function isRootVersionRequest(argv: readonly string[]): boolean {
  return argv.length === 1 && ROOT_VERSION_FLAGS.has(argv[0]!);
}

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

  if (RESERVED_PROFILE_IDS.has(first)) {
    return { mode: "stricli" };
  }

  return {
    mode: "direct-launch",
    profileId: first,
    claudeArgs: rest,
  };
}
