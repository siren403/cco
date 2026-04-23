import React, { type ReactNode } from "react";
import { Box, Text } from "ink";

const h = React.createElement;

export type InkTone = "accent" | "ok" | "warn" | "dim";
export type InkColor = "cyan" | "green" | "yellow" | "magenta" | "gray";

export interface InkPanelProps {
  readonly title: string;
  readonly tone?: InkTone;
  readonly color?: InkColor;
  readonly badge?: string;
  readonly width?: number | `${number}%`;
  readonly marginRight?: number;
  readonly marginBottom?: number;
  readonly children?: ReactNode;
}

export function InkPanel(props: InkPanelProps): ReactNode {
  const color = props.color ?? toInkColor(props.tone ?? "accent");

  return h(
    Box,
    {
      borderStyle: "round",
      borderColor: color,
      paddingX: 1,
      paddingY: 0,
      flexDirection: "column",
      width: props.width,
      flexGrow: props.width ? 0 : 1,
      flexShrink: props.width ? 0 : 1,
      marginRight: props.marginRight ?? 0,
      marginBottom: props.marginBottom ?? 0,
    },
    h(Text, { color }, `${props.title}${props.badge ? ` [${props.badge}]` : ""}`),
    h(Text, null, ""),
    props.children,
  );
}

export function toInkColor(tone: InkTone): InkColor {
  switch (tone) {
    case "ok":
      return "green";
    case "warn":
      return "yellow";
    case "dim":
      return "gray";
    case "accent":
    default:
      return "cyan";
  }
}
