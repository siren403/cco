import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface CcoPaths {
  readonly root: string;
  readonly profilesFile: string;
  readonly tokensDir: string;
}

export function resolveCcoPaths(env: NodeJS.ProcessEnv): CcoPaths {
  const baseDir = env.CCO_HOME ?? join(resolveHomeDir(env), ".cco");

  return {
    root: baseDir,
    profilesFile: join(baseDir, "profiles.json"),
    tokensDir: join(baseDir, "tokens"),
  };
}

export function ensureCcoLayout(paths: CcoPaths): void {
  mkdirSync(paths.root, { recursive: true });
  mkdirSync(paths.tokensDir, { recursive: true });
}

function resolveHomeDir(env: NodeJS.ProcessEnv): string {
  return env.USERPROFILE ?? env.HOME ?? homedir();
}
