# MetricTextML Widget (widgetId 4671)

Multi-line text widget using Font 2.0 (FontStore2 / SingularMetricFont). Supports automatic line-count selection, word-wrap, and truncation.

For paired Composer construction, use `metric-text-ml` and [Metric Text ML authoring](../widgets/metric-text-ml.md). Preserve its inspected `metricfont` object; ordinary Text font commands do not apply. This document owns the scripting payload contract; the live instance and schema remain authoritative for its loaded version.

## Usage

```javascript
const ml = comp.findWidget("MetricTextML")[0];
ml.setPayload({ text: "Line 1\nLine 2\nLine 3", color: "yellow" });
```

## Payload Properties

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `text` | string | `""` | Text content. Wrap with `<html>...</html>` to render HTML. Newlines separate lines. |
| `font` | object | — | Font definition (see [Font Object](#font-object) below). |
| `color` | string, object | `"white"` | Solid text color using the [Metric Text color contract](widget-metrictext.md). Gradient stops are not rendered; Metric Text Style supports gradient text but is single-line. |
| `alignment` | string | `"left"` | Horizontal alignment: `"left"`, `"center"`, `"right"`. |
| `lineHeight` | number | `100` | Line height as percentage (e.g. `120` = 1.2× line spacing). |
| `minLines` | number | `1` | Minimum number of lines to reserve space for. |
| `maxLines` | number | — | Maximum number of lines before truncation. Defaults to `minLines`. |
| `ellipsis` | boolean | `false` | When truncation is required at `maxLines`, append an ellipsis (`…`) to the last surviving text run. |
| `verticalAlignment` | string | `"top"` | Vertical alignment: `"top"`, `"center"`, `"bottom"`; `"middle"` is a renderer compatibility alias. |
| `letterSpacing` | number | `0` | Letter spacing as percentage of widget height. |
| `wordSpacing` | number | `0` | Word spacing as percentage of widget height. |
| `transform` | string | — | Text transform: `"uppercase"`, `"lowercase"`, `"capitalize"`, `"small-caps"`. |
| `shadowActive` | boolean | — | Enable text shadow. |
| `shadowDirection` | number | — | Shadow direction in degrees. |
| `shadowDistance` | number | — | Shadow distance as percentage of widget height. |
| `shadowBlur` | number | — | Shadow blur radius as percentage of widget height. |
| `shadowColor` | string, object | — | Shadow color. Same formats as `color`. |
| `insetActive` | boolean | — | Enable inset padding. |
| `insetLeft` | number | — | Left inset as percentage of widget width. |
| `insetRight` | number | — | Right inset as percentage of widget width. |
| `insetTop` | number | — | Top inset as percentage of widget height. |
| `insetBottom` | number | — | Bottom inset as percentage of widget height. |
| `emitEvents` | boolean | — | If `true`, emits a `bounds` custom message with text bounding box. |

### Font Object

```javascript
{
  fontData: {
    family: "Arial",       // font family name
    weight: "400",         // font weight string
    subset: "auto",        // character subset key or "auto"
    style: "normal",       // font style string
    mg: { vhr, var, brh, lhn, loh?, roh?, hrc?, arc? }  // font metrics
  }
}
```

### Line Count Selection

The widget automatically selects the number of lines between `minLines` and `maxLines`:

1. Counts explicit newline segments in the text
2. Starts at `min(maxLines, max(minLines, segmentCount))`
3. Sizes the font so text fills the available height
4. If text wraps beyond the current line count and `lineCount < maxLines`, increments `lineCount`
5. Once settled, any content beyond the last allowed line is removed from the DOM

```javascript
ml.setPayload({
  text: "Line 1\nLine 2\nLine 3\nLine 4",
  minLines: 2,
  maxLines: 4,
  lineHeight: 120
});
```

Empty or whitespace-only text hides the element. The renderer preserves the saved payload when truncating the displayed DOM. HTML is unsanitized and can change measurement; prefer plain text and never interpolate untrusted markup. Renderer fallbacks above are not guaranteed catalog defaults. Keep line limits positive integers with `minLines <= maxLines` and `lineHeight > 0`.

`emitEvents` sends `{ event: "bounds", leftPx, topPx, widthPx, heightPx, left, top, width, height }` through the widget custom-message channel for nonempty text. Use the signature `(event, msg, e)`: the first argument is the event-name string, not the message. Receive it from the composition message listener:

```javascript
comp.addListener("message", function (event, msg, e) {
  var params = msg && msg.params;
  var data = params && params.data;
  if (data && data.event === "bounds" && params.id === MY_TILE_ID) {
    // Consume this widget's bounds.
  }
});
```

`msg.params` is the widget-message envelope, `msg.params.data` is the bounds payload, and `msg.params.id` is the originating tile ID. Use that ID as the routing key when several widgets emit messages. Pixel values are widget-local logical coordinates; percentage values are relative to widget dimensions. Like the other Metric Text widgets, the bounds describe the post-layout rendered text extent and exclude shadows. For multiline text, `bounds.width` is the union width of the rendered line fragments after wrapping and truncation, not the assigned wrapping-column width or the original unwrapped string width. Height follows wrapping, truncation, line count, and line spacing. See the [inline styled text recipe](../recipes/inline-styled-text.md) for a complete consumer and dependent-layout pattern. Verify messages and persisted script consumers separately in the Player.

## Source reference

- Widget code: `app/components/widgets/WidgetMetricTextML.js`
- Font system: `stores/FontStore2.js`
