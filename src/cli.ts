#!/usr/bin/env bun
import React from "react";
import { run } from "@stricli/core";
import { app } from "./app.ts";
import { launchClaudeForProfile } from "./commands/launch-shared.ts";
import { buildContext } from "./context.ts";
import { resolveInvocation, isRootHelpRequest, isRootVersionRequest } from "./invocation.ts";
import { APP_VERSION } from "./meta.ts";
import { ErrorInkScreen } from "./ui/ink/error-ink-screen.ts";
import { renderInkHost } from "./ui/ink/render-ink.ts";
import { RootHelpInkScreen } from "./ui/ink/root-help-ink-screen.ts";
import { runWithStricliInkInterception } from "./ui/ink/stricli-ink-intercept.ts";
import { buildCliErrorModel } from "./ui/models/cli-error.ts";
import { resolveAnsiColor } from "./ui/theme.ts";

const context = buildContext(process);
const argv = process.argv.slice(2);
const ansiColor = resolveAnsiColor(context.process.stdout, context.process.env);
void ansiColor;

if (isRootHelpRequest(argv)) {
  await renderInkHost(
    React.createElement(RootHelpInkScreen, {
      locale: context.runtime.locale,
    }),
    {
      stdin: context.process.stdin,
      stdout: context.process.stdout,
      stderr: context.process.stderr,
    },
  );
} else if (isRootVersionRequest(argv)) {
  context.process.stdout.write(`${APP_VERSION}\n`);
} else {
  try {
    const invocation = resolveInvocation(argv);

    if (invocation.mode === "direct-launch") {
      await launchClaudeForProfile(context, {
        requestedProfileId: invocation.profileId,
        claudeArgs: invocation.claudeArgs,
        isolate: invocation.isolate,
      });
    } else {
      await runWithStricliInkInterception(
        {
          process,
          locale: context.runtime.locale,
          argv,
        },
        async () => {
          await run(app, argv, context);
        },
      );
    }
  } catch (error) {
    await renderInkHost(
      React.createElement(ErrorInkScreen, {
        model: buildCliErrorModel(error, context.runtime.locale),
        locale: context.runtime.locale,
      }),
      {
        stdin: context.process.stdin,
        stdout: context.process.stderr,
        stderr: context.process.stderr,
      },
    );
    context.process.exitCode = 1;
  }
}
