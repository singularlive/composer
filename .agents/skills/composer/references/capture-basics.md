# Capture basics and troubleshooting

Use standalone capture when a rendered image will answer a visual question that Composer model readback cannot. Use the Player-verification workflow when the question requires an authoritative runtime sequence or script behavior.

Before every capture, identify the unresolved visual question. Use model readback instead for names, IDs, hierarchy, stored values, animation configuration, Control Node links, Table rows/options, and other state the CLI can verify authoritatively. Capture a baseline only when the existing appearance must be preserved or compared, a supplied reference needs before/after evidence, or a rendering defect is being diagnosed. After `inspect` confirms that the requested target is structurally empty and no before/after preservation is required, skip the command and report `baseline: { "status": "baseline-not-applicable", "reason": "empty-target" }`; this is a workflow result, not a renderer error. Skip baselines for other disposable compositions and nonvisual work as well. A non-empty target that fails to attach or render still returns its normal capture error. Batch related mutations before capturing and never recapture output that has not materially changed.

The capture budget in [authoring-quality.md](authoring-quality.md) is authoritative. This reference does not define a second numeric budget: classify each successful image as refinement or required verification, name the unresolved visual question before every refinement capture, and stop under that standard's limits and early-termination rules. Failed captures and unchanged output are handled there as well.

Standalone is the unified CLI capture path. It uses a private headless Chrome worker and never changes the user's active tab. The worker stays warm for five minutes after a capture so later standalone commands avoid another Chrome launch, while every capture uses and closes a fresh isolated browser context.

## Unified capture command

```bash
node scripts/composer-agent.js capture \
  --target <root|active> \
  [--composition-id <ordinary-composition-id>] \
  [--template-session <token>] \
  [--wait-mode <smart|timed>] \
  [--timeline <In|Out> --at <seconds>] \
  [--measurements <path.json>] \
  --timeout 30 \
  --settle 0 \
  [--server <url>] \
  --output <path.png>
```

- `--target` defaults to `root`. `active` captures the active scene or widget-owned sub-composition when one is open and otherwise resolves to root. An active widget-owned target requires the current opaque `--template-session <token>` from full `inspect` or `open-widget-subcomposition`; missing or stale tokens fail before Player startup.
- `--composition-id` directly selects an ordinary composition and implies `--target active`; it cannot be combined with explicit `--target root`. The full root Player remains loaded, so root and parent scripts, transforms, and clipping stay in effect while sibling visuals are isolated only in the private capture page.
- `--wait-mode` defaults to `smart`. `smart` waits for finite Singular timelines and a short target-scoped visual quiet window. `timed` waits for core lifecycle and assets, then captures after `--settle` without requiring the output to stop moving.
- `--timeline` and `--at` capture an exact paused position of the root or an ordinary active composition's `In` or `Out` timeline. They must be supplied together, require `smart` mode, do not support widget-owned active compositions, and reject positions beyond the selected timeline duration instead of silently clamping them.
- Choose the target that owns the operator-facing timeline. For a root-level module with linked nested presentations, open that module and use `--target active`; `--target root` seeks the scene root only. An intentionally unlinked root-level module does not contribute its nested duration to the root, so a zero-second root timeline is valid and means the verification target is wrong, not that the nested animation is absent.
- `--measurements` writes an optional version-1 Player measurement snapshot immediately before the screenshot. Use it for a named geometry question, not as a default sidecar for every capture.
- `--timeout` is the overall renderer-readiness deadline in seconds and defaults to `30`.
- `--settle` adds a non-negative delay after core readiness. It defaults to `0` in `smart` mode and `2` seconds in `timed` mode.
- `--server` is optional and must normalize to the server stored in the paired credentials. It supports environment-explicit invocations but cannot retarget an existing access token; a mismatch fails with `CAPTURE_SERVER_MISMATCH` and requires pairing with the intended server.
- `standalone` runs `inspect` internally, keeps the Composition API token in the CLI process, and captures at the reported composition resolution.

Successful output contains the absolute path, source and target, PNG dimensions and byte size, composition identity, editor resolution, and readiness metadata. When requested, `measurements` adds the absolute JSON path, schema version, measured element count, truncation state, and byte size. The retained `fallback` field is always `null`. Output never contains a token, preview URL, data URL, browser command line, or raw browser error.

Standalone core readiness requires a visible positive target box; target-owned DownloadStore cycles to finish; composition-script evaluation to reach `ok` or `error`; a short payload/resource quiet period; loaded fonts; decoded target images; and completed or failed CSS background assets. The listener is injected before navigation into every frame, so events emitted by nested widget frames can be collected from their immediate parents. All gates share the one caller-provided deadline.

In `smart` mode, standalone additionally waits until Singular's finite In/Out timelines are inactive and no timeline reports an unfinished transition, then requires 350 ms of unchanged target-scoped visual state. For a requested timeline position, it first lets that normal finite-timeline gate complete, seeks the existing runtime, verifies the exact paused time, and applies the same visual-stability check without requiring the intentionally incomplete timeline to finish again. Root capture uses Composer's phase-aware runtime timeline-position path, preserving linked descendants and timeline-aware widget callbacks. Ordinary active capture uses the frame-local composition timeline API for every matching runtime owner and confirms that an instance reached the selected timeline position before capture. The sample hashes text content, relevant HTML/SVG attributes, computed visibility, opacity, transforms, backgrounds, fonts, bounds, resources, and the complete target-owned Playwright frame tree. This targets Singular timelines specifically; it does not use global `TweenMax.getAllTweens()`, which cannot distinguish finite timeline motion from continuous Behavior or script tweens. If visual changes continue for three seconds after the finite-timeline gate, capture fails early with `PREVIEW_CONTINUOUS_ACTIVITY` and directs the caller to timed mode instead of consuming the complete overall timeout. Canvas presence is reported in readiness metadata, but canvas pixels are not used as proof of stability.

In `timed` mode, capture performs its resource gates, waits `--settle`, rechecks resources, then samples one visible state without requiring timelines or rendered output to become still. Standalone bootstraps from either the preview-ready console signal or an attached `#SingularPlayer` iframe. The iframe is resolved from the element itself, with its stable `/singularplayer/output` URL and top-level child-frame relationship as compatibility fallbacks, rather than assuming its `name` attribute matches its ID. For a widget-owned active composition, capture enters the owning widget iframe and selects the visually active runtime instance of the template. Empty compositions are valid; readiness does not require text or descendants.

For a finite animation-gated composition whose desired result is a settled Timeline frame, prefer `smart --timeline <In|Out> --at <seconds>` over `timed`. Timed mode is for continuously changing output and still requires core Player, script, and resource readiness; increasing `--settle` cannot repair a composition that never reaches those gates. If timed mode returns `PREVIEW_READY_TIMEOUT`, inspect the reported readiness gate and retry with smart Timeline positioning only when the target is finite and seekable.

Readiness metadata includes the selected wait mode, lifecycle event counts and wait duration, script-error count, payload activity, per-resource gate durations, inspected timeline counts and wait duration in smart mode, stability resets/quiet duration, canvas count, image counts, and the requested settle time. `imageGateComplete` reports that every image reached loaded or failed terminal state and any decodable image completed its decode gate. `allImagesLoaded` is true only when the final target sample has no failed or pending images, while `imageStatus` contains the loaded, failed, and pending counts. The retained `imagesReady` field is a backward-compatible alias for gate completion and does not by itself prove successful image rendering. Readiness never contains script text, event payloads, tokens, image URLs, or preview URLs.

## Standalone prerequisites

```bash
node scripts/dependency-preflight.js --capture
```

If the check fails, install the exact locked dependencies through the target environment's normal Node dependency workflow and rerun it. Standalone capture launches the target machine's installed Google Chrome through Playwright's `chrome` channel; it does not require `@playwright/cli` or a Playwright-managed browser download. If Chrome is unavailable from its standard system location, report the missing prerequisite before capture.

The bundled module uses `playwright-core` directly to start a localhost-only headless Chrome worker. It always creates isolated automation state and never opens the user's normal Chrome profile. The first standalone capture starts the worker; subsequent captures within its five-minute idle window reuse the Chrome process but create a fresh incognito context and page. The worker accepts authenticated local requests only, keeps the Composition API token out of arguments and worker state, and exits automatically after the idle window.

Use local worker controls when capture recovery is needed:

```bash
node scripts/composer-agent.js capture-worker status
node scripts/composer-agent.js capture-worker stop
node scripts/composer-agent.js capture-worker reset
```

`status` never starts Chrome and reports only `stopped`, `idle`, `capturing`, or `unreachable`, plus worker version and idle timeout when available. `stop` asks the authenticated localhost worker to exit; `reset` additionally clears stale state so the next capture starts fresh. Neither command reads Composer credentials. Stop/reset refuse with `CAPTURE_WORKER_BUSY` during an active capture; wait for `idle` rather than interrupting an in-flight request. Output never includes PID, port, secret, or filesystem path.

The headless browser must be able to reach the preview endpoint and the external origins used by that preview, including its CDN bootstrap dependencies and any data or asset URLs required by the composition script. In a restricted browser-network context, the outer preview page can fail before attaching `#SingularPlayer` and surface as `PREVIEW_FRAME_NOT_FOUND`. Re-run the same supported command from a network-enabled execution context before treating that error as a renderer defect.

## Capture errors

Stable error codes include `PLAYWRIGHT_UNAVAILABLE`, `BROWSER_LAUNCH_FAILED`, `PREVIEW_NAVIGATION_FAILED`, `PREVIEW_READY_TIMEOUT`, `PREVIEW_CONTINUOUS_ACTIVITY`, `PREVIEW_FRAME_NOT_FOUND`, `PREVIEW_TARGET_NOT_FOUND`, `PREVIEW_TARGET_NOT_VISIBLE`, `PREVIEW_ASSET_TIMEOUT`, `PREVIEW_TIMELINE_SEEK_FAILED`, `CAPTURE_FAILED`, `CAPTURE_TOO_LARGE`, `MEASUREMENT_TOO_LARGE`, `MEASUREMENT_WRITE_FAILED`, `INVALID_CAPTURE_TARGET`, `INVALID_CAPTURE_WAIT_MODE`, `INVALID_CAPTURE_TIMELINE`, and `COMPOSITION_TOKEN_REQUIRED`.

Playwright, Chrome, token, navigation, renderer, target, and asset failures are reported directly with the applicable code.

## Reading results

- Open every saved image with the available image-viewing tool before assessing or comparing.
- Captures exclude Composer controls, selection boxes, and snap guides.
- Standalone capture uses the requested root render resolution. An isolated scene sub-composition keeps its full canvas and replaces hidden sibling content with the preview background color; a widget-owned composition uses the dimensions of the selected runtime template instance.
- A standalone measurement snapshot is structural evidence from that same ready Player page, sampled immediately before its PNG. Read `summary.truncated` before assuming every runtime element is present, and do not substitute its axis-aligned bounds for visual review of transformed, filtered, canvas, or video output.
