# Optional animated module

Build a visual module that can animate independently of the graphic containing it, such as a callout, sponsor label, status strip, secondary statistic, or alert. Use this when content may be prepared or updated while the surrounding graphic remains on air, and the optional module must enter or leave without replaying the complete parent composition.

Before structural work, read [ordinary compositions](../compositions.md), the relevant widget guides, and live animation catalogs for the module's actual elements. Read [composition scripts](../composition-scripts.md) and [Composer scripting](../composition-scripting/singular-scripting-doc.md) before script work, and [Player verification](../composition-scripting/debugging-and-verification.md) before verification. Establish the local ownership, visibility authority, and independent Timeline requirements below before any mutation.

## Place the module with its graphic

Put the optional module in a dedicated ordinary sub-composition inside the nearest composition that owns the surrounding graphic's layout and animation. For a lower third, that is normally the lower-third graphics composition, not root and not a separate scene-wide controller.

When display variants use separate presentation compositions, put a local optional-module child inside each presentation by default. This keeps fitting, clipping, stacking, and animation in the same coordinate and ownership context as the presentation it extends. A shared optional-module composition with explicit display relevance is appropriate only when its geometry and choreography are genuinely shared; the existence of display variants alone is not a reason to centralize it.

The optional child must have `settings.linkTimeline: false` when its visibility is controlled by script. Nested ordinary creation enables timeline linking by default. For an existing ordinary child, inspect `timeline-link --id <composition-id>`, then use `set-timeline-link --id <composition-id> --linked false` when needed. For a new module in an orchestration manifest, use `linked: false`. Require authoritative timeline-link readback before scripting independent playback; verify the resolved immediate parent as well as the unlinked setting. Follow [the command reference](../commands.md) for typed linking; never write `linkTimeline` or `parentTimeline` through a generic property command.

If several local children share one public contract, a script on their nearest common ordinary ancestor may coordinate them. Keep each child's visuals local even when behavior is shared. Use separate local scripts only when the presentations have intentionally independent behavior contracts.

## Choose one visibility authority

Choose visibility from the module's public data contract:

- For a module whose only meaningful content is one text value, derive visibility from that value after trimming whitespace. Empty or whitespace-only text means Out; nonempty text means In.
- For a module with multiple values, or when operators must prepare content before showing it, create an explicit Checkbox such as `Show Callout`. The Checkbox is the sole visibility authority. Empty individual content fields must not unexpectedly hide the module.
- Do not combine implicit text visibility and a Checkbox unless the user explicitly defines how they interact. One clear authority prevents contradictory state.

Put public fields in the semantic Control Node container that owns the surrounding graphic. Link ordinary content fields directly to their local widgets when one input maps to one property. Keep the visibility Checkbox standalone because the script interprets it. A text field used as both content and visibility may remain directly linked while the script reads the same ancestor payload.

When several variant-local modules share values, define those controls once on their nearest common ancestor and link each descendant target with exact ancestor reuse. Verify every data link and preserve local widget geometry.

## Coordinate visibility in a composition script

Use the composition script only for visibility orchestration. Composer owns each child's finite Timeline animation, and direct links own ordinary content propagation.

Before writing the script:

1. Give every script-addressed child a unique, stable name.
2. Inspect the script owner and all intended children.
3. Read the existing script and preserve unrelated behavior. `addListener` replaces the handler for the same composition/event; merge this recipe's logic into existing handlers instead of registering competing listeners.
4. Confirm each child is unlinked from its immediate parent timeline.

Choose exactly one `isEnabled` implementation for the public contract:

```javascript
function isEnabled(payload) {
  var value = payload.Callout == null ? '' : String(payload.Callout);
  return value.trim().length > 0;
}
```

```javascript
function isEnabled(payload) {
  return payload['Show Callout'] === true;
}
```

Use the parent's target Timeline state rather than calling `getState()` during a `timeline_event` start callback: `getState()` still reports the previous state while playback is starting. Cache the desired visibility so repeated equivalent payloads do not replay animation.

Adapt this ES2017-compatible core to the inspected module names and merge it into the existing script wrapper:

```javascript
(function() {
  var modules = [];
  var parentIsIn = false;
  var lastVisible = null;

  function isEnabled(payload) {
    var value = payload.Callout == null ? '' : String(payload.Callout);
    return value.trim().length > 0;
  }

  function applyState(state, animate) {
    modules.forEach(function(module) {
      if (animate) module.playTo(state);
      else module.jumpTo(state);
    });
  }

  function sync(comp, animate) {
    var visible = parentIsIn && isEnabled(comp.getPayload2() || {});
    if (animate && visible === lastVisible) return;
    lastVisible = visible;
    applyState(visible ? 'In' : 'Out', animate);
  }

  return {
    init: function(comp) {
      var names = ['Callout'];
      modules = names.map(function(name) {
        return comp.find(name)[0];
      });
      if (modules.some(function(module) { return !module; })) {
        throw new Error('Optional module composition was not found');
      }

      parentIsIn = comp.getState() === 'In';
      sync(comp, false);

      comp.addListener('payload_changed', function(event, msg) {
        sync(comp, true);
      });

      comp.addListener('timeline_event', function(event, msg) {
        if (msg.compositionId !== comp.id || !msg.message) return;
        if (msg.message.event === 'start') {
          parentIsIn = msg.message.targetState === 'In';
          sync(comp, true);
        } else if (msg.message.event === 'jump') {
          parentIsIn = msg.message.targetState === 'In';
          sync(comp, false);
        }
      });
    },

    close: function() {
      modules = [];
      parentIsIn = false;
      lastVisible = null;
    }
  };
})();
```

For several local modules, replace `names` with their exact unique names. Synchronize all of them so switching presentations does not expose stale state. Do not use display relevance as a substitute for the script's visibility decision.

## Animation

Author the optional child's In/Out motion on its native elements or coherent managed group. With one Timeline, Out reverses In; enable two timelines only when the requested exit differs. Keep the complete motion envelope inside the owning presentation and avoid Timeline effects that conflict with script-owned layout properties.

Add Update animation to content widgets when on-air replacement needs motion. Use UpdateOut for the old value and UpdateIn for the new value. Prefer a positive offset at least as long as UpdateOut when doubled old/new glyphs are undesirable, and keep `alwaysExecute: false` so unchanged values do not replay.

## Verification

Verify the complete behavior in scoped Singular Player, not only from model or script readback:

- empty text remains Out for text-derived visibility;
- whitespace-only text follows the same rule;
- nonempty text remains Out while the parent is Out, then enters when the parent enters;
- the Checkbox can prepare multiple values while Off and reveal them only when On;
- content replacement while visible uses the intended UpdateOut and UpdateIn sequence without doubled content or an excessive blank interval;
- clearing text or turning the Checkbox Off animates the child Out while the parent remains In;
- parent Out takes the optional child Out;
- repeated equivalent payloads do not replay motion;
- every display presentation has correct local bounds, clipping, stacking, links, and final visibility.

Capture early, intermediate, and settled Timeline frames plus UpdateOut, UpdateIn, and settled replacement frames. Restore the intended display presentation, payload, composition states, and editor scope before handoff.

For a text-derived module, copy [the optional text module scenario](optional-animated-module-scenario.json) to the task's temporary directory and use it with `verifyComposition.mjs --scenario-file`. Its canonical field is `Callout`; replace that payload key and the sample strings only when the inspected public contract differs. Adjust waits to the authored Timeline and Update durations before running it. The named checkpoints cover empty, populate, UpdateOut/UpdateIn replacement, clear, and parent Out; view every retained image and pair it with zero composition-script errors.