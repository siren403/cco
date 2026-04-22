import React from "react";
import {
  link as createHardLink,
  lstat,
  mkdir,
  readdir,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import type { AppContext } from "../../context.ts";
import {
  resolvePhysicalHostClaudeConfigDir,
  resolveIsolateProfilePaths,
} from "../../infra/fs/path-utils.ts";
import { getUiText } from "../../i18n/index.ts";
import { renderInkHost } from "../../ui/ink/render-ink.ts";
import { IsolateBootstrapInkScreen } from "../../ui/ink/isolate-bootstrap-ink-screen.ts";
import type {
  IsolateSessionContinuityMetadata,
  OverlayProfile,
} from "../model/profile.ts";
import {
  ensureLinkedClaudeProjectSessionStore,
  findLatestClaudeProjectSession,
  type ImportClaudeProjectSessionResult,
} from "./isolate-session-continuity.ts";

interface IsolateManifest {
  readonly schemaVersion: 1;
  readonly profileId: string;
  readonly seedMode: IsolateBootstrapMode;
  readonly sourceConfigDir: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface EnsureIsolateHomeReadyInput {
  readonly context: AppContext;
  readonly profile: OverlayProfile;
  readonly bootstrap?: IsolateBootstrapOptions;
}

export interface EnsureIsolateHomeReadyResult {
  readonly claudeHomeDir: string;
  readonly continuityImport?: ImportClaudeProjectSessionResult;
  readonly continuityWarning?: string;
}

export type IsolateBootstrapMode = "import-host" | "clean";

export interface IsolateBootstrapOptions {
  readonly seedMode?: IsolateBootstrapMode;
  readonly importLatestHostSession?: boolean;
  readonly importLatestHostSessionOnNativeContinue?: boolean;
}

const HOST_LITE_ENTRIES = [
  "settings.json",
  "settings.local.json",
  "mcp.json",
  "mcp.local.json",
  "plugins",
  "skills",
  "hooks",
  "commands",
  "statusline.sh",
  "statusline.ps1",
  "statusline.cmd",
  "statusline.bat",
] as const;

const LOCK_WAIT_MS = 25;
const LOCK_TIMEOUT_MS = 5_000;
const STALE_LOCK_MS = 15_000;

export async function ensureIsolateHomeReady(
  input: EnsureIsolateHomeReadyInput,
): Promise<EnsureIsolateHomeReadyResult> {
  const { context, profile } = input;
  const bootstrap = input.bootstrap ?? {};
  const isolatePaths = resolveIsolateProfilePaths(context.runtime.paths, profile.id);
  const sourceConfigDir = resolvePhysicalHostClaudeConfigDir(context.process.env);

  if (await hasPreparedIsolateHome(isolatePaths.claudeHomeDir, isolatePaths.manifestFile)) {
    const continuity = await maybeBridgeHostSessionContinuity({
      context,
      profile,
      sourceConfigDir,
      isolateConfigDir: isolatePaths.claudeHomeDir,
      forceImport: bootstrap.importLatestHostSession === true,
      importOnNativeContinue:
        bootstrap.importLatestHostSessionOnNativeContinue === true,
    });
    await persistIsolateMetadata(
      context,
      profile,
      isolatePaths.claudeHomeDir,
      isolatePaths.manifestFile,
      sourceConfigDir,
      undefined,
      continuity.continuityImport
        ? toIsolateContinuityMetadata(continuity.continuityImport)
        : undefined,
    );
    return {
      claudeHomeDir: isolatePaths.claudeHomeDir,
      continuityImport: continuity.continuityImport,
      continuityWarning: continuity.warningMessage,
    };
  }

  await mkdir(isolatePaths.root, { recursive: true });

  return await withIsolateLock(isolatePaths.root, async () => {
    if (await hasPreparedIsolateHome(isolatePaths.claudeHomeDir, isolatePaths.manifestFile)) {
      const continuity = await maybeBridgeHostSessionContinuity({
        context,
        profile,
        sourceConfigDir,
        isolateConfigDir: isolatePaths.claudeHomeDir,
        forceImport: bootstrap.importLatestHostSession === true,
        importOnNativeContinue:
          bootstrap.importLatestHostSessionOnNativeContinue === true,
      });
      await persistIsolateMetadata(
        context,
        profile,
        isolatePaths.claudeHomeDir,
        isolatePaths.manifestFile,
        sourceConfigDir,
        undefined,
        continuity.continuityImport
          ? toIsolateContinuityMetadata(continuity.continuityImport)
          : undefined,
      );
      return {
        claudeHomeDir: isolatePaths.claudeHomeDir,
        continuityImport: continuity.continuityImport,
        continuityWarning: continuity.warningMessage,
      };
    }

    await renderInkHost(
      React.createElement(IsolateBootstrapInkScreen, {
        claudeHomeDir: isolatePaths.claudeHomeDir,
        seedMode: bootstrap.seedMode ?? "import-host",
        importLatestHostSession: bootstrap.importLatestHostSession === true,
        locale: context.runtime.locale,
      }),
      {
        stdin: context.process.stdin,
        stdout: context.process.stdout,
        stderr: context.process.stderr,
      },
    );
    context.process.stdout.write("\n");

    const seedMode = bootstrap.seedMode ?? "import-host";
    await mkdir(isolatePaths.claudeHomeDir, { recursive: true });
    let continuityImport: ImportClaudeProjectSessionResult | undefined;
    let continuityWarning: string | undefined;

    if (
      seedMode === "import-host" &&
      await isDirectoryEmpty(isolatePaths.claudeHomeDir)
    ) {
      await linkHostLiteSeed(sourceConfigDir, isolatePaths.claudeHomeDir);
    }

    const continuity = await maybeBridgeHostSessionContinuity({
      context,
      profile,
      sourceConfigDir,
      isolateConfigDir: isolatePaths.claudeHomeDir,
      forceImport: bootstrap.importLatestHostSession === true,
      importOnNativeContinue:
        bootstrap.importLatestHostSessionOnNativeContinue === true,
    });
    continuityImport = continuity.continuityImport;
    continuityWarning = continuity.warningMessage;

    const manifest = buildManifest(
      profile.id,
      seedMode,
      sourceConfigDir,
      context.runtime.now().toISOString(),
    );
    await writeManifest(isolatePaths.manifestFile, manifest);
    await persistIsolateMetadata(
      context,
      profile,
      isolatePaths.claudeHomeDir,
      isolatePaths.manifestFile,
      sourceConfigDir,
      manifest.createdAt,
      continuityImport
        ? toIsolateContinuityMetadata(continuityImport)
        : undefined,
    );

    return {
      claudeHomeDir: isolatePaths.claudeHomeDir,
      continuityImport,
      continuityWarning,
    };
  });
}

async function persistIsolateMetadata(
  context: AppContext,
  profile: OverlayProfile,
  claudeHomeDir: string,
  manifestFile: string,
  sourceConfigDir: string,
  seededAt?: string,
  continuity?: IsolateSessionContinuityMetadata,
): Promise<void> {
  const now = context.runtime.now().toISOString();
  const latest = await context.runtime.profileStore.get(profile.id);
  const baseProfile = latest ?? profile;
  const existingIsolate = baseProfile.isolate;
  await context.runtime.profileStore.put({
    ...baseProfile,
    updatedAt: now,
    isolate: {
      enabled: true,
      homeDir: claudeHomeDir,
      state: "ready",
      seedPreset: "host-lite",
      source: {
        kind: "overlay",
        profileId: profile.id,
        configDir: sourceConfigDir,
      },
      manifestPath: manifestFile,
      lastSeededAt: seededAt ?? existingIsolate?.lastSeededAt,
      lastSyncedAt:
        continuity?.importedAt ??
        seededAt ??
        existingIsolate?.lastSyncedAt,
      continuity: continuity ?? existingIsolate?.continuity,
    },
  });
}

function buildManifest(
  profileId: string,
  seedMode: IsolateBootstrapMode,
  sourceConfigDir: string,
  timestamp: string,
): IsolateManifest {
  return {
    schemaVersion: 1,
    profileId,
    seedMode,
    sourceConfigDir,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

async function writeManifest(
  manifestFile: string,
  manifest: IsolateManifest,
): Promise<void> {
  const tempFile = `${manifestFile}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempFile, JSON.stringify(manifest, null, 2), "utf8");
  await rename(tempFile, manifestFile);
}

async function hasPreparedIsolateHome(
  claudeHomeDir: string,
  manifestFile: string,
): Promise<boolean> {
  return (await pathExists(claudeHomeDir)) && (await pathExists(manifestFile));
}

async function linkHostLiteSeed(
  sourceDir: string,
  targetDir: string,
): Promise<void> {
  if (!await pathExists(sourceDir)) {
    return;
  }

  for (const entry of HOST_LITE_ENTRIES) {
    const sourcePath = join(sourceDir, entry);
    if (!await pathExists(sourcePath)) {
      continue;
    }

    await linkHostLiteEntry(sourcePath, join(targetDir, entry));
  }
}

async function linkHostLiteEntry(
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  if (await pathExists(targetPath)) {
    return;
  }

  const metadata = await lstat(sourcePath);
  if (metadata.isDirectory()) {
    await symlink(
      sourcePath,
      targetPath,
      process.platform === "win32" ? "junction" : "dir",
    );
    return;
  }

  try {
    await symlink(sourcePath, targetPath, "file");
  } catch (error) {
    const errno = (error as NodeJS.ErrnoException).code;
    if (
      errno !== "EPERM" &&
      errno !== "EEXIST" &&
      errno !== "EINVAL" &&
      errno !== "UNKNOWN"
    ) {
      throw error;
    }

    if (errno === "EEXIST") {
      return;
    }

    await createHardLink(sourcePath, targetPath);
  }
}

async function maybeImportHostSessionContinuity(input: {
  readonly context: AppContext;
  readonly profile: OverlayProfile;
  readonly sourceConfigDir: string;
  readonly isolateConfigDir: string;
}): Promise<{
  readonly continuityImport?: ImportClaudeProjectSessionResult;
  readonly warningMessage?: string;
}> {
  const { context, profile, sourceConfigDir } = input;
  const text = getUiText(context.runtime.locale);

  try {
    const latestSession = await findLatestClaudeProjectSession(
      sourceConfigDir,
      context.process.cwd(),
    );
    if (!latestSession) {
      return {
        warningMessage: text.misc.isolateContinuityMissingWarning(profile.id),
      };
    }

    return {
      continuityImport: {
        importedAt: context.runtime.now().toISOString(),
        projectKey: latestSession.projectKey,
        sessionId: latestSession.sessionId,
        sourceFile: latestSession.sessionFile,
        targetFile: latestSession.sessionFile,
      },
    };
  } catch (error) {
    return {
      warningMessage: text.misc.isolateContinuityImportWarning(profile.id),
    };
  }
}

async function maybeBridgeHostSessionContinuity(input: {
  readonly context: AppContext;
  readonly profile: OverlayProfile;
  readonly sourceConfigDir: string;
  readonly isolateConfigDir: string;
  readonly forceImport: boolean;
  readonly importOnNativeContinue: boolean;
}): Promise<{
  readonly continuityImport?: ImportClaudeProjectSessionResult;
  readonly warningMessage?: string;
}> {
  const {
    context,
    forceImport,
    importOnNativeContinue,
    isolateConfigDir,
  } = input;

  if (!forceImport && !importOnNativeContinue) {
    await ensureLinkedClaudeProjectSessionStore({
      hostConfigDir: input.sourceConfigDir,
      isolateConfigDir,
      cwd: context.process.cwd(),
    });
    return {};
  }

  await ensureLinkedClaudeProjectSessionStore({
    hostConfigDir: input.sourceConfigDir,
    isolateConfigDir,
    cwd: context.process.cwd(),
  });

  if (!forceImport && importOnNativeContinue) {
    return {};
  }

  return await maybeImportHostSessionContinuity(input);
}

function toIsolateContinuityMetadata(
  continuityImport: ImportClaudeProjectSessionResult,
): IsolateSessionContinuityMetadata {
  return {
    importedSessionId: continuityImport.sessionId,
    projectKey: continuityImport.projectKey,
    importedAt: continuityImport.importedAt,
  };
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function isDirectoryEmpty(path: string): Promise<boolean> {
  try {
    return (await readdir(path)).length === 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return true;
    }

    throw error;
  }
}

async function withIsolateLock<T>(
  root: string,
  work: () => Promise<T>,
): Promise<T> {
  const lockPath = join(root, ".bootstrap.lock");
  await acquireLock(lockPath);

  try {
    return await work();
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

async function acquireLock(lockPath: string): Promise<void> {
  const deadline = Date.now() + LOCK_TIMEOUT_MS;

  while (true) {
    try {
      await mkdir(lockPath);
      return;
    } catch (error) {
      const errno = error as NodeJS.ErrnoException;
      if (errno.code !== "EEXIST") {
        throw error;
      }

      await clearStaleLock(lockPath);

      if (Date.now() >= deadline) {
        throw new Error(`Timed out waiting for isolate bootstrap lock at ${lockPath}.`);
      }

      await sleep(LOCK_WAIT_MS);
    }
  }
}

async function clearStaleLock(lockPath: string): Promise<void> {
  try {
    const metadata = await stat(lockPath);
    if (Date.now() - metadata.mtimeMs >= STALE_LOCK_MS) {
      await rm(lockPath, { recursive: true, force: true });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
