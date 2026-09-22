# Public Google Sheet to Table

Status: candidate pending Singular Player and real public-source verification. Mocked-comp tests do not establish those gates.

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
3. Configure Table layout/options before linking. Create a `Standings` Table Control Node with matching column IDs/types and verified initial rows (or an explicitly agreed empty state). Link it to `tableContent`. Once linked, do not use `update-table` for rows: write `Standings` only.
4. Put standalone `Sheet ID`, `Sheet Tab`, `Sheet Range` (Text), `Auto Update` (Checkbox), `Refresh Seconds` (Number, 5-3600), and `Sheet Status` (Text, script-owned status) in a Large `Data Source` container. Default Auto Update off until access and configuration are confirmed. Put header controls in a separate semantic Large container. The Table Control Node retains its native table group.
5. The script writes only `Standings` and `Sheet Status` Control Node payloads. It never writes `tableContent` or row-template widgets. Disable operator editing of status where the host supports it. Explain that while Auto Update is on, operator row edits are overwritten on the next successful refresh, even if the source is unchanged.

The example expects nine row controls: text `rank`, `club`, `mp`, `w`, `d`, `l`, `pts`, and image `logo`, `arrow`. Numeric columns are validated as non-negative integers and converted to text for these controls. Adapt this explicit schema to the inspected template, not vice versa without approval. Blank club rows are skipped. Extra source columns are ignored; visibility/reference-only columns have no implicit effect. Agree any filtering separately. Empty image values are allowed; nonempty images must be credential-free HTTPS URLs. An empty valid range clears rows; failed/invalid reads never do.

## Script pattern

Follow [composition scripts](../composition-scripts.md) and the [runtime API](../composition-scripting/singular-scripting-doc.md). Read and merge the existing script/listener before writing; `addListener` supports one listener per composition/event. The example is a complete ES2017-compatible local script for an otherwise empty script slot. It requires browser XMLHttpRequest, URL and Blob APIs. Initial fetch occurs only with Auto Update on. There is at most one current request; configuration changes abort the old request and invalidate late callbacks. Requests time out after 15 seconds. Errors produce a status without logging source data, URLs or response bodies.

```javascript
(function() {
  var composition = null;
  var interval = null;
  var request = null;
  var generation = 0;
  var configKey = null;
  var onPayload = null;
  var columns = ['rank', 'club', 'logo', 'mp', 'w', 'd', 'l', 'pts', 'arrow'];
  var numeric = ['rank', 'mp', 'w', 'd', 'l', 'pts'];

  function status(value) {
    if (composition && composition.getPayload2()['Sheet Status'] !== value) {
      composition.setPayload({ 'Sheet Status': value });
    }
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
      if (headers.indexOf(name) < 0 || headers.indexOf(name) !== headers.lastIndexOf(name)) throw new Error('headers');
    });
    if (data.table.rows.length > 1000) throw new Error('rows');
    var rows = [];
    data.table.rows.forEach(function(source) {
      if (!source || !Array.isArray(source.c)) throw new Error('row');
      function cell(name) {
        var value = source.c[headers.indexOf(name)];
        return value && value.v != null ? value.v : '';
      }
      if (!String(cell('club')).trim()) return;
      var row = {};
      columns.forEach(function(name) {
        var value = cell(name);
        if (typeof value !== 'string' && typeof value !== 'number') throw new Error('cell');
        if (numeric.indexOf(name) >= 0) {
          if (String(value).trim() === '' || !Number.isSafeInteger(Number(value)) || Number(value) < 0) throw new Error('number');
          value = String(Number(value));
        }
        if ((name === 'logo' || name === 'arrow') && value !== '') {
          var image = new URL(String(value));
          if (image.protocol !== 'https:' || image.username || image.password) throw new Error('image');
        }
        row[name] = String(value);
      });
      rows.push(row);
    });
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
      status('Refresh failed; retaining last good rows');
    }
    current.onload = function() {
      if (!active()) return;
      if (current.status !== 200) { failed(); return; }
      var rows;
      try { rows = rowsFrom(current.responseText); } catch (error) { failed(); return; }
      request = null;
      if (JSON.stringify(composition.getPayload2().Standings) !== JSON.stringify(rows)) {
        composition.setPayload({ Standings: rows });
      }
      if (composition && generation === expectedGeneration) status('Updated');
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
    var payload = composition.getPayload2();
    var config = { id: payload['Sheet ID'], tab: payload['Sheet Tab'], range: payload['Sheet Range'],
      enabled: payload['Auto Update'], seconds: payload['Refresh Seconds'] };
    var nextKey = JSON.stringify(config);
    if (configKey === nextKey) return;
    configKey = nextKey;
    cancel();
    if (config.enabled === false) { status('Auto Update off'); return; }
    if (config.enabled !== true || typeof config.id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(config.id) ||
        typeof config.tab !== 'string' || !config.tab.trim() || config.tab.length > 100 ||
        typeof config.range !== 'string' || !/^[A-Z]+[1-9][0-9]*:[A-Z]+[1-9][0-9]*$/i.test(config.range) ||
        !Number.isInteger(config.seconds) || config.seconds < 5 || config.seconds > 3600) {
      status('Invalid source configuration; retaining last good rows');
      return;
    }
    var currentGeneration = generation;
    status('Refreshing');
    interval = setInterval(function() { refresh(config, currentGeneration); }, config.seconds * 1000);
    refresh(config, currentGeneration);
  }

  return {
    init: function(comp) {
      composition = comp;
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
    }
  };
})();
```

## Player verification

Mocked-comp tests prove parsing/lifecycle logic, not Google access, Player integration, images or table fit. Before live authoring, run `dependency-preflight.js --capture`. If Chrome is unavailable, use the [verification-unavailable handoff](../capture.md#verification-unavailable); do not claim a successful runtime refresh.

Use an approved public fixture with the nine headers above. In a private verification page, a custom Playwright harness may intercept only that fixture's exact gviz endpoint: serve row `Example Club` with pts 10 on the first request and pts 11 on the next. No credentials, real data or production requests are mocked. Set Refresh Seconds to 5 for this test only. The harness must assert through the Player composition API that `Standings` changes from the exact first rows to the exact second rows; never simulate this by writing Standings itself. Restore the requested interval afterward. The bundled verifier does not have network-fixture or payload assertions; use a task-temporary harness for these checks alongside this version-1 visual scenario:

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

Also verify: unchanged rows cause no redundant row write; config changes fetch the new tab/range and reject late old responses; disabling updates and closing abort requests/clear intervals; failure retains rows and changes Sheet Status; turning updates back on refreshes immediately. Inspect all rows at target resolution, long club names, logo/arrow loading, pagination and row-template fit. Update managed Control App extracts before testing their behavior. Clean up only task-owned fixtures and restore scope/state. Record separately which of unit logic, Player fixture, real network, visual quality and Control App behavior actually passed.