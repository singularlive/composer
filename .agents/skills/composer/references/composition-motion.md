# Composition playback, logic, and motion

This reference covers ordinary scene sub-compositions. Widgets may also own compositions through fields of type `composition`; their renderer controls how those templates are instantiated. See [widget-subcompositions.md](widget-subcompositions.md) before navigating or editing one.

Composer opens at a root composition. A composition tile can contain another composition, producing a nested sub-composition. Root and sub-compositions share the same group/tile model.

Most element and control commands operate on the **currently active composition**. Explicit scene-wide commands, such as composition playback, ordinary timeline linking, and scoped motion batches, resolve targets by their documented IDs without requiring each target to be active. Run `inspect` and confirm `activeComposition.stack`, then follow the target and scope contract of the chosen command; do not navigate merely because a target is elsewhere in the scene.

## Taking compositions in and out

```bash
node scripts/composer-agent.js control-composition --id <composition-id> --state in
node scripts/composer-agent.js control-composition --id <composition-id> --state out
```

For the root, use the exact `activeComposition.id` reported by `inspect`, not the literal `root` navigation alias. Quote the ID and pass it as a separate value, because Firebase-style root IDs can begin with `-`:

```bash
node scripts/composer-agent.js control-composition --id "<activeComposition.id>" --state in
```

Inspect immediately before and after. The response reports the previous and resulting state; sub-composition tile states also appear as `compositionState` in the following inspection. `out` resolves to `Out1` when **2 timelines** is disabled and `Out2` when it is enabled. Composer also applies linked-timeline and logic-layer behavior, so controlling one composition may transition related compositions.

## Logic layers

Logic layers are named Composition Navigator groups for mutually exclusive root or ordinary sub-compositions. They do not affect visual stacking. Taking one member In sends the other members Out using each composition's one- or two-timeline setting.

Use logic layers primarily to prevent overlays from occupying the same screen space at the same time. Also group overlays whose different visual styles or competing purposes make simultaneous display undesirable, even when their bounds do not strictly intersect. Decide membership from the actual design: screen position, footprint, purpose, and visual compatibility. Do not group overlays that can safely coexist or are intentionally designed to overlap.

Inspect all assignments before changing them, or inspect one composition directly:

```bash
node scripts/composer-agent.js logic-layers
node scripts/composer-agent.js logic-layers --id <composition-id>
```

Assigning a composition creates the named layer when needed and reuses that layer's color when it already exists. New membership or moving between layers takes the assigned composition In through normal Composition Navigator behavior. Exact reapplication is unchanged, and changing only delay settings does not restart playback.

```bash
node scripts/composer-agent.js set-logic-layer --id <composition-id> --name "Program"
node scripts/composer-agent.js set-logic-layer --id <composition-id> --delay auto
node scripts/composer-agent.js set-logic-layer --id <composition-id> --delay custom --time -0.25
node scripts/composer-agent.js set-logic-layer --id <composition-id> --remove
node scripts/composer-agent.js rename-logic-layer --name "Program" --new-name "Primary"
```

Delay `none` starts outgoing and incoming transitions together. `auto` delays the incoming member by the current member's outgoing duration. For `custom`, positive time delays the incoming member and negative time delays the outgoing member; values are limited to `-10` through `10` seconds. Removal preserves the current In/Out state. Rename updates every member atomically and merges with an existing target name and color. Linked-timeline and widget-owned compositions cannot be assigned because their Composition Navigator logic-layer controls are not independent.

Co-located mutually exclusive overlays with entrance/exit motion usually overlap under `delay: none`, because the incoming member starts before the outgoing member clears their shared screen band. Default those swaps to `auto`, or use a deliberate positive custom delay when the choreography requires a different handoff. Model readback proves the delay assignment only; verify the actual swap in Singular Player and inspect intermediate checkpoints to confirm the two members are not simultaneously visible.

When verifying a family of mutually exclusive variants, take each member In and inspect or capture it independently while confirming the other members are Out. After the last check, restore the user-requested active member and verify the complete layer state. Logic layers coordinate visibility only; use tile/group order for stacking inside a composition.

## Timelines

Tiles and groups store animation data in `effects.In` / `keyframes.In` and `effects.Out` / `keyframes.Out`.

**2 timelines** is a per-composition setting, disabled by default for new compositions:

- disabled — taking the composition out reverses the In timeline;
- enabled — taking the composition out plays the separate Out timeline.

`inspect` reports it as `activeComposition.timeline2Active`.

```bash
node scripts/composer-agent.js timeline2 --active true
node scripts/composer-agent.js timeline2 --active false
```

### Timeline animation

Timeline animation is keyframed In/Out motion. Read its catalog independently, then use the single setter only for one isolated assignment:

```bash
node scripts/composer-agent.js timeline-animations
node scripts/composer-agent.js set-timeline-animation --id <id> --timeline In --effect translateNoFade --property left
node scripts/composer-agent.js set-timeline-animation --type group --id <id> --timeline Out --effect fade --start 0 --duration 0.4
```

The command accepts `--type`, `--timeline In|Out`, `--effect`, `--property`, `--params-file`, `--easing-file`, `--start`, and `--duration`. The two file options read UTF-8 JSON objects from the task's temporary JSON directory. It writes `effects` and `keyframes`, preserves the other timeline, and clears stale effect parameters when required. A `propertyType` of `selection` requires a returned property ID; `angle` requires a numeric degree value.

Prefer `set-timeline-animations --file` whenever two or more assignments form one choreography. It accepts `{ "timelineAnimations": [...] }`. Every entry needs a stable `key` plus the single-setter fields. An entry may set an absolute `start`, or reference another entry with `after` and an optional signed `offset`; resolved start is `dependency start + dependency duration + offset`.

Each Timeline, Update, or Behavior batch entry may include `compositionId`. The command groups entries by ordinary composition, applies all groups in one root undo batch, and restores the exact starting ordinary scope. Omit `compositionId` to target the active composition. Keys remain unique across the complete manifest; Timeline `after` dependencies must stay within one composition.

```json
{
  "timelineAnimations": [
    {
      "key": "shell",
      "id": "<tile-id>",
      "timeline": "In",
      "effect": "scale",
      "property": "y",
      "start": 0,
      "duration": 0.4
    },
    {
      "key": "headline",
      "id": "<tile-id>",
      "timeline": "In",
      "effect": "translateNoFade",
      "property": "up",
      "after": "shell",
      "offset": -0.15,
      "duration": 0.35,
      "easing": { "easing": "power1", "inOut": "out" }
    }
  ]
}
```

Keys are dependency identities, not Composer IDs. Dependencies may appear in any array order; cycles, missing references, negative resolved starts, duplicate keys, invalid effects, and invalid targets fail the batch.

### Implement the intended module exit

The required visual outcome and acceptance check live in [authoring-quality.md](authoring-quality.md). First determine from the prompt and supplied reference which elements leave and which persist. Use the following Composer mechanics to produce that intended settled Out frame:

- With **2 timelines** disabled, Out reverses the In timeline. Any visible child whose In effect is `none` has no hiding motion to reverse and can remain on screen after the animated siblings leave.
- Use one authoritative module-level hiding target, such as a containing group or composition, only when every visible child shares the same lifecycle and should leave together.
- For mixed lifecycles, never animate a containing group that also owns persistent content. Leave persistent elements such as an always-on background unanimated, and assign an effective In animation to every transient visible child, including dividers, accents, subtitles, labels, and decorative shapes, so Singular can resolve each one during Out playback.
- When an already-Out composition gains a new hiding animation, cycle it In and then Out so the new timeline takes effect before capture.

### Continuous behavior animation

Continuous behavior is separate from In, Out, and property-change Update phases. Read its shared catalog and the target tile before assignment:

```bash
node scripts/composer-agent.js behaviors
node scripts/composer-agent.js behaviors --id <tile-id>
node scripts/composer-agent.js set-behavior --id <tile-id> --property opacity --effect pingpong --value-min 60 --value-max 100 --duration 1 --easing-file <temporary-directory>/behavior-easing.json
node scripts/composer-agent.js set-behaviors --file <behavior-assignments.json>
```

One property can have one behavior. Supported effects are catalog-backed `drift`, `loop+`, `loop-`, and `pingpong`; properties include opacity, position, rotation, and scale axes. Assignment preserves every other behavior, enforces scale-versus-scale-axis exclusivity, sorts the stored array by property, and reports the previous value and whether state changed. Use `--remove` to delete only the named property behavior.

Prefer `set-behaviors` for two or more related assignments. Its file contains `{ "behaviors": [...] }`; every entry has a stable `key`, tile `id`, and the single-setter fields. Duplicate element/property targets are rejected, the full batch is validated before writing, and all affected tiles share one rollback batch.

For an In animation, `left` means the element starts offscreen left and translates into its layout position.

### Property-change Update animation

Update animation applies to supported widget tiles and runs when their properties change. Composer stores it at `element.layout.updateAnimation`; `get` and compact `get` return that complete object with `active`, `alwaysExecute`, `offset`, and the `in` / `out` phase settings. It is not available for groups, composition tiles, widgets with composition-valued fields, widgets with custom animation, or interactive widgets, matching Composer's Update tab.

Use `UpdateOut` to animate the old rendered value away and `UpdateIn` to animate the new value in. Both phases store `effect`, `property`, `easing`, and `duration` directly rather than using timeline keyframes. Setting one phase preserves the other. Shared flags are changed only when their options are supplied. If an older tile has no Update-animation object, the command initializes Composer's normal defaults before applying the requested phase.

`offset` is the signed delay between the two phases: a positive value delays UpdateIn, zero starts both phases together, and a negative value delays UpdateOut. A simultaneous crossfade can visibly stack old and new glyphs. Unless that overlap is intentional, use a positive offset at least as long as the UpdateOut duration so the old value leaves before the new value enters. Keep `alwaysExecute: false` for normal value replacement so an unchanged payload does not replay the animation.

Read and write Update animation through its own catalog and setters:

```bash
node scripts/composer-agent.js update-animations
node scripts/composer-agent.js set-update-animation --id <id> --phase out --effect fade --duration 0.25 --active true --offset 0.15
node scripts/composer-agent.js set-update-animation --id <id> --phase in --effect translate --property left --duration 0.3
node scripts/composer-agent.js set-update-animations --file <update-assignments.json>
```

The single setter accepts `--phase in|out`, `--effect`, `--property`, `--params-file`, `--easing-file`, `--duration`, `--active`, `--always-execute`, and `--offset`. The two file options read UTF-8 JSON objects from the task's temporary JSON directory. It intentionally has no Timeline `--start`, `after`, element type, or group target. The batch file contains `{ "updateAnimations": [...] }`; every entry has a stable `key`, tile `id`, and the single-setter fields. Duplicate element/phase targets are rejected and all entries share one rollback batch.

Model readback proves the assignment, not the replacement behavior. Trigger a real property change in the Player and retain checkpoints during UpdateOut, around the UpdateIn start, and after settlement. Inspect the intermediate images for doubled glyphs, blank intervals longer than intended, clipping, and layout shifts; a settled before/after pair cannot prove transition quality.
