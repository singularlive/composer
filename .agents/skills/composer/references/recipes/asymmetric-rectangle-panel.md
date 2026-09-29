# Asymmetric Rectangle panel

Build a solid panel with square left corners and rounded right corners from native Rectangle widgets. Use this for lower-third bars, labels, and tabs when one uniform Rectangle bevel cannot express the requested silhouette. Read [Rectangle authoring](../widgets/rectangle.md) and [graphics](../graphics.md) before mutation.

## Layer construction

Create both layers in the same managed group with stable keys:

1. A base Rectangle fills the complete panel and uses `bevelStyle: "outside"` with an explicit positive bevel size. Set widget `width: 100`, `height: 100`, `strokeWidth: 0` and `outlineWidth: 0` on both layers so their shapes fill their tile bounds without a stroke or hole.
2. A square patch Rectangle uses `bevelSize: 0`, shares the exact fill, top, bottom, and left edge, and sits immediately above the base.
3. For panel width `W`, height `H` and configured bevel size converted to pixels, the effective radius `r` is the smaller of that size, `W / 2` and `H / 2`. The patch width must be at least `r` and at most `W - r`: cover the left arcs without entering the right arcs. Use slightly more than `r` only when that interval permits it. For a 400-by-120-pixel panel with a 12-pixel radius, a 16-pixel-wide, 120-pixel-high patch meets these bounds. Confirm the rendered pixels rather than treating this geometry as a capture result.
4. Content sits above both panel layers. Keep unrelated backgrounds behind them.

Rectangle uses one bevel treatment for all corners, so this overlay is the native construction rather than a per-corner setting. Do not fake the square edge by moving the rounded base beyond a clipping boundary unless that clipping is already an intentional ownership constraint.

## Fill and sizing

Use identical opaque solid RGBA fills (`a: 1`) for the base and patch, with neither layer independently faded or made translucent. Translucent overlaps accumulate alpha, so identical translucent colors do not produce a uniform panel. This recipe does not establish seam-free fades. Keep `strokeWidth: 0` and `outlineWidth: 0`: a stroked patch can expose an internal edge, while a filled patch covers an outline's hole.

Independent Rectangle or Gradient widgets calculate their own gradients, so a two-layer gradient can restart at the patch boundary and reveal a seam. A Gradient widget alone does not establish the requested per-corner silhouette. For transparency, continuous gradients or asymmetric borders, agree on a separately supported single-surface construction instead of extending this recipe. Use [AI Graphics](../widgets/ai-graphics.md) only with explicit approval and its authoring contract; do not invent per-corner Rectangle fields.

Use pixel bevel units when the live schema supports them and the desired radius must remain constant across differently sized presentations. For percentage units, calculate from the base tile width rather than copying a percentage between variants. Align the shared left, top and bottom edges exactly and avoid fractional-pixel discrepancies at the patch edge when output resolution permits integer geometry. Keep both layers' transforms aligned; do not animate their geometry independently.

## Verification

Read back both placements, shape dimensions, bevel fields, opaque fills, zero stroke/outline widths, group membership, and layer order. Preserve defining Control Node ownership when changing linked values. Capture at output resolution and inspect the left edge, patch boundary, right corner silhouette, and content clearance. A successful panel has square left corners, matching rounded right corners, no visible vertical seam, and no patch overlap into the right arcs. Verify each display presentation separately because radius and patch width may need variant-specific geometry.

These construction limits are source-derived from the native Rectangle geometry and SVG fill handling, not a live rendering result. The loaded schema remains authoritative; pixel claims require the capture above.
