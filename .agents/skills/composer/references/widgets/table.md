# Table widget

The supported Table widget is widget `1182`. It uses the composition stored in its `composition` field as a row/item template. Read the table and its template contract before updating it:

```bash
node scripts/composer-agent.js get --type tile --id <table-tile-id>
node scripts/composer-agent.js widget-subcompositions --id <table-tile-id>
```

Create a new managed Table with either `create --primitive table --name <label>` or a declarative element whose primitive is `table`. Creation follows Composer's normal widget defaults; it does not invent or replace the `composition` relationship. If the new Table has no assigned row template, run `open-widget-subcomposition --id <table-tile-id> --field composition --create`. This uses Composer's native hidden widget-template path and leaves the agent inside the new template. Retain its `identityScope.sessionToken` and pass `--template-session <token>` on every subsequent `apply`, Control Node, or other template-scoped command. Never use `create-composition` for the row template because it creates an ordinary visible parent tile.

## Rendering model

The Table widget creates one host box per visible item. It instantiates and resizes the selected widget sub-composition inside each box, then passes the corresponding row object to the instance with `setControlNode`.

- A dynamic template exposes Control Nodes; every row property is keyed by a control ID.
- A static template exposes no controls; empty row objects can still determine how many repeated instances render.
- `updateStyle: "update"` keeps one template instance per visible line and updates it in place.
- `updateStyle: "timeline"` keeps two instances per line so the old instance can animate out while the new instance animates in.
- `currentPage` is one-based for visible pages. Page `1` shows the first content page.
- `elementsPerPage` controls visible instance count and is capped at 100 by the widget.
- `lineSpacing` is a percentage distributed between visible instances.
- `layoutDirection: "horizontal"` advances hosts down the vertical axis; the alternate value advances them across the horizontal axis. Preserve the live selection values reported by `get`.
- Page transition style and offset configure instance changes; the row template owns its own In/Out animation. Do not assume a page-switch stagger in `update` mode; see the observations below.

The runtime accepts a direct row array, an object `{ "content": [...] }`, a JSON string of that object, and an object whose `content` is a JSON row-array string. Scripts use `table.setPayload({ tableContent: JSON.stringify({ content: rows }) })`. Normalize string/object/array readback before comparing rows; a local last-write cache alone is not authoritative.

Observed after a Table Control Node link/unlink: stored `tableContent` became an array, and generic `set-properties` required that array type. `update-table` writes the canonical JSON-string object and must not be assumed to repair type drift. Inspect the live field type; preserve array type through a typed property write when necessary, then verify. Runtime `setPayload` acceptance is distinct from the editor's type-preserving setter. Table Control Node `getPayload2()` also returned an array initially and a JSON string after a script write in the supplied observation; this is not permission to write runtime data into Control Nodes.

A Table Control Node is appropriate for operator/external-owned rows only. Its direct row array may link to `tableContent` with `link-table-control`, with keys matching template controls. The external writer updates that defining input rather than using `update-table`; stored widget content remains the unlinked fallback. For script-fetched data, leave `tableContent` unlinked and write the widget directly, with no backing Table Control Node or script-written status control.

### Pagination and numeric strings

Observed `currentPage` runtime values are strings despite the number schema. Counter and Number links returned `INCOMPATIBLE_PROPERTY`; numeric-string linking is not supported by this workflow. Keep Page as a standalone bounded Counter, read it from `comp.getPayload2()`, clamp against real rows (exclude padding), then write `table.setPayload({ currentPage: String(page) })` and an unlinked Metric Text indicator. Do not rewrite the operator's Page input to report the clamp. `update-table` preserves the inspected option type; accepting a numeric specification value does not prove native numeric linking works.

## Observed runtime workarounds

These are supplied Player observations from a club-table task, not intended semantics or an independent rerun of every widget version. Product confirmation is pending. Check actual output, not just readback.

| Observed-only behavior | Workaround |
| --- | --- |
| `timeline` bulk changes updated only the first changed visible row; later reversions could be ignored. `update` applied all changed rows. | Use `updateStyle: "update"` for live data and row UpdateOut/UpdateIn effects for replacement motion. |
| Shrinking 20 rows to 10 or 1 left stale rows in both modes. | Keep an agreed constant capacity from the stored seed onward. Pad with empty text, alpha-zero colors for all visible fills/text/strokes, and hidden image tiles. Reject overflow rather than silently truncate. |
| Empty image `""` broke later updates; a data-URI one-pixel GIF dropped the next update. Real HTTPS URLs worked. | Supply an approved real HTTPS image URL even in padding; hide unused images with template Checkbox controls. |
| A template-group `visible` node reference had no runtime effect through rows; tile-level visibility worked. | Link Checkbox controls to individual tiles' `visible` references, not the group. |
| The Table tile's `widget` Timeline effect did not animate rows on composition In. | Use a verified reveal on the Table tile; do not claim the Widget effect animates rows. |
| Page switches in `update` mode were instant apart from row Update effects. | Verify requested page motion; do not promise a separate page-transition stagger. |

Padding requires complete template fields and remains subject to the content-size limit. Compute pages from real rows to avoid exposing blank padded pages. Verify logos on their actual backing. Contributor issue records and reproduction scenarios are maintained separately from the shipped skill; all observations above remain observed-only until independently reproduced.

## Update a table

Use `update-table` for row data and table options instead of manually updating `tableContent`:

```bash
node scripts/composer-agent.js update-table --id <table-tile-id> --file <table.json>
```

Example for a dynamic two-control template:

```json
{
  "rows": [
    { "country": "1. Example", "gdp": "$1.23T" },
    { "country": "2. Sample", "gdp": "$1.00T" }
  ],
  "options": {
    "elementsPerPage": 2,
    "lineSpacing": 4,
    "currentPage": 1,
    "showLayout": false
  }
}
```

Color controls accept any tinycolor2-compatible row value. For example, if the template exposes `rowColor` from a Rectangle's `fillGradient`, a row may contain `"rowColor": "#004aad"` or `"rowColor": { "r": 0, "g": 74, "b": 173, "a": 1 }`. The Rectangle's existing gradient input renders the value as a solid gradient; no full gradient object is required. Stroke fields remain independent, so a shared thin white border can stay static while every row supplies its own fill color.

The command:

1. verifies that the tile is a Table widget;
2. resolves the current `composition` relationship from the owner;
3. validates every row against the template's complete exposed-control contract, rejecting unknown or missing keys and incompatible text, number, image, boolean Checkbox, or tinycolor2-compatible color values (Checkbox accepts only `true`/`false`, not strings or numbers);
4. validates supported options and preserves the widget's live runtime types;
5. rejects more than 1,000 rows or serialized content above 32 KB;
6. applies options followed by `tableContent`, recording attempted fields before dispatch so recovery includes a committed write even if its acknowledgement is lost;
7. reads the table again and returns verified row count, options, content, and the template relationship.

Supported options are `layoutDirection`, `elementsPerPage`, `lineSpacing`, `updateStyle`, `pageTransitionStyle`, `pageTransitionOffset`, `showLayout`, and `currentPage`. The command never changes the `composition` relationship.

This is a CLI transaction across separate relay writes, not one atomic editor undo batch. Cancellation stops all further recovery commands, including cancellation during readback or compensation. After another failure, the helper reads the target before compensation and verifies its widget/version, template relationship/schema, and affected values. Only values matching this transaction's original or attempted state may be restored; untouched fields and already-restored fields must still match their expected original values. Each compensation is followed by another authoritative read.

If recovery confirms restoration, the original failure is still reported. Unavailable or conflicting readback, changed identity, or failed compensation stops recovery with `TABLE_UPDATE_RECOVERY_UNCERTAIN`; this code is shared by Table and Grid and does not imply no mutation occurred. Preserve the observed state and follow "Mutation failure recovery" in [commands.md](../commands.md) before any retry. After cancellation, report potentially unrestored state without reconnecting. Readback is not compare-and-set: late in-flight writes or changes between read and write remain possible, so do not claim transactional isolation or automatic recovery from every disconnection.

After an update, inspect the Table. Capture only when pixels answer a remaining visual question: prefer `capture --target active` while the Table's ordinary graphic sub-composition is active, and use root only when the whole-scene combination is the acceptance target. If you edit the row template, leaving it intentionally triggers Composer's copy-on-exit lifecycle and replaces the template ID. Discard the edit-session ID, re-read the Table's `composition` relationship, and only then update or capture the Table.
