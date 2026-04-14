import type { AppLocale } from "../i18n/index.ts";

export interface RenderOptions {
  readonly ansiColor?: boolean;
  readonly locale?: AppLocale;
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
