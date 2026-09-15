# Composer Agent skill changelog

Protocol versions are listed because Composer editor commands require an exact protocol match. Always install the latest available skill; never downgrade to match an older Composer deployment.

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