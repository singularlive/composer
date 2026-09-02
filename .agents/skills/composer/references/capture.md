# Preview capture

Capture only when a rendered image will answer a visual question that Composer model readback cannot. Capture is comparatively expensive—especially standalone Player startup and readiness—so it is not a default before/after wrapper around every mutation. Browser-owned capture is the preferred fast path and now exposes the same smart/timed readiness, settling, exact Timeline-position, and measurement evidence controls as standalone capture. It remains a one-screenshot transaction: use a fresh preparation for every additional frame, and use the Player-verification workflow when the question requires an authoritative runtime sequence or script behavior. Choose the first available path in this order:

1. When a Computer Use browser-control skill is available, follow its browser-selection rules, discover the already-open tabs on the selected browser surface, and attempt to claim the exact authenticated Composer editor tab for the inspected scene. Capture through that browser when the claim succeeds; do not limit discovery to the in-app browser.
2. Use standalone capture only when no Computer Use browser-control skill is available, the matching Composer tab is not open on the selected browser surface, or the discovery/claim/control attempt fails.

Composer pairing and browser ownership are separate. Pairing authorizes the CLI to prepare the editor, but it does not by itself give a Computer Use browser control of a user-owned tab. When a browser-control skill is available, this distinction requires selecting the applicable browser surface and explicitly attempting discovery and claim there; it is not a reason to skip directly to standalone capture. Never open a second Composer editor merely to capture; Composer permits only one editor session for the composition.

Before every capture, identify the unresolved visual question. Use model readback instead for names, IDs, hierarchy, stored values, animation configuration, Control Node links, Table rows/options, and other state the CLI can verify authoritatively. Capture a baseline only when the existing appearance must be preserved or compared, a supplied reference needs before/after evidence, or a rendering defect is being diagnosed. After `inspect` confirms that the requested target is structurally empty and no before/after preservation is required, skip the command and report `baseline: { "status": "baseline-not-applicable", "reason": "empty-target" }`; this is a workflow result, not a renderer error. Skip baselines for other disposable compositions and nonvisual work as well. A non-empty target that fails to attach or render still returns its normal capture error. Batch related mutations before capturing and never recapture output that has not materially changed.

The capture budget in [`../SKILL.md`](../SKILL.md), under **Building or refining a graphic**, is authoritative. This reference does not define a second numeric budget: classify each successful image as refinement or required verification, name the unresolved visual question before every refinement capture, and stop under the limits and early-termination rules in the skill. Failed captures and unchanged output are handled there as well.

## Browser-owned Composer capture

This is the fastest path because it reuses the page that is already authenticated, loaded, and rendering. It does not use a preview page or launch another Chrome process.

1. Run `inspect` and determine the target resolution. For root and ordinary active compositions, use `preview.width` and `preview.height`. For an active widget-owned template, use `activeComposition.widgetSubComposition.width` and `.height` instead.
2. Through the available Computer Use browser-control skill, follow its browser-selection rules, list the already-open tabs on the selected browser surface, match the authenticated Composer editor by scene URL or inspected scene identity, and claim that exact tab. Do not default to or limit discovery to the in-app browser, and do not treat an as-yet-unclaimed tab as unavailable. Preserve the current viewport state, then resize the content viewport to the exact target width and height so the canvas is rendered at full detail.
3. Prepare the canvas with the wait mode appropriate to the target. Use smart mode for finite script-free output and timed mode for scripts, continuous Behavior, tickers, timers, live data, video, or unknown script presence:

```bash
node scripts/composer-agent.js prepare-capture --target root --artifact-manifest <path.capture.json> --restore-after 30
node scripts/composer-agent.js prepare-capture --target root --wait-mode timed --settle 2 --artifact-manifest <path.capture.json> --restore-after 30
```

   For one exact paused root or ordinary-active Timeline position, add `--timeline In|Out --at <seconds>` in smart mode. For a concrete geometry question, add `--measurements <path.json>`; the CLI writes the same bounded version-1 schema used by standalone capture before returning the prepared transaction.

4. Treat the returned `selector` as the authoritative target identity. Resolve it in the claimed tab and require exactly one match. Read that element's live `getBoundingClientRect()` after preparation, together with `window.innerWidth` and `window.innerHeight`. Reject the browser capture if the box is non-positive, begins outside the viewport, extends past any viewport edge, or differs from `editorResolution` by more than one CSS pixel. Do not blindly use the returned `clip`: it is preparation metadata and can be stale if the browser applied viewport sizing or layout asynchronously.
5. Take exactly one screenshot from this prepared session. When the newly measured target exactly covers the viewport at `(0, 0)` and both equal `editorResolution`, use the browser backend's ordinary viewport screenshot with neither `clip` nor `fullPage`; this is the normal prepared root and active-canvas path and avoids clip coordinates being interpreted in device pixels by some Browser backends. Otherwise pass the verified live target box as `clip`. Browser APIs that do not expose element screenshots still use the selector to identify and validate the target before either operation. Never capture the whole tab or crop it by assumption, and never take a second screenshot before restoration. A Browser backend timeout is a failed transaction: restore and prepare once more before retrying; use full-page mode on the retry only when the newly measured target exactly covers the complete page at `(0, 0)` and the returned page dimensions equal `editorResolution`, otherwise continue to standalone.
6. Save the image in the session artifacts directory with the extension matching the returned image format. Write a separate version-1 evidence JSON containing `mode` (`viewport`, `clip`, or `full-page`), the verified `targetBounds`, `{width,height}` viewport, optional page dimensions for full-page mode, and the live device-pixel ratio. Do not put image bytes, URLs, tokens, or browser storage in the evidence.
7. Finalize the artifact. This validates the prepared transaction, geometry containment and resolution, PNG/JPEG header dimensions, the 8 MB limit, and CSS-pixel or device-pixel scaling; computes SHA-256; writes `complete` or `failed` status to the manifest; and restores Composer even when validation fails:

```bash
node scripts/composer-agent.js finalize-capture --capture-id <capture-id> --artifact-manifest <path.capture.json> --output <path.png> --evidence <path.evidence.json> --browser <display-name>
```

   A retry, refinement, or additional static frame starts a new transaction with a fresh manifest, preparation, and live-bounds measurement. One fresh attempt is allowed after validation failure; if it also fails, continue to standalone capture and report that Browser capture validation failed.
8. Restore the browser's previous viewport in a `finally` path. If the Browser failed before it could save evidence and invoke finalization, explicitly restore Composer with `node scripts/composer-agent.js restore-capture --capture-id <capture-id>`. The automatic deadline remains crash recovery only.

`prepare-capture` accepts `--target <root|active>`, `--wait-mode <smart|timed>`, `--timeout`, `--settle`, paired `--timeline In|Out --at <seconds>`, optional `--measurements <path.json>`, optional `--artifact-manifest <path.json>`, and `--restore-after <seconds>`. The restoration deadline defaults to 30 seconds and must be between 5 and 120 seconds. Preparation temporarily hides editor overlays, sets Composer zoom to 100%, places the preview at viewport origin, isolates an active sub-composition when requested, waits for target and accessible descendant-frame fonts, decoded images, CSS backgrounds, and the selected readiness mode, optionally seeks and pauses the existing editor runtime, and optionally writes the version-1 geometry snapshot. Smart mode uses the standalone 350 ms visual-quiet and three-second continuous-activity contract; timed mode settles without requiring still output and rechecks resources immediately before sampling. Its result includes `captureId`, `selector`, a diagnostic `clip`, `editorResolution`, `devicePixelRatio`, readiness metadata, optional Timeline metadata, optional measurement metadata, and optional prepared-manifest metadata. It does not create an image itself or establish a reusable frame-sampling session. The Browser must re-measure the marked selector because its viewport override is owned by a different control surface and may settle after the editor computed the diagnostic clip.

Browser Timeline-position capture supports root and ordinary active compositions and rejects widget-owned active templates or a position beyond the selected duration. Restoration returns both Timeline heads to their prior transient times and paused/running states. Independent Behavior, script, timer, live-data, and video clocks are not frozen; use timed mode for a single sample and Player verification for authoritative runtime behavior.

### Browser target measurement

Use the Browser skill's locator evaluation only for read-only measurement. The required result shape is equivalent to:

```js
const target = tab.playwright.locator(prepared.selector);
if (await target.count() !== 1) throw new Error('Browser capture target is not unique');
const bounds = await target.evaluate((element) => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };
});
```

Validate finite values, positive dimensions, all four viewport edges, and the expected editor resolution. Call `tab.screenshot()` without clip/full-page options when the target exactly covers the viewport; otherwise use `tab.screenshot({ clip: { x, y, width, height } })`. Round only when constructing a clip; do not round before comparisons. Record the same unrounded geometry in the evidence file and let `finalize-capture` validate CSS-pixel or device-pixel-scaled image dimensions.

Always finalize or explicitly restore even though Composer auto-restores at the deadline. Restoration is idempotent after automatic recovery: it returns `restored: false` with `reason: "not-prepared"`. A second simultaneous preparation fails with `CAPTURE_ALREADY_PREPARED`, and restoring the wrong capture ID fails with `CAPTURE_SESSION_MISMATCH`.

### Browser and tab lifecycle

Browser connection, tab ownership, and Composer pairing are separate lifecycles:

- Reuse the selected browser binding across commands and later turns when the browser-control skill supports it; do not reconnect merely because a new turn started.
- Reuse the claimed Composer tab throughout one continuous browser task instead of releasing and reclaiming it between capture steps.
- Reuse of the browser binding and tab does not extend a prepared capture. Every browser-owned screenshot has its own prepare, optional Timeline/measurement sample, live-bounds validation, one-screenshot, and restore transaction.
- Before ending a browser task or turn, follow the selected browser-control skill's finalization contract. When Composer follow-up may continue, keep the tab open as a handoff so the next turn can discover and reclaim it without navigation or reload.
- Finalizing or handing off a browser tab does not end the Composer-agent pairing. Keep that pairing active until the user explicitly asks to end or release the session; only then run `complete`.
- Do not leave a prepared capture active merely to preserve tab ownership. Always restore Composer and the prior viewport first, then finalize the tab when required.

If no Computer Use browser-control skill is available, no matching Composer tab is open on the selected browser surface, or the browser cannot claim/control the matching tab after the required attempt, continue with standalone capture:

```bash
node scripts/composer-agent.js capture --target root --output <path.png>
```

Standalone is the unified CLI capture path. It uses a private headless Chrome worker and never changes the user's active tab. The worker stays warm for five minutes after a capture so later standalone commands avoid another Chrome launch, while every capture uses and closes a fresh isolated browser context.

## Unified capture command

```bash
node scripts/composer-agent.js capture \
  --target <root|active> \
  [--template-session <token>] \
  [--wait-mode <smart|timed>] \
  [--timeline <In|Out> --at <seconds>] \
  [--measurements <path.json>] \
  --timeout 30 \
  --settle 0 \
  [--server <url>] \
  --output <path.png>
```

- `--target` defaults to `root`. `active` captures the active scene or widget-owned sub-composition when one is open and otherwise resolves to root. An active widget-owned target requires the current opaque `--template-session <token>` from full `inspect` or `open-widget-subcomposition`; missing or stale tokens fail before capture preparation or standalone Player startup.
- `--wait-mode` applies only to standalone capture and defaults to `smart`. `smart` waits for finite Singular timelines and a short target-scoped visual quiet window. `timed` waits for core lifecycle and assets, then captures after `--settle` without requiring the output to stop moving.
- `--timeline` and `--at` capture an exact paused position of the root or an ordinary active composition's `In` or `Out` timeline. They must be supplied together, require standalone `smart` mode, do not support widget-owned active compositions, and reject positions beyond the selected timeline duration instead of silently clamping them.
- `--measurements` is standalone-only and writes an optional version-1 Player measurement snapshot immediately before the screenshot. Use it for a named geometry question, not as a default sidecar for every capture.
- `--timeout` is the overall renderer-readiness deadline in seconds and defaults to `30`.
- `--settle` adds a non-negative delay after core readiness. It defaults to `0` in `smart` mode and `2` seconds in `timed` mode.
- `--server` is optional and must normalize to the server stored in the paired credentials. It supports environment-explicit invocations but cannot retarget an existing access token; a mismatch fails with `CAPTURE_SERVER_MISMATCH` and requires pairing with the intended server.
- `standalone` runs `inspect` internally, keeps the Composition API token in the CLI process, and captures at the reported composition resolution.

Successful output contains the absolute path, source and target, PNG dimensions and byte size, composition identity, editor resolution, and readiness metadata. When requested, `measurements` adds the absolute JSON path, schema version, measured element count, truncation state, and byte size. The retained `fallback` field is always `null`. Output never contains a token, preview URL, data URL, browser command line, or raw browser error.

Standalone core readiness requires a visible positive target box; target-owned DownloadStore cycles to finish; composition-script evaluation to reach `ok` or `error`; a short payload/resource quiet period; loaded fonts; decoded target images; and completed or failed CSS background assets. The listener is injected before navigation into every frame, so events emitted by nested widget frames can be collected from their immediate parents. All gates share the one caller-provided deadline.

In `smart` mode, standalone additionally waits until Singular's finite In/Out timelines are inactive and no timeline reports an unfinished transition, then requires 350 ms of unchanged target-scoped visual state. For a requested timeline position, it first lets that normal finite-timeline gate complete, seeks the existing runtime, verifies the exact paused time, and applies the same visual-stability check without requiring the intentionally incomplete timeline to finish again. Root capture uses Composer's phase-aware runtime timeline-position path, preserving linked descendants and timeline-aware widget callbacks. Ordinary active capture uses the existing Player composition seek API and confirms the selected runtime timeline position before capture. The sample hashes text content, relevant HTML/SVG attributes, computed visibility, opacity, transforms, backgrounds, fonts, bounds, resources, and the complete target-owned Playwright frame tree. This targets Singular timelines specifically; it does not use global `TweenMax.getAllTweens()`, which cannot distinguish finite timeline motion from continuous Behavior or script tweens. If visual changes continue for three seconds after the finite-timeline gate, capture fails early with `PREVIEW_CONTINUOUS_ACTIVITY` and directs the caller to timed mode instead of consuming the complete overall timeout. Canvas presence is reported in readiness metadata, but canvas pixels are not used as proof of stability.

In `timed` mode, standalone and Browser preparation perform their resource gates, wait `--settle`, recheck resources, then sample one visible state without requiring timelines or rendered output to become still. Browser preparation observes accessible descendant frames from the editor page and remains a one-screenshot transaction; standalone additionally owns the complete private Player frame tree and lifecycle tracker. Paired capture retains its existing two-second quiet-window contract. Standalone bootstraps from either the preview-ready console signal or an attached `#SingularPlayer` iframe. The iframe is resolved from the element itself, with its stable `/singularplayer/output` URL and top-level child-frame relationship as compatibility fallbacks, rather than assuming its `name` attribute matches its ID. For a widget-owned active composition, capture enters the owning widget iframe and selects the visually active runtime instance of the template. Empty compositions are valid; readiness does not require text or descendants.

Readiness metadata includes the selected wait mode, lifecycle event counts and wait duration, script-error count, payload activity, per-resource gate durations, inspected timeline counts and wait duration in smart mode, stability resets/quiet duration, canvas count, image counts, and the requested settle time. `imageGateComplete` reports that every image reached loaded or failed terminal state and any decodable image completed its decode gate. `allImagesLoaded` is true only when the final target sample has no failed or pending images, while `imageStatus` contains the loaded, failed, and pending counts. The retained `imagesReady` field is a backward-compatible alias for gate completion and does not by itself prove successful image rendering. Readiness never contains script text, event payloads, tokens, image URLs, or preview URLs.

## Standalone prerequisites

```bash
playwright-cli --version
playwright-cli install-browser chrome
```

If `playwright-cli` is missing:

```bash
npm install --global @playwright/cli
playwright-cli install-browser chrome
```

Prefer Chrome. The bundled module uses the `playwright-core` library included with `@playwright/cli` to start a localhost-only headless Chrome worker, deliberately bypassing Playwright CLI's detached daemon. The first standalone capture starts the worker; subsequent captures within its five-minute idle window reuse the Chrome process but create a fresh incognito context and page. The worker accepts authenticated local requests only, keeps the Composition API token out of arguments and worker state, and exits automatically after the idle window. Do not substitute Chromium unless Chrome is unavailable and the user approves the fallback.

The headless browser must be able to reach the preview endpoint and the external origins used by that preview, including its CDN bootstrap dependencies and any data or asset URLs required by the composition script. In a restricted browser-network context, the outer preview page can fail before attaching `#SingularPlayer` and surface as `PREVIEW_FRAME_NOT_FOUND`. Re-run the same supported command from a network-enabled execution context before treating that error as a renderer defect; do not substitute an editor-tab screenshot as proof.

## Standalone capture

The unified command runs `inspect` internally. For direct legacy-script use, run `inspect` first and read its `preview` object:

```json
{
  "preview": {
    "endpoint": "http://localhost:3000",
    "compositionToken": "<composition-api-token>",
    "width": 1920,
    "height": 1080
  }
}
```

Capture the full live composition preview:

```bash
node scripts/capture-composition-preview.js <endpoint> <width> <height> <composition-token> <output-path> [--measurements <path.json>] [--wait-mode <smart|timed>] [--delay <seconds>] [--timeout <seconds>] [--timeline <In|Out> --at <seconds>] [--json]
```

Capture a paused root Timeline frame, for example halfway through `In`:

```bash
node scripts/composer-agent.js capture --target root --timeline In --at 0.5 --output <path.png>
```

Timeline-position capture deliberately excludes widget-owned active compositions, timed mode, continuous Behavior time, script timers, and video clocks. A paused root Timeline frame includes timeline-aware widget seek callbacks and linked descendants. An ordinary active composition uses the Player composition seek path. Neither form freezes independent runtime clocks.

Capture one isolated sub-composition at the same resolution:

```bash
node scripts/capture-composition-preview.js <endpoint> <width> <height> <composition-token> <output-path> --composition-id <composition-id> [--wait-mode <smart|timed>] [--delay <seconds>] [--timeout <seconds>] [--json]
```

For direct debugging of a widget-owned composition, also pass its owning tile ID:

```bash
node scripts/capture-composition-preview.js <endpoint> <width> <height> <composition-token> <output-path> --composition-id <composition-id> --widget-tile-id <widget-tile-id> [--wait-mode <smart|timed>] [--delay <seconds>] [--timeout <seconds>] [--json]
```

The token is the composition's public **Composition API Token**, not the Composer-agent access token. If `compositionToken` is empty, ask the user to generate one in Composer's composition properties, then inspect again. Do not print, quote, or share either token unnecessarily.

The legacy executable keeps its one-second `--delay` default for compatibility and maps that delay to post-readiness settling. Its wait mode defaults to `smart`. `--json` emits the same structured metadata as the unified command. By default it captures `.onair-renderer.root-onair` from the `SingularPlayer` iframe. With `--composition-id`, it targets `#onair<composition-id>`, temporarily hides sibling DOM branches, waits for deterministic readiness, and captures the isolated full-canvas renderer. With both composition and widget tile IDs, it instead finds the owning widget iframe and captures the best visible matching `.composition-instance` renderer.

### Capture measurement snapshot

Add `--measurements <path.json>` when Browser-owned or standalone capture must answer a concrete layout question:

```bash
node scripts/composer-agent.js prepare-capture --target root --measurements <path.measurements.json>
node scripts/composer-agent.js capture --target root --output <path.png> --measurements <path.measurements.json>
```

Browser preparation samples the ready editor renderer before returning control for its screenshot; standalone samples the already-ready private Player target immediately before taking the PNG. Neither path opens another page merely for measurement. Version 1 uses capture-target coordinates and contains the target dimensions plus up to 500 Singular group, widget, and sub-composition wrappers. Each element records its runtime ID, name, type, composition identity, pixel and percentage bounds, visible clipped bounds, visibility, opacity, transform, z-index, and transformed quad when the browser exposes it. Widget entries additionally record text length and rendered line count, bounded image geometry without image URLs, and SVG/canvas counts. Names are limited to 200 characters, images to ten per widget, and the complete file to 1 MB. The summary reports the measured and total element counts and whether truncation occurred.

The snapshot contains no text values, image URLs, DOM dump, script text, event payload, token, or preview URL. Runtime IDs plus composition identity disambiguate repeated elements. `summary.contentBounds` and `contentBoundsPercent` union the visible bounds of measured non-group elements so full-canvas structural groups do not hide the actual foreground extent; `contentBoundsTruncated` is true when the element cap prevents that union from being complete. `summary.imageStatus` reports total, measured, loaded, failed, and pending image counts plus truncation. Each bounded image item reports `status` (`loaded`, `failed`, or `pending`) and a sanitized failure reason without its source URL or raw browser error. Standalone request tracking can additionally report safe HTTP/network/decode variants and an optional numeric status; Browser preparation reports the editor's locally observable missing-source or zero-intrinsic-size state. Iframe-backed widget internals remain opaque in version 1; their Singular wrapper is still measured, while internally rendered text or images may not appear in the widget detail fields.

In smart mode—including an explicitly sought Timeline position—the target has passed visual stability before measurement. In timed mode, the snapshot is sampled immediately before the screenshot, but continuous Behavior, script, timer, video, or live-data clocks are not frozen and can advance between those two browser operations. Use the snapshot for geometry and clipping evidence; use the PNG for glyph rendering, filters, gradients, shadows, canvas pixels, video content, and overall visual comparison.

Write output to the session artifacts directory when one is available.

### Choosing a wait mode and delay

Use `smart` when the target is script-free and its intended Singular Timeline animations are finite. It normally avoids the former unconditional two-second quiet wait: once downloads, scripts, payload propagation, fonts, images, finite timelines, and 350 ms of visual stability complete, capture proceeds.

Use `timed` when the target has any known persisted composition, global, or overlay script; continuous Behavior; Bodymovin Loop; a ticker; timer; polling; live data; video; or another output that may never become visually still. Also use it when script presence cannot be ruled out. Choose `--settle` from the intended capture moment rather than increasing the overall timeout. The unified command defaults timed settling to two seconds; specify a different bounded value when the script or data contract requires one.

Use a fresh timed Browser preparation for one sampled state of continuous output. When the acceptance question requires more than one frame, use a separate restored preparation for each bounded sample; use standalone timed capture when private Player isolation is preferable, and use the Player-verification workflow when the frame sequence must prove composition-script or runtime behavior. Never treat one Browser screenshot as timing evidence by itself.

When starting from a paired workflow and script presence is unknown, pipe `script-handoff` to the bundled composition-script helper's read-only `list-scripts` path. Because that endpoint can be empty even when a composition script is readable, probe the suggested active/root script target when necessary. Do not expose script text or move script inspection into the paired relay. If smart mode reports ongoing timeline or visual activity, inspect the target and retry once with timed mode; do not make a continuously moving composition satisfy smart mode by extending `--timeout`.

### Temporal evidence for animated and live output

For continuous animation, clocks, timers, tickers, video, polling, and live data, the acceptance target is a behavior over time rather than one globally stable frame. Timed readiness proves that lifecycle and resources reached a sampleable state; it does not prove that the chosen instant is representative or that a screenshot backend did not sample during a compositor update.

Define the invariant before sampling—for example, a clock always presents one complete formatted value while its seconds advance, or a ticker remains clipped to its viewport while moving. Then:

1. Allow bounded warm-up until runtime/DOM evidence shows the first meaningful state. Initial blank frames before that state are readiness evidence, not automatically rendering failures.
2. When the relevant DOM or payload change can be observed, allow the browser at least two animation frames before the visual checkpoint. This is a synchronization aid, not a promise that continuous output becomes still.
3. Collect a small bounded sequence at phase-offset times appropriate to the behavior. If one sample differs sharply from the invariant, retry at a deliberately shifted offset instead of repeating the same cadence against the same update boundary.
4. Compare screenshot evidence with current runtime/DOM state, lifecycle evidence, Composer readback, and adjacent frames. Do not weaken the invariant or select only favorable frames.
5. Report `pass` when the required behavior has representative visual and semantic evidence; `fail` when the same violation persists across adjacent or phase-shifted samples beyond any intended transition, or semantic evidence also fails; and `inconclusive` when pixel and semantic evidence conflict after the bounded retry.

An isolated anomalous frame is useful diagnostic evidence but is not sufficient by itself to identify a broken link, stale identity, incorrect runtime value, or visible user-facing defect. Pausing or disabling animation can answer a static layout question, but it changes the runtime contract and cannot serve as the sole proof of animated behavior. Use the Player-verification workflow for multi-frame behavior; keep ordinary Browser preparation as a one-screenshot transaction.

## Isolating a sub-composition

For a screenshot of one sub-composition, prefer `--composition-id`. Its DOM visibility changes exist only in the temporary Playwright page, so it changes no persistent animation settings or playback states and requires no restoration.

Use state-based root capture only when the actual on-air combination of root and sub-compositions matters:

1. Inspect the relevant elements and confirm they have an effective In or Out animation.
2. Take unrelated root or sibling compositions out.
3. Take the target composition in.
4. Run the standalone script without `--composition-id`.

Taking the root composition out hides animated elements directly in the root; nested sub-compositions remain governed by their own composition states and timelines.

An `Out1` or `Out2` state is not inherently invisible. Elements whose applicable timeline effect is `none`, or whose animation otherwise leaves them visible, still render while their composition reports an Out state. If a composition is already Out when its timeline changes from `none` to a hiding animation, cycle it In and then Out before capture so the new timeline plays.

Avoid changing animation solely for a screenshot. If state-based isolation is explicitly required, snapshot and restore every changed animation and composition state.

## Capture errors

Stable error codes include `PLAYWRIGHT_UNAVAILABLE`, `BROWSER_LAUNCH_FAILED`, `PREVIEW_NAVIGATION_FAILED`, `PREVIEW_READY_TIMEOUT`, `PREVIEW_CONTINUOUS_ACTIVITY`, `PREVIEW_FRAME_NOT_FOUND`, `PREVIEW_TARGET_NOT_FOUND`, `PREVIEW_TARGET_NOT_VISIBLE`, `PREVIEW_ASSET_TIMEOUT`, `PREVIEW_TIMELINE_SEEK_FAILED`, `CAPTURE_ALREADY_PREPARED`, `CAPTURE_SESSION_MISMATCH`, `CAPTURE_ARTIFACT_EXISTS`, `CAPTURE_ARTIFACT_WRITE_FAILED`, `CAPTURE_ARTIFACT_READ_FAILED`, `CAPTURE_ARTIFACT_INVALID`, `CAPTURE_ARTIFACT_EVIDENCE_INVALID`, `CAPTURE_ARTIFACT_GEOMETRY_MISMATCH`, `CAPTURE_ARTIFACT_FORMAT_UNSUPPORTED`, `CAPTURE_ARTIFACT_DIMENSION_MISMATCH`, `CAPTURE_FAILED`, `CAPTURE_TOO_LARGE`, `MEASUREMENT_TOO_LARGE`, `MEASUREMENT_WRITE_FAILED`, `INVALID_CAPTURE_TARGET`, `INVALID_CAPTURE_WAIT_MODE`, `INVALID_CAPTURE_TIMELINE`, and `COMPOSITION_TOKEN_REQUIRED`.

There is no automatic source fallback. Playwright, Chrome, token, navigation, renderer, target, and asset failures are reported directly with the applicable code.

## Reading results

- Open every saved image with the available image-viewing tool before assessing or comparing.
- Browser-owned and standalone captures exclude Composer controls, selection boxes, and snap guides.
- Browser-owned capture lays out the canvas at the target resolution when Browser first sets the viewport to that size. Resolve the returned selector and validate its live bounds. Use an un-clipped, non-full-page viewport screenshot only when that target exactly covers the viewport and both match `editorResolution`; otherwise screenshot the verified clip. Do not use the whole browser window or trust an earlier clip without measurement. Its physical pixels may additionally reflect the returned device-pixel ratio, and the Browser backend may return JPEG or PNG bytes. Some in-app Browser screenshot backends apply host display-color conversion even when the DOM's computed colors are unchanged; use standalone capture when exact source-pixel color equality is required.
- Standalone capture uses the requested root render resolution. An isolated scene sub-composition keeps its full canvas and replaces hidden sibling content with the preview background color; a widget-owned composition uses the dimensions of the selected runtime template instance.
- A standalone measurement snapshot is structural evidence from that same ready Player page, sampled immediately before its PNG. Read `summary.truncated` before assuming every runtime element is present, and do not substitute its axis-aligned bounds for visual review of transformed, filtered, canvas, or video output.
