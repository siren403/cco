import React, { type ReactNode } from "react";
import { Box, Text } from "ink";
import type { AppLocale } from "../../i18n/index.ts";
import { getUiText } from "../../i18n/index.ts";
import { APP_NAME, APP_VERSION } from "../../meta.ts";
import { InkBulletList } from "./components/bullet-list.ts";
import { InkCommandList } from "./components/command-list.ts";
import { InkPanel } from "./components/panel.ts";

const h = React.createElement;
const dimColorProps = { dimColor: true } as const;

export function RootHelpInkScreen(props: { readonly locale: AppLocale }): ReactNode {
  const text = getUiText(props.locale);

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: `${APP_NAME} ${APP_VERSION}`,
        tone: "accent",
        badge: text.rootHelp.badge,
        marginBottom: 1,
      },
      h(Text, dimColorProps, text.appDescription),
      h(Text, null, ""),
      h(Text, null, text.rootHelp.summary),
    ),
    h(
      InkPanel,
      {
        title: text.rootHelp.quickStartTitle,
        tone: "ok",
        badge: text.rootHelp.quickStartBadge,
        marginBottom: 1,
      },
      ...InkCommandList({
        entries: [
          {
            command: `${APP_NAME} auth add work`,
            description: text.rootHelp.quickStartAuthAdd,
          },
          {
            command: `${APP_NAME} work`,
            description: text.rootHelp.quickStartLaunch,
          },
          {
            command: `${APP_NAME} work -c`,
            description: text.rootHelp.quickStartContinue,
          },
          {
            command: `${APP_NAME} --isolate work -c`,
            description: text.rootHelp.quickStartIsolate,
          },
          {
            command: `${APP_NAME} showcase auth`,
            description: text.rootHelp.quickStartShowcase,
          },
        ],
      }),
    ),
    h(
      InkPanel,
      {
        title: text.rootHelp.commandSurfaceTitle,
        tone: "dim",
        marginBottom: 1,
      },
      ...InkBulletList({
        items: [
          text.rootHelp.commandSurfaceProfile,
          text.rootHelp.commandSurfaceHost,
          text.rootHelp.commandSurfaceConfig,
          text.rootHelp.commandSurfaceDoctor,
          text.rootHelp.commandSurfaceIsolate,
          text.rootHelp.commandSurfaceShowcase,
        ],
      }),
      h(Text, null, ""),
      h(Text, null, `[${text.rootHelp.localAliasBadge}] ${text.rootHelp.localAliasSummary}`),
    ),
    h(
      InkPanel,
      {
        title: text.rootHelp.permissionScrubTitle,
        tone: "warn",
        badge: text.rootHelp.permissionScrubBadge,
      },
      h(Text, null, text.rootHelp.permissionScrubSummary),
      h(Text, null, ""),
      ...InkCommandList({
        entries: [
          {
            command: "$env:CLAUDE_CODE_SUBPROCESS_ENV_SCRUB='0'; cco work --permission-mode bypassPermissions -c",
            description: text.rootHelp.permissionScrubCompatDescription,
          },
          {
            command: "cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p work",
            description: text.rootHelp.permissionScrubPersistDescription,
          },
        ],
      }),
    ),
  );
}
