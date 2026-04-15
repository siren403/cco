# cco Isolate Mode Plan

## Goal

Ship a second launch mode for `cco` that keeps the fast overlay path intact while giving Claude team workflows their own Claude home.

The public UX is:

- `cco <profile>`: overlay launch
- `cco --isolate <profile>`: isolate launch
- `cco isolate status|remove|fresh <profile>`: isolate maintenance

## Product Model

`cco` has one saved overlay profile record per alias such as `work` or `backup`.

Isolate mode is not a second profile system. It is a derived runtime attached to an existing overlay profile.

That means:

- the profile name stays the user-facing handle
- overlay and isolate are run modes, not separate top-level objects
- the isolate home is owned by `cco` and can be removed safely without touching the host Claude home

## Behavior

### Overlay

- Uses the host Claude home
- Injects `CLAUDE_CODE_OAUTH_TOKEN` only into the spawned Claude process
- Keeps host sessions and host configuration continuity
- Best default for normal single-agent usage

### Isolate

- Uses a separate Claude home under `~/.cco/profiles/<profile>/isolate/claude`
- Does not inject the overlay token into the launched Claude process
- Uses native Claude login inside that isolate home
- Best option for team or teammate workflows where runtime token overlay is insufficient

## First Run Bootstrap

The first isolate launch is lazy-bootstrapped from the run command itself.

```bash
cco --isolate work
```

If the isolate home is missing:

1. Explain that a separate Claude home will be used.
2. Ask one setup question:
   - `Import current host setup`
   - `Start clean`
3. Prepare the isolate home.
4. Launch Claude immediately.

Later isolate runs skip setup and reuse the prepared home.

## Seed Policy

Current safe import copies only host-facing setup that is reasonable to inherit:

- `settings.json`
- `settings.local.json`
- `mcp.json`
- `mcp.local.json`
- `plugins/`
- `skills/`
- `hooks/`
- `commands/`
- `statusline.*`

Runtime state such as login, sessions, and caches remains isolate-local.

## Operational Rules

- The parent shell environment is never mutated.
- Host credential storage is never rewritten.
- Overlay and isolate launches can run concurrently in different terminals.
- `isolate fresh` is the main recovery path when an isolate home becomes stale or confusing.

## Current Scope

Implemented and intended for public use:

- `--isolate` launch flag
- `isolate status`
- `isolate remove`
- `isolate fresh`
- Korean-first help and recovery copy

Out of scope for now:

- host-to-isolate live sync
- project settings patching
- teammate spawn env hacks inside Claude Code
- isolate template marketplace
