import {
  describeSubprocessEnvScrubMode,
  resolveSubprocessEnvScrubMode,
  type Profile,
} from "../../core/model/profile.ts";
import { getUiText } from "../../i18n/index.ts";
import {
  joinBlocks,
  renderBadge,
  renderBulletList,
  renderCommandList,
  renderPanel,
  type BadgeDefinition,
} from "../layout/primitives.ts";
import { createTheme, type RenderOptions } from "../theme.ts";

export function renderProfilesPage(
  profiles: readonly Profile[],
  tokenPresence: ReadonlyMap<string, boolean>,
  profilesFile: string | undefined,
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);
  const overlays = profiles.filter((profile) => profile.kind === "overlay");
  const storedCount = overlays.filter((profile) => tokenPresence.get(profile.id)).length;

  return joinBlocks([
    renderPanel(
      {
        title: text.profiles.title,
        tone: overlays.length === 0 ? "warn" : "accent",
        badge: {
          label: text.profiles.overlayCount(overlays.length),
          tone: overlays.length === 0 ? "warn" : "accent",
        },
        body: [
          text.profiles.introLine1,
          text.profiles.introLine2,
        ],
      },
      options,
    ),
    renderPanel(
      {
        title: text.profiles.inventoryTitle,
        tone: "dim",
        body: profiles.map((profile) =>
          renderProfileRow(profile, tokenPresence, options),
        ),
      },
      options,
    ),
    overlays.length === 0
      ? renderPanel(
          {
            title: text.profiles.nextStepTitle,
            tone: "warn",
            badge: { label: text.profiles.createOverlayBadge, tone: "warn" },
            body: [
              text.profiles.noOverlay,
              "",
              renderCommandList(
                [
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
                options,
              ),
            ],
          },
          options,
        )
      : renderPanel(
          {
            title: text.profiles.nextStepTitle,
            tone: "ok",
            badge: { label: text.profiles.readyBadge(storedCount), tone: "ok" },
            body: [
              renderBulletList(
                [
                  text.profiles.nextBulletLaunch,
                  text.profiles.nextBulletHost,
                  text.profiles.nextBulletRemove,
                  profilesFile
                    ? text.profiles.nextBulletEditProfiles(profilesFile)
                    : text.profiles.nextBulletProfilesStored,
                ],
                options,
              ),
            ],
          },
          options,
        ),
  ]);
}

function renderProfileRow(
  profile: Profile,
  tokenPresence: ReadonlyMap<string, boolean>,
  options: RenderOptions,
): string {
  const theme = createTheme(options);
  const text = getUiText(options.locale);
  const kindBadge: BadgeDefinition =
    profile.kind === "host"
      ? { label: text.profiles.hostBadge, tone: "accent" }
      : { label: text.profiles.overlayBadge, tone: "dim" };
  const tokenBadge: BadgeDefinition =
    profile.kind === "host"
      ? { label: text.profiles.hostLoginBadge, tone: "accent" }
      : tokenPresence.get(profile.id)
        ? { label: text.profiles.storedBadge, tone: "ok" }
        : { label: text.profiles.missingBadge, tone: "warn" };
  const envBadge: BadgeDefinition | null =
    profile.kind === "host"
      ? null
      : resolveSubprocessEnvScrubMode(profile) === "0"
        ? { label: describeSubprocessEnvScrubMode("0"), tone: "warn" }
        : { label: describeSubprocessEnvScrubMode("1"), tone: "ok" };
  const suffix =
    profile.kind === "overlay" && profile.lastUsedAt
      ? ` ${text.profiles.lastUsedPrefix} ${theme.dim(profile.lastUsedAt)}`
      : "";

  return [
    `${theme.code(profile.id)} ${renderBadge(kindBadge, options)} ${renderBadge(tokenBadge, options)}${envBadge ? ` ${renderBadge(envBadge, options)}` : ""}${suffix}`,
  ].join("");
}
