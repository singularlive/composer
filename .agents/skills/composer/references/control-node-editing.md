# Control Node editing and deletion

Read [Control Node design and lifecycle](control-nodes.md) first for ownership, authority, and inspection. Use this reference to change metadata or values and to delete controls; use [Control Node commands](control-node-commands.md) for container and Table contracts.

## Change metadata

For `timer`, first read [Timer configuration and commands](control-node-timer.md). Its coupled direction/endpoints and format/frequency settings are validated together; Timer settings do not accept `null` or default/reset payload metadata.

Inspect first, then pass only the properties to change:

```bash
node scripts/composer-agent.js update-control --id <control-id> --file <patch.json>
```

Common writable metadata applies to ordinary value controls. Textarea additionally accepts positive-integer `rows` and `cols`; Number accepts `step`, `format`, `unit`, `min`, `max`, and `showSlider`; Normalized Number accepts `step`, `format`, `unit`, `low`, `high`, and `showSlider`; Counter accepts integer bounds and optional set/modify button values `s1`–`s7` and `m1`–`m7`. Selection accepts `format` (`text`, `color`, or `image`), boolean `useFilter`, and either inline `selections` or URL metadata `source: "url"`, `sourceUrl`, and boolean `useReload`. Changing inline options requires current/default/reset IDs to remain present. Switching to URL mode removes inline options; switching back requires valid inline options. JSON Text accepts `id`, `title`, `index`, `height`, `hideTitle`, and `displayVariantRelevance`; height is one of `100px`, `150px`, `200px`, `250px`, `300px`, or `400px`. Info Text accepts `id`, `title`, `index`, `hideTitle`, `displayVariantRelevance`, `mode`, and static `text`. `type` and `keyId` are immutable; deprecated Number `unitName` and `unitCollection` are neither reported nor writable.

A format-only Selection update changes only `metadata.format`; payload, defaults, resets, options, groups, and links remain unchanged. Reinspect non-compact output because presentation metadata is not visible in Player.

New values use strict current shapes. Default/reset values match the control type; booleans are booleans; numeric steps are positive and finite; Number bounds satisfy `min <= max`; Normalized Number bounds satisfy `low <= high`; Counter bounds are ordered integers and button values are integers or signed integer strings; slider-enabled Number requires both bounds; `unit` is at most three characters; display-variant relevance is a string or non-empty string array. Existing legacy shapes remain readable, and omitted or unknown properties remain unchanged. Set an optional property to `null` to remove it; `title` cannot be removed.

Renaming `id` atomically migrates payload, local and cross-composition widget links, node references, and container membership. Changing `index` reorders the field and normalizes all indexes. Reinspect fields, payload, links, ordering, and unrelated metadata after the verified rollback-safe operation.

## Change a value

Timer uses `set-control-value` with a command object such as `{"command":"adjust","value":-1.5}`, in seconds. Raw anchors and read-side state are rejected. See [Timer](control-node-timer.md); `timer-action` remains exclusive to Time Control.

```bash
node scripts/composer-agent.js control-nodes
node scripts/composer-agent.js set-control-value --id <control-id> --value-file <temporary-directory>/value.json
node scripts/composer-agent.js control-nodes
```

Address a local control by public `id` (preferred) or `keyId`. Values must match the existing type: strings for text and URL controls; an inline option ID for manual Selection and any string for URL-backed Selection; empty or parseable JSON source text for JSON Text; finite Number; 0–100 Normalized Number; integer Counter; integer Unix milliseconds within the JavaScript Date range for Date Time; boolean Checkbox; exact `{r,g,b,a}` Color with RGB from 0 to 255 and alpha from 0 to 1; and `{text,long,lat}` Location. Date Time does not accept formatted date strings. JSON Text preserves source text verbatim, uses the 32 KB update limit, and requires a JSON string in the value file rather than an object. URL values are limited to 2,048 characters. Null never means delete.

Metric Font, Button, and Time Control use `set-control-font`, `press-control`, and `timer-action` rather than generic writes. Static Info Text changes through metadata; dynamic Info Text accepts sanitized HTML through its payload. The command writes only the selected payload field, verifies persistence, and rolls back on failure. Reinspect and confirm unrelated controls remain unchanged.

## Delete

```bash
node scripts/composer-agent.js delete-control --id <control-id>
```

Delete only the explicitly requested control from its defining composition. Cleanup matches local and cross-composition links by stable `keyId`/`sourceKeyId`, with public-name fallback only for legacy references. Field, payload, container, Table-group, data-link, and node-reference cleanup share one native batch; failed cleanup or verification restores the affected compositions. It does not delete linked tiles or their widget values. The response reports removed link counts; verify the field and links are gone while unrelated controls, tiles, and values remain.
