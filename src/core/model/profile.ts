export type ProfileKind = "host" | "overlay";
export type SubprocessEnvScrubMode = "0" | "1";
export type IsolateProfileState = "ready" | "stale" | "broken";
export type ProfileAuthKind = "oauth" | "provider";

export interface OverlayProviderConfig {
  readonly baseUrl: string;
  readonly model?: string;
  readonly env?: Readonly<Record<string, string>>;
}

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
  readonly tokenRef?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastUsedAt?: string;
  readonly env?: OverlayProfileEnv;
  readonly isolate?: IsolateProfileMetadata;
  readonly authKind?: ProfileAuthKind;
  readonly provider?: OverlayProviderConfig;
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

export function resolveProfileAuthKind(
  profile: Pick<OverlayProfile, "authKind">,
): ProfileAuthKind {
  return profile.authKind === "provider" ? "provider" : "oauth";
}

const ALLOWED_PROVIDER_ENV_KEYS: ReadonlySet<string> = new Set([
  "ANTHROPIC_BASE_URL",
  "ANTHROPIC_MODEL",
  "ANTHROPIC_SMALL_FAST_MODEL",
]);

const ALLOWED_PROVIDER_ENV_PATTERN = /^ANTHROPIC_DEFAULT_[A-Z]+_MODEL(_NAME)?$/;

export function isAllowedProviderEnvKey(key: string): boolean {
  return (
    ALLOWED_PROVIDER_ENV_KEYS.has(key) || ALLOWED_PROVIDER_ENV_PATTERN.test(key)
  );
}
