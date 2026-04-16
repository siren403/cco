import React, { type ReactNode } from "react";
import { Box } from "ink";
import type { AppLocale } from "../../i18n/index.ts";
import { getUiText } from "../../i18n/index.ts";
import { InkKeyValueList } from "./components/key-value-list.ts";
import { InkPanel } from "./components/panel.ts";

const h = React.createElement;

export function IsolateBootstrapInkScreen(props: {
  readonly claudeHomeDir: string;
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
