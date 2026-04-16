import React, { type ReactNode } from "react";
import { Box, Text } from "ink";
import type { InkTone } from "./panel.ts";
import { toInkColor } from "./panel.ts";

const h = React.createElement;
const dimColorProps = { dimColor: true } as const;

export interface InkKeyValueEntry {
  readonly label: string;
  readonly value: string;
  readonly tone?: InkTone;
}

export function InkKeyValueList(props: {
  readonly entries: readonly InkKeyValueEntry[];
}): ReactNode[] {
  return props.entries.map((entry, index) => {
    const color = entry.tone ? toInkColor(entry.tone) : "gray";

    return h(
      Box,
      {
        key: `${index}:${entry.label}`,
        flexDirection: "row",
        alignItems: "flex-start",
      },
      h(
        Box,
        {
          width: 20,
          minWidth: 20,
          flexShrink: 0,
          paddingRight: 1,
        },
        h(Text, { ...dimColorProps, wrap: "truncate-end" }, entry.label),
      ),
      h(
        Box,
        {
          flexGrow: 1,
          flexShrink: 1,
        },
        h(Text, { color, wrap: "wrap" }, entry.value),
      ),
    );
  });
}
