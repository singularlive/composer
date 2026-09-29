# Composer authoring recipes

Recipes describe reusable ways to combine Composer structure, widgets, Control Nodes, composition scripts, animation, and Player verification. Evidence is specific to each pattern and version. They do not replace the authoritative command, widget, or scripting contracts. Read the recipe first to establish its structural and lifecycle constraints, then load its references by phase: authoring before structural mutation, scripting before script work, and verification before Player work. A planning dependency may require an earlier read; do not defer a contract needed to choose safe structure or public inputs. Confirm the relevant live schemas and existing composition state before mutation.

Add or use a recipe only when the pattern is reusable, non-obvious, and verified in Singular Player. A recipe should explain how to combine Composer capabilities; a reusable rendering algorithm alone is not sufficient. Keep application-specific algorithms and their regressions outside the shipped skill, and one-off visual treatments in the composition.

Candidate patterns awaiting Player verification are listed separately below. Do not call an unverified runtime claim established. Their application algorithms, visual choices and acceptance scenarios are task-specific examples, not mandatory Composer skill tests or a backlog of product QA. During skill maintenance, check syntax, API use, safety and truthful evidence labels; run application acceptance only for an explicitly requested graphic workflow.

| Desired result | Recipe | Use it for |
| --- | --- | --- |
| One coherent overlay with movable bounds and shared motion | [Overlay in a sized group](recipes/overlay-in-a-sized-group.md) | Lower thirds, reporter tags, bugs, and other units whose children share one canvas position and lifecycle |
| Move an existing local palette or font contract to global scope | [Promote theme controls to root](recipes/promote-theme-controls.md) | Preserve current values, verify replacement ancestor links, then retire only unused local theme controls |
| Add portrait output without replacing an existing landscape graphic | [Add a portrait presentation](recipes/existing-module-portrait.md) | Shared content/theme sources, isolated display relevance, and one parent-owned lifecycle |
| Adjacent text segments with independent text, font, and color | [Inline styled text](recipes/inline-styled-text.md) | Mixed-font phrases, dynamic adjacent labels, or text runs whose positions depend on rendered extents |
| Independently animated content that may be conditionally visible | [Optional animated module](recipes/optional-animated-module.md) | Callouts, sponsor labels, alerts, secondary statistics, and other locally owned optional graphics |
| Reusable animated breaking-news lower third | [Breaking-news lower third](recipes/breaking-news-lower-third.md) | Urgent labels and replaceable headlines with independent lifecycle and Update motion |
| Square-left and rounded-right native panel | [Asymmetric Rectangle panel](recipes/asymmetric-rectangle-panel.md) | Solid lower-third bars, labels, and tabs requiring asymmetric corners without AI Graphics |
| A current date/time display with shared typography | [Current-time clock module](recipes/current-time-clock-module.md) | Lower thirds, scoreboards, bugs, and other modules needing a native ticking clock without JavaScript |
| An operator-controlled sports countdown that continues into overtime | [Sports game clock with overtime](recipes/sports-game-clock-with-overtime.md) | Default to native Timer for new game clocks; preserve the legacy Time Control recipe for existing graphics and custom `+m:ss` presentation |
| Public AI Graphics styling with script-owned runtime data | [Linked AI Graphics style](recipes/linked-ai-graphics-style.md) | Directly linked colors and dimensions combined with script-forwarded data or discrete motion commands |

## Candidate pending Player verification

- [Three.js extruded text](recipes/threejs-extruded-text.md): native font/text controls, bounded outline geometry, explicit external dependencies, stale-load disposal and an adaptable same-Player scenario. Supplied task evidence is not broad font compatibility or an independently replayed implementation.

- [Root external input with descendant Mode gating](recipes/root-external-input.md): root standalone feed fields, one text writer, descendant visibility only, preserved timer theme links and a same-instance OCR scenario. Supplied Landscape evidence is not universal OCR/API or Portrait verification.

- [Opacity slider](recipes/opacity-slider.md): explicit affected-layer scope, 0 as off, preserved initial appearance, general numeric-string compatibility and a same-session 100/40/0/restore scenario; no automatic grouping of decorative layers.
- [Responsive particle overlay](recipes/responsive-particle-overlay.md): owned widget resize observation, uniform particle geometry/motion, bounded density transitions and cleanup; local resize matrix is separate from Player/output-resolution evidence.
- [Change-triggered celebration over linked values](recipes/change-triggered-celebration.md): preserve API-facing links and lifecycle ownership; trigger policy and perceptual timing belong to the requested application.
- [Material-preserving text color](recipes/material-preserving-color.md): one writer for derived gradient/outline properties; mixing proportions and visual acceptance belong to the graphic.
- [Public Google Sheet to Table](recipes/sheet-driven-table.md): source permissions, inspected template authoring, single write authority and script handoff. Fetching, parsing and polling are application work, not skill gates.
