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
node scripts/composer-agent.js script-handoff --compact |
  node scripts/verifyComposition.mjs --handoff-file - --out <task-dir>
```

Prefer a version-1 `--scenario-file` for supported payload, message, state, lifecycle, DOM, bounds, and checkpoint behavior. Create a separate custom harness in the task-temporary directory only when the required external trigger or assertion is outside that bounded contract. Keep the bundled verifier untouched.

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
   node scripts/composer-agent.js script-handoff --compact |
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
   node scripts/composer-agent.js script-handoff --composition-id <id> --compact |
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
node scripts/composer-agent.js script-handoff --compact |
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

