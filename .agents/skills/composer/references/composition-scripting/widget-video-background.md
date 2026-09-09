# Video Background Widget (widgetId 3936)

Payload reference for `widget.setPayload(...)` on Video Background. For paired construction, use [Video Background authoring](../widgets/video-background.md). Live inspection is authoritative for the loaded version.

Payload keys are `videoFile` (URL), `objectFit` (`contain`, `cover`, or `fill`), and numeric `shift`.

```javascript
const background = comp.findWidget("Video Background")[0];
background.setPayload({
  videoFile: "https://example.com/background.mp4",
  objectFit: "cover",
  shift: 0
});
```

The renderer loops muted video. Composition transitions pause on Out and resume on In, but replacing `videoFile` while already Out can start playback again; Out is not a continuously enforced playback guard. It does not expose widget button actions. Verify the affected transitions and replacement path in the Player.
