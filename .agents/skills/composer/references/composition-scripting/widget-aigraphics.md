# AI Graphics widget (widgetId 4792)

For paired creation, definition authoring, and lifecycle behavior, read [AI Graphics](../widgets/ai-graphics.md). The primitive is `ai-graphics`. Live inspection remains authoritative for the loaded version and its generated fields.

The static `definition` field is Composer-owned, non-linkable authoring content. A composition script must never send or reconstruct `definition`. At runtime, address only generated fields published by the installed definition:

```javascript
var graphic = comp.findWidget('Programmable Graphic')[0];
if (graphic) {
  graphic.setPayload({ headline: 'Updated', amount: 42 });
}
```

Use exact generated field IDs and value shapes from paired live schema inspection. `setPayload()` follows the normal merged widget payload path, so a partial object updates only those generated fields. The AI Graphics lifecycle receives changed generated values through its `update(changes, context)` callback; it owns conversion from public values to internal DOM, Canvas, SVG, and responsive CSS values.

Do not script a generated field that is also directly linked to a Control Node. For interpreted or combined inputs, use standalone controls, read the composition payload on `payload_changed`, and send only the derived generated fields. After replacing a definition, confirm the updated definition is installed in the tested app or output before diagnosing script delivery.

Verify the generated schema and payload in Composer, then trigger the script path in Player and confirm the rendered result. A successful `setPayload()` call or stored value alone does not prove that the current AI Graphics definition handled the update.