import { cp, mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AppContext } from "../../context.ts";
import { DomainError } from "../errors/domain-error.ts";
import type { OverlayProfile } from "../model/profile.ts";
import {
  resolvePhysicalHostClaudeConfigDir,
  resolveTeamsProfilePaths,
} from "../../infra/fs/path-utils.ts";
import { promptForTeamsBootstrapMode, type TeamsBootstrapMode } from "../../ui/prompts/teams-bootstrap-mode.ts";
import { renderTeamsBootstrapPage } from "../../ui/views/teams-bootstrap-page.ts";

interface TeamsManifest {
  readonly schemaVersion: 1;
  readonly profileId: string;
  readonly seedMode: TeamsBootstrapMode;
  readonly sourceConfigDir: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface EnsureTeamsHomeReadyInput {
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

export async function ensureTeamsHomeReady(
  input: EnsureTeamsHomeReadyInput,
): Promise<string> {
  const { context, profile, ansiColor } = input;
  const teamsPaths = resolveTeamsProfilePaths(context.runtime.paths, profile.id);
  const sourceConfigDir = resolvePhysicalHostClaudeConfigDir(context.process.env);
  const renderOptions = { ansiColor, locale: context.runtime.locale } as const;

  if (await hasPreparedTeamsHome(teamsPaths.claudeHomeDir, teamsPaths.manifestFile)) {
    await persistTeamsMetadata(context, profile, teamsPaths.claudeHomeDir, teamsPaths.manifestFile, sourceConfigDir);
    return teamsPaths.claudeHomeDir;
  }

  if (!context.process.stdin.isTTY || !context.process.stdout.isTTY) {
    throw new DomainError(
      "TEAMS_SETUP_REQUIRED",
      "The isolate home is not ready yet.",
      { profileId: profile.id },
    );
  }

  await mkdir(teamsPaths.root, { recursive: true });

  return await withTeamsLock(teamsPaths.root, async () => {
    if (await hasPreparedTeamsHome(teamsPaths.claudeHomeDir, teamsPaths.manifestFile)) {
      await persistTeamsMetadata(context, profile, teamsPaths.claudeHomeDir, teamsPaths.manifestFile, sourceConfigDir);
      return teamsPaths.claudeHomeDir;
    }

    context.process.stdout.write(
      `${renderTeamsBootstrapPage(teamsPaths.claudeHomeDir, renderOptions)}\n\n`,
    );

    const seedMode = await promptForTeamsBootstrapMode(profile.id);
    await mkdir(teamsPaths.claudeHomeDir, { recursive: true });

    if (
      seedMode === "import-host" &&
      await isDirectoryEmpty(teamsPaths.claudeHomeDir)
    ) {
      await copyHostLiteSeed(sourceConfigDir, teamsPaths.claudeHomeDir);
    }

    const manifest = buildManifest(
      profile.id,
      seedMode,
      sourceConfigDir,
      context.runtime.now().toISOString(),
    );
    await writeManifest(teamsPaths.manifestFile, manifest);
    await persistTeamsMetadata(
      context,
      profile,
      teamsPaths.claudeHomeDir,
      teamsPaths.manifestFile,
      sourceConfigDir,
      manifest.createdAt,
    );

    return teamsPaths.claudeHomeDir;
  });
}

async function persistTeamsMetadata(
  context: AppContext,
  profile: OverlayProfile,
  claudeHomeDir: string,
  manifestFile: string,
  sourceConfigDir: string,
  seededAt?: string,
): Promise<void> {
  if (profile.teams) {
    return;
  }

  const now = context.runtime.now().toISOString();
  await context.runtime.profileStore.put({
    ...profile,
    updatedAt: now,
    teams: {
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
  seedMode: TeamsBootstrapMode,
  sourceConfigDir: string,
  timestamp: string,
): TeamsManifest {
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
  manifest: TeamsManifest,
): Promise<void> {
  const tempFile = `${manifestFile}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempFile, JSON.stringify(manifest, null, 2), "utf8");
  await rename(tempFile, manifestFile);
}

async function hasPreparedTeamsHome(
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

async function withTeamsLock<T>(
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
        throw new Error(`Timed out waiting for teams bootstrap lock at ${lockPath}.`);
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
