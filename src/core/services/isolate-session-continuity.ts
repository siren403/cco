import type { Dirent } from "node:fs";
import {
  copyFile,
  cp,
  lstat,
  mkdir,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  symlink,
} from "node:fs/promises";
import { dirname, join } from "node:path";

const CLAUDE_PROJECTS_DIR = "projects";
const CLAUDE_PROJECT_KEY_MAX_LENGTH = 200;
const SESSION_FILE_SUFFIX = ".jsonl";
const PROMPT_HISTORY_FILE = "history.jsonl";

export interface ClaudeProjectSessionCandidate {
  readonly sessionId: string;
  readonly projectKey: string;
  readonly sessionFile: string;
  readonly updatedAt: string;
}

export interface ImportClaudeProjectSessionInput {
  readonly isolateConfigDir: string;
  readonly importedAt: string;
  readonly session: ClaudeProjectSessionCandidate;
}

export interface ImportClaudeProjectSessionResult {
  readonly importedAt: string;
  readonly projectKey: string;
  readonly sessionId: string;
  readonly sourceFile: string;
  readonly targetFile: string;
}

export interface LinkedClaudeProjectSessionStoreResult {
  readonly projectKey: string;
  readonly hostProjectDir: string;
  readonly isolateProjectDir: string;
}

export async function findLatestClaudeProjectSession(
  configDir: string,
  cwd: string,
): Promise<ClaudeProjectSessionCandidate | undefined> {
  const projectKey = await resolveClaudeProjectKey(cwd);
  const projectDir = join(configDir, CLAUDE_PROJECTS_DIR, projectKey);
  const sessions = await listClaudeProjectSessions(projectDir, projectKey);
  return sessions[0];
}

export async function importClaudeProjectSession(
  input: ImportClaudeProjectSessionInput,
): Promise<ImportClaudeProjectSessionResult> {
  const { isolateConfigDir, importedAt, session } = input;
  const targetDir = join(isolateConfigDir, CLAUDE_PROJECTS_DIR, session.projectKey);
  const targetFile = join(targetDir, `${session.sessionId}${SESSION_FILE_SUFFIX}`);

  await mkdir(targetDir, { recursive: true });
  await copyFile(session.sessionFile, targetFile);

  return {
    importedAt,
    projectKey: session.projectKey,
    sessionId: session.sessionId,
    sourceFile: session.sessionFile,
    targetFile,
  };
}

export async function ensureLinkedClaudeProjectSessionStore(input: {
  readonly hostConfigDir: string;
  readonly isolateConfigDir: string;
  readonly cwd: string;
}): Promise<LinkedClaudeProjectSessionStoreResult> {
  const projectKey = await resolveClaudeProjectKey(input.cwd);
  const hostProjectDir = join(input.hostConfigDir, CLAUDE_PROJECTS_DIR, projectKey);
  const isolateProjectDir = join(input.isolateConfigDir, CLAUDE_PROJECTS_DIR, projectKey);

  await mkdir(dirname(hostProjectDir), { recursive: true });
  await mkdir(dirname(isolateProjectDir), { recursive: true });
  await ensureLinkedDirectoryStore(hostProjectDir, isolateProjectDir);

  return {
    projectKey,
    hostProjectDir,
    isolateProjectDir,
  };
}

export async function resolveClaudeProjectKey(cwd: string): Promise<string> {
  const projectPath = await resolveProjectPath(cwd);
  return encodeClaudeProjectKey(projectPath);
}

export function encodeClaudeProjectKey(projectPath: string): string {
  const sanitized = projectPath.replace(/[^a-zA-Z0-9]/g, "-");
  if (sanitized.length <= CLAUDE_PROJECT_KEY_MAX_LENGTH) {
    return sanitized;
  }

  return `${sanitized.slice(0, CLAUDE_PROJECT_KEY_MAX_LENGTH)}-${hashProjectPath(projectPath)}`;
}

async function listClaudeProjectSessions(
  projectDir: string,
  projectKey: string,
): Promise<readonly ClaudeProjectSessionCandidate[]> {
  let entries: Dirent[];
  try {
    entries = await readdir(projectDir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }

  interface ResolvedSessionCandidate extends ClaudeProjectSessionCandidate {
    readonly updatedAtMs: number;
  }

  const sessions = await Promise.all(
    entries
      .filter((entry) =>
        entry.isFile() &&
        entry.name.endsWith(SESSION_FILE_SUFFIX) &&
        entry.name !== PROMPT_HISTORY_FILE
      )
      .map(async (entry) => {
        const sessionId = entry.name.slice(0, -SESSION_FILE_SUFFIX.length);
        if (!sessionId) {
          return null;
        }

        const sessionFile = join(projectDir, entry.name);
        const metadata = await stat(sessionFile);
        return {
          sessionId,
          projectKey,
          sessionFile,
          updatedAt: new Date(metadata.mtimeMs).toISOString(),
          updatedAtMs: metadata.mtimeMs,
        };
      }),
  );

  return sessions
    .filter((session): session is ResolvedSessionCandidate => session != null)
    .sort((left, right) =>
      right.updatedAtMs - left.updatedAtMs ||
      right.sessionId.localeCompare(left.sessionId),
    )
    .map(({ updatedAtMs: _updatedAtMs, ...session }) => session);
}

async function resolveProjectPath(cwd: string): Promise<string> {
  try {
    return await realpath(cwd);
  } catch {
    return cwd;
  }
}

function hashProjectPath(projectPath: string): string {
  let hash = 0;
  for (let index = 0; index < projectPath.length; index += 1) {
    hash = ((hash << 5) - hash + projectPath.charCodeAt(index)) | 0;
  }

  return Math.abs(hash).toString(36);
}

async function ensureLinkedDirectoryStore(
  sourceDir: string,
  targetDir: string,
): Promise<void> {
  if (await directoriesShareRealPath(sourceDir, targetDir)) {
    return;
  }

  const targetState = await readPathState(targetDir);
  const sourceState = await readPathState(sourceDir);

  if (!targetState.exists) {
    if (!sourceState.exists) {
      await mkdir(sourceDir, { recursive: true });
    }

    await createDirectoryLink(sourceDir, targetDir);
    return;
  }

  if (!sourceState.exists) {
    await moveOrCopyDirectory(targetDir, sourceDir);
    await createDirectoryLink(sourceDir, targetDir);
    return;
  }

  await mergeDirectoryContents(targetDir, sourceDir);
  await rm(targetDir, { recursive: true, force: true });
  await createDirectoryLink(sourceDir, targetDir);
}

async function mergeDirectoryContents(
  sourceDir: string,
  targetDir: string,
): Promise<void> {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  await mkdir(targetDir, { recursive: true });

  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry.name);
    const targetPath = join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await mergeDirectoryContents(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile()) {
      await copyFileIfNewer(sourcePath, targetPath);
      continue;
    }

    if (entry.isSymbolicLink()) {
      const resolvedMetadata = await stat(sourcePath);
      if (resolvedMetadata.isDirectory()) {
        await mergeDirectoryContents(sourcePath, targetPath);
      } else if (resolvedMetadata.isFile()) {
        await copyFileIfNewer(sourcePath, targetPath);
      }
    }
  }
}

async function copyFileIfNewer(
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  const sourceMetadata = await stat(sourcePath);
  const targetMetadata = await tryStat(targetPath);
  if (targetMetadata && targetMetadata.mtimeMs > sourceMetadata.mtimeMs) {
    return;
  }

  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
}

async function moveOrCopyDirectory(
  sourceDir: string,
  targetDir: string,
): Promise<void> {
  await mkdir(dirname(targetDir), { recursive: true });

  try {
    await rename(sourceDir, targetDir);
    return;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EXDEV") {
      throw error;
    }
  }

  await cp(sourceDir, targetDir, {
    recursive: true,
    force: true,
    dereference: true,
  });
  await rm(sourceDir, { recursive: true, force: true });
}

async function createDirectoryLink(
  sourceDir: string,
  targetDir: string,
): Promise<void> {
  await rm(targetDir, { recursive: true, force: true });
  await symlink(
    sourceDir,
    targetDir,
    process.platform === "win32" ? "junction" : "dir",
  );
}

async function directoriesShareRealPath(
  leftPath: string,
  rightPath: string,
): Promise<boolean> {
  try {
    return (await realpath(leftPath)) === (await realpath(rightPath));
  } catch {
    return false;
  }
}

async function readPathState(path: string): Promise<{
  readonly exists: boolean;
  readonly isDirectory: boolean;
}> {
  try {
    const metadata = await lstat(path);
    return {
      exists: true,
      isDirectory: metadata.isDirectory() || metadata.isSymbolicLink(),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        exists: false,
        isDirectory: false,
      };
    }

    throw error;
  }
}

async function tryStat(path: string): Promise<Awaited<ReturnType<typeof stat>> | undefined> {
  try {
    return await stat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}
