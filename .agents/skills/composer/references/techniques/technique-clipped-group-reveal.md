# Reveal content through a clipped group

**Use when:** Content should enter or leave through a bounded region without remaining visible elsewhere on the canvas.

**Principle:** Make the animated content a child of a bounded group, enable child clipping on that group, and move the content across the group boundary.

**Apply:**

- Inspect the group and content before changing hierarchy or layout.
- Give the group explicit bounds that represent the visible region.
- Enable `groupClipChildren` on the group.
- Ensure the animated content is a native child of that group.
- Position the content so its animation crosses the clipping boundary in the requested direction.
- Assign the translation through the appropriate typed Timeline or Update-animation command.

**Adjust:** Group bounds, reveal direction, travel distance, duration, easing, and whether the same boundary is used for entry and exit.

**Verify:** Content is hidden outside the group throughout travel and reaches the intended final position. A settled image proves final layout only; use intermediate Player frames or another motion artifact when clipping during movement matters.
