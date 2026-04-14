# cco

`cco` is a local Claude Code launcher that keeps the host `~/.claude` state intact while swapping runtime auth with `CLAUDE_CODE_OAUTH_TOKEN`.

## Positioning

- Host Claude settings, plugins, and local sessions stay where they are.
- Overlay profiles use official `claude setup-token` tokens.
- The tool is local-only and launcher-only. It is not an OAuth proxy or credential broker.
- `cco` must not rely on a global "active profile" switch. Every launch is explicit and process-local.

## Isolation Rules

- Auth overlay is applied only to the spawned Claude process.
- `cco` never mutates the parent shell environment.
- `cco` never rewrites vendor credential storage or `CLAUDE_CONFIG_DIR`.
- Different terminals can run different profiles concurrently without sharing a global auth state.
- Session bindings are keyed by project and profile. They must never be keyed by a single global "current account".

## Stack

- Runtime: Bun
- CLI routing: Stricli
- Interactive prompts: Clack
- Tests: `bun test`

## Current scaffold

- `cco` or `cco <profile>` launches Claude with host or overlay auth.
- `cco host` launches with host auth explicitly.
- `cco auth add <profile>` guides setup-token capture and verifies the token.
- `cco auth list` and `cco auth remove <profile>` manage local profiles.
- `cco doctor` checks binary resolution, env conflicts, and local storage layout.

## Dev

```bash
bun install
bun run check
bun test
bun run dev -- --help
```

## Build

```bash
bun run build
```

## Notes

- Tokens are currently stored locally in plain text under `~/.cco/tokens/` for MVP simplicity.
- Automatic session capture and usage tracking are intentionally deferred.
- `CLAUDE_CONFIG_DIR` is scrubbed from the child process to preserve host config behavior.
- Cross-terminal isolation is a hard requirement for future session binding work.
