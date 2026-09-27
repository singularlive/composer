# Control Node editing and deletion

Read [Control Node design and lifecycle](control-nodes.md) first for ownership, authority, and inspection. Use this reference to change metadata or values and to delete controls; use [Control Node commands](control-node-commands.md) for container and Table contracts.

## Change metadata

Apply [Contract preservation](composition-commands.md#contract-preservation) before changing an externally addressed ID, scope, type or behavior. Required nodes in a matched composition cannot be renamed, moved, retyped or removed even on explicit request; decline those parts and offer preserving alternatives. Neither a metadata patch nor delete-and-recreate bypasses this rule.

For `timer`, first read [Timer configuration and commands](control-node-timer.md). Its coupled direction/endpoints and format/frequency settings are validated together; Timer settings do not accept `null` or default/reset payload metadata.

Inspect first, then pass only the properties to change:

```bash
node scripts/composer-agent.js update-control --id <control-id> --file <patch.json>
```

Common writable metadata applies to ordinary value controls. Textarea additionally accepts positive-integer `rows` and `cols`; Number accepts `step`, `format`, `unit`, `min`, `max`, and `showSlider`; Normalized Number accepts `step`, `format`, `unit`, `low`, `high`, and `showSlider`; Counter accepts integer bounds and optional set/modify button values `s1`–`s7` and `m1`–`m7`. Selection accepts `format` (`text`, `color`, or `image`), boolean `useFilter`, and either inline `selections` or URL metadata `source: "url"`, `sourceUrl`, and boolean `useReload`. Changing inline options requires current/default/reset IDs to remain present. Switching to URL mode removes inline options; switching back requires valid inline options. JSON Text accepts `id`, `title`, `index`, `height`, `hideTitle`, and `displayVariantRelevance`; height is one of `100px`, `150px`, `200px`, `250px`, `300px`, or `400px`. Info Text accepts `id`, `title`, `index`, `hideTitle`, `displayVariantRelevance`, `mode`, and static `text`. `type` and `keyId` are immutable; deprecated Number `unitName` and `unitCollection` are neither reported nor writable.

A format-only Selection update changes only `metadata.format`; payload, defaults, resets, options, groups, and links remain unchanged. Reinspect non-compact output because presentation metadata is not visible in Player.

A `selections` patch preserves omitted `useFilter`, `source`, `sourceUrl`, `useReload`, and `format`, including whether a property was absent. It does not implicitly switch a URL-backed control to inline mode. Request a source-mode switch explicitly with `source`; that transition clears inactive source metadata unless supplied in the same patch. Include an explicit corrected `resetValue` or `defaultValue` when its old ID is no longer in the options, then compare full metadata readback.

New values use the current type contract. Color defaults/resets accept all JSON-representable tinycolor2 colors, preserving the supplied representation. Other default/reset values match the control type; booleans are booleans; numeric steps are positive and finite; Number bounds satisfy `min <= max`; Normalized Number bounds satisfy `low <= high`; Counter bounds are ordered integers and button values are integers or signed integer strings; slider-enabled Number requires both bounds; `unit` is at most three characters; display-variant relevance is a string or non-empty string array. Existing legacy shapes remain readable, and omitted or unknown properties remain unchanged. Set an optional property to `null` to remove it; `title` cannot be removed.

Renaming `id` atomically migrates payload, local and cross-composition widget links, node references, and container membership. Changing `index` reorders the field and normalizes all indexes. Reinspect fields, payload, links, ordering, and unrelated metadata after the verified rollback-safe operation.

### Legacy Selection reset values

Legacy UNO Selections can retain `resetValue: "id1"` even though no option has that ID. Adding an option then fails with `INCOMPATIBLE_PROPERTY`, naming `resetValue` (or `defaultValue` when that is invalid). Inspect current value and metadata; include the explicit corrected reset in the same patch. Do not add a fake `id1` option or replace local IDs with a reference's IDs. For an inspected timer whose valid default is `clockDown`, the patch is:

```json
{
	"selections": [
		{ "id": "clockUp", "title": "Clock Up" },
		{ "id": "clockDown", "title": "Clock Down" },
		{ "id": "video", "title": "Video" },
		{ "id": "hidden", "title": "Hidden" },
		{ "id": "ocr", "title": "OCR Input" }
	],
	"resetValue": "clockDown"
}
```

Use live option titles rather than blindly copying this example. A stale default needs its own explicit correction; preserve the payload, other metadata, links and container order on readback.

## Change a value

Number, Normalized Number and Counter values also accept strings containing a complete finite number, preserving the supplied representation and their range/integer constraints. The same applies to numeric default/reset values. See [numeric value compatibility](control-node-creation.md#numeric-value-compatibility); no preliminary layout normalization is needed for numeric-string links.

Timer uses `set-control-value` with a command object such as `{"command":"adjust","value":-1.5}`, in seconds. Raw anchors and read-side state are rejected. See [Timer](control-node-timer.md); `timer-action` remains exclusive to Time Control.

```bash
node scripts/composer-agent.js control-nodes
node scripts/composer-agent.js set-control-value --id <control-id> --value-file <temporary-directory>/value.json
node scripts/composer-agent.js control-nodes
```

Address a local control by public `id` (preferred) or `keyId`. Values must match the existing type: strings for text and URL controls; an inline option ID for manual Selection and any string for URL-backed Selection; empty or parseable JSON source text for JSON Text; finite Number; 0–100 Normalized Number; integer Counter; integer Unix milliseconds within the JavaScript Date range for Date Time; boolean Checkbox; any JSON-representable tinycolor2 Color; and `{text,long,lat}` Location. Color values may switch between string and object formats without rewriting other controls. Date Time does not accept formatted date strings. JSON Text preserves source text verbatim, uses the 32 KB update limit, and requires a JSON string in the value file rather than an object. URL values are limited to 2,048 characters. Null never means delete.

Metric Font, Button, and Time Control use `set-control-font`, `press-control`, and `timer-action` rather than generic writes. Static Info Text changes through metadata; dynamic Info Text accepts sanitized HTML through its payload. The command writes only the selected payload field, verifies persistence, and rolls back on failure. Reinspect and confirm unrelated controls remain unchanged.

## Delete

Check the matched template's contract before `delete-control`. Never delete a required node, even if the user confirms or a backup exists. Native cleanup preserves internal consistency, not external app compatibility; follow [Contract preservation](composition-commands.md#contract-preservation). Unlisted nodes remain deletable when the request, contract and normal ownership rules allow it.

```bash
node scripts/composer-agent.js delete-control --id <control-id>
```

Delete only the explicitly requested control from its defining composition. Cleanup matches local and cross-composition links by stable `keyId`/`sourceKeyId`, with public-name fallback only for legacy references. Field, payload, container, Table-group, data-link, and node-reference cleanup share one native batch; failed cleanup or verification restores the affected compositions. It does not delete linked tiles or their widget values. The response reports removed link counts; verify the field and links are gone while unrelated controls, tiles, and values remain.
