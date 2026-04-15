import { readFile, rm, stat } from "node:fs/promises";
import type { AppContext } from "../../context.ts";
import { resolveTeamsProfilePaths } from "../../infra/fs/path-utils.ts";
import type { OverlayProfile } from "../model/profile.ts";

export type TeamsSeedMode = "import-host" | "clean";
export type TeamsHomeHealth = "ready" | "missing" | "broken";

export interface TeamsManifest {
  readonly schemaVersion: 1;
  readonly profileId: string;
  readonly seedMode: TeamsSeedMode;
  readonly sourceConfigDir: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TeamsHomeStatus {
  readonly profileId: string;
  readonly root: string;
  readonly homeDir: string;
  readonly manifestFile: string;
  readonly health: TeamsHomeHealth;
  readonly homeExists: boolean;
  readonly manifestExists: boolean;
  readonly metadataExists: boolean;
  readonly metadataState?: string;
  readonly manifest?: TeamsManifest;
}

export interface RemoveTeamsHomeResult {
  readonly changed: boolean;
  readonly homeRemoved: boolean;
  readonly metadataCleared: boolean;
  readonly root: string;
}

export async function inspectTeamsHome(
  context: AppContext,
  profile: OverlayProfile,
): Promise<TeamsHomeStatus> {
  const paths = resolveTeamsProfilePaths(context.runtime.paths, profile.id);
  const homeExists = await pathExists(paths.claudeHomeDir);
  const manifestExists = await pathExists(paths.manifestFile);
  const manifest = manifestExists ? await readManifest(paths.manifestFile) : undefined;
  const metadataExists = profile.teams != null;

  return {
    profileId: profile.id,
    root: paths.root,
    homeDir: paths.claudeHomeDir,
    manifestFile: paths.manifestFile,
    health: resolveHealth(homeExists, manifestExists, metadataExists, manifest),
    homeExists,
    manifestExists,
    metadataExists,
    metadataState: profile.teams?.state,
    manifest,
  };
}

export async function removeTeamsHome(
  context: AppContext,
  profile: OverlayProfile,
): Promise<RemoveTeamsHomeResult> {
  const paths = resolveTeamsProfilePaths(context.runtime.paths, profile.id);
  const rootExists = await pathExists(paths.root);

  if (rootExists) {
    await rm(paths.root, { recursive: true, force: true });
  }

  let metadataCleared = false;
  if (profile.teams) {
    metadataCleared = true;
    await context.runtime.profileStore.put({
      ...profile,
      updatedAt: context.runtime.now().toISOString(),
      teams: undefined,
    });
  }

  return {
    changed: rootExists || metadataCleared,
    homeRemoved: rootExists,
    metadataCleared,
    root: paths.root,
  };
}

function resolveHealth(
  homeExists: boolean,
  manifestExists: boolean,
  metadataExists: boolean,
  manifest?: TeamsManifest,
): TeamsHomeHealth {
  if (!homeExists && !manifestExists && !metadataExists) {
    return "missing";
  }

  if (homeExists && manifestExists && metadataExists && manifest) {
    return "ready";
  }

  return "broken";
}

async function readManifest(filePath: string): Promise<TeamsManifest | undefined> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<TeamsManifest>;
    if (
      parsed.schemaVersion !== 1 ||
      typeof parsed.profileId !== "string" ||
      (parsed.seedMode !== "import-host" && parsed.seedMode !== "clean") ||
      typeof parsed.sourceConfigDir !== "string" ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.updatedAt !== "string"
    ) {
      return undefined;
    }

    return {
      schemaVersion: 1,
      profileId: parsed.profileId,
      seedMode: parsed.seedMode,
      sourceConfigDir: parsed.sourceConfigDir,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return undefined;
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
