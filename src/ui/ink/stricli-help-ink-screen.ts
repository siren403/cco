import React, { type ReactNode } from "react";
import { Box, Text } from "ink";
import type { AppLocale } from "../../i18n/index.ts";
import type { StricliHelpPageModel } from "../models/stricli-help-page.ts";
import { InkBulletList } from "./components/bullet-list.ts";
import { InkPanel } from "./components/panel.ts";

const h = React.createElement;

export function StricliHelpInkScreen(props: {
  readonly model: StricliHelpPageModel;
  readonly locale: AppLocale;
}): ReactNode {
  const summaryTitle = props.locale === "en" ? "Summary" : "요약";

  return h(
    Box,
    { flexDirection: "column" },
    ...(props.model.summary.length > 0
      ? [
          h(
            InkPanel,
            {
              key: "summary",
              title: summaryTitle,
              tone: "accent",
              marginBottom: props.model.sections.length > 0 ? 1 : 0,
            },
            ...InkBulletList({ items: props.model.summary }),
          ),
        ]
      : []),
    ...props.model.sections.map((section, index) =>
      h(
        InkPanel,
        {
          key: section.title,
          title: section.title,
          tone: section.title === "사용법" || section.title === "USAGE" ? "ok" : "dim",
          marginBottom: index < props.model.sections.length - 1 ? 1 : 0,
        },
        ...section.lines.map((line, lineIndex) => h(Text, { key: `${section.title}:${lineIndex}` }, line)),
      ),
    ),
  );
}
