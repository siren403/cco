import type { ProfileStore } from "./core/ports/profile-store.ts";
import type { TokenStore } from "./core/ports/token-store.ts";
import type { AppLocale } from "./i18n/index.ts";
import { resolveAppLocale } from "./i18n/index.ts";
import { ensureCcoLayout, resolveCcoPaths, type CcoPaths } from "./infra/fs/path-utils.ts";
import { JsonProfileStore } from "./infra/fs/json-profile-store.ts";
import { resolveClaudeBinary } from "./infra/platform/resolve-claude-bin.ts";
import { FileTokenStore } from "./infra/tokens/file-token-store.ts";

export interface AppRuntime {
  readonly locale: AppLocale;
  readonly paths: CcoPaths;
  readonly profileStore: ProfileStore;
  readonly tokenStore: TokenStore;
  readonly now: () => Date;
  readonly resolveClaudeBinary: () => string;
}

export function createRuntime(proc: typeof process): AppRuntime {
  const paths = resolveCcoPaths(proc.env);
  ensureCcoLayout(paths);

  return {
    locale: resolveAppLocale(proc.env),
    paths,
    profileStore: new JsonProfileStore(paths.profilesFile),
    tokenStore: new FileTokenStore(paths.tokensDir),
    now: () => new Date(),
    resolveClaudeBinary: () => resolveClaudeBinary(proc.env),
  };
}
