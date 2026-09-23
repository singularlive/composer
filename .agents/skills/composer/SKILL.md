---
name: composer
description: Inspect, capture, create, and refine graphics in an open Singular Composer session, including composition elements, control nodes, layouts, timeline animations, and composition scripts. Use when AI needs to control Composer, verify graphics and runtime behavior, or respond to generate improvement handoff with retrospective feedback on user corrections; the retrospective requires no paired session.
---

# Singular Composer

Use the client with one unique connection name per conversation:

```bash
node scripts/composer-agent.js <command> --connection <conversation-connection-name> [options]
```

Reuse it for every command. Never reuse another profile or combine it with `COMPOSER_AGENT_CREDENTIALS`. Use only bundled CLIs. Never expose credentials, replace raw composition JSON, construct script REST calls, or add arbitrary relay execution.

Run `node scripts/dependency-preflight.js` once per package version, Node major, and lockfile digest; reuse success until one changes. Add `--capture` for Chrome. Use `doctor` for installation diagnostics. Always install the latest available Composer skill; never downgrade for protocol compatibility.

After `COMPOSER_AGENT_VERSION_MISMATCH`, follow [installation recovery](references/installation.md) before choosing Control Node types. Upgrade first, then reread type-specific references from the installed replacement; stale references are not authority for the new protocol.

## Route the task first

Read only references needed for the current task and phase.

| Task | Required reference |
| --- | --- |
| Install, upgrade, or verify the skill installation | [installation.md](references/installation.md) before changing any installed file |
| Pairing, global flags, structured files, isolated edits, failure recovery | [command-basics.md](references/command-basics.md) |
| Graphic creation, design, or reference matching | [authoring-quality.md](references/authoring-quality.md) |
| Isolated property edit | "Isolated property edits" in [command-basics.md](references/command-basics.md), then the matching widget guide |
| Elements, layout, fonts, primitives, or declarative graphics | [element-commands.md](references/element-commands.md), [graphics.md](references/graphics.md), or [auxiliary-commands.md](references/auxiliary-commands.md) |
| Widget selection or configuration | [widgets.md](references/widgets.md), then its routed widget guide |
| Compositions, app template matches, revisions, or display variants | [composition-structure.md](references/composition-structure.md), [composition-commands.md](references/composition-commands.md), [revisions.md](references/revisions.md), or [display-variants.md](references/display-variants.md) |
| Timeline, Update, Behavior, logic layers, or playback | [composition-motion.md](references/composition-motion.md) and [motion-commands.md](references/motion-commands.md) |
| Control Nodes, containers, values, links, or deletion | [control-nodes.md](references/control-nodes.md), then its routed creation, editing, or command reference |
| Native Timer duration control or `timerChanged` script messages | [control-node-timer.md](references/control-node-timer.md) |
| Widget-owned templates or output links | [widget-subcompositions.md](references/widget-subcompositions.md) or [widget-nodes.md](references/widget-nodes.md) |
| Capture or measurements | [capture.md](references/capture.md) |
| Composition scripts or Player behavior | [composition-scripts.md](references/composition-scripts.md) and its routed scripting references |
| Reusable construction pattern or supplied motion | [recipes.md](references/recipes.md) or [video-reference.md](references/video-reference.md) |
| `generate improvement handoff` | [improvement-handoff.md](references/improvement-handoff.md) |

`generate improvement handoff` is retrospective. Return its sanitized development prompt without pairing, work, inspection, or mutation.

## Authorize and work

Composer AI availability is deployment- and account-gated. If absent or ineligible, report the blocker and stop. For new authorization, request the visible six-character code; never request the token or poll an intent. Run `pair --code <code>` immediately when supplied. `PAIRING_CODE_INVALID` is terminal; request a fresh code without retrying. Require `paired: true` and `acknowledged: true`. Use `check-connection --connection <conversation-connection-name>` for a read-only check.

Do not filter pairing stdout/stderr or hide its exit status. Inspect the complete sanitized result; a protocol mismatch before the claim does not consume the code, but expiration still applies. Follow [installation recovery](references/installation.md) before retrying.

For tasks requiring editor commands, run before `inspect` or mutation:

```bash
node scripts/composer-agent.js begin-work --connection <conversation-connection-name>
```

Continue only for active authorization, connected editor, ready commands, and active lease. `begin-work` releases on readiness failure. On `OPERATION_CANCELLED`, stop until a new instruction. Before yielding, waiting, or ending, run:

```bash
node scripts/composer-agent.js finish-work --connection <conversation-connection-name>
```

Require `COMPOSER_WORK_RELEASED`. Before a blocking question, send `status --state waiting-for-user`, release, then wait. [Revisions](references/revisions.md) own the approval exception. Use `complete` only for explicit revocation.

## Inspect, mutate, verify

Composer is the source of truth:

1. Run `inspect`, confirm `activeComposition.stack`, and read targets through the narrowest applicable inspector.
2. Read required live schemas and ownership through the routed reference; never infer mutable contracts from memory.
3. Before the first high-impact mutation in a task, recommend a revision through the AI chat question UI and wait for the user's choice, except for a verified empty starter scene. A default group and empty default sub-composition with no authored content or Control Nodes do not need a backup prompt. Read [revision approval](references/revisions.md#revision-approval-before-mutation) for the scene-wide empty-starter check, other exclusions, and consent procedure before proceeding.
4. Make one coherent, bounded change through the highest-level supported operation.
5. Reinspect the changed scope and verify authoritative readback, links, ownership, and unrelated state.

Use bounded projections and temporary structured inputs. Never decompose failed atomic operations. Follow [command-basics.md](references/command-basics.md): after an uncertain outcome, obtain authoritative readback before retry. Report errors directly.

Change only requested content. Preserve unrelated structure, controls, links, scripts, and states. One destination has exactly one write authority; update linked fields through their defining source. The paired editor owns structure, the authenticated helper owns persisted script text, and Player owns runtime behavior. Follow routed revision, template, capture, and scripting safeguards.

Before handoff, confirm scope, readback, ownership, applicable visual/runtime evidence, cleanup, final state, and lease release. Report unverified behavior as pending.
