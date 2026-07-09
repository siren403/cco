# cco Maintenance Guide

## Project purpose

`cco` is a local Claude Code launcher. It keeps host-facing Claude setup linked, runs saved profiles in separate Claude homes, and switches OAuth identity per spawned Claude process.

Keep the product narrow:

- local-only launcher
- no OAuth proxy or credential broker
- no persistent global active-profile switch
- no parent-shell environment mutation
- no rewriting host Claude credential storage

## Normal commands

- Install dependencies: `bun install`
- Typecheck: `bun run check`
- Test: `bun test`
- Run local CLI: `bun run ./src/cli.ts -- <args>`
- Show version: `bun run ./src/cli.ts -- --version`
- Run diagnostics: `bun run ./src/cli.ts -- doctor`
- Preview UI/help surfaces: `bun run showcase`, `bun run showcase auth`, `bun run showcase errors`
- Build binary: `bun run build`

Before release or broad CLI changes, run:

```bash
bun run check
bun test
npm pack --dry-run
```

## Main UX contract

- `cco <profile> [claude args...]` is the primary profile launch path.
- `cco host [claude args...]` launches Claude with host auth and host config.
- `cco ui` is optional interactive control; direct CLI entrypoints must remain complete.
- Removed surfaces such as `cco --isolate <profile>` and `cco teams ...` should stay rejected with migration guidance.
- Claude args after profile or `host` are pass-through and should not be reinterpreted unless the command explicitly owns them.

## Isolation and session rules

- Profile auth must exist only in the spawned child process environment.
- Profile launches use `~/.cco/profiles/<profile>/isolate/claude` as the profile Claude home.
- Host-facing setup such as settings, MCP config, plugins, skills, hooks, commands, and statusline scripts is linked into profile homes when safe.
- The current project's Claude session store is shared between host and profile homes so native `-c` continuity works in both directions.
- Do not implement a custom session manager unless the need is proven; continuation should remain Claude-native.
- Do not open the same Claude session concurrently from host and profile processes.

## Code structure

- CLI routing: `src/app.ts`, `src/cli.ts`, `src/commands/*`
- Launch behavior: `src/commands/launch-shared.ts`, `src/core/services/build-launch-plan.ts`
- Isolate home setup: `src/core/services/isolate-bootstrap.ts`
- Session continuity: `src/core/services/isolate-session-continuity.ts`
- Terminal UI: `src/ui/ink/*`, especially `src/ui/ink/control-panel-ink-screen.ts`
- Translated user-facing copy: `src/i18n/index.ts`
- Tests: `test/core`, `test/infra`, `test/integration`, `test/ui`

## Engineering rules

- Prefer small changes that preserve the current architecture.
- Keep user-facing text in `src/i18n/index.ts` unless the surrounding code already uses local literals.
- Keep tokens and auth values out of logs, errors, fixtures, snapshots, and docs.
- Do not add global state for profile selection.
- Do not make destructive isolate actions run without explicit confirmation in interactive flows.
- When changing TUI layout, test narrow and resized terminal behavior. Avoid relying on one-time printed layouts for interactive surfaces.
- Preserve Windows behavior; this project is actively used from PowerShell.

## Git and release notes

- Main release package is `@qkrsogusl3/cco`.
- Version should come from `package.json`.
- Update `CHANGELOG.md` for user-facing releases.
- Validate published/latest behavior with `bunx --no-cache @qkrsogusl3/cco@latest --version` after release.
