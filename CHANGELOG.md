# Changelog

All notable changes to this project will be documented in this file.

## 0.4.0 - 2026-07-10

### Added

- Added provider profiles: `cco auth add <name> --provider [--from <ccswitch.json>]` runs Claude against an external Anthropic-compatible endpoint (`ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN`) while keeping the same isolate home and host-linked harness (skills, hooks, MCP) as OAuth profiles.
- Added ccswitch config import: token goes to the token store, whitelisted model env keys go to the profile, dropped keys are reported by name only, and `skipDangerousModePermissionPrompt` is never auto-translated.
- Added `/v1/models` discovery during provider setup: the probe doubles as connectivity verification and suggests `ANTHROPIC_DEFAULT_*_MODEL` tier mappings behind an explicit confirm; probe failures warn and never block saving.
- Added `--env-compat`, a one-shot launch flag that keeps subprocess auth env for a single run without persisting to the profile.

### Changed

- Removed the subprocess auth env policy prompt from `cco auth add`; new profiles always default to the safe scrub mode, bypass-permissions launches keep auto-switching to compat for that run, and explicitly stored profile values are still honored.
- Provider profiles persist without a `tokenRef` field so older cco versions safely ignore them instead of misusing the provider token as an OAuth token.

## 0.3.0 - 2026-04-23

### Added

- Added `cco ui`, an interactive profile control center TUI for launch, continue, host, doctor, and isolate maintenance flows.
- Added a richer dashboard mode with grouped actions, status chips, and topology-style profile context.

### Changed

- Promoted the profile control center as the main optional interactive surface on top of the existing direct CLI entrypoints.
- Aligned version reporting with `package.json` so shipped binaries and package metadata stay in sync.

### Fixed

- Added explicit confirmation for destructive TUI actions such as `fresh` and `clean fresh`.
- Stabilized repaint behavior after terminal resize and clear operations.
- Kept the control panel top-anchored for more consistent first render and resize behavior.
