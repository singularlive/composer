# Breaking-news lower third

Build a reusable lower third with a constant urgency label, replaceable headline, independent In/Out lifecycle, and on-air Update replacement. Read [authoring quality](../authoring-quality.md), [optional animated module](optional-animated-module.md), the relevant Metric Text guide, and the live Timeline and Update catalogs before mutation.

## Structure and public contract

Create a named ordinary sub-composition such as `Breaking News Lower Third` in the nearest graphics owner. Keep its Timeline linked to the parent when it must follow the parent's lifecycle; unlink it only when a script or operator must control it independently.

Use a dedicated managed group with this Navigator front-to-back layer order (reverse it for the declarative `elements` array):

1. headline Metric Text;
2. constant `BREAKING NEWS` label Metric Text;
3. label panel;
4. headline panel.

Use the [Asymmetric Rectangle panel](asymmetric-rectangle-panel.md) when the silhouette needs square-left and rounded-right corners. Keep constant labels out of public controls. Expose a stable `Headline` Text control for a single-line headline; use Textarea only with a renderer that visibly supports multiline text. Link it directly to the headline widget and place it in the lower third's semantic Large control container.

Choose one visibility authority. With operator-controlled composition state, clearing `Headline` clears only the text: the constant label and panels remain until the module goes Out. No visibility script or Checkbox is needed. When a `Show Breaking News` Checkbox owns visibility, keep it unlinked inside the semantic container and use the optional-module recipe's visibility script on the appropriate owner, with the module unlinked from its parent timeline. The script may read the control but must not also write the directly linked headline. Do not inherit text-derived hiding from that recipe unless explicitly requested.

## Motion

Author one coherent Timeline In for the complete module, using the live effect catalog. Prefer a directional entrance that follows the panel silhouette, but inspect its actual motion envelope: a native directional effect can enter or leave through the viewport edge. Agree on that clipping deliberately; choose an in-place fade or a supported bounded motion when the complete envelope must remain inside the owning presentation. With one timeline, Out reverses In; enable Timeline 2 only when a distinct exit is requested.

Assign Update animation to the headline text, not the whole panel. Use UpdateOut for the old value and UpdateIn for the replacement. Set a positive UpdateIn offset at least as long as UpdateOut when doubled glyphs are unacceptable, and keep `alwaysExecute: false` so equivalent values do not replay. Do not use a composition script for a direct Control Node-to-widget replacement.

## Player scenario

Copy [the optional animated module scenario](optional-animated-module-scenario.json) into the task directory as a checkpoint template, not as a visibility contract. Adapt its canonical `Callout` payload key to the inspected `Headline` public ID. Set explicit `compositionId` values on payload steps to the control owner, and on playback steps to the intended lifecycle owner; omitted IDs target the selected verification composition. Capture scope and action scope are distinct. For a genuine parent Out check, address the inspected parent ID and verify the child's timeline link or visibility script; playing the module itself Out is only a module Out check. Keep these named checkpoints:

1. initial visible headline;
2. UpdateOut after replacement begins;
3. UpdateIn as the new headline enters;
4. settled replacement;
5. cleared headline when empty content is part of the contract;
6. parent Out.

Adjust waits to the authored Timeline and Update durations. Run the scenario against a fresh handoff for the lower-third owner, require complete script telemetry with zero observed typed errors and unknown events, and view every image. Zero script events do not prove script initialization; no script is required for the direct-link/state-controlled version. The acceptance contract is one complete initial value, no unintended doubled old/new glyphs, one complete settled replacement, correct panel clipping throughout motion, and no visible module content after its effective Out settles. With composition-state visibility, the empty/clear checkpoints must retain the constant label and panels. If a Checkbox owns visibility, adapt those checkpoints to turn it off rather than treating empty headline text as implicit visibility, and explicitly turn it on for visible replacement checkpoints.

Restore the intended headline, Checkbox value, composition state, display presentation, and editor scope after verification.
