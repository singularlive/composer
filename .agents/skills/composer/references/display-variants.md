# Display variants

This reference covers ordinary scene sub-compositions. Widgets may also own compositions through fields of type `composition`; their renderer controls how those templates are instantiated. See [widget-subcompositions.md](widget-subcompositions.md) before navigating or editing one.

Composer opens at a root composition. A composition tile can contain another composition, producing a nested sub-composition. Root and sub-compositions share the same group/tile model.

Most element and control commands operate on the **currently active composition**. Explicit scene-wide commands, such as composition playback, ordinary timeline linking, and scoped motion batches, resolve targets by their documented IDs without requiring each target to be active. Run `inspect` and confirm `activeComposition.stack`, then follow the target and scope contract of the chosen command; do not navigate merely because a target is elsewhere in the scene.

## Display variants

Display variants represent presentation contexts, not merely resolutions. Two variants may both be `1920x1080` while one renders a compact transparent video overlay and another renders full-screen in-venue signage. Shared Control Nodes and payloads remain common; composition-tree adaptations choose the rendered elements, while Control Node relevance shapes the operator form.

Follow the display-presentation ownership policy in "Choose the right structural unit" in [authoring-quality.md](authoring-quality.md). The commands below configure presentation relevance without authorizing a reorganization of the existing composition tree or public controls.

For a portrait extension to an already-authored landscape module, follow [Add a portrait presentation](recipes/existing-module-portrait.md). Preserve its managed landscape group, reuse existing content and theme sources, and keep the new presentation under the original parent lifecycle. A new aspect ratio is not permission to replace the original visual system.

Inspect the scene-level contract from any ordinary scope:

```bash
node scripts/composer-agent.js display-variants
```

The result contains the active name, ordered variant definitions, supported resolution catalog, optional legacy `virtual` marker, and scene-wide totals for element adaptations plus Control Node field/container relevance. A variant contains `name`, `resolution`, optional `description`, and optional adaptive `globals`. Resolution does not define variant identity and need not be unique.

Configure variants only from root. The version-1 file is a complete ordered replacement: omitted existing variants are deleted. Names must be unique and contain only letters, digits, `-`, `.`, `_`, or `~`; use exact IDs returned in `resolutions`. Use explicit `renames` whenever a previous name becomes a new name so references migrate rather than being deleted.

```json
{
  "version": 1,
  "active": "Video-overlay",
  "variants": [
    {
      "name": "Video-overlay",
      "description": "Compact transparent score and clock",
      "resolution": "1920x1080"
    },
    {
      "name": "Venue-signage",
      "description": "Full-screen in-venue presentation",
      "resolution": "1920x1080"
    }
  ],
  "renames": {
    "Old-venue-name": "Venue-signage"
  }
}
```

```bash
node scripts/composer-agent.js configure-display-variants --file <configuration.json>
node scripts/composer-agent.js activate-display-variant --name "Venue-signage"
```

Configuration is one root undo batch around Composer's native transition. Rename/delete migration covers `displayVariantRelevance` on Control Node fields and groups plus `layout.adaptations.displayVariant` on tiles and groups across every composition; stale-name verification occurs before commit. Empty `variants` with empty `active` disables display variants. Treat configuration as high-impact under the [revision policy](revisions.md#revision-approval-before-mutation), including its verified empty-starter exception. Activation alone changes the persisted active presentation through the same native resolution/global/render path and does not require a revision.

Assign presentation relevance in the active composition with one manifest:

```json
{
  "version": 1,
  "elements": [
    { "type": "group", "id": "<overlay-group-id>", "variants": ["Video-overlay"] },
    { "type": "group", "id": "<signage-group-id>", "variants": ["Venue-signage"] }
  ],
  "controls": [
    { "id": "Shared Score", "variants": ["Video-overlay", "Venue-signage"] }
  ],
  "containers": [
    { "id": "Venue controls", "variants": ["Venue-signage"] }
  ]
}
```

Each target's `variants` is a non-empty array of configured names; set it to `null` to remove relevance and make the target universal. Elements accept tile or group IDs and receive the native active display-variant adaptation. Controls accept public IDs or internal `keyId` values; containers use their group IDs. One manifest may contain 1–100 total targets, rejects duplicates and unknown names before mutation, writes one active-composition undo batch, and rolls back failed readback.

Element adaptation controls rendering. Control and container relevance controls whether operator inputs are hidden or muted by the host's relevance mode; it never removes values or links. For substantially different presentations, prefer shared elements where layout is genuinely common and separate variant-specific groups or child compositions inside the shared parent where composition differs. Use `create-control --reuse-existing --source-composition <parent-id>` or `reuseExisting: true` in a `create-controls` entry to link another child target to an exact existing parent control without creating a suffixed duplicate.
