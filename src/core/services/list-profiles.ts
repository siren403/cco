import { HOST_PROFILE, type Profile } from "../model/profile.ts";
import type { ProfileStore } from "../ports/profile-store.ts";

export async function listProfiles(store: ProfileStore): Promise<readonly Profile[]> {
  const overlays = await store.list();
  return [HOST_PROFILE, ...overlays];
}
