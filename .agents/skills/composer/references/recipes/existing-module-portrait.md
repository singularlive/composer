# Add a portrait presentation to an existing module

Use when an existing landscape graphic needs a portrait display variant while retaining one public content contract and one operator-facing In/Out lifecycle. A request for another aspect ratio is an extension, not permission to replace the original design.

## Read by phase

- Before structure: [authoring standard](../authoring-quality.md), [revision approval](../revisions.md#revision-approval-before-mutation), [display variants](../display-variants.md), [composition structure](../composition-structure.md), and [graphics ownership](../graphics.md).
- Before links and motion: [control creation and reuse](../control-node-creation.md), [control commands](../control-node-commands.md), and [composition playback and timelines](../composition-motion.md).
- Before verification: [capture](../capture.md). Use the existing parent module as the lifecycle owner, not a root-only seek or independent child playback as a substitute for testing the parent.

## Ownership plan

- Root owns global palette/font controls only when global scope is requested or established. Keep an intentionally local theme local. If promotion is required, complete [theme promotion](promote-theme-controls.md) first.
- The existing module retains its graphic-specific content controls and its operator-facing lifecycle.
- The original sized, clipped landscape group retains its widgets, managed ownership, stable keys, geometry, content links, and animation.
- Add a Portrait holder group and an ordinary portrait child composition beneath the existing module. The child has no duplicate public controls: its content links to the module's existing sources and its styling links to the established theme sources.

Use this separate child when the new presentation needs materially different geometry or an independent managed authoring scope. Do not replace or repurpose the existing managed landscape group to install a second managed specification. Read its ownership first; never rewrite immutable ownership metadata. Ordinary child compositions remain full-canvas coordinate spaces, not cropped groups.

## Extend safely

1. Inspect existing variant definitions, active presentation, module hierarchy, managed group bounds/clipping, widget schemas, control identities/values, relevance, and both timelines. Preserve user edits and unrelated content. Recommend a revision before high-impact configuration or restructuring unless this task is already covered.
2. From root, merge the new presentation into the complete ordered display-variant configuration. Omitted variants are deleted, so preserve unrelated definitions, adaptive globals, and relevance; do not send a two-entry replacement over a larger scene. Use explicit renames only when approved. A two-format scene may use `16x9` at `1920x1080` and `9x16` at `1080x1920`, subject to the inspected resolution catalog. Existing compatible variant names should be reused, not duplicated.
3. In the original module, add only the portrait holder and child. Apply complementary element relevance: landscape group only for the landscape presentation, portrait holder only for portrait. Preserve any additional presentations the existing groups already serve. Keep common controls and the lifecycle owner available in both formats; control relevance changes form visibility, not rendered isolation.
4. Author the new portrait composition with native widgets and its own stable-keyed managed group. Adapt proportions, wrapping, and placement to the portrait frame; preserve the landscape presentation unchanged. A wide lower third near the portrait frame's bottom is a task-specific choice, not a mandatory template. Do not make inherited landscape percentage coordinates the portrait design by default.
5. Link portrait text to the exact existing module content controls. Keep the portrait child active, supply the inspected parent ID as `--source-composition`, and use `--reuse-existing`. For colors/fonts, use the root source when global, or the actual established ancestor otherwise. Inspect source values before linking; creation is not needed for any source already verified. Stop dependent links immediately if a prerequisite source is missing. Do not introduce scripts to copy shared values or public inputs inside the child.
6. Author portrait In/Out choreography from the requested motion intent and existing module timings. Preserve staged reveals where appropriate; do not impose one recipe's durations, spacing, palette, or radii. If a separate Out timeline is required, verify the relevant composition's `timeline2Active` setting instead of assuming it. Do not modify the landscape's animation while adding the portrait choreography.
7. Use `set-timeline-link --id <portrait-composition-id> --linked true` to link the ordinary portrait child to its immediate parent. Verify with `timeline-link --id <portrait-composition-id>` and composition readback: `linked` is true and `parentCompositionId` is the existing module. Verify the holder does not add unintended double motion or clipping. Parent In/Out must drive the portrait child; do not create a second operator lifecycle or use independent child playback to claim this works.

## Acceptance checks

- Model: unchanged landscape identity/layout/animation, retained module content controls, shared root theme links when global, exact ancestor sources, no duplicate public controls in the portrait child, correct variant definitions/relevance, and linked parent/child timeline ownership.
- Variant isolation: activate each format and view its output. Require only the intended presentation to render, including after switching back to landscape. Model relevance alone is not visual proof.
- Parent lifecycle: take the parent module In and Out in Player with portrait active. View a meaningful entrance midpoint, complete settled In, and empty settled Out for a transient lower third. Check clipping throughout the sampled motion envelope. Do not infer every frame of continuous playback from static checkpoints.
- Shared values: change a module name to a realistic longer value and change a global accent, then check both presentations. Exercise a separate portrait font-change scenario; a structurally correct font link and a frame rendered with its current font do not prove change propagation.
- Restore original content and latest user-selected theme values after probes, along with the requested active format, navigation scope, and In/Out state. Verify final readback before releasing work.
- Separate authored model state, sampled Player evidence, and pending tests in the handoff. Report external Control App behavior as untested unless it was exercised in that application.