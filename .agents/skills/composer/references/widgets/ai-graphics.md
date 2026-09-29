# AI Graphics: responsive programmable graphics

Use the `ai-graphics` primitive when the requested result is one coherent responsive programmable presentation whose markup, dynamic fields, and finite animation lifecycle should be generated together. Its Shadow DOM may combine HTML, CSS, inline SVG, and Canvas; inline SVG supports paths, masks, gradients, filters, symbols, and procedural geometry without a separate widget or definition format. Prefer native primitives when independent visual elements need ordinary Composer editing. AI Graphics is trusted Composer-authored content; use it only for explicit AI Graphics requests and never generalize its lifecycle JavaScript into arbitrary editor or composition-script execution.

AI Graphics is internal widget `4792`. Its static schema contains only the non-linkable JSON Text field `definition`:

```bash
node scripts/composer-agent.js primitives --primitive ai-graphics
```

When a composition script updates generated AI Graphics fields, read the routed [AI Graphics scripting reference](../composition-scripting/widget-aigraphics.md).

Before generating a definition, read the shipped [AI Graphics authoring contract](ai-graphics-authoring.md) in full. The field value is one parseable JSON string containing `version`, `html`, `css`, `javascript`, generated `fields`, and generated `groups`. Keep HTML, CSS, and JavaScript self-contained by default; the narrow [external-resource exception](#rendering-choice-and-external-resources) requires an explicit rendering need. AI Graphics' non-linkable `definition` field has a dedicated 256 KiB serialized-value limit for Composer-agent writes; every other widget field retains the normal 32 KiB limit. Minify the complete definition before writing it, and measure the outer `JSON.stringify(definitionText)` length because quotes and backslashes in the definition add escaping overhead.

Before pairing or installing a tile, validate and preview the local definition:

```bash
node scripts/composer-agent.js ai-graphics validate \
	--file <definition.json> \
	[--values <sample-values.json>]

node scripts/composer-agent.js ai-graphics preview \
	--file <definition.json> \
	[--values <sample-values.json>] \
	--width <pixels> --height <pixels> \
	[--timeline <In|Out>] [--progress <0..1>] \
	--output <preview.png>
```

These commands are local and require neither pairing nor a work lease. Validation reuses the production definition parser and adds install-size, JavaScript-syntax, and sample-value diagnostics without executing lifecycle code. Preview invokes the production DOM/lifecycle host, runtime context, and font service in Chrome. It samples the isolated widget box and lifecycle position, not composition/group placement, parent transforms or clipping, z-order, composition scripts, Control Node delivery, display variants, neighboring widgets, or linked composition timelines. Always perform final Player verification after installation.

### Preview evidence contract

- `valid` describes definition/schema validation, not successful rendering. `runtime.executed` means host lifecycle execution was attempted through the sampled frame, not that every asynchronous lifecycle operation completed.
- `preview.status: "captured"` means a PNG was obtained without observed runtime/dependency failures. `preview.accepted: false` requires visual acceptance; a blank canvas can still be captured.
- Observed blocked requests, failed requests/responses/images, console errors or page errors produce `preview.status: "failed"`, an `AI_GRAPHICS_PREVIEW_INCOMPLETE` diagnostic and a nonzero exit. The diagnostic PNG and `valid: true` may remain. Do not interpret either as rendering success.
- `runtime.asynchronousReadiness` remains `unverified`. `runtime.dependencies` is `blocked`, `failed` or `unverified`, never a claim that arbitrary dependencies are ready. Absence of observed errors does not establish future async success.
- The default policy permits image, stylesheet and font resource requests; script, fetch and other requests are blocked. There is currently no opt-in host allowlist or general authored-readiness wait. Do not modify installed tools to bypass the policy or hide blocked requests. Report unsupported local verification and use separately authorized Player verification for an explicitly requested external renderer.

## Compact embedded definitions

Report raw definition text and escaped serialized value separately: `definitionText.length` and `JSON.stringify(definitionText).length` measure JavaScript string lengths, not UTF-8 bytes. If reporting bytes, label them explicitly and use `Buffer.byteLength(text, 'utf8')` on each respective string in local Node tooling. Use `ai-graphics validate` for the install-size diagnostic. The 256 KiB limit above is specific to Composer-agent serialized definition writes, not a universal product-wide graphics size limit.

Prefer lossless reductions before simplifying artwork: reuse shared geometry templates and compact instance data, generate repeated nodes once in `mount()`, and cache references for persistent DOM updates. Update existing nodes instead of reconstructing repeated markup on each value change. Measure the complete serialized result after each optimization; do not promise a fixed compression ratio.

Use single quotes where valid inside embedded HTML/SVG attributes or JavaScript strings when that reduces JSON escaping. Keep the enclosing definition valid JSON with double-quoted keys and strings, and serialize with `JSON.stringify` rather than hand-editing escapes. Quote changes must preserve embedded-language syntax and content; do not blindly replace quotes or strip whitespace inside meaningful strings. Do not introduce external storage or encoded payload workarounds to evade the limit.

Revalidate the optimized definition and compare representative rendered states, including the [settled milestone and concealment checks](../authoring-quality.md#milestone-endpoints-and-complete-concealment) when applicable. Preserve generated schema, current input values, controls, links, write ownership and timeline behavior; a smaller payload or valid JSON alone does not establish equivalent behavior. Local preview cannot verify native links or Control App delivery; retain the installed readback and Player verification below.

## Rendering choice and external resources

For general Three.js renderer ownership, native updates, resizing, resource budgets and lifecycle integration, read [Three.js inside AI Graphics](ai-graphics-threejs.md). It is shared guidance, not a network permission or a requirement to use fonts, metallic materials or shadows.

Establish representation before choosing an engine: flat text positioned in 3D, Troika-style SDF text, simulated extrusion, and solid beveled outline geometry are different capabilities. Troika is not by itself an extrusion/bevel engine. A distance-field prototype may be useful without satisfying a later explicit Three.js geometry requirement. For solid bevels, see the [Three.js extruded-text candidate](../recipes/threejs-extruded-text.md).

A composition-native request requires an installed Composer graphic. A standalone page or local preview is supporting evidence, not the deliverable. Replace an existing renderer inside its widget when appropriate; preserve control IDs, types, ownership, links, containers, generated schemas, widget layout and user-edited values. Do not overwrite current values with recipe defaults or migrate controls merely to change renderer technology. Retain revision and template-contract safeguards.

Keep `context.fonts` and native `metricfont` selections as the default. The host browser-font service has no documented font-binary/outline resolver. Only an explicit external-renderer/outline requirement permits narrowly scoped external libraries and font source access: declare exact pinned library versions, public HTTPS origins and font resolution rules; bound fetches, geometry, caches and disposal. Resolve only the native selected family/weight/style, never introduce a competing selector or silently substitute a different font. This exception grants no application DOM, global-store, credential or browser-storage access and does not relax local-preview policy. Repository font metadata is a limited resolution technique, not a guarantee for every Google family, script, style or axis.

## Authoring workflow

1. Generate the complete definition from the source-controlled AI authoring contract, then run local validation and preview at representative sizes and timeline positions.
2. Create or reconcile the `ai-graphics` tile with only its static `definition` property, then position and size the tile in Composer. Include required animation and effect runway in those bounds.
3. Read the created tile again after the definition installs to verify its definition, generated typed fields, and layout. Wait for the widget to publish its dynamic model before creating controls; field declarations in the definition are not a substitute for live schema readback.
4. Create and link Control Nodes to generated fields through the typed Control Node commands. Generated fields are linkable unless their definitions set `disableDataLink: true`; the static `definition` field remains non-linkable. Use the generated field's declared type and verify the persisted link after creation.
5. Read the Timeline animation catalog and assign the `widget` effect to every authored timeline. Enable **2 timelines** when the definition owns a separate Out choreography; with it disabled, taking the composition Out reverses In and the authored Out timeline is dormant.
6. Verify responsive geometry and finite In/Out behavior in Player. Composer model readback alone cannot prove Shadow DOM rendering or lifecycle JavaScript.

## Geometry and resolution independence

- Keep operator-facing controls in familiar design units such as degrees, percentages, counts, or domain values. Convert those values inside the AI Graphics lifecycle to container-relative CSS units such as `%`, `cqi`, `cqb`, `cqw`, or `cqh`; do not expose internal responsive CSS units as part of the public control contract.
- Coordinate spaces are nested. A tile's stored percentage position and size, including `getPositionX/Y()` and `getSizeX/Y()` in a composition script, resolve against its immediate parent group when grouped and against the composition when ungrouped. The AI Graphics runtime root then fills the resulting tile box. Browser `getBoundingClientRect()` values are viewport-relative pixels, not tile-local coordinates; at a 1:1 Player render they align with composition pixels, while scaled hosts require normalization against the tile/root rectangle.
- Use one top-level authored overlay that fills the complete widget box. Composer alone owns the widget's placement and dimensions in the composition.
- Do not recreate scene placement inside the definition with scene-relative offsets, safe-area margins, fixed coordinates, or capped outer dimensions.
- Make the Composer widget bounds contain both settled artwork and its complete animation envelope. Reserve responsive internal motion gutters when transforms, shadows, or other requested effects need runway; the artwork does not need to occupy that reserved space.
- Derive each motion gutter from the maximum transform or effect extent on that axis, using the same container-relative coordinate system as the animation. Expand or move the Composer widget bounds when necessary to preserve the settled artwork's composition position.
- Use internal padding and alignment for non-motion spacing.
- Treat the runtime root as the responsive viewport. Prefer percentages, `cqi`/`cqb` or `cqw`/`cqh`, Grid, Flexbox, `aspect-ratio`, fluid `clamp()`, and shape-based container queries for primary geometry, type, spacing, and motion.
- Use fixed CSS pixel values only for a deliberately invariant detail such as a hairline border or a strict minimum legibility constraint. Do not use pixels for outer placement, primary dimensions, scalable spacing, or animation travel when a container-relative value can express the intent.
- Test at least one wide or landscape box and one materially different square or portrait box. Text, controls, and intended intermediate animation frames must remain inside the widget bounds without overlap or accidental clipping.

## Lifecycle and animation

Before changing an animation, record a transform-target map: the exact element and property to change, its coordinate space and motion owner, and the neighbors that must remain unchanged. A name-only scale request does not include its panel, secondary text, markers or lines. Keep base sizing/layout, visibility animation and travel-specific effects separate; do not compensate for a transient effect by silently changing settled spacing, widths, movement duration or unrelated transforms. Verify unchanged elements against the pre-edit baseline.

When a user says "between keyframes", first determine whether the endpoints are native Composer Timeline keyframes or renderer-owned ambient transition states. Inspect the existing motion owner; do not create native keyframes or a second clock merely to implement a renderer-owned effect.

### Timing claims

Distinguish finite duration from easing time constants and settling time. A finite transition reaches its specified endpoint at the declared duration; an exponential approach reaches only a chosen error threshold. For exponential decay with time constant `tau`, a 95% settling time is approximately `3 * tau`, not `tau`. State the threshold, start event, completion event and units before claiming an exact duration or "one second longer". Prefer a finite-duration transition when exact endpoint timing is requested, while preserving Singular's ownership of In/Out. Measure elapsed time to the stated completion criterion; do not infer duration from a changed constant or frame count alone.

Discrete layout changes during continuous motion need explicit transition design. For a requested fade-out/relocate/fade-in, relocate only while fully transparent; duration, easing and placement policy remain graphic-specific. Reuse the existing ambient loop, keep its properties separate from finite In/Out ownership, and preserve native controls and links. Verify intermediate behavior over time after required assets are ready; endpoint screenshots alone cannot prove an invisible change. Distinguish local runtime assertions from installed Player and Control App evidence.

For transparent procedural overlays, follow the [responsive particle candidate](../recipes/responsive-particle-overlay.md) for owned root observation, height-uniform geometry/motion, bounded population transitions and zero-size/destruction handling. Its reusable resize matrix tests one mounted renderer; separate previews alone cannot prove resize cleanup or state continuity. Independent effect groups are appropriate for requested mixtures, not a universal control layout.

- Keep the installed DOM persistent. Cache nodes in `mount()` and mutate only keys present in `changes` during `update()`.
- Treat generated field declarations as Composer UI schema, not runtime JavaScript type guarantees. Composer controls and Control Node payloads may deliver serialized values; for example, a `number` or `normalizednumber` edit can reach `update()` as a numeric string.
- Normalize each changed value according to its declared field type before using it. Parse finite numeric strings explicitly; handle boolean strings such as `"false"` without truthiness coercion; preserve text and selection strings; and validate color and metricfont objects. Image inputs may be URL strings or objects with `url` or `src`; use `context.assets.resolveImage(value)` for those supported forms. Define a deliberate fallback for empty, malformed, or out-of-range input.
- Color fields may arrive as plain `{r,g,b,a}` values, `{type:"solid",solidColor:{r,g,b,a}}` wrappers, or CSS-compatible strings. Use `context.colors.toCss(value)` for CSS assignment. When interpolation requires numeric channels, normalize through that host conversion first and parse the resulting CSS color rather than silently retaining the previous color.
- This renderer adapter is not the native Color Control Node input contract. Use plain RGBA for portable linked-control tests, and test wrapper normalization locally as a separate path; see [native Color payloads](../control-node-creation.md#create-versus-reuse). Preserve alpha without applying it twice.
- Normalize only keys present in `changes`. Do not rebuild a complete payload, coerce absent fields, or rely on `typeof` checks that reject valid serialized control values.
- Write dynamic text with `textContent`, not `innerHTML`.
- Render finite motion deterministically in `seek(animation, context)` from `animation.timeline` and normalized `animation.progress`. Progress is timeline-local and advances from 0 to 1 for both In and Out; do not globally invert Out progress. Map individual exit properties from settled to hidden as needed.
- Use unrestricted bounded JavaScript inside the lifecycle to update HTML or SVG DOM, calculate procedural geometry, or draw Canvas frames. Do not add a declarative animation format: Singular's lifecycle commands and normalized progress are the animation interface.
- Singular owns finite playback. Do not run an independent clock for In or Out, and keep authored In/Out properties separate from ambient animation.
- Reserve independent clocks only for non-conflicting ambient motion and stop every owned resource in `destroy()`.
- Use `context.fonts` and generated `metricfont` fields for fonts, and generated `image` fields for assets. Do not fetch fonts independently except under the explicit outline-resource exception above; never inspect application state.
- Ignore stale asynchronous font completions and preserve element identity during data updates.

## Verification

- Exercise the requested direction and actual triggering event, with departure, intermediate and landing checks plus unchanged-element assertions. A controlled fixture can demonstrate a transition that natural playback never exercised; report that coverage explicitly rather than claiming the installed scene passed. Earlier tests of a broader or superseded implementation do not verify the final narrowed change.
- Successful loading and zero script errors do not establish visual acceptance. Review captures; an unexplained black or hidden target remains unresolved. Diagnose target and ancestor visibility and resource readiness before classifying a defect. Any explicit private Player test-state setup must remain separate from saved presentation state. Use the documented readiness gate for the tested host before payload updates; an arbitrary delay that avoids an error is not a readiness predicate or a root-cause diagnosis. Distinguish controlled fixtures, installed Player observations and actual Control App interaction tests.
- Read back the tile definition, generated typed fields, layout, In/Out effects, keyframes, and active composition's `timeline2Active` value before visual acceptance. For every linked generated field, read back both the Control Node and persisted data link; the definition's field declarations alone are not live schema or link verification.
- After changing `definition`, distinguish four checkpoints: Composer model readback, installation into any managed Control App extract, reload of the tested app/output so it uses that extract, and a new linked-value runtime update. An already-running output may continue executing the previous widget JavaScript; do not diagnose the link or add script forwarding until the app has loaded the new definition.
- Exercise generated controls through the actual Composer UI or equivalent persisted payload path. Read back both the value and its runtime type, then verify the rendered result; a numeric command-path test alone does not prove that a formatted numeric string from the UI is handled.
- Open the ordinary module that owns the widget timeline and use active-composition capture. A root capture seeks only the root timeline and is the wrong target for an independently timed nested module.
- Capture and view exact start, representative midpoint, and settled/end positions. Distinct seek reports or PNG byte sizes are diagnostics, not substitutes for viewing every retained frame.
- At a midpoint where content is transformed, confirm that its motion envelope prevents accidental edge clipping. Restore any temporary portrait, square, or stress-test geometry and verify final layout readback before handoff.
- Require no lifecycle script errors or unresolved font/image resources, remove temporary manifests and captures, return to the intended Composer scope, and release the work lease.

Generated field types are `text`, `textarea`, `number`, `normalizednumber`, `checkbox`, `selection`, `color`, `image`, `metricfont`, `gradient`, `json`, `counter`, and `button`. Timer fields remain unsupported. Do not define a field named `definition` or a group named `definitionGroup`. Generated fields are eligible for Composer UI and compatible agent-created Control Node links unless their definitions explicitly set `disableDataLink: true`; native Gradient Control Node creation is not supported. JSON stays text, Counter delivers resolved values, and Button uses the optional `button(id, context)` lifecycle callback rather than value-change detection. See the authoring contract for defaults and native gradient rendering requirements. Local preview applies values but does not simulate native button actions.