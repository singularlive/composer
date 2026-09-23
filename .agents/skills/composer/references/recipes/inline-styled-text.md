# Inline styled text

Build a single left-aligned line from two or more independently controlled Metric Text family widgets. Use this when each segment needs its own text, Font 2.0 font, and solid color while visible segments must remain adjacent as their content or font changes.

Before structural work, read [Metric Text Style authoring](../widgets/metric-text-style.md) and [ordinary compositions](../compositions.md). Before script work, read [Metric Text Style scripting](../composition-scripting/widget-metrictextstyle.md) and [composition scripts](../composition-scripts.md); before verification, read [Player verification](../composition-scripting/debugging-and-verification.md). Establish the bounds-event, script-owned positioning, and public-input requirements below before mutation. The live widget schema and inspected instances remain authoritative.

## Structure and controls

Choose the inline unit's owning composition using "Choose the right structural unit" in [authoring-quality.md](../authoring-quality.md). Keep the complete line together inside that owner:

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

The percentage values are relative to the widget surface. Use `comp.addListener("message", function(event, msg, e) { ... })`: the first argument is the event-name string, not the message. The widget envelope is `msg.params`, the bounds are `msg.params.data`, and the originating tile is `msg.params.id`. The family contracts are documented in [Metric Text](../composition-scripting/widget-metrictext.md), [Metric Text ML](../composition-scripting/widget-metrictextml.md), [Metric Text Style](../composition-scripting/widget-metrictextstyle.md), and [Metric Text Animation](../composition-scripting/widget-metrictextanim.md). Map inspected tile IDs to script items when practical, with a name fallback only when compatibility with an older host requires it. Names are useful authoring contracts but can collide or change. A listener registered on the composition is already scoped to that runtime composition; do not reject a recognized widget ID only because an optional host-provided `params.compId` differs from the authored composition ID.

```javascript
comp.addListener("message", function(event, msg, e) {
  var params = msg && msg.params;
  var bounds = params && params.data;
  if (!bounds || bounds.event !== "bounds" || params.id !== SUBTITLE_TILE_ID) return;
  layoutFromBounds(bounds);
});
```

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

Register the composition `message` listener before forwarding the initial controls. `addListener` replaces an existing handler for the same composition/event; merge this recipe's message and payload logic into existing handlers rather than overwriting unrelated behavior. Metric Text Style replays cached data after its SVG DOM mounts and emits the resulting bounds, so the composition script does not need to poll `getDomElement()`, toggle `emitEvents`, or retry initialization. Later content, font, and widget-size renders emit updated bounds through the same listener.

An empty Metric Text Style widget returns before emitting bounds, so never wait for a zero-bounds message. Font changes can load asynchronously and produce later measurements; the latest bounds message is the layout authority.

Avoid redundant widget payload writes by comparing the intended segment payload with the last forwarded value. Clean up timers or other scheduled resources in `close()`; composition listeners are owned by the composition-script lifecycle.

## Animation

### Accent tracking variant

For an accent under a subtitle, put both widgets in the same coordinate scope with top-left anchors, enable subtitle `emitEvents`, and leave the bar width script-owned. From a recognized bounds message, compute the right edge and tween only `bar.setSizeX()`:

```javascript
var targetWidth = Math.max(0, subtitle.getPositionX() +
  subtitle.getSizeX() * (bounds.left + bounds.width) / 100 - bar.getPositionX());
```

Use a bounded width tween (for example 200 ms using `requestAnimationFrame`), starting from the bar's current width. Cancel any prior tween on new bounds and cancel it in `close()`. On the local payload event, read the authoritative Subtitle input; when empty or whitespace-only, cancel the tween and immediately call `bar.setSizeX(0)`. Ignore stale bounds while the current subtitle is empty because Metric Text does not emit zero bounds for empty text. Never estimate width from character count. On nonempty replacement, wait for fresh rendered bounds; font loading can produce later corrections. Recompute after position changes because moving a widget does not itself emit bounds. Keep existing message/payload listeners merged.

For directly linked text, a bounds message can arrive before `getPayload2()` reflects the new Subtitle. Do not discard recognized bounds using a synchronous empty-input guard: the first nonempty subtitle can otherwise lose its only measurement. Cache the latest bounds and check the authoritative input in one coalesced animation frame. This schedules work only after a received event; it is not readiness polling. Integrate these handlers into the existing listeners. Here `animateAccentTo(width)` is the bounded tween above and `cancelAccentTween()` cancels its active frame:

```javascript
var pendingSubtitleBounds = null;
var subtitleLayoutFrame = null;

function cancelSubtitleLayout() {
  if (subtitleLayoutFrame !== null) cancelAnimationFrame(subtitleLayoutFrame);
  subtitleLayoutFrame = null;
  pendingSubtitleBounds = null;
  cancelAccentTween();
}

function onSubtitleBounds(event, msg, e) {
  var params = msg && msg.params;
  var bounds = params && params.data;
  if (event !== 'message' || !bounds || bounds.event !== 'bounds' || params.id !== SUBTITLE_TILE_ID) return;
  pendingSubtitleBounds = bounds;
  cancelAccentTween();
  if (subtitleLayoutFrame !== null) return;
  subtitleLayoutFrame = requestAnimationFrame(function() {
    subtitleLayoutFrame = null;
    var latest = pendingSubtitleBounds;
    pendingSubtitleBounds = null;
    if (!String(comp.getPayload2().Subtitle || '').trim()) return;
    animateAccentTo(Math.max(0, subtitle.getPositionX() +
      subtitle.getSizeX() * (latest.left + latest.width) / 100 - bar.getPositionX()));
  });
}

function onSubtitlePayload() {
  if (String(comp.getPayload2().Subtitle || '').trim()) return;
  cancelSubtitleLayout();
  bar.setSizeX(0);
}
```

Call `onSubtitlePayload()` during initialization and local payload handling. Call `cancelSubtitleLayout()` in `close()` before releasing widget references; canceling only the tween leaves a queued layout callback alive. One-frame coalescing resolved the observed linked-input ordering race, but is not a general promise about every host's event timing. Verify the first empty-to-nonempty transition and rapid replacements in the intended host.

Verify short, long, short-again and empty subtitles, including rapid replacement, in Player. The supplied task observed this geometry and empty collapse; a generic width-tween implementation still needs verification with its own anchors, font and motion. Do not claim the host probe alone proves a composition listener ran: inspect a derived on-output result as well.

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
