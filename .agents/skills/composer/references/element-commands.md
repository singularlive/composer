# Element, group, and Widget Node commands

Use these commands after inspecting the active composition and the relevant live schema.

## Widget Nodes

Widget Nodes are owner-supplied template outputs, not public Control Nodes. See [widget-nodes.md](widget-nodes.md) for their read-only schema, native link formats, compatibility, source scope, and verification workflow.

| Command | Purpose |
| --- | --- |
| `widget-nodes [--source-composition <self\|root\|ancestor-id>] --template-session <token>` | Read declared Widget Node fields and editor samples from the selected source, plus native Widget Node links targeting the active composition. The result includes `identityScope`, marking internal IDs as current-template-session handles and declared field IDs as the semantic addressing contract. |
| `link-widget-nodes --file <links.json> --template-session <token>` | Atomically link 1–100 declared outputs to existing widget fields or supported tile/group layout properties. Same-source reapplication is idempotent; replacing a different link requires `replace: true` on that entry. The result repeats `identityScope`; the command resolves current `keyId` values from semantic `nodeId` inputs. |
| `unlink-widget-nodes --file <links.json> --template-session <token>` | Atomically remove only links matching the specified Widget Node source and target. Absent links are unchanged; unrelated links are conflicts. The result repeats the same edit-session identity boundary. |

## Elements

| Command | Purpose |
| --- | --- |
| `get --type <tile\|group> --id <id>` | Read one complete tile or group. Tiles include layout, widget control data, and the widget field schema. |
| `get --selected` | Read the currently selected tile or group in full, without a separate `inspect` first. Fails with a clear error when nothing is selected. |
| `get-many --type <tile\|group> --ids <id-1,id-2>` | Read complete related tiles or groups, including widget schemas for tiles. Validates every ID first and returns no partial result. |
| `get-layouts --type <tile\|group> --ids <id-1,id-2>` | **Preferred for homogeneous layout reads:** return only identity, name, and supported layout fields for up to 100 elements. |
| `get-layouts --file <targets.json>` | **Preferred for mixed layout reads:** read tiles and groups together from one `{ "elements": [{ "type", "id" }] }` file. |
| `set-layouts --file <assignments.json>` | **Preferred for coordinated geometry:** validate and atomically update up to 100 mixed tile/group layouts from one file. |
| `get-properties --file <targets.json>` | **Preferred for selected values:** project up to 100 requested top-level widget fields or element names across one or more tiles/groups. |
| `set-properties --file <updates.json>` | **Preferred for related ordinary values:** validate and atomically update up to 100 requested top-level widget fields or element names across one or more tiles/groups. |
| `select --type <tile\|group> --id <id>` | Select an existing element in Composer. The `selected` result includes its `id`, `name`, and `elementType`. |
| `move --id <tile-id> --group-id <group-id> [--index <n>]` | Move a tile into another group in the active composition, or reorder it within its group. |
| `update --type <tile\|group> --id <id> --path <path> --value-file <value.json>` | Update one existing property. The `updated` result includes `id`, `name`, `elementType`, `namespace`, `path`, `previousValue`, and the applied `value`. |
| `update ... --namespace data --path <field-id> --value-file <value.json>` | Update one existing widget control value and return the same named `updated` result shape. |
| `fonts [--source <user\|account>] [--family <substring>]` | List safe font summaries from Composer's current font catalogs. |
| `set-font --id <tile-id> [...]` | Set catalog-backed Text family, weight, italic, underline, or alignment properties. |
| `set-metric-font --id <tile-id> [--property <field-id>] [--family <family>] [--weight <weight>] [--style <style>] [--subset <subset>] [--font-source <catalog\|account>]` | Set a catalog-backed Metric Font field directly on an unlinked widget. The field defaults to `font`. |
| `upgrade-metric-widgets --ids <tile-id-1,tile-id-2>` | Atomically upgrade explicit Text v2 and Simple Ticker tiles in the active composition to their Metric equivalents. |

`--value-file` must point to a readable valid JSON file whose value preserves the existing property's type. Exact widget fields with schema type `datetime` additionally allow a native unset empty string to become an integer Unix millisecond timestamp within the JavaScript Date range, or return to the empty-string sentinel. Other date strings, fractional timestamps, and out-of-range timestamps are rejected. Null and undefined are rejected, so `update` can never act as a delete.

Use `get-properties` as the field shortcut when complete native widget data and schema would be noisy: request only top-level values such as `text`, `alignment`, and `overflow`. Layout and other tile model properties do not use a `model` namespace. For both `get-properties`/`set-properties` and scalar `update`, `element` owns the element name, while `data` owns widget payload fields; use `get-layouts`/`set-layouts` for layout.

`get-layouts` is the context-efficient read path when complete widget data and schemas are unnecessary. Its homogeneous form uses `--type` plus comma-separated `--ids`; its mixed form uses `--file`. Do not combine those forms. Every result entry is `{ "type", "id", "name", "layout" }` and preserves request order.

`set-layouts` accepts `{ "elements": [{ "type": "tile|group", "id": "...", "layout": { ... } }] }`. Each target may appear once and each partial `layout` must be non-empty. Supported shared fields are `left`, `top`, `width`, `height`, `rotateX/Y/Z`, `anchor`, and the Effect-property set below; groups additionally support clipping and border-radius fields. The complete batch and projected response size are preflighted before mutation. Missing elements, missing tile properties, invalid values, duplicate targets, and Control Node or Widget Node layout links reject the whole operation; supported optional group fields follow `configure-group` and may be added. Successful writes share one editor batch; an unexpected write failure rolls back every target. Results contain each target's previous requested values, complete supported resulting layout, and `changed` status.

```json
{
	"elements": [
		{ "type": "group", "id": "<group-id>", "layout": { "left": 7, "top": 2.5, "width": 76, "height": 7.2 } },
		{ "type": "tile", "id": "<tile-id>", "layout": { "left": 0, "top": 0, "width": 100, "height": 100 } }
	]
}
```

`get-properties` and `set-properties` share one ordered manifest shape. Each element may appear once and has a non-empty `properties` array. Every property explicitly identifies `namespace` as `data` for one top-level widget field or `element` for the element `name`; `set-properties` additionally requires `value`. Nested data paths, layout paths, other element properties, duplicate targets/properties, and missing fields reject the complete operation. `get-properties` can read linked widget fields. For `set-properties`, type changes, null/deletion values, and linked widget fields reject the complete write; update a linked field's defining source instead. Use `set-layouts`, `set-font`, and the dedicated widget/control commands for their stronger domain contracts.

Generic property values are limited to 32 KiB after `JSON.stringify`. The sole larger widget-data exception is AI Graphics widget `4792` field `definition`, which accepts up to 256 KiB after serialization through scalar updates, projected property writes, primitive creation, graphics, and orchestration. Other AI Graphics fields and all other widget or element values retain 32 KiB. The relay permits command and response envelopes up to 1 MiB so the escaped definition and authoritative readback can round-trip; this transport capacity does not raise any other per-value limit.

```json
{
	"elements": [
		{
			"type": "tile",
			"id": "<rectangle-1>",
			"properties": [
				{ "namespace": "data", "path": "bevelStyle", "value": "outside" },
				{ "namespace": "data", "path": "bevelSize", "value": 1 }
			]
		},
		{
			"type": "tile",
			"id": "<rectangle-2>",
			"properties": [
				{ "namespace": "element", "path": "name", "value": "Rounded panel" },
				{ "namespace": "data", "path": "bevelSize", "value": 1 }
			]
		}
	]
}
```

For `get-properties`, omit each `value`. Both commands preserve element and property order and return only the requested values. A successful write returns `previousValue`, authoritative `value`, and `changed` for every property. The total property count is limited to 100, the existing per-value and response-size limits apply, and unexpected failures roll back the complete editor batch.

```bash
node scripts/composer-agent.js update --type tile --id <id> --path layout.left --value-file <temporary-directory>/left.json
node scripts/composer-agent.js update --type tile --id <id> --path name --value-file <temporary-directory>/headline.json
node scripts/composer-agent.js update --type tile --id <id> --namespace data --path <field-id> --value-file <temporary-directory>/team-name.json
```

Before using `update` on widget data or a linkable layout property, run `control-nodes` and match the requested `(elementId, propertyId)` against its `links` and `nodeRefs`. If a Control Node drives that property, do not call `update` for the linked target. Use `set-control-value` on the defining Control Node and verify both the control and linked element readback. Also inspect `widget-nodes` for owner-supplied output links. Do not overwrite a Widget Node-driven target: change the owning widget's inputs, or deliberately unlink the matching output first. Direct property updates are only for unlinked targets.

Use `fonts` and `set-font` for Text font changes; they validate catalog families and weights and supply required account-font metadata. See [text.md](widgets/text.md).

Use `metric-fonts` and `set-metric-font` for an unlinked `metricfont` widget field. The setter resolves complete Font 2 metrics from the selected catalog, preserves omitted family/weight/style/subset values when valid, and rejects linked fields; use `set-control-font` on the defining Metric Font Control Node instead.

Use `upgrade-metric-widgets` only when the user requests migration from legacy Font 1.0 widgets. Inspect every tile first and pass 1–100 unique IDs from the active composition. Text v2 becomes Metric Text or Metric Text ML according to its current line limits; Simple Ticker becomes Metric Ticker. The command loads current target widget versions and Font 2 sources, translates legacy typography and dimension fields, merges target defaults, and commits the complete batch only after validation. It preserves linked properties only when the source and target fields have the same ID and type; incompatible or removed-field links reject the entire request. Each result reports the previous and resulting widget identities, whether metrics were mapped, and preserved linked properties. Reinspect every upgraded tile afterward; `fontMapped: false` requires a deliberate Metric Font update before visual acceptance.

### Moving between groups

```bash
node scripts/composer-agent.js move --id <tile-id> --group-id <group-id>
node scripts/composer-agent.js move --id <tile-id> --group-id <group-id> --index 0
```

Both the tile and the target group must be in the active composition. `--index` is the 0-based position in the group's layer order, where `0` is front-most; omit it to append behind the group's existing items. Passing the tile's current group reorders it in place.

The move rewrites the target group's item priorities and each moved tile's `layout.zindex`, exactly as a layer-list drag does. It leaves the source group's remaining priorities untouched, and does not touch the tile's data, links, keyframes, or effects.

Any tile can be moved into or out of any group. Moving a declarative graphic out of its metadata-owned managed graphics group releases it from `graphics.apply`: its spec key is cleared, it becomes an ordinary element, and the response reports `releasedKey`. A later `apply` whose spec still lists that key will build a new element for it rather than reclaim the moved one.

## Groups

| Command | Purpose |
| --- | --- |
| `create-group --name <name>` | **Targeted only:** create one ordinary group outside a declarative managed specification. |
| `create-group --name <name> --layout-file <layout.json>` | **Targeted only:** create one ordinary group and atomically assign supported bounds, clipping, or appearance fields. |
| `configure-group --id <group-id> --layout-file <layout.json>` | **Targeted only:** atomically update one existing ordinary group, or repair managed-group geometry/appearance after readback. |
| `move-group --id <group-id> --index <n>` | Reorder one existing group without moving its children or changing managed metadata; index `0` is front-most. |
| `delete-group --id <group-id>` | Delete a group and everything in it. |

`delete-group` uses Composer's normal group deletion. As in the UI, a group cannot be deleted without its tiles: each one's data, links, and node references go with it, and any sub-composition it holds is removed too. The response lists the deleted tiles by id and name. Move anything worth keeping into another group first, and confirm the scope with the user before running it. It also refuses to delete a composition's last remaining group.

Managed groups use the active composition's functional name with a trailing `Presentation` omitted. Ownership is metadata-based, so renaming one manually does not release its contents. `ensure-group` restores the concise semantic name.

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
