# Public Google Sheet to Table

This reference covers Composer authoring boundaries for an external-data task, not a maintained standings application. Source parsing, header mapping, polling, sorting, paging policy and application acceptance belong to the requested composition script, not Composer skill regression gates.

Use this recipe for standings, results or rosters from an **already publicly readable** Google Sheet. Private-sheet integration is out of scope. Decide live refresh versus one-time snapshot before building; neither is a universal default. Confirm the interval with the user (60 seconds below is an example).

## Source and permissions

- A Sheets edit URL is an application page, not a reliable cell-data response. Read the exact named tab and A1 range through a tab-addressable data endpoint. Never identify a tab by matching similar content in an unlabeled multi-tab Drive result.
- An authenticated Google Drive connector and Player have separate authorization. Connector access does not grant Player access. Do not copy connector credentials into a script or recommend changing private data to public merely to make polling work.
- Confirm anonymous access to the exact tab/range before import, then test browser/CORS access in Player separately. Use no Google cookies or Authorization headers. A sign-in page, permission error or malformed response is not an empty table.
- Retry a connector read once only after a confirmed connection/permission change or a transient failure. Do not repeatedly retry unchanged permission denial. If source identity/access remains ambiguous, report it and request an approved public source; do not claim verified initial rows.
- Use placeholders in examples. Do not persist handoffs, tokens, private asset URLs or account data in test artifacts. Public source data can still be sensitive: retain only task-required output.

## Structure and ownership

Read [authoring quality](../authoring-quality.md), [revisions](../revisions.md), [Table](../widgets/table.md), [widget templates](../widget-subcompositions.md), and [Control Node commands](../control-node-commands.md) before construction. Skip the revision prompt for a verified empty starter scene under the scene-wide exception; an empty target inside an otherwise authored scene still requires the normal revision decision.

1. Reuse an appropriate ordinary graphic sub-composition; keep root for orchestration. Put the coherent graphic in a sized managed group. Design, font, placement and motion follow the user's contract, not this recipe's data source.
2. Inspect/create Table widget 1182 and its dynamic widget-owned row template. Use native Metric Text/Image elements with template controls matching the exact row keys/types. Retain the template session token for scoped commands. Exit through root, reopen the owning ordinary composition, discard template IDs and reread the owner relationship.
3. Configure the Table against the inspected schema and requested design. Seed only approved fallback rows through `update-table`; preserve the stored content type and complete template fields. Update versus Timeline, page size and padding are application choices, not source-integration requirements. Preserve the fallback when transferring a linked destination to script ownership, and remove the competing link only when that ownership change is authorized.
4. Put any requested source, refresh and page inputs in semantic Large Control Node containers. Do not invent a polling interval, column schema, capacity or operator surface. Default automatic fetching off until source access and configuration are confirmed.
5. Prefer direct writes to unlinked widgets for fetched data. Read operator inputs with `composition.getPayload2()` and use the routed widget API, for example `table.setPayload({ tableContent: JSON.stringify({ content: rows }) })`. A justified Control Node assignment requires a deliberate runtime consumer and one writer, as described in [composition scripts](../composition-scripts.md). Output writes do not update the Control App UI; do not invent an operator-feedback channel.

## Script handoff and evidence

Read and preserve existing scripts through the bundled helper. Use a fresh `script-handoff --pipe` for each read, write and readback; never save the handoff or construct script REST calls. Merge existing listeners and release requests, timers and listeners in `close()`.

Skill verification covers source permissions, inspected template contracts, single write authority, helper persistence/readback, cleanup and honest reporting. Model readback proves authored state, not successful fetching. Player observations, actual anonymous network access and Control App delivery are distinct evidence levels; see [verification](../composition-scripting/debugging-and-verification.md).

When the user requests application implementation, agree its data and failure contracts and test only that authorized workflow. Header removal, source-cell edits, pagination algorithms and refresh timing are not prerequisites for maintaining this skill. Never edit a user's sheet or change its sharing permissions merely to complete a skill check.

## Add a field safely

Inspect the owner, current script and template contract. Add the requested native element/control inside the current template session, update every supplied fallback row to satisfy the complete contract, exit through root and rediscover the copied template. Use `update-table` for model data, preserve unrelated fields/links/options, and obtain authoritative readback before retrying an uncertain write. Source-header handling and display formatting remain application decisions.
