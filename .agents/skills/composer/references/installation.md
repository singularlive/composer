# Installation and upgrade

For a fresh installation where no skill exists at the target, install explicitly at one scope:

```bash
# Available across projects
npx skills add singularlive/composer -g -y

# Current project only; takes precedence over a global copy
npx skills add singularlive/composer -y
```

For an upgrade, do not run a generic installer against the working skill directory: it may copy in place. Follow **Safe upgrade** below and prepare the release in a sibling staging directory before the installed payload changes.

Treat the installed skill directory itself as the payload root. It must contain `SKILL.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`, `scripts/`, and `references/` directly; an extra nested `composer/` directory is an invalid installation even when an installer reports success. Run `node scripts/composer-agent.js doctor` from the selected installation after installing. Its `selectedInstallation` is the runtime being invoked. `installations` lists known project/global `.agents`, `.claude`, and `.codex` paths with canonical `realPath` values; aliases of one physical payload remain visible there, while `duplicateInstallations` contains each separate stale or shadowing payload once. Project skills take precedence over global skills when both are discovered.

The bundled scripts require Node.js 22.x. The core `composer-agent.js` embeds its small JavaScript dependencies, and the complete Playwright Core package is shipped under `scripts/vendor/playwright-core`; normal use requires neither `npm ci` nor `node_modules`. `dependency-preflight.js` always validates the exact vendored Playwright version and reports `NODE_VERSION_MISMATCH` before pairing when another Node major is active. `--capture` additionally checks for system Chrome.

When developing inside the Singular repository, use the in-place `.agents/skills/composer` payload. Do not install a second copy over it or infer an external installer command. Run its preflight directly:

```bash
node .agents/skills/composer/scripts/dependency-preflight.js
```

## Safe upgrade

Always install the latest available Composer skill release. Do not pin, retain, reinstall, or restore an older release because the currently deployed Composer protocol is behind. Protocol compatibility controls whether editor commands can run after installation; it does not control which skill version to install.

1. If the task will pair with Composer, choose one unique 1–64 character connection name for this AI conversation and retain it before changing the installation. Never reuse another conversation's profile. For an installation-only task with no pairing, no connection name is needed; do not create a credential profile merely to upgrade files.
2. Stage the complete replacement in a sibling directory on the same volume. Do not delete or modify the working skill yet.
3. Verify the staged payload shape, read its `SKILL.md` and the references routed for the task again, and run `node scripts/composer-agent.js doctor` without a connection. Require the latest available semantic package version, bundled core status, and integer protocol version to be present. Do not reject the staged release based on the protocol currently deployed by Composer.
4. Do not run `npm ci` in an installed skill. Require the staged payload to contain the exact vendored Playwright package and pass normal preflight before protection; run preflight with `--capture` when Chrome is also required.
5. Rename the working directory to a backup and rename the verified sibling staging directory into place. A same-volume rename prevents agents from observing a partially copied skill. If replacement fails, restore the backup before retrying. Remove the backup only after the installed destination passes the same payload, version, and dependency checks.
6. Reread the installed, not staged, `SKILL.md` and task references. Run `node scripts/composer-agent.js doctor --capture` from that destination and resolve any duplicate installation that could shadow it. This one command validates package/protocol metadata, Node, the self-contained core, locked vendored Playwright, and system Chrome; a separate `dependency-preflight.js --capture` run is not required when `doctor --capture` completes. Without `--capture`, Chrome remains intentionally unchecked. A server protocol mismatch may prevent pairing or editor commands until Composer is updated, but it does not invalidate or roll back the latest installation. Pair with the retained connection name when the server is compatible, and continue only when output reports both `paired: true` and `acknowledged: true`.

The external installer's `.skill-lock.json` is installer-owned metadata. After a manual staged upgrade, do not invent, hash, or hand-edit lock fields whose format is not documented by that installer. Preserve the existing lock file unchanged, report that its release metadata was not refreshed, and use payload readback plus `doctor --capture` as installation evidence. A future installer-supported metadata operation may reconcile it, but do not rerun a generic installer against the working directory merely to update the lock.

Run `node scripts/dependency-preflight.js` from the installed payload before pairing; it always verifies Playwright Core, and `--capture` additionally verifies Chrome. Preserve its diagnostic block when reporting failure. It contains only package/protocol versions, bundled-core status, the generic `payloadRoot`, Node expected/actual major versions, lockfile status, required package expected/actual versions, originating script names, stable error codes, and optional Chrome availability. `doctor` intentionally reports selected and duplicate installation paths; do not supplement either command with environment values, npm cache locations, credentials, or raw module stacks.

Never trust generic installer exit text alone. Verify every requested destination independently by inspecting its final payload root, version, and dependencies. A destination that is absent, nested incorrectly, stale, or unresolved is a failed installation even if another destination succeeded.

## Protocol mismatch and reconnect recovery

`COMPOSER_AGENT_VERSION_MISMATCH` reports both protocol numbers and which side is newer. Keep or install the latest available skill regardless of which side is newer. When the installed skill is newer, wait for Composer to reach the reported skill protocol, then reopen the paired composition. When Composer is newer, update the selected skill to the latest available release. Never downgrade the skill to match an older Composer deployment, and do not continue with editor commands while the versions differ.

After the versions match, `EDITOR_RELOAD_REQUIRED` means the paired composition still has a stale loaded editor: reload or reopen that composition and retry because pairing persists. `COMPOSER_EDITOR_DISCONNECTED` means no paired composition answered within the two-second cross-process grace: release any work lease and ask the user to reopen the paired composition. The Composer AI connection starts automatically; do not instruct the user to open or foreground its panel. A new pairing code is needed only when authorization is missing, expired, or revoked.

## Windows troubleshooting

- If Git reports `Filename too long`, use a short sibling staging path on the destination volume and enable long paths for that Git command only, for example `git -c core.longpaths=true clone --depth 1 <repository> <short-path>`. Never change global Git configuration. Keep the staging directory on the same volume as the installed skill so the verified replacement can use rename rather than recursive copying.
- If npm reports cache access or ownership errors, use a writable command-local cache, for example `$env:npm_config_cache = Join-Path $env:TEMP 'composer-agent-npm-cache'`, for the staged `npm ci`. Do not weaken permissions on a shared cache.
- If npm's Git dependency fetch fails only because the system Git TLS backend cannot initialize, use a command-local fallback such as `$env:GIT_CONFIG_COUNT='1'; $env:GIT_CONFIG_KEY_0='http.sslBackend'; $env:GIT_CONFIG_VALUE_0='openssl'`. Do not change global Git configuration. Remove the command-local variables after the install attempt.
- Reject staging or destination path segments that Windows treats as reserved device names, including `CON`, `PRN`, `AUX`, `NUL`, `COM1` through `COM9`, and `LPT1` through `LPT9`, with or without extensions.
- Antivirus, indexing, or a running process can temporarily hold files. Keep the verified staging directory intact, stop processes using the old skill, and retry the same-volume rename. Do not fall back to deleting the working copy before a complete replacement is ready.

Dependency vulnerability findings are review inputs, not permission to change locked versions during installation. Record them separately, assess runtime reachability and compatibility, and upgrade only through a dedicated tested change.
