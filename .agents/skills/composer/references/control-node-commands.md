# Control Node commands

Use these command contracts with [control-nodes.md](control-nodes.md) when designing or changing the public input model.

## Control nodes

| Command | Purpose |
| --- | --- |
| `control-nodes` | Read ordered local control fields with their persisted metadata, widget-property data links, and tile/group layout node references. |
| `metric-fonts [--source <catalog\|account>] [--family <query>]` | List bounded Font 2 families with available weights, styles, and metric subsets; URLs and metric geometry are omitted. |
| `set-control-value --id <control-id> --value-file <value.json>` | Set one existing supported local control value after type validation and authoritative readback. |
| `set-control-font --id <control-id> [--family <name>] [--weight <weight>] [--style <style>] [--subset <subset\|auto>] [--font-source <catalog\|account>]` | Resolve and set one Metric Font control from the authoritative Font 2 catalog. Caller-supplied metrics and URLs are not accepted. |
| `create-table-control --file <table-control.json> [--source-composition <root\|ancestor-id>]` | **Targeted only:** atomically create one Table group, field, column schema, options, and strict initial row set in the active composition or an active-stack ancestor. |
| `set-table-control --id <control-id> --file <rows.json>` | Replace all rows of one existing Table control after strict validation against its persisted schema. The file may be an array or `{ "rows": [...] }`. |
| `update-table-control --id <control-id> --file <update.json> [--preview]` | Preview or atomically apply schema, option, and optional whole-row changes with explicit rename and data-loss rules. |
| `link-table-control --id <control-id> --tile-id <id> --property <field-id> [--source-composition <root\|ancestor-id>] [--replace]` | Link an existing Table control row-array payload to a native `table` or `json` widget field. |
| `unlink-table-control --tile-id <id> --property <field-id>` | Remove a Table Control Node link from a native `table` or `json` widget field without changing its value or source control. |
| `press-control --id <control-id>` | Atomically press one Button control by persisting a fresh, monotonic native event timestamp. |
| `timer-action --id <control-id> --action <start\|play\|pause\|reset>` | Apply one native Time Control action with elapsed-time accounting and authoritative readback. Prefer this shell-safe spelling; `control-time` remains a compatibility alias. |
| `update-control --id <control-id> --file <patch.json>` | Atomically patch supported metadata, rename the public ID with payload/link migration, or reorder one supported local control. |
| `create-control-container --file <container.json>` | Create one native ordinary Control Node container with ordered control membership and optional editor metadata. Same-title reapplication is idempotent only when the supplied definition already matches. |
| `configure-control-container --id <container-id> --file <configuration.json>` | Atomically update one ordinary container's metadata, order, and/or complete ordered membership. Table groups are rejected. |
| `delete-control-container --id <container-id>` | Delete one ordinary Control Node container while preserving its controls, values, and links. Table groups are rejected. |
| `create-control --name <name> --node-type <type> --target standalone --value-file <value.json>` | **Targeted only:** create one unlinked composition input for external payloads or script processing. |
| `create-control --name <name> --node-type button --target standalone` | **Targeted only:** create one native Button event input. It does not accept `--value-file`. |
| `create-control --name <name> --node-type timecontrol --target standalone` | **Targeted only:** create one native Time Control stopped at zero. It does not accept `--value-file`. |
| `create-control --name <name> --node-type location --target standalone --value-file <value.json>` | **Targeted only:** create one Location input from `{text,long,lat}` with a string label and finite numeric coordinates. |
| `create-control --name <name> --node-type selection --tile-id <id> --property <field-id> <--options-file <options.json>\|--options-url <url>> --format <text\|color\|image> [--replace]` | **Targeted only:** create a named-value Selection linked to a compatible Text/Text Area, Color/Gradient, or Image field according to its format. `--replace` moves only this property from its prior control and reports that link as `previousLink`; verify the prior control retains every other link. Remote options load asynchronously, so URL-backed creation preserves the current field value rather than claiming it matches a remote option ID. |
| `create-control --name <name> --node-type selection --target standalone --value-file <value.json> <--image-options-csv-file <catalog.csv>\|--image-options-csv <csv-text>>` | **Targeted only:** convert a Dashboard export or pasted `name,url` list into native inline image Selection options. |
| `create-control --name <name> --node-type metricfont --target standalone [--family <name>] [--weight <weight>] [--style <style>] [--subset <subset\|auto>] [--font-source <catalog\|account>]` | **Targeted only:** create one catalog-resolved Metric Font input; defaults to Open Sans and a compatible native variant. |
| `create-control --name <name> --node-type json --target standalone --value-file <value.json>` | **Targeted only:** create JSON Text from a JSON file whose top-level value is an empty or parseable JSON string, not an object. |
| `create-control --name <name> --node-type infotext --target standalone --info-mode <static\|dynamic> --value-file <value.json>` | **Targeted only:** create one sanitized form-only data display. Static content is metadata-owned; dynamic content can be replaced through the payload. |
| `create-control --name <name> --node-type <type> --tile-id <id> --property <field-id> [--source-composition <root\|ancestor-id>] [--reuse-existing]` | **Targeted only:** create and link one isolated widget-data control. The target stays in the active composition; the optional source defines the control in root or another active-stack ancestor. `--reuse-existing` links an exact same-name/type control already in that source instead of creating a suffixed duplicate. Reusing a formatted Selection on a non-Selection field also requires its matching `--format` and option-source flag. |
| `create-control --name <name> --node-type <number\|checkbox> --target layout --element-type <tile\|group> --element-id <id> --property <layout-property> [--source-composition <root\|ancestor-id>]` | **Targeted only:** create and link one explicitly requested Transform/Effect public control; never use as a graphic-authoring default. The optional source follows the same ancestor rule. |
| `create-controls --file <controls.json>` | **Preferred for related controls:** validate, create, optionally link, and verify a batch atomically. Linked entries may set `sourceCompositionId` to `root` or an active-stack ancestor ID. |
| `delete-control --id <control-id>` | Delete one supported control through the normal cleanup path. |

### Control Node containers

Control Node containers are flat editor groups for organizing public controls; they are unrelated to composition graphic groups. Every agent-authored public control must be assigned to a semantic ordinary container before handoff. Group by operator workflow, default to Large (`width: "double"`), and use Small (`width: ""`) only for a concrete compact-layout reason. Create one from a semantic specification:

```json
{
	"title": "Player controls",
	"width": "double",
	"toolTip": "Controls for the selected player",
	"controlIds": ["Enabled", "Name", "Score"],
	"activeId": "Enabled",
	"index": 0
}
```

`controlIds` accepts public control IDs or internal `keyId` values and defines the complete ordered membership. Every control can belong to at most one ordinary container, so listed controls are removed from other ordinary containers. Former children omitted from the target list become ungrouped. An omitted `controlIds` preserves membership. `activeId` must be empty or identify a Checkbox in the resulting membership; moving the active Checkbox out clears it unless the same request explicitly supplies an invalid replacement.

Supported metadata is `title`, `width` (`""` for Small or `"double"` for Large), `toolTip`, `activeId`, `usePreset`, `presetSourceUrl`, `usePresetFilter`, `usePresetReload`, and `displayVariantRelevance`. `presetSourceUrl`, when supplied, must be an absolute or protocol-relative credential-free HTTP(S) URL no longer than 2,048 characters; explicitly enabling `usePreset` requires a valid effective URL. `index` is the zero-based position in the flat container list. Create defaults to Large width, empty tooltip and active Checkbox, no children, and the end of the list. Existing same-title containers are returned unchanged only when every supplied property already matches; a different definition is a conflict. Configure preserves every omitted property.

For one large Textarea or JSON editor that uses the complete panel body, create a Large ordinary container with exactly one child and apply this pattern:

```json
{
	"container": {
		"title": "My Text",
		"width": "double",
		"controlIds": ["My Text"]
	},
	"control": {
		"id": "My Text",
		"type": "textarea",
		"hideTitle": true
	}
}
```

The example combines the relevant shapes; create or update the control and container through their separate typed commands. Match the container title to the child control's public name, set the child's `hideTitle` metadata with `update-control`, and keep it as the container's only child. The container supplies the visible panel title, while the hidden child title makes the Textarea or JSON field span both form columns. Use `textarea` for unrestricted multi-line text. Use `json` for the validated Ace JSON editor and set its `height` metadata to `100px`, `150px`, `200px`, `250px`, `300px`, or `400px` when needed. Do not use `jsonfile`; that type renders a file/URL picker rather than an inline JSON editor. A standalone child is valid when an external payload or composition script consumes it and no widget link is required.

Table groups and Table fields are specialized compound Control Nodes and cannot be created, configured, moved, or deleted through ordinary-container commands. Use the dedicated Table commands instead. Deleting an ordinary Control Node container preserves all child fields, payload values, data links, and node references; this deliberately differs from recursive composition graphic-group deletion. Reinspect with `control-nodes` after every mutation and treat its ordered `groups` result as authoritative.

Metric Font controls may be linked only to one explicitly named `metricfont` widget field. Linked creation copies that field's current complete value and does not accept font-selection flags. `create-controls` does not accept Metric Font entries because catalog resolution must finish before mutation. The native bulk **Connect to Metric Widgets** UI action is intentionally not exposed.

The native `gradient` Control Node type is intentionally unsupported by these commands. Author structured gradients directly on compatible widget fields or use complete widget-runtime gradient objects inside composition scripts; do not expose their implementation-specific payload through an external control surface. A supported `color` control may target a Gradient field only when the public input is intentionally one solid color.

### Table Control Nodes

Table Control Nodes are a compound Control App input, distinct from the Table widget and `update-table`. Create one from a semantic specification:

```json
{
	"name": "Players",
	"columns": [
		{ "id": "Name", "title": "Player", "type": "text" },
		{ "id": "Score", "type": "number", "defaultValue": 0 },
		{
			"id": "Status",
			"type": "selection",
			"selections": [
				{ "id": "ready", "title": "Ready" },
				{ "id": "out", "title": "Out" }
			]
		}
	],
	"rows": [
		{ "Name": "Alice", "Score": 10, "Status": "ready" }
	],
	"options": {
		"height": "auto",
		"maxLines": 20,
		"minRows": 0,
		"maxRows": 20,
		"allowAddDeleteRows": true,
		"allowSorting": true
	}
}
```

Supported column types are `text`, `textarea`, `image`, `number`, `normalizednumber`, `counter`, `color`, `checkbox`, `selection`, `datetime`, and `location`. Column IDs must be unique normalized Control Node names. Optional widths are `tiny`, `small`, `medium`, `large`, and `x-large`. Number columns accept a positive finite `step`; normalized numbers additionally accept finite `low <= high`; Selection requires 1–100 unique `{id,title}` options. Optional `defaultValue` must exactly match the declared type.

Every row must be an object containing every declared column exactly once. Values are never coerced, clamped, padded, truncated, or silently removed. Row count must remain within `minRows` and `maxRows`, and the complete schema/options/rows request is limited by the normal 32 KiB Control Node value bound. `datetime` uses an integer Unix millisecond timestamp; `color` uses an RGBA object; `location` uses `{text,long,lat}` with finite coordinates.

Creation defaults to auto height, 20 UI lines, 0–20 data rows, operator row add/delete enabled, and sorting enabled. Reapplying an identical creation is idempotent; a same-name different definition is a conflict. `--source-composition` may place the complete Table group/field/payload in root or another active-stack ancestor.

For schema or option changes, run `update-table-control --preview` first with a JSON object containing any of `columns`, `options`, `rows`, `renames`, and `allowDataLoss`. Unchanged column IDs preserve cells. Renames use an explicit old-ID-to-new-ID object. New columns default every retained row from the new column's validated default. Removed columns report discarded cell counts and require `allowDataLoss: true` when rows exist. A retained or renamed type change must validate every preserved value, or the request must supply a complete replacement `rows` array. Preview performs the complete validation and returns the migrated rows/report without mutation; apply writes field metadata and payload in one verified rollback batch. Reapplication is idempotent.

Table payloads are JSON row arrays and may link to native `table` fields or compatible `json` fields. In particular, the Table widget accepts that array directly through `tableContent`; no `{content: ...}` wrapper is required for a linked value. The source may be local, root, or an active-stack ancestor. A matching link is idempotent, a different link requires explicit `--replace`, and unlink preserves the target value and source control. Table remains unsupported in `create-control`, `create-controls`, generic value/metadata commands, and declarative graphics. Row-level edits, nested/unsupported column types, and dormant `sortByColumn` metadata remain unsupported. Use `control-nodes` to inspect metadata, rows, ownership, and links, and `delete-control` for native field/group/payload/link cleanup.

See [compositions.md](compositions.md).
