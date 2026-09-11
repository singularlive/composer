# Composition, Table, and Grid commands

Use these command contracts with the matching composition or widget guide.

## Compositions

| Command | Purpose |
| --- | --- |
| `create-composition --name <name> [--group-id <id>]` | **Targeted only:** create one ordinary on-the-fly sub-composition outside a representable orchestration. |
| `orchestrate --file <manifest.json>` | **Preferred for related ordinary modules:** from root, create or reuse up to 25 keyed modules, apply graphics plus separate Timeline, Update, and Behavior assignments, and set explicit parent timeline links in one rollback-safe operation. |
| `create-revision --description <text>` | Save the last persisted composition version as a numbered revision. |
| `list-revisions` | List sanitized revision metadata without storage URLs or internal database IDs. |
| `read-revision --revision-id <number>` | Read a bounded structural summary of one revision. |
| `compare-revision --revision-id <number>` | Compare current and revision structure as totals and numeric deltas. |
| `restore-revision --revision-id <number>` | Create an automatic backup, then start native whole-scene restoration. |
| `delete-revision --revision-id <number>` | Permanently delete one revision by its visible revision number. |
| `open-composition --id <id\|root>` | **Targeted only:** navigate for inspection, an isolated edit, widget work, or a structure orchestration cannot represent. |
| `widget-subcompositions --id <widget-tile-id>` | Inspect a widget's composition-valued fields, static/dynamic mode, and exposed template controls. |
| `open-widget-subcomposition --id <widget-tile-id> [--field <field-id>] [--create]` | Resolve and open the widget's current hidden template, or create it through Composer's native widget-owned path when the field is empty and `--create` is passed. Its `identityScope` reports the durable owner locator and marks the active template and descendant IDs as current-edit-session handles. |
| `delete-composition --id <id>` | Recursively delete a sub-composition. |
| `control-composition --id <id> --state <in\|out>` | Take the root or a sub-composition in or out. |
| `logic-layers [--id <composition-id>]` | Inspect all Composition Navigator logic layers or one ordinary composition's assignment. |
| `set-logic-layer --id <composition-id> [--name <name>] [--delay <none\|auto\|custom>] [--time <seconds>]` | Assign or configure one ordinary composition. A custom delay requires `--time` from `-10` to `10`. |
| `set-logic-layer --id <composition-id> --remove` | Remove one logic-layer assignment without changing its current state. |
| `rename-logic-layer --name <name> --new-name <name>` | Atomically rename a complete layer; an existing target name merges the memberships. |
| `timeline2 --active <true\|false>` | Enable or disable the dedicated Out timeline on the active composition. |
| `display-variants` | Inspect the ordered scene variants, active name, resolution catalog, and scene-wide relevance-reference totals. |
| `configure-display-variants --file <configuration.json>` | From root, atomically replace the complete ordered variant set and migrate explicit rename/delete references across every composition. |
| `activate-display-variant --name <name>` | Activate one existing variant through Composer's native resolution/global/render transition. |
| `set-display-variant-relevance --file <relevance.json>` | Atomically set or remove active-composition relevance for up to 100 tiles, groups, controls, and ordinary Control Node containers. |

Prefer `orchestrate` when constructing or refining several related ordinary modules. It replaces a serial create/open/apply/animate sequence with one bounded rollback batch. Use the individual composition commands for isolated changes, widget-owned templates, or structures the version-1 manifest cannot represent.

See [compositions.md](compositions.md).

By design, widget-owned templates are copied when Composer exits standalone edit mode. Treat the owner tile plus field as stable and every identity discovered inside the open template as edit-session scoped, including the raw composition ID, descendant element IDs, node model keys, Widget Node `keyId` values, and link locations. Discard them on exit or reopen and prefer `open-widget-subcomposition` for every later navigation. `inspect`, `open-widget-subcomposition`, and Widget Node command responses expose this contract as `identityScope`; use its opaque `sessionToken` with `--template-session` on subsequent template commands. See [widget-subcompositions.md](widget-subcompositions.md).

## Tables and Grids

| Command | Purpose |
| --- | --- |
| `update-table --id <table-tile-id> --file <table.json>` | Validate rows against the current template, update options/content with readback-guarded best-effort compensation, and verify readback. Cancellation stops recovery; see [Table](widgets/table.md) for `TABLE_UPDATE_RECOVERY_UNCERTAIN`. |
| `update-grid --id <grid-tile-id> --file <grid.json>` | Validate items and bounded dimensions, update options/content with readback-guarded best-effort compensation, and verify readback. Cancellation stops recovery; see [Grid](widgets/grid.md) for `TABLE_UPDATE_RECOVERY_UNCERTAIN`. |

See [table.md](widgets/table.md) and [grid.md](widgets/grid.md). Grid uses `cols`/`rows` and separate spacing fields; Table's `elementsPerPage`, `lineSpacing`, and `layoutDirection` are not Grid options.
