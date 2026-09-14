# Metric Text authoring

Use `metric-text` (widget `4662`) for single-line Font 2.0 text, including scores aligned on a decimal separator. Use [Metric Text ML](metric-text-ml.md) for explicit multiple lines or wrapping. For native character/word effects, use [Metric Text Animation](metric-text-animation.md). Styled Metric Text remains separate.

Run `primitives --primitive metric-text` to discover the loaded schema and runtime values; use `get` before changing an existing tile. Normal toolbox metadata may already be loaded; the agent also loads missing metadata on demand. Prefer stable-keyed declarative graphics for coordinated authoring:

```json
{
  "key": "score",
  "primitive": "metric-text",
  "placement": { "unit": "percent", "left": 10, "top": 10, "width": 30, "height": 12 },
  "properties": {
    "text": "12.345",
    "alignment": "align.",
    "overflow": "fitScale",
    "color": { "r": 255, "g": 255, "b": 255, "a": 1 }
  }
}
```

`text` is a string. The renderer displays only the content before the first newline; it hides empty or whitespace-only text. Stored line breaks do not imply multiline rendering. Prefer plain text. The optional `<html>...</html>` wrapper renders unsanitized markup: escape untrusted content, avoid scripts, event handlers and executable URLs, and keep behavior in the separate composition-script phase.

The `font` field has schema type `metricfont` and contains a complete `fontData` object with Font 2.0 metrics (`mg`). Metric Text families must exist in the `metric-fonts` catalog, which is a distinct and often smaller inventory than `fonts`; finding a family in `fonts` does not make it available to Metric Text. Run `metric-fonts`, then use `set-metric-font --id <tile-id> ...` to change an unlinked field through the Font 2 catalog; use `--property <field-id>` when the field is not named `font`. If the field is linked, change its defining Metric Font Control Node with `set-control-font` instead. Ordinary Text `set-font` and its legacy `fonts` catalog do not support this field. Do not invent metric values or substitute a family-name string. Choose and apply the intended font before fine-tuning alignment, spacing, or box geometry because its metrics affect fit and baseline. Font size follows the widget height and metrics; change placement height to resize it.

Preserve the operator's entered casing by leaving `transform` as `none` unless the user or reference explicitly requires uppercase, lowercase, capitalization, or small caps. Do not use a transform merely to make the initial sample match because future operator input inherits it.

`alignment` supports left, center, right, and character alignment such as `align.` (last decimal point, centered fallback if absent). `overflow` supports `none`, horizontal `clip`, uniform `fitScale`, and horizontal-only `fitWidth`. Fit modes shrink overflowing text, never enlarge it. `fitScale` preserves glyph proportions but reduces both text width and height; `fitWidth` preserves the authored height and baseline by condensing only the horizontal axis. Prefer `fitWidth` when stable line height is more important than natural glyph proportions, such as a fixed-height lower third, and prefer `fitScale` when proportional typography is more important. Very long copy can become visibly condensed under `fitWidth`, so verify representative maximum-length operator input in the Player. Discover the live selection fields before choosing values; generic updates preserve types and size but do not validate every selection or numeric range. Do not infer an existing tile's overflow choice from the widget family or defaults: inspect it and set the requested mode explicitly.

Letter/word spacing and shadow distance/blur are percentages of widget height. Enabled left/right insets are percentages of widget width; top/bottom insets are percentages of height. These are widget properties, separate from Composer Transform/Effect properties.

Use a Text Control Node linked to `text` for a public single-line input. Creation and declarative application use the shared typed, size-limited, managed-group and rollback contracts. Standard Composer motion remains available; no widget-specific animation API is added. Verify font loading, first-line behavior, replacement/clearing, fitting, character alignment, and resize in the Player. See [Metric Text scripting](../composition-scripting/widget-metrictext.md) for runtime payloads and bounds messages.
