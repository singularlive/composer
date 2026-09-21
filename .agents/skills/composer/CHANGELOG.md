# Composer Agent skill changelog

Protocol versions are listed because Composer editor commands require an exact protocol match. Always install the latest available skill; never downgrade to match an older Composer deployment.

## 1.7.19 - Protocol 152

- Default newly created native Timers to End disabled; preserve explicit settings and enabled endpoints on older saved models that omit the flag.
- Place Output format and Updates after Direction, and End enabled immediately before the End fields.

## 1.7.18 - Protocol 151

- Add native Timer `endEnabled` metadata, defaulting to true for existing controls.
- Support unbounded duration without endpoint stopping or overtime, retaining end and stop settings for re-enabling.
- Document stopwatch authoring and endpoint-mode transitions; public commands and state shape are unchanged.

## 1.7.17 - Protocol 150

- Document native Timer endpoint Restart, Running/Paused/Ended/Overtime feedback, and fractional-preserving whole-unit edits.
- Document formatted text preservation when deleting a native Timer with local or descendant linked consumers.
- Keep existing CLI and script commands unchanged; legacy Time Control and Timer widgets remain independent.

## 1.7.16 - Protocol 149

- Correct native Timer terminology and its `control-node-timer.md` and `timerChanged` contracts; legacy Time Control and production Timer widgets are unchanged.
- Repair ordinary-container verification after native child deletion and empty membership normalization; expose dangling membership and bounded, sanitized mismatch diagnostics.
- Clarify upgrade-first type discovery, nested repository staging, non-destructive container recovery, and host-message counter limits.
- Give each future protocol change a new semantic package version and matching changelog entry. Protocols 143 through 148 previously reused 1.7.15; this entry corrects that packaging gap without inventing historical releases.

## 1.7.15 - Protocol 142

- Add `begin-work`, which acquires the task lease and waits for editor readiness in one invocation.
- Automatically release a newly acquired lease when `begin-work` cannot establish readiness.
- Clarify that dependency preflight is repeated only when the installed version or its runtime inputs change.

## 1.7.14 - Protocol 141

- Route installation and upgrade tasks through the safe staged-replacement procedure before files change.
- Add command-local Windows long-path recovery, install-only connection guidance, installer lock-file boundaries, and one-command `doctor --capture` verification.
- Make `doctor` discover `.agents`, `.claude`, and `.codex` project/global installs, resolve links and junctions, distinguish aliases from separate stale copies, and report canonical paths.
- Include this changelog in the installed payload.

## 1.7.13 - Protocol 140

- Treat the exact loaded widget version's live schema as authoritative for every widget field.
- Preserve complete sanitized field metadata in compact existing-tile inspection.
- Expand release/version consistency checks across generated runtime and package metadata.

## 1.7.12 - Protocol 139

- Harden installation guidance, payload validation, and latest-release behavior across protocol mismatches.

## 1.7.11 - Protocol 138

- Add composition-script `timerAction` support for Time Control.
- Add the sports game clock with overtime recipe and verification scenario.
- Expand Time Control metadata and scenario validation.