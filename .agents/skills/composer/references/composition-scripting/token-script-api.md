# Composition Token Script API

These endpoints remain the persisted-script transport used after a Composer `script-handoff`. They are not a standalone user-token workflow and must not be exposed through the paired editor relay. Every `/scripts` request requires the saved, unexpired agent bearer credential, an active task-level work lease, and the Composition API token in the URL. Successful requests renew the work lease and Composer's visible lock deadline.

## Base URL

- Take the base URL, Composition API token, and saved agent authorization only from the version-1 handoff.
- Keep both credentials in the handoff pipeline; never place either in process arguments, logs, committed files, screenshots, or final output.
- Build endpoints as `<base-url>/...` using the handoff host.
- Send the agent credential as `Authorization: Bearer <credential>` on every `/scripts` endpoint below. The helper does this automatically; never extract or reproduce the header manually.

## Endpoints

- `GET <base-url>/apiv1/compositions/<token>/content`
  - Returns the composition content JSON.
  - Use it to inspect the composition tree, control-node model fields, current payload, `dataLinks`, and `nodeRefs`.

- `GET <base-url>/apiv1/compositions/<token>/scripts`
  - Returns the available script IDs and names.
  - Use it first to discover which script IDs exist.

- `GET <base-url>/apiv1/compositions/<token>/scripts/<subcompId>`
  - Returns the current script body for the target script ID.

- `PUT <base-url>/apiv1/compositions/<token>/scripts/<subcompId>`
  - Replaces the whole script.
  - Body format:

```json
{
  "script": "..."
}
```

- `PATCH <base-url>/apiv1/compositions/<token>/scripts/<subcompId>`
  - Applies line-based partial edits.
  - Body format:

```json
{
  "patches": [
    {
      "startLine": 5,
      "endLine": 7,
      "content": "replacement text"
    }
  ]
}
```

## Important limitation

The composition token API (`apiv1/compositions/{token}`) does **not** include an endpoint for updating control-node payload at runtime. To trigger `payload_changed` events externally, you must use the **Player SDK** in a browser context:

```javascript
player.getMainComposition().setPayload({ Text_Color: { r: 255, g: 0, b: 0, a: 1 } });
```

The separate `apiv2/controlapps/{token}/control` API exists in Singular for control apps — do not conflate it with the composition token API.

## Required workflow

Create a fresh version-1 handoff after final Composer readback and pipe it to the bundled helper:

```bash
node scripts/composer-agent.js script-handoff --compact |
  node scripts/singularTokenScriptCli.js --handoff-file - --action get-script
```

The handoff supplies the host, composition token, saved agent authorization, active composition context, and suggested script ID. `get-script`, `put-script`, and `clear-script` use that ID unless `--script-id` intentionally overrides it. The default `summary` is local and does not request `/content` or `/scripts`. Missing or invalid authorization returns 401; missing or expired work ownership returns 409; a revoked, completed, expired, scene-mismatched, or account-mismatched authorization cannot access the scripts. `OPERATION_CANCELLED` releases the work lease without revoking the bearer credential; the runtime must stop the current task and discard its handoff instead of issuing another script request.

When a global, overlay, ambiguous, or out-of-scope target requires the persisted tree, pipe a fresh handoff to `--action summary --full`. This reads `/content` and `/scripts` without requiring token extraction. Then:

1. Resolve the intended script ID from the active handoff or full summary.
2. Read the target script through `get-script`.
3. Make the smallest viable whole-body edit.
4. Write through `put-script`, preferably using `--script-file` for multiline content.
5. Re-read the script and verify the relevant runtime path in the Player harness.

The helper rejects direct `--token` and `--host` operation. Its normal output omits both handoff credentials, and request errors redact the Composition-API-token-bearing URL segment.

## Composition JSON fields worth checking

- `mainComposition`
- `compositions.<compId>.tiles`
- `compositions.<compId>.groups`
- `compositions.<compId>.dataSources.composition.controlNode.model.fields`
- `compositions.<compId>.dataSources.composition.controlNode.payload`
- `compositions.<compId>.dataLinks`
- `compositions.<compId>.nodeRefs`

## How to interpret the model

- If a control-node field exists but is not linked through `dataLinks` or `nodeRefs`, it is a valid standalone composition input. Updating it changes the composition payload and can trigger `payload_changed`, but it produces no visible output unless a composition script consumes it.
- If a script needs to interpret control-node data and drive widget output, read `comp.getPayload2()`, find the widget with `comp.findWidget()`, and update it through `widget.setPayload(...)`.
