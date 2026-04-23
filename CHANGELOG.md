# Changelog

All notable changes to this project will be documented in this file.

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
