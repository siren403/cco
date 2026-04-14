import type { Profile } from "../../core/model/profile.ts";

export function renderProfileTable(
  profiles: readonly Profile[],
  tokenPresence: ReadonlyMap<string, boolean>,
): string {
  const rows = profiles.map((profile) => {
    const tokenState =
      profile.kind === "host"
        ? "host login"
        : tokenPresence.get(profile.id)
          ? "stored"
          : "missing";
    const lastUsed = profile.kind === "overlay" ? profile.lastUsedAt ?? "-" : "-";

    return `${profile.id.padEnd(12)} ${profile.kind.padEnd(8)} ${tokenState.padEnd(10)} ${lastUsed}`;
  });

  return [
    "profile      kind     token      last-used",
    "-----------  -------  ---------  -------------------------",
    ...rows,
  ].join("\n");
}
