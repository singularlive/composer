# Three.js extruded text

Candidate based on a sanitized user-supplied retrospective, not independently replayed here. Read [AI Graphics](../widgets/ai-graphics.md), its [authoring contract](../widgets/ai-graphics-authoring.md), the shared [Three.js runtime reference](../widgets/ai-graphics-threejs.md), and [verification discipline](../composition-scripting/debugging-and-verification.md). Do not reconnect to the original composition to reproduce the report.

## Representation and delivery

Choose this pipeline for explicitly requested solid, beveled geometry. Flat planes carrying Troika-style SDF text provide a different representation; Troika alone does not provide extrusion or bevels. A canvas/distance-field simulation is a valid prototype technique, not necessarily the requested final architecture. Deliver inside Composer, not a standalone test page. Keep root as orchestration/shared theme and visuals in an ordinary graphic sub-composition.

Replace an existing AI Graphics definition in place when possible. Before editing, inspect and retain control IDs, types, owning scopes, containers, persisted links, generated schemas, effective values, layout and timelines. Reinspect all of them after installation. Preserve Text, native Font (`metricfont`), Depth, Bevel, Roughness, Metal, Rectangle, Animate and Speed when that is the existing contract; these particular controls are not universal defaults. Direct native links remain the only writers of those generated values. Never add composition-script forwarding for them. Revision and template-contract protections still apply.

## Bounded rendering pipeline

1. Read family, weight and style from the linked native `metricfont` value, including its actual inspected wrapper. `context.fonts` loads browser fonts but has no documented outline/binary resolver. Do not use DOM/style scraping to infer a source file.
2. Resolve the selected public Google Fonts source through declared repository metadata, using pinned metadata revisions where practical. Declare exact dependency versions and public HTTPS origins, cap redirects/response bytes/timeouts/cache entries and omit credentials. Do not turn a repository directory-name guess into a compatibility claim. Font licenses and attribution still apply. No default local-preview permission follows from this recipe.
3. Use a pinned Fontkit build to parse the supported file and shape the complete string, retaining glyph positioning, advances and offsets rather than mapping Unicode characters one-by-one. For a variable file, inspect supported axes and request the supported `wght` variation before shaping; do not fake unsupported italic styles or axes.
4. Convert move/line/quadratic/cubic/close contours to Three.js shapes with explicit hole classification and coordinate conversion. Preserve counters, winding and shaping offsets. Check representative `B8O` counters and curves; fallback glyph boxes are not success. Color/bitmap fonts, collections, unsupported outline formats, complex scripts and untested axes need explicit rejection or separate evidence.
5. Build bounded `ExtrudeGeometry` with clamped depth, bevel size/thickness/segments and curve resolution. Budget glyph count, triangles and backing pixels. Build replacements off-scene and swap only when the newest request succeeds; dispose replaced geometry/materials without rebuilding the persistent host or canvas.
6. Use a physical material for requested metallic shading and generate a prefiltered studio environment with Three.js PMREM. A perspective camera and contrasting studio light panels can make bevels/reflections legible; lighting, metal/roughness, colors, rotation and reflection softness are task parameters, not defaults. A directional light may cast onto an explicitly requested rectangle mesh. Frame text, bevels, shadow and motion within the widget bounds.

Retain a visible in-widget error for unsupported fonts, parse/network failures or budget violations. Preserve the selected native control and last valid mesh; before first success show no text mesh. Never silently substitute another family. Empty text is intentional: invalidate pending loads, dispose the text mesh and leave the rectangle. Do not show raw URLs, payloads or library stacks in the error. Clear it only on empty text or a successful newer build.

## Async replacement building block

This helper is not a full renderer or supported font resolver. `build(input, signal)` performs bounded resolution/shaping/geometry work and returns an owned candidate. `install(candidate)` swaps it and disposes the previous text mesh; `dispose(candidate)` handles rejected candidates; `clear()` releases text geometry but retains the rectangle. Catch and clean up partially constructed resources inside `build`. The caller normalizes only present numeric changes, preserving finite numeric strings such as `"0.35"`; absent keys do not reset values. Rebuild from the latest combined text/font/geometry state, never from an older fetch closure.

```javascript
function createOutlineUpdates(renderer) {
  var generation = 0, destroyed = false, pending = null;
  return {
    replace: async function (input) {
      if (destroyed) return;
      var current = ++generation;
      if (pending) pending.abort();
      pending = null;
      if (input.text === '') {
        renderer.clear();
        renderer.error(null);
        return;
      }
      var controller = new AbortController();
      pending = controller;
      var candidate = null;
      try {
        candidate = await renderer.build(input, controller.signal);
        if (destroyed || current !== generation) {
          renderer.dispose(candidate);
          return;
        }
        renderer.install(candidate);
        candidate = null;
        renderer.error(null);
      } catch (error) {
        if (candidate) renderer.dispose(candidate);
        if (!destroyed && current === generation) renderer.error('Selected font or text could not be rendered');
      } finally {
        if (pending === controller) pending = null;
      }
    },
    destroy: function () {
      if (destroyed) return;
      destroyed = true;
      generation++;
      if (pending) pending.abort();
      pending = null;
      renderer.clear();
    }
  };
}
```

## Resize and lifecycle

Follow the shared [resize, teardown and verification contract](../widgets/ai-graphics-threejs.md#resize-teardown-and-verification), including zero-size suspension and destruction guards. For text specifically, refit geometry bounds after successful string/font/depth/bevel replacement without resetting operator values, clipping counters or shrinking away the requested depth. Empty text must not remove the rectangle. Keep text-specific font caches and shaped/outline candidates bounded and release them with their owner.

Freeze ambient rotation to a deterministic static pose for the restoration scenario; do not merely pause at an arbitrary angle. Singular still owns finite `seek` and the inspected separate-Out/reversed-In contract. Lighting, metal/roughness, PMREM and a shadow receiver remain optional task design choices, not shared Three.js requirements.

## Same-Player verification template

Adapt [the scenario template](threejs-extruded-text-scenario.json) through structured JSON values before execution. Replace `OWNER` on every payload/playback step with the actual ordinary module scope; if controls are ancestor-owned, use that inspected owner for payload steps only. Configure the verifier's capture target to the graphic module once; capture steps do not accept `compositionId`. Map example control keys to their existing public IDs. Replace `FONT_A`, `FONT_B400`, `FONT_B800` with complete inspected native font objects, never family-only guesses. Replace `BASELINE_PAYLOAD` with the exact original payload except Animate=false for a deterministic baseline, `OPERATOR_PAYLOAD` with the complete original operator payload, and `TEXT_REGION` with a calibrated text-only region. The example depth/bevel/roughness/speed strings must fit the actual schema. Do not run unresolved placeholders.

Run the adapted scenario through the normal fresh handoff-driven verifier, in one initialized Player without reloading it. Read the [composition-script/Player workflow](../composition-scripts.md) first; no persisted composition script is needed for native linked controls. The bounded waits are sampling budgets, not dependency-readiness proof: require visibly complete fonts and inspect resource diagnostics before accepting captures. Font swaps and 400/800 weight changes need reviewed glyph shapes, not just nonzero pixel changes. Verify `B8O`, empty text with the rectangle retained, restoration with ambient motion frozen, moving frames and both In/Out. Pixels changed by shadows/errors alone must not satisfy text acceptance. Compare restoration only on that same renderer with stated tolerance.

Separately exercise out-of-order font completions, unsupported files, network rejection, late completion after destroy, and resize/zero-size behavior in an owned local fixture. The helper's synthetic tests prove cancellation/ownership mechanics, not Fontkit shaping, WebGL cleanup or visible error design. The current local preview blocks script/fetch requests and has no generic asynchronous-ready wait; report that limitation rather than patching installed verification tools. A passed schema, invoked lifecycle or zero script events is not dependency readiness.

## Evidence boundary

The supplied retrospective reports installed Composer model/schema/value/link/layout preservation; one initialized Player with Righteous/Montserrat, Montserrat 400/800, text/depth/bevel/roughness changes, empty text, restoration, motion and Out; 37 steps and ten reviewed captures with static restoration matching and no observed console or typed script errors. It also reports one production-host local resize run and reviewed counters/bevels/shadows/weights. These are supplied observations, not a new run or bundled implementation. No universal family/style/script/axis support, offline behavior, prolonged stability, cross-device performance or actual Control App operation was established. Report model, local runtime, Player, reviewed screenshot and Control App evidence separately.