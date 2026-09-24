# Composition authoring standard

Read this reference before graphic creation, layout/design refinement, or reference matching. It is the single source of truth for composition-authoring best practice and the completion gate before handing finished work back to the user. For an isolated property edit that preserves structure and behavior, use "Isolated property edits" in [commands.md](commands.md); load this standard if the edit expands into design or structural work.

The standard has two equally required parts:

1. **Effective Composer construction** — the internal structure must be understandable, editable, controllable, and safe to refine. Users may not see this structure, but it determines whether the graphic behaves correctly and remains useful after handoff.
2. **Final graphic quality** — the rendered result must communicate clearly and look deliberate, coherent, and finished. This is the part the user sees directly.

Task-specific references define commands, schemas, and implementation mechanics. When a specialized reference repeats or illustrates an authoring principle, this document owns the principle.

## User requirements and design judgment

The user's request owns explicit content, style, behavior, assets, and scope. Use supplied references and the inspected composition to resolve context, then apply your own design judgment to content, layout, controls, and motion where the request leaves room for interpretation. Keep safe assumptions proportionate to the request and preserve unrelated content.

Plan the required structure, public inputs, lifecycle, and acceptance checks in whatever concise form serves the task. No prescribed brief format is required. Ask only when a missing decision materially changes the requested output, controls, runtime behavior, or required branding.

For graphics driven by an external source, establish whether the user wants a snapshot or live updates before building. Confirm the exact source/tab/range, refresh interval, empty/error behavior and who owns subsequent edits. Connector access is not Player authorization. Public Google Sheets use the [sheet-driven Table recipe](recipes/sheet-driven-table.md); private-sheet integration is outside that recipe's scope.

Apply the construction rules, visual-quality requirements, and completion gate below to the user's requirements and the task-specific choices. They remain the standard for every graphic, including work created from a sparse prompt.

### Control App compatibility

The matched [composition contract is inviolable](composition-commands.md#contract-preservation). Decline breaking requests even when explicit; do not offer a template switch or match clearing to enable them. Required names, node IDs/types/scopes and behavior remain intact while contract-safe additions and visual edits proceed within the authorized scope.

For structural authoring, inspect `app-template-match` to discover an existing Control App template contract. For a requested Control App integration or changes to externally addressed structure, controls, or behavior, follow [Using Integration Resources](composition-commands.md#using-integration-resources) before choosing those interfaces. A graphic can look correct while remaining unusable by its Control App if a required public ID, type, composition scope, or lifecycle differs. Preserve documented interfaces; design freely only where the contract leaves room. Unrelated isolated visual edits need no resource fetch or template reassignment.

## Capture budget

Use zero captures for nonvisual or model-only work and normally one for a straightforward visual build or fix. For reference-driven work, allow up to five successful refinement captures by default; baseline, settled In, settled Out, and required animation-state evidence are verification captures and do not consume that budget. Continue past five only while each pass addresses a concrete discrepancy, with ten successful refinement captures as the emergency ceiling. Failed captures do not count. Never recapture unchanged output. Stop when the result is close enough, the latest pass makes no meaningful improvement, two consecutive passes fail to reduce the discrepancy, or Composer returns a non-recoverable apply or capture error.

## Part 1: Effective Composer construction

### Scope and preservation

- Build only what the user requested. For overlay work, do not add a full-frame background unless the user asks for one.
- Preserve unrelated user-created elements, groups, compositions, controls, scripts, and states.
- Inspect the active composition and relevant targets before authoring. Treat Composer readback as authoritative for structure, values, links, and scope.
- Make the smallest coherent change that fulfills the request. Do not reorganize existing content merely to make it match the agent's preferred structure.

### Choose the right structural unit

- Treat the **root composition** as an orchestration and shared-control layer. Independent graphics belong in root-level ordinary sub-compositions, not as Rectangle, Text, Image, or other visual tiles directly in root. Nest extensions and optional modules inside the nearest composition owning the surrounding graphic's layout and animation; preserve existing presentation ownership when extending a graphic.
- Use a **tile** for one independently editable visual or widget, such as a background shape, text value, image, divider, or table. Do not combine separately aligned or separately controlled values into one tile merely to reduce element count.
- Use a **group** when elements in the same composition need shared clipping, bounds, layer movement, or a genuinely shared animation lifecycle. A newly authored single coherent overlay defaults to one sized group: put the unit's canvas position and size on that group; make its children fill the group or use simple group-relative insets so a human can move and resize the complete unit from one place; and put its shared entrance/exit on the group. Position or animate a child independently only when its role genuinely requires different geometry or lifecycle. Do not group persistent and transient elements under one hiding animation. Follow the [overlay-in-a-sized-group recipe](recipes/overlay-in-a-sized-group.md) for the reusable construction pattern.
- Use a **sub-composition** for a complete module the user is likely to take in or out, animate, edit, reuse, or control independently. Examples include a score bug, lower third, story list, or ticker.
- Treat display variants of one logical graphic as presentations inside that graphic's single root-level sub-composition. Keep one shared Control Node set in the parent and place variant-specific groups or child compositions below it. Split variants into separate root modules or duplicate their controls only when the user explicitly requests independent lifecycle or payload contracts.
- Keep sibling modules in sibling sub-compositions even when they normally appear together. Nest only when a module contains another independently controlled module.
- Group by control and lifecycle intent, not by primitive type. A module's background, accents, images, primary text, and supporting text should remain operationally coherent.
- Remember that ordinary sub-compositions retain the full Composer canvas coordinate system; they are control boundaries, not cropped layout regions.
- Preserve existing root visuals unless the user explicitly asks to migrate or replace them; the sub-composition rule governs new authoring and does not authorize unrelated restructuring.

### Prefer editable native structure

- Prefer Metric Text family widgets, Rectangle, Circle, Image, and other supported native primitives when they can express the design cleanly. Use legacy Text for new elements only when extending a composition that already uses it and consistency is more important than introducing Font 2.0; continue to understand and preserve existing Text widgets.
- Use Table for genuinely repeated tabular content rather than manually duplicating rows.
- Use AI Graphics for one coherent programmable graphic when standard primitives cannot faithfully represent its HTML, inline SVG, Canvas, procedural geometry, or lifecycle behavior. Keep ordinary text, images, and shapes as native elements when independent editing is valuable.
- Add composition scripts only when persisted runtime logic is required. Do not use a script to replace structure, links, timelines, or widget behavior that Composer already represents directly.

### Author for safe refinement

- Give modules, tiles, groups, controls, and script-addressed widgets concise semantic names based on their roles. Omit generic implementation words such as `Graphics` and `Presentation` when they add no meaning. When one composition needs multiple groups, name their distinct functions, for example `Full-Screen Background`, `Full-Screen Left Side`, and `Full-Screen Right Side`.
- Use one version-2 declarative graphics specification per authored composition and keep element keys stable across refinement passes.
- Prefer one atomic orchestration manifest for several related ordinary modules. Within one composition, batch related Timeline, Update, or Behavior assignments.
- Keep declaratively managed elements inside their managed ownership group. Reuse the same specification and keys when refining instead of rebuilding equivalent elements.
- Use top-left semantic placement, styles, regions, grids, templates, and repeats when they make layout intent clearer and eliminate duplicated coordinate math.
- Keep layer order deliberate: structural backgrounds first, then accents and images, with foreground text and status details above them unless the requested design requires another relationship. Composer Navigator order is front-to-back, where index `0` is foremost; declarative `elements` arrays are back-to-front. Diagnose stacking before compensating with geometry when an element appears to intrude into another region.

### Design the public control contract

- Identify values the user or an external system is expected to change, and give those values stable widget or Control Node contracts.
- By default, use Control Nodes for operator/external inputs and write script-fetched or derived data directly to unlinked widget properties. Read inputs with `getPayload2()`. This is a design preference, not an absolute prohibition: a justified exception may assign data to a Control Node when its runtime consumer and ownership contract warrant it. Document the reason and verify the intended host behavior. Output/Player iframe writes do not propagate back to the Control App UI; do not assume they publish operator-facing data or status. Retain last good output on failure and use sanitized console warnings unless a separate supported channel or on-output indicator is explicitly agreed. See [composition scripts](composition-scripts.md) for the authority and evidence boundary.
- Keep intentionally constant design labels as native text without public Control Nodes. Labels such as `LIVE`, `NEWS`, units, and fixed category names should be exposed only when the operator or external payload is expected to change them.
- Keep graphic-specific controls in the same sub-composition as the elements they drive.
- Decide content ownership separately from theme ownership. Graphic-specific copy stays with its module; put shared palette and font sources at root when global scope is requested or already established. "Make the color and font controls global" does not authorize moving text-content controls. Do not make every color or font global by default; preserve the intended scope and ask only when it is materially ambiguous. Use [Promote theme controls to root](recipes/promote-theme-controls.md) for an existing local theme and [Add a portrait presentation](recipes/existing-module-portrait.md) when extending an existing graphic without duplicating its public inputs.
- Put a font, color palette, or other theme Control Node in root when it is intentionally shared by some or all root-level graphic sub-compositions, then link each descendant target to that one root-owned source through the native ancestor-control path.
- Interpret requests such as “change the colors,” “make the colors changeable,” or “use what is there” in a template-editing context as a request to expose theme Color Control Nodes initialized from the current rendered values, not to freeze those values. When scope is ambiguous, confirm which colors or modules should share controls. For a shared palette, define root-owned semantic controls such as Accent, Panel, and Text, link them across descendant modules, and verify that linking does not change the rendered result.
- Put every agent-authored public Control Node in a semantic ordinary Control Node container. Group controls by operator workflow, default each container to Large (`width: "double"`), and use Small (`width: ""`) only when a concrete density or layout reason makes the narrower presentation better. Leave the container `toolTip` empty unless the operator needs non-obvious behavioral context.
- Keep public control IDs unique and stable for payload and script addressing. Inside a semantic container, use concise `title` metadata such as `Name`, `Score`, or `Color` rather than repeating context already supplied by the container title.
- Prefer native direct links when one public input supplies the exact same value to one or many widget properties; use `--reuse-existing` for additional targets. Derived variants such as a darker shade remain script-owned presentation and must not also be linked.
- Use bounded Counter controls for discrete stepwise operator values such as scores, wins, periods, or fouls. Set domain-appropriate integer `min` and `max` values and deliberate action buttons rather than leaving the range implicit.
- Use a script only when an input must be interpreted, combined, formatted, or routed.
- When a sport has a standard operator-controlled game clock, recommend a native Time Control and Timer-based implementation during design discussion. Do not default to a free-form Text control or synthesize elapsed state from `Date.now()`.
- Match the public input to the renderer's visible capability: use a Text control for a single-line renderer, even when a Textarea link is technically compatible; reserve Textarea for renderers that visibly support line breaks or wrapping.
- Do not expose Transform or Effect properties as Control Nodes merely because they are technically linkable. Expose them only when the user asks for those exact public controls.
- Once a script relies on a composition or widget name, treat that name as part of the runtime contract and change the structure and script together.

### Build for real content and lifecycle

- Size and arrange the graphic for plausible live values, not only the initial sample. Account for longer names, wider numbers, missing images, empty fields, and repeated rows where applicable.
- Give every intended logo, photo, headshot, sponsor mark, or other asset its own Image tile even when only the approved placeholder is available.
- Decide which elements are persistent and which are transient before assigning motion.
- Use one containing animation only when every child shares the same lifecycle. For mixed lifecycles, animate the appropriate children or separate them structurally.
- Ensure every requested module has a coherent settled In state and the intended settled Out state. Treat Update animation and continuous Behavior as distinct runtime contracts rather than extensions of the In/Out timeline.
- For scripts, initialize from the current payload, guard lookups and inputs, avoid redundant writes by comparing with live widget payload when practical, and clean up owned timers, listeners, streams, and network activity in `close()`. Never let an in-memory “last written” cache suppress a required repair when another runtime surface may have reapplied widget model data.

## Part 2: Final graphic quality

### Theme and visual language

- Establish one coherent visual language across the complete graphic: palette, typography, corner treatment, stroke weight, shadows, spacing rhythm, and motion character should feel related.
- Use variation to communicate hierarchy or state, not as accidental inconsistency. Repeated roles should use repeated visual treatment.
- Prefer a few purposeful shapes and accents over decorative clutter.
- Match the requested or reference theme at the level of major bounds, visual weight, color relationships, type hierarchy, and motion character before refining small details.
- Treat reference-specific geometry and direction, including wedge points, slants, reading direction, and entrance direction, as observed design intent. Do not promote one reference's orientation into a reusable rule.

### Composition and information hierarchy

- Establish one clear reading order. Make the most important live values easiest to find and keep secondary labels visibly subordinate without sacrificing readability.
- Keep the requested foreground graphic balanced within broadcast-safe margins.
- Give related content clear proximity and separation. Modules should read as intentional units without colliding or appearing accidentally detached.
- Use whitespace deliberately. Similar gaps should feel consistent, while larger separations should communicate stronger grouping boundaries.

### Alignment by information role

- Align content according to its semantic role, not merely the position of its bounding box.
- Center isolated focal values such as scores, clocks, or metrics within their intended cells.
- Left-align the primary and secondary text of a left-side identity block. Right-align the corresponding text of a right-side identity block.
- Keep each primary label and its subtitle on the same alignment edge so mirrored layouts read as one balanced system.
- Make box geometry and internal Text alignment agree. A centered Text tile requires both the intended centered bounds and a stored Text alignment of `center`; moving the box alone does not change the widget's default alignment.
- Preserve shared baselines, centerlines, padding, and visual weight across mirrored or repeated structures.

### Typography and legibility

- Use a small, deliberate type hierarchy with consistent roles for primary values, names, subtitles, labels, and status text.
- Keep font family, weight, size, case, line height, and tracking consistent for repeated roles.
- Preserve operator-entered casing by default. Apply uppercase, lowercase, capitalize, or small-caps transforms only when the user or reference explicitly requires that treatment.
- Resolve and apply the intended font before fine-tuning text alignment, spacing, or box geometry because Metric Font metrics can materially change the rendered fit and baseline.
- Judge readability at the intended output resolution, not only while zoomed into the editor.
- Preserve strong foreground/background contrast. Do not rely on fine outlines or shadows to rescue weak contrast.
- Size text boxes for their intended content and overflow behavior. Confirm that realistic longer values do not collide, clip, wrap unexpectedly, or shrink disproportionately.

### Color, spacing, and assets

- Use consistent internal padding and repeat spacing across related cells, labels, and modules.
- Use color consistently to communicate hierarchy, category, or state. Avoid accents that compete with the primary information.
- Check contrast and legibility across every major background the graphic can appear over when transparency or partial coverage is part of the design.
- Preserve intended image aspect ratio, crop behavior, padding, and visual prominence. A placeholder must occupy the same designed slot as the eventual asset.
- Avoid effects that look accidental at output resolution, including clipped shadows, uneven corner radii, mismatched opacity, and inconsistent blur or stroke treatment.

### Motion and temporal quality

- Use motion to reinforce information hierarchy and spatial relationships. Tightly coupled content should move coherently.
- For layered graphics, stage structural panels, accents, primary text, and supporting text with restrained offsets when that sequence clarifies hierarchy. Do not apply one uniform effect merely for convenience, and do not let decorative motion dominate the message.
- Avoid full-canvas directional translation for unmasked text when partial glyphs crossing the frame edge would look accidental. Move the containing panel or clipped group, or reveal the text with a synchronized fade after its support enters.
- Keep direction, duration, easing, and stagger purposeful and reasonably consistent across related elements.
- Account for every visible background, accent, divider, image, label, subtitle, and decorative element during In and Out.
- Require a complete settled In state. For Out, remove every transient element cleanly while preserving anything the requested lifecycle says should remain.
- Verify meaningful intermediate states when timing, masking, clipping, occlusion, path drawing, or staged reveals affect the design. A settled frame alone cannot prove those effects.
- Treat composition state and timeline readback as implementation evidence, not visual proof. A reported `Out1` or `Out2` state does not prove that the frame looks correct.

### Reference-driven refinement order

When comparing authored output with a supplied design, resolve discrepancies in this order:

1. overall bounds, placement, and silhouette;
2. layer order and occlusion;
3. font family, weight, casing, and type hierarchy;
4. internal alignment, spacing, and detailed geometry;
5. motion character, timing, and intermediate states.

Do not tune downstream geometry around an incorrect layer order or temporary font. Use model readback for structure and exact values; use captures only for unresolved visual differences.

## Completion gate before user handoff

Do not present composition work as finished until every applicable check below passes:

1. **Scope:** The requested graphic is complete, unrelated content is preserved, and the active composition stack is correct.
2. **Structure:** Tiles, groups, and sub-compositions follow control and lifecycle intent; names, stable keys, ownership, links, and public controls are understandable and verified through Composer readback. Every agent-authored public control is in a semantic ordinary Control Node container, Large by default.
3. **Editability:** Native primitives are used where practical; AI Graphics, Table, widget templates, and scripts are used only for the portions that require them.
4. **Rendered quality:** Inspect or capture the result at the intended resolution and check theme consistency, safe bounds, clipping, hierarchy, alignment, internal Text alignment, spacing, typography, contrast, effects, and asset placement.
5. **Dynamic content:** Exercise realistic long, short, wide, empty, and repeated values wherever those variations could affect the layout.
6. **Animation:** For graphics with In/Out behavior, verify the settled In and intended settled Out frames. Verify intermediate states when the visual contract depends on motion between them.
7. **Runtime behavior:** Verify composition scripts and other Player-owned behavior in Singular Player with deterministic inputs. A successful write, Composer readback, or single screenshot is not proof of runtime behavior.
	For template-integrated work, report the template ID/version/status and which contract requirements were verified through model readback, Player, and the actual Control App separately. Missing resources, unresolved contract differences, and untested Control App behavior remain explicit limitations; assigning `defaultAppID` is not compatibility proof.
8. **Final state:** Restore the composition, controls, timeline, viewport, and navigation stack to the state requested by the user, then inspect the relevant scope again.
9. **Handoff:** Keep the best final visual artifact when one was needed. Tell the user what was created or changed, which controls and behaviors matter to their use of the graphic, what was verified, and any remaining visible difference, unsupported behavior, placeholder asset, or other limitation. Do not burden the user with internal construction details unless they ask or those details affect editing, control, reuse, or a limitation.

If a check is not applicable, omit it rather than manufacturing evidence. If an applicable check cannot be completed, report the composition as pending verification rather than finished.
