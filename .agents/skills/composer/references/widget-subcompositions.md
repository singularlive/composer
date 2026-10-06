# Widget sub-compositions

A widget sub-composition is a composition owned through a widget field whose schema type is `composition`. The widget decides how to instantiate and render it. This is different from an ordinary scene sub-composition tile: it may be repeated, resized, or driven with different data by the owning widget.

## Discover the relationship

Read the owning widget tile before navigation:

```bash
node scripts/composer-agent.js get --type tile --id <widget-tile-id>
```

`get` reports `widget.subCompositions`; reuse that fresh readback. Alternatively, use `widget-subcompositions --id <widget-tile-id>` when only the relationships are needed. It returns the same relationships without the rest of the widget schema; do not run both solely to rediscover the same relationship. Each relationship contains:

- `kind: "widget-subcomposition"`;
- the owning `tileId` and active `parentCompositionId`;
- the composition-valued `fieldId` and `fieldTitle`;
- the current `compositionId` and whether it exists;
- `mode: "static"` or `"dynamic"`;
- the dynamic template's ordered `controls`, including each control's `id`, `title`, `type`, current value, and model key.

The relationship mode describes Control Nodes only. A template with `mode: "static"` can still have changing [Widget Node](widget-nodes.md) outputs. Run `widget-nodes` inside it to discover those separate owner-supplied fields and native links.

A template is **dynamic** when its composition exposes Control Nodes. The widget may pass instance-specific values into those controls. A **static** template has no exposed controls; the widget can still instantiate it repeatedly, but there is no per-instance control contract.

Dynamic templates may expose a Rectangle or other Gradient-backed fill as a `color` control. A direct RGBA field value is preserved; a structured gradient initializes the control from its current `solidColor`. Instance data may then supply a tinycolor2-compatible string or color object because the existing gradient input converts it to a solid gradient.

## Output readiness

Successful template navigation is not acknowledgement that the owning widget has published its Widget Node schema. Before linking outputs, inspect the current source and fields through [Widget Nodes](widget-nodes.md). Empty discovery may reflect wrong scope or incomplete native callback publication; it is not proof the widget lacks outputs.

In the supplied native-clock case, output discovery was empty while the owning display variant was inactive; activating it and opening a fresh session made outputs available. This is reported task evidence, not a universal activation requirement or a diagnosed renderer defect. If this condition applies, record the current variant with `display-variants`, leave template mode via `open-composition --id root`, and use `activate-display-variant --name <owning-variant>` within authorized scope. Activation changes the persisted active presentation. Reopen the owning ordinary composition, reread the widget, and open its template through `open-widget-subcomposition` without `--create`. Rediscover fields and targets using the fresh token; do not replay old handles. Restore the prior variant after leaving template mode unless the user requested the new active presentation.

Allow callback publication and make one bounded fresh discovery attempt after this correction; if still empty, stop dependent linking and report unresolved readiness. Do not loop activation/reopening, fabricate fields or infer a universal dependency. Cancellation stops recovery.

## Open safely

Prefer resolving the template from its owning widget rather than retaining a raw composition ID:

```bash
node scripts/composer-agent.js open-widget-subcomposition --id <widget-tile-id>
node scripts/composer-agent.js open-widget-subcomposition --id <widget-tile-id> --field <field-id>
node scripts/composer-agent.js open-widget-subcomposition --id <widget-tile-id> --field <field-id> --create
```

`--field` is required when the widget has more than one composition field. Without `--create`, the command refuses an empty relationship. With `--create`, an empty field is initialized through the same `onEditCompStandalone` workflow as Composer's **Edit** button, producing a widget-owned composition that has no visible parent tile, and the command navigates into it. A non-empty relationship that points to a missing composition is always rejected rather than overwritten. The result reports `created: true` for a newly initialized template together with the authoritative relationship and navigation result.

Do not use `create-composition` to initialize a widget field. That command intentionally creates an ordinary scene sub-composition tile in a group; it is a different ownership model and will render as a parent layer unless separately hidden.

By design, Composer rebuilds a widget sub-composition when its standalone edit session ends: it copies the composition to a new ID, removes the old one, and updates the owning widget field. This copy-on-exit lifecycle makes the composition ID an ephemeral handle for the current template-edit session, not the template's durable identity. The stable relationship is the owning widget tile plus its composition-valued field. After returning to root or otherwise exiting template editing, discard the old ID and re-read the owner or use `open-widget-subcomposition` before every later operation.

The lifetime boundary covers every identity read from inside that template, not only its composition ID. Treat descendant tile/group IDs, Control Node model keys, Widget Node `keyId` values, and recorded link locations as handles for the current uninterrupted edit session. They may remain textually equal after a copy, but an agent must not rely on that. Once the template closes, discard them; reopen through the owner tile plus field, then rediscover the descendants, nodes, and links before another command or diagnosis. Do not use differences between cached and current internal IDs as proof that a runtime link is broken.

Await successful completion of every dependent asynchronous shell command before consuming its output files or navigating away from the template. A pending shell/session handle is not command completion: collect its final exit status and command result, then validate the expected output. Do not close or switch scopes while a template-dependent command remains pending, even for a read such as `get-many`. On failure, stop dependent work and follow the existing uncertainty/cancellation rules; do not consume missing, partial or stale output. If the template has closed, reopen through its owner and field, obtain a fresh session token and rediscover targets before an authorized retry. Waiting for an old command does not extend its identities' lifetime.

The CLI returns the token at `identityScope.sessionToken` from `open-widget-subcomposition`, and at `activeComposition.identityScope.sessionToken` from full `inspect` (not `inspect --summary` or `--selection`). Every later command that reads or changes this template must pass `--template-session <token>`. Composer validates the opaque token against the active owner/template session before executing the command. A missing token returns `WIDGET_TEMPLATE_SESSION_REQUIRED`; a token retained across close, copy, reopen, or another template returns `WIDGET_TEMPLATE_SESSION_STALE`. Use token-free full `inspect` to recover the current token, and token-free `open-composition --id root` to leave safely. The token is not a substitute for rediscovering element and node identities.

There is no non-session descendant/template-link inspector. Owner-side `get` or `widget-subcompositions` reads relationship/control summaries without opening an edit session; prefer that when sufficient. Opening only to inspect internals still invokes copy-on-exit, so it is not a read-only identity-preserving operation. Do not bypass session guards with raw model access.

On `WIDGET_TEMPLATE_SESSION_STALE`, stop using the old token and every cached descendant/node handle. Full `inspect` can recover the active session; when re-entry is needed, leave through root and reopen from the freshly read owner tile/field. Rediscover targets and outputs before retrying an authorized operation. Never reuse a stale token or treat activation as extending its lifetime.

Once open, ordinary active-composition commands apply: `inspect`, `get`, `apply`, `control-nodes`, and the other scoped composition operations. Read the Control Nodes before changing a dynamic template. Commands within the same uninterrupted edit session may use the active ID reported by `inspect`. Return to root with `open-composition --id root`, then immediately invalidate that ID and re-read the owner to obtain the rebuilt relationship.

To resume work in the owner, exit to root first, then open the owning ordinary sub-composition and reread the widget. Do not jump directly from a template to an ordinary composition using the template's session token or relax a stale-session guard. Root-first navigation deliberately ends the copy-on-exit session.

`capture --target active` is widget-aware. The standalone capture follows `activeComposition.widgetSubComposition.widgetTileId` into the owning widget iframe and captures the visually active runtime instance of the template. Root capture remains a capture of the full scene and widget-rendered result. There is no separate paired-editor capture mode.

Do not infer widget rendering behavior from the template alone. The owning widget controls instance count, sizing, state, timing, and the values supplied to exposed controls. Use the widget-specific reference when one exists.
