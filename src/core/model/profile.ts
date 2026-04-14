export type ProfileKind = "host" | "overlay";

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
}

export type Profile = HostProfile | OverlayProfile;

export const HOST_PROFILE: HostProfile = {
  id: "host",
  label: "Host",
  kind: "host",
};
