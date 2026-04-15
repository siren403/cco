# cco

`cco` is a local Claude Code launcher with two explicit run modes:

- overlay: keep the host Claude home and swap runtime auth with `CLAUDE_CODE_OAUTH_TOKEN`
- isolate: launch against a separate Claude home for team-compatible runs

## Positioning

- Host Claude settings, plugins, and local sessions stay where they are.
- Claude's own flags are passed through for direct launches such as `cco work -c`.
- Overlay profiles use official `claude setup-token` tokens.
- Isolate runs use a `cco`-owned Claude home and native Claude login inside that home.
- The tool is local-only and launcher-only. It is not an OAuth proxy or credential broker.
- `cco` must not rely on a global "active profile" switch. Every launch is explicit and process-local.

## Isolation Rules

- Overlay auth is applied only to the spawned Claude process.
- Isolate runs redirect only the spawned Claude process to a separate Claude home.
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

- `cco` or `cco <profile>` launches Claude with host or overlay auth.
- `cco <profile> [claude args...]` passes trailing Claude args through unchanged.
- `cco --isolate <profile>` launches Claude in a separate `cco`-owned Claude home.
- The first `cco --isolate <profile>` run bootstraps that home with either `Import current host setup` or `Start clean`.
- `cco isolate status/remove/fresh <profile>` inspects or resets the isolate home.
- `cco teams ...` and `cco --teams ...` remain as compatibility aliases, but `isolate` is the public surface.
- `cco host` launches with host auth explicitly.
- `cco auth add <profile>` guides setup-token capture and verifies the token.
- `cco auth add <profile>` also lets you choose the profile's subprocess auth-env policy.
- `cco auth list` and `cco auth remove <profile>` manage local profiles with dashboard-style terminal output.
- `cco config get -p <profile>` shows the saved per-profile config.
- `cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p <profile>` updates the saved scrub mode without editing JSON by hand.
- If a launch passes `--permission-mode bypassPermissions` or `--dangerously-skip-permissions` while the profile is still in safe mode, `cco` now warns before launch.
- Interactive launches can continue in compat mode for that run, keep safe mode, or exit and show scrub/config examples.
- Non-interactive launches can still re-run by setting `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0` for that command, or by changing the saved profile to compat mode.
- `cco doctor` checks binary resolution, env conflicts, and local storage layout with a structured diagnostics screen.
- `cco showcase [topic]` previews the CLI's help, doctor, profile inventory, and recovery states without launching Claude.

## Isolate Mode

Use isolate mode when the normal auth overlay is not enough, especially for Claude team or teammate workflows.

```bash
cco --isolate work
cco --isolate work -c
cco isolate status work
cco isolate fresh work
```

Behavior summary:

- overlay mode keeps the host Claude home and changes auth only for the launched Claude process
- isolate mode launches Claude against a separate Claude home under `~/.cco/profiles/<profile>/teams/claude`
- the isolate home is prepared on first use and then reused on later runs
- isolate mode uses native Claude login inside that separate home instead of the overlay token file

## Bypass-Permission Re-runs

```powershell
$env:CLAUDE_CODE_SUBPROCESS_ENV_SCRUB='0'
cco work --permission-mode bypassPermissions -c

$env:CLAUDE_CODE_SUBPROCESS_ENV_SCRUB='0'
cco work --dangerously-skip-permissions -c
```

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
│ Runtime looks ready for host launches and process-local auth  │
│ overlays. No conflicting auth environment variables were      │
│ detected in the current shell.                                │
└───────────────────────────────────────────────────────────────┘
```

```text
┌─ Problem [error] ─────────────────────────────────────────────┐
│ Unknown profile: missing-profile                              │
│                                                               │
│ Create the local alias first, or inspect the saved overlay   │
│ profiles.                                                     │
└───────────────────────────────────────────────────────────────┘
```

## Notes

- Tokens are currently stored locally in plain text under `~/.cco/tokens/` for MVP simplicity.
- Overlay runtime policy is stored in `~/.cco/profiles.json`, including per-profile `env` values such as `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`.
- That means you can adjust a saved profile later by editing `profiles.json` directly.
- Session management is intentionally left to Claude Code itself in MVP.
- Overlay launches preserve the host shell's `CLAUDE_CONFIG_DIR` if one is already set.
- Isolate launches set `CLAUDE_CONFIG_DIR` only for the spawned Claude process so it uses the isolate home.
- Cross-terminal isolation is a hard requirement for future session binding work.
- Overlay runs are not team-aware. Teammate Claude instances may still fall back to host login because Claude Code does not currently propagate `CLAUDE_CODE_OAUTH_TOKEN` into teammate spawn env.
- `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0` does not fix that teammate limitation by itself. It only affects subprocess env handling, not teammate auth propagation.
- If teammate or team compatibility matters more than overlay continuity, prefer isolate mode.
