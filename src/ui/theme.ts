import type { AppLocale } from "../i18n/index.ts";

export interface RenderOptions {
  readonly ansiColor?: boolean;
  readonly locale?: AppLocale;
  readonly width?: number;
}

export function stripAnsi(text: string): string {
  return text.replace(/\u001B\[[0-9;]*m/g, "");
}

export function visibleLength(text: string): number {
  return stripAnsi(text).length;
}

export function padVisible(text: string, width: number): string {
  return `${text}${" ".repeat(Math.max(0, width - visibleLength(text)))}`;
}

export function resolveRenderWidth(options: RenderOptions = {}): number | undefined {
  if (typeof options.width === "number" && Number.isFinite(options.width)) {
    return Math.max(20, Math.floor(options.width));
  }

  const columns = process.stdout?.columns;
  if (typeof columns === "number" && Number.isFinite(columns) && columns > 0) {
    return Math.max(20, Math.floor(columns));
  }

  return undefined;
}

export function wrapVisibleText(text: string, width: number): string[] {
  if (width <= 0 || visibleLength(text) <= width) {
    return [text];
  }

  const tokens = tokenizeAnsi(text);
  const lines: string[] = [];
  let current = "";
  let currentWidth = 0;

  for (const token of tokens) {
    const tokenWidth = visibleLength(token);
    const whitespace = tokenWidth > 0 && stripAnsi(token).trim().length === 0;

    if (currentWidth === 0 && whitespace) {
      continue;
    }

    if (currentWidth + tokenWidth <= width) {
      current += token;
      currentWidth += tokenWidth;
      continue;
    }

    if (whitespace) {
      if (currentWidth > 0) {
        lines.push(trimAnsiTrailingSpaces(current));
        current = "";
        currentWidth = 0;
      }
      continue;
    }

    if (currentWidth > 0) {
      lines.push(trimAnsiTrailingSpaces(current));
      current = "";
      currentWidth = 0;
    }

    const hardWrapped = hardWrapAnsiToken(token, width);
    for (let index = 0; index < hardWrapped.length - 1; index += 1) {
      lines.push(trimAnsiTrailingSpaces(hardWrapped[index]!));
    }

    current = hardWrapped.at(-1) ?? "";
    currentWidth = visibleLength(current);
  }

  if (currentWidth > 0 || current.length > 0) {
    lines.push(trimAnsiTrailingSpaces(current));
  }

  return lines.length > 0 ? lines : [""];
}

export interface Theme {
  readonly color: boolean;
  readonly accent: (text: string) => string;
  readonly heading: (text: string) => string;
  readonly ok: (text: string) => string;
  readonly warn: (text: string) => string;
  readonly danger: (text: string) => string;
  readonly dim: (text: string) => string;
  readonly code: (text: string) => string;
}

export function resolveAnsiColor(
  stream: Pick<NodeJS.WriteStream, "getColorDepth"> | undefined,
  env: NodeJS.ProcessEnv,
): boolean {
  if (env.NO_COLOR || env.STRICLI_NO_COLOR) {
    return false;
  }

  if (env.FORCE_COLOR && env.FORCE_COLOR !== "0") {
    return true;
  }

  if (env.TERM === "dumb") {
    return false;
  }

  return (stream?.getColorDepth?.(env) ?? 1) > 1;
}

export function createTheme(options: RenderOptions = {}): Theme {
  const color = options.ansiColor ?? false;

  return {
    color,
    accent: wrap(color, 36),
    heading: wrap(color, 1, 38, 5, 39),
    ok: wrap(color, 32),
    warn: wrap(color, 33),
    danger: wrap(color, 31),
    dim: wrap(color, 2),
    code: wrap(color, 96),
  };
}

function wrap(enabled: boolean, ...codes: number[]) {
  if (!enabled) {
    return (text: string) => text;
  }

  const open = `\u001B[${codes.join(";")}m`;
  const close = "\u001B[0m";
  return (text: string) => `${open}${text}${close}`;
}

function tokenizeAnsi(text: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let pendingAnsi = "";

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;

    if (char === "\u001B") {
      const match = /\u001B\[[0-9;]*m/.exec(text.slice(index));
      if (match) {
        const seq = match[0];
        if (current.length > 0) {
          current += seq;
        } else {
          pendingAnsi += seq;
        }
        index += seq.length - 1;
        continue;
      }
    }

    if (/\s/.test(char)) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      tokens.push(`${pendingAnsi}${char}`);
      pendingAnsi = "";
      continue;
    }

    if (current.length === 0 && pendingAnsi.length > 0) {
      current = pendingAnsi;
      pendingAnsi = "";
    }
    current += char;
  }

  if (current.length > 0) {
    tokens.push(current);
  } else if (pendingAnsi.length > 0) {
    tokens.push(pendingAnsi);
  }

  return tokens;
}

function hardWrapAnsiToken(token: string, width: number): string[] {
  if (visibleLength(token) <= width) {
    return [token];
  }

  const lines: string[] = [];
  let current = "";
  let currentWidth = 0;

  for (let index = 0; index < token.length; index += 1) {
    const char = token[index]!;

    if (char === "\u001B") {
      const match = /\u001B\[[0-9;]*m/.exec(token.slice(index));
      if (match) {
        current += match[0];
        index += match[0].length - 1;
        continue;
      }
    }

    current += char;
    currentWidth += 1;

    if (currentWidth >= width) {
      lines.push(current);
      current = "";
      currentWidth = 0;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

function trimAnsiTrailingSpaces(text: string): string {
  return text.replace(/\s+$/u, "");
}
