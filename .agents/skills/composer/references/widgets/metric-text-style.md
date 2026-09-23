# Metric Text Style authoring

Use `metric-text-style` (widget `4758`) for single-line Font 2.0 text rendered as SVG with gradient fill, outline, glow, shadow and sheen. For character/word entrances and text-change animation, use [Metric Text Animation](metric-text-animation.md). Style's fill, glow and sheen animations loop while on screen; they are not Widget Timeline entrance effects.

Run `primitives --primitive metric-text-style` for catalog fields and defaults. Prefer stable-keyed declarative creation, then inspect the created tile with `get --type tile --id <id> --compact` for its native dynamic style fields. Missing catalog metadata loads on demand.

```json
{
  "key": "headline",
  "primitive": "metric-text-style",
  "placement": { "unit": "percent", "left": 10, "top": 20, "width": 80, "height": 15 },
  "properties": { "text": "CHAMPIONS", "alignment": "center", "overflow": "fitWidth" },
  "control": { "name": "Headline", "type": "text", "property": "text" }
}
```

This is one element in a version-2 graphics specification. Styles, templates and orchestration use the same catalog-only properties and shared ownership/rollback rules. Dynamic style fields belong to staged typed updates, not declarative `properties`. Do not substitute raw model writes or guess fields missing from discovery.

The widget publishes its custom UI on value delivery; unlike Metric Text Animation, it does not need a Widget Timeline assignment first. If the initial `get` has only catalog fields, re-read after initialization. Then:

1. Inspect current values and field types. Change the `font` metricfont with `set-metric-font` when unlinked or `set-control-font` through its defining linked control; ordinary Text font commands and invented font metrics do not apply. Choose the font before final alignment and spacing, and preserve operator-entered casing unless a transform is explicitly requested.
2. For several already-discovered fields, prefer one `set-properties --file <manifest.json>` batch, then read back. Use `update --type tile --id <id> --namespace data --path <field> --value-file <json-file>` for an isolated field. A solid `color` or `outlineColor` accepts any JSON-representable tinycolor2 color, including CSS color strings and RGBA such as `{ "r": 255, "g": 210, "b": 70, "a": 1 }`; the renderer converts it to a solid gradient. Preserve or author a complete inspected structured gradient only when the requested result is non-solid; CSS gradient strings are not structured gradients.
3. Select `fillAnimMode`, `sheenAnimMode` or `glowAnimMode` first, then `get` again before changing the newly exposed parameters. Compact discovery retains choices, ranges, units and runtime values. Hidden saved parameters may survive mode switches; their absence from the current schema does not mean they were deleted.
4. Enable `outlineActive`, `shadowActive`, `sheenActive`, `glowActive` or `insetActive` only as needed. Keep public text inputs as Text controls; do not expose structured gradients through a native Gradient Control Node.

Fill modes are none, move, colorcycle and breathe. Sheen modes are periodic and drift, gated by `sheenActive`. Glow modes are none, breathe, flicker, drift and colorshift, gated by `glowActive`. Use the live mode-specific choices/ranges rather than guessing parameter names. Generic updates enforce types and the shared 32 KB serialized-value limit, not all selection/range or gradient-internal constraints.

## Styling judgment

Treat requests such as “fancy,” “premium,” or “polished” as visual direction, not as a request to enable every effect. Establish a material and motion idea first, using the composition palette and hierarchy. Prefer one primary animated layer, then support it with restrained static depth:

- **Polished or metallic:** use a multi-stop gradient with dark edges, a saturated body, and a narrow lighter band; add a thin dark outline and soft shadow. A pale `screen`, `plus-lighter`, or `color-dodge` sheen then has enough luminance headroom to become visible.
- **Neon:** use a dark saturated fill, restrained outline, and active glow. Prefer glow motion over sheen so two loops do not compete.
- **Glossy color:** use a mid-tone saturated fill with a lighter related sheen. Keep the base readable when the sheen is elsewhere.
- **Light or white text:** do not assume a light `screen` sheen will show; near-white fill leaves almost no channel headroom. Use a darker or saturated base, or choose a darker/contrast-producing blend only when the intended material supports it.

Build and judge the static appearance before animation. The text must remain legible and visually intentional between effect passes. Then enable one loop and verify at least two timed Player frames: one where the animated effect is away from the glyphs and one where it crosses them. A changing frame is not sufficient if the effect is imperceptible or only changes already-white pixels.

When the user supplies only an adjective, infer a conservative recipe from the surrounding design and state the material choice briefly. The most useful additional direction is a reference image or a short specification naming: material (`metallic`, `neon`, `glass`, `glossy`), palette, desired motion (`sweep`, `breathe`, `flicker`, or none), intensity, and whether readability or spectacle has priority.

Only the first line renders. HTML-wrapped input is reduced to plain text for SVG; prefer plain text. Empty or whitespace-only text hides the layers and stops their animator. Font size follows widget height and font metrics. Letter/word spacing, outline width, shadow dimensions, glow size and vertical insets use percentages of widget height; horizontal insets use widget width. `gradientExtent` selects text or widget bounds. Leave room for effects that extend outside the glyph box, especially with clipping.

Verify gradient/outline/filter appearance, mode changes, text replacement/clearing and looping behavior in the Player. Use timed capture for continuous loops. See [Metric Text Style scripting](../composition-scripting/widget-metrictextstyle.md) for payload and lifecycle behavior.
