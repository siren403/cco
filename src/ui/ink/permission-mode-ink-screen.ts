import React, { type ReactNode } from "react";
import { Box } from "ink";
import type { AppLocale } from "../../i18n/index.ts";
import { getUiText } from "../../i18n/index.ts";
import { InkBulletList } from "./components/bullet-list.ts";
import { InkCommandList } from "./components/command-list.ts";
import { InkPanel } from "./components/panel.ts";

const h = React.createElement;

export function PermissionModeWarningInkScreen(props: {
  readonly profileId: string;
  readonly locale: AppLocale;
}): ReactNode {
  const text = getUiText(props.locale);

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: text.permissionMode.warningTitle,
        tone: "warn",
        badge: props.profileId,
        marginBottom: 1,
      },
      ...InkBulletList({
        items: [
          text.permissionMode.warningLine1,
          text.permissionMode.warningLine2,
        ],
      }),
    ),
    h(
      InkPanel,
      {
        title: text.permissionMode.choicesTitle,
        tone: "accent",
      },
      ...InkBulletList({
        items: [
          text.permissionMode.choiceCompat,
          text.permissionMode.choiceSafe,
          text.permissionMode.choiceGuide,
        ],
      }),
    ),
  );
}

export function PermissionModeDecisionInkScreen(props: {
  readonly mode: "compat" | "safe";
  readonly locale: AppLocale;
}): ReactNode {
  const text = getUiText(props.locale);
  const compat = props.mode === "compat";

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: text.permissionMode.launchPolicyTitle,
        tone: compat ? "warn" : "ok",
        badge: compat ? text.permissionMode.compatMode : text.permissionMode.safeMode,
      },
      ...InkBulletList({
        items: compat
          ? [text.permissionMode.compatLine1, text.permissionMode.compatLine2]
          : [text.permissionMode.safeLine1, text.permissionMode.safeLine2],
      }),
    ),
  );
}

export function PermissionModeGuidanceInkScreen(props: {
  readonly profileId: string;
  readonly locale: AppLocale;
}): ReactNode {
  const text = getUiText(props.locale);

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: text.permissionMode.guidanceTitle,
        tone: "warn",
        badge: props.profileId,
        marginBottom: 1,
      },
      ...InkBulletList({
        items: [text.permissionMode.guidanceLine1, text.permissionMode.guidanceLine2],
      }),
    ),
    h(
      InkPanel,
      {
        title: text.permissionMode.guidanceNextTitle,
        tone: "accent",
      },
      ...InkCommandList({
        entries: [
          {
            command: `$env:CLAUDE_CODE_SUBPROCESS_ENV_SCRUB='0'; cco ${props.profileId} --permission-mode bypassPermissions -c`,
            description: text.permissionMode.guidanceCompatDescription,
          },
          {
            command: `cco ${props.profileId} -c`,
            description: text.permissionMode.guidanceSafeDescription,
          },
          {
            command: `cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p ${props.profileId}`,
            description: text.permissionMode.guidancePersistDescription,
          },
        ],
      }),
    ),
  );
}
