---
name: composer
description: Inspect, capture, create, and refine graphics in an open Singular Composer session, including composition elements, control nodes, layouts, timeline animations, and composition scripts. Use when AI needs to control Composer or develop and verify graphics and runtime behavior for a paired composition.
---

# Singular Composer

Control the user's currently open Singular Composer session through the bundled client:

```bash
node scripts/composer-agent.js <command> [options]
```

The bundled CLIs are the only supported agent interface. Never replace raw composition JSON, expose credentials, or add arbitrary script execution to the paired editor relay. If a command reports `COMPOSER_SKILL_UPDATE_AVAILABLE`, tell the user once and continue unless another error blocks the task.

## Route the task first

Read only the references required for the current task:

| Task | Required reference |
| --- | --- |
| CLI names, flags, responses, structured files, sessions | [commands.md](references/commands.md) |
| Prompt-, screenshot-, or reference-driven graphic work | [authoring-quality.md](references/authoring-quality.md) |
| Primitives, layout, declarative graphics, grids | [graphics.md](references/graphics.md) |
| Choosing or configuring a widget | [widgets.md](references/widgets.md), then its routed widget guide |
| Ordinary sub-compositions, timelines, controls | [compositions.md](references/compositions.md) |
| Widget-owned templates | [widget-subcompositions.md](references/widget-subcompositions.md) |
| Widget-owned output links | [widget-nodes.md](references/widget-nodes.md) |
| Capture or measurements | [capture.md](references/capture.md) |
| Composition scripts or Player behavior | [composition-scripts.md](references/composition-scripts.md) and its routed scripting references |
| Recreating supplied motion | [video-reference.md](references/video-reference.md) |

## Authorize and hold one work lease

If no reusable authorization exists, ask the user to open **Composer AI**, request its six-character code, and run `pair --code <code>`. Pass `--server` only when the user explicitly needs another environment. Never request, print, or expose the access token. Require `acknowledged: true`; otherwise report the state and wait for reconnection or fresh pairing before continuing.

At the start of every Composer task, before `inspect` or any other editor command, run:

```bash
node scripts/composer-agent.js start-work
```

If work is canceled and a command returns `OPERATION_CANCELLED`, stop and do not reconnect until the user gives a new instruction. Before yielding, waiting for user input, or ending the task, always run:

```bash
node scripts/composer-agent.js finish-work
```

Require `COMPOSER_WORK_RELEASED`. Use `status --message <text>` before asking a blocking question, then release the lease before waiting. During a long script or Player phase, send a meaningful `status` update before the ten-minute lease can expire. Use `complete` only when the user explicitly asks to disconnect or revoke authorization; normal completion uses `finish-work`.

## Inspect, mutate, verify

Composer is the source of truth for editor work:

1. Run `inspect`, confirm `activeComposition.stack`, and read each target with `get`, `get-many`, `get-layouts`, or its typed inspector before mutation.
2. Read the relevant live primitive, font, animation, Behavior, Control Node, or widget schema. Never infer IDs, paths, values, or catalog options from memory.
3. Make one coherent, bounded change through the highest-level supported operation.
4. Reinspect the changed scope and verify authoritative readback, links, ownership, and unrelated state.

Use `inspect --summary`, `inspect --selection`, `get --selected`, filtered primitive/font reads, and `get-layouts` when their projections answer the question. Structured values and manifests belong in descriptive UTF-8 JSON files under one writable task-temporary directory; remove that directory after success or failure. Follow [commands.md](references/commands.md) for exact file options.

## Preserve structure and use atomic operations

Treat root as orchestration and shared-control space, not a graphics canvas. Put every newly authored graphic in a root-level ordinary sub-composition; keep its visuals and graphic-specific controls there. Preserve existing root visuals unless the user asks to migrate them. Put shared unit bounds on groups and use simple child fill or inset layouts.

Use the operation matching the requested scope:

- Several related ordinary modules: `orchestrate --file` from root.
- One composition's declarative graphic: required-version-2 `validate` then `apply`.
- Coordinated geometry: one `get-layouts` and one `set-layouts`.
- Related motion assignments: the matching batch Timeline, Update, or Behavior setter.
- Individual commands: only one isolated edit, diagnosis, repair, widget-template operation, or unsupported manifest structure.

Never decompose a failed atomic operation into serial mutations. Correct the manifest and rerun it. Keep declarative keys stable and content inside its managed ownership group.

Report every relay or command error directly. Preserve the original failure and Composer state instead of hiding either behind speculative recovery.

For newly authored text, prefer the matching Metric Text family primitive. Continue to inspect, preserve, and edit legacy Text; adding legacy Text is allowed when it keeps an existing legacy composition consistent. Route exact selection and authoring through [widgets.md](references/widgets.md).

## Protect user content and public inputs

- Change only requested content. Preserve unrelated elements, groups, compositions, controls, scripts, states, and links.
- Before deletion, inspect and state the complete scope. Ask first if it exceeds the user's explicit request. Treat group and composition deletion as recursive.
- Create, restore, or delete permanent revisions only on explicit request and follow the backup/readback workflow in [compositions.md](references/compositions.md).
- Inspect Control Nodes and Widget Nodes before changing linked widget data or layout. Update the defining source instead of bypassing a link; never replace a conflicting link implicitly.
- Create standalone controls only as intentional external or composition-script inputs. Expose Transform or Effect controls only when explicitly requested.
- Use only dedicated typed commands for Control Node metadata, Metric Fonts, Tables, containers, timers, and other specialized models. Follow [commands.md](references/commands.md) and [compositions.md](references/compositions.md).

## Respect widget-template identity

Widget-owned templates are not ordinary sub-compositions. Open or create them through the owning widget with `open-widget-subcomposition`, never `create-composition`. Their composition ID plus descendant element IDs, internal node keys, and recorded link locations are valid only for the current uninterrupted edit session. Declared Widget Node field IDs remain the semantic addressing contract.

Use the current `identityScope.sessionToken` as `--template-session` on template-scoped reads and mutations. After leaving, reopening, or starting a later task, discard every internal handle and rediscover the template through its owner tile plus composition-valued field. Follow [widget-subcompositions.md](references/widget-subcompositions.md).

## Keep runtime authorities separate

The paired editor owns composition structure. Authenticated composition-script routes own persisted script text through the bundled helper. Singular Player owns runtime behavior. Never construct script REST calls directly, ask for a Composition API token, or treat a successful script write or Composer capture as runtime proof.

Finish and verify structure and public inputs first. Then pipe a fresh `script-handoff` to the composition-script helper and follow [composition-scripts.md](references/composition-scripts.md). Verify scripts, continuous motion, tickers, timers, media, and event-driven behavior in Player.

## Capture only for visual evidence

Use model readback for structure and capture only when pixels answer an unresolved visual question. Do not use screenshots as progress heartbeats. Read [capture.md](references/capture.md) for readiness, targets, measurements, and temporal evidence; use [authoring-quality.md](references/authoring-quality.md) for the capture budget and completion gate. View every retained image before judging it.

## Final gate

Before handoff, confirm the requested scope, model readback, links, ownership, visual quality, applicable dynamic values, motion/runtime evidence, final composition state, temporary-file cleanup, and work-lease release. Report anything not verified as pending rather than complete.