# Hand off a line through background occlusion

**Use when:** A line, rule, or simple shape should appear to transform into a differently arranged outline, but one native Timeline assignment cannot express every stage of the transformation.

**Principle:** Layer a background-matching occlusion mask between the source segments and destination segments. Reveal the mask to hide the source while independently revealing the destination, creating one continuous visual handoff from several simple elements.

**Apply:**

- Define **source segments** as the shapes visible during the opening motion, **occlusion masks** as shapes that exactly match the stable background behind them, and **destination segments** as the shapes that form the final geometry.
- Place the layers back-to-front in this order: background, source segments, occlusion masks, destination segments, then any foreground content that must stay unobscured.
- Oversize each occlusion mask slightly beyond its source segment so antialiased edges cannot leave a seam.
- Animate source segments into view first. Reveal the occlusion masks only when the handoff should begin, then reveal destination segments in the intended construction order.
- Use stable declarative element keys with `graphics.apply`, then assign the related native Timeline choreography together with `set-timeline-animations`.
- Replace example element names such as `source-left`, `mask-left`, or `destination-top` with stable keys and Composer element IDs resolved from the target composition.
- Use this technique only when the background beneath every mask remains visually identical for the complete handoff. Prefer clipping, a direct transform, or script-driven motion when the background is animated, textured, transparent, or otherwise cannot be matched reliably.

**Adjust:** Source and destination segmentation, mask overscan, layer order, stroke thickness, reveal direction, stage overlap, duration, easing, and the pause between erasing the source and drawing the destination.

**Verify:** Capture the source-only stage, the occlusion midpoint, at least one partial destination stage, and the settled result. Confirm that the source disappears without edge remnants, masks are indistinguishable from the background, destination segments meet without gaps or double thickness, foreground content is never covered, and the settled Out state matches the intended lifecycle.
