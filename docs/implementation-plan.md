# cco Implementation Plan

## Product Position

`cco` stays intentionally narrow:

- local-only
- launcher-only
- host `~/.claude` preserved
- runtime auth overlay via `CLAUDE_CODE_OAUTH_TOKEN`
- no ambient global profile state

It does not become:

- a remote control layer
- an OAuth proxy
- a credential broker
- a usage analytics product in MVP

## UX Plan

### First-run flow

1. User runs `cco auth add work`
2. CLI explains that it will run official `claude setup-token`
3. Browser/OAuth flow completes in Claude's own tooling
4. User pastes token back into a hidden Clack prompt
5. CLI verifies the token with a minimal Claude call
6. CLI stores profile metadata and token locally

### Daily launch flow

1. User runs `cco`
2. If multiple profiles exist, show a short profile picker
3. Spawn Claude with host login or overlay token
4. Keep stdin/stdout/stderr inherited so the Claude UX stays native
5. Do not persist a global "current profile" across terminals

### Explicit launch flow

- `cco host`
- `cco work`
- `cco personal --fresh`

## Information Architecture

### Commands in scope now

- `cco`
- `cco <profile>`
- `cco host`
- `cco auth add <profile>`
- `cco auth list`
- `cco auth remove <profile>`
- `cco doctor`

### Deferred commands

- automatic session capture and binding
- usage tracking
- token rotation UX
- cross-machine profile sync

## Isolation Model

### Non-negotiable rule

`cco` must not create global side effects that bleed across terminals.

That means:

- no persistent "active account" switch
- no parent-shell env mutation
- no shared mutable auth state outside the launched child process
- no session lookup keyed only by account or only by project

### Auth isolation

- overlay auth exists only in the child env passed to `claude`
- host login remains the default when `cco` is not involved
- two terminals running `cco work` and `cco personal` must not interfere

### Session isolation

Session continuity should be keyed by at least:

- `projectKey`
- `profileId`

Future refinement if needed:

- optional `slot` or explicit binding name for parallel same-profile workflows

MVP policy:

- different profiles in the same project never share session state
- direct user CLI args beat auto-resume logic
- `--fresh` must bypass any saved binding

## Technical Architecture

### CLI layer

- Stricli owns routing and parsing
- Clack owns prompts only

### Core layer

- profile resolution
- launch plan construction
- domain errors

### Infra layer

- JSON file persistence
- token files
- Claude binary resolution
- Bun subprocess execution

## Risks and Safeguards

### Risks

- parent-shell auth vars overriding intended profile
- accidental token logging
- assuming setup-token can support full-scope Claude features
- platform-specific terminal quirks around hidden input
- cross-terminal session leakage through overly broad binding keys

### Safeguards

1. Scrub competing auth env vars in every child process
2. Never log tokens or include them in error text
3. Never touch vendor credential storage
4. Keep `CLAUDE_CONFIG_DIR` out of child env
5. Keep token verification in `auth add`
6. Never implement a global active-profile toggle
7. Key session bindings by project and profile, not by a single global state

## Next Build Steps

1. Add explicit session binding commands and auto-resume policy with cross-terminal isolation
2. Add fake-claude integration tests for spawn/env behavior
3. Upgrade token storage from plain files to OS-backed secret storage
4. Add structured diagnostics for resume readiness and invalid tokens
