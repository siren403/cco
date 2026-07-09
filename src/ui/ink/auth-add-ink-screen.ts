import React, { type ReactNode } from "react";
import { Box, Text } from "ink";
import type { AppLocale } from "../../i18n/index.ts";
import { getUiText } from "../../i18n/index.ts";
import { InkBulletList } from "./components/bullet-list.ts";
import { InkCommandList } from "./components/command-list.ts";
import { InkKeyValueList } from "./components/key-value-list.ts";
import { InkPanel } from "./components/panel.ts";

const h = React.createElement;

export function AuthAddIntroInkScreen(props: {
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
        title: text.authAdd.introTitle,
        tone: "accent",
        badge: props.profileId,
        marginBottom: 1,
      },
      h(Text, null, text.authAdd.introLine1),
      h(Text, null, text.authAdd.introLine2),
    ),
    h(
      InkPanel,
      {
        title: text.authAdd.nextTitle,
        tone: "ok",
      },
      ...InkCommandList({
        entries: [
          {
            command: text.authAdd.nextSetupToken,
            description: text.authAdd.nextSetupTokenDescription,
          },
          {
            command: text.authAdd.nextPasteToken(props.profileId),
            description: text.authAdd.nextPasteTokenDescription,
          },
        ],
      }),
    ),
  );
}

export function AuthAddSuccessInkScreen(props: {
  readonly profileId: string;
  readonly modeLabel: string;
  readonly profilesFile: string;
  readonly locale: AppLocale;
}): ReactNode {
  const text = getUiText(props.locale);

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: text.authAdd.successTitle,
        tone: "ok",
        badge: props.profileId,
      },
      ...InkKeyValueList({
        entries: [
          {
            label: "runtime-policy",
            value: text.authAdd.successRuntimePolicy(props.modeLabel),
            tone: "ok",
          },
          {
            label: "profiles-file",
            value: props.profilesFile,
          },
        ],
      }),
      h(Text, null, ""),
      h(Text, { dimColor: true }, text.authAdd.successEnvProtectionNote),
      h(Text, null, ""),
      ...InkCommandList({
        entries: [
          {
            command: text.authAdd.successLaunch(props.profileId),
            description: text.authAdd.successLaunchDescription,
          },
          {
            command: text.authAdd.successContinue(props.profileId),
            description: text.authAdd.successContinueDescription,
          },
          {
            command: text.authAdd.successList,
            description: text.authAdd.successListDescription,
          },
          {
            command: text.authAdd.successConfigGet(props.profileId),
            description: text.authAdd.successConfigGetDescription,
          },
        ],
      }),
    ),
  );
}

export function AuthAddProviderIntroInkScreen(props: {
  readonly profileId: string;
  readonly fromPath?: string;
  readonly locale: AppLocale;
}): ReactNode {
  const text = getUiText(props.locale);

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: text.authAdd.providerIntroTitle,
        tone: "accent",
        badge: props.profileId,
        marginBottom: 1,
      },
      h(Text, null, text.authAdd.providerIntroLine1),
      h(Text, null, text.authAdd.providerIntroLine2),
    ),
    h(
      InkPanel,
      {
        title: text.authAdd.nextTitle,
        tone: "ok",
      },
      ...(props.fromPath
        ? InkCommandList({
            entries: [
              {
                command: props.fromPath,
                description: text.authAdd.providerFromFileNotice(props.fromPath),
              },
            ],
          })
        : InkCommandList({
            entries: [
              {
                command: text.authAdd.providerNextBaseUrl,
                description: text.authAdd.providerNextBaseUrlDescription,
              },
              {
                command: text.authAdd.providerNextToken(props.profileId),
                description: text.authAdd.providerNextTokenDescription,
              },
            ],
          })),
    ),
  );
}

export function AuthAddProviderSuccessInkScreen(props: {
  readonly profileId: string;
  readonly modeLabel: string;
  readonly baseUrl: string;
  readonly profilesFile: string;
  readonly droppedKeys: readonly string[];
  readonly notices: readonly string[];
  readonly locale: AppLocale;
}): ReactNode {
  const text = getUiText(props.locale);
  const noticeLines = [
    ...(props.droppedKeys.length > 0
      ? [text.authAdd.providerDroppedKeysSummary(props.droppedKeys.join(", "))]
      : []),
    ...props.notices.map((notice) => text.authAdd.providerNotice(notice)),
  ];

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: text.authAdd.providerSuccessTitle,
        tone: "ok",
        badge: props.profileId,
        marginBottom: noticeLines.length > 0 ? 1 : 0,
      },
      ...InkKeyValueList({
        entries: [
          {
            label: "runtime-policy",
            value: text.authAdd.successRuntimePolicy(props.modeLabel),
            tone: "ok",
          },
          {
            label: "base-url",
            value: props.baseUrl,
          },
          {
            label: "profiles-file",
            value: props.profilesFile,
          },
        ],
      }),
      h(Text, null, ""),
      h(Text, { dimColor: true }, text.authAdd.successEnvProtectionNote),
      h(Text, null, ""),
      ...InkCommandList({
        entries: [
          {
            command: text.authAdd.successLaunch(props.profileId),
            description: text.authAdd.successLaunchDescription,
          },
          {
            command: text.authAdd.successContinue(props.profileId),
            description: text.authAdd.successContinueDescription,
          },
          {
            command: text.authAdd.successList,
            description: text.authAdd.successListDescription,
          },
          {
            command: text.authAdd.successConfigGet(props.profileId),
            description: text.authAdd.successConfigGetDescription,
          },
        ],
      }),
    ),
    noticeLines.length > 0
      ? h(
          InkPanel,
          {
            title: text.authAdd.nextTitle,
            tone: "warn",
          },
          ...InkBulletList({ items: noticeLines }),
        )
      : null,
  );
}
