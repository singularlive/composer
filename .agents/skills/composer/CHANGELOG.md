# Composer Agent skill changelog

Protocol versions are listed because Composer editor commands require an exact protocol match. Always install the latest available skill; never downgrade to match an older Composer deployment.

## 1.7.25 - Protocol 158

- Prefer direct widget-property writes for script-fetched data, while permitting justified Control Node exceptions; retain single-authority and Control App propagation boundaries.

## 1.7.24 - Protocol 157

- Add bounded `assertPixelsMatch` checkpoints so independent expected-state captures can reject blank or stale Table output, not merely detect pixel changes.
- Document directly linked subtitle bounds/input ordering and a tested one-frame coalescing example with empty-input and close cleanup.

## 1.7.23 - Protocol 156

- Keep script-fetched rows and runtime status out of Control Nodes; rewrite the public-sheet recipe to update unlinked widgets directly with padded rows and clamped page output.
- Accept strict boolean Checkbox values in Table/Grid row validation and local Update-animation batches inside the active widget-template session, preserving cross-scope and token guards.
- Document observed Table reliability workarounds, payload shapes and numeric-string page-link limits; clarify Metric Text listener arguments and rendered-bounds accent sizing.

## 1.7.22 - Protocol 155

- List accessible app template IDs and names, and read the root composition's declared template match.
- Assign or clear `defaultAppID` with catalog validation, cancellation checks, native Undo and verified readback.

## 1.7.21 - Protocol 154

- Skip revision questions and automatic checkpoints for an inspected empty starter scene containing only default groups and an optional empty default sub-composition.
- Keep the exception for the whole initial-build task; retain revision approval for existing authored content and explicit revision requests.

## 1.7.20 - Protocol 153

- Add a public-sheet Table candidate recipe with exact source identity, single row authority, guarded polling and explicit Player/live-source verification gates.
- Diagnose empty script handoffs and sanitize malformed JSON errors; document fresh credential-safe pipelines with explicit connection profiles.
- Clarify first-build revision approval, snapshot/live ownership, root-first template exit and missing-Chrome handoff checks.

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