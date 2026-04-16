import React, { type ReactNode } from "react";
import { Box, Text } from "ink";
import { getUiText, type AppLocale } from "../../i18n/index.ts";
import type { CliErrorModel } from "../models/cli-error.ts";
import { InkBulletList } from "./components/bullet-list.ts";
import { InkCommandList } from "./components/command-list.ts";
import { InkPanel } from "./components/panel.ts";

const h = React.createElement;

export function ErrorInkScreen(props: {
  readonly model: CliErrorModel;
  readonly locale: AppLocale;
}): ReactNode {
  const text = getUiText(props.locale);
  const tone = props.model.tone === "warn" ? "warn" : "warn";

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: text.errors.problemTitle,
        tone,
        badge: props.model.tone === "warn" ? "attention" : "error",
        marginBottom: props.model.commands && props.model.commands.length > 0 ? 1 : 0,
      },
      h(Text, null, props.model.title),
      ...(props.model.summary
        ? [h(Text, { key: "summary-gap" }, ""), h(Text, { key: "summary" }, props.model.summary)]
        : []),
      ...(props.model.details && props.model.details.length > 0
        ? [
            h(Text, { key: "details-gap" }, ""),
            ...InkBulletList({ items: props.model.details }),
          ]
        : []),
    ),
    ...(props.model.commands && props.model.commands.length > 0
      ? [
          h(
            InkPanel,
            {
              key: "next-steps",
              title: props.model.nextStepTitle ?? text.errors.nextStepTitle,
              tone: "accent",
            },
            ...InkCommandList({ entries: props.model.commands }),
          ),
        ]
      : []),
  );
}
