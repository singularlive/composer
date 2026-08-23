# Circle Widget (widgetId 1052)

Payload reference for `widget.setPayload(...)` on Circle widgets.

## Usage

```javascript
const circle = comp.findWidget("Circle")[0];
circle.setPayload({ fillGradient: "red" });
```

## Payload Properties

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `fillGradient` | string, object | `#cccccc` | Fill color or gradient. See [Color & Gradient Formats](#color--gradient-formats) in the Rectangle reference. |
| `strokeGradient` | string, object | `"black"` | Outline stroke color or gradient. Same formats as `fillGradient`. |
| `strokeWidth` | number | `0` | Stroke width in pixels. |
| `radius` | number | `100` | Radius as a percentage of the layout size (`0`–`100`). |
| `holeSize` | number | `0` | Donut hole size as a percentage of the radius (`0`–`100`). `0` = solid circle. |
| `startAngle` | number | `0` | Arc start angle in degrees. |
| `endAngle` | number | `0` | Arc end angle in degrees. |
| `keepAspect` | boolean | `false` | If `true`, forces the circle to stay perfectly round regardless of layout aspect ratio. |

### Arc / Wedge

The circle widget draws an arc/wedge from `startAngle` to `endAngle`. When `startAngle >= endAngle`, the arc wraps through 360°. A full circle is drawn when the arc spans 360° or more.

Examples:

```javascript
// full circle
circle.setPayload({ fillGradient: "blue" });

// half circle (top half)
circle.setPayload({ fillGradient: "green", startAngle: 0, endAngle: 180 });

// donut
circle.setPayload({
  fillGradient: "orange",
  holeSize: 40
});
```

### Color & Gradient Formats

Same as the Rectangle widget — see `references/widget-rectangle.md#color--gradient-formats`.

## Source reference

- Widget code: `app/components/widgets/WidgetCircle.js`
- Color parsing: `app/utils/SvgColorUtil.js`
