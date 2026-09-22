# Composition revisions

This reference covers ordinary scene sub-compositions. Widgets may also own compositions through fields of type `composition`; their renderer controls how those templates are instantiated. See [widget-subcompositions.md](widget-subcompositions.md) before navigating or editing one.

Composer opens at a root composition. A composition tile can contain another composition, producing a nested sub-composition. Root and sub-compositions share the same group/tile model.

Most element and control commands operate on the **currently active composition**. Explicit scene-wide commands, such as composition playback, ordinary timeline linking, and scoped motion batches, resolve targets by their documented IDs without requiring each target to be active. Run `inspect` and confirm `activeComposition.stack`, then follow the target and scope contract of the chosen command; do not navigate merely because a target is elsewhere in the scene.

## Revision approval before mutation

Before the first high-impact mutation in a task, recommend a revision through the AI chat question UI and wait for the user's choice, unless inspection confirms the empty-starter exception below. This is an agent-chat decision, not a Composer dialog or an automatic server prompt.

High-impact work includes multi-composition or broad element changes, recursive deletion, migration, display-variant configuration, composition-script changes, control/link restructuring, orchestration, and replacement of an existing visual system.

### Empty-starter exception

Do not ask for or create a revision for a verified empty starter scene: root contains only its default group and optionally one empty default sub-composition (such as `Overlay 1`), with no authored visual elements, Control Nodes, scripts, or custom configuration to preserve. Inspect root and the default child rather than inferring emptiness from the active scope's counts or from names alone. Empty default groups are scaffolding, not content worth backing up. Proceed directly with the requested first build, including its controls and script, without a revision question.

This exception applies to the whole scene at the start of the task, not merely an empty target inside an authored scene. If any existing authored content, controls, scripts, or custom configuration is present elsewhere, or emptiness is uncertain, use the normal high-impact gate. Do not interrupt the same initial-build task with a revision prompt just because its own first mutations have populated the empty scene. An explicit user request to create a revision still takes precedence.

### Approval procedure

Do not prompt for inspection, capture, playback, isolated text/color/property edits, variant activation, or another high-impact phase already covered by a revision created during the same task. An explicit request to create a revision is already approval; do not ask again.

After inspection and before mutation:

1. Propose a concise description and explain that the revision saves the last persisted scene, not unsaved edits in the current Composer tab.
2. Send `status --state waiting-for-user` with the question. Offer `Create revision: AI checkpoint before <operation>` as recommended, plus `Continue without revision` and `Cancel operation`, with freeform input enabled. If no structured question UI is available, ask the same question in chat and wait for an explicit answer.
3. Keep the work lease active while waiting for this revision decision; this is the sole exception to releasing before a blocking question. Do not mutate while awaiting the answer.
4. After the answer, check readiness and inspect again. If the lease expired, reacquire it with `begin-work` before inspection or mutation. On `OPERATION_CANCELLED`, stop until a new user instruction; do not reacquire automatically.
5. Create a revision only with explicit approval, using the approved description, and verify the returned revision ID before the planned mutation. On creation failure, stop and report it; do not silently continue without protection. If the user chooses to continue without a revision, proceed with the approved task without creating one. On cancellation, release the lease without mutating.

## Managing revisions

```bash
node scripts/composer-agent.js create-revision --description "Before sponsor changes"
node scripts/composer-agent.js list-revisions
node scripts/composer-agent.js read-revision --revision-id 12
node scripts/composer-agent.js compare-revision --revision-id 12
node scripts/composer-agent.js restore-revision --revision-id 12
node scripts/composer-agent.js delete-revision --revision-id 12
```

Revision commands use the visible per-scene revision number, not the internal database row ID. List output includes description, timestamps, creator, and size when available; it never exposes the storage URL or internal row ID. `read-revision` fetches and validates stored content but returns only totals for compositions, groups, elements, controls, and scripts. `compare-revision` returns those totals for the current Composer model and selected revision plus numeric deltas. It deliberately does not enumerate position, size, value, script, or nested-model differences.

Creating a revision saves the composition's last persisted version; it does not save unsaved edits in the current Composer tab or modify the active composition. Run `inspect` first and use a concise non-empty description (up to 500 characters). Create one when the user explicitly requests a snapshot or accepts the runtime skill's AI-chat recommendation before high-impact work. The command reads the current revision list, uses the next numeric revision ID, and returns that ID with the description. If another editor creates the same next revision first, Composer rejects the request rather than replacing a revision; re-inspect and ask the user before trying again.

Restoration replaces the complete scene. Run `inspect`, state that scope, and proceed only when the user explicitly requests the revision. The command validates and reads the target first, creates a persisted revision named `Automatic backup before restoring revision <number>`, waits for that backup to succeed, records the native restore audit action, then applies the stored scene with Composer's native save-script, restore, and reload flags. Its `restore-started` response reports both revision numbers; the editor reload is the final persistence transition, so reconnect and inspect afterward before claiming the restored content is active. If target reading, backup creation, or audit recording fails, scene replacement does not start. The automatic backup records the last persisted scene, not unsaved edits.

Revision deletion removes permanent server data. List immediately before deletion, identify the exact description and revision number to the user, require explicit deletion intent, and verify with another list afterward. Do not automatically delete the backup created by restore.
