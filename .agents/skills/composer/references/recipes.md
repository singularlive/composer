# Composer authoring recipes

Recipes describe verified ways to combine Composer structure, widgets, Control Nodes, composition scripts, animation, and Player verification into reusable results. They do not replace the authoritative command, widget, or scripting contracts. Read the recipe first to establish its structural and lifecycle constraints, then load its references by phase: authoring before structural mutation, scripting before script work, and verification before Player work. A planning dependency may require an earlier read; do not defer a contract needed to choose safe structure or public inputs. Confirm the relevant live schemas and existing composition state before mutation.

Add or use a recipe only when the pattern is reusable, non-obvious, and verified in Singular Player. Keep one-off visual treatments in the composition rather than generalizing them here.

| Desired result | Recipe | Use it for |
| --- | --- | --- |
| One coherent overlay with movable bounds and shared motion | [Overlay in a sized group](recipes/overlay-in-a-sized-group.md) | Lower thirds, reporter tags, bugs, and other units whose children share one canvas position and lifecycle |
| Adjacent text segments with independent text, font, and color | [Inline styled text](recipes/inline-styled-text.md) | Mixed-font phrases, dynamic adjacent labels, or text runs whose positions depend on rendered extents |
| Independently animated content that may be conditionally visible | [Optional animated module](recipes/optional-animated-module.md) | Callouts, sponsor labels, alerts, secondary statistics, and other locally owned optional graphics |
| Reusable animated breaking-news lower third | [Breaking-news lower third](recipes/breaking-news-lower-third.md) | Urgent labels and replaceable headlines with independent lifecycle and Update motion |
| Square-left and rounded-right native panel | [Asymmetric Rectangle panel](recipes/asymmetric-rectangle-panel.md) | Solid lower-third bars, labels, and tabs requiring asymmetric corners without AI Graphics |
| A current date/time display with shared typography | [Current-time clock module](recipes/current-time-clock-module.md) | Lower thirds, scoreboards, bugs, and other modules needing a native ticking clock without JavaScript |
| An operator-controlled sports countdown that continues into overtime | [Sports game clock with overtime](recipes/sports-game-clock-with-overtime.md) | Match clocks that count down from a fixed duration and then display elapsed overtime as `+m:ss` |
| Public AI Graphics styling with script-owned runtime data | [Linked AI Graphics style](recipes/linked-ai-graphics-style.md) | Directly linked colors and dimensions combined with script-forwarded data or discrete motion commands |
