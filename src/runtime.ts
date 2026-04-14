import type { ProfileStore } from "./core/ports/profile-store.ts";
import type { SessionStore } from "./core/ports/session-store.ts";
import type { TokenStore } from "./core/ports/token-store.ts";
import { ensureCcoLayout, resolveCcoPaths, type CcoPaths } from "./infra/fs/path-utils.ts";
import { JsonProfileStore } from "./infra/fs/json-profile-store.ts";
import { JsonSessionStore } from "./infra/fs/json-session-store.ts";
import { resolveClaudeBinary } from "./infra/platform/resolve-claude-bin.ts";
import { FileTokenStore } from "./infra/tokens/file-token-store.ts";

export interface AppRuntime {
  readonly paths: CcoPaths;
  readonly profileStore: ProfileStore;
  readonly tokenStore: TokenStore;
  readonly sessionStore: SessionStore;
  readonly now: () => Date;
  readonly resolveClaudeBinary: () => string;
}

export function createRuntime(proc: typeof process): AppRuntime {
  const paths = resolveCcoPaths(proc.env);
  ensureCcoLayout(paths);

  return {
    paths,
    profileStore: new JsonProfileStore(paths.profilesFile),
    tokenStore: new FileTokenStore(paths.tokensDir),
    sessionStore: new JsonSessionStore(paths.sessionsFile),
    now: () => new Date(),
    resolveClaudeBinary: () => resolveClaudeBinary(proc.env),
  };
}
