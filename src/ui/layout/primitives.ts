import {
  createTheme,
  padVisible,
  visibleLength,
  type RenderOptions,
  type Theme,
} from "../theme.ts";

export type Tone = "accent" | "ok" | "warn" | "danger" | "dim";

export interface BadgeDefinition {
  readonly label: string;
  readonly tone?: Tone;
}

export interface PanelDefinition {
  readonly title: string;
  readonly tone?: Tone;
  readonly badge?: BadgeDefinition;
  readonly body: string | readonly string[];
}

export interface KeyValueEntry {
  readonly label: string;
  readonly value: string;
  readonly tone?: Tone;
}

export interface CommandEntry {
  readonly command: string;
  readonly description?: string;
}

export function joinBlocks(blocks: readonly string[]): string {
  return blocks.filter((block) => block.trim().length > 0).join("\n\n");
}

export function renderPanel(
  definition: PanelDefinition,
  options: RenderOptions = {},
): string {
  const theme = createTheme(options);
  const borderPaint = tonePainter(theme, definition.tone ?? "accent");
  const bodyLines = normalizeLines(definition.body);
  const badge = definition.badge ? renderBadge(definition.badge, options) : "";
  const plainHeader = `${definition.title}${badge ? ` ${visibleLabel(badge)}` : ""}`;
  const panelWidth = Math.max(
    plainHeader.length + 1,
    ...bodyLines.map((line) => visibleLength(line)),
  );
  const displayHeader = `${theme.heading(definition.title)}${badge ? ` ${badge}` : ""}`;
  const topLine = `┌─ ${displayHeader} ${borderPaint("─".repeat(Math.max(0, panelWidth - plainHeader.length - 1)))}┐`;
  const renderedLines = bodyLines.map(
    (line) => `${borderPaint("│")} ${padVisible(line, panelWidth)} ${borderPaint("│")}`,
  );
  const bottomLine = `${borderPaint("└")}${borderPaint("─".repeat(panelWidth + 2))}${borderPaint("┘")}`;

  return [topLine, ...renderedLines, bottomLine].join("\n");
}

export function renderBadge(
  badge: BadgeDefinition,
  options: RenderOptions = {},
): string {
  const theme = createTheme(options);
  const paint = tonePainter(theme, badge.tone ?? "accent");
  return paint(`[${badge.label}]`);
}

export function renderKeyValueList(
  entries: readonly KeyValueEntry[],
  options: RenderOptions = {},
): string {
  const theme = createTheme(options);
  const width = Math.max(...entries.map((entry) => entry.label.length), 4);

  return entries
    .map((entry) => {
      const paint = tonePainter(theme, entry.tone ?? "dim");
      return `${theme.dim(entry.label.padEnd(width))}  ${paint(entry.value)}`;
    })
    .join("\n");
}

export function renderCommandList(
  entries: readonly CommandEntry[],
  options: RenderOptions = {},
): string {
  const theme = createTheme(options);

  return entries
    .map((entry) => {
      if (!entry.description) {
        return `  ${theme.code(entry.command)}`;
      }

      return `  ${theme.code(entry.command)}\n    ${theme.dim(entry.description)}`;
    })
    .join("\n");
}

export function renderBulletList(
  items: readonly string[],
  options: RenderOptions = {},
): string {
  const theme = createTheme(options);
  return items.map((item) => `  ${theme.accent("•")} ${item}`).join("\n");
}

function normalizeLines(input: string | readonly string[]): string[] {
  if (typeof input !== "string") {
    return input.flatMap((line) => line.split("\n"));
  }

  return input.split("\n");
}

function tonePainter(theme: Theme, tone: Tone): (text: string) => string {
  switch (tone) {
    case "ok":
      return theme.ok;
    case "warn":
      return theme.warn;
    case "danger":
      return theme.danger;
    case "dim":
      return theme.dim;
    case "accent":
    default:
      return theme.accent;
  }
}

function visibleLabel(rendered: string): string {
  return rendered.replace(/\u001B\[[0-9;]*m/g, "");
}
