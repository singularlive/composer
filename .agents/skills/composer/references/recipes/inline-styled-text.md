# Inline styled text

Build a single left-aligned line from two or more independently controlled Metric Text family widgets. Use this when each segment needs its own text, Font 2.0 font, and solid color while visible segments must remain adjacent as their content or font changes.

Read [Metric Text Style authoring](../widgets/metric-text-style.md), [Metric Text Style scripting](../composition-scripting/widget-metrictextstyle.md), [composition scripts](../composition-scripts.md), and [ordinary compositions](../compositions.md) before using this recipe. The live widget schema and inspected instances remain authoritative.

## Structure and controls

Create one ordinary root-level sub-composition for the complete inline unit. Inside it:

- Add one left-aligned Metric Text Style widget per segment.
- Put the user-facing position on the containing group and start every segment widget at the same local horizontal origin, normally `left: 0`. The script owns only the segment offsets within that group.
- Give every widget the same top, height, and top-left anchor.
- Keep each widget generously and identically wide; do not resize it to the text.
- Set `overflow: "none"`, `transform: "none"`, and `emitEvents: true`.
- Use one Text, Metric Font, and Color Control Node per segment, plus one Number control named for the shared gap.
- Put all public controls in one semantic ordinary Control Node container.

When a composition script interprets and forwards all segment values, create these as standalone controls. Metric Font controls require the dedicated catalog-backed `create-control --node-type metricfont` path. Metric Text Style publishes fields such as `color` dynamically after initialization; do not assume those dynamic fields can be created declaratively or linked through the static Control Node schema. Inspect and use standalone script inputs when a link is unavailable.

Treat the gap as composition percentage units because widget position and size methods use composition percentage coordinates. Give it an explicit unit, practical min/max, and small step.

## Runtime layout

Metric Text Style emits this widget custom message for nonempty rendered text when `emitEvents` is true:

```javascript
{
  event: "bounds",
  leftPx: 0,
  topPx: 0,
  widthPx: 0,
  heightPx: 0,
  left: 0,
  top: 0,
  width: 0,
  height: 0
}
```

The percentage values are relative to the widget surface. Receive the message with `comp.addListener("message", ...)`; the widget envelope is `msg.params`, the bounds are `msg.params.data`, and the originating tile is `msg.params.id`. Map inspected tile IDs to script items when practical, with a name fallback only when compatibility with an older host requires it. Names are useful authoring contracts but can collide or change. A listener registered on the composition is already scoped to that runtime composition; do not reject a recognized widget ID only because an optional host-provided `params.compId` differs from the authored composition ID.

For each visible segment, cache its latest bounds and lay out only after every visible segment has reported. Keep the first visible segment at local position `0`; do not derive that origin from the first widget's authored or current position. Moving the containing group then moves the combined line without changing internal layout. For every following segment, use:

```javascript
var previousRight = previousPositionX +
  previousWidget.getSizeX() *
  (previousBounds.left + previousBounds.width) / 100;

var currentLeftOffset = currentWidget.getSizeX() *
  currentBounds.left / 100;

var nextPositionX = previousRight + gap - currentLeftOffset;
currentWidget.setPositionX(nextPositionX);
```

Including each reported left offset handles font overhang more accurately than width alone. Change position only when it differs beyond a small tolerance so bounds messages and layout writes do not create a feedback loop. Use one animation frame only to coalesce received bounds events into a layout pass, never to poll for widget readiness or initial bounds.

## Payload and empty values

On initialization and local `payload_changed` events:

1. Read authoritative values with `comp.getPayload2()`.
2. Forward each segment's complete `text`, `font`, and `color` values with `widget.setPayload()` while preserving `alignment: "left"`, `overflow: "none"`, `transform: "none"`, and `emitEvents: true`.
3. Treat empty or whitespace-only text as absent.
4. Hide absent widgets with `setVisibility(false)`, clear their cached bounds, and exclude them from layout.
5. Show nonempty widgets and insert the shared gap only between consecutive visible segments.

Register the composition `message` listener before forwarding the initial controls. Metric Text Style replays cached data after its SVG DOM mounts and emits the resulting bounds, so the composition script does not need to poll `getDomElement()`, toggle `emitEvents`, or retry initialization. Later content, font, and widget-size renders emit updated bounds through the same listener.

An empty Metric Text Style widget returns before emitting bounds, so never wait for a zero-bounds message. Font changes can load asynchronously and produce later measurements; the latest bounds message is the layout authority.

Avoid redundant widget payload writes by comparing the intended segment payload with the last forwarded value. Clean up timers or other scheduled resources in `close()`; composition listeners are owned by the composition-script lifecycle.

## Animation

Do not use Timeline effects that animate horizontal position when the composition script owns `setPositionX()`. Prefer fade, reveal, or another effect that leaves settled geometry unchanged. A short left-to-right stagger can reinforce the reading order. With one Timeline, Out reverses the In choreography; use two timelines only when the requested exit differs.

Empty segments remain hidden and should not leave a visual gap. Timeline assignments may remain on hidden widgets; visibility and layout are still controlled by the script.

## Verification

Verify in the scoped Singular Player and in the intended Control App host, not only through stored script or Composer readback:

- all segments visible with visibly different fonts and colors;
- first, middle, and last segment empty in separate payload scenarios;
- two adjacent empty segments and all segments empty;
- gap changes without widget resizing;
- short and long text plus font changes that alter rendered extent, while the measured visual gap remains constant;
- rapid text/font changes without stale positions or script errors;
- a fresh Control App load followed by at least one operator text or font update;
- animation at an early, overlapping, and settled frame;
- Out behavior and final visibility.

Inspect Player measurements to confirm widget widths remain fixed while widget positions change. View retained screenshots and require zero composition-script errors before handoff.
