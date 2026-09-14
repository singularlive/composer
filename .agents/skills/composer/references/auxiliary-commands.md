# Graphics, capture, script, and interruption commands

Use these command summaries only after reading the routed domain reference for the task.

## Graphics

| Command | Purpose |
| --- | --- |
| `primitives` | List supported primitive widgets and their field schemas. |
| `primitives --primitive text` | List only one primitive: `text`, `text-ticker`, `metric-text`, `metric-text-ticker`, `metric-text-style`, `metric-text-animation`, `metric-text-ml`, `rectangle`, `circle`, `gradient`, `html`, `image`, `ai-graphics`, `bodymovin`, `bodymovin-loop`, `sound`, `video-animation`, `video-background`, `video-clip`, `video-clip-with-audio`, `web-page`, `timer`, `date-time-countdown`, `current-date-time`, `grid`, or `table`. |
| `ensure-group` | Return or create the active composition's semantic managed graphics group. |
| `create --primitive <name> --name <label>` | **Targeted only:** create one unkeyed managed primitive for diagnosis or an isolated edit that cannot be represented declaratively. |
| `delete --id <tile-id>` | Delete one primitive. |
| `validate --file <spec.json>` | Validate a complete required-version-2 specification, including explicit stable-keyed Transform/Effect controls, without mutating anything. |
| `apply --file <spec.json>` | **Preferred for one existing composition:** compile semantic layout when present, then reconcile keyed graphics, grids, widget-data controls, and explicit root layout controls in one batch. |

The CLI commands are `apply` and `validate`; `graphics.apply` and `graphics.validate` are internal relay method names, not CLI aliases. Version 2 responses include expansion counts; all generated primitives retain the existing per-key reconciliation statuses. See [graphics.md](graphics.md).

## Local AI Graphics

| Command | Purpose |
| --- | --- |
| `ai-graphics validate --file <definition.json> [--values <sample.json>]` | Validate an AI Graphics widget definition locally against the production schema, install-size limit, JavaScript syntax, and optional sample field values. The lifecycle is not executed. No pairing or Composer session is required. |
| `ai-graphics preview --file <definition.json> [--values <sample.json>] --width <px> --height <px> [--timeline <In\|Out>] [--progress <0..1>] --output <path.png>` | Validate and execute the definition through the production AI Graphics host in headless Chrome, including lifecycle-shape checks. This is widget-level evidence only; it does not include composition scripts, parent transforms, links, neighboring tiles, or Player timeline orchestration. |

Both commands accept `--compact`. Preview defaults to `In` at progress `1`, uses the required vendored Playwright Core with system Chrome, blocks lifecycle network requests while allowing image, stylesheet, and font resources, and reports bounded console/resource diagnostics. Use [AI Graphics](widgets/ai-graphics.md) for the complete workflow and accuracy boundary.

## Capture

| Command | Purpose |
| --- | --- |
| `capture --target <root\|active> [--composition-id <ordinary-composition-id>] [--template-session <token>] [--wait-mode <smart\|timed>] [--timeline <In\|Out> --at <seconds>] [--measurements <path.json>] --output <path.png> [--timeout <seconds>] [--settle <seconds>] [--server <url>]` | Capture the root, active renderer, or an ordinary composition selected directly by ID through the standalone Player. `--composition-id` implies active targeting and preserves its parent runtime context. `smart` is the default for script-free, finite output; use `timed` for scripts or continuous motion. A widget-owned active target requires its current template token. Timeline position flags must be supplied together and require `smart`. `--measurements` writes a bounded version-1 Player geometry snapshot immediately before the PNG. Optional `--server` must match the server stored by pairing; it cannot retarget existing credentials. |

Use standalone capture for rendered visual evidence. See [capture.md](capture.md).

## Composition scripts

There is intentionally no paired Composer-agent command for reading, writing, or executing composition scripts. Build the composition and its Control Node contract with the commands above, then create the active-composition context once:

```bash
node scripts/composer-agent.js script-handoff --compact
```

To target an ordinary sub-composition without leaving Composer navigated there:

```bash
node scripts/composer-agent.js script-handoff --composition-id <sub-composition-id> --compact
```

The target and the initially active scope must be root or ordinary sub-compositions in the current scene. The command uses Composer's normal navigation and inspection paths, rejects widget-owned templates, and restores the composition that was active before the command. It refuses to navigate away from a widget-owned editing scope because exiting can replace that template with a new composition ID. Use `open-widget-subcomposition` for a widget-owned template, then run the unscoped handoff while that template is active.

Pipe fresh `script-handoff` output directly to `scripts/compositionScriptCli.js --handoff-file -`; use a path only for an intentionally managed short-lived handoff. This CLI pipeline is the only supported agent interface for composition scripts. The helper uses the dedicated REST endpoints internally; do not construct or invoke those requests directly. The handoff suggests the active composition as the script target and carries the scene/account-scoped authorization required by every dedicated script endpoint, so `get-script`, `put-script`, and `clear-script` do not require `--script-id` unless the caller intentionally overrides it. Explicit disconnection, `complete`, and credential expiry prevent later script access. Use `summary --full` with the same handoff for global, overlay, ambiguous, or out-of-scope discovery. Direct `--token` and `--host` operation is unsupported. See [composition-scripts.md](composition-scripts.md).

## Interruption and disconnection

Canceling the unclaimed pairing modal invalidates its one-time code. During active work, **Cancel operation** interrupts current agent sockets, restores Composer input, and returns `OPERATION_CANCELLED`; stop the current task and do not reconnect until the user gives a new instruction. It does not revoke the reusable JWT. **Disconnect AI Agent** or explicit `complete` revokes the authorization on the server and prevents later socket and script access with that token.

Use `status --state waiting-for-user` when you need input from the user. Send the exact blocking question or request, including an instruction to return to the AI Agent task, then run `finish-work` before waiting. Composer preserves that question and shows a waiting state after the lease is released; the next `start-work` clears it. The sole exception is revision approval under "Protect user content and public inputs" in [SKILL.md](../SKILL.md): keep the lease active during that question and follow its expiry, reacquisition, and fresh-inspection procedure after the answer. Do not call `complete` when an operation ends unless the user explicitly asks to disconnect the agent. A normal completion message is `status` followed by `finish-work`, not authorization revocation.
