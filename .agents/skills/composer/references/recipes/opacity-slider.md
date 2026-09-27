# Opacity slider candidate

Use only when the user requests adjustable intensity for explicitly identified layers. A Number opacity slider provides both 0 as off and intermediate intensity; it need not be a Boolean toggle. Sharing one input across a dark gradient and gloss is a design choice requiring established scope, never a default for all decoration. Leave pattern images and other layers unchanged unless explicitly included.

Status: supplied endpoint captures support one completed task; the reusable same-session Player scenario below still requires execution against a dedicated composition. Do not present this candidate as a fully Player-verified recipe.

## Authoring

Read [Control Node ownership](../control-nodes.md), [creation and numeric compatibility](../control-node-creation.md), [editing](../control-node-editing.md), and [commands](../control-node-commands.md) for the supported operations. Retain revision and template-contract safeguards.

1. Inspect each intended tile/group opacity and its existing write authority. Record the affected-layer allowlist and excluded layers. Share a control only when both the requested scope and current values permit preserving appearance; unequal initial opacities need separate controls or an explicitly agreed behavior change.
2. Use a [configured `create-controls` entry](../control-node-creation.md#atomic-configured-controls): one `number`, the explicit layout-opacity `targets`, `metadata`, and an existing source-owned `container` with inspected `expectedControlIds`. These changes form one atomic operation. Use root ownership only for requested or established shared styling; otherwise keep it local. Finite numeric strings such as `"100.0"` are compatible across numeric fields; link directly without an equivalent-value layout rewrite, raw writes or implicit replacement.
3. Omit `reuseExisting` for a new source; set it only for an exact existing public ID and compatible type. Stop after a failed prerequisite; do not decompose a failed atomic operation. Cross-composition target fan-out and widget-template sessions remain outside this configured workflow.
4. Include a `metadata` patch such as the following for targets initially at 100. Preserve other metadata. If the initial value differs, retain it in initial/default/reset values rather than blindly applying 100.

```json
{
  "min": 0,
  "max": 100,
  "step": 1,
  "unit": "%",
  "showSlider": true,
  "defaultValue": 100,
  "resetValue": 100
}
```

5. Container placement appends without dropping or reordering existing members/settings. If no suitable container exists, create a Large container separately before the configured request; that prerequisite is not part of its transaction. Verify returned membership, range, slider, percentage unit, initial/default/reset values and every resolved native opacity reference.
6. Do not add or change scripts, timelines or layer structure. Test and restore the original appearance and source value, return to the intended editor scope, and release the work lease if acquired.

## Persistent Player scenario

Read [Player verification](../composition-scripting/debugging-and-verification.md). Use a dedicated fixture for retrospective testing, never reconnect to the user's completed graphic. Author two non-overlapping native visual layers inside one module, with both opacities linked to a root Number named `Gradient Opacity`, initially 100; put an unlinked pattern in a third non-overlapping region. Use known local/embedded assets, no composition scripts, and a fixed root output. Record exact target bounds and independent expected appearances before running.

This version-1 scenario assumes the root is the selected verification target and source owner. Replace the example regions with the inspected root-relative target bounds. The first and second thirds below are the two intended targets; the third is the excluded pattern. Keep one Player instance throughout; do not use `--fresh-page-per-frame` or separate capture commands.

```json
{
  "version": 1,
  "steps": [
    { "action": "jumpTo", "state": "In" },
    { "action": "waitForState", "equals": "In", "timeoutMs": 3000 },
    { "action": "setPayload", "payload": { "Gradient Opacity": 100 } },
    { "action": "wait", "milliseconds": 250 },
    { "action": "capture", "name": "opacity-100" },
    { "action": "setPayload", "payload": { "Gradient Opacity": 40 } },
    { "action": "wait", "milliseconds": 250 },
    { "action": "capture", "name": "opacity-40" },
    { "action": "assertPixelsChanged", "from": "opacity-100", "to": "opacity-40", "region": { "unit": "percent", "x": 0, "y": 0, "width": 33, "height": 100 } },
    { "action": "assertPixelsChanged", "from": "opacity-100", "to": "opacity-40", "region": { "unit": "percent", "x": 34, "y": 0, "width": 32, "height": 100 } },
    { "action": "assertPixelsMatch", "from": "opacity-100", "to": "opacity-40", "region": { "unit": "percent", "x": 67, "y": 0, "width": 33, "height": 100 } },
    { "action": "setPayload", "payload": { "Gradient Opacity": 0 } },
    { "action": "wait", "milliseconds": 250 },
    { "action": "capture", "name": "opacity-0" },
    { "action": "assertPixelsChanged", "from": "opacity-40", "to": "opacity-0", "region": { "unit": "percent", "x": 0, "y": 0, "width": 33, "height": 100 } },
    { "action": "assertPixelsChanged", "from": "opacity-40", "to": "opacity-0", "region": { "unit": "percent", "x": 34, "y": 0, "width": 32, "height": 100 } },
    { "action": "assertPixelsMatch", "from": "opacity-100", "to": "opacity-0", "region": { "unit": "percent", "x": 67, "y": 0, "width": 33, "height": 100 } },
    { "action": "setPayload", "payload": { "Gradient Opacity": 100 } },
    { "action": "wait", "milliseconds": 250 },
    { "action": "capture", "name": "opacity-restored" },
    { "action": "assertPixelsMatch", "from": "opacity-100", "to": "opacity-restored", "tolerance": 0 }
  ]
}
```

Run through a fresh bundled `script-handoff --pipe` directly into `verifyComposition.mjs --handoff-file - --composition-id root --scenario-file <task-dir>/opacity.json --out <task-dir>` only in an authorized disposable scene. The handoff is for verification, not permission to write scripts. Scenario payloads are runtime-local.

Pixel differences alone are not correctness: inspect both target appearances and compare each to independently established expected states, or use a bounded custom harness to assert both exact computed opacities (1, 0.4, 0, 1) plus pixels. Check the same renderer instance and unchanged pattern at every step. Account for intentional parent opacity, overlap and motion; fixed waits alone are not readiness proof. Require complete zero-error telemetry and asset readiness for an unqualified visual pass. Report model, captured appearance, live propagation and actual Control App operation separately. If a scenario fails before restoration, close its private Player and verify any separately changed saved state through Composer; never report restoration merely because it was the last planned step.