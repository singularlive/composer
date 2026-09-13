---
name: composer
description: Inspect, capture, create, and refine graphics in an open Singular Composer session, including composition elements, control nodes, layouts, timeline animations, and composition scripts. Use when AI needs to control Composer, verify graphics and runtime behavior, or respond to generate improvement handoff with retrospective feedback on user corrections; the retrospective requires no paired session.
---

# Singular Composer

Control the user's open Singular Composer session through the bundled client. Generate one unique local connection name per conversation and retain it only for that conversation:

```bash
node scripts/composer-agent.js <command> --connection <conversation-connection-name> [options]
```

Reuse that `--connection` value for every command. Never reuse another conversation's profile or combine it with `COMPOSER_AGENT_CREDENTIALS`. The bundled CLIs are the only supported interface: never expose credentials, replace raw composition JSON, construct script REST calls, or add arbitrary execution to the paired relay.

## CLI dependencies

The core CLI is self-contained and Playwright Core is included as a required vendored dependency. Before first use, run `node scripts/dependency-preflight.js`; it always verifies Playwright, while `--capture` additionally checks Chrome. Run `node scripts/composer-agent.js doctor` for installation scope, duplicate copies, package/protocol versions, core and Playwright status; add `--capture` or `--connection <name>` for Chrome or server checks. On failure, follow [installation.md](references/installation.md) and stop before pairing. If any command reports `COMPOSER_AGENT_VERSION_MISMATCH`, stop authoring and follow its direction-aware protocol numbers: update Composer when the skill is newer, or update the selected skill when Composer is newer. If `check-connection` reports `EDITOR_RELOAD_REQUIRED`, reload or reopen the paired Composer composition and retry; the existing pairing persists. If it reports `COMPOSER_EDITOR_DISCONNECTED`, do not retry with a longer timeout or ask the user to open or foreground the AI panel. Release any work lease, then ask the user to reopen the paired composition; its Composer AI connection starts automatically.

## Route the task first

Read only the references required for the current task and phase. Before mutation, establish the ownership, public-input, and lifecycle constraints that affect the design; defer implementation details for later phases until those phases begin.

| Task | Required reference |
| --- | --- |
| Pairing, global flags, structured files, isolated edits, failure recovery | [command-basics.md](references/command-basics.md) |
| Graphic creation, layout/design refinement, or reference matching | [authoring-quality.md](references/authoring-quality.md) |
| Isolated text, color, or property edit with unchanged structure and behavior | "Isolated property edits" in [command-basics.md](references/command-basics.md), plus the matching widget guide when applicable |
| Elements, groups, layouts, properties, or fonts | [element-commands.md](references/element-commands.md) |
| Primitives or declarative graphics | [graphics.md](references/graphics.md) and [auxiliary-commands.md](references/auxiliary-commands.md) |
| Choosing or configuring a widget | [widgets.md](references/widgets.md), then its routed widget guide |
| Ordinary sub-composition structure | [composition-structure.md](references/composition-structure.md) and [composition-commands.md](references/composition-commands.md) |
| Revisions | [revisions.md](references/revisions.md) |
| Display variants | [display-variants.md](references/display-variants.md) |
| Timeline, Update, Behavior, logic layers, or playback | [composition-motion.md](references/composition-motion.md) and [motion-commands.md](references/motion-commands.md) |
| Control Nodes and containers | [control-nodes.md](references/control-nodes.md) and [control-node-commands.md](references/control-node-commands.md) |
| Widget-owned templates | [widget-subcompositions.md](references/widget-subcompositions.md) |
| Widget-owned output links | [widget-nodes.md](references/widget-nodes.md) |
| Capture or measurements | [capture.md](references/capture.md) |
| Composition scripts or Player behavior | [composition-scripts.md](references/composition-scripts.md) and its routed scripting references |
| Reusable multi-capability construction patterns | [recipes.md](references/recipes.md), then its routed recipe |
| Recreating supplied motion | [video-reference.md](references/video-reference.md) |
| User asks `generate improvement handoff` after teaching or correcting the skill | [improvement-handoff.md](references/improvement-handoff.md) |

Treat the exact phrase `generate improvement handoff` as a retrospective reporting request, not a Composer authoring task. Read the routed reference and return its sanitized, self-contained development prompt without acquiring a work lease, reinspecting Composer, or modifying the composition or repository.

## Authorize and hold one work lease

Composer AI availability is deployment- and account-gated. If the control is absent or pairing reports ineligibility, report the blocker and stop. For a new authorization, ask the user to open **Composer AI**, request its six-character code, and run `pair`; never request or expose the access token. When the user supplies a code, run `pair --code <code>` as the next pairing action; do not create or poll a pairing intent. `PAIRING_CODE_INVALID` is terminal for that code: report it immediately and request a fresh code without retrying. Require `paired: true` and `acknowledged: true`. Use `check-connection --connection <conversation-connection-name>` for a read-only connection check.

For tasks requiring editor commands, before `inspect` or any other editor command, run:

```bash
node scripts/composer-agent.js start-work --connection <conversation-connection-name>
node scripts/composer-agent.js wait-ready --connection <conversation-connection-name>
```

Continue only when `wait-ready` reports active authorization, connected editor, ready commands, and active work lease.

If work is canceled and a command returns `OPERATION_CANCELLED`, stop and do not reconnect until the user gives a new instruction. Except for the bounded revision recommendation described below, before yielding, waiting for user input, or ending the task, always run:

```bash
node scripts/composer-agent.js finish-work --connection <conversation-connection-name>
```

Require `COMPOSER_WORK_RELEASED`. Before a blocking question, send `status`, release the lease, then wait; revision approval is the sole exception. Keep long script or Player work alive with meaningful status updates. Use `complete` only when the user explicitly requests disconnection or revocation.

## Inspect, mutate, verify

Resolve pasted `@composer/... ref_…` handles immediately after `wait-ready`. Use only `resolved` targets; report `missing` or `collision` rather than substituting a similar name. Follow [command-basics.md](references/command-basics.md) for the manifest and scope rules.

Composer is the source of truth for editor work:

1. Run `inspect`, confirm `activeComposition.stack`, and read each target through the narrowest applicable inspector before mutation.
2. Read the relevant live primitive, font, animation, Behavior, Control Node, or widget schema. Never infer IDs, paths, values, or catalog options from memory.
3. Make one coherent, bounded change through the highest-level supported operation.
4. Reinspect the changed scope and verify authoritative readback, links, ownership, and unrelated state.

Prefer bounded projections over full inspection. Put structured inputs in one writable task-temporary directory and remove them after success or failure.

## Preserve structure and use atomic operations

Preserve existing ownership and choose structure through [authoring-quality.md](references/authoring-quality.md), which owns root, nested-module, display-presentation, and shared-bounds policy. Use the highest-level operation that covers the requested scope and batch related changes. Follow the routed command and composition references above.

Never decompose a failed atomic operation into serial mutations. Follow "Mutation failure recovery" in [command-basics.md](references/command-basics.md): after an uncertain outcome, obtain authoritative readback before any retry. Keep declarative keys stable and content inside its managed ownership group.

Report every relay or command error directly. Preserve the original failure and Composer state instead of hiding either behind speculative recovery. Route text, clocks, AI Graphics, and other widget decisions through [widgets.md](references/widgets.md) and the selected widget guide.

## Protect user content and public inputs

- Change only requested content. Preserve unrelated elements, groups, compositions, controls, scripts, states, and links.
- Before deletion, inspect and state the complete recursive scope. Ask first if it exceeds the request.
- Before the first high-impact mutation in a task, recommend a revision through the AI chat question UI. High-impact work includes multi-composition or broad element changes, recursive deletion, migration, display-variant configuration, composition-script changes, control/link restructuring, orchestration, and replacement of an existing visual system. Do not prompt for inspection, capture, playback, isolated text/color/property edits, variant activation, or another high-impact phase already covered by a revision created during the same task.
- Offer `Create revision: AI checkpoint before <operation>` as recommended, plus `Continue without revision` and `Cancel operation`, with freeform input enabled. Send `status` first and keep the lease active while waiting. After the answer, restore readiness and inspect again; create a revision only with explicit approval. On cancellation, release the lease without mutating. Follow [revisions.md](references/revisions.md) for restore and deletion safeguards.
- Inspect Control Nodes and Widget Nodes before changing linked widget data or layout. Update the defining source instead of bypassing a link; never replace a conflicting link implicitly.
- Give every destination property exactly one write authority. If a Control Node directly links a widget field, no composition script may also write that field; if a script derives or forwards a value, leave its destination unlinked. Diagnose link, payload, loaded-definition, and runtime behavior before proposing another write path.
- Create standalone controls only as intentional external or script inputs. Use dedicated typed commands for specialized models.

## Respect widget-template identity

Widget-owned templates are not ordinary sub-compositions. Enter them through the owner, use the current session token, and discard internal handles after leaving or reopening. Follow [widget-subcompositions.md](references/widget-subcompositions.md).

## Keep runtime authorities separate

The paired editor owns composition structure, the authenticated helper owns persisted script text, and Player owns runtime behavior. Prefer native widgets and direct links. Finish structure and public inputs before a fresh `script-handoff`; verify scripts, continuous motion, timers, tickers, media, and event-driven behavior in Player. Follow [composition-scripts.md](references/composition-scripts.md).

## Capture only for visual evidence

Use model readback for structure and capture only when pixels answer an unresolved visual question. Never use screenshots as progress heartbeats, and view every retained image. Follow [capture.md](references/capture.md).

## Final gate

Before handoff, confirm scope, authoritative readback, links, ownership, applicable visual/runtime evidence, final state, temporary-file cleanup, and work-lease release. Report anything unverified as pending.
