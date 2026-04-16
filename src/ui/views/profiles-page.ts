import { type Profile } from "../../core/model/profile.ts";
import { buildProfilesPageModel, type ProfilesPageRowModel } from "../models/profiles-page.ts";
import {
  joinBlocks,
  renderBadge,
  renderBulletList,
  renderCommandList,
  renderPanel,
} from "../layout/primitives.ts";
import { createTheme, type RenderOptions } from "../theme.ts";

export function renderProfilesPage(
  profiles: readonly Profile[],
  tokenPresence: ReadonlyMap<string, boolean>,
  profilesFile: string | undefined,
  options: RenderOptions = {},
): string {
  const model = buildProfilesPageModel(
    profiles,
    tokenPresence,
    profilesFile,
    options.locale ?? "ko",
  );

  return joinBlocks([
    renderPanel(
      {
        title: model.title,
        tone: model.titleTone,
        badge: model.overlayCountBadge,
        body: [...model.introLines],
      },
      options,
    ),
    renderPanel(
      {
        title: model.inventoryTitle,
        tone: "dim",
        body: model.rows.map((row) => renderProfileRow(row, options)),
      },
      options,
    ),
    renderPanel(
      {
        title: model.nextStepTitle,
        tone: model.nextStepTone,
        badge: model.nextStepBadge,
        body: model.noOverlayMessage
          ? [
              model.noOverlayMessage,
              "",
              renderCommandList(model.noOverlayCommands ?? [], options),
            ]
          : [renderBulletList(model.nextStepBullets ?? [], options)],
      },
      options,
    ),
  ]);
}

function renderProfileRow(
  row: ProfilesPageRowModel,
  options: RenderOptions,
): string {
  const theme = createTheme(options);

  return `${theme.code(row.profileId)} ${renderBadge(row.kindBadge, options)} ${renderBadge(row.tokenBadge, options)}${row.envBadge ? ` ${renderBadge(row.envBadge, options)}` : ""}${row.lastUsedAt ? ` ${row.lastUsedPrefix ?? (options.locale === "en" ? "last used" : "마지막 사용")} ${theme.dim(row.lastUsedAt)}` : ""}`;
}
