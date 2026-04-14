export type ProfileKind = "host" | "overlay";
export type SubprocessEnvScrubMode = "0" | "1";

export interface OverlayProfileEnv {
  readonly CLAUDE_CODE_SUBPROCESS_ENV_SCRUB?: SubprocessEnvScrubMode;
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
