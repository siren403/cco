import React, { type ReactNode } from "react";
import { Box, Text } from "ink";
import type { Profile } from "../../core/model/profile.ts";
import type { AppLocale } from "../../i18n/index.ts";
import { InkBulletList } from "./components/bullet-list.ts";
import { InkCommandList } from "./components/command-list.ts";
import { InkPanel } from "./components/panel.ts";
import { buildProfilesPageModel } from "../models/profiles-page.ts";

const h = React.createElement;
const dimColorProps = { dimColor: true } as const;

export function ProfilesInkScreen(props: {
  profiles: readonly Profile[];
  tokenPresence: ReadonlyMap<string, boolean>;
  profilesFile?: string;
  locale: AppLocale;
}): ReactNode {
  const model = buildProfilesPageModel(
    props.profiles,
    props.tokenPresence,
    props.profilesFile,
    props.locale,
  );

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: model.title,
        tone: model.titleTone,
        badge: model.overlayCountBadge.label,
        marginBottom: 1,
      },
      ...model.introLines.map((line) => h(Text, null, line)),
    ),
    h(
      InkPanel,
      {
        title: model.inventoryTitle,
        tone: "dim",
        marginBottom: 1,
      },
      ...model.rows.map((row) =>
        h(
          Text,
          { key: row.profileId },
          `${row.profileId} [${row.kindBadge.label}] [${row.tokenBadge.label}]${row.envBadge ? ` [${row.envBadge.label}]` : ""}${row.lastUsedAt ? ` ${row.lastUsedPrefix ?? ""} ${row.lastUsedAt}` : ""}`,
        ),
      ),
    ),
    h(
      InkPanel,
      {
        title: model.nextStepTitle,
        tone: model.nextStepTone,
        badge: model.nextStepBadge.label,
      },
      ...(model.noOverlayMessage
        ? [
            h(Text, null, model.noOverlayMessage),
            h(Text, null, ""),
            ...InkCommandList({ entries: model.noOverlayCommands ?? [] }),
          ]
        : InkBulletList({ items: model.nextStepBullets ?? [] })),
    ),
  );
}
