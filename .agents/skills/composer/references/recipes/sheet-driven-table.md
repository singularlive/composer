# Public Google Sheet to Table

Status: corrected widget-only architecture. The supplied club-table task reports Player observations, not verification of this nine-column example. Mocked tests do not establish Google, Player or Control App behavior.

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
3. Configure an unlinked Table named `Standings`, `updateStyle: "update"`, and 10 elements per page. Seed its stored `tableContent` with verified fallback rows, padded to the agreed capacity (40 below). Do not create a Table Control Node for fetched data. When migrating an existing linked table, unlink first and preserve its stored fallback.
4. Put standalone `Sheet ID`, `Sheet Tab`, `Sheet Range` (Text), `Auto Update` (Checkbox), and `Refresh Seconds` (Number, 5-3600) in a Large `Data Source` container. Default Auto Update off until access and configuration are confirmed. In a Large `Graphic` container, put directly linked Title/Subtitle inputs and a standalone Page Counter (1 through capacity / page size, with deliberate decrement/increment/set-1 actions). Name the unlinked indicator Metric Text `Page Indicator`.
5. The script reads operator Control Nodes via `getPayload2()` and writes only widgets: `tableContent`, string `currentPage`, and indicator text. It never writes Control Node payloads. Fetch failures retain the last good graphic and emit a sanitized console warning. Do not fabricate operator-facing fetch status; a separate supported channel or an agreed on-output indicator needs its own contract.

The source expects nine columns: `rank`, `club`, `mp`, `w`, `d`, `l`, `pts`, `logo`, `arrow`. The template exposes the seven text and two image fields plus Color controls `rowColor`, `textColor` and Checkbox controls `logoVisible`, `arrowVisible`. Link colors to all relevant fills/text/strokes and visibility to the individual image tiles, not a template group. Numeric columns become text; blank club rows are skipped and extra source columns ignored. Adapt the explicit schema and colors to the inspected template and user's design.

Observed Table workarounds, not intended semantics: use `update`, keep a constant padded row count even after a shrink or empty result, and never send empty image strings or data-URI placeholders. Seed at least one image field with an approved real credential-free HTTPS URL; the script reuses that URL for hidden badges. Padding uses empty text, alpha-zero colors and hidden image tiles. Validate the padded payload against the 32 KB limit. Count real rows, not padding, when computing pages. See [Table reliability](../widgets/table.md#observed-runtime-workarounds).

## Script pattern

Follow [composition scripts](../composition-scripts.md) and the [runtime API](../composition-scripting/singular-scripting-doc.md). Merge existing listeners; `addListener` supports one per composition/event. This ES2017 example requires XMLHttpRequest, URL and Blob. Initial fetch requires Auto Update. One current request is allowed; configuration changes abort it and invalidate late callbacks. The timeout is 15 seconds. Warnings contain no source data, URLs or response bodies. The seed must already use the same padding contract; agree an empty fallback with a real hidden image URL if no verified rows are available.

```javascript
(function() {
  var composition = null;
  var interval = null;
  var request = null;
  var generation = 0;
  var configKey = null;
  var onPayload = null;
  var table = null;
  var indicator = null;
  var fallbackImage = null;
  var rowCount = 0;
  var capacity = 40;
  var pageSize = 10;
  var columns = ['rank', 'club', 'logo', 'mp', 'w', 'd', 'l', 'pts', 'arrow'];
  var numeric = ['rank', 'mp', 'w', 'd', 'l', 'pts'];
  var optionalColumns = [];

  function warn() {
    console.warn('Sheet refresh unavailable; retaining last good rows');
  }

  function contentRows(value) {
    if (typeof value === 'string') value = JSON.parse(value);
    if (value && !Array.isArray(value)) value = value.content;
    if (typeof value === 'string') value = JSON.parse(value);
    if (!Array.isArray(value)) throw new Error('content');
    return value;
  }

  function imageUrl(value) {
    var image = new URL(value);
    if (image.protocol !== 'https:' || image.username || image.password) throw new Error('image');
    return value;
  }

  function applyPage() {
    var pages = Math.max(1, Math.ceil(rowCount / pageSize));
    var requested = Number(composition.getPayload2().Page);
    var page = Math.max(1, Math.min(pages, Number.isInteger(requested) ? requested : 1));
    if (table.getPayload().currentPage !== String(page)) table.setPayload({ currentPage: String(page) });
    var label = page + ' / ' + pages;
    if (indicator.getPayload().text !== label) indicator.setPayload({ text: label });
  }

  function paddedRows(rows) {
    var result = rows.slice();
    while (result.length < capacity) {
      var padding = { rank: '', club: '', mp: '', w: '', d: '', l: '', pts: '',
        logo: fallbackImage, arrow: fallbackImage, logoVisible: false, arrowVisible: false,
        rowColor: { r: 0, g: 0, b: 0, a: 0 }, textColor: { r: 0, g: 0, b: 0, a: 0 } };
      optionalColumns.forEach(function(name) { padding[name] = ' '; });
      result.push(padding);
    }
    if (new Blob([JSON.stringify({ content: result })]).size > 32768) throw new Error('rows');
    return result;
  }

  function cancel() {
    generation += 1;
    if (interval !== null) clearInterval(interval);
    interval = null;
    var previous = request;
    request = null;
    if (previous) previous.abort();
  }

  function rowsFrom(text) {
    if (text.length > 1024 * 1024) throw new Error('response');
    var match = text.trim().match(/^(?:\/\*O_o\*\/\s*)?google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
    if (!match) throw new Error('response');
    var data = JSON.parse(match[1]);
    if (data.status !== 'ok' || !data.table || !Array.isArray(data.table.cols) || !Array.isArray(data.table.rows)) throw new Error('response');
    var headers = data.table.cols.map(function(column) { return String(column.label || '').trim().toLowerCase(); });
    columns.forEach(function(name) {
      if ((headers.indexOf(name) < 0 && optionalColumns.indexOf(name) < 0) ||
          headers.indexOf(name) !== headers.lastIndexOf(name)) throw new Error('headers');
    });
    if (data.table.rows.length > 1000) throw new Error('rows');
    var rows = [];
    data.table.rows.forEach(function(source) {
      if (!source || !Array.isArray(source.c)) throw new Error('row');
      function cell(name, formatted) {
        var index = headers.indexOf(name);
        var value = index < 0 ? null : source.c[index];
        if (!value || value.v == null) return '';
        if (formatted && typeof value.v === 'number' && typeof value.f === 'string') return value.f;
        return value.v;
      }
      if (!String(cell('club')).trim()) return;
      var row = {};
      columns.forEach(function(name) {
        var value = cell(name);
        if (typeof value !== 'string' && typeof value !== 'number') throw new Error('cell');
        if (optionalColumns.indexOf(name) >= 0 && String(value).trim() === '') {
          row[name] = ' ';
          return;
        }
        if (numeric.indexOf(name) >= 0) {
          if (String(value).trim() === '' || !Number.isSafeInteger(Number(value)) || Number(value) < 0) throw new Error('number');
          value = typeof value === 'number' ? cell(name, true) : String(Number(value));
        }
        if (name === 'logo' || name === 'arrow') {
          row[name + 'Visible'] = value !== '';
          value = value === '' ? fallbackImage : imageUrl(String(value));
        }
        row[name] = String(value);
      });
      row.rowColor = { r: 20, g: 30, b: 40, a: 1 };
      row.textColor = { r: 255, g: 255, b: 255, a: 1 };
      rows.push(row);
    });
    if (rows.length > capacity) throw new Error('capacity');
    if (new Blob([JSON.stringify(rows)]).size > 32768) throw new Error('rows');
    return rows;
  }

  function refresh(config, expectedGeneration) {
    if (!composition || request || generation !== expectedGeneration) return;
    var current = new XMLHttpRequest();
    request = current;
    function active() { return composition && generation === expectedGeneration && request === current; }
    function failed() {
      if (!active()) return;
      request = null;
      warn();
    }
    current.onload = function() {
      if (!active()) return;
      if (current.status !== 200) { failed(); return; }
      var rows;
      var padded;
      try { rows = rowsFrom(current.responseText); padded = paddedRows(rows); } catch (error) { failed(); return; }
      request = null;
      var existing;
      try { existing = contentRows(table.getPayload().tableContent); } catch (error) { existing = null; }
      if (JSON.stringify(existing) !== JSON.stringify(padded)) {
        table.setPayload({ tableContent: JSON.stringify({ content: padded }) });
      }
      rowCount = rows.length;
      applyPage();
    };
    current.onerror = failed;
    current.ontimeout = failed;
    current.onabort = failed;
    try {
      var url = new URL('https://docs.google.com/spreadsheets/d/' + encodeURIComponent(config.id) + '/gviz/tq');
      url.searchParams.set('tqx', 'out:json');
      url.searchParams.set('sheet', config.tab);
      url.searchParams.set('range', config.range);
      url.searchParams.set('headers', '1');
      current.open('GET', url.href, true);
      current.withCredentials = false;
      current.timeout = 15000;
      current.send();
    } catch (error) { failed(); }
  }

  function configure() {
    applyPage();
    var payload = composition.getPayload2();
    var config = { id: payload['Sheet ID'], tab: payload['Sheet Tab'], range: payload['Sheet Range'],
      enabled: payload['Auto Update'], seconds: payload['Refresh Seconds'] };
    var nextKey = JSON.stringify(config);
    if (configKey === nextKey) return;
    configKey = nextKey;
    cancel();
    if (config.enabled === false) return;
    if (config.enabled !== true || typeof config.id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(config.id) ||
        typeof config.tab !== 'string' || !config.tab.trim() || config.tab.length > 100 ||
        typeof config.range !== 'string' || !/^[A-Z]+[1-9][0-9]*:[A-Z]+[1-9][0-9]*$/i.test(config.range) ||
        !Number.isInteger(config.seconds) || config.seconds < 5 || config.seconds > 3600) {
      warn();
      return;
    }
    var currentGeneration = generation;
    interval = setInterval(function() { refresh(config, currentGeneration); }, config.seconds * 1000);
    refresh(config, currentGeneration);
  }

  return {
    init: function(comp) {
      composition = comp;
      table = comp.findWidget('Standings')[0];
      indicator = comp.findWidget('Page Indicator')[0];
      if (!table || !indicator) throw new Error('Missing table or indicator');
      var seed = contentRows(table.getPayload().tableContent);
      var imageRow = seed.find(function(row) { return row.logo; });
      if (!imageRow) throw new Error('Seed requires an approved HTTPS image');
      fallbackImage = imageUrl(imageRow.logo);
      rowCount = seed.filter(function(row) { return String(row.club || '').trim(); }).length;
      onPayload = function() { configure(); };
      composition.addListener('payload_changed', onPayload);
      configure();
    },
    close: function() {
      if (composition && onPayload) composition.removeListener('payload_changed', onPayload);
      composition = null;
      configKey = null;
      onPayload = null;
      cancel();
      table = null;
      indicator = null;
      fallbackImage = null;
      rowCount = 0;
    }
  };
})();
```

## Player verification

Mocked-comp tests prove parsing/lifecycle logic, not Google access, Player integration, images or table fit. Before live authoring, run `dependency-preflight.js --capture`. If Chrome is unavailable, use the [verification-unavailable handoff](../capture.md#verification-unavailable); do not claim a successful runtime refresh.

Use an approved public fixture with the nine headers above. In a private verification page, a custom Playwright harness may intercept only that fixture's exact gviz endpoint: serve `Example Club` with pts 10 then 11. No credentials, real data or production requests are mocked. Set Refresh Seconds to 5 for this test only. Assert normalized `table.getPayload().tableContent` converges to the expected padded rows and inspect rendered row output; never simulate fetching by writing a data Control Node. Restore the requested interval. The bundled verifier lacks network-fixture and widget-payload assertions; use a task-temporary harness alongside this version-1 visual scenario:

```json
{
  "version": 1,
  "steps": [
    { "action": "jumpTo", "state": "In" },
    { "action": "waitForState", "equals": "In", "timeoutMs": 3000 },
    { "action": "setPayload", "payload": { "Auto Update": false } },
    { "action": "setPayload", "payload": { "Sheet ID": "PUBLIC_FIXTURE_ID", "Sheet Tab": "Standings", "Sheet Range": "A1:K19", "Refresh Seconds": 5, "Auto Update": true } },
    { "action": "wait", "milliseconds": 2000 },
    { "action": "capture", "name": "first-refresh" },
    { "action": "wait", "milliseconds": 6000 },
    { "action": "capture", "name": "changed-source" },
    { "action": "assertPixelsChanged", "from": "first-refresh", "to": "changed-source", "minimumChangedPixels": 1 },
    { "action": "setPayload", "payload": { "Auto Update": false } }
  ]
}
```

Replace placeholders with the inspected fixture identity; wait values are fixture budgets, not proof of success. Assert payload convergence in the custom harness before captures; capture only the table/pts region with unrelated animations settled. Pixel change alone is not a row assertion. Drive ancestors In if necessary. Test actual anonymous Google access separately without interception, then change an approved source cell and confirm the new row value after the selected interval. Do not claim the mock establishes Google reachability or CORS.

Also verify: unchanged rows cause no redundant row write across array/string/object readbacks; config changes reject late responses; disabling updates and closing abort requests/clear intervals; failure retains rows with only a console warning; reenabling refreshes immediately. Exercise 20 to 10 to zero real rows at constant capacity, clamping a Page 2 request to 1 without rewriting the operator's Page value. Inspect long names, logo contrast on the actual backing, tile visibility, pagination and row fit. In update mode, do not promise page-transition stagger beyond per-row Update effects. For rolling replacements, use clipped row groups and verified UpdateOut/UpdateIn assignments; header fades are a separate design choice. Update managed Control App extracts before testing them. Record unit logic, Player fixture, real network, visual and Control App evidence separately. Do not modify user scenes as part of contributor regression work.

## Add a column

Extend the existing graphic without rebuilding it. Preserve source row order unless sorting is explicitly requested; placement, alignment, font and emphasis are user-specific choices, not part of the data recipe.

1. Inspect the owner, template controls, fallback runtime type, current script and source headers. Apply the revision gate for authored scenes. Agree a stable row key, display formatting and whether a missing header should blank that optional column or reject the response. Required identity headers such as club remain required.
2. Open the row template through the owner tile/field and retain its session token. Add the native text tile and a Text template control such as `points`; link any cell fill to the existing padding-aware color control. Reuse existing colors rather than freezing a new opaque fill. Adjust geometry only as agreed. Use the current token for local Update batches; verify phases, clipping and layer order.
3. Add the new key to every real and padded fallback row. Use a blank display value such as `' '` for padding and absent optional values, and retain transparent fills/hidden image tiles. Exit via root, reopen the ordinary owner, discard template IDs, and rediscover its copied template contract. Reseed with `update-table`, which preserves array versus JSON-string stored content. Verify all padded rows and unchanged options; after a failure read back before retrying.
4. Update the header mapping in the existing script, preserving listeners, cancellation, capacity and single authority. For this example, insert the following immediately after `var optionalColumns = [];` to extend the nine-column schema with optional numeric Points:

```javascript
columns.push('points');
numeric.push('points');
optionalColumns.push('points');
```

5. The shared `cell()` tolerates absent optional headers and null/missing cells. For numeric display it prefers gviz `f` when `v` is a number and `f` is a string, falling back to `v`; validate and calculate with raw `v`, not locale-formatted text. This preserves sheet formatting (including grouping or leading zeros) rather than inventing a numeric display format. Malformed numbers still reject the refresh; duplicate recognized headers also reject it. Missing optional Points produces `' '` and does not retain stale points or blank the entire table.
6. Widen the operator's Sheet Range through `set-control-value` to include the actual new column; do not infer its letter from this example. Save through fresh script handoffs and require byte-for-byte readback. Keep this recipe's flow sheet -> script -> widget; do not introduce a backing data Control Node or write operator Range/Page values from the script.
7. In Player, verify all visible values on pages 1 and 2, remove only the optional header from the range, require blank cells, then restore it and require the original values. Inspect Update motion separately at intermediate frames. Real source edits and Control App behavior require their own checks.

### Column verification scenario

For a separately authorized fixture, place the nine required columns in A:I and optional Points in J. Seed fallback rows to match that approved fixture except that points are blank, and set Auto Update off **before Player loads**. The blank fallback is the independent expected empty-column image. Adapt both ranges and the points-only pixel region below to the inspected layout; x=82/y=20/width=18/height=65 is illustrative, not a design rule. Use a fixture without motion in other fields during comparison. Confirm source convergence and inspect every visible point; fixed waits and pixel changes alone do not prove a successful fetch. Run in a task-temporary verification page, restoring the user's controls afterward if any authoring changes were needed.

```json
{
  "version": 1,
  "steps": [
    { "action": "jumpTo", "state": "In" },
    { "action": "setPayload", "payload": { "Page": 1, "Auto Update": false } },
    { "action": "wait", "milliseconds": 2000 },
    { "action": "capture", "name": "expected-empty-column" },
    { "action": "setPayload", "payload": { "Sheet ID": "PUBLIC_FIXTURE_ID", "Sheet Tab": "Standings", "Sheet Range": "A1:J41", "Refresh Seconds": 30, "Auto Update": true } },
    { "action": "wait", "milliseconds": 3000 },
    { "action": "capture", "name": "points-present" },
    { "action": "assertPixelsChanged", "from": "expected-empty-column", "to": "points-present", "region": { "unit": "percent", "x": 82, "y": 20, "width": 18, "height": 65 }, "minimumChangedPixels": 1 },
    { "action": "setPayload", "payload": { "Sheet Range": "A1:I41" } },
    { "action": "wait", "milliseconds": 3000 },
    { "action": "capture", "name": "points-absent" },
    { "action": "assertPixelsMatch", "from": "expected-empty-column", "to": "points-absent", "region": { "unit": "percent", "x": 82, "y": 20, "width": 18, "height": 65 }, "maximumChangedPixels": 0 },
    { "action": "setPayload", "payload": { "Sheet Range": "A1:J41" } },
    { "action": "wait", "milliseconds": 3000 },
    { "action": "capture", "name": "points-restored" },
    { "action": "assertPixelsMatch", "from": "points-present", "to": "points-restored", "region": { "unit": "percent", "x": 82, "y": 20, "width": 18, "height": 65 }, "maximumChangedPixels": 0 },
    { "action": "setPayload", "payload": { "Page": 2 } },
    { "action": "wait", "milliseconds": 2000 },
    { "action": "capture", "name": "points-page-2" },
    { "action": "setPayload", "payload": { "Auto Update": false } }
  ]
}
```

The supplied Points-extension task reported a real Google/Player run with points on two pages, blank cells after excluding the header, restoration after widening the range, and zero script errors. That is user-supplied evidence for its six-column layout, not an independent rerun of this ten-column example. Live cell edits, Control App behavior and detailed roll-animation inspection were not verified.