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
  resolveProfileAuthKind,
  resolveSubprocessEnvScrubMode,
  type OverlayProfile,
  type OverlayProviderConfig,
  type Profile,
  type SubprocessEnvScrubMode,
} from "../core/model/profile.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import {
  findLatestClaudeProjectSession,
  importClaudeProjectSession,
} from "../core/services/isolate-session-continuity.ts";
import { buildProviderEnvOverrides } from "../core/services/provider-env.ts";
import { resolveProviderModelArgs } from "../core/services/provider-model-args.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { resolveHostClaudeConfigDir } from "../infra/fs/path-utils.ts";
import { spawnClaudeInteractive } from "../infra/bun/spawn-claude.ts";
import { promptForProfile } from "../ui/prompts/profile-picker.ts";

const text = getStaticUiText();

export interface LaunchProfileOptions {
  readonly requestedProfileId?: string;
  readonly claudeArgs?: readonly string[];
  readonly isolate?: boolean;
  readonly isolateBootstrap?: IsolateBootstrapOptions;
  readonly envCompat?: boolean;
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
  const subprocessEnvScrubOverride = options.envCompat === true
    ? "0"
    : await maybeResolvePermissionModeOverride(context, profile, options.claudeArgs);

  if (!useIsolate && profile.kind === "overlay") {
    await maybeBridgeIsolateSessionBackToHost(context, profile, options.claudeArgs);
  }

  if (isolateLaunch?.continuityWarning) {
    context.process.stderr.write(`${isolateLaunch.continuityWarning}\n`);
  }

  const isolateArgs = resolveIsolateLaunchArgs(
    options.claudeArgs,
    isolateLaunch?.continuityImport?.sessionId,
  );
  const isolateHomeOverride = isolateLaunch?.claudeHomeDir
    ? { CLAUDE_CONFIG_DIR: isolateLaunch.claudeHomeDir }
    : undefined;
  const providerConfig = resolveProviderConfig(profile);

  const plan = buildLaunchPlan({
    profile,
    binary: context.runtime.resolveClaudeBinary(),
    cwd: context.process.cwd(),
    parentEnv: context.process.env,
    token: providerConfig ? undefined : token ?? undefined,
    explicitArgs: providerConfig
      ? resolveProviderModelArgs(isolateArgs ?? [], providerConfig.model)
      : isolateArgs,
    envOverrides: providerConfig
      ? { ...buildProviderEnvOverrides(providerConfig, token!), ...isolateHomeOverride }
      : isolateHomeOverride,
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

function resolveProviderConfig(profile: Profile): OverlayProviderConfig | undefined {
  if (profile.kind !== "overlay" || resolveProfileAuthKind(profile) !== "provider") {
    return undefined;
  }

  return profile.provider;
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
): Promise<SubprocessEnvScrubMode | undefined> {
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
    return shellScrubMode;
  }

  return "0";
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
