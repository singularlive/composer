# Singular Composer

Use an AI agent to inspect, build, animate, and refine graphics in your open [Singular Composer](https://www.singular.live/) composition.

The `composer` skill works with the composition you already have open. It can inspect existing elements, create graphics, organize sub-compositions, expose Control Nodes, add animations and behaviors, and help author composition scripts.

## Install

```bash
npx skills add singularlive/composer -y
```

Restart your agent after installation if it does not discover the skill immediately.

## Quick start

1. Open the composition you want to edit in Singular Composer.
2. Ask your agent to use the `composer` skill. For example:

   ```text
   Use $composer to create a clean broadcast lower third in the open composition.
   ```

3. When asked to pair, click **Agent** in the Composer toolbar.
4. Send the six-character pairing code to your agent.
5. After the agent connects, the pairing dialog closes automatically. Keep the Composer tab open while the agent works. You can watch progress in the draggable status panel and click **Cancel operation** at any time.

The pairing code is one-time use and expires after 10 minutes. After pairing, the scene/account authorization remains valid for 30 days and Composer resumes it automatically after a reload, so you do not need to pair for every task. Composer locks only while the agent is actively working and unlocks when the task finishes. **Cancel operation** interrupts the current task without revoking the saved authorization; use **Disconnect AI Agent** when you want to revoke it.

## Example requests

You describe the result you want; the skill handles inspection, commands, readback, and visual verification.

### Build a graphic

```text
Use $composer to create a lower third for a football broadcast. Include the
player name, team, number, and a logo placeholder. Use a clean dark theme with
yellow accents, and expose the editable text and image fields as Control Nodes.
```

```text
Use $composer to build a scoreboard from the reference image I attached.
Separate the clock, score, and team identities into independently controllable
sub-compositions. Preserve anything already in the composition.
```

### Refine existing work

```text
Use $composer to make the selected title easier to read on video. Keep its text
and position, improve contrast and spacing, then verify the result in Composer.
```

```text
Use $composer to update only the sponsor module. Replace its image URL, keep
the existing animation, and do not change the other groups.
```

### Add motion

```text
Use $composer to animate the headline, subtitle, and logo into view in that
order. Use a short stagger and keep the background visible when the text exits.
```

```text
Use $composer to add a subtle continuous pulse to the live indicator. Do not
change any other behaviors or Timeline animations.
```

### Work with Control Nodes

```text
Use $composer to expose the selected text, its visibility, and its opacity as
Control Nodes. Keep existing controls and links unchanged.
```

```text
Use $composer to set the score_home Control Node to 3 and verify that the
linked text updates in Composer.
```

### Add runtime logic

```text
Use $composer to add a composition script that formats the clock Control Node
as MM:SS. Verify the persisted script and its behavior in Singular Player.
```

The skill uses a separate authorized handoff for composition scripts. You should never need to copy or share a Composition API token or access token.

## Writing effective requests

Include the details that matter to the result:

- which composition, selected element, group, or module to change;
- the text, data, colors, images, and dimensions to use;
- which elements should remain independently controllable;
- which fields should become public Control Nodes;
- the intended In, Out, Update, or continuous Behavior motion;
- what must be preserved.

Screenshots and short reference videos are useful when layout, styling, reveal order, or timing matters. State which aspects should match and which may be adapted.

## Safety and privacy

- Pair only with the composition you intend to edit.
- Treat the pairing code as a short-lived secret and send it only to the agent doing the work.
- Never paste access tokens, browser storage, or Composition API tokens into chat.
- Use **Cancel operation** to interrupt the current task and unlock Composer without revoking the saved authorization.
- Use **Disconnect AI Agent** when you want to revoke the authorization and require a new pairing code for future work.
- Ask for inspection-only work when you do not want any changes.
- Name anything that must be preserved, especially before deletion or broad visual refinement.

The skill does not replace raw composition JSON or execute arbitrary code through the paired editor connection. Composition scripting uses a separate scoped authorization and Singular Player remains the authority for runtime behavior.

## Troubleshooting

### The Agent button is missing

Confirm that you are using a supported Singular Composer environment and account, and that you opened a composition in the editor rather than a dashboard or control application.

### The pairing code was rejected

Pairing codes are one-time use and expire after 10 minutes. Click **Agent** again and send the newly generated code.

### The agent says the Composer session is unavailable

Keep the Composer tab open while the agent is working. After a refresh or reopening the composition, allow Composer to resume the saved authorization automatically. Generate a fresh pairing code only when the authorization has expired, was explicitly disconnected, or was revoked.

### A command targeted the wrong composition

Navigate to the intended composition in Composer, then repeat your request. The skill automatically verifies the active composition before continuing.

## Scope and limitations

The skill supports Text, Rectangle, Circle, Image, AISVG, and Table-based workflows, ordinary and widget-owned sub-compositions, Control Nodes, Timeline and Update animations, continuous behaviors, and composition scripting.

It does not automatically search for assets, generate images, upload local files, guarantee pixel-perfect recreation, replace raw composition JSON, or provide unlimited autonomous refinement. Provide accessible image URLs or attached references when assets matter.
