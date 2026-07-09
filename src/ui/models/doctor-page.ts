import { getUiText, type AppLocale } from "../../i18n/index.ts";

export type DoctorPageTone = "accent" | "ok" | "warn" | "dim";

export interface DoctorPageData {
  readonly claudeBinary: string;
  readonly ccoHome: string;
  readonly profiles: number;
  readonly providerProfiles: number;
  readonly hostConfigDir: string;
  readonly conflicts: readonly string[];
  readonly launchMode: string;
  readonly shellSubprocessEnvScrub?: "0" | "1";
}

export interface DoctorPageEntry {
  readonly label: string;
  readonly value: string;
  readonly tone?: DoctorPageTone;
}

export interface DoctorPageModel {
  readonly title: string;
  readonly titleTone: DoctorPageTone;
  readonly badge: string;
  readonly introLines: readonly [string, string];
  readonly snapshotTitle: string;
  readonly snapshotEntries: readonly DoctorPageEntry[];
  readonly nextStepTitle: string;
  readonly nextStepTone: DoctorPageTone;
  readonly nextStepCommands?: ReadonlyArray<{
    readonly command: string;
    readonly description: string;
  }>;
  readonly cleanupBullets?: readonly string[];
}

export function buildDoctorPageModel(
  data: DoctorPageData,
  locale: AppLocale,
): DoctorPageModel {
  const text = getUiText(locale);
  const ready = data.conflicts.length === 0;

  return {
    title: text.doctor.title,
    titleTone: ready ? "ok" : "warn",
    badge: ready ? text.doctor.readyBadge : text.doctor.checkEnvBadge,
    introLines: ready
      ? [text.doctor.readyLine1, text.doctor.readyLine2]
      : [text.doctor.conflictLine1, text.doctor.conflictLine2],
    snapshotTitle: text.doctor.snapshotTitle,
    snapshotEntries: [
      { label: "claude-binary", value: data.claudeBinary },
      { label: "cco-home", value: data.ccoHome },
      { label: "profiles", value: String(data.profiles) },
      {
        label: text.doctor.providerProfilesLabel,
        value: text.doctor.providerProfilesSummary(data.providerProfiles),
      },
      { label: "host-config-dir", value: data.hostConfigDir },
      {
        label: text.doctor.shellScrubLabel,
        value:
          data.shellSubprocessEnvScrub === "0"
            ? text.doctor.shellScrubCompat
            : data.shellSubprocessEnvScrub === "1"
              ? text.doctor.shellScrubSafe
              : text.doctor.shellScrubInherit,
      },
      {
        label: "env-conflicts",
        value:
          data.conflicts.length > 0
            ? data.conflicts.join(", ")
            : text.doctor.noneDetected,
        tone: data.conflicts.length > 0 ? "warn" : "ok",
      },
      { label: "launch-mode", value: data.launchMode },
    ],
    nextStepTitle: ready
      ? text.doctor.suggestedNextStepTitle
      : text.doctor.suggestedCleanupTitle,
    nextStepTone: ready ? "ok" : "warn",
    nextStepCommands: ready
      ? [
          {
            command: "cco work",
            description: text.doctor.launchDescription,
          },
          {
            command: "cco host -c",
            description: text.doctor.hostContinueDescription,
          },
        ]
      : undefined,
    cleanupBullets: ready
      ? undefined
      : [
          text.doctor.cleanup1,
          text.doctor.cleanup2,
          text.doctor.cleanup3,
          ...(data.providerProfiles > 0 ? [text.doctor.providerAuthEnvConflictNote] : []),
        ],
  };
}
