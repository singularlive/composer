# Command reference

All commands run through the bundled client:

```bash
node scripts/composer-agent.js <command> [options]
```

Add `--compact` to `inspect`, `get`, `apply`, or `control-nodes` for minified output. Compact output still contains identities, names, runtime values, control links, and errors. For `apply`, the flag minifies JSON whitespace but intentionally does not reduce the response shape.

The client preserves stdout for command JSON and pipelines. After every relevant command success or failure, stderr emits `COMPOSER_FINALIZATION_REQUIRED` to remind the caller that any work lease acquired during the task must be released before yielding. A successful `finish-work` emits `COMPOSER_WORK_RELEASED` instead, and a successful `complete` reports authorization revocation. `pair` and `pair-intent` emit no lifecycle reminder because pairing does not acquire a work lease.

`--server <url>` is a global paired-command selector. When supplied, it must match the server stored during pairing; it never retargets credentials. This applies consistently to single and batch commands, including `set-timeline-animations`.

The flags `--compact`, `--selection`, `--summary`, `--selected`, `--italic`, `--underline`, `--always-execute`, `--create`, and `--remove` are booleans: pass them with no value (enabled) or with an explicit `true`/`false`. `--remove` applies to `set-behavior`. `--active` always takes an explicit `true` or `false` value.

Structured JSON inputs use files. Prefer a pre-approved agent-session temporary or scratch location that is already writable without another permission request; fall back to the operating-system temporary directory only when current permissions already allow it. Create one unique task directory in the selected location, write descriptive UTF-8 JSON files there, pass their paths with `--value-file`, `--params-file`, `--easing-file`, `--layout-file`, or an existing `--file` option, and remove the task directory in finally-style cleanup after success or failure. Relative paths resolve from the CLI working directory. If neither location is writable, stop and report the blocker. Value files may contain any valid JSON value; existing command validation still determines which shapes and types are accepted. `get-many --ids` accepts comma-separated text only and rejects JSON-array syntax.

## Command selection policy

- **Preferred** commands are the normal path for the scope they represent.
- **Targeted only** commands remain supported because they have a distinct isolated-edit, repair, diagnosis, navigation, or unsupported-structure use case. Never decompose a supported batch or orchestration into these commands after the atomic operation fails; correct the manifest and rerun it.
- Superseded commands and aliases with no distinct use case are absent from the CLI and this reference. Do not infer or try old names.

## Session

| Command | Purpose |
| --- | --- |
| `pair [--server <url>] --code <code>` | Claim a one-time pairing code, store a 30-day scene/user JWT authorization, and automatically acknowledge it in Composer. `acknowledged: true` requires a correlated receipt from the editor through the Redis relay. The editor resumes this authorization after reload. The server defaults to `https://beta.singular.live/`; output reports `acknowledged` and the sanitized `credentialStorage` category. |
| `pair-intent [--server <url>] --intent-id <id> [--intent-secret -] [--device-name <name>]` | Orchestrator-only automatic pairing. Claim an authenticated short-lived intent after Composer binds it. Supply the secret through `COMPOSER_AGENT_INTENT_SECRET` or pipe it on stdin with `--intent-secret -`; literal secret arguments are rejected. The command waits up to two minutes across valid-but-unbound `409` responses and shared-rate-limit `429` responses, then stores and acknowledges credentials like `pair`. Normal runtime users should use the visible-code `pair` flow. |
| `start-work` | Acquire or renew the ten-minute task-level work lease. Run once before the first editor command in every task; Composer remains locked across individual command sockets. |
| `finish-work` | Release the current work lease and Composer input while preserving the reusable JWT authorization. Run before every final handoff or wait for user input. |
| `status --message <text>` | Show a concise update and renew an active work lease. It does not acquire a missing lease. |
| `complete` | Revoke the saved authorization only after the user explicitly asks to disconnect the AI Agent. Ordinary task completion uses `finish-work`. |
| `inspect` | Read the scene, preview inputs, active composition stack, selection, groups, tile summaries, and a `summary` count of groups, tiles, compositions, and controls. |
| `inspect --selection` | Return only the currently selected item (`id`, `type`, `groupId`). |
| `inspect --summary` | Return only the `summary` counts; the full tile list is omitted, so the payload stays small even in large compositions. |
| `script-handoff` | Inspect the active composition and its local Control Nodes once, then return versioned context for the scripting fast path, including the host, Composition API token, active paired-agent authorization, suggested script target, widgets, controls, data links, and node references. |

Pairing claims are rate limited to one request per second per client address across the claim endpoints. A `429` response has not consumed the pairing code; wait for its `Retry-After` interval and retry the same `pair` command. `pair-intent` performs this bounded retry internally.

`COMPOSER_AGENT_CREDENTIALS` has highest precedence and is never silently replaced when its configured file is unreadable or unwritable. Without that override, pairing first uses the normal profile file and falls back to a workspace-keyed file under the operating-system temporary directory only for `EACCES`, `EPERM`, or read-only-filesystem failures. Later commands discover that fallback deterministically, expired fallback credentials and `complete` remove it, and managed fallback identity is stable across working directories. Other read/write failures return `CREDENTIAL_READ_FAILED` or `CREDENTIAL_WRITE_FAILED` with a sanitized target category and remediation; no credential value or complete path is printed. Composer locks while the explicit work lease is active, not while individual sockets are connected. Editor commands without a lease fail with `WORK_NOT_STARTED`. **Cancel operation** releases the lease and interrupts active sockets without revoking the JWT; stop the current task on `OPERATION_CANCELLED`. **Disconnect AI Agent** revokes the authorization.

## Elements

| Command | Purpose |
| --- | --- |
| `get --type <tile\|group> --id <id>` | Read one complete tile or group. Tiles include layout, widget control data, and the widget field schema. |
| `get --selected` | Read the currently selected tile or group in full, without a separate `inspect` first. Fails with a clear error when nothing is selected. |
| `get-many --type <tile\|group> --ids <id-1,id-2>` | **Preferred for related targets:** validate every ID first, then read all of them. Returns no partial result. |
| `select --type <tile\|group> --id <id>` | Select an existing element in Composer. The `selected` result includes its `id`, `name`, and `elementType`. |
| `move --id <tile-id> --group-id <group-id> [--index <n>]` | Move a tile into another group in the active composition, or reorder it within its group. |
| `update --type <tile\|group> --id <id> --path <path> --value-file <value.json>` | Update one existing property. The `updated` result includes `id`, `name`, `elementType`, `namespace`, `path`, `previousValue`, and the applied `value`. |
| `update ... --namespace data --path <field-id> --value-file <value.json>` | Update one existing widget control value and return the same named `updated` result shape. |
| `fonts [--source <user\|account>] [--family <substring>]` | List safe font summaries from Composer's current font catalogs. |
| `set-font --id <tile-id> [...]` | Set catalog-backed Text family, weight, italic, underline, or alignment properties. |

`--value-file` must point to a readable valid JSON file whose value preserves the existing property's type. Null and undefined are rejected, so `update` can never act as a delete.

```bash
node scripts/composer-agent.js update --type tile --id <id> --path layout.left --value-file <temporary-directory>/left.json
node scripts/composer-agent.js update --type tile --id <id> --path name --value-file <temporary-directory>/headline.json
node scripts/composer-agent.js update --type tile --id <id> --namespace data --path <field-id> --value-file <temporary-directory>/team-name.json
```

Before using `update` on widget data or a linkable layout property, run `control-nodes` and match the requested `(elementId, propertyId)` against its `links` and `nodeRefs`. If a Control Node drives that property, do not call `update` for the linked target. Use `set-control-value` on the defining Control Node and verify both the control and linked element readback. Direct property updates are only for unlinked targets.

Use `fonts` and `set-font` for Text font changes; they validate catalog families and weights and supply required account-font metadata. See [text.md](text.md).

### Moving between groups

```bash
node scripts/composer-agent.js move --id <tile-id> --group-id <group-id>
node scripts/composer-agent.js move --id <tile-id> --group-id <group-id> --index 0
```

Both the tile and the target group must be in the active composition. `--index` is the 0-based position in the group's layer order, where `0` is front-most; omit it to append behind the group's existing items. Passing the tile's current group reorders it in place.

The move rewrites the target group's item priorities and each moved tile's `layout.zindex`, exactly as a layer-list drag does. It leaves the source group's remaining priorities untouched, and does not touch the tile's data, links, keyframes, or effects.

Any tile can be moved into or out of any group. Moving a declarative graphic out of the `AI Generated` group releases it from `graphics.apply`: its spec key is cleared, it becomes an ordinary element, and the response reports `releasedKey`. A later `apply` whose spec still lists that key will build a new element for it rather than reclaim the moved one.

## Groups

| Command | Purpose |
| --- | --- |
| `create-group --name <name>` | **Targeted only:** create one ordinary group outside a declarative managed specification. |
| `create-group --name <name> --layout-file <layout.json>` | **Targeted only:** create one ordinary group and atomically assign supported bounds, clipping, or appearance fields. |
| `configure-group --id <group-id> --layout-file <layout.json>` | **Targeted only:** atomically update one existing ordinary group, or repair managed-group geometry/appearance after readback. |
| `move-group --id <group-id> --index <n>` | Reorder one existing group without moving its children or changing managed metadata; index `0` is front-most. |
| `delete-group --id <group-id>` | Delete a group and everything in it. |

`delete-group` uses Composer's normal group deletion. As in the UI, a group cannot be deleted without its tiles: each one's data, links, and node references go with it, and any sub-composition it holds is removed too. The response lists the deleted tiles by id and name. Move anything worth keeping into another group first, and confirm the scope with the user before running it. It also refuses to delete a composition's last remaining group.

`AI Generated` is reserved as a group name — use `ensure-group` for it.

`move-group` follows Composer's native group-sort path. It rewrites every group's contiguous `priority` and `layout.zindex` values in one editor batch, preserving group contents, animation, Control Nodes, and managed ownership. Read the target group first and use the returned `groupOrder` as authoritative readback.

To rename a group, use the existing update command; group `name` is not immutable:

```bash
node scripts/composer-agent.js update --type group --id <group-id> --path name --value-file <temporary-directory>/group-name.json
```

Supported group layout fields are `left`, `top`, `width`, `height`, `rotateX/Y/Z`, `anchor`, the complete Effect-property set below, `groupClipChildren`, `groupBorderRadiusMode`, and the four `groupBorderRadiusValue*` fields. Read the complete group with `get --type group` before configuration. Move children with the existing `move` command; group membership remains Composer's hierarchy source of truth.

The Effect-property contract for tiles and groups is:

- visibility and transform: `visible`; `scaleX/Y` from -10000 to 10000 with `lockScale`; and `skewX/Y` from -89.9 to 89.9 degrees;
- shadow: `filterDropShadowMode` (`"none"`, `"box"`, or `"drop"`), `filterDropShadowX/Y` (-100 to 100 pixels), `filterDropShadowBlur` (0 to 100 pixels), `filterDropShadowSpread` (-50 to 50 pixels), `filterDropShadowColor` as `{r,g,b,a}`, and `filterDropShadowInset`;
- filters: `opacity` (0–100), `filterBlur` (0–300), `filterBrightness` and `filterContrast` (0–200), `filterGrayscale`, `filterInvert`, and `filterSepia` (0–100), `filterHueRotate` (0–360), and `filterSaturate` (0–500);
- render options: `backfaceVisibility`, active when the composition uses 3D perspective.

Prefer shadow, opacity, blur, and X/Y skew as the compact effective toolkit for routine graphic construction. The remaining properties are available when a specific design calls for them; do not add them speculatively. Renderer limitations and authoring workarounds—including the shadow zero-offset behavior—are defined once in [graphics.md](graphics.md#layout-math).

## Timeline animations

| Command | Purpose |
| --- | --- |
| `timeline-animations` | Read the In/Out effect, easing, and parameter catalog. |
| `set-timeline-animation --id <id> --timeline <In\|Out> --effect <id> [...]` | **Targeted only:** assign one isolated keyframed In/Out animation atomically. |
| `set-timeline-animations --file <choreography.json>` | **Preferred for related assignments:** assign up to 100 keyed Timeline animations in one rollback-safe batch, with optional `after` dependencies and relative `offset` values. |

Always read `timeline-animations` before assigning one. Timeline animation supports `--start`, `--duration`, `--params-file`, and `--easing-file`. Prefer the batch command whenever two or more assignments form one choreography. See [compositions.md](compositions.md).

## Property-change Update animations

| Command | Purpose |
| --- | --- |
| `update-animations` | Read the Update effect, easing, phase, and shared-setting catalog. |
| `set-update-animation --id <id> --phase <in\|out> --effect <id> [...]` | **Targeted only:** assign one isolated property-change Update phase and any explicitly supplied shared settings. |
| `set-update-animations --file <assignments.json>` | **Preferred for related assignments:** assign up to 100 keyed Update phases in one rollback-safe batch. |

Update animation supports `--duration`, `--params-file`, `--easing-file`, `--active`, `--always-execute`, and `--offset`. It has no Timeline `start` or `after` fields. Prefer the batch command for two or more related Update assignments.

## Continuous behaviors

| Command | Purpose |
| --- | --- |
| `behaviors` | Read the shared Composer behavior property, effect, easing, and limit catalog. |
| `behaviors --id <tile-id>` | Return the tile's current behaviors together with the catalog. |
| `set-behavior --id <tile-id> --property <id> [...]` | **Targeted only:** add or replace one isolated continuous behavior by property. |
| `set-behavior --id <tile-id> --property <id> --remove` | **Targeted only:** remove one isolated behavior without replacing the rest of the array. |
| `set-behaviors --file <assignments.json>` | **Preferred for related assignments:** upsert or remove up to 100 keyed behavior assignments in one rollback-safe batch. |

`set-behavior` accepts `--effect`, `--active <true|false>`, `--value-min`, `--value-max`, `--duration`, `--duration-range`, `--delay`, `--delay-range`, and `--easing-file`. Values are checked against the live shared catalog before one sorted behavior array is written.

## Compositions

| Command | Purpose |
| --- | --- |
| `create-composition --name <name> [--group-id <id>]` | **Targeted only:** create one ordinary on-the-fly sub-composition outside a representable orchestration. |
| `orchestrate --file <manifest.json>` | **Preferred for related ordinary modules:** from root, create or reuse up to 25 keyed modules, apply graphics plus separate Timeline, Update, and Behavior assignments, and set explicit parent timeline links in one rollback-safe operation. |
| `create-revision --description <text>` | Save the last persisted composition version as a numbered revision. |
| `open-composition --id <id\|root>` | **Targeted only:** navigate for inspection, an isolated edit, widget work, or a structure orchestration cannot represent. |
| `widget-subcompositions --id <widget-tile-id>` | Inspect a widget's composition-valued fields, static/dynamic mode, and exposed template controls. |
| `open-widget-subcomposition --id <widget-tile-id> [--field <field-id>] [--create]` | Resolve and open the widget's current hidden template, or create it through Composer's native widget-owned path when the field is empty and `--create` is passed. |
| `delete-composition --id <id>` | Recursively delete a sub-composition. |
| `control-composition --id <id> --state <in\|out>` | Take the root or a sub-composition in or out. |
| `timeline2 --active <true\|false>` | Enable or disable the dedicated Out timeline on the active composition. |

Prefer `orchestrate` when constructing or refining several related ordinary modules. It replaces a serial create/open/apply/animate sequence with one bounded rollback batch. Use the individual composition commands for isolated changes, widget-owned templates, or structures the version-1 manifest cannot represent.

See [compositions.md](compositions.md).

By design, widget-owned template IDs change when Composer exits standalone edit mode. Treat the owner tile plus field as stable and the raw composition ID as ephemeral; discard it on exit and prefer `open-widget-subcomposition` for every later navigation. See [widget-subcompositions.md](widget-subcompositions.md).

## Tables

| Command | Purpose |
| --- | --- |
| `update-table --id <table-tile-id> --file <table.json>` | Validate rows against the Table's current template controls, update supported table options and content, roll back partial failure, and verify the stored result. |

See [table.md](table.md).

## Control nodes

| Command | Purpose |
| --- | --- |
| `control-nodes` | Read ordered local control fields with their persisted metadata, widget-property data links, and tile/group layout node references. |
| `set-control-value --id <control-id> --value-file <value.json>` | Set one existing supported local control value after type validation and authoritative readback. |
| `update-control --id <control-id> --file <patch.json>` | Atomically patch supported metadata, rename the public ID with payload/link migration, or reorder one supported local control. |
| `create-control --name <name> --node-type <type> --target standalone --value-file <value.json>` | **Targeted only:** create one unlinked composition input for external payloads or script processing. |
| `create-control --name <name> --node-type <type> --tile-id <id> --property <field-id>` | **Targeted only:** create and link one isolated widget-data control. |
| `create-control --name <name> --node-type <number\|checkbox> --target layout --element-type <tile\|group> --element-id <id> --property <layout-property>` | **Targeted only:** create and link one explicitly requested Transform/Effect public control; never use as a graphic-authoring default. |
| `create-controls --file <controls.json>` | **Preferred for related controls:** validate, create, optionally link, and verify a batch atomically. |
| `delete-control --id <control-id>` | Delete one supported control through the normal cleanup path. |

See [compositions.md](compositions.md).

## Graphics

| Command | Purpose |
| --- | --- |
| `primitives` | List supported primitive widgets and their field schemas. |
| `primitives --primitive text` | List only one primitive: `text`, `rectangle`, `circle`, `image`, `aisvg`, or `table`. |
| `ensure-group` | Return or create the `AI Generated` group. |
| `create --primitive <name> --name <label>` | **Targeted only:** create one unkeyed managed primitive for diagnosis or an isolated edit that cannot be represented declaratively. |
| `delete --id <tile-id>` | Delete one primitive. |
| `validate --file <spec.json>` | Validate a complete required-version-2 specification, including explicit stable-keyed Transform/Effect controls, without mutating anything. |
| `apply --file <spec.json>` | **Preferred for one existing composition:** compile semantic layout when present, then reconcile keyed graphics, grids, widget-data controls, and explicit root layout controls in one batch. |

The CLI commands are `apply` and `validate`; `graphics.apply` and `graphics.validate` are internal relay method names, not CLI aliases. Version 2 responses include expansion counts; all generated primitives retain the existing per-key reconciliation statuses. See [graphics.md](graphics.md).

## Capture

| Command | Purpose |
| --- | --- |
| `prepare-capture [--target <root\|active>] [--wait-mode <smart\|timed>] [--timeline <In\|Out> --at <seconds>] [--measurements <path.json>] [--artifact-manifest <path.json>] [--timeout <seconds>] [--settle <seconds>] [--restore-after <seconds>]` | Prepare the existing Composer canvas for a full-resolution Browser screenshot. It returns a capture ID, authoritative marked selector, diagnostic clip, editor resolution, readiness state, optional Timeline/measurement metadata, and optional prepared artifact-manifest metadata; defaults to smart readiness and automatic restoration after 30 seconds. A manifest path is created exclusively and cannot equal the measurement path. Browser must measure the marked element before capture. |
| `finalize-capture --capture-id <id> --artifact-manifest <path.json> --output <image.png\|image.jpg> --evidence <path.json> [--browser <display-name>]` | Validate one Browser screenshot against its prepared transaction and version-1 geometry evidence, record PNG/JPEG dimensions, bytes, SHA-256, capture mode, and pixel scale, then restore Composer. Success changes the manifest to `complete`; validation failure writes `failed` with a stable sanitized error and still restores. Manifest, image, and evidence paths must be distinct. |
| `restore-capture --capture-id <id>` | Restore Composer zoom, overlays, scrolling, canvas layout, and target isolation after Browser capture. |
| `capture --target <root\|active> [--wait-mode <smart\|timed>] [--measurements <path.json>] --output <path.png> [--timeout <seconds>] [--settle <seconds>] [--server <url>]` | Capture the root or active renderer through the standalone Player. `smart` is the default for script-free, finite output; use `timed` for scripts or continuous motion. `--measurements` writes a bounded version-1 Player geometry snapshot immediately before the PNG. Optional `--server` must match the server stored by pairing; it cannot retarget existing credentials. |

Use Browser preparation only when Browser controls the already-open authenticated Composer tab; Composer pairing alone is not browser ownership. Browser and standalone accept the same `smart`/`timed`, settling, exact Timeline-position, and measurement evidence choices, although Browser still owns the actual screenshot bytes. Complete Browser captures through `finalize-capture`; use `restore-capture` only when finalization cannot be invoked. The agent workflow is Browser-owned canvas first and standalone second. See [capture.md](capture.md).

## Composition scripts

There is intentionally no paired Composer-agent command for reading, writing, or executing composition scripts. Build the composition and its Control Node contract with the commands above, then create the active-composition context once:

```bash
node scripts/composer-agent.js script-handoff --compact
```

Pipe fresh `script-handoff` output directly to `scripts/singularTokenScriptCli.js --handoff-file -`; use a path only for an intentionally managed short-lived handoff. This CLI pipeline is the only supported agent interface for composition scripts. The helper uses the dedicated REST endpoints internally; do not construct or invoke those requests directly. The handoff suggests the active composition as the script target and carries the scene/account-scoped authorization required by every dedicated script endpoint, so `get-script`, `put-script`, and `clear-script` do not require `--script-id` unless the caller intentionally overrides it. Explicit disconnection, `complete`, and credential expiry prevent later script access. Use `summary --full` with the same handoff for global, overlay, ambiguous, or out-of-scope discovery. Direct `--token` and `--host` operation is unsupported. See [composition-scripts.md](composition-scripts.md).

## Interruption and disconnection

Canceling the unclaimed pairing modal invalidates its one-time code. During active work, **Cancel operation** interrupts current agent sockets, restores Composer input, and returns `OPERATION_CANCELLED`; stop the current task and do not reconnect until the user gives a new instruction. It does not revoke the reusable JWT. **Disconnect AI Agent** or explicit `complete` revokes the authorization on the server and prevents later socket and script access with that token.

Use `status` when you need input from the user. Before asking a blocking question in the AI Agent task, send that question or request through `status` first, including an instruction to return to the AI Agent task, then run `finish-work` before waiting. Do not call `complete` when an operation ends unless the user explicitly asks to disconnect the agent. A normal completion message is `status` followed by `finish-work`, not authorization revocation.
