# AI Graphics authoring prompt

Status: Shipped generation contract for AI Graphics widget `4792`, version `1`.

This file is self-contained inside the installed Composer skill. Its contract body mirrors the application-side authoring prompt and is checked by the runtime-guidance test.

Before installation, run `ai-graphics validate --file <definition.json>` and render representative dimensions with `ai-graphics preview --file <definition.json> --width <px> --height <px> --output <preview.png>`. These local commands require no pairing. Preview verifies the isolated widget runtime, not parent composition context; final Player verification remains required.

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
- Use only these field types: text, textarea, number, normalizednumber, checkbox, selection, color, image, and metricfont.
- Add disableDataLink: true to a generated field only when it must remain editable exclusively in Composer.
- Keep HTML, CSS, and JavaScript self-contained. Do not encode them as Base64.
- Keep the complete minified definition below the Composer agent's dedicated 256 KiB serialized-value limit. Measure the outer JSON.stringify(definitionText) length; embedded quotes and backslashes add escaping overhead. Other generated field values retain the normal 32 KiB limit.

Responsive layout rules:
- Treat coordinate spaces as nested: Composer tile percentages resolve against the immediate parent group when grouped, otherwise against the composition; script getPositionX/Y and getSizeX/Y return those stored percentages. The runtime root fills the resulting tile box. Browser getBoundingClientRect() values are viewport-relative pixels, not tile-local coordinates; normalize them against the tile/root rectangle when the Player is scaled.
- Use one top-level authored overlay element and make it fill 100% of the runtime root's inline and block dimensions.
- Treat the widget bounds as the complete design viewport. Composer owns the widget's position and size within the composition.
- Do not recreate composition-level placement inside the widget with scene-relative offsets, safe-area margins, fixed coordinates, or capped outer dimensions.
- Include the complete animation envelope in the widget bounds. When transformed content needs travel space, reserve a bounded internal motion gutter so intermediate frames remain visible.
- Size motion gutters from the maximum animated transform extent with container-relative units. Do not use arbitrary fixed-pixel runway.
- The settled artwork may use less than the complete root when that remaining space is intentionally reserved for animation, shadows, or another requested effect.
- Put other intentional spacing inside the full-size overlay with padding, gaps, and aligned child regions.
- The runtime root is already a size container with position: relative, overflow: hidden, and border-box sizing. Write container queries against that box.
- Prefer percentages, cqi/cqb or cqw/cqh, CSS Grid, Flexbox, shape-based container queries, fluid clamp(), logical properties, and aspect-ratio for primary geometry, type, spacing, and motion.
- Use fixed CSS pixels only for a deliberately invariant detail such as a hairline border or strict minimum legibility constraint. Do not use pixels for outer placement, primary dimensions, scalable spacing, or animation travel when a container-relative value can express the intent.
- Account for very wide, landscape, portrait, and square containers.
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

Runtime context rules:
- Use context.root to access the authored Shadow DOM content.
- Use context.data for the current complete dynamic field payload.
- Generated `color` fields may arrive as plain `{r,g,b,a}` objects, `{type:"solid",solidColor:{r,g,b,a}}` wrappers, CSS-compatible strings such as hexadecimal values, or another value convertible by `context.colors.toCss(value)`. Use that host conversion before assigning a color to CSS or parsing it for custom interpolation; never silently retain the previous color merely because the new value uses another supported representation.
- For numeric interpolation, first accept finite channels from a plain RGBA value or solid wrapper. Otherwise pass the value through `context.colors.toCss(value)`, validate the resulting CSS color, render it into a private 1-by-1 Canvas, and read `getImageData()` to obtain numeric RGBA. Clamp RGB to 0–255 and alpha to 0–1, and use an explicit design fallback only when conversion fails.
- Use context.fonts.load(fontData) for metricfont values before applying a changed font.
- Use context.fonts.computeMetrics(fontData, targetHeight, text) only when exact metric sizing is necessary.
- Use Singular image values supplied through image fields; do not independently select or upload images.
- Ignore stale asynchronous font completions when a newer font value has already arrived.
- Request or batch layout work after fonts or images become ready without rebuilding the DOM.

Animation rules:
- Singular exclusively controls finite In and Out animation playback.
- Render animation deterministically from animation.timeline and animation.progress.
- The implementation technique is unrestricted JavaScript: update HTML or SVG DOM, calculate procedural geometry, draw Canvas frames, or use any other bounded browser API available in the Shadow DOM.
- Do not require or invent a declarative animation format. The lifecycle contract is the animation interface.
- animation.progress is timeline-local and advances from 0 to 1 for both In and Out. Do not globally invert Out progress; map individual exit properties from settled to hidden as needed.
- Support seeking, reversing, jumping, stopping, repeated playback, and a separate Out timeline.
- A separate authored Out choreography requires Composer's 2 timelines setting and the widget effect on Out. When 2 timelines is disabled, taking the composition Out reverses In instead.
- Keep every intended intermediate frame inside the widget's motion envelope. Clipping during travel must be deliberate, not a side effect of using the settled artwork's bounds as the widget bounds.
- Do not use an independent clock for finite In or Out animation.
- Ambient animation may use requestAnimationFrame or Web Animations, but it must not conflict with Singular-controlled properties and must be stopped by destroy().

Resource and behavior rules:
- Prefer Singular metricfont and image fields for fonts and images.
- Do not fetch fonts independently.
- Do not access the Singular application DOM, global stores, cookies, or browser storage.
- Do not navigate, open windows, or make external network requests unless the request explicitly requires an allowed exception.
- Do not create audio or video unless explicitly requested.
- Keep the implementation bounded and avoid unnecessary dependencies.
```
