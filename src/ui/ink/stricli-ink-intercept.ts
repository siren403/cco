import React from "react";
import { stripAnsi } from "../theme.ts";
import type { AppLocale } from "../../i18n/index.ts";
import {
  buildCliErrorModel,
  buildStricliNoLocaleTextModel,
  buildStricliUnknownCommandModel,
  type StricliUnknownCommandData,
} from "../models/cli-error.ts";
import { buildStricliHelpPageModel } from "../models/stricli-help-page.ts";
import { ErrorInkScreen } from "./error-ink-screen.ts";
import { renderInkHost } from "./render-ink.ts";
import { StricliHelpInkScreen } from "./stricli-help-ink-screen.ts";

const MARKER_PREFIX = "__CCO_STRICLI_MARKER__";

const payloadStore = new Map<string, unknown>();

type MarkerKind =
  | "no-command"
  | "no-locale-text"
  | "parse-error"
  | "load-command-error"
  | "load-context-error"
  | "run-command-error"
  | "command-error";

interface MarkerPayload {
  readonly kind: MarkerKind;
  readonly payload: unknown;
}

export function createStricliMarker(kind: MarkerKind, payload: unknown): string {
  const id = crypto.randomUUID();
  payloadStore.set(id, payload);
  return `${MARKER_PREFIX}:${kind}:${id}`;
}

export async function runWithStricliInkInterception(
  options: {
    readonly process: typeof process;
    readonly locale: AppLocale;
    readonly argv: readonly string[];
  },
  runApp: () => Promise<void>,
): Promise<void> {
  const pending: Array<() => Promise<void>> = [];
  const originalStdoutWrite = options.process.stdout.write.bind(options.process.stdout);
  const originalStderrWrite = options.process.stderr.write.bind(options.process.stderr);

  options.process.stdout.write = ((chunk: unknown, ...args: unknown[]) => {
    const text = typeof chunk === "string" ? chunk : chunk instanceof Uint8Array ? Buffer.from(chunk).toString("utf8") : "";
    const helpModel = buildStricliHelpPageModel(stripAnsi(text), options.locale);

    if (helpModel) {
      pending.push(async () => {
        await renderInkHost(
          React.createElement(StricliHelpInkScreen, {
            model: helpModel,
            locale: options.locale,
          }),
          {
            stdin: options.process.stdin,
            stdout: options.process.stdout,
            stderr: options.process.stderr,
          },
        );
      });

      return true;
    }

    return originalStdoutWrite(chunk as never, ...(args as never[]));
  }) as typeof options.process.stdout.write;

  options.process.stderr.write = ((chunk: unknown, ...args: unknown[]) => {
    const text = typeof chunk === "string" ? chunk : chunk instanceof Uint8Array ? Buffer.from(chunk).toString("utf8") : "";
    const marker = consumeMarker(stripAnsi(text));

    if (marker) {
      pending.push(async () => {
        if (marker.kind === "no-command") {
          const data = marker.payload as StricliUnknownCommandData;
          await renderInkHost(
            React.createElement(ErrorInkScreen, {
              model: buildStricliUnknownCommandModel(
                {
                  ...data,
                  prefix: deriveUnknownCommandPrefix(options.argv, data.input),
                },
                options.locale,
              ),
              locale: options.locale,
            }),
            {
              stdin: options.process.stdin,
              stdout: options.process.stderr,
              stderr: options.process.stderr,
            },
          );
          return;
        }

        if (marker.kind === "no-locale-text") {
          const data = marker.payload as {
            requestedLocale: string;
            defaultLocale: string;
          };
          await renderInkHost(
            React.createElement(ErrorInkScreen, {
              model: buildStricliNoLocaleTextModel(
                data.requestedLocale,
                data.defaultLocale,
                options.locale,
              ),
              locale: options.locale,
            }),
            {
              stdin: options.process.stdin,
              stdout: options.process.stderr,
              stderr: options.process.stderr,
            },
          );
          return;
        }

        await renderInkHost(
          React.createElement(ErrorInkScreen, {
            model: buildCliErrorModel(marker.payload, options.locale),
            locale: options.locale,
          }),
          {
            stdin: options.process.stdin,
            stdout: options.process.stderr,
            stderr: options.process.stderr,
          },
        );
      });

      return true;
    }

    return originalStderrWrite(chunk as never, ...(args as never[]));
  }) as typeof options.process.stderr.write;

  let runError: unknown;

  try {
    await runApp();
  } catch (error) {
    runError = error;
  } finally {
    options.process.stdout.write = originalStdoutWrite;
    options.process.stderr.write = originalStderrWrite;

    for (const renderPending of pending) {
      await renderPending();
    }
  }

  if (runError) {
    throw runError;
  }
}

function consumeMarker(text: string): MarkerPayload | null {
  const match = text.match(new RegExp(`${MARKER_PREFIX}:(.+?):([a-f0-9-]{36})`));
  if (!match) {
    return null;
  }

  const kind = match[1] as MarkerKind;
  const id = match[2];
  if (!id) {
    return null;
  }

  const payload = payloadStore.get(id);
  payloadStore.delete(id);

  return {
    kind,
    payload,
  };
}

function deriveUnknownCommandPrefix(argv: readonly string[], input: string): readonly string[] {
  const index = argv.indexOf(input);
  if (index <= 0) {
    return [];
  }

  return argv.slice(0, index);
}
