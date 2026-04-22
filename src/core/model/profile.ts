export type ProfileKind = "host" | "overlay";
export type SubprocessEnvScrubMode = "0" | "1";
export type IsolateProfileState = "ready" | "stale" | "broken";

export interface OverlayProfileEnv {
  readonly CLAUDE_CODE_SUBPROCESS_ENV_SCRUB?: SubprocessEnvScrubMode;
}

export interface IsolateProfileSource {
  readonly kind: "overlay";
  readonly profileId: string;
  readonly configDir: string;
  readonly fingerprint?: string;
}

export interface IsolateSessionContinuityMetadata {
  readonly importedSessionId: string;
  readonly projectKey: string;
  readonly importedAt: string;
}

export interface IsolateProfileMetadata {
  readonly enabled: boolean;
  readonly homeDir: string;
  readonly state: IsolateProfileState;
  readonly seedPreset: "host-lite";
  readonly source: IsolateProfileSource;
  readonly manifestPath: string;
  readonly lastSeededAt?: string;
  readonly lastSyncedAt?: string;
  readonly continuity?: IsolateSessionContinuityMetadata;
}

export interface HostProfile {
  readonly id: "host";
  readonly label: "Host";
  readonly kind: "host";
}

export interface OverlayProfile {
  readonly id: string;
  readonly label: string;
  readonly kind: "overlay";
  readonly tokenRef: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastUsedAt?: string;
  readonly env?: OverlayProfileEnv;
  readonly isolate?: IsolateProfileMetadata;
}

export type Profile = HostProfile | OverlayProfile;

export const HOST_PROFILE: HostProfile = {
  id: "host",
  label: "Host",
  kind: "host",
};

export const DEFAULT_SUBPROCESS_ENV_SCRUB: SubprocessEnvScrubMode = "1";

export function resolveSubprocessEnvScrubMode(
  profile: Pick<OverlayProfile, "env"> | undefined,
): SubprocessEnvScrubMode {
  return profile?.env?.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB === "0" ? "0" : "1";
}

export function describeSubprocessEnvScrubMode(
  mode: SubprocessEnvScrubMode,
): string {
  return mode === "0" ? "compat mode" : "safe mode";
}
