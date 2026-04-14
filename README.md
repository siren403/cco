# cco

`cco` is a local Claude Code launcher that keeps the host `~/.claude` state intact while swapping runtime auth with `CLAUDE_CODE_OAUTH_TOKEN`.

## Positioning

- Host Claude settings, plugins, and local sessions stay where they are.
- Claude's own flags are passed through for direct launches such as `cco work -c`.
- Overlay profiles use official `claude setup-token` tokens.
- The tool is local-only and launcher-only. It is not an OAuth proxy or credential broker.
- `cco` must not rely on a global "active profile" switch. Every launch is explicit and process-local.

## Isolation Rules

- Auth overlay is applied only to the spawned Claude process.
- `cco` never mutates the parent shell environment.
- `cco` never rewrites vendor credential storage or `CLAUDE_CONFIG_DIR`.
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
- `cco host` launches with host auth explicitly.
- `cco auth add <profile>` guides setup-token capture and verifies the token.
- `cco auth list` and `cco auth remove <profile>` manage local profiles with dashboard-style terminal output.
- `cco doctor` checks binary resolution, env conflicts, and local storage layout with a structured diagnostics screen.
- `cco showcase [topic]` previews the CLI's help, doctor, profile inventory, and recovery states without launching Claude.

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
- Session management is intentionally left to Claude Code itself in MVP.
- If the host shell already sets `CLAUDE_CONFIG_DIR`, `cco` preserves it and only swaps auth for the spawned Claude process.
- Cross-terminal isolation is a hard requirement for future session binding work.
