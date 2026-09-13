# Control Node design and lifecycle

This reference covers ordinary scene sub-compositions. Widgets may also own compositions through fields of type `composition`; their renderer controls how those templates are instantiated. See [widget-subcompositions.md](widget-subcompositions.md) before navigating or editing one.

Composer opens at a root composition. A composition tile can contain another composition, producing a nested sub-composition. Root and sub-compositions share the same group/tile model.

Most element and control commands operate on the **currently active composition**. Explicit scene-wide commands, such as composition playback, ordinary timeline linking, and scoped motion batches, resolve targets by their documented IDs without requiring each target to be active. Run `inspect` and confirm `activeComposition.stack`, then follow the target and scope contract of the chosen command; do not navigate merely because a target is elsewhere in the scene.

## Control nodes

A control node is a composition-level input. It may directly expose a selected widget-data or tile/group Transform/Effect property, or it may remain standalone so an external payload can trigger composition-script processing. Supported agent-created types are `text`, `textarea`, `number`, `normalizednumber`, `counter`, `color`, `image`, `checkbox`, `audio`, `video`, `data`, `jsonfile`, `json`, `datetime`, `location`, `selection`, `button`, `timecontrol`, `infotext`, and `metricfont`.

Composer also has a native `gradient` Control Node type, but it is intentionally outside agent creation and mutation support. A complete structured gradient is a widget-rendering value with a complex implementation-specific shape, not an appropriate public API or external-control contract. Author solid, linear, radial, and multi-stop gradients directly on compatible widget fields; composition scripts may use complete widget-runtime gradient objects when the target widget API accepts them. Do not expose those objects through a Gradient Control Node. Use a `color` Control Node targeting a Gradient field only when the intended external input is one solid color.

Control fields belong to one composition, while a descendant composition may persist a link to a field defined in root or another ancestor. Targets are always resolved in the **active** composition. Unless the user explicitly asks for an ancestor-owned public control, create a linked control in the same composition as its target and a standalone control in the composition whose script consumes it. Open the target composition first, confirm it in `activeComposition.stack`, then inspect, create, and verify there. This keeps each module self-contained while still supporting intentional root-level control surfaces.

Every agent-authored public control belongs in an ordinary semantic Control Node container. Organize containers around the operator's task or module rather than the controls' primitive types. Default to a Large container (`width: "double"`); use Small (`width: ""`) only for a specific compact workflow or density constraint. After creating controls, create or configure their container and verify ordered membership through `control-nodes`. Do not leave controls ungrouped as the final authored state.

### Inspect first

```bash
node scripts/composer-agent.js inspect
node scripts/composer-agent.js control-nodes
node scripts/composer-agent.js get --type tile --id <tile-id>
```

`control-nodes` reports the ordered control fields, each field's complete persisted metadata except deprecated Number `unitName` and `unitCollection`, widget-data links, and tile/group layout node references. Identity and ordering remain top-level field properties; additional persisted properties are returned under `metadata`. Unknown metadata is read and preserved for forward compatibility but cannot be changed by the agent. For widget data, use the field `id` from the tile's schema as the property identifier — never the displayed field title. For Transform/Effect targets, use the supported persisted layout-property name below. Check existing links or node references for the same element and property before creating; commands reject an existing link unless replacement is explicitly requested. Never replace a link silently.

The same inspection determines how to fulfill ordinary visual-change requests. If the requested widget field appears in `links`, or the requested Transform/Effect field appears in `nodeRefs`, its defining Control Node is the authoritative input. Change that control with `set-control-value`; do **not** write the linked widget data or layout field directly. A direct property write bypasses the composition's public input contract and can be overwritten by the link. For example, when a Circle's `fillGradient` is linked to Color control `c1`, “change the circle to green” means setting `c1` to `{ "r": 0, "g": 255, "b": 0, "a": 1 }`, then verifying both `control-nodes` and the Circle readback.

A directly linked property has one authority: its defining Control Node. Do not also write that destination from a composition script, including as a fallback when a Control App appears stale. Competing link and script writes are order-dependent and can hide the actual transport or loaded-definition problem. When a script must interpret, combine, or forward an input, use a standalone control and leave the script-owned destination unlinked.

`immediateUpdate` is a Control Node presentation behavior for specific Singular Studio workflows, not a general propagation switch for external or custom Control Apps. Leave it disabled unless the target operating environment explicitly requires it. Enabling it does not repair a stale app extract, an unloaded AI Graphics definition, a broken link, or incompatible runtime value handling.

For a local link, update the control in the active composition. If inspection identifies an inherited control, navigate to the composition that defines it, inspect that scope, and update the defining control there; never bypass an inherited link because its source is outside the current scope.

Conflict errors identify both sides of the disagreement. A rejected `apply`, `validate`, `create-control`, or `create-controls` reports the requested control name and type, the property, and the existing link's identity, for example `requested control "Headline" (type text) for property "text" conflicts with existing control "Inning" (type text, keyId ...)`. Existing links are classified so you can tell what you are up against:

- a **visible control** — a local control-node link whose field exists, reported with its `id`, `type`, and `keyId`;
- an **inherited control link** — a control-node link pointing at another composition's field;
- a **stale link** — a control-node link whose control field no longer exists;
- an **internal bookkeeping link** — any other link type (data nodes, formulas, internal wiring).

These messages also include the active composition ID.

### Create, with an optional link

```bash
node scripts/composer-agent.js create-control --name "name" --node-type text --tile-id <tile-id> --property text
node scripts/composer-agent.js create-control --name "Brand Color" --node-type color --tile-id <tile-id> --property fillGradient --source-composition root
node scripts/composer-agent.js create-control --name "visible" --node-type checkbox --target layout --element-type tile --element-id <tile-id> --property visible
node scripts/composer-agent.js create-control --name "External Headline" --node-type text --target standalone --value-file <temporary-directory>/initial-headline.json
node scripts/composer-agent.js create-control --name "Team" --node-type selection --target standalone --value-file <temporary-directory>/initial-team.json --options-file <temporary-directory>/team-options.json
node scripts/composer-agent.js create-control --name "Brand Color" --node-type selection --tile-id <tile-id> --property fillGradient --options-file <temporary-directory>/color-options.json --format color
node scripts/composer-agent.js create-control --name "Remote Brand Color" --node-type selection --tile-id <tile-id> --property fillGradient --options-url <https-or-protocol-relative-url> --format color
node scripts/composer-agent.js create-control --name "Remote Team" --node-type selection --target standalone --value-file <temporary-directory>/initial-team.json --options-url <https-or-protocol-relative-url> --use-reload true
node scripts/composer-agent.js create-control --name "Sponsor" --node-type selection --target standalone --value-file <temporary-directory>/initial-sponsor.json --image-options-csv-file <temporary-directory>/dashboard-images.csv
node scripts/composer-agent.js create-control --name "Sponsor" --node-type selection --target standalone --value-file <temporary-directory>/initial-sponsor.json --image-options-csv <csv-text>
node scripts/composer-agent.js create-control --name "Game Clock" --node-type timecontrol --target standalone
node scripts/composer-agent.js create-control --name "Venue" --node-type location --target standalone --value-file <temporary-directory>/venue.json
node scripts/composer-agent.js create-control --name "Brand Font" --node-type metricfont --target standalone --family "Open Sans" --weight 700 --subset auto
node scripts/composer-agent.js create-control --name "Headline Font" --node-type metricfont --tile-id <metric-text-id> --property font
node scripts/composer-agent.js create-controls --file <controls.json>
```

Creation follows Composer's normal path. Linked controls initialize from the target property's current value, so linking does not change the rendered graphic. A standalone value control requires an explicit `--value-file`; Button and Time Control instead use their fixed native initial states. Standalone creation writes only the model field and payload, with no widget `dataLink` or layout `nodeRef`.

For an ancestor-owned linked control, leave the descendant target active and pass `--source-composition root` or the exact ID of an ancestor shown in `activeComposition.stack`. This works for ordinary descendants and widget-owned sub-compositions. The command creates the field and payload in that ancestor, writes the link in the active target composition using Composer's native `root`/ancestor location identity, and returns both `compositionId` (the defining source) and `targetCompositionId`. The source must be the active composition or one of its ancestors; sibling and unrelated compositions fail with `INVALID_CONTROL_SOURCE`. Cross-composition standalone creation is rejected because it has no active target relationship.

Use a standalone control when the value is an external/script input rather than a one-to-one property binding. A Player SDK `setPayload()` call can update it, the composition script can listen for `payload_changed`, read the authoritative payload with `comp.getPayload2()`, process the value, and update one or more widgets with their scripting APIs. Do not create a hidden backing widget for that pattern.

| Control type | Compatible widget field types | Initial value |
| --- | --- | --- |
| `text` | `text`, `textarea` | String |
| `textarea` | `textarea`, `text` | String |
| `number` | `number`, `normalizednumber`, numeric `text` | Finite number |
| `normalizednumber` | `normalizednumber`, `number` | Percentage from 0 to 100 |
| `counter` | `counter`, `number`, `normalizednumber` | Integer |
| `color` | `color`, `gradient` | Exact RGBA object with RGB from 0 to 255 and alpha from 0 to 1; direct RGBA gradient values are preserved and structured gradients initialize from `solidColor` |
| `image` | `image` | String image URL/value |
| `checkbox` | `checkbox` | Boolean |
| `audio` | `audio` | String audio URL/value |
| `video` | `video` | String video URL/value |
| `data` | `data` | String data URL/value |
| `jsonfile` | `jsonfile` | String JSON-file URL/value |
| `json` | `json` | Empty or parseable JSON string |
| `datetime` | `datetime` | Integer Unix timestamp in milliseconds |
| `location` | `location` | `{text,long,lat}` with a string label and finite numeric coordinates |
| `selection` | `selection`; `text`/`textarea` with `format: "text"`; `color`/`gradient` with `format: "color"`; `image` with `format: "image"` | String option ID; non-Selection fields require an explicit option source |
| `timecontrol` | `timecontrol` | Native `{UTC,isRunning,value}` elapsed-time state |
| `infotext` | Not linkable; standalone only | Sanitized HTML string |
| `metricfont` | `metricfont` | Complete Composer-resolved `{fontData:{family,weight,style,subset,mg,...}}` value |

Image, Audio, Video, Data, and JSON File values follow Composer's form limit of 2,048 characters. The agent rejects longer values instead of silently truncating them.

Selection controls support inline or URL-backed options. Standalone creation and links to non-Selection fields require exactly one of `--options-file`, `--options-url`, `--image-options-csv-file`, or `--image-options-csv`; a link to an exact `selection` field instead inherits that field's native options and format and rejects overrides. An inline file contains a JSON array of 1 to 100 objects with unique, non-empty string `id` and `title` properties; the initial string value must match one option ID. A URL source accepts an absolute or protocol-relative HTTP(S) URL no longer than 2,048 characters and without embedded credentials; optional `--use-reload true` exposes Composer's native reload action. Composer fetches remote options asynchronously through its existing URL store, so creation cannot atomically match the target value to a remote option ID. A URL-backed color Selection therefore starts with the target's current color serialized as CSS `rgb(...)` or `rgba(...)`; a URL-backed image Selection starts with the target's current URL. After independently confirming the remote options, use `set-control-value` and, when required, a payload-stable `update-control` patch for `defaultValue`/`resetValue` to select the exact option ID. Verify the final value and metadata with non-compact `control-nodes` readback.

For named swatches, use `format: "color"` and valid HTML color strings as option IDs. A Color or Gradient target is accepted only for that format; creation finds the option whose parsed RGBA value matches the current property, preserving its appearance while making the matched option ID authoritative. Color fields and Gradient fields holding a direct RGBA value are matched as-is; a structured Gradient is matched through its `solidColor`. Creation fails if the current solid color is invalid or no option matches. For named images, use `format: "image"`; an Image target's current URL must exactly match one option ID. Text-format selections remain limited to Selection, Text, and Text Area targets. The targeted `create-control` command accepts `--format <text|color|image>`; `create-controls` entries use `format`.

When `--reuse-existing` links a color- or image-format Selection to another non-Selection field, repeat both its effective format and option source, for example `--format color --options-file <same-options.json>`. Reuse preserves the existing control field and payload; the repeated arguments validate target compatibility and option membership rather than replacing its metadata. After creation or reuse, confirm `metadata.format`, links, and value through non-compact `control-nodes` readback. A Player capture cannot verify the Control App's swatch or thumbnail presentation.

To move one already-linked property from control A to a new control B, first inspect all links owned by A, obtain explicit user approval for that property, and create B with `--replace`. For example, `create-control --name "Rectangle Fill" --node-type selection --tile-id <rectangle-id> --property fillGradient --options-url <url> --format color --replace` replaces only the Rectangle's `fillGradient` link. Require the response's `link.previousLink` to identify A, then re-read both controls and links: B must own the Rectangle fill while A and all its unrelated links remain unchanged. Never use `--replace` as implicit permission to migrate other fields.

For a Singular Dashboard export, pass its CSV text directly with `--image-options-csv` or save it and use `--image-options-csv-file`. Dashboard CSV must contain `type`, `name`, and `url` headers and 1 to 100 image rows. Mixed exports are supported: rows such as `appinstance` and `composition` are ignored, while rows whose type is `image` are converted to `{id: row.url, title: row.name}`.

Pasted text may instead be a two-column `name,url` list, with the header optional. Use one pair per line and CSV quoting when a name contains a comma or quote:

```csv
name,url
"Home, light",//image.singular.live/account/images/home-light.png
Away,https://example.com/away.png
```

The converter preserves absolute and protocol-relative HTTP(S) URLs, rejects embedded credentials and duplicate image URLs, and creates a native inline Selection with `format: "image"`. Supply the selected image URL as the JSON string in `--value-file`; it must exactly match one converted image URL. Quoted commas, escaped quotes, UTF-8 BOMs, and LF or CRLF line endings are supported. The conversion is local and does not upload assets or call a Dashboard API.

This compatibility table is the supported agent contract, not a copy of every orange **may work** pairing in Composer's link browser. The narrower set is intentional: add another compatible pairing only after its conversion, initialization, readback, update, and cleanup behavior are verified.

Button controls are standalone event inputs. Create one without a value file, then use `press-control --id <control-id>` for each activation. Composer persists the native `{__singularButton:true,ts}` marker with a fresh timestamp; generic `set-control-value` writes are rejected so callers cannot replay or fabricate button events. Button metadata supports `buttonWidth` values `auto`, `small`, `medium`, `large`, and `fill`, plus the common title, ordering, visibility, advanced-style, and display-variant fields. Buttons always use immediate updates and do not create data links or node references.

Time Controls persist `{UTC,isRunning,value}`, where `value` is accumulated elapsed milliseconds and `UTC` anchors the latest action. Standalone creation needs no value file and starts as `{UTC:0,isRunning:false,value:0}`. Use `timer-action` (`control-time` is a compatibility alias): `start` resets to zero and runs, `play` resumes the accumulated value, `pause` adds elapsed wall-clock time and stops, and `reset` stops at zero while stamping `UTC` with the current server-adjusted time. Repeating `play` while running or `pause` while stopped is idempotent. Generic `set-control-value` writes are rejected so callers cannot fabricate clock state. Time Controls always use immediate updates; they can link only to exact `timecontrol` widget fields.

Location controls use the native `{text,long,lat}` payload. `text` is a string and `long`/`lat` are finite numbers; the agent does not impose geographic coordinate ranges beyond that native contract. Use `set-control-value` to replace the complete object. Location controls link only to exact `location` widget fields.

Metric Font controls use Font 2 catalog values. Run `metric-fonts` to discover exact families, sources, weights, styles, and subsets, then use `set-control-font`; generic `set-control-value` is rejected so callers cannot persist stale metrics or inject custom-font URLs. Composer resolves `mg` geometry and account-font URLs internally. A Metric Font value bundles family, weight, style, subset, and metrics; sharing one control across bold and regular targets flattens that hierarchy. Split controls by typographic role, such as **Display Font** for bold headlines and **Body Font** for regular copy and clocks, when weights must remain distinct. Omitted properties retain the current selection when compatible; changing family chooses compatible defaults for omitted weight, style, and subset. Linked creation copies one explicitly named target field and does not change its rendering. Standalone creation defaults to Open Sans when no family is supplied. Metric Font controls are available only to Font 2-eligible accounts. They cannot be created through `create-controls`, declarative graphics, or orchestration, and the native bulk **Connect to Metric Widgets** action is outside the agent contract.

Info Text is a form-only display rather than an operator input or widget link. Creation requires `target: "standalone"`, an explicit `static` or `dynamic` mode, and an HTML string. Static mode stores visible content in field `text` metadata and keeps payload empty; change it with `update-control --file` using a `text` patch. Dynamic mode stores visible content in the payload and accepts `set-control-value`, including later external `setPayload()` updates. Changing mode atomically transfers the current visible content between metadata and payload. Info Text always starts with `hideTitle: true`, has no default/reset blobs, and cannot target widget data or Transform/Effect properties.

Info Text HTML is sanitized both on agent writes and immediately before Control App rendering. Agent writes reject unsupported markup instead of silently changing it; defensive rendering strips unsupported content from legacy or external payloads. The bounded display subset includes `div`, `span`, paragraphs, basic emphasis and lists, table elements, and anchors. Inline styles support table, grid, flex, sizing, spacing, typography, color, background color, border, and overflow properties; positioning, transforms, CSS URLs, imports, variables, and executable values are excluded. Links require absolute `http://` or `https://` URLs no longer than 2,048 characters and without embedded credentials. Rendering forces `target="_blank"` and `rel="noopener noreferrer"`; relative, protocol-relative, `javascript:`, `data:`, and malformed URLs are rejected.

Use `textarea` when longer free-form input or explicit line breaks are part of the public input contract; use `text` for concise single-line input. Prefer linking a textarea control to a widget field whose live schema type is `textarea`, such as the `text` field of the `metric-text-ml` primitive. A compatible `text` target accepts the same string value but does not guarantee multiline rendering. Textarea `rows` and `cols` configure the Control App input only; rendered line count, wrapping, and truncation remain properties of the target widget.

When a Color control targets a Gradient field, use the direct link as the preferred one-to-one contract; do not route the color through a composition script. A current direct RGBA value is preserved, while a structured gradient initializes the control from its current `solidColor`. The existing widget gradient input accepts tinycolor2-compatible values and renders them as a solid gradient, so a driving widget can send a color string or RGBA object without reproducing the full gradient runtime object. This is appropriate only when the public control is intentionally a single color; it must not be used as a substitute for externally editing a structured gradient. If creation rejects a valid solid gradient with the exact-RGBA compatibility message, verify that Composer and the installed skill versions match and update the skill before considering any workaround; older builds could emit that misleading error before extracting `solidColor`.

Layout targets use Composer's native node-reference model rather than widget `dataLinks`. They work for tiles and groups and initialize from the current effective layout value, including false and zero, so creating the link does not change the rendered graphic.

Transform/Effect controls are not part of normal graphic construction or refinement. Do not create them by default, infer them from an element's likely usefulness, or expose every supported layout property. Use direct typed layout authoring for ordinary visual changes. Create a layout-target control only when the user explicitly requests a public Control Node for that exact property and target element. For keyed managed graphics, root-level declarative `controls` may target an `elementKey` or the `managed` group; use direct `create-control`/`create-controls` for ordinary tiles and groups identified by Composer IDs.

| Control type | Linkable Transform/Effect properties |
| --- | --- |
| `checkbox` | `visible` |
| `number` | `left`, `top`, `width`, `height`, `rotateZ`, `opacity`, `filterBrightness`, `filterBlur`, `filterContrast`, `filterGrayscale`, `filterHueRotate`, `filterInvert`, `filterSaturate`, `filterSepia` |

For a related batch, layout entries use `target: "layout"`, `elementType`, `elementId`, and `propertyId`; widget-data entries keep `tileId` and `propertyId` and default to `target: "data"`; standalone entries use `target: "standalone"` and an explicit `value`. A linked entry may add `sourceCompositionId: "root"` or an exact ancestor ID.

```json
{
  "controls": [
    { "name": "rectangle_size_x", "type": "number", "target": "layout", "elementType": "tile", "elementId": "<rectangle-id>", "propertyId": "width" },
    { "name": "rectangle_size_y", "type": "number", "target": "layout", "elementType": "tile", "elementId": "<rectangle-id>", "propertyId": "height" },
    { "name": "Brand Color", "type": "color", "tileId": "<descendant-rectangle-id>", "propertyId": "fillGradient", "sourceCompositionId": "root" },
    { "name": "External Headline", "type": "text", "target": "standalone", "value": "Initial headline" }
  ]
}
```

Composer removes invalid control-name characters and appends a numeric suffix when the requested ID already exists. The result reports the actual control `id`, its internal `keyId`, the initialized value, and either the new link or `target: "standalone"` with a null link value.

`create-controls` accepts `{ "controls": [...] }` or a bare array, validates the whole batch before mutation, creates everything in one undo batch, and rolls back if creation or verification fails. Selection entries use `selections` for inline options or `sourceUrl` plus optional `useReload` for URL-backed options.

Creation and optional linking are one batched operation; the previous control-node model and property link are restored if either write fails. Afterward, run `control-nodes` again. For linked controls, verify the returned `id`, value, `tileId`, `propertyId`, and link `keyId`. For standalone controls, verify the field and payload value exist and that neither `links` nor `nodeRefs` contains its `keyId`.

### Change metadata

Inspect first, then pass one JSON object containing only the properties to change:

```bash
node scripts/composer-agent.js update-control --id <control-id> --file <patch.json>
```

The common writable metadata contract applies to the fifteen ordinary value controls, including Date Time and Selection. Textarea controls additionally accept positive-integer `rows` and `cols`; Number controls additionally accept `step`, `format`, `unit`, `min`, `max`, and `showSlider`; Normalized Number controls accept `step`, `format`, `unit`, `low`, `high`, and `showSlider`; Counter controls accept integer `min`/`max` and optional set/modify button values `s1`–`s7` and `m1`–`m7`. Selection controls accept `format` (`text`, `color`, or `image`), boolean `useFilter`, and either inline `selections` or URL-source metadata `source: "url"`, `sourceUrl`, and boolean `useReload`. Changing inline options is rejected unless the current/default/reset IDs remain present. Switching to URL mode removes inline options; switching back to manual mode requires valid inline options. JSON Text narrows metadata to `id`, `title`, `index`, `height`, `hideTitle`, and `displayVariantRelevance`; height must be `100px`, `150px`, `200px`, `250px`, `300px`, or `400px`. Info Text is the sixteenth supported type and intentionally narrows metadata to `id`, `title`, `index`, `hideTitle`, `displayVariantRelevance`, `mode`, and static `text`. `unitName` and `unitCollection` are deprecated and intentionally neither reported nor writable. `type` and internal `keyId` are immutable.

A format-only Selection update changes only `metadata.format`; payload value, default/reset values, options, groups, and links remain unchanged. Reinspect with non-compact `control-nodes` because this presentation metadata is not visible in Player output.

New metadata values use strict current shapes: default/reset values match the control type; booleans are booleans; numeric `step` is positive and finite; Number bounds are finite with `min <= max`; Normalized Number output bounds are finite with `low <= high`; Counter bounds are integers with `min <= max`, and its button values are integers or signed integer strings; Number `showSlider: true` requires both `min` and `max`; `unit` is at most three characters; and display-variant relevance is a string or an array of non-empty strings. Existing legacy shapes remain readable and are preserved when omitted. Set an optional property to `null` to remove it; `title` cannot be removed. Omitted and unknown properties remain unchanged.

An `id` change atomically migrates the payload key, matching local and cross-composition widget links, tile/group node references, and control-group membership. An `index` change reorders the field and normalizes every field index. The operation verifies readback and rolls back all writes on failure. Re-run `control-nodes` and verify the field, payload, links, ordering, and unrelated metadata.

### Change a value

Inspect the active composition's controls first, then address one existing local control by its reported public `id` (preferred) or internal `keyId`:

```bash
node scripts/composer-agent.js control-nodes
node scripts/composer-agent.js set-control-value --id <control-id> --value-file <temporary-directory>/green.json
node scripts/composer-agent.js control-nodes
```

The value must match the existing control type: string for text/textarea/image/audio/video/data/jsonfile, a string option ID present in inline options for manual Selection, any string for URL-backed Selection, empty or parseable JSON string for JSON Text, finite number for Number, percentage from 0 to 100 for Normalized Number, integer for Counter, integer Unix millisecond timestamp within the JavaScript Date range for Date Time, boolean for Checkbox, and an exact `{r,g,b,a}` object with RGB from 0 to 255 and alpha from 0 to 1 for Color. Metric Font, Button, and Time Control values use their dedicated commands rather than raw value files. Date Time does not accept formatted date strings; convert them to milliseconds before writing. JSON Text preserves valid source text verbatim and uses the standard 32 KB agent update limit; pass a JSON string in `--value-file`, not an object. Dynamic Info Text accepts only valid sanitized HTML strings; static Info Text rejects this command and must be changed through its `text` metadata. URL-valued controls are limited to 2,048 characters. Null is never a delete. The command changes only `dataSources/composition/controlNode/payload/<control-id>`, verifies the persisted value, and reports the previous value plus whether a write occurred. A failed write rolls back its batch. Re-read `control-nodes` after the mutation and confirm unrelated controls are unchanged.

### Delete

```bash
node scripts/composer-agent.js delete-control --id <control-id>
```

The reported `id` is the user-facing field identity; `keyId` is the generated internal model key. Prefer `id` in commands.

Deletion matches local and cross-composition links by stable `keyId`/`sourceKeyId`, with public-name fallback only for legacy references. Link cleanup, payload/model/group cleanup, and Table-group cleanup share one native batch. The adapter verifies field and payload removal and restores the complete affected composition collection if cleanup or verification fails.

Deletion follows Composer's normal cleanup path: it removes the field schema and payload, removes the field from control groups, and clears matching widget data links and node references across the scene when they resolve to the defining composition. It does **not** delete linked tiles or their widget property values. The response reports how many data links and node references were removed.

Delete only the explicitly requested control, from the composition where it is defined. Verify with `control-nodes` afterward: the field and its links must be gone while unrelated controls, tiles, and widget values remain.
