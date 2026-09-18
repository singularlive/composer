# Singular Composer

Use an AI agent to inspect, build, animate, and refine graphics in your open [Singular Composer](https://www.singular.live/) composition.

The `composer` skill works with editable Composer elements: it can create graphics, organize independently controllable sub-compositions, expose Control Nodes, add motion, and author composition scripts. You describe the result and what must stay unchanged; the agent inspects the composition and verifies the affected structure and behavior.

[Get started](#getting-started) | [Example requests](#example-requests) | [Troubleshooting](docs/troubleshooting.md) | [What's changed](.agents/skills/composer/CHANGELOG.md)

## Requirements

- An AI agent that supports installing skills and running local Node.js commands.
- Node.js **22.x** on the machine running the agent.
- Access to **Composer AI**, currently limited to eligible accounts on the beta Composer deployment; it is not available to every Singular account.
- **Google Chrome** installed on the agent's machine for screenshots and Singular Player verification.

The skill includes its runtime dependencies. You do not need to run `npm install` inside it.

## Getting started

### Install

Choose one scope for a fresh installation.

Available across projects:

```bash
npx skills add singularlive/composer -g -y
```

Current project only:

```bash
npx skills add singularlive/composer -y
```

A project installation takes precedence over a global copy. Restart your agent if it does not discover the skill. Already installed? Follow [Updating the skill](docs/troubleshooting.md#updating-the-skill) instead of installing over a working copy.

### Connect and try a request

1. Open the composition you want to edit in Singular Composer.
2. Ask your agent:

   ```text
   Use the composer skill to create a lower third with editable name and title
   fields in its own sub-composition. Preserve all existing content.
   ```

3. When the agent asks to pair, click **Composer AI** (the magic-wand icon) in the Composer toolbar to open the connection panel.
4. Send the six-character pairing code only to that agent. Codes are one-time use and expire after 10 minutes.
5. Keep the Composer tab open. The Composer AI panel shows activity while the agent works. Answer any questions in your agent chat, including revision approval requests.

Skill invocation differs between agents; some also support a shortcut such as `$composer`.

### While the agent works

Composer locks editing while an agent operation is active, including while waiting for revision approval. When the operation ends, **Return to Composer** lets you continue editing without disconnecting the agent; the panel reopens when work starts again. **AI Agent needs your input.** means a question is waiting in your agent chat.

**Cancel Operation** interrupts the current task without revoking authorization. It is not an undo: changes already applied may remain. Once the operation has stopped, use **Disconnect AI Agent** to revoke authorization and require new pairing.

Authorization can last up to 30 days. Keeping the paired composition open maintains reconnection eligibility, including while idle. After it closes or loses connection, there is a 30-minute reconnect grace period; authenticated agent commands also refresh that period. After the grace period or authorization expiry, pair again. See [connection recovery](docs/troubleshooting.md#the-composer-session-is-unavailable).

## Example requests

The agent performs applicable model, visual, and runtime checks and should report anything it could not verify. State the desired result, the target, and what must be preserved.

### Build a graphic

```text
Use the composer skill to create a football lower third with player name,
team, number, and a logo placeholder. Use charcoal and yellow accents.
Expose the text and logo as controls and preserve all existing content.
```

```text
Use the composer skill to build a scoreboard from the attached reference.
Put it in its own sub-composition, with editable team names and scores.
Preserve the operator's text casing and verify the result.
```

### Refine existing work

```text
Use the composer skill to improve the selected title's contrast on video.
Keep its text, position, controls, and existing animation unchanged.
```

```text
Use the composer skill to add a portrait display variant for the lower third.
Preserve its landscape layout and share the same text and theme controls.
```

### Add motion

```text
Use the composer skill to animate the headline, subtitle, and logo into view
in that order with a short stagger. Keep the background visible on text exit.
Verify the motion in Singular Player.
```

### Work with controls

```text
Use the composer skill to expose the selected text, visibility, and opacity
as controls in a named Control Node container. Preserve existing links.
```

```text
Use the composer skill to create a native Timer Control Node counting down
from five minutes. Display it as mm:ss in linked Metric Text. Verify start,
pause, reset, and stopping at zero in Singular Player.
```

### Add runtime logic

```text
Use the composer skill to configure the native Timer as a countdown that
continues past zero, with Timer events enabled. Add an overtime indicator
in a separate, unlinked script-owned readout. Preserve the existing Timer
text link and formatting, and verify overtime and reset in Singular Player.
```

Basic Timer formatting does not need a composition script. For derived behavior, the skill uses a separate authorized scripting handoff; you should never need to share a Composition API token.

## Writing effective requests

Include the target composition or selected element, desired text and data, colors, assets, dimensions, editable controls, and what must remain unchanged. Specify In, Out, Update, or continuous motion when timing matters.

Attach screenshots or short reference videos and explain which aspects should match. Supply accessible asset URLs for images you want included; attached reference images are not automatically uploaded as assets.

## Safety and privacy

- Pair only with the composition you intend to edit. Share the pairing code only with your chosen agent.
- Never paste access tokens, browser storage, or Composition API tokens into chat or GitHub issues.
- Before high-impact edits, the agent recommends a revision and waits for your choice. A revision captures the last persisted scene, not unsaved edits; confirm your changes have saved before relying on it.
- Ask for inspection-only work when you do not want changes, and identify anything that must be preserved.
- After cancellation or an uncertain result, inspect what changed before retrying. Cancellation does not roll back completed changes.
- Composition content and references inspected by the agent are subject to your agent provider's data-handling policies. Review those policies before sharing confidential material.

The skill does not replace raw composition JSON or provide arbitrary execution through the paired editor connection. Composition scripts use a separate scoped handoff, and Singular Player is the authority for runtime behavior.

## Capabilities and limitations

Supported workflows include Metric Text, shapes, images, AI Graphics, Table and Grid, sub-compositions, Control Nodes and containers, native Timer controls, display variants, Timeline and Update animations, continuous behaviors, and composition scripting. Available widget fields depend on the loaded Composer version.

AI Graphics supports programmable graphics; this is distinct from generating bitmap image assets. The skill does not automatically search for assets, upload local files, guarantee pixel-perfect recreation, or provide unlimited autonomous refinement.

For technical details, see the [widget reference](.agents/skills/composer/references/widgets.md) and [Control Node reference](.agents/skills/composer/references/control-nodes.md). These are agent-facing operating references, not prerequisites for getting started.

## Help and feedback

- [Troubleshooting and updates](docs/troubleshooting.md)
- [Release changelog](.agents/skills/composer/CHANGELOG.md)
- [Report a problem or request a feature](https://github.com/singularlive/composer/issues/new/choose)

GitHub issues are public. Remove credentials, private URLs, composition content, and personal information before posting logs or screenshots.