# Metric Text Style (widgetId 4758)

Styled single-line Font 2.0 text rendered as SVG. For construction and staged dynamic-field discovery, use [Metric Text Style authoring](../widgets/metric-text-style.md). Follow the [composition-script workflow](../composition-scripts.md); the live schema and inspected instance remain authoritative for the loaded version.

Resolve the authored widget by its unique name and update only intended payload properties:

```javascript
var title = comp.findWidget("Styled headline")[0];
title.setPayload({ text: "CHAMPIONS" });
```

| Payload fields | Contract |
| --- | --- |
| `text`, `font` | First-line text string and complete inspected Font 2.0 metricfont object. Preserve `fontData` and metrics. Empty/whitespace text hides all layers and stops the animator. HTML input is reduced to plain SVG text. |
| `alignment`, `overflow`, `transform` | Inspect the live selection choices. Alignment supports left/center/right and separator alignment. Overflow supports none/clip/fitWidth/fitScale. Transform supports none/uppercase/lowercase/capitalize/small-caps. |
| `letterSpacing`, `wordSpacing` | Numbers, percentages of widget height. |
| `color`, `gradientExtent` | Complete solid/linear/radial gradient object and text/widget extent. |
| `outlineActive`, `outlineColor`, `outlineWidth` | Boolean toggle, complete gradient and width as percentage of height. |
| `shadowActive`, `shadowColor`, `shadowDirection`, `shadowDistance`, `shadowBlur` | Boolean, inspected color value, degrees, distance/blur as percentages of height. |
| `sheenActive`, `sheenColor`, `sheenWidth`, `sheenFalloff`, `sheenAngle`, `sheenIntensity`, `sheenBlend` | Boolean, inspected color, percentage controls, degrees and a live blend selection. |
| `glowActive`, `glowColor`, `glowSize`, `glowStrength` | Boolean, inspected color, size/strength percentage controls. |
| `insetActive`, `insetLeft`, `insetRight`, `insetTop`, `insetBottom` | Boolean and numeric percentages; horizontal uses widget width, vertical uses height. |
| `fillAnimMode`, `sheenAnimMode`, `glowAnimMode` | Mode selectors; use the dynamic fields discovered after selecting each mode for parameters. |
| `emitEvents` | Boolean enabling widget custom `bounds` messages for nonempty rendered text. |

The renderer uses a local animation-frame loop for fill movement/color cycling/breathing, sheen passes/drift, and glow breathing/flicker/drift/color shifting. Native In state resumes the loop; other animation states pause it. Pausing or changing unrelated properties preserves accumulated phase. These loops do not implement character/word In/Out or text-change transitions. No Widget Timeline setup is needed to publish the style UI.

`bounds` messages contain `{ event: "bounds", leftPx, topPx, widthPx, heightPx, left, top, width, height }`, relative to the widget surface. Use the signature `(event, msg, e)`: the first argument is the event-name string, not the message. Receive them from the composition message listener:

```javascript
comp.addListener("message", function (event, msg, e) {
	var params = msg && msg.params;
	var data = params && params.data;
	if (data && data.event === "bounds" && params.id === MY_TILE_ID) {
		// Consume this widget's bounds.
	}
});
```

`msg.params` is the widget-message envelope, `msg.params.data` is the bounds payload, and `msg.params.id` is the originating tile ID. Use that ID as the routing key when several widgets emit messages. Pixel values use the widget's logical layout coordinate space, while percentage values divide those logical values by the widget dimensions. They describe the transformed glyph box, not the full tile or glow/shadow extent, and remain independent of outer Player scaling. `none` and `clip` report the natural glyph width; `fitScale` reports the uniformly scaled glyph box when text exceeds the available width, while `fitWidth` reports the horizontally fitted glyph box. Use `overflow: "none"` when sizing a separate shape to the natural text width. See the [inline styled text recipe](../recipes/inline-styled-text.md) for a complete consumer and dependent-layout pattern.

Register the composition `message` listener before forwarding initial widget payloads. If a payload reaches Metric Text Style before its SVG DOM mounts, the widget caches and replays it after mount, then emits bounds naturally. Content, font, and widget-size renders emit later bounds; horizontal position changes do not because bounds are widget-local. Do not poll `getDomElement()` or toggle `emitEvents` to solicit initial bounds. Use `requestAnimationFrame` only to coalesce multiple received bounds events into one dependent layout pass.

Verify lifecycle, font loading, gradient/filter rendering, resize and message consumers separately in the Player; persisted payload readback alone is not rendering evidence.

Source: `app/components/widgets/WidgetMetricTextStyle.js`, `metricTextStyle/widget.json`, `metricTextStyle/buildDynamicUI.js` and `metricTextStyle/svgRender.js`.
