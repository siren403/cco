#!/usr/bin/env bun
import { run } from "@stricli/core";
import { app } from "./app.ts";
import { launchClaudeForProfile } from "./commands/launch-shared.ts";
import { buildContext } from "./context.ts";
import { resolveInvocation, isRootHelpRequest, isRootVersionRequest } from "./invocation.ts";
import { APP_VERSION } from "./meta.ts";
import { renderCliError } from "./ui/renderers/error-message.ts";
import { renderRootHelp } from "./ui/renderers/root-help.ts";

const context = buildContext(process);
const argv = process.argv.slice(2);

if (isRootHelpRequest(argv)) {
  context.process.stdout.write(`${renderRootHelp()}\n`);
} else if (isRootVersionRequest(argv)) {
  context.process.stdout.write(`${APP_VERSION}\n`);
} else {
  try {
    const invocation = resolveInvocation(argv);

    if (invocation.mode === "direct-launch") {
      await launchClaudeForProfile(context, {
        requestedProfileId: invocation.profileId,
        claudeArgs: invocation.claudeArgs,
      });
    } else {
      await run(app, argv, context);
    }
  } catch (error) {
    context.process.stderr.write(`${renderCliError(error)}\n`);
    context.process.exitCode = 1;
  }
}
