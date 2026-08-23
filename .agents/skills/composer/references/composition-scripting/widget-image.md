# Image Widget (widgetId 642)

Payload reference for `widget.setPayload(...)` on Image widgets.

## Usage

```javascript
const img = comp.findWidget("Image")[0];
img.setPayload({ image: "https://example.com/logo.png" });
```

## Payload Properties

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `image` | string | `""` | URL of the image to display. Supports automatic resolution selection for `assets.singular.live` URLs. |
| `objectFit` | string | `"contain"` | How the image fits the layout: `"contain"` (fit entirely, letterbox) or `"cover"` (fill entirely, crop). |
| `shift` | number | `0` | Horizontal/vertical shift as a percentage. Shifts the image alignment when it doesn't perfectly fit the layout. Range `-100` to `100`. |
| `flipX` | boolean | `false` | If `true`, flips the image horizontally. |
| `flipY` | boolean | `false` | If `true`, flips the image vertically. |

### Examples

```javascript
// set a new image
img.setPayload({ image: "https://example.com/photo.jpg" });

// cover mode with horizontal shift
img.setPayload({
  image: "https://example.com/photo.jpg",
  objectFit: "cover",
  shift: -20
});

// flip horizontally
img.setPayload({
  image: "https://example.com/photo.jpg",
  flipX: true
});
```

### Resolution Selection

For images hosted on `assets.singular.live`, the widget automatically selects an appropriate resolution based on the layout dimensions.

### Image Loading

- The widget fades in new images on supported browsers (except iOS).
- A loading indicator is tracked via `DownloadStore`.
- On load error, a console warning is logged and the image stays hidden.

## Source reference

- Widget code: `app/components/widgets/WidgetImage.js`
