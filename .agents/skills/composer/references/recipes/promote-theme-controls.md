# Promote local theme controls to root

Use when the user requests global palette or typography controls, or an existing shared-theme contract requires root ownership. Do not infer global scope from the mere presence of Color or Metric Font fields. Moving theme ownership does not move module-specific text content.

## Read by phase

- Before mutation: [authoring standard](../authoring-quality.md), [revision approval](../revisions.md#revision-approval-before-mutation), [control ownership](../control-nodes.md), [creation and reuse](../control-node-creation.md), and [control commands](../control-node-commands.md).
- Before cleanup: [control editing and deletion](../control-node-editing.md).
- Before visual verification: [capture](../capture.md).

This is a sequenced migration using native typed commands, not an atomic promotion command. Each successful command can remain committed if a later command fails. Do not replace raw composition JSON, copy values with composition scripts, or fabricate Metric Font metrics.

## Preserve and resolve

1. Inspect root, the module, every affected descendant, and their live widget schemas. Record the current controls, public IDs, internal keys, source compositions, values, metadata, container membership, and exact destination links. Inspect all consumers of the old controls, not only currently visible widgets. Readiness is not evidence that effective widget values have propagated.
2. Establish an explicit old-source-to-root-source mapping for the requested theme only. Leave Name, Role, Detail, and other module content sources in place. Preserve public names where possible, but remember that moving a public input changes its composition scope even when its name stays the same. Identify external payload or existing script consumers before removal; ask about unknown consumers rather than assuming no links means unused.
3. Inspect root for conflicts. Reuse an existing root source only when its exact public ID, type, intended role, and current value match the approved shared contract. A same-name source is not permission to overwrite it or fan its value into unrelated targets. Resolve conflicting values or names with the user; do not merge distinct color or font roles silently.
4. Record current effective widget values and their authoritative source payloads immediately before migration, including user-adjusted colors. If a linked target still shows stale stored data, stop and reconcile it with the source before creation. Do not initialize from catalog defaults or an earlier design sample. One complete Metric Font value includes family, weight, style, subset, and metrics; use separate role controls when those values must differ.

## Create, verify, then retire

1. With the descendant target active, create the first root-owned linked control without `--reuse-existing`. Use `--replace` only for the exact link replacement authorized by the promotion request. For example, after verifying the target's `font` field and its effective value:

   ```bash
   node scripts/composer-agent.js create-control --name "Font" --node-type metricfont --tile-id <first-text-id> --property font --source-composition root --replace
   ```

2. Inspect the returned source composition, public `id`, `keyId`, initialized value, and `link.previousLink`. Read back the root source and the destination link. Require the new source value to equal the captured effective value, and the previous link to match the expected local owner. Preserve supported metadata through typed updates; if required metadata cannot be preserved, stop before deleting the original source.
3. Only after the first source and link are verified, connect each remaining approved destination to that exact source. Preserve the returned identity rather than assuming the requested name was accepted unchanged:

   ```bash
   node scripts/composer-agent.js create-control --name "<returned-font-public-id>" --node-type metricfont --tile-id <next-text-id> --property font --source-composition root --reuse-existing --replace
   ```

   Use the same sequence for each semantic Color role with `--node-type color` and the exact live property ID. A Color-to-Gradient link is appropriate only for an intentionally solid color, not a structured-gradient conversion. Reuse must not flatten different effective values without approval.
4. Stop dependent operations after any failed prerequisite. On an uncertain write, obtain authoritative readback before retrying or compensating. Do not delete old controls, blindly replay replacement links, or retry across cancellation. If interrupted, report which sources and links are verified and which remain pending.
5. Verify every replacement link before deleting any old source: defining root composition plus exact public ID/key, destination composition/tile/property, effective value, and preserved unrelated links. Confirm widget identities, content links, landscape layout, and animation are unchanged.
6. In root, organize the new controls in semantic Large containers, for example Global Colors and Global Typography. Use returned control IDs. Container configuration uses complete ordered membership; merge with inspected unrelated membership rather than replacing it accidentally. Do not create duplicate containers on retry.
7. Navigate to the old source module. Reinspect all references and known consumers. Delete only the exact obsolete local theme controls whose approved replacements are verified and whose remaining consumers are empty. Retain a source with unrelated consumers. Remove only now-empty theme containers, never the Content container or a composition graphic group.

## Verification and final state

- Model readback must prove root-owned theme links, preserved module content links, retained public names where possible, semantic containers, no unintended duplicate controls, and unchanged unrelated scene content. A new root key is expected; record the mapping and preserve unaffected identities.
- In Player, exercise a global accent change and a catalog-resolved font change through their root controls, and confirm every intended target responds. Use `set-control-font`, not caller-supplied metrics. Structural font links alone do not prove propagation after a font change.
- Restore test values to the latest user-approved values, not initial task defaults. Reinspect final ownership and values, restore the intended active scope and presentation, and release work.
- Report model readback, sampled Player results, and untested behavior separately. A sampled frame does not prove continuous playback or a separate external Control App.