# Current-time clock module

Build current date/time displays with the native `current-date-time` widget, not a composition script or timer loop. The widget owns time calculation and update cadence; its widget-owned template owns presentation. Read [Current Date and Time](../widgets/current-date-time.md), [Widget Nodes](../widget-nodes.md), and [widget-owned templates](../widget-subcompositions.md) before editing.

## Create the clock owner

Inspect the active composition and current geometry before mutation. Load and create the native primitive, then set the requested format, frequency, timezone, and locale through typed widget fields. For a minute clock, a typical contract is:

```json
{
  "format": "h:mm A",
  "frequency": "60000",
  "timezone": "local"
}
```

Use `timezone: "local"` only when the Player device's local timezone is intended. Fixed numeric offsets do not provide daylight-saving behavior. Do not add JavaScript merely to format or advance the clock.

This is the default implementation for standard wall-clock requests. Do not add an operator-entered Time control, a manually updated Metric Text value, or a composition-script interval alongside it. Keep a composition script empty when the clock is the only requested runtime behavior.

## Build the widget-owned template

Resolve the owner relationship and open its template through the widget:

```bash
node scripts/composer-agent.js widget-subcompositions --id <clock-owner-id>
node scripts/composer-agent.js open-widget-subcomposition --id <clock-owner-id> --field composition --create
```

Retain the returned `identityScope.sessionToken` only for this uninterrupted template edit. Create and style a Metric Text element inside the open template, passing `--template-session <token>` to every guarded command. Inspect Widget Nodes, then link the native formatted output to that element:

```json
{
  "links": [
    {
      "nodeId": "format",
      "tileId": "<clock-text-id>",
      "propertyId": "text"
    }
  ]
}
```

```bash
node scripts/composer-agent.js widget-nodes --template-session <token>
node scripts/composer-agent.js link-widget-nodes --file <task-dir>/clock-links.json --template-session <token>
```

Verify that Widget Node readback reports `nodeId: "format"`, the intended Metric Text tile, and `propertyId: "text"`. Do not create a same-named Control Node in place of this native output.

## Reuse parent style controls

A public Metric Font or Color control normally belongs to the parent module, while the rendered clock text lives in the widget template. Keep the template active and link the existing ancestor control directly to the Metric Text field:

```bash
node scripts/composer-agent.js create-control --name "Body Font" --node-type metricfont --tile-id <clock-text-id> --property font --source-composition <parent-composition-id> --reuse-existing --template-session <token>
```

Use the equivalent `color` command for a compatible color or gradient field. The source must be the active template's parent or another inspected ancestor. Metric Font values bundle family, weight, and style; use a body-role control for the clock rather than sharing a bold display-role control unless flattening the hierarchy is intentional.

Before leaving the template, verify the Widget Node link, inherited Control Node links, text geometry, and font readback. Exiting copies the template to a new composition ID. Discard the template ID, text tile ID, node keys, link locations, and session token; reopen later through the durable clock owner and `composition` field.

After the first copy-on-exit, reopen once through the owner and inspect `widget-nodes` with the new session token. Confirm the current link still identifies semantic node `format` and the current Metric Text `text` field. A regenerated `keyId` is expected internal churn, not evidence of failure; follow the [Widget Node troubleshooting order](../widget-nodes.md#template-lifetime-and-verification) before reapplying anything.

## Player verification

Model readback proves structure and links, not ticking. Use the provided [clock scenario](current-time-clock-module-scenario.json) against a fresh handoff whose selected target contains the visible clock:

```bash
node scripts/composer-agent.js script-handoff --pipe --compact |
  node scripts/verifyComposition.mjs --handoff-file - --scenario-file references/recipes/current-time-clock-module-scenario.json --out <task-dir>
```

The scenario compares pixels from the selected Player target across two 61-second waits and requires zero Player error events. Unlike parent DOM text hashes, target screenshots include nested widget-owned rendering. Before running it, narrow each `region` to the clock's stable bounds within the selected composition when other content can move; the included full-target percentage is a safe starting shape only when the clock is the sole changing output. Inspect all three images to confirm two distinct, complete formatted values rather than partial transition frames or unrelated motion. Also test the requested timezone/locale and representative surrounding content. This scenario is not proof for daylight-saving transitions or untested timezones.
