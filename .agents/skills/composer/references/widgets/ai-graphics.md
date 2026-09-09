# AI Graphics: responsive programmable graphics

Use the `ai-graphics` primitive when the requested result is one coherent responsive programmable presentation whose markup, dynamic fields, and finite animation lifecycle should be generated together. Its Shadow DOM may combine HTML, CSS, inline SVG, and Canvas; inline SVG supports paths, masks, gradients, filters, symbols, and procedural geometry without a separate widget or definition format. Prefer native primitives when independent visual elements need ordinary Composer editing. AI Graphics is trusted Composer-authored content; use it only for explicit AI Graphics requests and never generalize its lifecycle JavaScript into arbitrary editor or composition-script execution.

AI Graphics is internal widget `4792`. Its static schema contains only the non-linkable JSON Text field `definition`:

```bash
node scripts/composer-agent.js primitives --primitive ai-graphics
```

The field value is one parseable JSON string following `app/components/widgets/aiGraphics/AI_GRAPHICS_AUTHORING_PROMPT.md`. The definition contains `version`, `html`, `css`, `javascript`, generated `fields`, and generated `groups`. Keep HTML, CSS, and JavaScript self-contained. AI Graphics' non-linkable `definition` field has a dedicated 256 KiB serialized-value limit for Composer-agent writes; every other widget field retains the normal 32 KiB limit. Minify the complete definition before writing it, and measure the outer `JSON.stringify(definitionText)` length because quotes and backslashes in the definition add escaping overhead.

## Authoring workflow

1. Generate the complete definition from the source-controlled AI authoring contract.
2. Create or reconcile the `ai-graphics` tile with only its static `definition` property, then position and size the tile in Composer. Include required animation and effect runway in those bounds.
3. Read the created tile again after the definition installs; its generated fields are published dynamically and cannot be inferred from the initial static schema.
4. Create semantic Control Nodes only for generated values intended as public inputs. The `definition` field must remain non-linkable.
5. Read the Timeline animation catalog and assign the `widget` effect to every authored timeline. Enable **2 timelines** when the definition owns a separate Out choreography; with it disabled, taking the composition Out reverses In and the authored Out timeline is dormant.
6. Verify responsive geometry and finite In/Out behavior in Player. Composer model readback alone cannot prove Shadow DOM rendering or lifecycle JavaScript.

## Geometry and resolution independence

- Use one top-level authored overlay that fills the complete widget box. Composer alone owns the widget's placement and dimensions in the composition.
- Do not recreate scene placement inside the definition with scene-relative offsets, safe-area margins, fixed coordinates, or capped outer dimensions.
- Make the Composer widget bounds contain both settled artwork and its complete animation envelope. Reserve responsive internal motion gutters when transforms, shadows, or other requested effects need runway; the artwork does not need to occupy that reserved space.
- Derive each motion gutter from the maximum transform or effect extent on that axis, using the same container-relative coordinate system as the animation. Expand or move the Composer widget bounds when necessary to preserve the settled artwork's composition position.
- Use internal padding and alignment for non-motion spacing.
- Treat the runtime root as the responsive viewport. Prefer percentages, `cqi`/`cqb` or `cqw`/`cqh`, Grid, Flexbox, `aspect-ratio`, fluid `clamp()`, and shape-based container queries for primary geometry, type, spacing, and motion.
- Use fixed CSS pixel values only for a deliberately invariant detail such as a hairline border or a strict minimum legibility constraint. Do not use pixels for outer placement, primary dimensions, scalable spacing, or animation travel when a container-relative value can express the intent.
- Test at least one wide or landscape box and one materially different square or portrait box. Text, controls, and intended intermediate animation frames must remain inside the widget bounds without overlap or accidental clipping.

## Lifecycle and animation

- Keep the installed DOM persistent. Cache nodes in `mount()` and mutate only keys present in `changes` during `update()`.
- Treat generated field declarations as Composer UI schema, not runtime JavaScript type guarantees. Composer controls and Control Node payloads may deliver serialized values; for example, a `number` or `normalizednumber` edit can reach `update()` as a numeric string.
- Normalize each changed value according to its declared field type before using it. Parse finite numeric strings explicitly; handle boolean strings such as `"false"` without truthiness coercion; preserve text and selection strings; and validate the shape of color, image, and metricfont objects. Define a deliberate fallback for empty, malformed, or out-of-range input.
- Normalize only keys present in `changes`. Do not rebuild a complete payload, coerce absent fields, or rely on `typeof` checks that reject valid serialized control values.
- Write dynamic text with `textContent`, not `innerHTML`.
- Render finite motion deterministically in `seek(animation, context)` from `animation.timeline` and normalized `animation.progress`. Progress is timeline-local and advances from 0 to 1 for both In and Out; do not globally invert Out progress. Map individual exit properties from settled to hidden as needed.
- Use unrestricted bounded JavaScript inside the lifecycle to update HTML or SVG DOM, calculate procedural geometry, or draw Canvas frames. Do not add a declarative animation format: Singular's lifecycle commands and normalized progress are the animation interface.
- Singular owns finite playback. Do not run an independent clock for In or Out, and keep authored In/Out properties separate from ambient animation.
- Reserve independent clocks only for non-conflicting ambient motion and stop every owned resource in `destroy()`.
- Use `context.fonts` and generated `metricfont` fields for fonts, and generated `image` fields for assets. Do not fetch fonts or inspect application state.
- Ignore stale asynchronous font completions and preserve element identity during data updates.

## Verification

- Read back the tile definition, generated schema, layout, In/Out effects, keyframes, and active composition's `timeline2Active` value before visual acceptance.
- Exercise generated controls through the actual Composer UI or equivalent persisted payload path. Read back both the value and its runtime type, then verify the rendered result; a numeric command-path test alone does not prove that a formatted numeric string from the UI is handled.
- Open the ordinary module that owns the widget timeline and use active-composition capture. A root capture seeks only the root timeline and is the wrong target for an independently timed nested module.
- Capture and view exact start, representative midpoint, and settled/end positions. Distinct seek reports or PNG byte sizes are diagnostics, not substitutes for viewing every retained frame.
- At a midpoint where content is transformed, confirm that its motion envelope prevents accidental edge clipping. Restore any temporary portrait, square, or stress-test geometry and verify final layout readback before handoff.
- Require no lifecycle script errors or unresolved font/image resources, remove temporary manifests and captures, return to the intended Composer scope, and release the work lease.

Generated field types are `text`, `textarea`, `number`, `normalizednumber`, `checkbox`, `selection`, `color`, `image`, and `metricfont`. Do not define a field named `definition` or a group named `definitionGroup`. Generated fields remain eligible for linking unless their definitions explicitly set `disableDataLink: true`.