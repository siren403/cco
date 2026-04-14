import type { OverlayProfile } from "../model/profile.ts";

export interface ProfileStore {
  list(): Promise<readonly OverlayProfile[]>;
  get(id: string): Promise<OverlayProfile | null>;
  put(profile: OverlayProfile): Promise<void>;
  remove(id: string): Promise<void>;
}
