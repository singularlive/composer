# Discover techniques from a paired composition

Use this workflow only when the user explicitly asks to discover, extract, or learn reusable techniques from the paired composition. Discovery is read-only in Composer and proposes repository changes before making them.

1. Read [techniques.md](techniques.md). Read the individual cards whose **Use when** descriptions might overlap the source behavior.
2. Run `inspect` and record the complete original `activeComposition.stack`.
3. Inspect the active scope:
   - use `get-many` for related groups and tiles rather than persisting raw scene output;
   - use `control-nodes` when links explain structural behavior;
   - read `timeline-animations`, `update-animations`, and `behaviors` before interpreting the corresponding stored models;
   - use `behaviors --id` for tiles whose continuous behavior may represent a candidate.
4. Traverse relevant ordinary sub-compositions with `open-composition`, tracking visited IDs and parent relationships. Do not use `open-widget-subcomposition`: its copy-on-exit lifecycle can replace the widget template, so discovery must report that scope as uninspected instead of risking a mutation.
5. Inspect relevant persisted scripts when the script list contains a script for the traversed scope or the visible structure suggests that runtime logic drives the candidate:
   - read [../composition-scripts.md](../composition-scripts.md) before crossing into token-script inspection;
   - create a fresh `script-handoff` from the narrowest useful active scope and pipe it directly to the bundled token helper;
   - use the read-only `list-scripts`, `summary`, and `get-script` paths as needed, using `summary --full` with the same handoff only when the target lies outside the active context;
   - read the scripting reference and relevant widget payload reference before interpreting runtime calls; the dedicated script endpoint is authoritative for script text;
   - keep the Composition API token and paired agent authorization in the handoff pipeline, and never reproduce either credential in notes, technique cards, logs, or the final response;
   - do not write, patch, clear, or verify scripts during discovery. Player verification is required later when applying a script-dependent card, not while extracting it.
6. For every script-dependent candidate, distill the complete causal chain: script owner; public and runtime inputs; event source and filters; parsing and normalization; clamping or fallback rules; stable composition and widget lookups; widget payload writes; initialization; composition-state transitions; and cleanup. Separate optional source behavior from the minimum behavior required to reproduce the technique.
7. Return to the original composition scope and run `inspect` again to confirm the exact stack. Do not call any create, update, move, apply, animation setter, behavior setter, orchestration, delete, or script-write command during discovery.
8. Distill at most five candidates and compare each with the index:
   - when identifying candidates, look for reusable decisions involving semantic reveal order, clipping and containment, old/new value replacement, shell-before-content sequencing, continuous behavior independent of state timelines, and module boundaries for independent control;
   - treat these as discovery lenses, not a fixed catalog; classify every candidate against the current index;
   - classify it as **New**, **Merge**, **Duplicate**, or **Not a technique** using the index rules;
   - compare intent and principle rather than widget type, visual styling, effect name, easing, timing, or geometry;
   - reject source-specific content and facts already explained by the normal command references.
9. Apply a self-contained acceptance check before proposing or writing a candidate:
   - confirm that the reusable prerequisites and complete causal chain are present without relying on the source composition, source script, or source-specific evidence;
   - define every non-API identifier and formula symbol before its first use;
   - identify documented Singular API methods and payload properties explicitly, and distinguish them from local variables and placeholders;
   - label example composition and widget names as examples that must be replaced with names resolved from the target composition;
   - reject or revise a candidate if an agent could not reproduce the technique from the card alone.
10. Present a compact table containing candidate name, classification, reusable principle, closest existing card, and proposed action. If nothing reusable is new, say so directly.
11. Before asking the blocking approval question in the AI Agent task, send the same request through `status`. Ask which **New** cards to add and which **Merge** proposals to apply. Do not edit technique references before the user approves specific candidates.
12. After approval, create or update only the selected card files, update the index row and the `composer` skill's Reference table, then run skill validation. Do not add source-specific evidence to the runtime catalog; record separate evidence only when the user explicitly asks for it.

Keep the Composer session active throughout. A discovery result is a proposal, not permission to change the paired composition.
