import { DomainError } from "../errors/domain-error.ts";
import { HOST_PROFILE, type Profile } from "../model/profile.ts";
import type { ProfileStore } from "../ports/profile-store.ts";

export async function resolveProfile(
  store: ProfileStore,
  profileId: string,
): Promise<Profile> {
  if (profileId === HOST_PROFILE.id) {
    return HOST_PROFILE;
  }

  const profile = await store.get(profileId);
  if (!profile) {
    throw new DomainError(
      "PROFILE_NOT_FOUND",
      `Unknown profile "${profileId}". Run "cco auth list" to inspect saved profiles.`,
    );
  }

  return profile;
}
