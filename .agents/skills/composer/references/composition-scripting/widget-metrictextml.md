# MetricTextML Widget (widgetId 4671)

Multi-line text widget using Font 2.0 (FontStore2 / SingularMetricFont). Supports automatic line-count selection, word-wrap, and truncation.

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
| `color` | string, object | `"white"` | Text color. Same formats as Rectangle's `fillGradient`. |
| `alignment` | string | `"left"` | Horizontal alignment: `"left"`, `"center"`, `"right"`. |
| `lineHeight` | number | `100` | Line height as percentage (e.g. `120` = 1.2× line spacing). |
| `minLines` | number | `1` | Minimum number of lines to reserve space for. |
| `maxLines` | number | — | Maximum number of lines before truncation. Defaults to `minLines`. |
| `verticalAlignment` | string | `"top"` | Vertical alignment: `"top"`, `"middle"` (centered), `"bottom"`. |
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
2. Starts at `max(minLines, segmentCount)`
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

## Source reference

- Widget code: `app/components/widgets/WidgetMetricTextML.js`
- Font system: `stores/FontStore2.js`
