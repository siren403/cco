import { DomainError } from "../errors/domain-error.ts";
import type {
  OverlayProfile,
  OverlayProfileEnv,
  SubprocessEnvScrubMode,
} from "../model/profile.ts";

export interface ProfileConfigAssignment {
  readonly key: "env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB";
  readonly value: SubprocessEnvScrubMode;
}

export function parseProfileConfigAssignment(
  raw: string,
): ProfileConfigAssignment {
  const separatorIndex = raw.indexOf("=");
  if (separatorIndex <= 0 || separatorIndex === raw.length - 1) {
    throw new DomainError(
      "INVALID_CONFIG_ASSIGNMENT",
      `Invalid config assignment "${raw}". Use key=value format.`,
    );
  }

  const key = raw.slice(0, separatorIndex).trim();
  const value = raw.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");

  if (key !== "env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB") {
    throw new DomainError(
      "UNKNOWN_CONFIG_KEY",
      `Unknown config key "${key}".`,
    );
  }

  if (value !== "0" && value !== "1") {
    throw new DomainError(
      "INVALID_CONFIG_VALUE",
      `Invalid value "${value}" for ${key}. Use "0" or "1".`,
    );
  }

  return {
    key,
    value,
  };
}

export function applyProfileConfigAssignment(
  profile: OverlayProfile,
  assignment: ProfileConfigAssignment,
): OverlayProfile {
  return {
    ...profile,
    env: {
      ...(profile.env ?? {}),
      CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: assignment.value,
    } satisfies OverlayProfileEnv,
  };
}
