import {
  createTheme,
  padVisible,
  resolveRenderWidth,
  visibleLength,
  wrapVisibleText,
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
  const maxRenderWidth = resolveRenderWidth(options);
  const badge = definition.badge ? renderBadge(definition.badge, options) : "";
  const plainHeader = `${definition.title}${badge ? ` ${visibleLabel(badge)}` : ""}`;
  const preferredWidth = Math.max(
    plainHeader.length + 1,
    ...normalizeLines(definition.body).map((line) => visibleLength(line)),
  );
  const panelWidth = Math.max(
    20,
    maxRenderWidth ? Math.min(preferredWidth, maxRenderWidth - 4) : preferredWidth,
  );
  const bodyLines = normalizeLines(definition.body).flatMap((line) =>
    visibleLength(line) > panelWidth ? wrapVisibleText(line, panelWidth) : [line],
  );
  const displayHeader = renderHeader(definition.title, badge, theme, panelWidth);
  const displayHeaderWidth = visibleLength(displayHeader);
  const topLine = `┌─ ${displayHeader} ${borderPaint("─".repeat(Math.max(0, panelWidth - displayHeaderWidth - 1)))}┐`;
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
  const contentWidth = resolveContentWidth(options);
  const width = Math.max(...entries.map((entry) => entry.label.length), 4);

  return entries
    .map((entry) => {
      const paint = tonePainter(theme, entry.tone ?? "dim");
      const prefix = `${theme.dim(entry.label.padEnd(width))}  `;
      const wrapped = contentWidth
        ? wrapVisibleText(paint(entry.value), Math.max(12, contentWidth - width - 2))
        : [paint(entry.value)];

      return wrapped
        .map((line, index) =>
          index === 0
            ? `${prefix}${line}`
            : `${" ".repeat(width)}  ${line}`,
        )
        .join("\n");
    })
    .join("\n");
}

export function renderCommandList(
  entries: readonly CommandEntry[],
  options: RenderOptions = {},
): string {
  const theme = createTheme(options);
  const contentWidth = resolveContentWidth(options);

  return entries
    .map((entry) => {
      if (!entry.description) {
        const wrappedCommand = contentWidth
          ? wrapVisibleText(theme.code(entry.command), Math.max(12, contentWidth - 2))
          : [theme.code(entry.command)];
        return wrappedCommand
          .map((line) => `  ${line}`)
          .join("\n");
      }

      const wrappedCommand = contentWidth
        ? wrapVisibleText(theme.code(entry.command), Math.max(12, contentWidth - 2))
        : [theme.code(entry.command)];
      const wrappedDescription = contentWidth
        ? wrapVisibleText(theme.dim(entry.description), Math.max(12, contentWidth - 4))
        : [theme.dim(entry.description)];

      return [
        ...wrappedCommand.map((line) => `  ${line}`),
        ...wrappedDescription.map((line) => `    ${line}`),
      ].join("\n");
    })
    .join("\n");
}

export function renderBulletList(
  items: readonly string[],
  options: RenderOptions = {},
): string {
  const theme = createTheme(options);
  const contentWidth = resolveContentWidth(options);

  return items
    .map((item) => {
      const wrapped = contentWidth
        ? wrapVisibleText(item, Math.max(12, contentWidth - 4))
        : [item];

      return wrapped
        .map((line, index) =>
          index === 0 ? `  ${theme.accent("•")} ${line}` : "    " + line,
        )
        .join("\n");
    })
    .join("\n");
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

function resolveContentWidth(options: RenderOptions): number | undefined {
  const width = resolveRenderWidth(options);
  if (!width) {
    return undefined;
  }

  return Math.max(20, width - 4);
}

function renderHeader(
  title: string,
  badge: string,
  theme: Theme,
  panelWidth: number,
): string {
  const plain = `${title}${badge ? ` ${visibleLabel(badge)}` : ""}`;
  if (plain.length + 1 <= panelWidth) {
    return `${theme.heading(title)}${badge ? ` ${badge}` : ""}`;
  }

  const available = Math.max(8, panelWidth - 1);
  const truncated =
    plain.length > available ? `${plain.slice(0, available - 1)}…` : plain;
  return theme.heading(truncated);
}
