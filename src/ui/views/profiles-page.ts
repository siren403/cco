import type { Profile } from "../../core/model/profile.ts";
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
  options: RenderOptions = {},
): string {
  const overlays = profiles.filter((profile) => profile.kind === "overlay");
  const storedCount = overlays.filter((profile) => tokenPresence.get(profile.id)).length;

  return joinBlocks([
    renderPanel(
      {
        title: "Profiles",
        tone: overlays.length === 0 ? "warn" : "accent",
        badge: {
          label: `${overlays.length} overlay`,
          tone: overlays.length === 0 ? "warn" : "accent",
        },
        body: [
          "Local aliases for official Claude setup-token values.",
          "Host launches keep the host login; overlay launches swap only the child-process OAuth token.",
        ],
      },
      options,
    ),
    renderPanel(
      {
        title: "Inventory",
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
            title: "Next Step",
            tone: "warn",
            badge: { label: "create overlay", tone: "warn" },
            body: [
              "No overlay profiles are stored yet.",
              "",
              renderCommandList(
                [
                  {
                    command: "cco auth add work",
                    description: "Create a local alias and save a verified setup-token.",
                  },
                  {
                    command: "cco work",
                    description: "Launch Claude with the work overlay once the token is saved.",
                  },
                ],
                options,
              ),
            ],
          },
          options,
        )
      : renderPanel(
          {
            title: "Next Step",
            tone: "ok",
            badge: { label: `${storedCount} ready`, tone: "ok" },
            body: [
              renderBulletList(
                [
                  "Use `cco <profile>` to launch with an overlay token.",
                  "Use `cco host` to launch with the host Claude login.",
                  "Use `cco auth remove <profile>` to delete a local alias.",
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
  const kindBadge: BadgeDefinition =
    profile.kind === "host"
      ? { label: "host", tone: "accent" }
      : { label: "overlay", tone: "dim" };
  const tokenBadge: BadgeDefinition =
    profile.kind === "host"
      ? { label: "host login", tone: "accent" }
      : tokenPresence.get(profile.id)
        ? { label: "stored", tone: "ok" }
        : { label: "missing", tone: "warn" };
  const suffix =
    profile.kind === "overlay" && profile.lastUsedAt
      ? ` last used ${theme.dim(profile.lastUsedAt)}`
      : "";

  return [
    `${theme.code(profile.id)} ${renderBadge(kindBadge, options)} ${renderBadge(tokenBadge, options)}${suffix}`,
  ].join("");
}
