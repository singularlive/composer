# Drive circle progress from a runtime value

**Use when:** A bounded metric, countdown, or completion value should appear as a changing circular ring rather than static text alone.

**Principle:** Layer a complete background ring behind a matching foreground Circle arc, then let a composition script normalize the runtime value into the foreground Circle's angular sweep. The structure defines the appearance; the script defines the live progress.

**Apply:**

- Create two Circle widgets: a background Circle that always shows the complete ring and a foreground Circle whose arc shows progress. Match their position, size, radius, `holeSize`, `keepAspect`, and start angle; put the foreground Circle in front and give it a distinct fill. `holeSize` is the documented Circle payload property that creates the hollow center. With a zero-degree start, an `endAngle` of 360 produces the complete background ring.
- Attach the composition script to a composition that can reach the runtime input and foreground Circle. In the root/sub-composition `init(comp, context)` signature, `comp` is the Singular composition object and `context` is the Singular runtime context passed to the script; neither is an authored lookup variable. Give every script-addressed composition and widget a stable, unambiguous name.
- Resolve the foreground Circle in `init()`. In this example, `"Progress Ring"` is an example widget name that must be replaced with the actual foreground Circle name from the target composition. `findWidget()` is a documented composition-object method. `progressMatches` and `progressCircleWidget` are local variables created by the script, not Singular API objects:

  ```javascript
  var progressMatches = comp.findWidget("Progress Ring");
  if (!progressMatches.length) {
    return;
  }
  var progressCircleWidget = progressMatches[0];
  ```

  If the Circle is inside a child composition, first use the documented `comp.find("Child Name")` method, replace `"Child Name"` with the actual child-composition name, guard the returned array, and call `findWidget()` on that child composition.
- Define the runtime terms before implementing the mapping:
  - `totalValue` is the finite positive maximum, duration, or starting amount that represents 100 percent.
  - `currentValue` is the finite value received at runtime. Decide whether it represents `elapsedValue` (amount completed) or `remainingValue` (amount left).
  - `startAngleDegrees` is the foreground Circle's authored `startAngle` value. Use 0 for the straightforward empty-to-complete 0–360 mapping.
  - `sweepDegrees` is the maximum angular span assigned to progress. Use 360 with a zero-degree start for a complete ring; for a partial ring, choose a smaller span whose computed endpoint stays within the target Circle's documented angle range.
  - `ratio` is the normalized progress fraction, and `endAngleDegrees` is the value written to the Circle's documented `endAngle` payload property.
- Choose one mapping convention and document it with the public input contract: use `ratio = elapsedValue / totalValue` for a ring that fills, or `ratio = remainingValue / totalValue` for a countdown ring that drains. Reject a missing, non-finite, or non-positive `totalValue`; parse `currentValue` as a finite number; clamp `ratio` to `[0, 1]`; then compute `endAngleDegrees = startAngleDegrees + sweepDegrees * ratio`.
- Update the foreground Circle with `progressCircleWidget.setPayload({ endAngle: endAngleDegrees })`. `setPayload()` is the documented widget-object method; `endAngle` is the documented Circle payload property; `progressCircleWidget` and `endAngleDegrees` are the local variables defined above. Equal start and end angles render no foreground arc, while a 360-degree span renders the complete ring.
- Choose and document exactly one runtime event source. A Control Node uses the documented `comp.getPayload2()` and `payload_changed` listener path. A timer or other widget may instead emit a custom `message`; inspect that widget's actual message contract and filter by the originating composition ID plus source widget or message name. Compare event values with equality operators rather than assigning them. Ignore malformed or unrelated events without changing the last valid display.
- During `init()`, resolve and guard every required composition and widget, read the initial public payload, configure the signal source when necessary, and call the same mapping function once so the initial ring does not depend on a later event.
- Keep optional state choreography separate from the progress mapping. If reaching a boundary swaps the countdown for a message or hides the overlay, derive that transition from the validated progress state and use the documented composition `playTo()` method only when the desired state changes.
- Preserve the root/sub-composition immediately invoked function expression (IIFE) wrapper. Store any owned timer, stream, or network handles and release them in `close()`. Do not claim listener cleanup unless the target runtime exposes and verifies a corresponding removal API.

**Adjust:** Count-up versus count-down semantics, sweep and direction, visual origin, ring thickness, background contrast, progress color or gradient, update frequency, rounding, invalid-total fallback, and whether reaching a boundary triggers separate composition-state choreography. For a complete 0–360 mapping, keep the Circle start angle at zero and rotate both matched Circle widgets together when a different visual origin is needed.

**Verify:** Use the Singular Player with deterministic inputs. Confirm the initial value, two interior values including the midpoint, both boundaries, out-of-range clamping, a changed total, and rejection of an unrelated event. Check that the foreground arc stays aligned over the complete background ring, that the chosen count direction is correct, and that optional completion or visibility transitions fire once and settle in the intended states. A Composer or standalone screenshot of one settled frame does not prove the script-driven mapping.
