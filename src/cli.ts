#!/usr/bin/env bun
import { run } from "@stricli/core";
import { app } from "./app.ts";
import { launchClaudeForProfile } from "./commands/launch-shared.ts";
import { buildContext } from "./context.ts";
import { resolveInvocation } from "./invocation.ts";

const context = buildContext(process);
const argv = process.argv.slice(2);
const invocation = resolveInvocation(argv);

if (invocation.mode === "direct-launch") {
  await launchClaudeForProfile(context, {
    requestedProfileId: invocation.profileId,
    claudeArgs: invocation.claudeArgs,
  });
} else {
  await run(app, argv, context);
}
