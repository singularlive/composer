# MetricText Widget (widgetId 4662)

Single-line text widget using Font 2.0 (FontStore2 / SingularMetricFont).

## Usage

```javascript
const mt = comp.findWidget("MetricText")[0];
mt.setPayload({ text: "Hello", color: "yellow" });
```

## Payload Properties

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `text` | string | `""` | Text content. Wrap with `<html>...</html>` to render HTML. Single-line only — newlines are stripped. |
| `font` | object | — | Font definition (see [Font Object](#font-object) below). |
| `color` | string, object | `"white"` | Text color. Same formats as Rectangle's `fillGradient`. |
| `alignment` | string | `"left"` | Horizontal alignment: `"left"`, `"center"`, `"right"`, or `"align."` + character (e.g. `"align."` aligns on the last `.`). |
| `overflow` | string | `"none"` | Overflow behavior: `"none"`, `"clip"` (clips horizontally), `"fitScale"` (uniform scale to fit width), `"fitWidth"` (scale X only to fit width). |
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
    mg: { vhr, var, brh, loh, roh, hrc, arc },  // font metrics object
    custom: false,         // whether it's a custom font
    url: ""                // custom font URL (when custom is true)
  }
}
```

### Character Alignment

Use `alignment: "align."` with a trailing separator character to align text on the last occurrence of that character:

```javascript
mt.setPayload({
  text: "12.345",
  alignment: "align."
});
// Positions the "." at the horizontal center of the widget
```

### Overflow Modes

```javascript
// fitScale — uniform scale to fit width
mt.setPayload({ text: "Long text", overflow: "fitScale" });

// fitWidth — horizontal scale only
mt.setPayload({ text: "Long text", overflow: "fitWidth" });

// clip — horizontally clipped at widget bounds
mt.setPayload({ text: "Long text", overflow: "clip" });
```

## Source reference

- Widget code: `app/components/widgets/WidgetMetricText.js`
- Font system: `stores/FontStore2.js`
