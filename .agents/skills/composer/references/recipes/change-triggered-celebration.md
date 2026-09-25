# Change-triggered celebration over linked values

Candidate pending the complete Player gates below. Supplied session observations support this pattern, but do not prove the reusable scenario's seed suppression or a measured timing bound. Do not promote it on model readback alone.

Use an independently animated cover to celebrate an increase in a directly linked score or counter, then reveal the updated value. Keep API-facing Control Node IDs, scopes, types and links intact. Never replace score links with script writes or delayed updates to obtain animation timing. Read [contract preservation](../composition-commands.md#contract-preservation), [optional modules](optional-animated-module.md), [composition motion](../composition-motion.md), [composition scripts](../composition-scripts.md), and the relevant widget scripting references before their respective phases.

## Structure and authority

- Inspect the nearest layout owner. Put the ordinary celebration child inside its visible bounds, commonly a top-left-anchored 0-100% frame. Composition tiles clip descendants; outside placement cannot extend the parent.
- Unlink the child's Timeline and enable Timeline 2 for a distinct Out. Put cover, text and accents inside its managed clipping group. Verify foreground layer order and the relative order of every pre-existing sibling after reordering.
- Preserve shared theme links and original score links. Give the celebration's interpreted team label and accent properties one script writer. Keep editable celebration text directly linked, preserving entered casing and languages.
- Put the standalone enable Checkbox and any standalone material-color input in a semantic Large control container; the Checkbox can be its `activeId`. Root controls remain root-owned if that is the existing integration contract. Merge into the existing payload forwarding method rather than registering a competing listener or assuming root values appear in a child's local payload.

## Change detection and lifecycle

Merge these rules into the existing owning script, preserving unrelated behavior and reading it back byte-for-byte after the helper write:

1. Initialize a previous counter snapshot from the first authoritative payload without celebrating. Accept only finite non-negative numeric counters according to the inspected API contract; do not treat missing or malformed values as zero.
2. On each authoritative update, compare valid new counters with their previous values. Copy the new snapshot even when disabled or hidden, so enabling or returning on air does not replay an old increase. Unchanged values and decrements do not trigger. Decide simultaneous-increase behavior explicitly; do not silently invent a team winner.
3. Before playback, resolve the scoring team's name with an agreed fallback and derive accents from the current shared team colors. Write only unlinked celebration properties using the exact routed widget API.
4. Cancel the previous hold timeout, play the child to In, then schedule Out after the agreed hold (for example four seconds). Define whether a second increase restarts or queues; a restart must cancel the old timeout. Never leave an old callback able to end a newer celebration.
5. Disabling mid-hold or hiding the overlay cancels the timeout and forces Out, independent of counter changes. Parent Out must also take the child Out. Use the parent's target state in Timeline start callbacks, not its stale `getState()` value.
6. Clear the timeout and owned listeners in `close()`. Merge handlers where the existing script already owns that composition/event.

## Cover before reveal

The linked value changes immediately; this is perceptual masking, not delayed score delivery or an atomic guarantee. Make an opaque panel cover the changing region quickly enough for the agreed output rate and layout. A horizontal reveal opening from the center suits central digits; other value positions need another cover direction. A supplied case covered central digits in roughly 150 ms, but that number is not a reusable guarantee.

Use Timeline 2 to fade the foreground text first, then collapse the panel toward its center, exposing the new linked value. Choose easing and duration after testing early frames, not from a style-specific preset. Font, palette and material are design choices, not requirements of this pattern.

## Version-1 Player scenario

Copy [the celebration scenario](change-triggered-celebration-scenario.json) into a short task directory. Its selected capture target is the owning scoreboard frame; replace `celebration-fixture` with the inspected child's SDK ID, map payload keys to the actual API-facing source, and add explicit source `compositionId` overrides when the controls are outside that target. Do not capture the celebration child alone: the underlying digits are part of the proof. Replace the sample center-score region with inspected output bounds and adapt waits to actual In/hold/Out durations.

The scenario disables before seeding, compares baseline pixels after re-enabling, constructs a settled opaque-cover reference, captures an early cover and compares the score region, then compares the reveal with an independently seeded expected score. It also checks decrement, disabled increment, hidden-overlay Out, and disabling mid-hold. Verify the away branch in a second adapted run. The manual cover reference must contain no changing text/accent/sheens in the compared region; otherwise author an independent equivalent cover reference rather than loosening tolerances.

Required promotion evidence:

- Setup suppression: no In transition during seed or enable-only steps, Out state and baseline pixel match. A final Out alone cannot rule out a transient trigger; inspect state transitions in a bounded custom harness if necessary.
- Cover within an agreed **N ms**: a score-region pixel match to the opaque reference plus measured elapsed time from payload dispatch to the actual sampled frame. Version 1's sequential capture does not assert this timing bound. Run fresh seeded early-checkpoint trials or a bounded custom timing harness; do not sum waits and call that elapsed time.
- Reveal matches the independently seeded new score, with readable team name and correct accents for each team. Decrement does not trigger; disable suppresses; disable mid-hold and overlay hidden force Out. Exercise repeated increases and cleanup as authored.
- Every retained frame is reviewed. Require complete `runtime.scriptEvents` telemetry with zero `error` and `unknown`, and successful initialization; `assertLifecycle error=0` alone is insufficient.
- Separately verify Control App composition update, Customize visibility and real app/API delivery when those are acceptance requirements. Player payload calls do not establish those hosts.

Follow [scenario seeding and capture timing](../composition-scripting/debugging-and-verification.md#seed-change-triggered-scenarios). Restore intended payloads, states, display presentation and editor scope.