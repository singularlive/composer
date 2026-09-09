# Composer authoring recipes

Recipes describe verified ways to combine Composer structure, widgets, Control Nodes, composition scripts, animation, and Player verification into reusable results. They do not replace the authoritative command, widget, or scripting contracts. Read the recipe first to establish its structural and lifecycle constraints, then load its references by phase: authoring before structural mutation, scripting before script work, and verification before Player work. A planning dependency may require an earlier read; do not defer a contract needed to choose safe structure or public inputs. Confirm the relevant live schemas and existing composition state before mutation.

Add or use a recipe only when the pattern is reusable, non-obvious, and verified in Singular Player. Keep one-off visual treatments in the composition rather than generalizing them here.

| Desired result | Recipe | Use it for |
| --- | --- | --- |
| Adjacent text segments with independent text, font, and color | [Inline styled text](recipes/inline-styled-text.md) | Mixed-font phrases, dynamic adjacent labels, or text runs whose positions depend on rendered extents |
| Independently animated content that may be conditionally visible | [Optional animated module](recipes/optional-animated-module.md) | Callouts, sponsor labels, alerts, secondary statistics, and other locally owned optional graphics |
