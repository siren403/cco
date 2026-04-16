import React, { type ReactNode } from "react";
import { Box, Text } from "ink";
import type { AppLocale } from "../../i18n/index.ts";
import { getUiText } from "../../i18n/index.ts";
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
            command: text.authAdd.nextPickMode,
            description: text.authAdd.nextPickModeDescription,
          },
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
