# Capture targeting and examples

Read [capture basics](capture-basics.md) first, then use these target and evidence patterns.

## Capture examples

Use only the unified command. It runs `inspect` internally and keeps the Composition API token out of command arguments, output, and worker state.

Capture a paused root Timeline frame, for example halfway through `In`:

```bash
node scripts/composer-agent.js capture --target root --timeline In --at 0.5 --output <path.png>
```

Timeline-position capture deliberately excludes widget-owned active compositions, timed mode, continuous Behavior time, script timers, and video clocks. A paused root Timeline frame includes timeline-aware widget seek callbacks and linked descendants. An ordinary active composition uses the Player composition seek path. Neither form freezes independent runtime clocks.

Capture an isolated ordinary or widget-owned active scope after opening it in Composer:

```bash
node scripts/composer-agent.js capture --target active --output <path.png> [--template-session <token>]
```

The template token is required only for a widget-owned active scope. Let the CLI manage its scoped Composer-agent credential store; never manually print, copy, or place either Composer-agent or Composition API credentials in artifacts or process arguments.

### Capture measurement snapshot

Add `--measurements <path.json>` when capture must answer a concrete layout question:

```bash
node scripts/composer-agent.js capture --target root --output <path.png> --measurements <path.measurements.json>
```

Capture samples the ready private Player target immediately before taking the PNG. Version 1 uses capture-target coordinates and contains the target dimensions plus up to 500 Singular group, widget, and sub-composition wrappers. Each element records its runtime ID, name, type, composition identity, pixel and percentage bounds, visible clipped bounds, visibility, opacity, transform, z-index, and transformed quad when the browser exposes it. Widget entries additionally record text length and rendered line count, bounded image geometry without image URLs, and SVG/canvas counts. Names are limited to 200 characters, images to ten per widget, and the complete file to 1 MB. The summary reports the measured and total element counts and whether truncation occurred.

The snapshot contains no text values, image URLs, DOM dump, script text, event payload, token, or preview URL. Runtime IDs plus composition identity disambiguate repeated elements. `summary.contentBounds` and `contentBoundsPercent` union the visible bounds of measured non-group elements so full-canvas structural groups do not hide the actual foreground extent; `contentBoundsTruncated` is true when the element cap prevents that union from being complete. `summary.imageStatus` reports total, measured, loaded, failed, and pending image counts plus truncation. Each bounded image item reports `status` (`loaded`, `failed`, or `pending`) and a sanitized failure reason without its source URL or raw browser error. Standalone request tracking can additionally report safe HTTP/network/decode variants and an optional numeric status. Iframe-backed widget internals remain opaque in version 1; their Singular wrapper is still measured, while internally rendered text or images may not appear in the widget detail fields.

In smart mode—including an explicitly sought Timeline position—the target has passed visual stability before measurement. In timed mode, the snapshot is sampled immediately before the screenshot, but continuous Behavior, script, timer, video, or live-data clocks are not frozen and can advance between those two browser operations. Use the snapshot for geometry and clipping evidence; use the PNG for glyph rendering, filters, gradients, shadows, canvas pixels, video content, and overall visual comparison.

Write working output inside the task-temporary directory described in [commands.md](commands.md). Retain only the selected user-facing visual artifact in an appropriate deliverable location before removing scratch files.

### Choosing a wait mode and delay

Use `smart` when the target is script-free and its intended Singular Timeline animations are finite. It normally avoids the former unconditional two-second quiet wait: once downloads, scripts, payload propagation, fonts, images, finite timelines, and 350 ms of visual stability complete, capture proceeds.

Use `timed` when the target has any known persisted composition, global, or overlay script; continuous Behavior; Bodymovin Loop; a ticker; timer; polling; live data; video; or another output that may never become visually still. Also use it when script presence cannot be ruled out. Choose `--settle` from the intended capture moment rather than increasing the overall timeout. The unified command defaults timed settling to two seconds; specify a different bounded value when the script or data contract requires one.

Use timed capture for one sampled state of continuous output. Use the Player-verification workflow when a frame sequence must prove composition-script or runtime behavior.

When script presence is unknown, choose timed mode without additional script discovery solely to select the wait mode. Use the composition-script helper only when a concrete diagnostic or authoring question requires script inspection; an empty `list-scripts` result alone does not establish that the target is script-free. Do not expose script text or move script inspection into the paired relay. If smart mode reports ongoing timeline or visual activity, inspect the target and retry once with timed mode; do not make a continuously moving composition satisfy smart mode by extending `--timeout`.

### Temporal evidence for animated and live output

For continuous animation, clocks, timers, tickers, video, polling, and live data, the acceptance target is a behavior over time rather than one globally stable frame. Timed readiness proves that lifecycle and resources reached a sampleable state; it does not prove that the chosen instant is representative or that a screenshot backend did not sample during a compositor update.

Define the invariant before sampling—for example, a clock always presents one complete formatted value while its seconds advance, or a ticker remains clipped to its viewport while moving. Then:

1. Allow bounded warm-up until runtime/DOM evidence shows the first meaningful state. Initial blank frames before that state are readiness evidence, not automatically rendering failures.
2. When the relevant DOM or payload change can be observed, allow the browser at least two animation frames before the visual checkpoint. This is a synchronization aid, not a promise that continuous output becomes still.
3. Collect a small bounded sequence at phase-offset times appropriate to the behavior. If one sample differs sharply from the invariant, retry at a deliberately shifted offset instead of repeating the same cadence against the same update boundary.
4. Compare screenshot evidence with current runtime/DOM state, lifecycle evidence, Composer readback, and adjacent frames. Do not weaken the invariant or select only favorable frames.
5. Report `pass` when the required behavior has representative visual and semantic evidence; `fail` when the same violation persists across adjacent or phase-shifted samples beyond any intended transition, or semantic evidence also fails; and `inconclusive` when pixel and semantic evidence conflict after the bounded retry.

An isolated anomalous frame is useful diagnostic evidence but is not sufficient by itself to identify a broken link, stale identity, incorrect runtime value, or visible user-facing defect. Pausing or disabling animation can answer a static layout question, but it changes the runtime contract and cannot serve as the sole proof of animated behavior. Use the Player-verification workflow for multi-frame behavior.

## Isolating a sub-composition

For a screenshot of one sub-composition, open it with `open-composition --id <id>` and use `capture --target active`. Open widget-owned templates through `open-widget-subcomposition` and supply the current template session. Capture isolation changes visibility only in the temporary Player page, not persistent animation settings or playback states. Return to the previous editor scope afterward when needed.

For sibling variants in one logic layer, verify each variant separately: take one member In, confirm the others are Out, capture the active member, and repeat. Record the intended final active member before changing state, then restore it and re-read the logic layer before handoff. Do not infer stacking from logic-layer membership; it expresses mutual exclusion, not z-order.

Use state-based root capture only when the actual on-air combination of root and sub-compositions matters:

1. Inspect the relevant elements and confirm they have an effective In or Out animation.
2. Take unrelated root or sibling compositions out.
3. Take the target composition in.
4. Run `composer-agent.js capture --target root --output <path.png>`.

Taking the root composition out hides animated elements directly in the root; nested sub-compositions remain governed by their own composition states and timelines.

An `Out1` or `Out2` state is not inherently invisible. Elements whose applicable timeline effect is `none`, or whose animation otherwise leaves them visible, still render while their composition reports an Out state. If a composition is already Out when its timeline changes from `none` to a hiding animation, cycle it In and then Out before capture so the new timeline plays.

Avoid changing animation solely for a screenshot. If state-based isolation is explicitly required, snapshot and restore every changed animation and composition state. Use finally-style restoration after success or ordinary failure while authorization and the work lease remain valid. Cancellation takes precedence: do not reacquire a lease or issue restoration commands after `OPERATION_CANCELLED`. Clean up local artifacts, report unrestored state, and follow "Mutation failure recovery" in [commands.md](commands.md) before any later authorized restoration. If ordinary failure prevents restoration, report the pending state instead of claiming cleanup succeeded.
