import {
  describeSubprocessEnvScrubMode,
  resolveSubprocessEnvScrubMode,
  type Profile,
} from "../../core/model/profile.ts";
import { getUiText, type AppLocale } from "../../i18n/index.ts";

export type ProfilesPageTone = "accent" | "ok" | "warn" | "dim";

export interface ProfilesPageBadgeModel {
  readonly label: string;
  readonly tone: ProfilesPageTone;
}

export interface ProfilesPageRowModel {
  readonly profileId: string;
  readonly kindBadge: ProfilesPageBadgeModel;
  readonly tokenBadge: ProfilesPageBadgeModel;
  readonly envBadge?: ProfilesPageBadgeModel;
  readonly lastUsedPrefix?: string;
  readonly lastUsedAt?: string;
}

export interface ProfilesPageCommandModel {
  readonly command: string;
  readonly description: string;
}

export interface ProfilesPageModel {
  readonly title: string;
  readonly titleTone: ProfilesPageTone;
  readonly overlayCountBadge: ProfilesPageBadgeModel;
  readonly introLines: readonly [string, string];
  readonly inventoryTitle: string;
  readonly rows: readonly ProfilesPageRowModel[];
  readonly nextStepTitle: string;
  readonly nextStepTone: ProfilesPageTone;
  readonly nextStepBadge: ProfilesPageBadgeModel;
  readonly noOverlayMessage?: string;
  readonly noOverlayCommands?: readonly ProfilesPageCommandModel[];
  readonly nextStepBullets?: readonly string[];
}

export function buildProfilesPageModel(
  profiles: readonly Profile[],
  tokenPresence: ReadonlyMap<string, boolean>,
  profilesFile: string | undefined,
  locale: AppLocale,
): ProfilesPageModel {
  const text = getUiText(locale);
  const overlays = profiles.filter((profile) => profile.kind === "overlay");
  const storedCount = overlays.filter((profile) => tokenPresence.get(profile.id)).length;

  if (overlays.length === 0) {
    return {
      title: text.profiles.title,
      titleTone: "warn",
      overlayCountBadge: {
        label: text.profiles.overlayCount(overlays.length),
        tone: "warn",
      },
      introLines: [
        text.profiles.introLine1,
        text.profiles.introLine2,
      ],
      inventoryTitle: text.profiles.inventoryTitle,
      rows: profiles.map((profile) =>
        toProfilesPageRowModel(profile, tokenPresence, locale),
      ),
      nextStepTitle: text.profiles.nextStepTitle,
      nextStepTone: "warn",
      nextStepBadge: {
        label: text.profiles.createOverlayBadge,
        tone: "warn",
      },
      noOverlayMessage: text.profiles.noOverlay,
      noOverlayCommands: [
        {
          command: "cco auth add work",
          description: text.profiles.createOverlayDescription,
        },
        {
          command: "cco work",
          description: text.profiles.launchAfterSaveDescription,
        },
        ...(profilesFile
          ? [
              {
                command: profilesFile,
                description: text.profiles.editProfilesDescription,
              },
            ]
          : []),
      ],
    };
  }

  return {
    title: text.profiles.title,
    titleTone: "accent",
    overlayCountBadge: {
      label: text.profiles.overlayCount(overlays.length),
      tone: "accent",
    },
    introLines: [
      text.profiles.introLine1,
      text.profiles.introLine2,
    ],
    inventoryTitle: text.profiles.inventoryTitle,
    rows: profiles.map((profile) => toProfilesPageRowModel(profile, tokenPresence, locale)),
    nextStepTitle: text.profiles.nextStepTitle,
    nextStepTone: "ok",
    nextStepBadge: {
      label: text.profiles.readyBadge(storedCount),
      tone: "ok",
    },
    nextStepBullets: [
      text.profiles.nextBulletLaunch,
      text.profiles.nextBulletHost,
      text.profiles.nextBulletConfig,
      text.profiles.nextBulletRemove,
      profilesFile
        ? text.profiles.nextBulletEditProfiles(profilesFile)
        : text.profiles.nextBulletProfilesStored,
    ],
  };
}

function toProfilesPageRowModel(
  profile: Profile,
  tokenPresence: ReadonlyMap<string, boolean>,
  locale: AppLocale,
): ProfilesPageRowModel {
  const text = getUiText(locale);

  if (profile.kind === "host") {
    return {
      profileId: profile.id,
      kindBadge: {
        label: text.profiles.hostBadge,
        tone: "accent",
      },
      tokenBadge: {
        label: text.profiles.hostLoginBadge,
        tone: "accent",
      },
    };
  }

  return {
    profileId: profile.id,
    kindBadge: {
      label: text.profiles.overlayBadge,
      tone: "dim",
    },
    tokenBadge: tokenPresence.get(profile.id)
      ? {
          label: text.profiles.storedBadge,
          tone: "ok",
        }
      : {
          label: text.profiles.missingBadge,
          tone: "warn",
        },
    envBadge:
      resolveSubprocessEnvScrubMode(profile) === "0"
        ? {
            label: describeSubprocessEnvScrubMode("0"),
            tone: "warn",
          }
        : {
            label: describeSubprocessEnvScrubMode("1"),
            tone: "ok",
          },
    lastUsedPrefix: profile.lastUsedAt ? text.profiles.lastUsedPrefix : undefined,
    lastUsedAt: profile.lastUsedAt,
  };
}
