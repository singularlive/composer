---
name: composer
description: Inspect, capture, create, and refine graphics in an open Singular Composer session, including composition elements, control nodes, layouts, timeline animations, and composition scripts. Use when AI needs to control Composer, verify graphics and runtime behavior, or respond to generate improvement handoff with retrospective feedback on user corrections; the retrospective requires no paired session.
---

# Singular Composer

Control the user's currently open Singular Composer session through the bundled client. At the start of the conversation, generate one unique local connection name (for example a UUID) and retain it for that conversation only:

```bash
node scripts/composer-agent.js <command> --connection <conversation-connection-name> [options]
```

Pass that same `--connection` value to pairing and every later command. Never reuse it in another AI conversation or for another simultaneously connected composition. The name selects an isolated local credential profile and is not a Composer object ID or secret. `COMPOSER_AGENT_CREDENTIALS` is the supported alternative for an orchestrator that already supplies a unique credential file; do not combine it with `--connection`.

The bundled CLIs are the only supported agent interface. Never replace raw composition JSON, expose credentials, or add arbitrary script execution to the paired editor relay. If a command reports `COMPOSER_AGENT_VERSION_MISMATCH`, stop authoring, tell the user to update Composer and install the matching skill, and retry only after the versions match. Cleanup commands remain available so an existing work lease or authorization can be released safely.

## CLI dependencies

Use the exact dependency versions declared in the skill's `package.json`. Before first use of a CLI, verify the packages imported by that script resolve from its location. Check `playwright-core` and installed Chrome only before capture or Player verification, not as prerequisites for ordinary inspection or editing. If a required package is missing, install it through the target environment's normal Node dependency workflow, then retry.

Reuse available packages. If dependency setup is unavailable or prohibited, report it and stop before pairing. Capture and Player verification use the target machine's installed Chrome; follow their routed references.

After installing or upgrading, follow [installation.md](references/installation.md): verify the actual payload root, protocol version, and locked dependency resolution, then reread the installed `SKILL.md` and routed references. Generate and retain one conversation connection name before pairing. Continue only when pairing reports both `paired: true` and `acknowledged: true`.

## Route the task first

Read only the references required for the current task and phase. Before mutation, establish the ownership, public-input, and lifecycle constraints that affect the design; defer implementation details for later phases until those phases begin.

| Task | Required reference |
| --- | --- |
| CLI names, flags, responses, structured files, sessions | [commands.md](references/commands.md) |
| Graphic creation, layout/design refinement, or reference matching | [authoring-quality.md](references/authoring-quality.md) |
| Isolated text, color, or property edit with unchanged structure and behavior | "Isolated property edits" in [commands.md](references/commands.md), plus the matching widget guide when applicable |
| Primitives, layout, declarative graphics, grids | [graphics.md](references/graphics.md) |
| Choosing or configuring a widget | [widgets.md](references/widgets.md), then its routed widget guide |
| Ordinary sub-compositions, timelines, controls | [compositions.md](references/compositions.md) |
| Widget-owned templates | [widget-subcompositions.md](references/widget-subcompositions.md) |
| Widget-owned output links | [widget-nodes.md](references/widget-nodes.md) |
| Capture or measurements | [capture.md](references/capture.md) |
| Composition scripts or Player behavior | [composition-scripts.md](references/composition-scripts.md) and its routed scripting references |
| Reusable multi-capability construction patterns | [recipes.md](references/recipes.md), then its routed recipe |
| Recreating supplied motion | [video-reference.md](references/video-reference.md) |
| User asks `generate improvement handoff` after teaching or correcting the skill | [improvement-handoff.md](references/improvement-handoff.md) |

Treat the exact phrase `generate improvement handoff` as a retrospective reporting request, not a Composer authoring task. Read the routed reference and return its sanitized, self-contained development prompt without acquiring a work lease, reinspecting Composer, or modifying the composition or repository.

## Authorize and hold one work lease

If no reusable authorization exists in this conversation's connection profile, ask the user to open **Composer AI**, request its six-character code, and run `pair --connection <conversation-connection-name> --code <code>`. Pass `--server` only when the user explicitly needs another environment. Never request, print, or expose the access token. Require both `paired: true` and `acknowledged: true`; otherwise report the sanitized acknowledgement category and wait for reconnection or fresh pairing before continuing.

For tasks requiring editor commands, before `inspect` or any other editor command, run:

```bash
node scripts/composer-agent.js start-work --connection <conversation-connection-name>
node scripts/composer-agent.js wait-ready --connection <conversation-connection-name>
```

`start-work` acquires the lease immediately even while Composer is reconnecting. `wait-ready` is the non-mutating application gate: it returns immediately when authorization, the editor socket, its command handler, and the work lease are ready, or reports the last sanitized state after a bounded timeout. Use `--timeout <milliseconds>` only when the default 30 seconds is insufficient; the accepted range is 1–120000. It never reloads or navigates Composer.

If work is canceled and a command returns `OPERATION_CANCELLED`, stop and do not reconnect until the user gives a new instruction. Except for the bounded revision recommendation described below, before yielding, waiting for user input, or ending the task, always run:

```bash
node scripts/composer-agent.js finish-work --connection <conversation-connection-name>
```

Require `COMPOSER_WORK_RELEASED`. Use `status --message <text>` before asking a blocking question, then release the lease before waiting. During a long script or Player phase, send a meaningful `status` update before the ten-minute lease can expire. Use `complete` only when the user explicitly asks to disconnect or revoke authorization; normal completion uses `finish-work`.

## Inspect, mutate, verify

When the user pastes one or more strings ending with `@composer/widget ref_…`, `@composer/composition ref_…`, or `@composer/group ref_…`, preserve each complete string in a temporary JSON `references` array and run `resolve-references --file` immediately after `wait-ready`. Use only entries returned with `status: "resolved"` as direct targets. Report `missing` or `collision` rather than substituting a similarly named element. The readable names are display hints, never identity. Group resolved references by `compositionId` because ordinary mutation commands remain active-composition scoped.

Composer is the source of truth for editor work:

1. Run `inspect`, confirm `activeComposition.stack`, and read each target with `get`, `get-many`, `get-layouts`, or its typed inspector before mutation. Use `composition-tree` when the task needs the recursive ordinary hierarchy without navigation; its widget-owned template summaries deliberately omit internal identities.
2. Read the relevant live primitive, font, animation, Behavior, Control Node, or widget schema. Never infer IDs, paths, values, or catalog options from memory.
3. Make one coherent, bounded change through the highest-level supported operation.
4. Reinspect the changed scope and verify authoritative readback, links, ownership, and unrelated state.

Use `inspect --summary`, `inspect --selection`, `get --selected`, filtered primitive/font reads, and `get-layouts` when their projections answer the question. Structured values and manifests belong in descriptive UTF-8 JSON files under one writable task-temporary directory; remove that directory after success or failure. Follow [commands.md](references/commands.md) for exact file options.

## Preserve structure and use atomic operations

Preserve existing ownership. For new structure, follow "Choose the right structural unit" in [authoring-quality.md](references/authoring-quality.md), which owns root, nested-module, display-presentation, and shared-bounds policy.

Organize every agent-authored public Control Node into a semantic ordinary container before handoff. Group by operator workflow, default containers to Large (`width: "double"`), and use Small only for a concrete compact-layout reason.

Use the operation matching the requested scope:

- Several related ordinary modules: `orchestrate --file` from root.
- One composition's declarative graphic: required-version-2 `validate` then `apply`.
- Coordinated geometry: one `get-layouts` and one `set-layouts`.
- Selected ordinary widget fields or names: one `get-properties` and one `set-properties`.
- Requested legacy Text or Simple Ticker migration: inspect the tiles, then use one `upgrade-metric-widgets` batch.
- Metric Font changes: use `set-metric-font` for an unlinked widget field and `set-control-font` for a linked field's defining Control Node.
- Related motion assignments: the matching batch Timeline, Update, or Behavior setter.
- Composition exclusivity: inspect `logic-layers`, then use `set-logic-layer` or `rename-logic-layer` before controlling members.
- Display presentations: follow the ownership policy above; inspect `display-variants`, configure the complete ordered scene set from root, activate one natively, and assign element/control/container relevance with one `set-display-variant-relevance` manifest.
- Individual commands: only one isolated edit, diagnosis, repair, widget-template operation, or unsupported manifest structure.

For an ordinary wall clock or date/time display, use Singular's native Current Date and Time widget with a Widget Node-linked template. Do not create an operator Time control or composition-script timer when the native widget satisfies the requirement.

Never decompose a failed atomic operation into serial mutations. Follow "Mutation failure recovery" in [commands.md](references/commands.md): after an uncertain outcome, obtain authoritative readback before any retry. Keep declarative keys stable and content inside its managed ownership group.

Report every relay or command error directly. Preserve the original failure and Composer state instead of hiding either behind speculative recovery.

For newly authored text, prefer the matching Metric Text family primitive. Preserve entered casing with `transform: none` by default; use uppercase, lowercase, capitalize, or small-caps transforms only when the user or reference explicitly requests that behavior. Continue to inspect, preserve, and edit legacy Text; adding legacy Text is allowed when it keeps an existing legacy composition consistent. Route exact selection and authoring through [widgets.md](references/widgets.md).

For AI Graphics, treat the Composer widget rectangle as both the responsive viewport and the complete motion envelope. Composer owns outer placement and size; authored content fills the runtime root but may reserve bounded internal runway for transforms or effects. Treat generated field types as UI schema, not runtime JavaScript type guarantees, and normalize changed values at the lifecycle boundary. Prefer container-relative geometry and motion, and follow [ai-graphics.md](references/widgets/ai-graphics.md) for value normalization, pixel exceptions, Timeline 2, normalized progress, and temporal verification.

## Protect user content and public inputs

- Change only requested content. Preserve unrelated elements, groups, compositions, controls, scripts, states, and links.
- Before deletion, inspect and state the complete scope. Ask first if it exceeds the user's explicit request. Treat group and composition deletion as recursive.
- Before the first high-impact mutation in a task, recommend a revision through the AI chat question UI. High-impact work includes multi-composition or broad element changes, recursive deletion, migration, display-variant configuration, composition-script changes, control/link restructuring, orchestration, and replacement of an existing visual system. Do not prompt for inspection, capture, playback, isolated text/color/property edits, variant activation, or another high-impact phase already covered by a revision created during the same task.
- Prefill the decision through a recommended option named `Create revision: <description>`, where the concise description starts with `AI checkpoint before ` and names the planned operation. Also offer `Continue without revision` and `Cancel operation`, and allow a freeform answer for a custom revision description. The chat question API does not provide an editable prefilled text value; the recommended option is the default proposal. Do not add or request a Composer-side dialog.
- Before showing this blocking chat question, send a status describing the proposed operation and keep the work lease active so the Composer AI dialog remains open. This revision question is the sole exception to releasing the lease before waiting for user input. After the answer, run `wait-ready` and `inspect` again; if the lease expired while waiting, reacquire it with `start-work` first. If the user chooses a revision or supplies a custom name, create the revision before mutation and report its revision number. If the user continues without one, proceed only after the fresh inspection. If the user cancels, run `finish-work` and do not mutate.
- Create revisions automatically only after that explicit chat approval. Restore or delete permanent revisions only on explicit request and follow the backup/readback workflow in [compositions.md](references/compositions.md).
- Inspect Control Nodes and Widget Nodes before changing linked widget data or layout. Update the defining source instead of bypassing a link; never replace a conflicting link implicitly.
- Create standalone controls only as intentional external or composition-script inputs. Expose Transform or Effect controls only when explicitly requested.
- Use only dedicated typed commands for Control Node metadata, Metric Fonts, Tables, containers, timers, and other specialized models. Follow [commands.md](references/commands.md) and [compositions.md](references/compositions.md).

## Respect widget-template identity

Widget-owned templates are not ordinary sub-compositions. Open or create them through the owning widget with `open-widget-subcomposition`, never `create-composition`. Their composition ID plus descendant element IDs, internal node keys, and recorded link locations are valid only for the current uninterrupted edit session. Declared Widget Node field IDs remain the semantic addressing contract.

Use the current `identityScope.sessionToken` as `--template-session` on template-scoped reads and mutations. After leaving, reopening, or starting a later task, discard every internal handle and rediscover the template through its owner tile plus composition-valued field. Follow [widget-subcompositions.md](references/widget-subcompositions.md).

## Keep runtime authorities separate

The paired editor owns composition structure. Authenticated composition-script routes own persisted script text through the bundled helper. Singular Player owns runtime behavior. Never construct script REST calls directly, ask for a Composition API token, or treat a successful script write or Composer capture as runtime proof. Prefer a direct Control Node link or native widget whenever it expresses the behavior. For a same-composition script that must react to its own Control Nodes, apply once during `init` and on every `payload_changed`; do not filter those updates by `msg.compositionId`, because editor-originated changes may otherwise be ignored.

Finish and verify structure and public inputs first. Then pipe a fresh `script-handoff` to the composition-script helper and follow [composition-scripts.md](references/composition-scripts.md). Verify scripts, continuous motion, tickers, timers, media, and event-driven behavior in Player.

## Capture only for visual evidence

Use model readback for structure and capture only when pixels answer an unresolved visual question. Do not use screenshots as progress heartbeats. Read [capture.md](references/capture.md) for readiness, targets, measurements, and temporal evidence; use [authoring-quality.md](references/authoring-quality.md) for the capture budget and completion gate. View every retained image before judging it.

## Final gate

Before handoff, confirm the requested scope, model readback, links, ownership, visual quality, applicable dynamic values, motion/runtime evidence, final composition state, temporary-file cleanup, and work-lease release. Report anything not verified as pending rather than complete.
