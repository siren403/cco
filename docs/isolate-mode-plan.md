# cco Isolate Design

This is the canonical design document for isolate mode.

It covers:

- the base isolate runtime model
- the safe host-facing seed policy
- the phase-1 session continuity handoff design
- metadata, recovery, and scope boundaries

Supporting references:

- validation background: `docs/isolate-phase1-validation.md`
- product-wide constraints: `docs/implementation-plan.md`

## Goal

Ship a canonical profiled run path for `cco` that uses linked host-facing
setup, a separate Claude home, and saved profile auth in one launch.

The public UX remains:

- `cco <profile>`: canonical profiled run
- `cco host`: host run
- `cco isolate status|remove|fresh <profile>`: isolate maintenance
- advanced bootstrap overrides live on `cco isolate fresh <profile>`

## Product Model

`cco` has one saved profile record per alias such as `work` or
`backup`.

The isolate home is not a second profile system. It is a derived runtime
attached to an existing saved profile.

That means:

- the profile name stays the user-facing handle
- host vs profiled run is the public launch split
- overlay remains an internal auth-storage concept, not a public run mode
- the isolate home is owned by `cco` and can be removed safely without touching
  the host Claude home
- `cco` does not become a custom session manager

## Runtime Model

### Host Run

- Uses the host Claude home.
- Does not inject a saved profile token.
- Keeps host sessions and host configuration continuity.
- Used only when the caller explicitly runs `cco host`.

### Profile Run

- Uses a separate Claude home under
  `~/.cco/profiles/<profile>/isolate/claude`.
- Links safe host-facing setup into that profile home.
- Injects the saved profile token into the launched Claude process.
- Is the default public path for `cco <profile>`.

## Bootstrap Model

The first profiled launch is lazy-bootstrapped from the run command itself.

```bash
cco work
```

If the isolate home is missing:

1. Explain that a separate Claude home will be used.
2. Default to the safe host-facing seed policy automatically.
3. Prepare the isolate home.
4. Launch Claude immediately.

Later isolate runs skip bootstrap and reuse the prepared home.

Advanced bootstrap options move behind `cco isolate fresh <profile>` flags:

- `--clean`: start from an empty isolate Claude home
- `--import-latest-host-session`: explicitly resume the latest host session on the first isolate launch

## Seed Policy

Default bootstrap links host-facing setup that is reasonable to inherit:

- `settings.json`
- `settings.local.json`
- `mcp.json`
- `mcp.local.json`
- `plugins/`
- `skills/`
- `hooks/`
- `commands/`
- `statusline.*`

Runtime state such as login and caches remains isolate-local. The current
project's Claude session store is the explicit exception and is linked so
native `-c` continues to work across host and isolate launches.

## Session Continuity

### Goal

Allow host plain `claude -c`, `cco host -c`, and `cco <profile> -c` to keep
working across account-switched profile runs.

This requires shared visibility of the current project's Claude session store
between the host and isolate homes.

### Validated findings

- The primary Claude continuity artifact is
  `~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl`.
- Claude resume/continue lookup is driven from `projects/<encoded-cwd>/`, not
  from `history.jsonl`.
- `history.jsonl` is prompt recall history and is not required for session
  continuity.
- `file-history/<sessionId>/` is for checkpoint/rewind behavior, not baseline
  conversation continuity.
- `subagents/` is secondary for main-thread continuity.
- `projects/<encoded-cwd>/<sessionId>/tool-results/` improves fidelity for
  large tool output, but is not required for the minimal continuity path.
- `--resume <sessionId>` can work in a fresh `CLAUDE_CONFIG_DIR` if the session
  JSONL exists under the expected project path.
- Session-scoped permissions are not restored on resume.
- The same current-project session store can be shared if the product contract
  forbids simultaneous access to the same session from host and isolate
  processes.

Official references:

- <https://code.claude.com/docs/en/claude-directory>
- <https://code.claude.com/docs/en/how-claude-code-works>
- <https://code.claude.com/docs/en/agent-sdk/sessions>

### Design decision

What we will do:

- Link the current project's `projects/<encoded-cwd>/` store into the isolate
  home.
- Preserve native `-c` semantics on both host and isolate launches.
- Keep explicit first-launch resume as an advanced `isolate fresh` override.

What we will not do:

- No full `.claude` runtime sharing.
- No auth-state sharing.
- No custom `cco` session manager or background sync daemon.

### UX rules

- Do not ask seed or session questions on the default `cco <profile>` path.
- Make the default isolate bootstrap implicitly preserve safe host-facing
  setup.
- Keep explicit first-launch resume advanced, but make baseline native
  continuity work through the linked project session store.
- Expose advanced bootstrap controls through `cco isolate fresh <profile>`
  flags instead of first-run prompts.
- Preserve the Claude-native mental model:
  - `cco <profile>` starts a normal profiled launch.
  - `cco <profile> -c` continues the shared current-project session.
  - `cco <profile> --resume <sessionId>` resumes a session already
    present in the isolate home.

The linked project session store is the persistent continuity policy.
Explicit first-launch resume is only an extra bootstrap assist.

### Artifact policy

Baseline continuity link:

- link `projects/<encoded-cwd>/` between host and isolate

Still excluded by default:

- auth/runtime credential state
- `sessions/`
- `file-history/<sessionId>/`
- `subagents/`
- unrelated project session stores

## Technical Design

### Injection point

The continuity handoff belongs in
`src/commands/launch-shared.ts` inside `launchClaudeForProfile()`.

Current launch flow:

1. resolve profile
2. ensure isolate home exists via `resolveIsolateConfigDir()`
3. build launch plan
4. spawn Claude

The continuity layer should sit between steps 2 and 3.

### Service split

Add a dedicated continuity service, for example:

- `src/core/services/isolate-session-continuity.ts`

Responsibilities:

- inspect host session availability for the current `cwd`
- ensure the current project's session store is shared between host and
  isolate
- optionally return launch-time resume args for an explicit first-launch assist

### Bootstrap result shape

`ensureIsolateHomeReady()` currently returns only the isolate Claude home dir.

For continuity support, refactor it to return structured preparation data, for
example:

```ts
interface IsolatePreparationResult {
  readonly claudeHomeDir: string;
  readonly continuityImport?: {
    readonly sessionId: string;
    readonly projectKey: string;
    readonly importedAt: string;
  };
}
```

The bootstrap service gathers the first-run choice and prepares files. The
actual launch-arg application still happens in `launchClaudeForProfile()`.

### Metadata

Keep `manifest.json` unchanged.

The manifest handled by:

- `src/core/services/isolate-bootstrap.ts`
- `src/core/services/isolate-home.ts`

is bootstrap provenance only and should remain that way.

Continuity state belongs in `profiles.json` as isolate metadata, for example:

```ts
interface IsolateSessionContinuityMetadata {
  readonly lastImportedSessionId?: string;
  readonly projectKey?: string;
  readonly lastImportedAt?: string;
  readonly packs?: readonly ("jsonl" | "tool-results")[];
}
```

and then:

```ts
interface IsolateProfileMetadata {
  // existing fields
  readonly continuity?: IsolateSessionContinuityMetadata;
}
```

Normalize it in `src/infra/fs/json-profile-store.ts`.

## Recovery and Degradation

### Bootstrap missing or broken

Use the existing isolate recovery flow.

- missing bootstrap: ask the user to run `cco <profile>` interactively
- broken isolate home: guide the user to `cco isolate fresh <profile>`

### Continuity import failure

Do not fail the isolate launch.

Instead:

- show a warning if interactive
- clear any partial continuity metadata
- continue with a normal isolate launch

### Stale continuity metadata

If the stored session pointer is missing or the stored project key no longer
matches the current project:

- clear the continuity metadata
- do not inject resume args
- continue with a normal isolate launch

### Reset commands

`cco isolate remove <profile>` and `cco isolate fresh <profile>` must clear
continuity metadata together with isolate metadata.

## Operational Rules

- The parent shell environment is never mutated.
- Host credential storage is never rewritten.
- Host and profiled launches can run concurrently in different terminals.
- Runtime-state linking between host and isolate remains prohibited except for
  the explicit current-project session-store link.
- `isolate fresh` is the main recovery path when an isolate home becomes stale
  or confusing.

## Harness Continuity

Session continuity is only the first layer.

If this proves stable, harness continuity can be added later as a separate
capability that controls whether host-facing setup is inherited.

That later layer may cover:

- `skills/`
- `commands/`
- `agents/`
- `plugins/`
- selected `settings.json` / MCP config

It must remain separate from session continuity because it changes tool
availability and runtime behavior, not just conversation history.

## Scope

### Implemented baseline

- `cco <profile>` canonical profiled launch
- `isolate status`
- `isolate remove`
- `isolate fresh`
- `isolate fresh --clean`
- `isolate fresh --import-latest-host-session`
- Korean-first help and recovery copy
- linked host-facing seed setup
- linked current-project session store

### Phase-1 continuity target

- linked current-project native continuity on host and isolate `-c`
- explicit first-launch resume through `isolate fresh --import-latest-host-session`
- continuity metadata in `profiles.json`
- graceful degradation on continuity failure

### Out of scope for now

- project settings patching
- teammate spawn env hacks inside Claude Code
- isolate template marketplace
- session picker UI for arbitrary past host sessions
- persistent auto-resume policy
- harness continuity beyond the existing seed policy

## Suggested Implementation Order

1. Add continuity metadata types in `src/core/model/profile.ts`.
2. Normalize the new metadata in `src/infra/fs/json-profile-store.ts`.
3. Introduce a new continuity service for session discovery, link setup, and
   migration from old copied project stores.
4. Refactor `ensureIsolateHomeReady()` to return structured bootstrap results.
5. Make the default bootstrap host-lite and move clean/continuity into
   advanced `isolate fresh` flags.
6. Apply explicit first-launch `--resume <sessionId>` in
   `src/commands/launch-shared.ts`.
7. Keep `manifest.json` unchanged.
8. Update user-facing copy in:
   - `README.md`
   - `src/i18n/index.ts`
9. Add tests for:
   - default host-lite bootstrap
   - explicit continuity import
   - explicit clean bootstrap
   - continuity link/setup failure degrading to normal isolate launch
   - isolate remove/fresh clearing continuity metadata
