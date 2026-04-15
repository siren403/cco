import { DomainError } from "./core/errors/domain-error.ts";
import { RESERVED_PROFILE_IDS } from "./core/services/profile-id.ts";

export interface DirectLaunchInvocation {
  readonly mode: "direct-launch";
  readonly profileId: string;
  readonly claudeArgs: readonly string[];
  readonly isolate: boolean;
}

export interface StricliInvocation {
  readonly mode: "stricli";
}

export type Invocation = DirectLaunchInvocation | StricliInvocation;

const ROOT_HELP_FLAGS = new Set(["--help", "-h", "help"]);
const ROOT_VERSION_FLAGS = new Set(["--version", "-v", "version"]);
const LAUNCH_FLAGS = new Set(["--isolate"]);
const STRICT_CLI_COMMANDS = new Set([
  "auth",
  "config",
  "doctor",
  "isolate",
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
  const [first] = argv;

  if (!first) {
    return { mode: "stricli" };
  }

  if (STRICT_CLI_COMMANDS.has(first)) {
    return { mode: "stricli" };
  }

  const launchParse = parseLaunchInvocation(argv);
  if (launchParse == null) {
    return { mode: "stricli" };
  }

  if (launchParse.profileId === "host") {
    if (
      launchParse.claudeArgs[0] === "--help" ||
      launchParse.claudeArgs[0] === "-h"
    ) {
      return { mode: "stricli" };
    }
  }

  return {
    mode: "direct-launch",
    profileId: launchParse.profileId,
    claudeArgs: launchParse.claudeArgs,
    isolate: launchParse.isolate,
  };
}

interface ParsedLaunchInvocation {
  readonly profileId: string;
  readonly claudeArgs: readonly string[];
  readonly isolate: boolean;
}

function parseLaunchInvocation(
  argv: readonly string[],
): ParsedLaunchInvocation | null {
  let isolate = false;
  let index = 0;

  while (index < argv.length) {
    const token = argv[index]!;

    if (token === "--") {
      return null;
    }

    if (LAUNCH_FLAGS.has(token)) {
      isolate = true;
      index += 1;
      continue;
    }

    if (token.startsWith("-")) {
      return null;
    }

    if (RESERVED_PROFILE_IDS.has(token) && token !== "host") {
      return null;
    }

    return {
      profileId: token,
      claudeArgs: parseClaudeArgs(argv.slice(index + 1), token),
      isolate,
    };
  }

  return null;
}

function parseClaudeArgs(
  argv: readonly string[],
  profileId: string,
): readonly string[] {
  if (argv[0] === "--") {
    return argv.slice(1);
  }

  for (const token of argv) {
    if (LAUNCH_FLAGS.has(token)) {
      throw new DomainError(
        "MISPLACED_LAUNCH_FLAG",
        `"${token}" is a cco launch option and must appear before <profile>. Try: cco ${token} ${profileId}`,
        {
          flag: token,
          profileId,
        },
      );
    }
  }

  return argv;
}
