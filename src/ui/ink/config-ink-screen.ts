import React, { type ReactNode } from "react";
import { Box } from "ink";
import type { AppLocale } from "../../i18n/index.ts";
import { getUiText } from "../../i18n/index.ts";
import { InkKeyValueList, type InkKeyValueEntry } from "./components/key-value-list.ts";
import { InkPanel } from "./components/panel.ts";

const h = React.createElement;

export function ConfigGetInkScreen(props: {
  readonly profileId: string;
  readonly modeDescription: string;
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
        title: text.config.getTitle,
        tone: "accent",
        badge: props.profileId,
      },
      ...InkKeyValueList({
        entries: [
          {
            label: "subprocess-env-scrub",
            value: `env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB = ${props.modeDescription}`,
          },
          {
            label: "profiles-file",
            value: props.profilesFile,
          },
        ],
      }),
    ),
  );
}

export function ConfigSetSuccessInkScreen(props: {
  readonly profileId: string;
  readonly assignmentLine: string;
  readonly summary: string;
  readonly entries?: readonly InkKeyValueEntry[];
  readonly locale: AppLocale;
}): ReactNode {
  const text = getUiText(props.locale);

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: text.config.setSuccessTitle,
        tone: "ok",
        badge: props.profileId,
      },
      ...InkKeyValueList({
        entries: props.entries ?? [
          {
            label: "assignment",
            value: props.assignmentLine,
          },
          {
            label: "policy",
            value: props.summary,
          },
        ],
      }),
    ),
  );
}
