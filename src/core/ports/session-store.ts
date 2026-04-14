import type { SessionBinding } from "../model/session.ts";

export interface SessionStore {
  get(projectKey: string, profileId: string): Promise<SessionBinding | null>;
  put(binding: SessionBinding): Promise<void>;
}
