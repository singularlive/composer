# Control Node creation and type contracts

Read [Control Node design and lifecycle](control-nodes.md) first for ownership, authority, inspection, and conflict rules. Use this reference when creating controls, links, or specialized control types; use [Control Node commands](control-node-commands.md) for CLI syntax.

## Create, with an optional link

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

When a user asks to change a template's colors, make its colors changeable, or “use what is there,” preserve the current palette as the initial values of semantic Color Control Nodes rather than leaving colors baked into widgets. If scope is unclear, confirm whether the request covers one element, one module, or a shared theme. For a palette shared by sibling root modules, create the first link from a root-owned control with `--source-composition root`, reuse that exact control for every additional descendant target with `--reuse-existing`, and place the controls in a root theme container. Verify the controls, links, and target readback before changing a control and restoring it once to prove propagation without changing the final design.

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

## Selection controls

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

## Specialized controls

Button controls are standalone event inputs. Create one without a value file, then use `press-control --id <control-id>` for each activation. Composer persists the native `{__singularButton:true,ts}` marker with a fresh timestamp; generic `set-control-value` writes are rejected so callers cannot replay or fabricate button events. Button metadata supports `buttonWidth` values `auto`, `small`, `medium`, `large`, and `fill`, plus the common title, ordering, visibility, advanced-style, and display-variant fields. Buttons always use immediate updates and do not create data links or node references.

Time Controls persist `{UTC,isRunning,value}`, where `value` is accumulated elapsed milliseconds and `UTC` anchors the latest action. Standalone creation needs no value file and starts as `{UTC:0,isRunning:false,value:0}`. Use `timer-action` (`control-time` is a compatibility alias): `start` resets to zero and runs, `play` resumes the accumulated value, `pause` adds elapsed wall-clock time and stops, and `reset` stops at zero while stamping `UTC` with the current server-adjusted time. Repeating `play` while running or `pause` while stopped is idempotent. Generic `set-control-value` writes are rejected so callers cannot fabricate clock state. Time Controls always use immediate updates; they can link only to exact `timecontrol` widget fields.

Location controls use the native `{text,long,lat}` payload. `text` is a string and `long`/`lat` are finite numbers; the agent does not impose geographic coordinate ranges beyond that native contract. Use `set-control-value` to replace the complete object. Location controls link only to exact `location` widget fields.

Metric Font controls use Font 2 catalog values. Run `metric-fonts` to discover exact families, sources, weights, styles, and subsets, then use `set-control-font`; generic `set-control-value` is rejected so callers cannot persist stale metrics or inject custom-font URLs. Composer resolves `mg` geometry and account-font URLs internally. A Metric Font value bundles family, weight, style, subset, and metrics; sharing one control across bold and regular targets flattens that hierarchy. Split controls by typographic role, such as **Display Font** for bold headlines and **Body Font** for regular copy and clocks, when weights must remain distinct. Omitted properties retain the current selection when compatible; changing family chooses compatible defaults for omitted weight, style, and subset. Linked creation copies one explicitly named target field and does not change its rendering. Standalone creation defaults to Open Sans when no family is supplied. Metric Font controls are available only to Font 2-eligible accounts. They cannot be created through `create-controls`, declarative graphics, or orchestration, and the native bulk **Connect to Metric Widgets** action is outside the agent contract.

Info Text is a form-only display rather than an operator input or widget link. Creation requires `target: "standalone"`, an explicit `static` or `dynamic` mode, and an HTML string. Static mode stores visible content in field `text` metadata and keeps payload empty; change it with `update-control --file` using a `text` patch. Dynamic mode stores visible content in the payload and accepts `set-control-value`, including later external `setPayload()` updates. Changing mode atomically transfers the current visible content between metadata and payload. Info Text always starts with `hideTitle: true`, has no default/reset blobs, and cannot target widget data or Transform/Effect properties.

Info Text HTML is sanitized both on agent writes and immediately before Control App rendering. Agent writes reject unsupported markup instead of silently changing it; defensive rendering strips unsupported content from legacy or external payloads. The bounded display subset includes `div`, `span`, paragraphs, basic emphasis and lists, table elements, and anchors. Inline styles support table, grid, flex, sizing, spacing, typography, color, background color, border, and overflow properties; positioning, transforms, CSS URLs, imports, variables, and executable values are excluded. Links require absolute `http://` or `https://` URLs no longer than 2,048 characters and without embedded credentials. Rendering forces `target="_blank"` and `rel="noopener noreferrer"`; relative, protocol-relative, `javascript:`, `data:`, and malformed URLs are rejected.

Use `textarea` when longer free-form input or explicit line breaks are part of the public input contract; use `text` for concise single-line input. Prefer linking a textarea control to a widget field whose live schema type is `textarea`, such as the `text` field of the `metric-text-ml` primitive. A compatible `text` target accepts the same string value but does not guarantee multiline rendering. Textarea `rows` and `cols` configure the Control App input only; rendered line count, wrapping, and truncation remain properties of the target widget.

When a Color control targets a Gradient field, use the direct link as the preferred one-to-one contract; do not route the color through a composition script. A current direct RGBA value is preserved, while a structured gradient initializes the control from its current `solidColor`. The existing widget gradient input accepts tinycolor2-compatible values and renders them as a solid gradient, so a driving widget can send a color string or RGBA object without reproducing the full gradient runtime object. This is appropriate only when the public control is intentionally a single color; it must not be used as a substitute for externally editing a structured gradient. If creation rejects a valid solid gradient with the exact-RGBA compatibility message, verify that Composer and the installed skill versions match and update the skill before considering any workaround; older builds could emit that misleading error before extracting `solidColor`.

## Transform and Effect controls

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
