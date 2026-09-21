# Timer Control Nodes

Use native `timer` for an operator-controlled, server-synchronized duration: count up, count down, stop at an endpoint, or continue into overtime. It is not legacy `timecontrol`, the Timer widget, or a current-date/time widget. Do not build a script interval or hidden Timer widget merely to display its formatted duration. Preserve existing Time Control/Timer graphics unless migration is requested.

Read [Control Node ownership](control-nodes.md) first. Put the timer inside the graphic's sub-composition, in a semantic Large Control Node container. Directly link its formatted output to an inspected `text` or `textarea` widget field, preferably the appropriate Metric Text family in a new graphic. Scripts are optional, for derived presentation or actions based on numeric state.

## Author and inspect

```bash
node scripts/composer-agent.js create-control --name "Game Clock" --node-type timer --target standalone
node scripts/composer-agent.js update-control --id "Game Clock" --file <task-dir>/timer-settings.json
node scripts/composer-agent.js set-control-value --id "Game Clock" --value-file <task-dir>/timer-command.json
node scripts/composer-agent.js control-nodes
```

For direct text output, replace `--target standalone` with `--tile-id <text-tile-id> --property text`. To link an existing timer, also pass `--reuse-existing`; ancestor-owned sources use `--source-composition root` or an inspected active-stack ancestor ID. Reuse preserves the model and anchor. Creation without reuse makes a new control, with the usual numeric name suffix on conflict.

Prefer `create-controls` for related inputs, with entries such as `{"name":"Game Clock","type":"timer","target":"standalone"}` or `{"name":"Game Clock","type":"timer","tileId":"<text-tile-id>","propertyId":"text"}`. Timer creation accepts no `value` or `--value-file`. It starts stopped at zero with the defaults below, even if linked text previously displayed something else. It never infers duration from target text. Configure after creation, then issue `reset` to move to a newly configured begin value. Use these operations after graphic construction rather than embedding Timer configuration in a graphics specification.

Timer cannot be a Table column or an incoming link destination. Outbound links support only Text/Text Area fields, not numbers, layout properties, Time Control, or another Timer. Observe normal conflict approval and single-write-authority rules. A script must not write a text property also directly linked to the timer.

`control-nodes` exposes public payload `id`, stable model `keyId`, title, metadata, and the stored anchor. Internal `{UTC,value,isRunning}` uses `UTC` in milliseconds and duration `value` in seconds at that timestamp, not elapsed time since zero. All Timer durations use seconds; only timestamps and scheduling intervals use milliseconds. Running anchors do not change on every tick and can still say running after effective endpoint stopping. Do not infer live state from an anchor or send it back as a command. Reinspect metadata and links; verify ticking in Player.

## Configuration

`update-control` takes a flat JSON patch. This configures a five-minute countdown with tenths and script events:

```json
{
  "direction": "down",
  "beginValue": 300,
  "endValue": 0,
  "stopAtEnd": true,
  "format": "mm:ss.S",
  "frequency": "100",
  "emitEvents": true
}
```

| Metadata | Contract and default |
| --- | --- |
| `direction` | `"up"` (default) or `"down"` |
| `beginValue` | Finite non-negative seconds, including fractions; default `0` |
| `endValue` | Finite non-negative seconds, including fractions; default `300`; strictly above begin for up, below begin for down |
| `stopAtEnd` | Boolean, default `true`; clamp at end and stop effectively, otherwise continue beyond end |
| `format` | Default `"m:ss"`; exact formats below |
| `frequency` | String `"1000"` (seconds, default) or `"100"` (tenths) |
| `emitEvents` | Boolean, default `false`; gates only `timerChanged` custom messages |
| `immediateUpdate` | Boolean, default `true`; standard presentation setting, not an event gate or propagation repair |

Formats are `s`, `m`, `m:ss`, `mm:ss`, `h:mm:ss`, `hh:mm:ss`, `s.S`, `m:ss.S`, `mm:ss.S`, `h:mm:ss.S`, and `hh:mm:ss.S`. `s` is total seconds; `m` is whole total minutes. Minute-only formats do not wrap at 60 minutes; hours do not wrap at 24. Doubled `mm`/`hh` pads to at least two digits, not a maximum width. `.S` adds tenths and requires `frequency: "100"`; patch both together. The agent rejects inconsistent combinations rather than automatically changing frequency. Formatting rounds down for count up and up for count down at display precision; event seconds retain finer precision. Negative durations have a minus sign, including countdown overtime past zero. Overtime beyond a nonzero endpoint need not be negative.

A direction change swaps omitted begin/end values and resets stopped at the resulting begin. Explicit begin/end values in that patch override the swap. Other timing/format changes preserve current effective duration and running state, then apply the new endpoint clamp. Changing begin alone does not reset current time. Event-gate-only or presentation-only patches preserve the anchor. Common `id`, `title`, `index`, `hidden`, `style`, `hideTitle`, and `displayVariantRelevance` editing remains available; `type` and `keyId` are immutable. Timer settings cannot be removed with `null`. `defaultValue`/`resetValue` are unsupported: reset uses begin.

The operator form shows format-relevant hour/minute/second whole-number inputs in a vertical column, Play/Pause and Reset, and Running, Paused, Ended or Overtime status. At a stopping endpoint, Play becomes Restart: it uses `start` to reset to begin and run. The public `play` command still does nothing at that endpoint. Overtime shows its elapsed duration in the selected output format and explicitly indicates when paused. The form refreshes once per second even for tenths formats; linked text and script output retain fractional formatting.

Whole-unit edits apply a delta to the precise current duration, preserving its fractional remainder and effective running/paused state. For example, a paused countdown at 1.599 seconds displays 2; editing that input to 4 stores 3.599 seconds. Editing a completed timer back into range leaves it stopped until Play is pressed.

Deleting a native Timer through Composer or `delete-control` preserves its effective formatted value as static text in formerly linked Text/Text Area properties, including descendant consumers of an ancestor-owned Timer. It removes the source and its links, not the destination widgets. Reinspect destination values, links and container membership after deletion; verify rendering separately. Legacy Time Control and Timer widget behavior is unchanged.

## Commands and units

The `set-control-value` JSON file contains a command object, for example `{"command":"set","value":170.5}`. It accepts exactly the command and, for set/adjust, a finite numeric value. Raw anchors, formatted strings, numbers alone, state objects, and unknown keys are rejected.

Composition scripts use the same public commands through `comp.setPayload()`, keyed by public payload ID, not title or stable key:

```javascript
comp.setPayload({ 'Game Clock': { command: 'play' } });
comp.setPayload({ 'Game Clock': { command: 'pause' } });
comp.setPayload({ 'Game Clock': { command: 'reset' } });
comp.setPayload({ 'Game Clock': { command: 'start' } });
comp.setPayload({ 'Game Clock': { command: 'set', value: 170.5 } });
comp.setPayload({ 'Game Clock': { command: 'adjust', value: -1.5 } });
```

These are separate alternatives, not an initialization sequence. `play` resumes but does nothing at a stopping endpoint; `pause` freezes effective duration; `reset` stops at begin; `start` resets to begin and runs. `set` replaces current duration; `adjust` adds to it independently of direction. Both use **seconds**, including negative and fractional values, just like stored duration and begin/end configuration. They preserve effective running/paused state, subject to endpoint stopping. Use `play` after editing a completed timer back into range to run again. `timer-action` is for legacy Time Control, not Timer; that separate type retains its elapsed-millisecond contract.

REST writes and server control-app script writes share these commands and seconds units. Never replay a read response as a write. Do not retry `adjust` or `start` after an uncertain acknowledgement without authoritative readback: they are not idempotent.

## Composition-script output

Follow the [composition-script handoff workflow](composition-scripts.md) and [runtime API](composition-scripting/singular-scripting-doc.md). `getPayload()`, `getPayload2()`, and `getControlNode()` payloads expose formatted Timer strings, not numeric state. `payload_changed` delivers a partial payload when formatted text changes, even with `emitEvents` false. Check field presence or reread `comp.getPayload2()`; an unrelated field update is not a timer tick.

With `emitEvents: true`, listen to `message`. The callback is `function(event, msg, propagationEvent)`, with `event === 'message'` and `msg.event === 'custom'`. The envelope is:

```json
{
  "event": "custom",
  "params": {
    "type": "controlNode",
    "name": "Game Clock",
    "id": "<stable-timer-keyId>",
    "compId": "<source-composition-id>",
    "data": {
      "type": "timerChanged",
      "value": "02:15.3",
      "seconds": 135.3,
      "isRunning": true,
      "atOrPastEnd": false,
      "overtime": false,
      "overtimeSeconds": 0
    }
  }
}
```

`params.name` is field title, falling back to public ID. `params.id` is the stable **keyId**, not a widget ID or payload ID. `params.compId` identifies the source composition. There is no `sourceType`, raw model, or duplicate identity in `data`. Filter by source composition, inspected stable key, `params.type` and `data.type`. Titles can change and need not be unique. Messages bubble to ancestors; a parent must filter against the child's composition ID, not its own. Merge with any existing `message` handler: `addListener` stores only one handler per composition/event type.

| `data` field | Meaning |
| --- | --- |
| `type` | Always `"timerChanged"` |
| `value` | Formatted text |
| `seconds` | Current signed duration in fractional seconds |
| `isRunning` | Effective running state; false at a stopping endpoint |
| `atOrPastEnd` | At or beyond end in the count direction; a state, not a one-shot completion event |
| `overtime` | Strictly beyond end |
| `overtimeSeconds` | Non-negative fractional seconds beyond end |

Use a false-to-true transition guard for one-shot completion and define how reset/restart rearms it. Avoid unconditionally commanding the same timer in its message handler: commands can synchronously emit further events. Messages follow selected cadence while running, with immediate state/configuration updates and a final stopped state before ticks stop. Custom messages may arrive without a text change. Do not assume a rich initial event is replayed after listener registration. Initialize text from payload and consume numeric state when an event arrives; never restart a running timer just to obtain an event.

### Listener example

This local script owns an **unlinked** Metric Text widget named `Timer Readout`. Replace the key placeholder using `control-nodes` readback. It initializes formatted text, then appends an overtime indicator from rich state. It neither alters the timer nor installs a timer.

```javascript
(function() {
  var composition = null;
  var readout = null;
  var onMessage = null;
  var timerKeyId = '<stable-timer-keyId>';

  function writeText(text) {
    var current = readout.getPayload();
    if (!current || current.text !== text) readout.setPayload({ text: text });
  }

  return {
    init: function(comp) {
      composition = comp;
      readout = comp.findWidget('Timer Readout')[0];
      if (!readout) throw new Error('Timer Readout was not found');
      var payload = comp.getPayload2() || {};
      writeText(payload['Game Clock'] == null ? '' : String(payload['Game Clock']));
      onMessage = function(event, msg) {
        var params = msg && msg.params;
        var state = params && params.data;
        if (event !== 'message' || !msg || msg.event !== 'custom' || !params ||
            params.type !== 'controlNode' || params.compId !== comp.id ||
            params.id !== timerKeyId || !state || state.type !== 'timerChanged') return;
        writeText(state.value + (state.overtime ? ' OT' : ''));
      };
      comp.addListener('message', onMessage);
    },
    close: function() {
      if (composition && onMessage) composition.removeListener('message', onMessage);
      composition = null;
      readout = null;
      onMessage = null;
    }
  };
})();
```

Enable `emitEvents` before handoff. Read the target widget's routed scripting reference before adapting its payload. When merging into a script, preserve its existing listener and cleanup.

## Timing, API reads, and verification

Timer evaluates from corrected server time, not accumulated interval callbacks. Running timers share a 16 ms sampling timer, delivering selected 100/1000 ms duration-bucket changes. Delayed callbacks publish current state once without replaying missed ticks. This is not a real-time guarantee. Ticks do not write anchors to storage; stopping and output do not require the operator form to remain open.

REST `GET /apiv2/controlapps/{token}/control` and server control-app `getPayload()` evaluate each Timer at request time as `{value,seconds,isRunning,atOrPastEnd,overtime,overtimeSeconds}`: event data without `type`, regardless of `emitEvents`. Invalid models return `null`. Composition-script getters remain formatted strings. Do not substitute the REST representation for script getters or bypass the bundled script helper to obtain credentials.

Verify configuration, container membership, exact links, and unrelated state in Composer. Verify ticking, pause/resume, reset/start, stopping, signed overtime, fractional set/adjust, filtering and disabled-event behavior in Singular Player or the Composition Script editor preview. Normal Composer canvas output does not prove scripts ran. For managed Control Apps, update the composition extract before testing. Clean up listeners and task-owned fixtures; restore the requested running/stopped state. Report untested live behavior as pending.