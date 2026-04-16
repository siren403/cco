import React, { type ReactNode } from "react";
import { Text } from "ink";

const h = React.createElement;

export function InkBulletList(props: {
  readonly items: readonly string[];
}): ReactNode[] {
  return props.items.map((item, index) =>
    h(Text, { key: `${index}:${item}` }, `• ${item}`),
  );
}
