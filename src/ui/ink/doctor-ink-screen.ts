import React, { type ReactNode } from "react";
import { Box, Text } from "ink";
import type { AppLocale } from "../../i18n/index.ts";
import {
  buildDoctorPageModel,
  type DoctorPageData,
} from "../models/doctor-page.ts";
import { InkBulletList } from "./components/bullet-list.ts";
import { InkCommandList } from "./components/command-list.ts";
import { InkKeyValueList } from "./components/key-value-list.ts";
import { InkPanel } from "./components/panel.ts";

const h = React.createElement;

export function DoctorInkScreen(props: {
  readonly data: DoctorPageData;
  readonly locale: AppLocale;
}): ReactNode {
  const model = buildDoctorPageModel(props.data, props.locale);

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: model.title,
        tone: model.titleTone,
        badge: model.badge,
        marginBottom: 1,
      },
      ...model.introLines.map((line) => h(Text, null, line)),
    ),
    h(
      InkPanel,
      {
        title: model.snapshotTitle,
        tone: "dim",
        marginBottom: 1,
      },
      ...InkKeyValueList({ entries: model.snapshotEntries }),
    ),
    h(
      InkPanel,
      {
        title: model.nextStepTitle,
        tone: model.nextStepTone,
      },
      ...(model.nextStepCommands
        ? InkCommandList({ entries: model.nextStepCommands })
        : InkBulletList({ items: model.cleanupBullets ?? [] })),
    ),
  );
}
