# AI Graphics authoring prompt

Status: Shipped generation contract for AI Graphics widget `4792`, version `1`.

This file is self-contained inside the installed Composer skill. Its contract body mirrors the application-side authoring prompt and is checked by the runtime-guidance test.

Before installation, run `ai-graphics validate --file <definition.json>` and render representative dimensions with `ai-graphics preview --file <definition.json> --width <px> --height <px> --output <preview.png>`. These local commands require no pairing. Preview samples the isolated widget runtime, not arbitrary asynchronous readiness or parent composition context; follow the [preview evidence contract](ai-graphics.md#preview-evidence-contract). Final Player verification remains required.

## Widget model invariant

The widget's static model contains only the `definition` field. It must include `disableDataLink: true` so the definition can be entered or changed only in Composer and cannot be exposed through a Control Node.

```json
{
  "fields": [
    {
      "id": "definition",
      "type": "json",
      "title": "Definition",
      "defaultValue": "{}",
      "hideTitle": true,
      "disableDataLink": true
    }
  ],
  "groups": [
    {
      "id": "definitionGroup",
      "title": "Definition",
      "width": "double",
      "childIds": ["definition"]
    }
  ]
}
```

Fields generated from a valid definition remain eligible for Control Node linking unless their own definitions explicitly set `disableDataLink: true`.

## Prompt

```text
Create a complete definition for Singular's AI Graphics widget, widget ID 4792. The authored markup may combine HTML and inline SVG.

Return one valid JSON object and no surrounding prose or Markdown. The JSON will be stored in the widget's non-linkable definition field in Composer.

The object must contain:
- version: integer, currently 1
- html: HTML markup mounted in the widget's Shadow DOM
- css: CSS scoped to that Shadow DOM
- javascript: a JavaScript function body that returns the required lifecycle object
- fields: dynamic Singular widget field definitions
- groups: groups that arrange those fields in Composer

Use this shape:
{
  "version": 1,
  "html": "<main class=\"overlay\"><h1 data-field=\"headline\"></h1></main>",
  "css": ".overlay { box-sizing: border-box; inline-size: 100%; block-size: 100%; display: grid; }",
  "javascript": "return { mount: function (context) {}, update: function (changes, context) {}, seek: function (animation, context) {}, destroy: function (context) {} };",
  "fields": [
    {
      "id": "headline",
      "type": "text",
      "title": "Headline",
      "defaultValue": "Breaking News"
    }
  ],
  "groups": [
    {
      "id": "content",
      "title": "Content",
      "childIds": ["headline"]
    }
  ]
}

Definition rules:
- Use stable alphanumeric field and group IDs.
- Do not define a field named "definition".
- Do not define a group named "definitionGroup".
- Every field must contain id, type, title, and defaultValue.
- Every group must contain id, title, and childIds.
- Every childIds entry must reference a defined field.
- An optional group activeId must reference a defined checkbox field.
- Use only these field types: text, textarea, number, normalizednumber, checkbox, selection, color, image, metricfont, gradient, json, counter, and button. Timer fields are not supported.
- Add disableDataLink: true to a generated field only when it must remain editable exclusively in Composer.
- Keep HTML, CSS, and JavaScript self-contained by default. Only explicit external-renderer or font-outline requirements permit the bounded resource exception below. Do not encode them as Base64.
- Keep the complete minified definition below the Composer agent's dedicated 256 KiB serialized-value limit. Measure the outer JSON.stringify(definitionText) length; embedded quotes and backslashes add escaping overhead. Other generated field values retain the normal 32 KiB limit.

Additional field contracts:
- metricfont: the native value is {"fontData":{"family":"Open Sans","weight":"400","style":"normal","subset":"auto","mg":{...}}}, with mg supplied by Composer's font catalog, not authored by hand. Definition defaults may carry a complete resolved value; a descriptor without metrics is not sufficient for linked Metric Font control creation. For an unlinked generated field lacking metrics, create a standalone Metric Font control with the intended family/weight/style/subset, copy its exact resolved control.value into the field with update --namespace data, then link the returned public ID with create-control --reuse-existing. Preserve the source value and verify both target value and link; never overwrite an already-linked destination.
- gradient: use the native structured gradient object, not a CSS string. A complete default is {"type":"solid","solidColor":{"r":204,"g":204,"b":204,"a":1},"stops":[{"offset":0,"color":"#000000","opacity":1},{"offset":1,"color":"#ffffff","opacity":1}],"offset":0,"angle":0,"scale":100,"spreadMethod":"pad","keepAspect":false,"centerX":50,"centerY":50,"radius":50,"focalAngle":0,"focalDistance":0}. Values pass through unchanged. Render solid, linear, and radial types using authored SVG/Canvas or a deliberate CSS mapping; preserve stop opacity and native geometry. context.colors.toCss handles solid colors only, not linear or radial gradients. Do not expose a native Gradient Control Node; keep structured gradients widget-owned or script-owned, with a Color control only for an intentionally solid-color input.
- json: use JSON text, for example defaultValue: "{}". The host does not parse it into an object. Parse present changes with JSON.parse inside try/catch, validate the expected shape, and define a deliberate malformed-input fallback. Do not render JSON content as HTML.
- counter: use a numeric defaultValue and the native Counter metadata (min/max, resetValue, m1 through m7 for increment buttons, s1 through s7 for set buttons). For example: {"id":"score","type":"counter","title":"Score","defaultValue":0,"resetValue":0,"m1":"-","m2":"+","s1":0}. The native UI resolves increments and sets before update(); the lifecycle receives the current number or numeric string. Do not interpret that value as a delta or treat setPayload() as a counter-command API.
- button: use defaultValue: false and optionally text for the button label. Implement optional button(id, context) for presses of declared button fields. Each native action is delivered independently, including repeated presses; a default, saved payload value, or ordinary update() is not a press. Do not infer clicks from context.data or changes. Composition scripts call widget.click(fieldId), not setPayload(), to press an unlinked button. Actions arriving before installation or after destroy() are ignored; they are not queued.

Responsive layout rules:
- Treat coordinate spaces as nested: Composer tile percentages resolve against the immediate parent group when grouped, otherwise against the composition; script getPositionX/Y and getSizeX/Y return those stored percentages. The runtime root fills the resulting tile box. Browser getBoundingClientRect() values are viewport-relative pixels, not tile-local coordinates; normalize them against the tile/root rectangle when the Player is scaled.
- Use one top-level authored overlay element and make it fill 100% of the runtime root's inline and block dimensions.
- Treat the widget bounds as the complete design viewport. Composer owns the widget's position and size within the composition.
- Do not recreate composition-level placement inside the widget with scene-relative offsets, safe-area margins, fixed coordinates, or capped outer dimensions, except for explicitly requested operator transforms: when native links cannot express a single uniform Size, keep Composer's outer viewport stable and transform an inner artwork wrapper. Requested Position may share that wrapper when necessary. Define units, pivot, range and reset; keep the allowed motion envelope inside the viewport and keep operator transforms separate from In/Out.
- Derive operator scale from immutable base geometry, including particles, rather than repeatedly scaling current dimensions. A requested 0-100% Size must support zero without division by zero and restore geometry on the same mounted instance.
- Include the complete animation envelope in the widget bounds. When transformed content needs travel space, reserve a bounded internal motion gutter so intermediate frames remain visible.
- Size motion gutters from the maximum animated transform extent with container-relative units. Do not use arbitrary fixed-pixel runway.
- The settled artwork may use less than the complete root when that remaining space is intentionally reserved for animation, shadows, or another requested effect.
- Put other intentional spacing inside the full-size overlay with padding, gaps, and aligned child regions.
- The runtime root is already a size container with position: relative, overflow: hidden, and border-box sizing. Write container queries against that box.
- Prefer percentages, cqi/cqb or cqw/cqh, CSS Grid, Flexbox, shape-based container queries, fluid clamp(), logical properties, and aspect-ratio for primary geometry, type, spacing, and motion.
- Use fixed CSS pixels only for a deliberately invariant detail such as a hairline border or strict minimum legibility constraint. Do not use pixels for outer placement, primary dimensions, scalable spacing, or animation travel when a container-relative value can express the intent.
- Account for very wide, landscape, portrait, and square containers.
- For Canvas or procedural geometry, observe context.root with an owned ResizeObserver and retain resize(size, context). Route both through one idempotent measurement function using the root's untransformed local dimensions; do not rely on window resize or composition resolution alone. Update the Canvas backing store only when dimensions change, with bounded device-pixel-ratio scaling, and reset its drawing transform after a bitmap resize.
- Use one uniform scale for particle geometry and both velocity components, for example root height divided by design height. Width-only changes must not change particle proportions, size, speed or wind angle. Treat particle population separately: derive a bounded target from available area in the same scaled coordinate system and let additions/removals settle through a bounded transition.
- Handle zero-width/height roots without division, spawning or unbounded work; resume from fresh measurements when visible again. Disconnect the observer, cancel owned animation frames and guard queued callbacks in destroy(). Test width-only, height-only, zero-size and restored dimensions on one mounted renderer, not just separate installs.
- Keep text and important graphics inside the visible widget bounds unless overflow is explicitly requested.

Persistent DOM rules:
- Treat the installed HTML structure as persistent.
- Cache frequently used elements during mount().
- In update(), change only DOM affected by keys present in changes.
- Treat field types as Composer UI schema, not runtime JavaScript type guarantees. Composer controls and Control Node payloads may serialize values; number and normalizednumber fields can arrive as numeric strings.
- Normalize every present changed value according to its declared field type before use. Parse and validate finite numbers explicitly, decode boolean strings without using generic truthiness, preserve text and selection strings, and validate color, image, and metricfont object shapes.
- Define deliberate fallback and range behavior for empty or malformed values. Never use a strict typeof-number guard that silently replaces a valid numeric string with the default.
- Normalize only keys present in changes; do not coerce absent fields or reconstruct the complete payload.
- Update text with textContent, not innerHTML.
- Mutate attributes, classes, styles, CSS custom properties, and existing element content in place.
- Never replace the root or assign innerHTML during an ordinary data update.
- Preserve element identity, focus, media state, and active ambient animation across updates.

Inline SVG rules:
- Put SVG markup directly in html; do not use a separate SVG definition format or external SVG document.
- Give each SVG a real viewBox and size it from the responsive widget container.
- Use stable id or data-* attributes for elements addressed by update() or seek().
- Update SVG text with textContent and geometry or presentation with DOM properties, attributes, styles, classes, or CSS custom properties.
- SVG paths, masks, gradients, filters, symbols, and procedural JavaScript animation are supported by the same lifecycle as HTML elements.

The javascript string must return an object with these lifecycle functions:
- mount(context): initialize cached elements, listeners, observers, and initial presentation once after the definition is installed
- update(changes, context): apply only changed dynamic field values to the existing DOM
- seek(animation, context): render Singular-controlled In or Out animation at the supplied normalized progress
- destroy(context): release every listener, observer, animation frame, timer, and other resource created by this definition
- Optional resize(size, context): respond to widget layout changes; size contains width and height in pixels
- Optional button(id, context): handle native actions for declared button fields independently of update()

Runtime context rules:
- Use context.root to access the authored Shadow DOM content.
- Use context.data for the current complete dynamic field payload.
- Generated `color` fields may arrive as plain `{r,g,b,a}` objects, `{type:"solid",solidColor:{r,g,b,a}}` wrappers, CSS-compatible strings such as hexadecimal values, or another value convertible by `context.colors.toCss(value)`. Use that host conversion before assigning a color to CSS or parsing it for custom interpolation; never silently retain the previous color merely because the new value uses another supported representation.
- Renderer wrapper support does not define native Color Control Node inputs. Use plain RGBA with alpha in 0-1 for portable directly linked control tests; test solid wrappers separately at the renderer boundary. For transparent particles, apply color alpha once and multiply only by deliberate per-particle fades; do not paint a background or floor unless requested.
- For numeric interpolation, first accept finite channels from a plain RGBA value or solid wrapper. Otherwise pass the value through `context.colors.toCss(value)`, validate the resulting CSS color, render it into a private 1-by-1 Canvas, and read `getImageData()` to obtain numeric RGBA. Clamp RGB to 0–255 and alpha to 0–1, and use an explicit design fallback only when conversion fails.
- Use context.fonts.load(fontData) for metricfont values before applying a changed font.
- This browser-font service does not expose a documented font-binary/outline resolver. An explicitly requested external outline renderer must derive family, weight and style from the same native metricfont value, not a competing selector.
- Use context.fonts.computeMetrics(fontData, targetHeight, text) only when exact metric sizing is necessary.
- Use Singular image values supplied through image fields; do not independently select or upload images.
- Ignore stale asynchronous font completions when a newer font value has already arrived.
- Request or batch layout work after fonts or images become ready without rebuilding the DOM.

Animation rules:
- Singular exclusively controls finite In and Out animation playback.
- Render animation deterministically from animation.timeline and animation.progress.
- Initialize authored DOM deliberately and handle every supplied seek, including initialization and jumps. Do not use a delayed effect start as proof that no earlier seek occurs. Verify pre-start visibility through an actual take In from Out and repeated playback; a direct seeked capture proves only that sampled state, not live callback ordering.
- The implementation technique is unrestricted JavaScript: update HTML or SVG DOM, calculate procedural geometry, draw Canvas frames, or use any other bounded browser API available in the Shadow DOM.
- Do not require or invent a declarative animation format. The lifecycle contract is the animation interface.
- animation.progress is timeline-local and advances from 0 to 1 for both In and Out. Do not globally invert Out progress; map individual exit properties from settled to hidden as needed.
- Natural widget ticks clamp completed playback to exactly 1, but a stop can interrupt earlier. The final tick still has playing: true; neither playing nor exact last-progress equality is a universal settled signal. For interactive accessories, use their own authored In amount with a deliberate tolerance (for example inMode && accessoryAmount >= 0.999), track timeline/direction changes, and give parent Out immediate priority. No separate settled callback is provided.
- Support seeking, reversing, jumping, stopping, repeated playback, and a separate Out timeline.
- A separate authored Out choreography requires Composer's 2 timelines setting and the widget effect on Out. When 2 timelines is disabled, taking the composition Out reverses In instead.
- Keep every intended intermediate frame inside the widget's motion envelope. Clipping during travel must be deliberate, not a side effect of using the settled artwork's bounds as the widget bounds.
- Do not use an independent clock for finite In or Out animation.
- Ambient animation may use requestAnimationFrame or Web Animations, but it must not conflict with Singular-controlled properties and must be stopped by destroy().

Resource and behavior rules:
- Prefer Singular metricfont and image fields for fonts and images.
- Do not fetch fonts independently by default. Only an explicit external-renderer/outline requirement permits public HTTPS source access for the selected native font, with exact pinned library versions, declared origins, bounded requests/caches/geometry, stale-completion guards and cleanup. Do not imply universal Google Fonts family, script, style or variable-axis support.
- Distinguish flat text positioned in 3D, SDF text, simulated extrusion and solid beveled outline geometry. Troika alone does not supply solid extrusion or bevels. Honor the requested representation and composition-native delivery.
- When replacing a renderer, preserve existing control IDs, types, links, ownership, containers, generated schemas, layout and user-edited values. Never replace those values with recipe defaults.
- Unsupported outline selection must produce a visible authored error without altering the native control or silently substituting fonts. Retain the last valid mesh, or remain empty before first success; empty text explicitly clears only text geometry. Abort superseded loads and dispose stale results.
- External-resource permission does not relax local-preview network policy. Schema validity, lifecycle invocation, asynchronous dependency readiness and reviewed output are separate evidence; blocked resources cannot establish rendering success.
- Do not access the Singular application DOM, global stores, cookies, or browser storage.
- Do not navigate, open windows, or make external network requests unless the request explicitly requires an allowed exception.
- Do not create audio or video unless explicitly requested.
- Keep the implementation bounded and avoid unnecessary dependencies.
```
