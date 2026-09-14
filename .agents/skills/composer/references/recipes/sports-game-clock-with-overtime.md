# Sports game clock with overtime

Use this pattern when an operator-controlled clock must count down from a fixed regulation duration and continue upward after zero with a `+m:ss` overtime display. The native Time Control owns elapsed state and operator actions; a Timer widget emits elapsed-time updates; a composition script formats those updates into an unlinked Metric Text widget.

Before structural work, read [Timer authoring](../widgets/timer.md), [Control Node creation](../control-node-creation.md), and [authoring quality](../authoring-quality.md). Before script work, read [composition scripts](../composition-scripts.md), [Timer scripting](../composition-scripting/widget-timer.md), and [Metric Text scripting](../composition-scripting/widget-metrictext.md). Before verification, read [Player debugging and verification](../composition-scripting/debugging-and-verification.md).

## Ownership

- Create the Timer and visible Metric Text in the same ordinary sub-composition.
- Link one native Time Control directly to the Timer's `timeControl` field.
- Leave the visible Metric Text `text` field unlinked; the composition script is its sole writer.
- Keep the Timer's `composition` value empty. Version 11 still computes outputs and emits `timeChanged` without a display template; the empty Timer renders no presentation of its own. Treat the Timer as a required runtime engine, not a hidden text store, and reconfirm this behavior against the loaded version in Player.
- Do not calculate running elapsed time from `Date.now()` in the composition script. The Timer combines the Time Control's server-adjusted `UTC`, `isRunning`, and accumulated `value`.

## Author the clock

Create a stable-keyed Timer with zero begin offset, no active end, and 100 ms updates:

```json
{
  "key": "game-clock-engine",
  "primitive": "timer",
  "properties": {
    "beginHours": 0,
    "beginMinutes": 0,
    "beginSeconds": 0,
    "endHours": 0,
    "endMinutes": 0,
    "endSeconds": 0,
    "endActive": false,
    "format": "mm:ss",
    "composition": "",
    "frequency": "100",
    "leadingZeros": false
  }
}
```

Create the exact Time Control link, then create and style a separate Metric Text widget for the visible clock:

```bash
node scripts/composer-agent.js create-control --name "Game Clock" --node-type timecontrol --tile-id <timer-id> --property timeControl
```

Place `Game Clock` in the appropriate semantic Large container. Keep the container tooltip empty unless the clock's operation differs from the normal start/pause/reset behavior.

## Format regulation and overtime

Use the exact Timer tile ID from readback as the message source contract. Replace the five-minute constant only when the sport's requested regulation duration differs.

```javascript
(function() {
  var REGULATION_SECONDS = 5 * 60;
  var TIMER_TILE_ID = '<timer-tile-id>';
  var composition = null;
  var clockText = null;
  var onMessage = null;

  function formatMinutesSeconds(seconds) {
    var wholeSeconds = Math.max(0, seconds);
    var minutes = Math.floor(wholeSeconds / 60);
    var remainder = wholeSeconds % 60;
    return minutes + ':' + (remainder < 10 ? '0' : '') + remainder;
  }

  function formatGameClock(elapsedSeconds) {
    var elapsed = Math.max(0, Number(elapsedSeconds) || 0);
    if (elapsed < REGULATION_SECONDS) {
      return formatMinutesSeconds(Math.ceil(REGULATION_SECONDS - elapsed));
    }
    return '+' + formatMinutesSeconds(Math.floor(elapsed - REGULATION_SECONDS));
  }

  function applyTime(elapsedSeconds) {
    var text = formatGameClock(elapsedSeconds);
    var current = clockText.getPayload();
    if (!current || current.text !== text) clockText.setPayload({ text: text });
  }

  return {
    init: function(comp) {
      composition = comp;
      clockText = comp.findWidget('Game Clock Text')[0];
      if (!clockText) throw new Error('Game Clock Text widget was not found');
      onMessage = function(event, msg) {
        var params = msg && msg.params;
        var data = params && params.data;
        if (params && params.id === TIMER_TILE_ID && data && data.type === 'timeChanged') {
          applyTime(data.time);
        }
      };
      composition.addListener('message', onMessage);
      applyTime(0);
    },
    close: function() {
      if (composition && onMessage) composition.removeListener('message', onMessage);
      composition = null;
      clockText = null;
      onMessage = null;
    }
  };
})();
```

This formatter intentionally uses `ceil` while regulation time remains and `floor` after regulation. It therefore shows `5:00` at reset, `0:05` at 295 seconds, and `+0:12` at 312 seconds without briefly displaying overtime before the regulation clock reaches zero.

## Verify

First prove the operator path through the linked Time Control and authoritative readback:

```bash
node scripts/composer-agent.js timer-action --id "Game Clock" --action reset
node scripts/composer-agent.js timer-action --id "Game Clock" --action start
node scripts/composer-agent.js timer-action --id "Game Clock" --action pause
node scripts/composer-agent.js timer-action --id "Game Clock" --action reset
```

After each action, inspect the Timer and control. Require reset `{isRunning:false,value:0}`, start `{isRunning:true,value:0}`, pause with a non-negative accumulated value, and final reset with value zero. These commands prove model actions, not rendering.

Run the provided [Player scenario](sports-game-clock-with-overtime-scenario.json) after replacing `<composition-id>` with the selected SDK composition ID and narrowing pixel regions to the visible clock. Its raw paused values are deterministic verification fixtures, not an operator API. View every checkpoint and require `5:00`, `0:05`, `+0:12`, and two distinct complete running values, with no script errors. Restore the Time Control to the requested final state after verification.