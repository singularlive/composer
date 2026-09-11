# Installation and upgrade

Treat the installed skill directory itself as the payload root. It must contain `SKILL.md`, `package.json`, `package-lock.json`, `scripts/`, and `references/` directly; an extra nested `composer/` directory is an invalid installation even when an installer reports success.

When developing inside the Singular repository, use the in-place `.agents/skills/composer` payload. Do not install a second copy over it or infer an external installer command. Run its preflight directly:

```bash
node .agents/skills/composer/scripts/dependency-preflight.js
```

## Safe upgrade

1. Choose one unique 1–64 character connection name for this AI conversation and retain it before changing the installation. Never reuse another conversation's profile.
2. Stage the complete replacement in a sibling directory on the same volume. Do not delete or modify the working skill yet.
3. Verify the staged payload shape, read its `SKILL.md` and the references routed for the task again, and check the integer `SKILL_VERSION` in `scripts/composer-agent.js` against the Composer server version.
4. Run `npm ci --ignore-scripts` in the staged payload. Require every exact `package.json` dependency to match `package-lock.json` and resolve from the staged script location. Check `playwright-core` and Chrome only for capture or Player verification.
5. Rename the working directory to a backup and rename the verified sibling staging directory into place. A same-volume rename prevents agents from observing a partially copied skill. If replacement fails, restore the backup before retrying. Remove the backup only after the installed destination passes the same payload, version, and dependency checks.
6. Reread the installed, not staged, `SKILL.md` and task references. Pair with the retained connection name and continue only when output reports both `paired: true` and `acknowledged: true`.

Run `node scripts/dependency-preflight.js` from the installed payload before pairing; add `--capture` only when capture or Player verification is required. Preserve its diagnostic block when reporting failure. It contains only `skillVersion`, the generic `payloadRoot`, Node expected/actual major versions, lockfile status, package expected/actual versions, originating script names, stable error codes, and optional Chrome availability. Do not replace those fields with complete paths, resolved filenames, environment values, npm cache locations, or raw module stacks.

Never trust generic installer exit text alone. Verify every requested destination independently by inspecting its final payload root, version, and dependencies. A destination that is absent, nested incorrectly, stale, or unresolved is a failed installation even if another destination succeeded.

## Windows troubleshooting

- If npm reports cache access or ownership errors, use a writable command-local cache, for example `$env:npm_config_cache = Join-Path $env:TEMP 'composer-agent-npm-cache'`, for the staged `npm ci`. Do not weaken permissions on a shared cache.
- If npm's Git dependency fetch fails only because the system Git TLS backend cannot initialize, use a command-local fallback such as `$env:GIT_CONFIG_COUNT='1'; $env:GIT_CONFIG_KEY_0='http.sslBackend'; $env:GIT_CONFIG_VALUE_0='openssl'`. Do not change global Git configuration. Remove the command-local variables after the install attempt.
- Reject staging or destination path segments that Windows treats as reserved device names, including `CON`, `PRN`, `AUX`, `NUL`, `COM1` through `COM9`, and `LPT1` through `LPT9`, with or without extensions.
- Antivirus, indexing, or a running process can temporarily hold files. Keep the verified staging directory intact, stop processes using the old skill, and retry the same-volume rename. Do not fall back to deleting the working copy before a complete replacement is ready.

Dependency vulnerability findings are review inputs, not permission to change locked versions during installation. Record them separately, assess runtime reachability and compatibility, and upgrade only through a dedicated tested change.
