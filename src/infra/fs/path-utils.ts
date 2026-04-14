import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface CcoPaths {
  readonly root: string;
  readonly profilesFile: string;
  readonly sessionsFile: string;
  readonly tokensDir: string;
  readonly locksDir: string;
}

export function resolveCcoPaths(env: NodeJS.ProcessEnv): CcoPaths {
  const baseDir = env.CCO_HOME ?? join(resolveHomeDir(env), ".cco");

  return {
    root: baseDir,
    profilesFile: join(baseDir, "profiles.json"),
    sessionsFile: join(baseDir, "sessions.json"),
    tokensDir: join(baseDir, "tokens"),
    locksDir: join(baseDir, "locks"),
  };
}

export function ensureCcoLayout(paths: CcoPaths): void {
  mkdirSync(paths.root, { recursive: true });
  mkdirSync(paths.tokensDir, { recursive: true });
  mkdirSync(paths.locksDir, { recursive: true });
}

export function projectKey(cwd: string): string {
  return process.platform === "win32" ? cwd.toLowerCase() : cwd;
}

function resolveHomeDir(env: NodeJS.ProcessEnv): string {
  return env.USERPROFILE ?? env.HOME ?? homedir();
}
