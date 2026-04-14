import { intro, outro } from "@clack/prompts";
import type { AppContext } from "../context.ts";
import { buildLaunchPlan } from "../core/services/build-launch-plan.ts";
import { listProfiles } from "../core/services/list-profiles.ts";
import { requestsBypassPermissions } from "../core/services/permission-mode.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import {
  resolveSubprocessEnvScrubMode,
  type OverlayProfile,
  type Profile,
  type SubprocessEnvScrubMode,
} from "../core/model/profile.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { spawnClaudeInteractive } from "../infra/bun/spawn-claude.ts";
import { promptForProfile } from "../ui/prompts/profile-picker.ts";
import { promptForPermissionModeOverride } from "../ui/prompts/permission-mode-override.ts";
import { resolveAnsiColor } from "../ui/theme.ts";
import {
  renderPermissionModeDecision,
  renderPermissionModeWarning,
} from "../ui/views/permission-mode-page.ts";

const text = getStaticUiText();

export interface LaunchProfileOptions {
  readonly requestedProfileId?: string;
  readonly claudeArgs?: readonly string[];
}

export async function launchClaudeForProfile(
  context: AppContext,
  options: LaunchProfileOptions = {},
): Promise<void> {
  const ansiColor = resolveAnsiColor(context.process.stdout, context.process.env);
  const profiles = await listProfiles(context.runtime.profileStore);
  const profile = options.requestedProfileId
    ? await resolveProfile(context.runtime.profileStore, options.requestedProfileId)
    : await chooseProfile(profiles);

  const token = await resolveToken(context, profile);
  const subprocessEnvScrubOverride = await maybeResolvePermissionModeOverride(
    context,
    profile,
    options.claudeArgs,
    ansiColor,
  );
  const plan = buildLaunchPlan({
    profile,
    binary: context.runtime.resolveClaudeBinary(),
    cwd: context.process.cwd(),
    parentEnv: context.process.env,
    token: token ?? undefined,
    explicitArgs: options.claudeArgs,
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

async function touchOverlayProfile(
  context: AppContext,
  profile: OverlayProfile,
): Promise<void> {
  const now = context.runtime.now().toISOString();
  await context.runtime.profileStore.put({
    ...profile,
    updatedAt: now,
    lastUsedAt: now,
  });
}

async function maybeResolvePermissionModeOverride(
  context: AppContext,
  profile: Profile,
  claudeArgs: readonly string[] | undefined,
  ansiColor: boolean,
): Promise<SubprocessEnvScrubMode | undefined> {
  const renderOptions = { ansiColor, locale: context.runtime.locale } as const;
  if (profile.kind !== "overlay") {
    return undefined;
  }

  if (!requestsBypassPermissions(claudeArgs)) {
    return undefined;
  }

  if (resolveSubprocessEnvScrubMode(profile) === "0") {
    return undefined;
  }

  context.process.stdout.write(
    `${renderPermissionModeWarning(profile.id, renderOptions)}\n\n`,
  );

  const allowCompatMode = await promptForPermissionModeOverride(profile.id);

  context.process.stdout.write(
    `${renderPermissionModeDecision(
      allowCompatMode ? "compat" : "safe",
      renderOptions,
    )}\n\n`,
  );

  return allowCompatMode ? "0" : "1";
}
