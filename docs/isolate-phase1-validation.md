# cco Isolate Mode Validation

## Purpose

Record the runtime finding that justified isolate mode.

The original question was simple:

Can a separate Claude home make Claude team or teammate runs use the intended account more reliably than runtime token injection alone?

## Result

Validated enough to proceed.

Practical conclusion:

- runtime token injection works for the main launched Claude process
- runtime token injection is not reliably propagated into Claude teammate spawns
- a separate Claude home gives team workflows their own auth context

That is why `cco` now treats the separate Claude home as the default profiled run:

- `cco host` for the unmodified host path
- `cco <profile>` for team-compatible profiled launches

## What Was Verified

### Runtime token baseline

- Launching Claude with `CLAUDE_CODE_OAUTH_TOKEN` changes the main process auth as intended.
- This is still part of the profiled launch path.

### Isolate candidate

- Launching Claude under a separate `CLAUDE_CONFIG_DIR` gives it a distinct Claude home.
- In local validation, teammate/team behavior followed that separate-home context well enough to justify the mode.

## Product Consequence

`cco` does not rely on runtime token tricks alone for teammate auth.

Instead:

- `cco host` stays the host path
- `cco <profile>` is the supported path when team compatibility matters

## Important Limitation

Isolate mode is not just runtime-token continuity.

It is a separate Claude home with separate login state, separate runtime state, and its own recovery lifecycle.

That is intentional:

- clearer failure boundaries
- no mutation of host vendor state
- better team compatibility than token-only launch
