# Debugging and Verification

This document covers debugging techniques and Player verification for the paired composition-script phase. The entry workflow is [../composition-scripts.md](../composition-scripts.md).

---

## Debugging ladder

When a visual script change does not appear to work, debug in this order:

1. Add a small `console.log(...)` in `init()` to confirm the script is running at all.
2. Add a second `console.log(...)` inside the listener, timer, or branch that is supposed to drive the visible change.
3. Replace subtle visual changes with an obvious temporary sanity check:
   - for text widgets, toggle `widget.setPayload({ text: "..." })` versus `widget.setPayload({ text: "" })`
   - for payload-driven widgets, temporarily write a hardcoded visible value before restoring dynamic logic
4. If the obvious content change works but the intended transform does not, re-check whether the target property should be driven by a dedicated widget method or by widget payload.
5. Only after that, suspect control-node wiring, event propagation, or player-side triggering.

### Safe diagnostics

Never append diagnostic nodes to `document.body`, the Composer editor DOM, or a widget outside its owned runtime root. Never install a diagnostic composition script that injects an overlay into the Player page. Those nodes can outlive a definition or script swap and obstruct the operator until a full editor reload.

Prefer existing lifecycle counters, target bounds, capture measurements, DOM hashes, pixel assertions, and the bounded message probe below. If a visual probe is genuinely necessary, use a throwaway standalone `capture` page and remove the probe in the same turn. Do not use the live editor surface as diagnostic output.

### Missing expected log may indicate a caught error

**This is the most important debugging insight for Singular scripts.**

If log A appears but expected log B does not, first confirm that the branch actually ran and that log collection is active. A caught runtime exception is one possible cause, not proof from the missing log alone. The Singular Player runtime catches script exceptions internally; they need not surface as `console.error`, `window.onerror`, or Playwright `pageerror`. Inspect the bundled verifier's `runtime.scriptEvents.error` count first. A custom sanitized harness is still needed for attribution to a particular script or call.

Mitigation: Use static diagnostic labels after suspect calls and `try/catch` to distinguish a thrown call from skipped control flow. Do not log raw errors or payload values:

```javascript
try {
  suspectMethod(); // if this throws, you'd never know without the catch
} catch (error) {
  console.error("Suspect call failed");
}
```

---

## Artifact storage convention

Use the unique writable task-temporary directory defined in [commands.md](../commands.md) for working harnesses, scenarios, screenshots, and sanitized diagnostics. Pass `--out <task-dir>` and explicit scenario/report paths; the default `./temp` is not a required or necessarily ignored workspace folder. Remove scratch files after success or failure, retaining only requested deliverables or the selected final visual artifact separately. Keep handoffs and credentials in memory throughout.

## Playwright installation

The bundled verifier uses `playwright-core@1.63.0` directly, matching standalone capture. Run it in place. Put scenarios and any genuinely custom harness in the task-temporary directory; do not copy the verifier for behavior its declarative scenario contract already supports.

```powershell
node scripts/dependency-preflight.js --capture
```

If the Playwright check fails, reinstall the complete Composer skill; the exact locked `playwright-core` payload is required and vendored under `scripts/vendor`. The verifier launches the target machine's installed Google Chrome through Playwright's `chrome` channel and does not require `@playwright/cli` or a Playwright-managed browser download. If Chrome is unavailable from its standard system location, report the missing prerequisite.

Run the bundled verifier from its repository location:

```powershell
node scripts/composer-agent.js script-handoff --pipe --compact |
  node scripts/verifyComposition.mjs --handoff-file - --out <task-dir>
```

Prefer a version-1 `--scenario-file` for supported payload, message, state, lifecycle, DOM, bounds, and checkpoint behavior. Create a separate custom harness in the task-temporary directory only when the required external trigger or assertion is outside that bounded contract. Keep the bundled verifier untouched.

The verifier rejects empty/whitespace handoff input with `SCRIPT_HANDOFF_EMPTY` before loading Playwright or launching a browser. Check the producer's exit status, stderr, connection and readiness; never diagnose this as a Player failure or reuse a cached handoff. Malformed JSON reports `SCRIPT_HANDOFF_INVALID_JSON` without parser excerpts; `SCRIPT_HANDOFF_PREVIEW`, `SCRIPT_HANDOFF_INVALID` and `SCRIPT_HANDOFF_READ_FAILED` distinguish preview-only, invalid-contract and unreadable input. Keep stderr separate from credential-only stdout and use a fresh direct pipe after resolving the producer failure. These preflight failures exit nonzero with one sanitized diagnostic, not a runtime report or stack trace.

### Custom browser lifecycle verification

The version-1 scenario contract has no browser visibility, freeze or resume action. Its SDK lifecycle counters are not browser document lifecycle counters. Use a bounded task-temporary custom harness only when the requested verification needs that trigger; do not add browser actions, network recovery algorithms or broad renderer QA as part of a retrospective guidance task.

1. Establish the intended Player document/frame and a ready baseline before triggering anything. Record document continuity without raw URLs or identifiers; a replacement document is not same-instance recovery.
2. Register observers before dispatch and snapshot baseline counters. Define the exact expected browser events/state transitions for the requested scenario, their order and a bounded observation deadline. Successful Chrome lifecycle-command dispatch proves transport acceptance only, not suspension or event delivery to the Player document.
3. Require positive delivered-event deltas and the matching document state before advancing to recovery assertions. Zero delivered lifecycle events cannot establish successful suspension coverage. A hidden state alone does not prove a freeze; hidden, frozen, resumed and discarded/reloaded are different scenarios. Use an appropriate browser-state observation for the claimed scenario, not only an event name.
4. Label manually dispatched visibility/lifecycle events as simulated even with a real Player and feed. Synthetic events do not establish real browser suspension, throttling or reproduction of the user's background-tab failure. Do not set a report to real suspension merely because a browser command returned success.
5. Verify recovery stages separately: recovery path entry, transport/subscription establishment, fresh data receipt and rendered recovery. Another subscription alone is not fresh data, a lifecycle event is not LIVE output, and a readable capture is not proof of the initiating browser transition. Use bounded counters and target-scoped state/visual evidence, not raw market payloads.
6. Retain the failing stage and category on every failure, including setup and cleanup, then remove owned observers/timers and close the private harness. Preserve a primary failure if cleanup also fails. Report deterministic fixtures, simulated-event Player checks, real lifecycle coverage and exact-symptom reproduction separately; unverified triggers remain unverified even when later output recovers.

Use fixed allowlists for stages (`setup`, `trigger-dispatch`, `trigger-delivery`, `recovery-entry`, `transport`, `fresh-data`, `rendered-state`, `cleanup`) and categories (`not-observed`, `timeout`, `transport-failed`, `assertion-failed`, `cleanup-failed`, `unknown`). Map caught errors to those categories locally; unknown errors stay `unknown`, never their raw message, stack or browser response. Serialize only those fields, a declared trigger mode, booleans and bounded nonnegative counter deltas. Do not log credentials, handoffs, raw URLs, payloads, script text or document identifiers. Keep producer stderr visible and separate from handoff stdout.

Illustrative sanitized failure record, not a new bundled report schema or scenario action:

```json
{
  "status": "failed",
  "stage": "trigger-delivery",
  "category": "not-observed",
  "triggerMode": "browser-lifecycle",
  "dispatchAcknowledged": true,
  "deliveredEventDelta": 0,
  "suspensionCoverage": "unverified"
}
```

For a synthetic test, use `triggerMode: "simulated-events"` and retain `suspensionCoverage: "unverified"` even if every recovery assertion passes. Example completion: "One running Player recovered after simulated hidden/visible events, opened a new subscription, received fresh snapshots and returned to LIVE. Actual browser suspension and the original background-tab failure were not reproduced." Use that wording only for evidence actually observed; no original overlay or external feed is required for skill contract checks.

### Evidence-specific completion

Never say only "verified both settings". Identify each evidence layer and its limits:

- **Model verification:** inspected source type/value/metadata, container membership and every resolved target link; this is not rendered or interactive proof.
- **Script persistence:** dedicated helper readback matched submitted script text with explicit UTF-8 decoding. This proves script text persistence, not persistence of colors applied later by runtime code, successful initialization or Control App synchronization.
- **Captured appearance:** named values and images, including whether each capture loaded a separate Player. Separate 100/0 captures prove sampled endpoint appearances only, not intermediate values or propagation after initialization.
- **Live payload propagation:** one initialized Player and the same running composition receive subsequent source changes without reload. Check every intended target at 100, an intermediate value such as 40, and 0, then restore the initial value. A payload event alone or a whole-frame difference cannot prove every target updated correctly. See the [opacity scenario](../recipes/opacity-slider.md#persistent-player-scenario).
- **Control App testing:** separately identify the app/extract, slider presentation and operation, and actual output delivery. Player `setPayload` is not dragging the Control App slider. Report this layer as untested unless it was exercised.

For background recovery, follow [custom lifecycle verification](#custom-browser-lifecycle-verification): separate simulated trigger delivery, transport, fresh data and rendered recovery from real browser suspension. A successful recovery test with an unverified initiating trigger does not reproduce the user's reported failure.

For palettes, name the [selected preset mechanism](../control-node-commands.md#choose-a-preset-mechanism), key mapping and write authority. Cross-check the [output-iframe `comp.setPayload()` limitation](singular-scripting-doc.md#reading-and-writing-payload): private Player palette switching and a manual override do not prove Control App picker synchronization, saved runtime-applied colors, override survival across later events, or refresh after editing the external palette file. Mark each unexercised behavior as unverified, not a product defect. Identify captures taken during ordinary content transitions rather than presenting them as settled-state comparisons.

Example completion wording for supplied retrospective evidence, not a new verification claim: "Model checks confirmed container membership, labels, preserved control identities and values, and Selection metadata. UTF-8 script readback matched. Private Player checks passed five palettes across fourteen color roles, repeated selection changes, font preservation and a manual override. Captures sampled rendered presets; some included content transitions. Actual Control App operation, picker synchronization, persistence of runtime-applied colors and external-file refresh remain unverified." Report only the evidence actually available; this example is not a required graphic QA matrix.

Report asset failures independently, including their count and whether attribution is established. Do not attribute pre-existing or unexplained failed images to a control edit. Isolated production-method and simulated SDK fixtures must be labeled as such, not called full Player verification. Restore saved values/scope and release any acquired lease; scenario-local restoration is not saved-model restoration.

Review verification screenshots for obvious unrelated regressions, including palette changes, missing artwork and clipping. Report them without silently expanding the repair scope. A workaround that repairs the current appearance is not a root-cause repair or proof that future preset selections work. Structural revision totals cannot prove individual values, links or script contents unchanged; use supported property-level evidence or explicitly leave that comparison unresolved.

### Operator-only panel verification

Use an authorized Control App and its actual preview for this check, not an output Player substituted for that host. Preserve the graphic's look, feed controls/wiring and saved presentation state. Establish protected-region bounds and a visible baseline with controlled inputs so unrelated live score/clock changes do not masquerade as occlusion. Use only sanitized fixtures; do not capture credentials, private feed data or identifiers.

1. Read back the saved panel bounds, sibling order, clipping, hidden default, control links and host-specific visibility rule. This proves model structure only, not rendered visibility or host gating.
2. Update the managed composition extract through the supported app workflow, reload the tested Control App/output to load that extract, and establish the intended visible program state. A saved definition or script write alone does not update an already-running extract.
3. In that same Control App, operate the actual control off/on/off. In both states, verify the protected graphic remains visible and unobscured; with the panel enabled, verify the panel itself renders in its allowed region. Check opaque backgrounds, overlap and clipping, including meaningful transition frames when applicable. Use target-scoped region assertions and visual review; unchanged visibility flags or whole-frame differences are insufficient.
4. Separately exercise the enabled control in the output Player and require panel absence while the protected graphic remains visible. Testing output only with the control disabled does not prove the exclusion rule. Exercise any other explicitly permitted host separately; do not infer Composition Script Editor behavior from Control App behavior.
5. Restore test values and any authorized saved state changes. Report saved-model geometry, output Player evidence and actual Control App behavior separately, including which extract was loaded and whether the actual toggle was exercised. If no authorized Control App is available, mark that acceptance pending; a synthetic fixture or private Player payload test cannot substitute for it.

Record script-error counts before and after each tested state, and report unexplained errors without attributing them to the panel or its layout correction. Existing errors do not disappear from the report just because their count is unchanged. A geometric correction can be supported by readback while the reported Control App symptom remains unverified.

This is a verification procedure, not a new scenario action or automatic Control App harness. For a separately authorized reusable regression, require an opaque-overlap negative control to fail the protected-region check; a passing isolated negative-control test still does not establish actual Control App operation.

### Color interpretation diagnostics

Trace preset input -> Color control value -> linked gradient value -> rendered fill. At each available boundary, record a bounded, sanitized value/type and source ownership. Valid JSON, accepted Color inputs, gradient conversion and valid CSS output are distinct contracts. Consult the loaded widget reference: support for tinycolor2-parseable strings means bare hex cannot simply be declared invalid for the whole pipeline.

Separate fresh initialization from same-instance updates. In an authorized disposable fixture, compare equivalent bare hex, prefixed hex and RGB inputs on fresh load, live update, preset reapplication and save/reload. Start each update from a contrasting color so a retained prior fill cannot masquerade as successful parsing. Verify the applied fill as well as model readback. Locate the first divergence before proposing normalization; missing `#` and a white fallback are hypotheses, not diagnoses from screenshots. Do not rewrite shared presets to conceal a possible rendering defect. Report actual Control App palette switching separately from private Player tests, and preserve an unresolved original-overlay comparison as unresolved.

### Semantic color comparison

Compare valid colors semantically, not hex strings against Player RGBA objects. This focused harness example takes an explicitly resolved `tinycolor2` parser as its third argument; the bundled CLI's internal dependency is not a public import. Use an existing harness dependency, not a new runtime dependency or a composition script. This is comparison-only normalization: do not rewrite saved values or external palettes. Renderer gradient wrappers need their own documented solid-color extraction; they are not ordinary Color control inputs.

```javascript
function sameColor(actual, expected, tinycolor) {
  const actualColor = tinycolor(actual);
  const expectedColor = tinycolor(expected);
  if (!actualColor.isValid() || !expectedColor.isValid()) return false;
  const actualRgba = actualColor.toRgb();
  const expectedRgba = expectedColor.toRgb();
  return actualRgba.r === expectedRgba.r &&
    actualRgba.g === expectedRgba.g &&
    actualRgba.b === expectedRgba.b &&
    Math.abs(actualRgba.a - expectedRgba.a) <= 1 / 255 + Number.EPSILON;
}
```

For example, `sameColor('#336699', {r: 51, g: 102, b: 153, a: 1}, tinycolor)` must pass. Bare hex and equivalent RGBA strings may also pass when valid for the inspected boundary. Alpha tolerance is one 8-bit step to accommodate hex alpha quantization; RGB channels must match. Require contrasting RGB, materially different alpha, and invalid-input negative controls to fail. A semantic color match proves only that sampled value, not rendered pixels, saved representation, every palette role or Control App delivery.

### Explicit UTF-8 script readback

After a fresh credential-only handoff pipe to the bundled helper's `get-script` action, parse its successful JSON result and pass the returned script string to this local check. Keep helper output decoding explicitly UTF-8 in the process runner too; keep producer stderr separate and check both exit statuses. Never save or log the handoff, credentials, script text or mismatch contents. The source file may be a credential-free task-temporary script file.

```javascript
const fs = require('node:fs');

function assertUtf8ScriptReadback(sourcePath, persistedScript) {
  const submittedScript = fs.readFileSync(sourcePath, 'utf8');
  if (typeof persistedScript !== 'string' || submittedScript !== persistedScript) {
    throw new Error('UTF-8 script readback mismatch');
  }
  return true;
}
```

Compare the decoded script string, not the JSON envelope or its escaped spelling. Do not trim, normalize punctuation or silently normalize line endings. A Python harness must likewise use `Path(source_path).read_text(encoding="utf-8")` and explicit UTF-8 subprocess decoding; account for its newline translation if exact line endings matter. Include curly quotes, an en dash and accented text in a local round-trip fixture; an altered character or wrongly decoded readback must fail. Investigate local decoding before alleging server corruption. This check establishes script persistence only and does not modify the composition or external JSON.

### Countdown verification

Use one initialized Player and the existing Time Control's `timerAction` path for operator actions. Inspect the exact clock region and review its expected output; a command success, lifecycle event, checkpoint name or stable image is not proof of reaching a timer state.

1. Reset and confirm the requested beginning, for example `15:00`.
2. Start, wait across several configured display ticks and require a clock-region `assertPixelsChanged`. Confirm the displayed time decreased, for example `14:57`; change alone could be blanking or unrelated animation.
3. Pause only after progression is proven. Capture the paused display and require matching clock-region pixels after more than one tick.
4. Seed a deterministic, stopped near-end elapsed state only in the private fixture. For a 15-minute countdown, 898000 elapsed milliseconds should display `00:02`; confirm that output before resuming with `timerAction`.
5. Resume, require progression from the near-end capture, then confirm `00:00`. Only after confirming zero, compare later captures to prove clamping and hold. Use independently seeded, visually reviewed expected-state captures for pixel matches when the clock is absent from the parent DOM.
6. Reset and match the verified beginning. If period controls exist, exercise reset in another period and confirm the intended beginning and period label without changing their contracts.

Use target-scoped semantic output when available; otherwise use clock-region comparisons plus visual review, not page-wide text hashes. A permanently frozen `15:00` must fail the progression assertion, and frozen nonzero output must fail the zero-state check. Test that negative case in an isolated fixture before trusting a reusable scenario. Restore private fixture inputs; separately restore any authorized persistent changes and report script-error telemetry and Control App limits.

### Verify the visible contract state

Before comparing an edited element, inspect the template's required inputs and drive them to a documented state in which that element is visible. A countdown whose begin value is zero may legitimately show its end message instead of its ring. Use scenario-local `setPayload` on the correct child composition and the appropriate documented Timer/Time Control action to initialize a nonzero countdown and reset it; do not assume similarly named controls use the same command type. Do not change saved defaults, remove required controls, or bypass their script behavior just to obtain a screenshot. Assert the intended state/visibility before measuring the edit, exercise the changed value and its return to baseline, and keep initialization separate from the behavior under test. Restore any persistent state changed by a separately authorized live workflow. This proves the exercised Player payload path, not Control App or Customize-tab rendering.

### Seed change-triggered scenarios

`setPayload` setup is a real runtime change, not silent initialization. Seeding a score from its saved default can fire a celebration and mask the first checkpoints. For logic with an enable control, disable it first, seed the baseline, wait for Out and settled pixels, then enable without changing the counters. The script must update its previous-payload snapshot even while disabled/hidden; assert that enabling alone remains Out. Keep this setup separate from the increment under test. Without a suppression input, seed, wait through any triggered hold and exit, and verify a settled baseline before acting; do not claim that setup caused no trigger.

Capture steps are sequential and take time, including renderer readiness, two animation frames and screenshot transfer. A supplied session observed roughly 110-150 ms per capture; this is not a guaranteed latency. A 100 ms wait after a capture is not a checkpoint 100 ms after the last payload. Use separate freshly seeded runs for tight early checkpoints, and record actual elapsed time from payload dispatch to the sampled frame in a bounded custom harness when claiming coverage within N ms. Version 1 has no `captureAt` or built-in payload-relative capture timestamp. DOM text and state In can update behind a clipping boundary; pixel assertions in the owning parent context remain necessary.

### Responsive widget verification

Changing the composition's output resolution and changing a widget's own box are separate tests. For procedural AI Graphics, run a same-instance local sequence through full, half and quarter width at fixed height, reduced height, zero-size and restored dimensions. Measure aspect ratio, particle size, both velocity components and trajectory angle independently; a resized Canvas bitmap or a changed screenshot cannot establish those invariants. Assert bounded target population during a transition, then settled population only after the intended birth/departure fade completes. Verify observer disconnection, cancelled frames and harmless queued callbacks after destroy. Follow the [responsive particle candidate and local matrix](../recipes/responsive-particle-overlay.md).

Keep an evidence table distinguishing local runtime-host checks, installed-widget Player checks and actual Player output-resolution changes. Do not relabel a local quarter-width or height test as Player coverage. In an authorized disposable scene, use readback types for temporary tile layout changes, retain links/controls/values/animations, and compare exact final readback after restoration. The Player version-1 scenario API has no tile-layout resize action; use supported paired layout commands with separate captures, not invented scenario actions or raw model writes. Do not mutate production scenes to reproduce retrospective findings.

### Screenshot output

The verifier defaults to `./temp`; override it with `--out <task-dir>`. Frame screenshots are named `frame-0.png`, `frame-1.png`, etc.

### Programmatic widget-property verification

When an AI agent cannot visually interpret screenshots, prefer the capture command's bounded measurement snapshot for widget layout properties. For a custom Player assertion, query the exact inspected Singular wrapper or target element and use its `getBoundingClientRect()`; the Player may render widget internals as SVG inside a cross-origin iframe.

**Accessing the player iframe** — use Playwright's `page.frames().find()` which works across origins:

```js
const playerFrame = page.frames().find(f => f.url().includes('singularplayer/output'));
```

**Inspecting SVG internals from the iframe** — query SVG `rect` elements only when the requested question concerns those vector shapes:

```js
const rectInfo = await playerFrame.evaluate(() => {
  const results = [];
  const svgRects = document.querySelectorAll('rect');
  svgRects.forEach(function(r) {
    const rect = r.getBoundingClientRect();
    results.push({
      fill: r.getAttribute('fill'),
      width: r.getAttribute('width'),
      height: r.getAttribute('height'),
      x: r.getAttribute('x'),
      y: r.getAttribute('y'),
      boundingRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    });
  });
  return results;
});
```

The bounding rectangle values are relative to the player viewport, but an SVG `<rect>`'s `x`, `y`, `width`, and `height` attributes are local vector geometry. Generic `<rect>` matches do not establish their owning widget's layout or identity. Use the exact inspected wrapper or a measurement snapshot for placement claims.

**Custom scripts**: Place custom Playwright ESM harnesses in the task-temporary directory and keep them out of commits. Explicitly resolve the configured `playwright-core` dependency from the installed runtime; a scratch directory does not supply its own `node_modules`.

```powershell
node <task-dir>/my-custom-verify.mjs
```

## Verification workflow

### Automated verification with Playwright

Use `scripts/verifyComposition.mjs` for headless visual verification after writing a script. It loads the composition via the Player SDK, takes screenshots, and reports sanitized DOM summaries and console counts, not raw logs. The aggregate lifecycle `composition_script_event` counter alone cannot establish zero composition-script errors; use the separate typed script counters.

Each frame's `scriptEvents` contains page-local cumulative `total`, `eval`, `ok`, `error`, and `unknown` counts. The SDK's explicit `type` determines the bucket; missing or unrecognized types become `unknown`, never report keys. `eval` means evaluation started, `ok` means initialization succeeded, and `error` includes reported evaluation, initialization, and caught runtime failures. Counts measure events, not unique failing scripts or exceptions. No message, stack, script name/ID, source text, payload, or credential is retained in these counters.

`runtime.scriptEvents` totals the last sampled counts from every verification page, including fresh-page reloads and failed runs before screenshots. It is `null` if no counters could be read. `runtime.scriptEventsComplete` is true only when every created page has a successful final counter snapshot; otherwise totals may be partial. Frame counts reset on reload; runtime totals do not double-count repeated samples from one page. All script counts remain page-wide even when visuals and scenario actions target one composition.

These are diagnostic additions to report version 1: they do not change pass/fail status or add scenario actions. A passed report can still contain script errors. Report zero observed typed errors only for the exercised observation window when counters are complete, `error` is zero, and `unknown` is zero. Zero events do not prove initialization, successful initialization does not prove later behavior, and events after the last snapshot are outside the evidence. Unknown types or incomplete reads require reporting script-error verification as inconclusive.

1. Pipe a fresh paired handoff into the bundled verification script:
   ```sh
   node scripts/composer-agent.js script-handoff --pipe --compact |
    node scripts/verifyComposition.mjs --handoff-file - --out <task-dir>
   ```

2. The script outputs:
  - Frame screenshots saved to the explicit output directory
   - A sanitized `verification-report.json` containing renderer bounds, screenshot dimensions, DOM text length/hash, lifecycle counters, and console counts for every frame
   - Separate runtime, screenshot, and optional visual-integrity status

3. Interpret the output:
   - **Runtime changes**: compare DOM text hashes and lifecycle counters without exposing rendered text
   - **Screenshot success**: confirm every frame has the expected dimensions and byte count
   - **Visual completeness**: supply an explicit integrity file for deterministic fixtures; do not infer it for arbitrary designs
   - **Timing**: compare screenshots across frames to confirm animations or toggles at the expected intervals

4. CLI flags:
   - `--handoff-file PATH|-` — required version-1 handoff; prefer `-` so credentials stay in the pipeline
   - `--frames N` — number of screenshots (default: 3)
   - `--interval MS` — milliseconds between screenshots (default: 3000)
   - `--out DIR` — output directory for screenshots and temp files (default: `./temp` relative to cwd)
  - `--composition-id root|active|<id>` — override the handoff target with root, active, or an ordinary sub-composition ID; when omitted, the verifier inherits the handoff's active composition and falls back to root only when active-composition metadata is absent. An explicit mismatch emits a warning and records it under `diagnostics.targetWarning`.
   - `--capture-mode target|page` — capture the selected Player renderer (`target`, default) or retain the full-page path for boundary diagnosis; page mode keeps the selected scope isolated but does not crop to its bounds
   - `--fresh-page-per-frame` — reload the Player in a new isolated page for every sampled frame; diagnostic only because initialization restarts each time
   - `--disable-gpu` — launch Chrome with GPU acceleration disabled to isolate compositor behavior; diagnostic only
   - `--report PATH` — sanitized JSON report path (default: `<out>/verification-report.json`)
   - `--scenario-file PATH` — optional version-1 declarative Player verification scenario
   - `--integrity-file PATH` — optional version-1 deterministic pixel-region assertions; a failure exits nonzero
   - `--no-headless` — show the browser window for debugging

  The verifier creates the host page in memory from the handoff and accepts only a successful Player load callback. It does not write either handoff credential to an HTML file. It waits for the requested SDK composition and exactly one matching renderer, then waits for two animation frames before each image. The resolved target is printed and stored in the report before scenarios are interpreted.

   For an ordinary sub-composition, unrelated sibling branches are hidden only inside the private Player page, including siblings added later. Target descendants, layout, transforms, opacity, and ancestor state are preserved. No saved composition or editor state changes. Isolation is restored when the page is replaced or closed. The verifier does **not** automatically jump the target or its ancestors to In: drive the intended states explicitly in a scenario. Parent backgrounds, clipping and transforms still affect the result.

   `active` requires active-composition metadata in a fresh handoff; active root selects root. Widget-owned templates are unsupported because they require instance-aware targeting. Missing SDK compositions or renderers fail with `PLAYER_TARGET_NOT_FOUND`; multiple matching renderers fail with `PLAYER_TARGET_AMBIGUOUS`. The verifier never falls back to root or chooses the first visible instance. Load failure, timeout and unavailable main SDK have separate `PLAYER_LOAD_FAILED`, `PLAYER_LOAD_TIMEOUT` and `PLAYER_SDK_NOT_READY` errors. The sanitized report's `target` records requested mode, resolved kind/ID, isolation and readiness status. Fresh-page sampling resolves and isolates the same target on every page.

   Verify a known ordinary sub-composition without changing the user's editor scope:

   ```sh
   node scripts/composer-agent.js script-handoff --pipe --composition-id <id> --compact |
    node scripts/verifyComposition.mjs --handoff-file - --composition-id active --scenario-file <task-dir>/scenario.json --out <task-dir>
   ```

### Declarative Player scenario

Use a scenario when runtime proof requires public Player inputs or specific checkpoints. The verifier validates the complete file before opening Player. A scenario is limited to version 1, 50 steps, 64 KiB total, 32 KiB for each payload/message/expected-state value, ten minutes of aggregate wait budget, and 60 seconds for one lifecycle, probe, or state wait.

Before diagnosing an incremental Control App update after changing an AI Graphics definition, establish each boundary separately: the new definition exists in Composer model readback; the managed app has updated to a new composition extract; the tested app/output has reloaded that extract; and only then a later Control Node payload change alters the running pixels without another reload. A page still executing the previous definition cannot test the new widget code. Do not add composition-script forwarding or enable `immediateUpdate` to compensate for a stale loaded extract.

```json
{
  "version": 1,
  "steps": [
    { "action": "capture", "name": "before" },
    { "action": "setPayload", "payload": { "Score": "2" } },
    { "action": "pressControl", "compositionId": "scoreboard", "controlId": "Confirm" },
    {
      "action": "waitForLifecycle",
      "event": "payload_changed",
      "minimum": 1,
      "timeoutMs": 3000
    },
    {
      "action": "assertDom",
      "textChangedFrom": "before",
      "minimumVisibleElementCount": 1
    },
    { "action": "jumpTo", "state": "In" },
    { "action": "waitForState", "equals": "In", "timeoutMs": 3000 },
    { "action": "capture", "name": "after" }
  ]
}
```

Run it without placing either handoff credential on disk:

```sh
node scripts/composer-agent.js script-handoff --pipe --compact |
  node scripts/verifyComposition.mjs --handoff-file - --scenario-file <task-dir>/scenario.json --out <task-dir>
```

Supported actions are:

- `wait`: bounded `milliseconds`.
- `setPayload` and `sendMessage`: call the public Player composition API with an object. Omit `compositionId` for the selected verification target (root by default), or provide an explicit SDK composition ID to override it. An override changes only that action, not capture or DOM scope.
- `pressControl`: activate one Button Control Node through the public Player payload API. Supply an explicit SDK `compositionId` and exact `controlId`; the verifier sends the native `{command:"execute"}` value internally. Use this typed action instead of constructing Button payload markers or timestamps.
- `timerAction`: operate one Time Control through the public Player payload API. Supply an explicit SDK `compositionId`, exact `controlId`, and `command` of `start`, `play`, `pause`, or `reset`; the verifier constructs the command payload internally. Use raw Time Control objects only for deliberate deterministic fixture states, never as the operator-control path.
- `playTo` and `jumpTo`: call the public Player composition API with `state`; they accept the same optional `compositionId`.
- `waitForLifecycle`: wait for an allowed lifecycle counter to reach `minimum`, with an optional `timeoutMs`.
- `assertLifecycle`: require `equals`, `minimum`, or `maximum` for one allowed lifecycle counter.
- `waitForProbe`: wait for one matching widget custom message and retain one top-level scalar from `msg.params.data`. Supply a unique `name`, the exact originating tile `sourceId`, the custom-message `event`, the requested `field`, and optional `timeoutMs`. A scenario may contain only one probe. Its value must be a finite number or a string no longer than 256 characters; the verifier stores only `{ name, value }` and never the surrounding message. Use this for a specific runtime value such as a Metric Text `bounds.widthPx`, not for general logging or payload discovery.
- `assertState`: immediately compare the selected target's cached `getState()` with the JSON value in `equals`; accepts the same optional `compositionId` override. It does not wait for state convergence. SDK `playTo`/`jumpTo` delivery is asynchronous, so use `waitForState` when the next step requires the target's state notification.
- `waitForState`: poll the selected target's `getState()` every 50 ms until it structurally equals the required JSON value in `equals`. Accepts the same optional `compositionId` override and integer `timeoutMs` from 1 to 60000 (default 10000); the full timeout counts toward the aggregate wait budget. Object key order is ignored, array order is significant, and matching never relies on sibling lifecycle events. Missing targets or SDK failures fail the step immediately; a nonmatching state waits only until the deadline. A match is one observed SDK state, not proof of sustained stability, completed animation, or rendered pixels. Expected and observed values are omitted from the report.
- `assertDom`: check a 16-character `textHash`, a text change from an earlier checkpoint, minimum element/visible-element counts, or minimum target width/height. It never exposes rendered text.
- `assertPixelsChanged`: compare two earlier named captures using `from` and `to`. An optional target-relative `region` uses `px` or `percent`; `tolerance` defaults to 8 per channel and `minimumChangedPixels` defaults to 1. The report retains only counts and bounds, never image data. Use this for canvas, SVG, cross-origin iframe, and widget-owned output that is visible in the selected target screenshot but absent from parent DOM text.
- `assertPixelsMatch`: compare two earlier named captures using the same `from`, `to`, optional `region` and per-channel `tolerance`. Pass when changed pixels do not exceed `maximumChangedPixels` (a non-negative integer, default 0). Use an independently seeded, visually reviewed expected-state capture to reject blanking, missing rows and stale values; matching two unverified blank captures proves nothing. Keep geometry, fonts, assets and unrelated output identical and settled. Calibrate any nonzero allowance explicitly; do not widen it merely to pass a failed test. Reports retain only counts and bounds. A changed-pixel assertion proves difference, not correctness: a Table that disappears can pass it.
- `capture`: save a named checkpoint. Names are unique and use up to 64 letters, digits, periods, underscores, or hyphens.

For example, after enabling `emitEvents` on an inspected Metric Text tile:

```json
{
  "action": "waitForProbe",
  "name": "headline-width",
  "sourceId": "<metric-text-tile-id>",
  "event": "bounds",
  "field": "widthPx",
  "timeoutMs": 3000
}
```

Allowed lifecycle counters are `compositionLoaded`, `message`, `state_changed`, `payload_changed`, `datanode_payload_changed`, `error`, `composition_script_event`, `download_start`, and `download_complete`. A failed action reports only its step number and action type. The sanitized report includes statuses, durations, safe counters, DOM hashes, bounds, checkpoint filenames, and at most the one explicitly requested bounded probe scalar. It never records surrounding payload/message values, expected state values, script text, rendered text, tokens, or preview URLs.

Lifecycle counters remain page-wide even with a scoped target. Use target state, DOM assertions, and bounded pixel comparisons for scope-specific proof; sibling scripts continue running. DOM sampling covers the selected renderer's same-document descendants, not the internals of child widget iframes. For a native clock or another widget-owned renderer, prefer a clock-region `assertPixelsChanged` comparison plus inspected semantic-link readback over `textChangedFrom` on the parent DOM.

The `message` lifecycle counter counts events delivered to the host Player SDK listener. It is not the count of calls to a composition script's `comp.addListener('message', ...)`. Native Control Node custom messages such as `timerChanged` can reach the composition script without being forwarded to that host listener. Therefore `assertLifecycle` or `waitForLifecycle` on `message` does not prove or disprove Timer event delivery. `waitForProbe` likewise observes host-forwarded widget messages, not arbitrary internal Control Node events. For Timer verification, filter source composition, stable keyId and event type in the supported composition script, update only an unlinked diagnostic readout, and verify its checkpoints and transition count. Do not dump event payloads or add a second writer to directly linked text. A typed Control Node assertion would require an explicitly supported runtime observation path; none is currently provided.

When a scenario contains `capture` steps, those checkpoints replace the ordinary `--frames`/`--interval` sampler, so do not combine those flags. `--fresh-page-per-frame` is also incompatible because reloading would discard the scenario state. With no `capture` step, the normal periodic sampler runs after the scenario. A supplied integrity contract applies to every resulting screenshot.

For property-change Update animation, include intermediate checkpoints rather than only settled states. Capture the old value, call `setPayload`, wait into UpdateOut, capture again near the configured UpdateIn start, then wait through the remaining duration and capture the settled value. This temporal sequence reveals simultaneous old/new glyphs and unintended blank gaps that DOM hashes and final screenshots cannot distinguish. Derive waits from the inspected Update durations and signed offset; do not reuse fixed timings from another composition.

### Optional visual-integrity contract

Use this only for deterministic fixtures whose required occupied regions are known. Coordinates are relative to the saved PNG; `unit` is `px` or `percent`. Pixels that differ from `background` by more than `tolerance` count as foreground.

```json
{
  "version": 1,
  "assertions": [{
    "name": "stable label",
    "region": { "x": 10, "y": 10, "width": 40, "height": 15, "unit": "percent" },
    "background": { "r": 0, "g": 0, "b": 0 },
    "tolerance": 8,
    "minimumForegroundPixels": 100,
    "minimumOccupiedColumns": 80,
    "minimumOccupiedRows": 12
  }]
}
```

The report records the failed frame, measured foreground pixels, occupied rows/columns, and requested thresholds. It never records either handoff credential, a preview URL, script text, rendered text, or image data.

5. **Cross-origin iframe limitation**: The player renders inside an iframe from a different origin (`alpha.singular.live`, `app.singular.live`, etc.). Note these two separate behaviors:
   - **`console.log()` calls from inside the composition script ARE captured** by Playwright's `page.on('console')` — the player SDK bridges them to the top-level page.
   - **Runtime errors / uncaught exceptions** thrown inside that iframe are **not captured** by `page.on('pageerror')`. The Singular Player runtime catches script exceptions internally and they do not surface.
   To debug errors inside the player:
   - Use `--no-headless` and open DevTools on the iframe directly, OR
   - Add explicit `console.log()` after each suspect line in the composition script, OR
   - Wrap suspect calls in `try/catch` with `console.error()` inside the catch block

**Prerequisite**: `playwright-core@1.63.0` and Google Chrome must be available. See the [Playwright installation](#playwright-installation) section above.

## Player SDK API reference

The verifier loads the Player SDK from the handoff host at `/libs/singularplayer/0.1.2/singularplayer.js`.

Useful player-level methods verified from the SDK source:

- `loadComposition(compositionId, callback)`
- `renderComposition(compositionObject, callback)`
- `renderAppOutput(appId, output, callback)`
- `getCompositionInfo()`
- `getMainComposition()`
- `getCompositionById(compId)`
- `addListener(event, callback)`
- `removeListener(event, callback)`
- `setAdaptationGlobals(data)`
- `setFrameNumber(frame)`

Useful supported player events verified from the SDK source:

- `message`
- `state_changed`
- `payload_changed`
- `datanode_payload_changed`
- `error`
- `adaptation_globals_changed`
- `composition_script_event`
- `download_start`
- `download_complete`

Useful composition-instance methods verified from the SDK source:

- `find(...)`
- `getCompositionById(subCompId)`
- `listSubcompositions()`
- `getModel()`
- `getPayload()`
- `getPayload2()`
- `getControlNode()`
- `setPayload(payload)`
- `sendMessage(message)`
- `jumpTo(state)`
- `playTo(state)`
- `seek(state)`
- `getState()`

Important distinctions:

- **Player SDK script ≠ composition script.** A composition script runs inside the player iframe and has access to the full `comp` API including `findWidget()`, widget instance methods, and direct widget payload manipulation. The player SDK runs on the host page and only communicates with the player runtime through a narrow public interface.
- The player-side composition instance returned by `player.getMainComposition()` is not the same object as the in-script `comp`. It exposes composition navigation and payload methods, but not editor-style helpers such as `findWidget()`.
- **Player SDK `setPayload()` targets only the composition's control nodes.** You cannot set a payload directly on individual widgets or sub-composition elements from the player SDK. If the composition does not expose a control node linked to a specific element's property, you cannot update that property through the player SDK — you must write a composition script to reach it (e.g. `comp.findWidget("widgetId").setPayload({...})`).
- In short: the player SDK gives you `comp.setPayload()` (composition-level control nodes), the composition script gives you `widget.setPayload()` (individual widget content), `comp.findWidget()`, layout helpers, and everything else listed in the scripting reference.

**Primary purpose of the player SDK in debugging and verification:** the player SDK is the external trigger. It drives and triggers the composition script — you push payloads from the host page to fire the script's event listeners (`payload_changed`, `state_changed`, etc.) and to drive animation state changes (`playTo`, `jumpTo`). The composition script reacts; the player SDK is how you provoke that reaction so you can visually debug and verify the result in the player.

### Triggering and verifying `payload_changed`

The `payload_changed` event fires whenever control-node values are updated. The only documented way to trigger it externally is through the **Player SDK** — there is no REST endpoint for updating composition payload via the composition token API.

**From the host page (Player SDK):**
```javascript
// 1. Get the main composition instance
var main = player.getMainComposition();

// 2. Set a control node value — this triggers payload_changed in the script
main.setPayload({ Text_Color: { r: 255, g: 0, b: 0, a: 1 } });
```

**Two levels receive the event:**

| Level | How to listen | Captured by Playwright? |
|---|---|---|
| Composition script (inside iframe) | `comp.addListener('payload_changed', cb)` | Yes (SDK bridges it) |
| Host page (top-level) | `player.addListener('payload_changed', cb)` | Yes |

**Listener callback contracts** (reconciled against `app/components/onair/OnairScript.js` and `public/libs/singularplayer/0.1.2/singularplayer.js`):

Do not conflate the composition-script API with the host-page Player SDK. They intentionally have different callback shapes:

| Level | Callback shape | `payload_changed` data |
|---|---|---|
| Composition script inside the Player iframe | `function(event, msg, propagationEvent)` | `event` is `"payload_changed"`; `msg` contains `compositionId`, `compId`, `payload`, and composition names when available; call `comp.getPayload2()` for authoritative current values. The third argument exposes `stopPropagation()`. |
| Host page using the Player SDK | `function(event, msg)` | `event` is `"payload_changed"`; `msg` contains the forwarded composition identity and payload. There is no propagation object. |

For a script that owns one composition's theme or accent behavior, use this pattern so initialization and live editor changes follow the same path:

```javascript
function applyTheme(comp) {
  var payload = comp.getPayload2() || {};
  // Apply the authoritative current values.
}

applyTheme(comp);
comp.addListener('payload_changed', function(event, msg, propagationEvent) {
  applyTheme(comp);
  propagationEvent.stopPropagation();
});
```

Do not add `if (msg.compositionId !== comp.id) return;` to that same-composition pattern. Editor-originated Control Node changes can then be filtered out, producing a control that persists but appears disconnected until reinitialization. Add an identity filter only when the listener is deliberately excluding propagated child-composition events, and verify both local and child updates in Player.

At the host level, inspect the second argument rather than treating the first event-name string as the message:

```javascript
player.addListener('payload_changed', function(event, msg) {
  console.log(msg.compositionId, msg.payload);
});
```

This source inspection corrects the earlier Playwright note that described both levels as receiving one string argument. A fresh live Player verification remains desirable when repository instructions authorize tests, but generated listeners must follow the runtime implementation above rather than the superseded note.

**Verification pattern:**
1. Add `console.log` inside the `payload_changed` listener (both comp-level and player-level)
2. Call `player.getMainComposition().setPayload({ ... })` from the host page
3. Run Playwright — it will capture the console logs from both levels
4. Confirm the expected payload values appear in the log output

**Important timing note:** The composition script's `init()` does **not** run synchronously inside the `loadComposition` callback. The callback fires first, then `init()` runs asynchronously afterward. If you call `setPayload()` immediately inside `loadComposition`, the script's `payload_changed` listener may not be registered yet. Wait for `init` console output or add a short delay before triggering payloads:

```javascript
player.loadComposition(token, function(obj) {
  console.log('Loaded — init() may not have run yet');
  // SAFE: wait a beat for init() to register listeners
  setTimeout(function() {
    player.getMainComposition().setPayload({ ... });
  }, 500);
});
```

**Important**: There is no REST endpoint at `apiv1/compositions/{token}/...` for updating payload. The separate `apiv2/controlapps/{token}/control` API exists in Singular but addresses control apps, not composition payloads — do not conflate them.

