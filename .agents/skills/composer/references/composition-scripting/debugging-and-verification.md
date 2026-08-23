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

### Missing expected log = swallowed error

**This is the most important debugging insight for Singular scripts.**

If you see log A but the next expected log B never appears, the script hit a runtime error on the line between them. The Singular Player runtime catches script exceptions internally — they do **not** surface as `console.error` or `window.onerror`. Page-level `pageerror` listeners in Playwright also miss them because the error is caught inside the cross-origin iframe.

Mitigation: Add a `console.log()` after each suspect method call. If the log doesn't appear, that method call threw. Use `try/catch` around the suspect call to see the actual error message:

```javascript
try {
  suspectMethod(); // if this throws, you'd never know without the catch
} catch (e) {
  console.error("caught:", e.message); // now you'll see it
}
```

---

## Artifact storage convention

Any artifacts generated during debugging or verification (HTML copies, JS snippets, screenshots, log dumps, extracted JSON, etc.) must be saved to the `temp/` subfolder of the current working directory (the repository root). This keeps the workspace clean and prevents accidental commits of generated files.

The `temp/` directory is git-ignored — do not commit its contents.

## Playwright installation

The bundled verifier uses the `playwright-core` library installed with `@playwright/cli`, matching standalone capture. It can run in place; copy it to `temp/` only when a task needs custom trigger or inspection logic.

```powershell
playwright-cli --version
playwright-cli install-browser chrome
```

Copy the verify script to `temp/` and run it from there:

```powershell
node scripts/composer-agent.js script-handoff --compact |
  node scripts/verifyComposition.mjs --handoff-file -
```

You may modify the copied script as needed to tailor verification to the specific change (e.g. adding `comp.setPayload()` calls for custom payloads, adjusting `--frames` or `--interval` logic, or querying iframe DOM for widget properties). The original stays untouched.

### Screenshot output

The Playwright verification script saves frame screenshots to `temp/` by default as `frame-0.png`, `frame-1.png`, etc.

### Programmatic widget-property verification

When an AI agent cannot visually interpret screenshots, verify widget layout properties (position, size) by querying the player iframe DOM programmatically using Playwright. The player renders widgets as SVG elements inside a cross-origin iframe.

**Accessing the player iframe** — use Playwright's `page.frames().find()` which works across origins:

```js
const playerFrame = page.frames().find(f => f.url().includes('singularplayer/output'));
```

**Querying widget position and size from the iframe** — inspect SVG `rect` elements and their bounding boxes inside the player frame:

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

The bounding rectangle values are relative to the player viewport. Use these to compute percentages and confirm expected layout (e.g. "bottom edge near 720px on a 720px canvas" = positioned at bottom).

**Custom scripts**: Any custom Playwright ESM script must be placed or copied into `temp/`. The script finds Playwright in `temp/node_modules/` via ESM upward resolution. You may modify copied scripts as needed to tailor verification logic.

```powershell
node temp/my-custom-verify.mjs   # finds playwright in temp/node_modules/
```

## Verification workflow

### Automated verification with Playwright

Use `scripts/verifyComposition.mjs` for headless visual verification after writing a script. It loads the composition via the player SDK, takes screenshots, and dumps the iframe DOM summary plus console logs — the agent interprets the results.

1. Pipe a fresh paired handoff into the copied verification script:
   ```sh
   node scripts/composer-agent.js script-handoff --compact |
     node temp/verifyComposition.mjs --handoff-file -
   ```

2. The script outputs:
   - Frame screenshots saved to `temp/` (e.g. `temp/frame-0.png`, `temp/frame-1.png`)
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
   - `--capture-mode target|page` — capture the Player renderer (`target`, default) or retain the old full-page path for boundary diagnosis
   - `--fresh-page-per-frame` — reload the Player in a new isolated page for every sampled frame; diagnostic only because initialization restarts each time
   - `--disable-gpu` — launch Chrome with GPU acceleration disabled to isolate compositor behavior; diagnostic only
   - `--report PATH` — sanitized JSON report path (default: `<out>/verification-report.json`)
   - `--integrity-file PATH` — optional version-1 deterministic pixel-region assertions; a failure exits nonzero
   - `--no-headless` — show the browser window for debugging

   The verifier creates the host page in memory from the handoff and sets `window.__compositionLoaded = true` after load. It does not write either handoff credential to an HTML file. It waits for two animation frames before each image and screenshots `.onair-renderer.root-onair` directly by default so the artifact represents the complete Player target rather than the host page.

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

**Prerequisite**: `playwright` must be installed. See the [Playwright installation](#playwright-installation) section above.

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

Use this canonical composition-script pattern:

```javascript
comp.addListener('payload_changed', function(event, msg, propagationEvent) {
  if (msg.compositionId !== comp.id) return;
  var payload = comp.getPayload2();
  // React to the authoritative current payload here.
  propagationEvent.stopPropagation();
});
```

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

