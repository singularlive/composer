# Breaking-news lower third

Build a reusable lower third with a constant urgency label, replaceable headline, independent In/Out lifecycle, and on-air Update replacement. Read [authoring quality](../authoring-quality.md), [optional animated module](optional-animated-module.md), the relevant Metric Text guide, and the live Timeline and Update catalogs before mutation.

## Structure and public contract

Create a named ordinary sub-composition such as `Breaking News Lower Third` in the nearest graphics owner. Keep its Timeline linked to the parent when it must follow the parent's lifecycle; unlink it only when a script or operator must control it independently.

Use a dedicated managed group with this layer order:

1. headline Metric Text;
2. constant `BREAKING NEWS` label Metric Text;
3. label panel;
4. headline panel.

Use the [Asymmetric Rectangle panel](asymmetric-rectangle-panel.md) when the silhouette needs square-left and rounded-right corners. Keep constant labels out of public controls. Expose a stable `Headline` Textarea control for replaceable copy, link it directly to the headline widget, and place it in the lower third's semantic Large control container. Add a standalone `Show Breaking News` Checkbox only when operators must prepare copy before taking the module In; do not add it when composition state is already the visibility authority.

## Motion

Author one coherent Timeline In for the complete module, using the live effect catalog. Prefer a directional entrance that follows the panel silhouette and keeps the full motion envelope inside the owning presentation. With one timeline, Out reverses In; enable Timeline 2 only when a distinct exit is requested.

Assign Update animation to the headline text, not the whole panel. Use UpdateOut for the old value and UpdateIn for the replacement. Set a positive UpdateIn offset at least as long as UpdateOut when doubled glyphs are unacceptable, and keep `alwaysExecute: false` so equivalent values do not replay. Do not use a composition script for a direct Control Node-to-widget replacement.

## Player scenario

Copy [the optional animated module scenario](optional-animated-module-scenario.json) into the task directory and adapt its canonical `Callout` payload key to `Headline`. Keep these named checkpoints:

1. initial visible headline;
2. UpdateOut after replacement begins;
3. UpdateIn as the new headline enters;
4. settled replacement;
5. cleared headline when empty content is part of the contract;
6. parent Out.

Adjust waits to the authored Timeline and Update durations. Run the scenario against a fresh handoff for the lower-third owner, require complete script telemetry with zero Player errors, and view every image. The acceptance contract is one complete initial value, no unintended doubled old/new glyphs, one complete settled replacement, correct panel clipping throughout motion, and no visible content after Out settles. If a Checkbox owns visibility, adapt the clear checkpoint to turn the Checkbox off rather than treating empty headline text as implicit visibility.

Restore the intended headline, Checkbox value, composition state, display presentation, and editor scope after verification.
