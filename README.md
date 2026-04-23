# cco

`cco` is a local Claude Code launcher for:

- linked host-facing setup
- separate Claude homes per saved profile
- per-profile OAuth switching with official `claude setup-token` tokens

## Breaking Change in 0.2.0

The old experimental `teams` surface has been removed.

- `cco --teams <profile>` is gone
- `cco teams ...` is gone
- `cco --isolate <profile>` has been folded into `cco <profile>`
- internal isolate storage moved from `~/.cco/profiles/<profile>/teams/` to `~/.cco/profiles/<profile>/isolate/`
- there is no automatic migration for old experimental isolate homes

If you used pre-`0.2.0` experimental builds, re-run:

```bash
cco <profile>
```

That will bootstrap a fresh isolate home under the new path.

## Positioning

- Host-facing Claude settings stay where they are and are linked into profile homes.
- Claude's own flags are passed through for direct launches such as `cco work -c`.
- Saved profiles use official `claude setup-token` tokens.
- Profile runs use a `cco`-owned Claude home under `~/.cco/profiles/<profile>/isolate/claude`.
- The tool is local-only and launcher-only. It is not an OAuth proxy or credential broker.
- `cco` must not rely on a global "active profile" switch. Every launch is explicit and process-local.

## Isolation Rules

- Profile auth is applied only to the spawned Claude process.
- Profile runs redirect only the spawned Claude process to a separate Claude home.
- `cco` never mutates the parent shell environment.
- `cco` never rewrites host vendor credential storage.
- Different terminals can run different profiles concurrently without sharing a global auth state.
- `cco` does not implement its own session manager in MVP. Continue/resume behavior stays Claude-native.

## Stack

- Runtime: Bun
- CLI routing: Stricli
- Interactive prompts: Clack
- Tests: `bun test`

## Current scaffold

- `cco` opens the picker and launches host or a saved profile.
- `cco <profile> [claude args...]` passes trailing Claude args through unchanged.
- The first `cco <profile>` run bootstraps a separate `cco`-owned Claude home with linked host-facing setup by default.
- `cco host` launches with host auth explicitly.
- `cco auth add <profile>` guides setup-token capture and verifies the token.
- `cco auth add <profile>` also lets you choose the profile's subprocess auth-env policy.
- `cco auth list` and `cco auth remove <profile>` manage local profiles with dashboard-style terminal output.
- `cco config get -p <profile>` shows the saved per-profile config.
- `cco doctor` checks binary resolution, env conflicts, and local storage layout with a structured diagnostics screen.
- `cco ui` opens an optional interactive TUI that reflows on terminal resize and controls the same run, continue, host, doctor, and isolate maintenance actions.
- `cco showcase [topic]` previews the CLI's help, doctor, profile inventory, and recovery states without launching Claude.

## Profile Runs

Use `cco <profile>` as the normal path. It gives you linked host-facing setup, a separate Claude home, and the saved profile auth in one command.

```bash
cco work
cco work -c
cco host
```

Behavior summary:

- `cco host` keeps the host Claude login and host Claude home untouched
- `cco <profile>` launches Claude against `~/.cco/profiles/<profile>/isolate/claude`
- that profile home links safe host-facing setup such as settings, MCP config, plugins, skills, hooks, commands, and statusline scripts
- `cco <profile>` injects the saved profile token into the launched Claude process
- the current project's Claude session store is linked into the profile home so native `-c` stays continuous across host plain `claude`, `cco host`, and `cco <profile>`
- clean bootstrap and explicit first-launch resume are advanced `cco isolate fresh <profile>` options

## Maintenance

Use these only when you need to inspect or recover the profile home.

```bash
cco isolate status work
cco isolate fresh work
cco isolate fresh --clean work
cco isolate fresh --import-latest-host-session work
```

## Profile Control Center

`cco ui` is optional. It does not manage Claude sessions directly; it keeps an interactive terminal UI mounted so profile status, launch actions, host-link state, and isolate details can re-render when the terminal size changes.

```bash
cco ui
cco ui --rich
```

The default UI is the stable mode: no emoji, no gradients, no live resize badge. `--rich` enables restrained color accents and width-stable Unicode markers for terminals that render them cleanly.

Primary keys:

- `Up` / `Down`: select an action
- `Left` / `Right` / `Tab`: switch profile
- `Enter`: run the selected action
- `x`: explain the selected profile's auth, isolate, host links, and session continuity
- `r`: reload profile/status data
- `?`: show contextual help
- `q` / `Esc`: quit

Primary actions:

- run a saved profile
- continue a saved profile
- run host
- run doctor
- show isolate status
- fresh or clean-fresh a profile home
## Dev

```bash
bun install
bun run check
bun test
bun run dev -- --help
bun run dev -- showcase
bun run dev -- showcase auth
```

## Build

```bash
bun run build
```

## Bunx

For a public GitHub repo, `cco` can be launched without npm or GitHub Packages publish:

```bash
bunx github:owner/repo --help
bunx github:owner/repo work
bunx -p github:owner/repo cco work
```

Repository requirements for that flow:

- the repo must be public
- `package.json` must declare a `bin` entry
- the `bin` target must be Bun-executable from a fresh checkout

If Bun cannot infer the executable from the repo spec directly, `bunx -p github:owner/repo cco ...` is the safer form.

This repo uses `bin/cco.ts` as that launcher entry and keeps the real implementation in `src/cli.ts`.

## npm Publish

This package can also be published as a public scoped npm package and launched with Bun:

```bash
bunx @qkrsogusl3/cco --help
bunx @qkrsogusl3/cco work
```

If the machine already has an older global `cco` installed, prefer an explicit latest fetch:

```bash
bunx --no-cache @qkrsogusl3/cco@latest --help
bunx --no-cache @qkrsogusl3/cco@latest --version
```

That avoids local `cco` shadowing when validating a fresh release.

## UI Preview

Use the built-in showcase to inspect the CLI surface without touching Claude:

```bash
bun run showcase
bun run showcase auth
bun run showcase errors
```

Typical screens now render as structured terminal panels instead of flat line lists:

```text
┌─ Doctor [ready] ──────────────────────────────────────────────┐
│ Runtime looks ready for host launches and isolated profile    │
│ launches. No conflicting auth environment variables were      │
│ detected in the current shell.                                │
└───────────────────────────────────────────────────────────────┘
```

```text
┌─ Problem [error] ─────────────────────────────────────────────┐
│ Unknown profile: missing-profile                              │
│                                                               │
│ Create the local alias first, or inspect the saved profiles.  │
└───────────────────────────────────────────────────────────────┘
```

## Notes

- Tokens are currently stored locally in plain text under `~/.cco/tokens/` for MVP simplicity.
- Saved profile runtime policy is stored in `~/.cco/profiles.json`, including per-profile `env` values such as `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`.
- That means you can adjust a saved profile later by editing `profiles.json` directly.
- Session management is intentionally left to Claude Code itself in MVP.
- Host launches preserve the host shell's `CLAUDE_CONFIG_DIR` if one is already set.
- Profile launches set `CLAUDE_CONFIG_DIR` only for the spawned Claude process so it uses the isolate home.
- Cross-terminal isolation is a hard requirement for future session binding work.
- The current project's session store is intentionally shared between host and profile homes so native `-c` continuity works in both directions.
- Do not open the exact same session concurrently from host and profile processes.
