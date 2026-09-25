# Material-preserving text color

Candidate pending Player verification of the adapted scenario. Use one standalone Color input to recolor a requested styled material while preserving its gradient, outline and sheen. A direct Color-to-gradient link deliberately produces a solid fill; it is correct for one-to-one solid-color inputs, not for this derived multi-property presentation.

Read [Metric Text Style authoring](../widgets/metric-text-style.md), [its runtime payload](../composition-scripting/widget-metrictextstyle.md), [composition scripts](../composition-scripts.md) and [Player verification](../composition-scripting/debugging-and-verification.md) before their respective phases. Inspect the current dynamic schema and all links first. Do not remove an API-facing link or a protected contract to install this pattern.

## Ownership and derivation

Keep editable text and shared font directly linked. Place the standalone Color in a semantic Large container alongside the related controls; leave derived `color` and `outlineColor` unlinked with one script writer. Read the input through the existing local or root-forwarded payload path on initialization and every relevant change. Preserve unrelated handlers and clean up owned listeners in `close()`.

The following ES2017 helper illustrates RGB mixing toward white/black, not TinyColor's HSL lightness adjustment. Its proportions are an example design contract, not a universal palette. Resolve `context.utils.createTinyColor` from the runtime context, and send the returned patch to the inspected Metric Text Style widget. Alpha is carried by stop opacity exactly once.

```javascript
function materialPatch(context, value) {
  var parsed = context.utils.createTinyColor(value);
  if (!parsed.isValid()) throw new Error('Invalid material color');
  var base = parsed.toRgb();
  function mix(destination, amount) {
    return context.utils.createTinyColor({
      r: base.r + (destination - base.r) * amount,
      g: base.g + (destination - base.g) * amount,
      b: base.b + (destination - base.b) * amount
    }).toHexString();
  }
  return {
    color: {
      type: 'linear', angle: 90, scale: 100, offset: 0,
      keepAspect: false, spreadMethod: 'pad',
      stops: [
        { offset: 0, color: mix(255, 0.65), opacity: base.a },
        { offset: 0.35, color: mix(0, 0), opacity: base.a },
        { offset: 0.65, color: mix(0, 0.15), opacity: base.a },
        { offset: 1, color: mix(0, 0.55), opacity: base.a }
      ]
    },
    outlineColor: { type: 'solid', solidColor: context.utils.createTinyColor(mix(0, 0.85)).setAlpha(base.a).toRgb() }
  };
}
```

Keep outline activation/width and sheen design in Composer unless those too are explicitly derived. This helper does not write `text`, `font`, or a public Control Node. Preserve complete native gradient geometry and stop values. Do not expose a native Gradient Control Node, construct CSS gradient strings for this SVG field, or attach a competing direct Color link.

For near-white inputs the lower dark stops and outline must still be visible; a light screen sheen alone can disappear on a white base. Judge static readability first, then sample both the away and crossing phases of the sheen. Font size follows widget height and metrics: a deliberately oversized text box within a clipping group can increase cap height, but verify the entire glyph, outline and motion envelope in Player rather than standardizing a particular percentage or font.

## Version-1 Player scenario

Copy [the material scenario](material-preserving-color-scenario.json), map `Material Color` and `Material Text` to inspected controls, and target the independently visible styled-text module. Supply explicit payload source IDs when controls live on an ancestor. The example samples saturated red and near-white with two checkpoints per color; adapt waits to the authored sheen period. Use a separate already-In specimen or an agreed longer hold so a celebration timeout does not hide the material during these checks.

Review all four Player frames at output resolution. Each color must show distinct light/dark gradient regions, a visible outline and readable text; the sheen crossing must remain perceptible. `assertPixelsChanged` only detects a difference, not a gradient or correct material. Check the same lettering at both colors, long/multilingual text without forced casing, and transparent input if that is supported by the public contract. Require complete script telemetry, successful initialization and zero `error`/`unknown`. A Control App color picker and real API path need separate verification.