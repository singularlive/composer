# Reusable authoring technique index

Use this index to select existing technique cards and to compare candidates discovered in a paired composition. Technique cards are adaptable heuristics, not templates, executable manifests, or instructions to copy a source composition's theme, geometry, content, or exact timings.

## Available cards

| Technique | Use when | Card |
| --- | --- | --- |
| Stagger animation by information importance | Several pieces of content need a deliberate reading order. | [technique-stagger-by-importance.md](technique-stagger-by-importance.md) |
| Reveal content through a clipped group | Moving content must remain hidden outside a bounded region. | [technique-clipped-group-reveal.md](technique-clipped-group-reveal.md) |
| Hand off a line through background occlusion | A simple line or shape must appear to transform into different final geometry using native Timeline stages. | [technique-occlusion-line-handoff.md](technique-occlusion-line-handoff.md) |
| Drive circle progress from a runtime value | A bounded metric, countdown, or completion value should appear as a changing ring. | [technique-script-driven-circle-progress.md](technique-script-driven-circle-progress.md) |

Read only the card matching the current request or discovery candidate.

For paired-composition extraction, follow [discovery.md](discovery.md). This index owns candidate comparison and card maintenance; the discovery reference owns the read-only inspection workflow.

## Compare discovery candidates

Compare the candidate's **Use when** and **Principle** with every index entry:

- **New:** it introduces a distinct reusable authoring decision, structural relationship, runtime lifecycle, or verification outcome.
- **Merge:** it shares an existing principle but adds a reusable condition or instruction that improves that card.
- **Duplicate:** it expresses the same intent and principle with different source styling, widgets, effects, easing, timing, or geometry.
- **Not a technique:** it is source-specific appearance, content, literal measurements, or command knowledge already covered by another reference.

Do not create separate cards merely because two sources use different effects or example values.

## Maintain the index

After the user approves a new or merged candidate:

- create one flat `technique-<short-slug>.md` file for a new card, or update the matching existing file;
- use exactly the five card fields: **Use when**, **Principle**, **Apply**, **Adjust**, and **Verify**;
- make every card self-contained: an agent must be able to understand and apply it without access to the source composition, source script, or source-specific evidence;
- define every identifier before its first use. Distinguish documented Singular API methods and payload properties from local variables, formula symbols, placeholders, and example element names. State that example names must be replaced with names resolved from the target composition;
- for a script-dependent card, explain within **Apply** the script owner, stable lookup names, input and event source, value mapping, widget payload writes, guards, initialization, state transitions, and cleanup that are essential to reproduce the behavior; keep optional source behavior out of the core contract;
- for a script-dependent card, make **Verify** require deterministic Player inputs that exercise initialization, updates, boundaries, irrelevant events, and any lifecycle transition the technique depends on;
- add or update one index row without copying the complete card into this file;
- add or update the matching direct link in the `composer` SKILL.md Reference table;
- keep source measurements and investigation evidence outside the runtime catalog.
