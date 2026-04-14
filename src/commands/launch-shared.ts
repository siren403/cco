import { intro, outro } from "@clack/prompts";
import type { AppContext } from "../context.ts";
import { buildLaunchPlan } from "../core/services/build-launch-plan.ts";
import { listProfiles } from "../core/services/list-profiles.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { ensureSessionBinding } from "../core/services/session-binding.ts";
import type { OverlayProfile, Profile } from "../core/model/profile.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { projectKey } from "../infra/fs/path-utils.ts";
import { acquireSessionLock } from "../infra/fs/session-lock.ts";
import { spawnClaudeInteractive } from "../infra/bun/spawn-claude.ts";
import { promptForProfile } from "../ui/prompts/profile-picker.ts";

export interface LaunchProfileOptions {
  readonly requestedProfileId?: string;
  readonly fresh?: boolean;
}

export async function launchClaudeForProfile(
  context: AppContext,
  options: LaunchProfileOptions = {},
): Promise<void> {
  const profiles = await listProfiles(context.runtime.profileStore);
  const profile = options.requestedProfileId
    ? await resolveProfile(context.runtime.profileStore, options.requestedProfileId)
    : await chooseProfile(profiles);

  const token = await resolveToken(context, profile);
  const key = projectKey(context.process.cwd());
  const now = context.runtime.now().toISOString();
  const sessionLock = await acquireSessionLock({
    locksDir: context.runtime.paths.locksDir,
    pid: context.process.pid,
    projectKey: key,
    profileId: profile.id,
    now,
  });

  try {
    const session = await ensureSessionBinding({
      store: context.runtime.sessionStore,
      projectKey: key,
      profileId: profile.id,
      now,
      fresh: options.fresh,
    });

    const plan = buildLaunchPlan({
      profile,
      binary: context.runtime.resolveClaudeBinary(),
      cwd: context.process.cwd(),
      parentEnv: context.process.env,
      token: token ?? undefined,
      fresh: options.fresh,
      sessionId: session.mode === "new" ? session.binding.sessionId : undefined,
      resumeSessionId:
        session.mode === "resume" ? session.binding.sessionId : undefined,
    });

    intro(`cco ${profile.id}`);

    const exitCode = await spawnClaudeInteractive(plan);

    if (profile.kind === "overlay") {
      await touchOverlayProfile(context, profile);
    }

    if (exitCode !== 0) {
      context.process.exitCode = exitCode;
    }

    outro(
      session.mode === "resume"
        ? `Claude exited. Resumed session: ${session.binding.sessionId}`
        : `Claude exited. New session: ${session.binding.sessionId}`,
    );
  } finally {
    await sessionLock.release();
  }
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
