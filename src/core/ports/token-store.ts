export interface TokenStore {
  get(profileId: string): Promise<string | null>;
  put(profileId: string, token: string): Promise<void>;
  remove(profileId: string): Promise<void>;
}
