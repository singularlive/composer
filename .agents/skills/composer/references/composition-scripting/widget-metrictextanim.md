# Metric Text Animation (widgetId 4706)

Single-line Font 2.0 text with native Timeline-driven effects. For paired construction and dynamic-field discovery, use [Metric Text Animation authoring](../widgets/metric-text-animation.md). The inspected instance/version and live schema remain authoritative.

## Payload contract

The base `text`, `font`, `color`, `alignment`, `overflow`, spacing, transform, shadow, inset and `emitEvents` payloads follow [Metric Text](widget-metrictext.md). Preserve its complete Font 2.0 font and metrics; do not fabricate metrics or use ordinary Text font commands. Plain text uses the first line; empty/whitespace-only text is hidden. Trusted `<html>...</html>` content uses the renderer's HTML split builder and is unsanitized; do not interpolate untrusted markup or promise plain-text line/splitting behavior for arbitrary HTML.

```javascript
var headline = comp.findWidget('Animated headline')[0];
headline.setPayload({ text: 'Breaking update' });
```

`setPayload` merges into the existing widget payload. The following names describe renderer inputs; only use keys/options confirmed by live inspection:

| Key | Type | Renderer fallback / meaning |
| --- | --- | --- |
| `animationTarget` | string | `characters`; `words` keeps whitespace separators outside animated units. |
| `inEffect` | string | `fade`; select from the live effect list. |
| `inEasing` | string | `cubic`; easing profile per unit. |
| `inOrigin` | string | `left`; unit ordering, including center and random options. |
| `inOverlap` | number | 50; percentage overlap between units. |
| `outEffect` | string | `same`; reversed In, or an independent effect with two timelines. |
| `outEasing`, `outOrigin`, `outOverlap` | string, string, number | `cubic`, `left`, 50 for an independent Out effect. |
| `useUpdateAnimation` | boolean | Enabled unless explicitly false. |
| `updateOverlap` | number | 0; overlap of leaving and entering text during native text updates. |
| `in...`, `out...` effect fields | live schema type | Per-effect namespaced parameters, e.g. `inMoveDistance`. Discover after selecting the effect. |

Current source includes fade, tracking, movement, evaporation, typewriter, pop, flip, wave, orbit, depth and bounce effects. Do not infer their payload IDs from display titles. Conditional effect settings change the visible schema; hidden saved values may persist but have no active effect.

## Timeline and text changes

Configure the Composer `widget` Timeline effect with a positive duration during the paired phase. Use supported composition `playTo`/`jumpTo` methods to drive it in the Player; do not call renderer internals. Source callbacks implement start, stop, seek, jump and init. One-timeline Out reverses In; independent Out settings apply only with two timelines. A mid-play reversal retains the active effect configuration.

Native text updates require enabled `useUpdateAnimation`, settled In state, existing units and a text-only payload delta with nonempty new text. Non-text changes and clearing rebuild/snap instead. Update halves use cached Timeline durations with a 0.5-second fallback; `updateOverlap` controls their overlap. Rapid updates finish the previous update before starting the next. These source rules are not a guarantee that every loaded version behaves identically.

`emitEvents` sends the same `bounds` message as Metric Text for nonempty text. The composition listener receives the envelope as `msg.params`, the bounds payload as `msg.params.data`, and the originating tile ID as `msg.params.id`; use that ID to route messages from multiple widgets:

```javascript
comp.addListener("message", function (event, msg, e) {
	var params = msg && msg.params;
	var data = params && params.data;
	if (data && data.event === "bounds" && params.id === MY_TILE_ID) {
		// Consume this widget's bounds.
	}
});
```

The reported box follows Metric Text overflow semantics: `none` and `clip` retain the natural rendered width, while `fitScale` and `fitWidth` report the fitted box when text exceeds the available width. Use `overflow: "none"` to size a separate shape to natural text. Bounds describe the settled text geometry, not the transient per-unit animation extent. See the [inline styled text recipe](../recipes/inline-styled-text.md) for a complete consumer and dependent-layout pattern. Verify actual animation, font readiness, replacement, clearing, resize, reversal and conditional effects in the Player. A successful paired update or handoff is not runtime evidence.

Sources: `app/components/widgets/WidgetMetricTextAnim.js`, `metricTextAnim/buildDynamicUI.js`, `metricTextAnim/effects/`, `metricTextAnim/splitContent.js`.
