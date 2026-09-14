# Overlay in a sized group

Build one coherent overlay as a movable, resizable unit whose canvas bounds and shared Timeline lifecycle belong to its managed group. Use this for a lower third, reporter tag, bug, or similar module whose visible children enter and leave together.

Before structural work, read [authoring quality](../authoring-quality.md), [graphics](../graphics.md), the relevant [widget guides](../widgets.md), and [Control Nodes](../control-nodes.md) when values are public. Before motion work, read [composition motion](../composition-motion.md) and inspect the live Timeline animation catalog. Before verification, read [capture](../capture.md); use Singular Player when runtime handoffs or intermediate motion must be proved.

Do not use this pattern when the group would combine persistent and transient children, when children need genuinely independent canvas bounds, or when one child must animate separately. Split those lifecycles into separate groups or modules instead.

## Structure

Put the overlay in its own ordinary root-level sub-composition. Root remains the orchestration and shared-theme-control layer. Inside the overlay composition, use its managed group as both the declarative ownership boundary and the overlay frame:

```json
{
  "version": 2,
  "group": {
    "layout": {
      "anchor": { "x": 0, "y": 0 },
      "left": 8,
      "top": 72,
      "width": 58,
      "height": 14
    }
  },
  "elements": [
    {
      "key": "panel",
      "primitive": "rectangle",
      "name": "Panel",
      "layout": {
        "anchor": { "x": 0, "y": 0 },
        "left": 0,
        "top": 0,
        "width": 100,
        "height": 100
      },
      "properties": {
        "fillGradient": { "r": 255, "g": 255, "b": 255, "a": 1 }
      }
    },
    {
      "key": "headline",
      "primitive": "metric-text",
      "name": "Headline",
      "layout": {
        "anchor": { "x": 0, "y": 0 },
        "left": 6,
        "top": 30,
        "width": 88,
        "height": 46
      },
      "properties": {
        "text": "Headline",
        "color": { "r": 8, "g": 24, "b": 46, "a": 1 },
        "overflow": "fitWidth"
      }
    }
  ]
}
```

The group values are canvas percentages. Each child layout is local to that group, also in percentages: the panel fills the frame and the text uses local insets. Keep stable element keys across refinements so Control Node links, fonts, and identities survive.

Validate and apply the specification, then retain the returned group ID:

```bash
node scripts/composer-agent.js validate --file <overlay-spec.json>
node scripts/composer-agent.js apply --file <overlay-spec.json>
```

The apply result's group layout is authoritative. Confirm it and the child layouts with one projected read:

```json
{
  "targets": [
    { "type": "group", "id": "<managed-group-id>" },
    { "type": "tile", "id": "<panel-id>" },
    { "type": "tile", "id": "<headline-id>" }
  ]
}
```

```bash
node scripts/composer-agent.js get-layouts --file <layout-targets.json>
```

Require the group to carry the intended canvas `left`, `top`, `width`, and `height`; require each child to use local bounds. Do not compensate for an incorrect group by duplicating canvas coordinates on every child.

## Public values and theme

Expose operator text through local Text Control Nodes. If colors are intended to be changeable across sibling modules, create semantic root-owned Color controls initialized from the current Accent, Panel, and Text values and reuse each source across descendant targets. Direct Color-to-Gradient and Color-to-Color links preserve the rendered solid color when created.

Before reapplying, inspect controls and links. A same-key reapply writes only fields present in the new specification, so omit operator-owned `text`, `font`, or linked color fields when changing geometry. Reinspect afterward and require those values, keys, and links to remain unchanged. Never restore an assumed sample string over an operator-entered value.

## Group-level motion

Fresh declarative primitives have no In or Out animation. Assign one Timeline animation to the managed group when every child shares the lifecycle:

```bash
node scripts/composer-agent.js timeline-animations
node scripts/composer-agent.js set-timeline-animation --type group --id <managed-group-id> --timeline In --effect translateNoFade --property left --duration 0.6
```

Choose easing from the live catalog and provide it through `--easing-file` when needed. With one Timeline, Out reverses In. Enable two timelines and assign a separate group Out effect only when the requested exit differs.

When converting an existing overlay, inspect every child's Timeline assignment. Clear obsolete per-element motion only after confirming that the group now owns the complete lifecycle; otherwise the child and group transforms combine and produce unintended motion.

For mutually exclusive overlays that share the same screen band, put their ordinary compositions in one logic layer and use `delay: auto` by default. `delay: none` starts incoming and outgoing motion together and can visibly overlap co-located members.

## Verification

Use Composer readback to prove structure, values, links, and assignments:

- the overlay group owns canvas position and size;
- children use group-relative geometry;
- the group, not each child, owns the shared Timeline motion;
- stable keys, linked text, Metric Fonts, and unrelated widget fields survive reapply;
- seeded Color controls equal the pre-link colors and the initial rendered result is unchanged.

Use capture or Singular Player to inspect settled In, an intermediate entrance frame, and settled Out. For a logic-layer swap, use Player checkpoints before, during, and after the handoff; require the outgoing member to clear before the incoming member becomes visible. Standalone capture of one composition cannot prove a cross-layer transition.

Restore the requested active member, payload, Timeline state, and editor scope before handoff. Report model-only or single-frame evidence as such.
