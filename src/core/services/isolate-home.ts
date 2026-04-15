import { readFile, rm, stat } from "node:fs/promises";
import type { AppContext } from "../../context.ts";
import { resolveIsolateProfilePaths } from "../../infra/fs/path-utils.ts";
import type { OverlayProfile } from "../model/profile.ts";

export type IsolateSeedMode = "import-host" | "clean";
export type IsolateHomeHealth = "ready" | "missing" | "broken";

export interface IsolateManifest {
  readonly schemaVersion: 1;
  readonly profileId: string;
  readonly seedMode: IsolateSeedMode;
  readonly sourceConfigDir: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface IsolateHomeStatus {
  readonly profileId: string;
  readonly root: string;
  readonly homeDir: string;
  readonly manifestFile: string;
  readonly health: IsolateHomeHealth;
  readonly homeExists: boolean;
  readonly manifestExists: boolean;
  readonly metadataExists: boolean;
  readonly metadataState?: string;
  readonly manifest?: IsolateManifest;
}

export interface RemoveIsolateHomeResult {
  readonly changed: boolean;
  readonly homeRemoved: boolean;
  readonly metadataCleared: boolean;
  readonly root: string;
}

export async function inspectIsolateHome(
  context: AppContext,
  profile: OverlayProfile,
): Promise<IsolateHomeStatus> {
  const paths = resolveIsolateProfilePaths(context.runtime.paths, profile.id);
  const homeExists = await pathExists(paths.claudeHomeDir);
  const manifestExists = await pathExists(paths.manifestFile);
  const manifest = manifestExists ? await readManifest(paths.manifestFile) : undefined;
  const metadataExists = profile.isolate != null;

  return {
    profileId: profile.id,
    root: paths.root,
    homeDir: paths.claudeHomeDir,
    manifestFile: paths.manifestFile,
    health: resolveHealth(homeExists, manifestExists, metadataExists, manifest),
    homeExists,
    manifestExists,
    metadataExists,
    metadataState: profile.isolate?.state,
    manifest,
  };
}

export async function removeIsolateHome(
  context: AppContext,
  profile: OverlayProfile,
): Promise<RemoveIsolateHomeResult> {
  const paths = resolveIsolateProfilePaths(context.runtime.paths, profile.id);
  const rootExists = await pathExists(paths.root);

  if (rootExists) {
    await rm(paths.root, { recursive: true, force: true });
  }

  let metadataCleared = false;
  if (profile.isolate) {
    metadataCleared = true;
    await context.runtime.profileStore.put({
      ...profile,
      updatedAt: context.runtime.now().toISOString(),
      isolate: undefined,
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
  manifest?: IsolateManifest,
): IsolateHomeHealth {
  if (!homeExists && !manifestExists && !metadataExists) {
    return "missing";
  }

  if (homeExists && manifestExists && metadataExists && manifest) {
    return "ready";
  }

  return "broken";
}

async function readManifest(filePath: string): Promise<IsolateManifest | undefined> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<IsolateManifest>;
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
