# Extending a composition with scripts

This reference covers ordinary scene sub-compositions. Widgets may also own compositions through fields of type `composition`; their renderer controls how those templates are instantiated. See [widget-subcompositions.md](widget-subcompositions.md) before navigating or editing one.

Composer opens at a root composition. A composition tile can contain another composition, producing a nested sub-composition. Root and sub-compositions share the same group/tile model.

Most element and control commands operate on the **currently active composition**. Explicit scene-wide commands, such as composition playback, ordinary timeline linking, and scoped motion batches, resolve targets by their documented IDs without requiring each target to be active. Run `inspect` and confirm `activeComposition.stack`, then follow the target and scope contract of the chosen command; do not navigate merely because a target is elsewhere in the scene.

## Extending a composition with scripts

Finish and verify composition structure, widget names, and Control Node wiring in Composer before switching to the scripting phase. Script discovery and writes use the bundled composition-script helper after a paired handoff; its content JSON differs from paired `inspect`, and runtime behavior must be verified in the Singular Player rather than the Composer canvas. See [composition-scripts.md](composition-scripts.md) for the complete workflow.
