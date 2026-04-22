import React from "react";
import { intro, outro } from "@clack/prompts";
import type { AppContext } from "../context.ts";
import { buildLaunchPlan } from "../core/services/build-launch-plan.ts";
import { resolveIsolateLaunchArgs } from "../core/services/isolate-launch-args.ts";
import { listProfiles } from "../core/services/list-profiles.ts";
import {
  requestsBypassPermissions,
  resolveShellSubprocessEnvScrubMode,
} from "../core/services/permission-mode.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import {
  ensureIsolateHomeReady,
  type IsolateBootstrapOptions,
  type EnsureIsolateHomeReadyResult,
} from "../core/services/isolate-bootstrap.ts";
import {
  resolveSubprocessEnvScrubMode,
  type OverlayProfile,
  type Profile,
  type SubprocessEnvScrubMode,
} from "../core/model/profile.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import {
  findLatestClaudeProjectSession,
  importClaudeProjectSession,
} from "../core/services/isolate-session-continuity.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { resolveHostClaudeConfigDir } from "../infra/fs/path-utils.ts";
import { spawnClaudeInteractive } from "../infra/bun/spawn-claude.ts";
import {
  PermissionModeDecisionInkScreen,
  PermissionModeGuidanceInkScreen,
  PermissionModeWarningInkScreen,
} from "../ui/ink/permission-mode-ink-screen.ts";
import { renderInkHost } from "../ui/ink/render-ink.ts";
import { promptForProfile } from "../ui/prompts/profile-picker.ts";
import { promptForPermissionModeOverride } from "../ui/prompts/permission-mode-override.ts";

const text = getStaticUiText();

export interface LaunchProfileOptions {
  readonly requestedProfileId?: string;
  readonly claudeArgs?: readonly string[];
  readonly isolate?: boolean;
  readonly isolateBootstrap?: IsolateBootstrapOptions;
}

export async function launchClaudeForProfile(
  context: AppContext,
  options: LaunchProfileOptions = {},
): Promise<void> {
  const profiles = await listProfiles(context.runtime.profileStore);
  const profile = options.requestedProfileId
    ? await resolveProfile(context.runtime.profileStore, options.requestedProfileId)
    : await chooseProfile(profiles);
  const useIsolate = profile.kind === "overlay"
    ? options.isolate ?? true
    : false;
  const isolateLaunch = useIsolate
    ? await resolveIsolateLaunch(
        context,
        profile,
        options.isolateBootstrap,
        options.claudeArgs,
      )
    : undefined;
  const token = await resolveToken(context, profile);
  const subprocessEnvScrubOverride = await maybeResolvePermissionModeOverride(
    context,
    profile,
    options.claudeArgs,
  );
  if (subprocessEnvScrubOverride === "exit") {
    outro(text.misc.noChangesMade);
    return;
  }

  if (!useIsolate && profile.kind === "overlay") {
    await maybeBridgeIsolateSessionBackToHost(context, profile, options.claudeArgs);
  }

  if (isolateLaunch?.continuityWarning) {
    context.process.stderr.write(`${isolateLaunch.continuityWarning}\n`);
  }

  const plan = buildLaunchPlan({
    profile,
    binary: context.runtime.resolveClaudeBinary(),
    cwd: context.process.cwd(),
    parentEnv: context.process.env,
    token: token ?? undefined,
    explicitArgs: resolveIsolateLaunchArgs(
      options.claudeArgs,
      isolateLaunch?.continuityImport?.sessionId,
    ),
    envOverrides: isolateLaunch?.claudeHomeDir
      ? {
          CLAUDE_CONFIG_DIR: isolateLaunch.claudeHomeDir,
        }
      : undefined,
    subprocessEnvScrubOverride,
  });

  intro(text.misc.ccoPrefix(profile.id));

  const exitCode = await spawnClaudeInteractive(plan);

  if (profile.kind === "overlay") {
    await touchOverlayProfile(context, profile);
  }

  if (exitCode !== 0) {
    context.process.exitCode = exitCode;
  }

  outro(text.misc.claudeExited);
}

async function chooseProfile(profiles: readonly Profile[]): Promise<Profile> {
  if (profiles.length === 1) {
    return profiles[0]!;
  }

  const selectedId = await promptForProfile(profiles);
  return profiles.find((profile) => profile.id === selectedId)!;
}

async function resolveToken(
  context: AppContext,
  profile: Profile,
): Promise<string | null> {
  if (profile.kind === "host") {
    return null;
  }

  const token = await context.runtime.tokenStore.get(profile.id);
  if (!token) {
    throw new DomainError(
      "TOKEN_NOT_FOUND",
      `Profile "${profile.id}" does not have a stored token. Run "cco auth add ${profile.id}".`,
      { profileId: profile.id },
    );
  }

  return token;
}

async function resolveIsolateLaunch(
  context: AppContext,
  profile: Profile,
  bootstrap: IsolateBootstrapOptions | undefined,
  claudeArgs: readonly string[] | undefined,
): Promise<EnsureIsolateHomeReadyResult> {
  if (profile.kind !== "overlay") {
    throw new DomainError(
      "ISOLATE_OVERLAY_ONLY",
      "Isolate mode currently supports saved profiles only.",
      { profileId: profile.id },
    );
  }

  return await ensureIsolateHomeReady({
    context,
    profile,
    bootstrap: {
      ...bootstrap,
      importLatestHostSessionOnNativeContinue:
        bootstrap?.importLatestHostSession !== true &&
        requestsNativeContinueWithoutExplicitResume(claudeArgs),
    },
  });
}

function requestsNativeContinueWithoutExplicitResume(
  claudeArgs: readonly string[] | undefined,
): boolean {
  const args = claudeArgs ?? [];
  if (
    args.some((arg) => arg === "--resume" || arg.startsWith("--resume="))
  ) {
    return false;
  }

  return args.some((arg) => arg === "-c" || arg === "--continue");
}

async function touchOverlayProfile(
  context: AppContext,
  profile: OverlayProfile,
): Promise<void> {
  const now = context.runtime.now().toISOString();
  const latest = await context.runtime.profileStore.get(profile.id);
  const nextProfile = latest ?? profile;
  await context.runtime.profileStore.put({
    ...nextProfile,
    updatedAt: now,
    lastUsedAt: now,
  });
}

async function maybeResolvePermissionModeOverride(
  context: AppContext,
  profile: Profile,
  claudeArgs: readonly string[] | undefined,
): Promise<SubprocessEnvScrubMode | "exit" | undefined> {
  if (profile.kind !== "overlay") {
    return undefined;
  }

  if (!requestsBypassPermissions(claudeArgs)) {
    return undefined;
  }

  if (resolveSubprocessEnvScrubMode(profile) === "0") {
    return undefined;
  }

  const shellScrubMode = resolveShellSubprocessEnvScrubMode(context.process.env);
  if (shellScrubMode) {
    await renderInkHost(
      React.createElement(PermissionModeDecisionInkScreen, {
        mode: shellScrubMode === "0" ? "compat" : "safe",
        locale: context.runtime.locale,
      }),
      {
        stdin: context.process.stdin,
        stdout: context.process.stdout,
        stderr: context.process.stderr,
      },
    );
    context.process.stdout.write("\n");
    return shellScrubMode;
  }

  if (!context.process.stdin.isTTY || !context.process.stdout.isTTY) {
    throw new DomainError(
      "SUBPROCESS_ENV_SCRUB_REQUIRED",
      text.errors.subprocessEnvScrubRequiredTitle,
      {
        profileId: profile.id,
        profilesFile: context.runtime.paths.profilesFile,
      },
    );
  }

  await renderInkHost(
    React.createElement(PermissionModeWarningInkScreen, {
      profileId: profile.id,
      locale: context.runtime.locale,
    }),
    {
      stdin: context.process.stdin,
      stdout: context.process.stdout,
      stderr: context.process.stderr,
    },
  );
  context.process.stdout.write("\n");

  const choice = await promptForPermissionModeOverride(profile.id);
  if (choice === "guide") {
    await renderInkHost(
      React.createElement(PermissionModeGuidanceInkScreen, {
        profileId: profile.id,
        locale: context.runtime.locale,
      }),
      {
        stdin: context.process.stdin,
        stdout: context.process.stdout,
        stderr: context.process.stderr,
      },
    );
    context.process.stdout.write("\n");
    return "exit";
  }

  await renderInkHost(
    React.createElement(PermissionModeDecisionInkScreen, {
      mode: choice === "compat" ? "compat" : "safe",
      locale: context.runtime.locale,
    }),
    {
      stdin: context.process.stdin,
      stdout: context.process.stdout,
      stderr: context.process.stderr,
    },
  );
  context.process.stdout.write("\n");

  return choice === "compat" ? "0" : "1";
}

async function maybeBridgeIsolateSessionBackToHost(
  context: AppContext,
  profile: OverlayProfile,
  claudeArgs: readonly string[] | undefined,
): Promise<void> {
  if (!requestsNativeContinueWithoutExplicitResume(claudeArgs)) {
    return;
  }

  const isolateConfigDir = profile.isolate?.homeDir;
  if (!isolateConfigDir) {
    return;
  }

  const isolateLatest = await findLatestClaudeProjectSession(
    isolateConfigDir,
    context.process.cwd(),
  );
  if (!isolateLatest) {
    return;
  }

  const hostConfigDir = resolveHostClaudeConfigDir(context.process.env);
  const hostLatest = await findLatestClaudeProjectSession(
    hostConfigDir,
    context.process.cwd(),
  );
  if (hostLatest && hostLatest.updatedAt >= isolateLatest.updatedAt) {
    return;
  }

  const importedAt = context.runtime.now().toISOString();
  await importClaudeProjectSession({
    isolateConfigDir: hostConfigDir,
    importedAt,
    session: isolateLatest,
  });

  const latestProfile = await context.runtime.profileStore.get(profile.id);
  if (!latestProfile?.isolate) {
    return;
  }

  await context.runtime.profileStore.put({
    ...latestProfile,
    updatedAt: importedAt,
    isolate: {
      ...latestProfile.isolate,
      lastSyncedAt: importedAt,
      continuity: {
        importedSessionId: isolateLatest.sessionId,
        projectKey: isolateLatest.projectKey,
        importedAt,
      },
    },
  });
}
