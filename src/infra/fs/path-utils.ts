import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface CcoPaths {
  readonly root: string;
  readonly profilesFile: string;
  readonly profilesDir: string;
  readonly tokensDir: string;
}

export interface TeamsProfilePaths {
  readonly root: string;
  readonly claudeHomeDir: string;
  readonly manifestFile: string;
}

export function resolveCcoPaths(env: NodeJS.ProcessEnv): CcoPaths {
  const baseDir = env.CCO_HOME ?? join(resolveHomeDir(env), ".cco");

  return {
    root: baseDir,
    profilesFile: join(baseDir, "profiles.json"),
    profilesDir: join(baseDir, "profiles"),
    tokensDir: join(baseDir, "tokens"),
  };
}

export function ensureCcoLayout(paths: CcoPaths): void {
  mkdirSync(paths.root, { recursive: true });
  mkdirSync(paths.profilesDir, { recursive: true });
  mkdirSync(paths.tokensDir, { recursive: true });
}

export function resolveTeamsProfilePaths(
  paths: CcoPaths,
  profileId: string,
): TeamsProfilePaths {
  const root = join(paths.profilesDir, profileId, "teams");

  return {
    root,
    claudeHomeDir: join(root, "claude"),
    manifestFile: join(root, "manifest.json"),
  };
}

export function resolveHostClaudeConfigDir(env: NodeJS.ProcessEnv): string {
  return env.CLAUDE_CONFIG_DIR ?? join(resolveHomeDir(env), ".claude");
}

export function resolvePhysicalHostClaudeConfigDir(env: NodeJS.ProcessEnv): string {
  return join(resolveHomeDir(env), ".claude");
}

function resolveHomeDir(env: NodeJS.ProcessEnv): string {
  return env.USERPROFILE ?? env.HOME ?? homedir();
}
