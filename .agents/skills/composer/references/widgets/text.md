# Text and fonts

Text is the legacy Font 1.0 widget. Prefer the matching Metric Text family widget when creating text in a new composition. Continue to use this guide to inspect, understand, and edit existing Text widgets; adding another Text widget is appropriate when an existing composition already uses legacy Text and matching its typography keeps the design consistent. Do not migrate existing Text widgets solely to enforce the new-composition default.

Text widget `font` data is one structured value. Use the dedicated font commands instead of assembling that object from memory: they resolve the selected family against Composer's user and account font catalogs, validate its available weight, and preserve the widget's other font formatting.

## Inspect before changing text

Read the Text tile and the live primitive schema first:

```bash
node scripts/composer-agent.js get --type tile --id <text-tile-id>
node scripts/composer-agent.js primitives --primitive text
```

The tile must expose a widget field with `id: "font"` and `type: "font"`. Its runtime value has this general shape:

```json
{
  "fontData": { "family": "Open Sans", "weight": "400" },
  "alignment": "left",
  "italic": false,
  "underline": false
}
```

Optional false formatting flags may be absent. Account fonts also require private rendering metadata under `fontData`; `set-font` copies that metadata from Composer's account catalog without exposing it in `fonts` output.

## List available fonts

```bash
node scripts/composer-agent.js fonts
node scripts/composer-agent.js fonts --source user
node scripts/composer-agent.js fonts --source account --family "sans"
```

`--source` is `user` or `account`. `--family` is a case-insensitive substring filter. Each result has `family`, `source`, usable non-italic `variants`, and a `custom` boolean. At most 200 matches are returned. Check `total` and `truncated`, then narrow with `--family` when necessary. Catalog URLs, metrics, and other internal rendering metadata are deliberately omitted.

## Set font properties

```bash
node scripts/composer-agent.js set-font --id <text-tile-id> --family "Open Sans" --weight 700
node scripts/composer-agent.js set-font --id <text-tile-id> --italic --underline --alignment center
node scripts/composer-agent.js set-font --id <text-tile-id> --italic false --underline false
```

| Flag | Meaning |
| --- | --- |
| `--id <tile-id>` | Required compatible legacy-font widget tile in the active composition. |
| `--family <name>` | Exact catalog family, matched case-insensitively. |
| `--source <user\|account>` | Resolve only in one catalog. User fonts take precedence when omitted. |
| `--weight <variant>` | Available non-italic weight. `regular`/`normal` normalize to `400`; `bold` normalizes to `700`. |
| `--italic [true\|false]` | Toggle italic independently of the catalog weight. A bare flag means true. |
| `--underline [true\|false]` | Toggle underline. A bare flag means true. |
| `--alignment <left\|center\|right\|justify>` | Set horizontal alignment. |

Specify at least one property. Eligibility is field-based, not restricted to the Text widget ID: the target must expose a `font` field of schema type `font` with stored `fontData`. Compatible legacy widgets such as Text Ticker can use it; Metric Font fields cannot. The command rejects incompatible or missing font fields, linked targets, unknown catalog families, unsupported weights, invalid account-font metadata, and invalid formatting values before changing the tile. It returns the complete stored font value, its catalog source, and the available weights.

When `--family` is provided without `--weight`, the command keeps the current weight if supported, then prefers `400`, `300`, `500`, or the family's first usable weight. Unspecified formatting remains unchanged. Setting a weight clears the obsolete legacy `bold` flag because weight is authoritative.

Italic remains a top-level boolean. Do not pass catalog variants such as `700italic` as `--weight`; Composer's Text renderer applies italic separately.

## Declarative Text properties

`graphics.apply` accepts the Text widget's complete `font` object under `properties.font`, but that low-level value must already contain the exact runtime shape and any account-font metadata. Prefer applying the Text element first and then using `set-font` with the returned tile ID. Reuse the same declarative key on later passes; `set-font` does not change managed ownership or the key.

Before reapplying, reconcile any deliberate post-apply `set-font` change: update the specification with the exact live runtime value, omit `font` only when preservation is known, or rerun `set-font` with the tile ID returned by `apply`. Use live readback or `set-font` resolution; never guess account-font metadata.

Other Text properties, including `overflow`, `verticalAlignment`, spacing, line-height, transform, shadow, and padding fields, remain ordinary typed widget data. Read their current schema/runtime values and update only the requested field.

## Legacy scope

Prefer Metric Text for new authoring. Use this legacy Text workflow when matching an existing composition or when a required legacy font behavior has no Metric Text equivalent.

When the user explicitly asks to migrate existing Text v2 widgets, inspect the complete tiles and upgrade their IDs together:

```bash
node scripts/composer-agent.js upgrade-metric-widgets --ids <text-tile-id-1,text-tile-id-2>
```

The command chooses Metric Text for single-line data and Metric Text ML when the legacy minimum or maximum line count exceeds one. It maps available Font 2 metrics, converts pixel-based spacing and shadow values relative to the rendered tile height, translates overflow/alignment/line settings, removes obsolete legacy fields, and preserves tile identity, layout, animation, grouping, and compatible same-field links. Do not use it merely because Metric Text is preferred for new work. Incompatible links reject the complete batch; resolve them explicitly rather than silently unlinking. Reinspect all upgraded tiles and visually verify typography, overflow, and spacing. A result with `fontMapped: false` needs a deliberate Metric Font selection.