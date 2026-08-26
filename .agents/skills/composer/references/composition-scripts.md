# Composition-script workflow

Use this workflow when a paired Composer task requires persisted JavaScript runtime behavior. Composition scripting is a second phase of the `composer` skill, not a separate skill and not a paired-editor command.

The authorities remain separate:

- Composer owns composition structure, primitives, names, Control Nodes, links, and timelines.
- The dedicated Composition API token routes own persisted script discovery and script text, and require the unexpired scene/account-scoped agent authorization.
- `OnairScript` and the Singular Player own runtime behavior and verification.

The paired relay deliberately has no script command. Do not add script text to `graphics.apply`, write `compositionProps.scripts` through a generic update, or replace raw composition JSON.

## Source of truth by phase

| Phase | Authority | Read path |
| --- | --- | --- |
| Build or change the graphic | Open Composer model | `inspect`, `get`, `control-nodes`, and the relevant primitive schemas |
| Hand off the active composition | Open Composer model | `composer-agent.js script-handoff` |
| Discover structure outside the handoff scope | Token content JSON | helper `summary --full` with a handoff |
| Read script text | Dedicated token script endpoint | `--action get-script --script-id <id>` |
| Prove script behavior | Singular Player runtime | The bundled Playwright verifier or a customized copy |

`script-handoff` is mandatory. It packages a versioned active-scope snapshot plus the Composition API host/token, the saved agent authorization, and the active composition ID as the suggested script target. The server verifies that authorization is unexpired, has not been revoked or completed, matches the composition's scene and account, and still has an active task-level work lease before every script list/read/write request. Each request renews the same lease and editor deadline. Use `summary --full` when the requested target is global, overlay, outside the active scope, ambiguous, or requires composition-tree context absent from the handoff. Do not ask the user for a token, accept direct `--token`/`--host` operation, or use the embedded `compositionProps.scripts` blob from content JSON as the primary source of script text.

## End-to-end workflow

1. Pair, run `inspect`, and build the visual structure with `composer-agent`.
2. Put independently controlled modules in named sub-compositions. Give script-addressed widgets unambiguous names.
3. Create the intended public input surface as Control Nodes in the composition whose script consumes them. Use direct links for one-to-one property inputs and standalone controls for values the script interprets, combines, or forwards. Run `control-nodes` and verify every field and payload value, every required `dataLink` or `nodeRef`, and the intentional absence of links for standalone script inputs.
4. Capture a structural baseline only when the existing layout must be preserved or compared. Otherwise verify structure through inspection and defer the single visual capture until the coherent layout is ready. At this stage, paired/editor capture proves layout only; it does not prove composition-script behavior.
5. Run `script-handoff --compact` after the final structural readback. Composer already lazily creates the Composition API token when the editor opens, so the handoff supplies the host, composition token, and paired agent authorization automatically. Pipe it directly to the helper; do not print or persist either credential.
6. For the common active-composition case, pass the handoff to the helper and read the suggested target directly:

   ```bash
   node scripts/composer-agent.js script-handoff --compact |
     node scripts/singularTokenScriptCli.js --handoff-file - --action get-script
   ```

7. Use the handoff's `suggestedScript`, active composition structure, Control Node models, `datalinks`, and `noderefs`. If those are insufficient, pipe a fresh handoff to `--action summary --full` to discover `global`, `overlay`, root, or another sub-composition. The `/scripts` list contains only non-empty scripts, so an empty list does not mean a composition cannot accept a script.
8. Read the target script before editing. Preserve its wrapper and signatures, and use the smallest compatible whole-body write through the helper. Prefer `--script-file` for multiline content. A token write may close any currently open Composition Script Editor because the server invalidates active script-editing IDs.
9. Re-read the dedicated script endpoint after writing. A successful write is not proof that the code initialized or produced the intended output.
10. Verify in the Singular Player. Ensure `@playwright/cli` and its Chrome browser are installed, then pipe a fresh handoff to `scripts/verifyComposition.mjs --handoff-file -`. The bundled verifier runs in place against `playwright-core`; copy it to `temp/` only when the script reacts to payloads, timers, external data, messages, or animation state and needs custom trigger logic. Do not use a Composer canvas screenshot as runtime proof.
11. `composer-agent capture --wait-mode timed --settle <seconds>` opens the persisted public Player route and can provide a passive visual capture of the script result without requiring the scripted output to become still. Choose the bounded settle time from the initialization or data contract. It cannot by itself prove an event-driven path that was never triggered.
12. If verification exposes a structural problem, return to Composer, re-inspect before mutating, fix the composition or Control Node wiring, then generate a fresh handoff before editing the script again. Use a full token summary only if the repaired target falls outside the fresh active scope.

Keep the saved authorization available for follow-up structural work unless the user explicitly asks to disconnect the agent. The script phase does not become a paired-editor command merely because it belongs to the same runtime skill.

## Required references

Read [composition-scripting/singular-scripting-doc.md](composition-scripting/singular-scripting-doc.md) before relying on runtime methods, listeners, or scripting patterns; read the matching `composition-scripting/widget-*.md` file before authoring a widget payload. Use [composition-scripting/token-script-api.md](composition-scripting/token-script-api.md) for the helper and endpoint contract and [composition-scripting/debugging-and-verification.md](composition-scripting/debugging-and-verification.md) for Player verification. Never guess widget APIs or payload keys.

## Designing scriptable graphics

Follow the construction, public-control, lifecycle, and completion requirements in [authoring-quality.md](authoring-quality.md). For script-specific implementation, preserve a clear boundary between public input and derived presentation:

- Control Nodes are the externally settable contract.
- Direct links are appropriate when an input maps directly to one widget property.
- When a script interprets or combines inputs, create those inputs as standalone controls, leave the derived widget property unlinked, and have the script read `comp.getPayload2()`, find the named widget, and update it with the exact widget API in the bundled scripting references. A hidden backing widget is unnecessary.
- Keep input fields and the widgets they drive in the same sub-composition unless cross-composition behavior is intentional.
- Treat widget and composition names as runtime lookup contracts once a script uses `findWidget()` or `find()`; rename them only together with the script.

For read-only script inspection during reusable-technique extraction, follow [techniques/discovery.md](techniques/discovery.md). That workflow decides when script text is relevant and how to distill runtime behavior without turning discovery into a script write or Player-verification phase.

### Real-time text recipe

For clocks, counters, scores, and other script-driven text, use the standard Text widget first. Resolve the widget once by its stable Composer name, call `widget.setPayload({ text: value })` only when the displayed string changes, and clear the scheduled update in `close()`. Use AISVG's version-1 `text` bindings only when the changing labels are part of coordinated vector artwork or several bounded SVG bindings; AISVG is not a general replacement for editable Text.

This ES2017-compatible clock aligns its next update to the second boundary and avoids redundant writes:

```javascript
(function() {
  var timer = null;
  var clock = null;
  var lastText = null;

  function formatTime() {
    return new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Bangkok',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  function schedule() {
    var value = formatTime();
    if (value !== lastText) {
      clock.setPayload({ text: value });
      lastText = value;
    }
    timer = setTimeout(schedule, Math.max(25, 1000 - (Date.now() % 1000)));
  }

  return {
    init: function(comp) {
      clock = comp.findWidget('Clock')[0];
      if (!clock) throw new Error('Clock Text widget was not found');
      schedule();
    },
    close: function() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      clock = null;
      lastText = null;
    }
  };
})();
```

Choose the locale, time zone, and format from the user's contract; do not silently use the browser's local time zone. Verify at least five displayed changes in the Singular Player. Use the bundled verifier's target capture and an explicit `--integrity-file` when the fixture has known invariant label/value regions. Runtime/DOM success and screenshot success are separate: a changing DOM hash does not prove every captured frame is visually complete.

For a real-time NYC weather lower third, a sound split is:

1. Build a named `NYC Weather Lower Third` sub-composition with Text/Image primitives and In/Out timelines.
2. Expose stable inputs such as location, temperature, condition, icon, and updated time through Control Nodes.
3. Verify the links and baseline layout in Composer.
4. Use the scripting phase to inspect the persisted token structure and attach a root or sub-composition script that formats or fetches the weather data.
5. Verify first with deterministic mock payloads in the Player, then verify any user-approved live data source. Do not invent a weather provider, endpoint, credentials, or polling contract.
6. Clean up timers, listeners, data streams, and network activity in `close()`.

## Verification boundary

Composition scripts are installed by the Player runtime, not by the normal Composer graphic canvas. The runtime installs the global script before composition scripts and initializes child sub-compositions before the root. Use Player evidence for initialization order, listeners, widget changes, and animation calls.

Choose verification based on behavior:

- passive initial state: standalone capture with enough settle time;
- Control Node transformation: Player harness calls `setPayload()` after script `init()` and checks the visible result plus logs;
- animation control: trigger `playTo()` or `jumpTo()` and record state/timeline evidence;
- timers or live data: capture multiple bounded frames and confirm cleanup behavior;
- subtle layout changes: query rendered widget bounds inside the Player iframe.

Missing expected logs can mean the Player swallowed a script exception. Follow the bundled debugging ladder and place a log after each suspect runtime call or wrap that call in `try/catch`.

## Safety and persistence

- Treat the Composition API token and saved agent authorization as access to the persisted composition. Keep both only in the handoff pipeline; do not place either in specifications, committed files, screenshots, logs, or final responses.
- A token script write changes the persisted composition outside the paired editor command boundary. Read the target first, make one scoped change, and re-read it afterward.
- Never guess widget payload keys or script methods. Read the bundled scripting reference and the widget-specific payload reference derived from the codebase.
- Do not claim a script works from a successful `PUT`/`PATCH`, a Composer canvas view, or a single screenshot without triggering the relevant runtime path.
- Store temporary scripts, copied harnesses, logs, and screenshots only under `temp/`.

## Editing and reporting rules

- Preserve the existing IIFE wrapper and `init`/`close` signatures unless the task explicitly changes script type.
- Prefer ES5-style `var` and classic functions for compatibility, and clean up listeners, timers, intervals, and network activity in `close()`.
- Use `comp.playTo(state)` for animated transitions and `comp.jumpTo(state)` for immediate state changes. Prefer `timeline_event` evidence over `state_changed` because it captures animation start and completion.
- Use `clear-script` to disable behavior without deleting the script record.
- Report the script ID/name, relevant controls and links, the whole-body change, Player input used, observed behavior, and any remaining limitation. Never report the token.
