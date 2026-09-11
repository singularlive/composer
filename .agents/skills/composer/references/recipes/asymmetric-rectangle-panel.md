# Asymmetric Rectangle panel

Build a solid panel with square left corners and rounded right corners from native Rectangle widgets. Use this for lower-third bars, labels, and tabs when one uniform Rectangle bevel cannot express the requested silhouette. Read [Rectangle authoring](../widgets/rectangle.md) and [graphics](../graphics.md) before mutation.

## Layer construction

Create both layers in the same managed group with stable keys:

1. A base Rectangle fills the complete panel and uses `bevelStyle: "outside"` with an explicit positive bevel size.
2. A square patch Rectangle uses `bevelSize: 0`, shares the exact fill, top, bottom, and left edge, and sits immediately above the base.
3. The patch width must cover the left corner arcs but remain narrower than the panel width minus the right radius. A practical starting point is slightly more than one radius; confirm the result from the rendered pixels.
4. Content sits above both panel layers. Keep unrelated backgrounds behind them.

Rectangle uses one bevel treatment for all corners, so this overlay is the native construction rather than a per-corner setting. Do not fake the square edge by moving the rounded base beyond a clipping boundary unless that clipping is already an intentional ownership constraint.

## Fill and sizing

Use identical solid RGBA fills for the base and patch. Independent Rectangle or Gradient widgets calculate their own gradients, so a two-layer gradient can restart at the patch boundary and reveal a seam. When a continuous gradient is required, use one Gradient or AI Graphics surface only after accepting that primitive's authoring and runtime contract.

Use pixel bevel units when the desired radius must remain constant across differently sized presentations. For percentage units, calculate from each tile width rather than copying a percentage between variants. Align outer bounds exactly and avoid fractional-pixel discrepancies at the patch edge when output resolution permits integer geometry.

## Verification

Read back both placements, bevel fields, fills, group membership, and layer order. Capture at output resolution and inspect the left edge, patch boundary, right corner silhouette, and content clearance. A successful panel has square left corners, matching rounded right corners, no visible vertical seam, and no patch overlap into the right arcs. Verify each display presentation separately because radius and patch width may need variant-specific geometry.
