# Linked AI Graphics style with script-owned runtime data

Use this pattern when an AI Graphics widget has public style controls while a composition script supplies runtime-only data or commands. The central rule is one authority per destination field: direct links own public style fields, and the script owns only unlinked runtime fields.

Before structural work, read [AI Graphics](../widgets/ai-graphics.md), its complete [authoring contract](../widgets/ai-graphics-authoring.md), and [Control Nodes](../control-nodes.md). Before script work, read [composition scripts](../composition-scripts.md). Before verification, read [Player verification](../composition-scripting/debugging-and-verification.md).

## Define the ownership matrix

List every generated AI Graphics field and assign exactly one authority before creating links or writing script code:

| Field role | Authority | Wiring |
| --- | --- | --- |
| Public color, size, typography, visibility, or other one-to-one style | Control Node | Direct link to the generated field |
| Runtime data normalized or assembled by script | Composition script | Generated field remains unlinked |
| Discrete motion command interpreted by the widget | Composition script | Generated field remains unlinked; widget runs bounded local motion |

Never forward a directly linked field through `widget.setPayload()`. Do not enable `immediateUpdate` to troubleshoot an external Control App; it is not a general propagation mechanism. Inspect the defining control and persisted link first.

When adapting to an existing Control App, preserve its exact Control Node IDs, types, table schemas, and required compatibility fields. Keep app-specific hidden controls local to that integration; do not generalize them into this recipe.

## Normalize linked colors

Assign CSS-only colors with `context.colors.toCss(value)`. For interpolation, convert accepted inputs to numeric RGBA. This helper accepts direct RGBA, solid wrappers, hexadecimal values, named colors, and other CSS-compatible strings handled by the browser:

```javascript
function toRgba(value, fallback, context) {
  var direct = value && value.type === 'solid' ? value.solidColor : value;
  if (direct && [direct.r, direct.g, direct.b].every(Number.isFinite)) {
    return {
      r: Math.max(0, Math.min(255, direct.r)),
      g: Math.max(0, Math.min(255, direct.g)),
      b: Math.max(0, Math.min(255, direct.b)),
      a: Number.isFinite(direct.a) ? Math.max(0, Math.min(1, direct.a)) : 1
    };
  }

  var css = context.colors.toCss(value);
  if (!css || (window.CSS && CSS.supports && !CSS.supports('color', css))) return fallback;
  var canvas = context.root.ownerDocument.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  var painter = canvas.getContext('2d', { willReadFrequently: true });
  painter.clearRect(0, 0, 1, 1);
  painter.fillStyle = css;
  painter.fillRect(0, 0, 1, 1);
  var rgba = painter.getImageData(0, 0, 1, 1).data;
  return { r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3] / 255 };
}

function mixRgba(from, to, progress) {
  var amount = Math.max(0, Math.min(1, progress));
  function channel(start, end) { return start + (end - start) * amount; }
  return {
    r: channel(from.r, to.r),
    g: channel(from.g, to.g),
    b: channel(from.b, to.b),
    a: channel(from.a, to.a)
  };
}

function rgbaCss(color) {
  return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a + ')';
}
```

Normalize each changed endpoint with `toRgba()`, interpolate with `mixRgba()`, and assign `rgbaCss()` to the element. Apply only keys present in `changes`. Keep the last valid value only as an explicit fallback chosen by the design contract, not as a silent response to an unrecognized representation.

## Keep animation local

The script may normalize a Names table and send one serialized names value, then send discrete commands such as start or stop. Let the AI Graphics lifecycle own continuous `requestAnimationFrame` work, acceleration, cruising, deceleration, and final settling. Stop every owned frame request in `destroy()`. Do not stream frame-by-frame positions from the composition script.

## Verify model, loaded definition, and runtime

1. Read back every style Control Node and its direct link. Confirm each script-owned destination has no link and the script contains no style-field forwarding.
2. Confirm `immediateUpdate` remains disabled unless the named operating environment explicitly requires it.
3. Validate and preview the definition locally with representative RGBA, solid-wrapper, and CSS-string samples.
4. If testing through a managed Control App, update its composition extract from an authenticated app view and reload the tested app/output. Composer readback does not prove an already-running output loaded the new definition.
5. After the reload, change a linked color through the public payload without another reload and require a visible pixel change. This separates successful definition loading from incremental link propagation.

Copy [the linked-color scenario](linked-ai-graphics-style-scenario.json) to the task directory. Replace `Card Color` with the inspected public Control Node ID and choose colors and a target-relative region that produce a deterministic visible difference. The scenario loads the initial color, captures it, changes the linked color after initialization, and requires changed pixels with no Player error events.