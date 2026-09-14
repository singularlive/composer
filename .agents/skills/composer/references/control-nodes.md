# Control Node design and lifecycle

This reference owns Control Node scope, authority, and inspection. Continue to [Control Node creation](control-node-creation.md), [Control Node editing](control-node-editing.md), or [Control Node commands](control-node-commands.md) only when the task needs that contract. Widget-owned compositions require [widget sub-compositions](widget-subcompositions.md).

## Ownership and public contracts

A Control Node is a composition-level input. It may directly expose a selected widget-data or tile/group Transform/Effect property, or it may remain standalone so an external payload can trigger composition-script processing. Supported agent-created types are `text`, `textarea`, `number`, `normalizednumber`, `counter`, `color`, `image`, `checkbox`, `audio`, `video`, `data`, `jsonfile`, `json`, `datetime`, `location`, `selection`, `button`, `timecontrol`, `infotext`, and `metricfont`.

Native Gradient Control Nodes are outside agent support because their implementation-specific payload is not a suitable public contract. Author structured gradients directly on compatible widget fields. Use a Color Control Node linked to a Gradient field only when the public input is intentionally one solid color.

Targets resolve in the active composition. Unless the user explicitly requests an ancestor-owned public control, create a linked control beside its target and a standalone control where its consuming script lives. An ancestor-owned control may link into a descendant; sibling and unrelated sources are invalid. Confirm `activeComposition.stack` before mutation.

Every agent-authored public control belongs in an ordinary semantic Control Node container organized around the operator's task. Default to Large (`width: "double"`); use Small (`width: ""`) only for a concrete density reason. Verify ordered membership with `control-nodes` before handoff.

## Inspect first

```bash
node scripts/composer-agent.js inspect
node scripts/composer-agent.js control-nodes
node scripts/composer-agent.js get --type tile --id <tile-id>
```

`control-nodes` reports ordered fields, persisted metadata, widget-data links, and tile/group layout node references. Identity and ordering remain top-level field properties; additional persisted properties appear under `metadata`. Unknown metadata is read and preserved but cannot be changed by the agent. Use the widget schema field `id`, never its displayed title, as the property identifier.

If a requested widget field appears in `links`, or a Transform/Effect field appears in `nodeRefs`, its defining Control Node is authoritative. Change that control rather than writing the destination directly. For an inherited control, navigate to and update its defining composition. One destination has one write authority: do not also write a directly linked field from a composition script.

`immediateUpdate` is presentation behavior for specific Studio workflows, not a general propagation switch. It does not repair a stale Control App extract, unloaded AI Graphics definition, broken link, or incompatible value.

Never replace a conflicting link implicitly. Conflict errors identify the requested control and classify the existing source as a visible control, inherited control, stale link, or internal bookkeeping link. Inspect both sides and obtain explicit approval before replacing one property link.
