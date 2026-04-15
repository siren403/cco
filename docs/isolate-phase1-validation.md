# cco Isolate Mode Validation

## Purpose

Record the runtime finding that justified isolate mode.

The original question was simple:

Can a separate Claude home make Claude team or teammate runs use the intended account more reliably than the runtime auth overlay alone?

## Result

Validated enough to proceed.

Practical conclusion:

- overlay auth works for the main launched Claude process
- overlay auth is not reliably propagated into Claude teammate spawns
- a separate Claude home with its own native Claude login gives team workflows their own auth context

That is why `cco` now ships both:

- overlay mode for fast normal launches
- isolate mode for team-compatible launches

## What Was Verified

### Overlay baseline

- Launching Claude with `CLAUDE_CODE_OAUTH_TOKEN` changes the main process auth as intended.
- This is suitable for direct launches such as `cco work` and `cco work -c`.

### Isolate candidate

- Launching Claude under a separate `CLAUDE_CONFIG_DIR` gives it a distinct Claude home.
- After running `claude auth login` inside that separate home, the main isolate session uses the isolate account.
- In local validation, teammate/team behavior followed that isolate account well enough to justify the mode.

## Product Consequence

`cco` does not try to force teammate auth through overlay token tricks.

Instead:

- `cco <profile>` stays the fast path for overlay auth
- `cco --isolate <profile>` is the supported path when team compatibility matters

## Important Limitation

Isolate mode is not overlay continuity.

It is a separate Claude home with separate login state, separate runtime state, and its own recovery lifecycle.

That is intentional:

- clearer failure boundaries
- no mutation of host vendor state
- better team compatibility than overlay-only launch
