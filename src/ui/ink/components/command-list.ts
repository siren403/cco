import React, { type ReactNode } from "react";
import { Text } from "ink";

const h = React.createElement;
const dimColorProps = { dimColor: true } as const;

export interface InkCommandEntry {
  readonly command: string;
  readonly description?: string;
}

export function InkCommandList(props: {
  readonly entries: readonly InkCommandEntry[];
}): ReactNode[] {
  return props.entries.flatMap((entry, index) => [
    h(Text, { key: `${index}:${entry.command}:command` }, `  ${entry.command}`),
    ...(entry.description
      ? [
          h(Text, {
            ...dimColorProps,
            key: `${index}:${entry.command}:description`,
          }, `    ${entry.description}`),
        ]
      : []),
  ]);
}
