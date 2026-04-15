import { DomainError } from "../errors/domain-error.ts";

const PROFILE_ID_PATTERN = /^[a-z0-9_-]+$/;

export const RESERVED_PROFILE_IDS = new Set([
  "auth",
  "config",
  "doctor",
  "help",
  "host",
  "isolate",
  "run",
  "showcase",
  "version",
]);

export function assertProfileIdUsable(profileId: string): void {
  if (!PROFILE_ID_PATTERN.test(profileId)) {
    throw new DomainError(
      "INVALID_PROFILE_ID",
      `Profile ids must use lowercase letters, numbers, "-", or "_". Received "${profileId}".`,
      { profileId },
    );
  }

  if (RESERVED_PROFILE_IDS.has(profileId)) {
    throw new DomainError(
      "RESERVED_PROFILE_ID",
      `Profile id "${profileId}" is reserved by cco.`,
      { profileId },
    );
  }
}
