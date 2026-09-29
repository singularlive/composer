# Table widget (widgetId 1182)

For paired creation, row-template ownership, strict row validation and editor updates, see [Table authoring](../widgets/table.md). The primitive is `table`. Inspect the actual loaded widget version and fields before scripting; the handoff's `loadedVersions` and live schema take precedence over this reference.

## Payload and ownership

Use the [composition-script workflow](../composition-scripts.md) for persisted script changes. Locate the Table by its inspected name in the owning composition. This fragment assumes its template exposes a Text Control Node whose exact public ID is `label`:

```javascript
var table = comp.findWidget('Results Table')[0];
if (table) {
  table.setPayload({
    tableContent: JSON.stringify({ content: [
      { label: 'First item' },
      { label: 'Second item' }
    ] })
  });
}
```

Replace `label` with the actual template control IDs and supply values matching their types. The widget passes each row object to its repeated template instance with `setControlNode`. A static template has no controls; empty row objects can still determine instance count. Preserve the `composition` relationship established in Composer; never guess or persist a template edit-session ID. `update-table` is a paired CLI command, not a runtime widget method.

Assign one writer per destination. For script-owned rows, leave `tableContent` unlinked and write the widget directly. For operator/external-owned rows linked from a Table Control Node, update that defining source instead; do not also script-write `tableContent`. Do not add backing Control Nodes for fetched rows or assume Player writes update the Control App UI.

The runtime accepts a direct row array, `{ content: rows }`, a JSON string of that object, and an object whose `content` is a JSON row-array string. The example uses the canonical JSON-string object form. Readback can therefore be a string, object or array: decode strings with `JSON.parse`, unwrap `content` when present, decode a string-valued `content`, and require an array before comparing rows. Do not use a last-attempted-write cache as proof of effective state. Malformed or unexpected shapes must not be treated as an empty successful result.

## Options and pages

Use only fields and selection values confirmed by the loaded schema: `elementsPerPage`, `lineSpacing`, `layoutDirection`, `updateStyle`, `pageTransitionStyle`, `pageTransitionOffset`, `showLayout`, and `currentPage`. Send only intended changes. Numeric options can have string runtime values; preserve the inspected convention rather than inferring a payload type from the schema label alone.

Visible pages are one-based: page 1 starts with the first row. `elementsPerPage` determines the visible slot count (the widget caps it at 100). `lineSpacing` distributes percentage spacing between slots. Despite its name, `layoutDirection: "horizontal"` advances row hosts down the vertical axis; inspect the alternate selection before choosing another layout. Page transition settings affect instance changes, not the template's authored entrance/exit contract.

For an intentionally empty dataset, send `tableContent: JSON.stringify({ content: [] })`. Shrinking content does not establish automatic page-input clamping: page selection and any clamping policy belong to the application. Padding, polling, source parsing and fallback assets are also application choices, not universal Table requirements.

## Update and Timeline motion

`updateStyle: "update"` retains one template instance per visible slot and updates it in place. `updateStyle: "timeline"` alternates two instances so the old row can exit while the new row enters. The template owns the effective In/Out motion; a page or row update does not invent an exit effect.

An element with In motion but no effective Out motion can remain visible when its row exits. Evaluate the combined element and containing-group motion: element In plus group Out is valid, as is group In plus element Out. Do not require both effects on every individual object. Do not force-hide containers, clear unrelated data or pad rows to compensate for missing authored exit motion.

Published Table v17 passed sampled label-only bulk replacement, first-row reversion, shrink and restoration in both modes using element In/group Out. Grid v11 passed the opposite group In/element Out arrangement. These checks support split-motion authoring, not every animation combination or widget version. Older Table v16 mode switching had a layout invalidation defect; do not carry its spacing-refresh diagnostic into application scripts as a workaround for current versions.

## Verification boundary

Re-read the widget and template relationship after leaving template editing because copy-on-exit can replace template identities. Verify the requested row/page change in the actual Player after initialization and relevant transitions; successful `setPayload` or Player load alone is not proof that repeated rows are ready. Published checks also passed page-2 partial/shrink/zero-row sequences and empty-string image clearing in both modes. They do not mandate constant-capacity padding, Update-only operation or fallback image URLs.

Keep evidence specific to the loaded version and requested sequence. Interrupted transitions, arbitrary asset failures and Control App extract delivery are not established by model readback or a separate Player capture. Do not turn those evidence limits into mandatory renderer matrices for a Composer skill task. For Grid payloads, use the separate [Grid scripting reference](widget-grid.md).