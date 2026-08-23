---
name: composer
description: Inspect, capture, create, and refine graphics in an open Singular Composer session, including composition elements, control nodes, layouts, timeline animations, composition scripts, reusable authoring techniques, and read-only discovery of new technique candidates. Use when AI needs to control Composer, develop or verify runtime behavior for a paired composition, apply an existing technique card, or inspect the paired composition for reusable structural or motion ideas.
---

# Singular Composer

Control the user's currently open Singular Composer session through the bundled client.

```bash
node scripts/composer-agent.js <command> [options]
```

The client can inspect a scene, build and refine bounded or clipped overlay graphics, author sanitized AISVG paths and widget-driven vector animation, manage scene and widget-owned sub-compositions, orchestrate keyed nested modules, update supported Table widgets, expose Control Nodes, assign timeline, property-change Update, batched choreography, and continuous behavior animations, apply reusable authoring techniques, move elements between groups, and capture the rendered preview. It cannot replace raw composition JSON or read, write, or execute scripts through the paired editor relay. After the graphic structure exists, `script-handoff` packages the active composition, widgets, controls, links, host, Composition API token, paired agent authorization, and suggested script target for this skill's separate token-and-Player phase; see [references/composition-scripts.md](references/composition-scripts.md).

## Composer is the source of truth for editor work

Never trust your own memory of scene state, prior command output, or assumptions about what an edit "should" have produced. Composer is the only authority on the current scene: re-`inspect` or `get` after every mutation before deciding what to do next, and resolve any mismatch between expectations and Composer's response in Composer's favor.

This rule applies to paired-editor work. For the common case where the script belongs to the active composition and uses the widgets and controls just inspected, pipe a fresh `script-handoff` to the token helper and use its fast path instead of reloading all persisted content. If the target is ambiguous, outside the active composition, or the handoff lacks required context, use the same handoff with `summary --full`. Direct user-token operation is not supported. Every dedicated script request requires the active scene/account-scoped paired agent authorization carried by the handoff; cancellation, completion, or expiry revokes further script access. The dedicated script endpoint remains authoritative for script text, and the Singular Player runtime remains authoritative for script behavior.

## Prefer atomic manifests for coordinated work

Use the highest-level bounded operation that represents the requested change:

1. For a graphic that creates or refines several related ordinary sub-compositions, prefer one stable-keyed `orchestrate --file <manifest.json>` run from root. Put each module's declarative graphics, `timelineAnimations`, `updateAnimations`, and `behaviors` in that manifest so creation/reuse, explicit timeline links, graphics, and all three motion families share one rollback batch.
2. Within one existing active composition, prefer `set-timeline-animations`, `set-update-animations`, or `set-behaviors` whenever two or more assignments from that family belong to one requested change. Timeline choreography alone supports stable `after` dependencies and signed relative `offset` values.
3. Use `create-composition`, `open-composition`, `apply`, `set-timeline-animation`, `set-update-animation`, and `set-behavior` as individual mutations only for one isolated edit, a targeted repair, readback-driven diagnosis, widget-owned template work, or a structure the bounded manifests cannot represent.

Command status is part of the operating contract. A command marked **Targeted only** in [references/commands.md](references/commands.md) has a distinct narrow use case and is not a fallback when a preferred batch fails. Do not use undocumented aliases or superseded command names; unreleased commands without a distinct supported use case are removed instead of retained for compatibility.

Atomic rollback does not replace verification. Inspect the correct scope before the operation, keep manifest keys stable on refinement, and read the returned IDs and final Composer state afterward.

## Authorize once

If no active credentials exist:

1. Ask the user to click **Agent** in the Composer toolbar.
2. Ask for the six-character one-time pairing code Composer displays.
3. Run:

```bash
node scripts/composer-agent.js pair --code <pairing-code>
```

The server defaults to `https://beta.singular.live/`. Pass `--server <singular-server-url>` only when the user explicitly needs another environment. Never print or request the access token. It is stored in the user's home directory and expires after 30 days. Composer remembers the scene/user authorization for the same period and resumes its editor connection automatically after a reload, so the one-time code is not repeated for each task. The same scene/account-scoped credential authorizes the separate script endpoints until it expires or is explicitly disconnected.

On a successful claim, the bundled `pair` command automatically acknowledges the connection in Composer and tells the user to return to the AI Agent task. Confirm `"acknowledged": true` in its output. If it is false, do not imply that the user saw the message; report the pairing state and wait for the editor to reconnect or for a fresh pairing. `credentialStorage` reports only `default`, `override`, or `temporary`. An explicit `COMPOSER_AGENT_CREDENTIALS` path always wins; when the normal profile is permission-blocked and no override exists, the CLI uses a workspace-keyed operating-system temporary file and removes it on `complete`.

## Hold one work lease for the complete task

The saved JWT is authorization, not a permanent editor lock. At the start of every Composer task, before `inspect` or any other editor command, acquire one task-level work lease:

```bash
node scripts/composer-agent.js start-work
```

Composer locks for the lifetime of that lease, independent of the short-lived WebSocket used by each CLI command. Every editor command requires an active lease and renews its ten-minute fail-safe expiry. This keeps the surrounding editor dimmed and input-locked continuously while the agent works, while the visible graphic canvas keeps its authored appearance. The user can move the status panel aside and monitor progress. If a non-editor phase such as script work or Player verification approaches ten minutes without a paired command, send a meaningful `status` update to renew the lease.

Before yielding a final response, waiting for user input, or otherwise ending the current task, release the lease in a `finally`-style cleanup:

```bash
node scripts/composer-agent.js finish-work
```

The CLI reinforces this gate on stderr after every relevant success or failure without changing its JSON stdout. Treat `COMPOSER_FINALIZATION_REQUIRED` as an immediate pre-yield check: if `start-work` succeeded in the current task, run `finish-work` and require its acknowledgement. Successful cleanup reports `COMPOSER_WORK_RELEASED`. Pairing is excluded because it does not acquire a work lease.

Do not leave the lease active merely because follow-up work is possible; the saved JWT remains authorized after release. If the agent exits unexpectedly, Composer releases the lock when the lease expires, and the user can release it immediately with **Cancel operation**. Before every Composer command, the bundled CLI reports the command being run automatically. Use status deliberately:

```bash
# Tell the user why you need them to return to this AI Agent task.
node scripts/composer-agent.js status --message "I need the team names before I can continue."

# Revoke the saved authorization only when the user explicitly asks to disconnect the agent.
node scripts/composer-agent.js complete
```

When the user clicks **Cancel operation**, the work lease is released, every active agent socket is interrupted, and the in-flight CLI command fails with `OPERATION_CANCELLED`. Stop the current task and do not run another Composer command until the user gives a new instruction. The saved authorization remains available for that later task. **Disconnect AI Agent** in Composer, or `complete` when the user explicitly requests disconnection, revokes the authorization; later commands then require a new one-time code.

At the start of a follow-up turn, run `start-work`, then use one cheap `inspect --summary` probe before parallelizing further Composer reads. If the probe reports revoked, expired, or disconnected authorization, stop and follow the pairing policy above. After a fresh successful `pair`, acquire a new work lease before resuming. Do not serialize reads during an otherwise healthy authorization and lease.

Do not call `complete` merely because a requested Composer change is complete. Use `finish-work` to release Composer while keeping the saved authorization ready for follow-up work. Use a `status` message to report completion or ask what to do next, then release the lease before yielding. Call `complete` only when the user explicitly asks to disconnect or revoke the agent.

### Ask through Composer first

Before asking the user any blocking question in the AI Agent task, send the same clear request to Composer first:

```bash
node scripts/composer-agent.js status --message "I need the team names before I can continue."
```

Then ask the user in the AI Agent task. Do not leave the Composer panel showing only a generic command name while waiting for a user decision. If sending the status fails because the session was canceled or disconnected, report that directly instead of claiming the Composer message was delivered.
After delivering the status, run `finish-work` before waiting for the answer.

## Always inspect before acting

```bash
node scripts/composer-agent.js inspect
```

`inspect` reports the scene, groups, tile summaries, selection, preview inputs, a `summary` count (groups, tiles, compositions, controls), and — critically — `activeComposition.stack`. Every other command operates on the **active composition only**. Confirm the scope before reading or writing anything, and read a full element with `get` before updating it.

Widget-owned sub-compositions have an intentional copy-on-exit lifecycle. When Composer exits standalone template editing, it replaces the template with a copy under a new composition ID and updates the owning widget field. Treat every widget-template ID as an ephemeral edit-session handle: never reuse it after returning to root, navigating out of the template, or starting a later operation. Re-resolve the current relationship from the owning widget with `widget-subcompositions` or `open-widget-subcomposition`. The widget tile ID and composition-valued field ID are the stable identities.

When a newly created widget has an empty composition-valued field, open it with `open-widget-subcomposition --id <widget-tile-id> --create` (and `--field <field-id>` when required). This invokes Composer's native hidden widget-template creation path. Never substitute `create-composition`: that creates an ordinary visible parent tile rather than a widget-owned template.

For cheaper reads, narrow the output:

- `inspect --summary` returns only the counts, staying small even in large compositions.
- `inspect --selection` returns only the currently selected item.
- `get --selected` reads the selected tile or group in full without a separate `inspect` first.
- `primitives --primitive text` lists only the primitive you are about to create.
- `fonts --family <query>` searches Composer's available font families before a Text font change.

## Discover techniques from the paired composition

Run technique discovery only when the user explicitly asks to discover, extract, or learn reusable techniques from the paired composition.

Discovery is read-only: preserve the paired composition, restore the exact original composition stack, keep the session active, and obtain approval before changing technique references. Follow [references/techniques/discovery.md](references/techniques/discovery.md) for the complete structural and script-aware workflow.

## Building or refining a graphic

For prompt-, screenshot-, or reference-video-driven work, use this workflow. [references/authoring-quality.md](references/authoring-quality.md) owns the construction and visual-quality standard; the task references own exact commands and value shapes.

1. **Establish the target.** Read the authoring standard, run `inspect`, confirm `activeComposition.stack`, and read every existing target that may change. Capture an untouched baseline only when the existing appearance must be preserved or compared, a supplied reference needs before/after evidence, or a rendering defect is being diagnosed. When an inspected target is structurally empty and no comparison is needed, skip capture and record `baseline: { "status": "baseline-not-applicable", "reason": "empty-target" }`.
2. **Plan the composition.** Decide the tile, group, and sub-composition boundaries; public controls; dynamic-value requirements; layer order; and element lifecycles before mutating. For reference motion, read [references/video-reference.md](references/video-reference.md). When the request matches a reusable effect, select the relevant card from [references/techniques/techniques.md](references/techniques/techniques.md). Route Table, AISVG, widget-template, text/font, and script work to their matching references instead of improvising their contracts.
3. **Discover live value contracts.** Run the narrowest applicable `primitives`, font, animation, Behavior, Control Node, or widget-schema read. Use the returned runtime shapes exactly, except for the documented solid-color RGBA rule. Never infer IDs, property paths, widget payloads, or catalog values from memory.
4. **Author one coherent change.** For several related ordinary modules, start at root and use one stable-keyed `orchestrate` manifest. For one composition, use one required-version-2 graphics specification, `validate` and `apply` it, then use the matching typed batch setter for each multi-assignment motion family. Keep keys stable, write every semantic placement unit explicitly as `"percent"` or `"px"`, and batch related work before capture.
5. **Verify the model.** Treat returned IDs and Composer readback as authoritative. Re-`inspect`, read changed elements, and verify composition scope, managed ownership, links, controls, motion assignments, and unrelated state before judging the rendered result.
6. **Render and refine only against evidence.** Capture only when pixels answer an acceptance question that model readback cannot. Follow [references/capture.md](references/capture.md) for source selection, readiness, measurements, one-shot Browser transactions, and restoration. View every saved image, name each unresolved discrepancy, update the same specifications and keys, batch the related corrections, and capture again only after a material change.
7. **Apply the completion gate.** Use [references/authoring-quality.md](references/authoring-quality.md) to verify construction, rendered quality, dynamic content, motion, runtime behavior, and final restored state. Keep the best final artifact when one was needed, and report remaining visible differences or unverified requirements.

The capture budget is authoritative here: use zero captures for nonvisual/model-only work and normally one for a straightforward visual build or fix. For reference-driven work, allow up to five successful refinement captures by default; baseline, settled In, settled Out, and required animation-state evidence are verification captures and do not consume that budget. More than five refinements is allowed only while every additional pass addresses a concrete remaining discrepancy, and ten successful refinement captures is the emergency ceiling. Failed captures do not count. Never recapture unchanged output. Stop when the result is close enough, the latest pass makes no meaningful improvement, two consecutive refinement passes fail to reduce the discrepancy, or Composer returns a non-recoverable apply or capture error.

If the request also requires runtime logic, finish and verify the composition structure and public Control Node inputs first, then follow [references/composition-scripts.md](references/composition-scripts.md). Pipe a fresh `script-handoff` directly to the bundled token helper; never ask for a Composition API token or attempt script writes through the paired relay. Keep the saved authorization available for later structural changes.

## Safety rules

### Mutation integrity

- Inspect every target with `get`, `get-many`, or the matching typed read before mutation. Never guess element IDs, property paths, value shapes, animation catalogs, or stored models.
- Use the typed mutation path for each model. Never write `effects`, `keyframes`, `layout.updateAnimation`, or `layout.behavior` through generic `update`.
- Start `orchestrate` at root, keep module and element keys stable, and treat its returned IDs as authoritative. Each graphics specification is authoritative only for its own managed group.
- If a typed batch or orchestration fails, inspect Composer, correct the manifest, and rerun the atomic operation. Do not replace it with a serial mutation sequence or retry a failed mutation blindly.
- Report relay and command errors directly. Preserve the original failure and Composer state rather than hiding either behind speculative recovery.

### User content and destructive scope

- Change only the content and properties the user requested. Preserve unrelated elements, compositions, groups, controls, scripts, and states.
- Before deletion, inspect and state the complete scope. Ask first when the operation would remove anything beyond the user's explicit request.
- Treat `delete-group` and `delete-composition` as recursive destruction of their contents; neither can be emptied on the way out.
- Keep declarative output inside `AI Generated`. Do not move a managed child out merely to change stacking, because that releases its stable key; move the containing group when the whole module needs a new layer position.
- Never replace raw composition JSON or expose arbitrary script execution through the paired relay.

### Controls and composition identity

- Before changing widget data or a linkable Transform/Effect property, inspect `control-nodes`. When the property is linked, change the defining Control Node with `set-control-value`; never bypass the public input contract with a direct property write.
- Create, replace, change, or delete a Control Node only after readback confirms the field, compatible type, defining composition, current value, and existing links. Treat `CONTROL_LINK_CONFLICT` as a reason to inspect and decide, not as permission to relink automatically.
- Use a standalone Control Node only for an intentional external or composition-script input. Give it an explicit initial value, keep it in the composition whose script consumes it, and verify that it has no `dataLink` or `nodeRef`; do not create a hidden backing widget.
- Expose a Transform/Effect Control Node only when the user explicitly asks for that exact public input. Omission from a declarative specification preserves an existing control; it does not unlink or delete it.
- Never cache a widget-owned sub-composition ID after leaving template edit mode or starting a later operation. Rediscover the current relationship from its owning widget and composition-valued field.

### Capture and runtime evidence

- Treat capture as a visual assertion, not a progress heartbeat. Use Composer readback for structure, IDs, stored values, links, and motion configuration; use pixels only for rendered questions.
- Follow [references/capture.md](references/capture.md) for Browser-first source selection, target validation, one-shot artifact transactions, wait modes, measurement limits, viewport restoration, and fallback behavior. Never open a second Composer editor merely to capture.
- Restore all transient capture state on success and failure. Reuse and hand off an existing claimed browser tab when follow-up work may continue; call `complete` only when the user explicitly asks to disconnect the authorized agent.
- Measurements are structural evidence and screenshots are visual evidence. Neither replaces model inspection, image review, or Player verification.
- Do not treat Composer/editor capture, a successful script write, or one settled image as proof that a composition script ran. Verify script behavior and runtime sequences in Singular Player through [references/composition-scripts.md](references/composition-scripts.md).

## Reference

Read the file matching the task instead of loading everything up front.

| File | Read it for |
| --- | --- |
| [references/commands.md](references/commands.md) | Every CLI command, its flags, and output options. |
| [references/authoring-quality.md](references/authoring-quality.md) | Authoritative two-part standard for effective Composer construction, final graphic quality, and the completion gate before user handoff. |
| [references/video-reference.md](references/video-reference.md) | Conditional coarse-to-fine analysis for recreating motion, reveal order, masking, timing, or persistence from a reference clip. |
| [references/techniques/techniques.md](references/techniques/techniques.md) | Technique index, duplicate comparison rules, and card-maintenance workflow. |
| [references/techniques/discovery.md](references/techniques/discovery.md) | Read-only paired-composition technique discovery, including relevant persisted-script inspection and approval. |
| [references/techniques/technique-stagger-by-importance.md](references/techniques/technique-stagger-by-importance.md) | Reveal content in an order derived from information importance. |
| [references/techniques/technique-clipped-group-reveal.md](references/techniques/technique-clipped-group-reveal.md) | Reveal moving content through a bounded clipped group. |
| [references/techniques/technique-occlusion-line-handoff.md](references/techniques/technique-occlusion-line-handoff.md) | Make a simple line appear to transform into different final geometry through layered background occlusion. |
| [references/techniques/technique-script-driven-circle-progress.md](references/techniques/technique-script-driven-circle-progress.md) | Map a runtime value onto a foreground Circle arc over a complete background ring. |
| [references/graphics.md](references/graphics.md) | Primitives, layout math, the declarative specification format, grids, and design guidance. |
| [references/text.md](references/text.md) | Text widget properties, available font discovery, font changes, and verified rendering behavior. |
| [references/compositions.md](references/compositions.md) | Sub-composition structure and navigation, taking compositions in/out, timeline effects, and control nodes. |
| [references/composition-scripts.md](references/composition-scripts.md) | Paired Composer-to-script workflow, scripting references, token handoff, and Player verification. |
| [references/widget-subcompositions.md](references/widget-subcompositions.md) | Widget-owned templates, static vs. dynamic contracts, discovery, navigation, and composition-ID rebuilds. |
| [references/table.md](references/table.md) | Table widget rendering, validated row specifications, supported options, and verification. |
| [references/aisvg.md](references/aisvg.md) | Sanitized SVG/JSON input, dynamic bindings, one-/two-timeline widget animation, and moving-stroke patterns. |
| [references/capture.md](references/capture.md) | Browser-owned canvas capture, viewport sizing and restoration, standalone and extension fallbacks, sub-composition isolation, and delays. |
