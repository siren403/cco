import { cp, mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AppContext } from "../../context.ts";
import { DomainError } from "../errors/domain-error.ts";
import type { OverlayProfile } from "../model/profile.ts";
import {
  resolvePhysicalHostClaudeConfigDir,
  resolveIsolateProfilePaths,
} from "../../infra/fs/path-utils.ts";
import { promptForIsolateBootstrapMode, type IsolateBootstrapMode } from "../../ui/prompts/isolate-bootstrap-mode.ts";
import { renderIsolateBootstrapPage } from "../../ui/views/isolate-bootstrap-page.ts";

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
  readonly ansiColor: boolean;
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
): Promise<string> {
  const { context, profile, ansiColor } = input;
  const isolatePaths = resolveIsolateProfilePaths(context.runtime.paths, profile.id);
  const sourceConfigDir = resolvePhysicalHostClaudeConfigDir(context.process.env);
  const renderOptions = { ansiColor, locale: context.runtime.locale } as const;

  if (await hasPreparedIsolateHome(isolatePaths.claudeHomeDir, isolatePaths.manifestFile)) {
    await persistIsolateMetadata(context, profile, isolatePaths.claudeHomeDir, isolatePaths.manifestFile, sourceConfigDir);
    return isolatePaths.claudeHomeDir;
  }

  if (!context.process.stdin.isTTY || !context.process.stdout.isTTY) {
    throw new DomainError(
      "ISOLATE_SETUP_REQUIRED",
      "The isolate home is not ready yet.",
      { profileId: profile.id },
    );
  }

  await mkdir(isolatePaths.root, { recursive: true });

  return await withIsolateLock(isolatePaths.root, async () => {
    if (await hasPreparedIsolateHome(isolatePaths.claudeHomeDir, isolatePaths.manifestFile)) {
      await persistIsolateMetadata(context, profile, isolatePaths.claudeHomeDir, isolatePaths.manifestFile, sourceConfigDir);
      return isolatePaths.claudeHomeDir;
    }

    context.process.stdout.write(
      `${renderIsolateBootstrapPage(isolatePaths.claudeHomeDir, renderOptions)}\n\n`,
    );

    const seedMode = await promptForIsolateBootstrapMode(profile.id);
    await mkdir(isolatePaths.claudeHomeDir, { recursive: true });

    if (
      seedMode === "import-host" &&
      await isDirectoryEmpty(isolatePaths.claudeHomeDir)
    ) {
      await copyHostLiteSeed(sourceConfigDir, isolatePaths.claudeHomeDir);
    }

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
    );

    return isolatePaths.claudeHomeDir;
  });
}

async function persistIsolateMetadata(
  context: AppContext,
  profile: OverlayProfile,
  claudeHomeDir: string,
  manifestFile: string,
  sourceConfigDir: string,
  seededAt?: string,
): Promise<void> {
  if (profile.isolate) {
    return;
  }

  const now = context.runtime.now().toISOString();
  await context.runtime.profileStore.put({
    ...profile,
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
      lastSeededAt: seededAt,
      lastSyncedAt: seededAt,
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

async function copyHostLiteSeed(
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

    await cp(sourcePath, join(targetDir, entry), {
      force: false,
      recursive: true,
      dereference: true,
    });
  }
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
