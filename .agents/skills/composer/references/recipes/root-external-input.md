# Root external input with descendant Mode gating

Candidate: supplied Landscape evidence and a disposable two-resolution Player fixture support root forwarding and Mode gating. The fixture used static timer-proxy text, not a UNO Timer; exact existing Timer/theme preservation and external integration remain separate gates. The completed task used UNO Essentials 518, published v56 with a null composition contract. Its resources did not document OCR. The user established root `ocrClock` and `ocrGameState` Text fields in `OCR Input`; confirm with product/Scoreboard OCR owners before applying that contract universally. Player payload tests are not a real Scoreboard OCR or `SetOverlayContentField` call.

## Authoring

Read [Integration Resources and preservation](../composition-commands.md#using-integration-resources), [Control Node scope](../control-nodes.md), [editing](../control-node-editing.md), [widget templates](../widget-subcompositions.md), and [Metric Text](../widgets/metric-text.md). Inspect before mutation and retain revision safeguards. Use a disposable scene for retrospective reproduction, not the completed user graphic.

1. Confirm the external field address, including root versus child. A pasted model's Color Palette/Layout groups or preset URLs are clues, not proof. Keep root as orchestration plus shared/integration inputs; do not put the graphic itself at root.
2. At root, create standalone `text` controls `ocrClock` (title `Clock`) and `ocrGameState` (title `Game State`) with empty-string values and no links. Use `create-control --target standalone --append` to append after existing controls, then set titles with `update-control`. Put both in one ordinary Large (`width: "double"`) `OCR Input` container. Reuse exact existing fields when appropriate; do not duplicate them or move a contract-protected field. Compare all pre-existing fields, containers, payloads and links.
3. In `Timer Bug`, append `{ "id": "ocr", "title": "OCR Input" }` to the inspected Mode Selection. Retain `clockUp`, `clockDown`, `video`, `hidden` and their existing titles/order/metadata. Do not import a reference's `clock` ID over these script dependencies. Correct a stale `resetValue: "id1"` explicitly to the valid default in the same metadata patch.
4. In each of `Timer Bug > Portrait` and `Timer Bug > Landscape`, add Metric Text named `clockOcr` to the existing `Clock Group`: `create --primitive metric-text --name clockOcr --group-id <inspected-id> --index <inspected-position>`. Place it below both timers and above the background Rectangle in the layer list. Copy `clockDown` geometry, retain center alignment, `overflow: "fitWidth"`, and no forced casing. Start hidden with empty text. The explicit group path creates no helper group.
5. Inspect the existing Timer's widget-owned digit template to identify its actual root font/color links, not just its outer tile. Prefer owner relationship summaries when sufficient; opening a template copies it on exit even for inspection. Follow the session-token and root-exit rules. Reuse the discovered root fields on each new text via `create-control --reuse-existing --source-composition root`, separately for `color` and `font`. The supplied scene used `Text Color 2` and `Font 2`; those names are not universal defaults. Preserve all existing links. Keep `clockOcr.text` unlinked.

## Root script forwarder

Read the [script workflow](../composition-scripts.md), [runtime methods](../composition-scripting/singular-scripting-doc.md), and [Metric Text payload](../composition-scripting/widget-metrictext.md). Read both persisted scripts through fresh handoffs before editing. Merge with existing init/listener/close logic; the complete example below is only for an empty root script. Root owns text, descendants own visibility. Never forward the root value into a child Control Node just to read it back.

```javascript
(function() {
  var composition = null;
  var outputs = [];
  var onPayloadChanged = null;

  function one(matches, label) {
    if (matches.length !== 1) throw new Error(label + ' must resolve exactly once');
    return matches[0];
  }

  function applyInput() {
    var value = composition.getPayload2().ocrClock;
    var text = value == null ? '' : String(value);
    outputs.forEach(function(widget) { widget.setPayload({ text: text }); });
  }

  return {
    init: function(comp) {
      composition = comp;
      var timerBug = one(comp.find('Timer Bug'), 'Timer Bug');
      outputs = ['Portrait', 'Landscape'].map(function(name) {
        var variant = one(timerBug.find(name), name);
        return one(variant.findWidget('Clock Group', 'clockOcr'), 'clockOcr');
      });
      onPayloadChanged = function() { applyInput(); };
      composition.addListener('payload_changed', onPayloadChanged);
      applyInput();
    },
    close: function() {
      if (composition && onPayloadChanged) composition.removeListener('payload_changed', onPayloadChanged);
      composition = null;
      outputs = [];
      onPayloadChanged = null;
    }
  };
})();
```

## Descendant visibility only

In the existing Timer Bug init, resolve both `clockOcr` widgets by the same inspected child/group names. In its existing Mode-update function, add only `clockOcr.setVisibility(payload.Mode === 'ocr')` for each variant. Retain the original timer/video/hidden predicates, buzzer handling and cleanup. Invoke visibility initialization as the existing script does. Do not replace that script with a generic sample or let it write `text` from `payload.ocrClock`: a Timer Bug payload change would otherwise blank the root-owned value. `ocrGameState` intentionally has no display behavior until a user supplies a specification.

Read back both persisted script texts and verify exactly one writer per field. Test existing modes as well as the new option.

## Persistent Player scenario

Read [Player verification](../composition-scripting/debugging-and-verification.md). Use a fresh direct handoff pipe into the bundled verifier with `--composition-id root`. Replace `TIMER_BUG_ID` with the inspected ordinary composition ID. Keep one Player instance. Pause the countdown through its documented controls and freeze unrelated motion before the baseline; do not alter timer units or saved defaults. Use a clock-only root-relative pixel region for the descendant Title test if Title renders elsewhere. Full-frame equality is appropriate only when that Title is not rendered.

When unrelated graphics obscure a disposable fixture, use the verifier's supported `--composition-id <timer-bug-id>` isolation instead of changing those graphics. Explicitly set `compositionId` to the inspected root ID on every formerly root-default `setPayload` and `jumpTo` step: an omitted ID targets the isolated composition. Isolation preserves ancestor transforms and does not prove final layering alongside other graphics. Require foreground-pixel integrity on all expected-visible captures so a blank baseline cannot pass hidden-input equality. For exact pixel comparisons with small GPU glyph-edge differences, use the documented `--disable-gpu` diagnostic and report that rendering mode; do not silently relax equality.

```json
{
  "version": 1,
  "steps": [
    { "action": "jumpTo", "state": "In" },
    { "action": "jumpTo", "compositionId": "TIMER_BUG_ID", "state": "In" },
    { "action": "setPayload", "compositionId": "TIMER_BUG_ID", "payload": { "Mode": "clockDown" } },
    { "action": "setPayload", "payload": { "ocrClock": "" } },
    { "action": "wait", "milliseconds": 300 },
    { "action": "capture", "name": "baseline" },
    { "action": "setPayload", "payload": { "ocrClock": "12:34" } },
    { "action": "wait", "milliseconds": 300 },
    { "action": "capture", "name": "hidden-input" },
    { "action": "assertPixelsMatch", "from": "baseline", "to": "hidden-input", "tolerance": 0 },
    { "action": "setPayload", "compositionId": "TIMER_BUG_ID", "payload": { "Mode": "ocr" } },
    { "action": "wait", "milliseconds": 300 },
    { "action": "capture", "name": "ocr-first" },
    { "action": "assertPixelsChanged", "from": "baseline", "to": "ocr-first" },
    { "action": "setPayload", "payload": { "ocrClock": "45:07" } },
    { "action": "wait", "milliseconds": 300 },
    { "action": "capture", "name": "ocr-next" },
    { "action": "assertPixelsChanged", "from": "ocr-first", "to": "ocr-next" },
    { "action": "setPayload", "compositionId": "TIMER_BUG_ID", "payload": { "Title": "Fixture title" } },
    { "action": "wait", "milliseconds": 300 },
    { "action": "capture", "name": "child-change" },
    { "action": "assertPixelsMatch", "from": "ocr-next", "to": "child-change", "tolerance": 0 },
    { "action": "setPayload", "compositionId": "TIMER_BUG_ID", "payload": { "Mode": "clockDown" } },
    { "action": "setPayload", "payload": { "ocrClock": "" } },
    { "action": "wait", "milliseconds": 300 },
    { "action": "capture", "name": "restored" },
    { "action": "assertPixelsMatch", "from": "baseline", "to": "restored", "tolerance": 0 }
  ]
}
```

Adapt runtime-local Title restoration to its inspected original value if it is visible. Require reviewed frames showing the actual strings, a nonblank paused-timer baseline, complete script telemetry with zero error/unknown counts, and no unexplained asset failures. Changed pixels alone do not prove correct text. Activate each intended saved variant and run separately for Landscape and Portrait with a fresh handoff; confirm actual output dimensions and visible presentation. The disposable fixture passed at 1920x1080 and 1080x1920 with native relevance configured, without a new verifier variant option. This does not establish same-resolution variant switching or final coexistence with unrelated graphics. Restore saved variant, scope and any persistent values, remove disposable additions, and release work. Actual Scoreboard OCR delivery and Control App Update Composition/extract behavior are separate, explicitly pending integration gates.