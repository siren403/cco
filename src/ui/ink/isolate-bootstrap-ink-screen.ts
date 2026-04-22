import React, { type ReactNode } from "react";
import { Box } from "ink";
import type { AppLocale } from "../../i18n/index.ts";
import { getUiText } from "../../i18n/index.ts";
import type { IsolateBootstrapMode } from "../../core/services/isolate-bootstrap.ts";
import { InkKeyValueList } from "./components/key-value-list.ts";
import { InkPanel } from "./components/panel.ts";

const h = React.createElement;

export function IsolateBootstrapInkScreen(props: {
  readonly claudeHomeDir: string;
  readonly seedMode: IsolateBootstrapMode;
  readonly importLatestHostSession: boolean;
  readonly locale: AppLocale;
}): ReactNode {
  const text = getUiText(props.locale);

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: text.misc.isolateBootstrapReadyTitle,
        tone: "accent",
      },
      ...InkKeyValueList({
        entries: [
          {
            label: "summary",
            value: text.misc.isolateBootstrapReadyLine1,
          },
          {
            label: "bootstrap-mode",
            value: props.seedMode === "clean"
              ? text.prompts.isolateBootstrapCleanLabel
              : text.prompts.isolateBootstrapImportLabel,
          },
          {
            label: "session-handoff",
            value: props.importLatestHostSession
              ? text.prompts.isolateContinuityImportLabel
              : text.prompts.isolateContinuitySkipLabel,
          },
          {
            label: "target-home",
            value: props.claudeHomeDir,
          },
          {
            label: "next",
            value: text.misc.isolateBootstrapReadyLine3,
          },
        ],
      }),
    ),
  );
}
