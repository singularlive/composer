# Ordinary composition structure

This reference covers ordinary scene sub-compositions. Widgets may also own compositions through fields of type `composition`; their renderer controls how those templates are instantiated. See [widget-subcompositions.md](widget-subcompositions.md) before navigating or editing one.

Composer opens at a root composition. A composition tile can contain another composition, producing a nested sub-composition. Root and sub-compositions share the same group/tile model.

Most element and control commands operate on the **currently active composition**. Explicit scene-wide commands, such as composition playback, ordinary timeline linking, and scoped motion batches, resolve targets by their documented IDs without requiring each target to be active. Run `inspect` and confirm `activeComposition.stack`, then follow the target and scope contract of the chosen command; do not navigate merely because a target is elsewhere in the scene.

## Structuring graphics with sub-compositions

The structural decision standard for tiles, groups, sub-compositions, and display presentations lives in "Choose the right structural unit" in [authoring-quality.md](authoring-quality.md). Choose the owning composition there before using these mechanics; do not create a new root module merely to extend an existing graphic.

- Build each module's primitives inside its sub-composition; do not place all reference elements directly in the root.
- With a descendant target active, link an existing ancestor-owned control using `--source-composition <ancestor-id>` (or `root` for a root-owned source). Follow "Design the public control contract" in the authoring standard when choosing where to define a new shared input.
- Ordinary sub-composition tiles clip descendants to their rendered tile bounds in Player. The editing canvas does not grant overflow space: nested layout percentages are rendered within the owning composition's frame. A child starting at `top: 100` with a top-left anchor is outside that frame and cannot render there, even while its Timeline state is In and its DOM text updates.
- Before placement, inspect the owning composition tile and group bounds, anchors, transforms and layout links. Fit the complete module and its motion envelope inside that frame; do not infer visibility from state or DOM text alone. Verify pixels in the owning parent's Player context.
- Keep a separate declarative specification with its own stable keys per sub-composition. `apply` reconciles only the active composition.
- After assembly, inspect the owning parent and verify the intended child tiles and linked or independent lifecycle. Return to the intended editor scope; root is not a mandatory verification target for nested extensions.
- Preserve pre-existing root visuals unless the user explicitly requests migration; this architecture constrains new authoring rather than granting permission to reorganize unrelated content.

## Creating, opening, and deleting

Before renaming, moving, restructuring or deleting a composition, apply [Contract preservation](composition-commands.md#contract-preservation). A matched contract's composition names and ancestor paths are protected even on explicit user request; deleting a parent must also preserve every required descendant. Do not use generic name/property writes or a template-match change to bypass this gate. Decline breaking parts and continue contract-safe additions and visual edits within the agreed scope.

```bash
node scripts/composer-agent.js create-composition --name "Lower third"
node scripts/composer-agent.js create-composition --name "Lower third" --group-id <group-id>
node scripts/composer-agent.js open-composition --id <composition-tile-id>
node scripts/composer-agent.js open-composition --id root
node scripts/composer-agent.js delete-composition --id <composition-tile-id>
```

Creation uses Composer's normal on-the-fly path: a default group, default settings, an In state, and a disabled Out timeline. Navigation is scoped to compositions in the current scene.

Composer automatically links the timeline of an on-the-fly composition created inside another sub-composition. The child receives `settings.linkTimeline: true` and its immediate parent's composition ID in `settings.parentTimeline`, so playing the parent also plays the child. A composition created directly in the root is not linked automatically. Inspect or change an existing ordinary child's relationship with:

```bash
node scripts/composer-agent.js timeline-link --id <composition-id>
node scripts/composer-agent.js set-timeline-link --id <composition-id> --linked false
```

The setter resolves the immediate parent from the live composition tree, changes `linkTimeline` and `parentTimeline` in one root batch, and removes Composition Navigator logic-layer membership when linking. Root and widget-owned compositions are rejected. `inspect` reports `activeComposition.timelineLink` plus `timelineLink` on child composition tiles; `get` reports the same setting for a composition tile. `orchestrate` remains the preferred way to author requested relationships for a keyed multi-module structure.

Treat that immediate parent as the linked child's operator-facing lifecycle owner. Take the parent In or Out to play the child; do not use `control-composition` on the linked child itself as playback proof. For exact Timeline-position verification, open the parent and capture `--target active --timeline ...`. A scene-root capture seeks only the root timeline: when the root-level module is intentionally unlinked, root can correctly report a zero-second duration even though its nested parent/child timeline has motion. In that case, a failed root seek diagnoses the wrong verification target, not missing child animation.

Deletion removes the parent tile and recursively cleans up descendants, states, composition properties, and event references. A sub-composition cannot be deleted without its contents, so the response reports a `contents` count of the elements, nested sub-compositions, and control nodes that went with it. Confirm the scope with the user before deleting.

There is no ordinary-composition re-parent command. `move` changes group membership/order within the active composition, not the owning composition. The supported recovery is an explicitly scoped recreate-and-relink workflow: inventory graphics, controls, inbound/outbound links, scripts, timelines and external paths; create the replacement under the intended parent; reapply and verify those dependencies with new IDs; then remove only the superseded, agent-owned module after approval. Preserve contract-named paths and API-facing controls. Do not delete first or claim that identities survive recreation.

### Keyed nested orchestration

Prefer `orchestrate` when several related ordinary compositions must be created or refined together. Start at root. Modules are ordered parent-first, use stable keys within their parent, and are preserved on reapply; omission never deletes an existing module. Use serial create/open/apply/animate commands only for isolated repairs or structures the bounded manifest cannot represent.

```json
{
  "version": 1,
  "modules": [
    {
      "key": "card",
      "name": "Card",
      "parent": "root",
      "linked": false,
      "graphics": { "version": 2, "elements": [] }
    },
    {
      "key": "accent",
      "name": "Accent",
      "parent": "card",
      "linked": true,
      "graphics": { "version": 2, "elements": [] }
    }
  ]
}
```

The manifest supports at most 25 modules. `parent` is `root` or an earlier module key. `linked` explicitly controls `linkTimeline` and, when true, writes the resolved `parentTimeline`; it defaults to false for root children and true for nested children. Composer ignores an inert `parentTimeline` whenever linking is false, so orchestration does not repeatedly remove a value the editor may restore. Each optional `graphics` value is a complete version-2 specification.

Motion is separated by model and schema: `timelineAnimations`, `updateAnimations`, and `behaviors`. Each entry replaces its direct-command `id` with `elementKey`; Timeline animation may target the managed group with `"elementKey":"$group"`, while Update and Behavior require a tile. Motion entries require `graphics` in the same module so their stable element keys can be resolved. The operation returns to root and rolls back its shared Composer batch if any module, graphics apply, link, Timeline assignment, Update assignment, or Behavior assignment fails.
