# Troubleshooting

[Get started](../README.MD#getting-started) | [Example requests](../README.MD#example-requests) | [What's changed](../.agents/skills/composer/CHANGELOG.md)

## The Composer AI button is missing

Open a composition in the Composer editor, not the dashboard or a control application. Hosted Composer AI is currently limited to eligible accounts on the beta deployment. If it remains unavailable, check eligibility with your Singular administrator or support contact; installing the skill cannot enable editor access.

## The agent cannot find the skill

Restart the agent after installation. Confirm whether you installed for the current project or globally; a project copy can shadow a newer global copy. Ask the agent to diagnose the selected installation before installing another copy.

For technical installation checks, the agent can run `node scripts/composer-agent.js doctor` from the installed skill directory. Add `--capture` to check Google Chrome. Review diagnostic output before sharing it: it can include local installation paths.

## The pairing code was rejected

Codes expire after 10 minutes and can be used only once. Open **Composer AI** (the magic-wand icon) in the Composer toolbar. If the panel still shows the rejected code, click **Cancel pairing**, then reopen **Composer AI** to generate a fresh code. If the panel shows an error, use **Try again**. Reopening a waiting panel alone does not refresh its code.

If the panel already shows an authorized agent, ask that agent to check its existing connection first. To authorize a different agent, stop any active operation, choose **Disconnect AI Agent**, and reopen **Composer AI**. Send the new code only to your chosen agent; do not retry a rejected code or share credentials from browser storage.

## The Composer session is unavailable

Reopen the exact paired composition and keep its tab open. The AI connection resumes automatically while authorization remains eligible; you do not need to keep the Composer AI panel in front.

An open paired editor maintains reconnection eligibility, including idle periods. After it closes or disconnects, a 30-minute grace period applies; authenticated agent commands also refresh it. Authorization has a maximum lifetime of 30 days. After the grace period, expiry, or explicit disconnection, use a fresh pairing code.

If the agent reports `EDITOR_RELOAD_REQUIRED`, reload the paired composition after confirming your work has saved. If it reports `COMPOSER_EDITOR_DISCONNECTED`, reopen that composition. Ask the agent to check readiness and inspect the affected state before retrying any change whose outcome is uncertain.

## Updating the skill

Ask your agent:

```text
Update the composer skill to the latest available release using its safe
upgrade instructions. Validate the replacement before switching, check for
older copies shadowing it, and report the installed version.
```

The [installation and upgrade guide](../.agents/skills/composer/references/installation.md#safe-upgrade) describes staging a complete replacement, validating it, and switching directories only after it is ready. Do not delete the working installation first or run a generic installer over it. Restart the agent if it continues using older instructions.

See the [changelog](../.agents/skills/composer/CHANGELOG.md) for release details.

## The skill and Composer versions do not match

For `COMPOSER_AGENT_VERSION_MISMATCH`, update to the latest available skill. If that skill is newer than your Composer deployment, wait for Composer to be updated; do not downgrade the skill. If Composer is newer, update the selected skill and check for a stale project copy. Reload a stale editor after the versions align. Do not continue editing while protocols differ.

## Node.js or screenshot checks fail

The skill requires Node.js **22.x**. Ask the agent to verify the Node version used by its terminal, which may differ from another terminal on the same machine.

Screenshots and Player verification require system **Google Chrome** on the agent's machine. Playwright Core is already bundled; do not try to repair the installation by adding packages inside it. Use `doctor --capture` to identify the missing requirement, and report visual/runtime checks as unverified until it is resolved.

## Composer says the agent needs input

Return to your agent chat and answer its question. The Composer activity panel is not a chat input. Editing may remain locked while you decide whether to create a revision; answer in chat or use **Cancel Operation** to stop the operation.

Host permission prompts are separate: check the agent application if a command is awaiting approval, even when Composer does not display a needs-input status.

If the host blocks an updated skill as newly downloaded code, review its permission request or start a fresh agent session. Do not bypass security checks or grant blanket execution permissions. If the agent cannot release Composer, use **Cancel Operation** in the panel.

## A command changed the wrong content or timed out

Stop further edits; use **Cancel Operation** if work is still active. Tell the agent what you expected and request inspection of the affected content. A timeout does not prove that a change failed, and cancellation is not an undo.

Do not blindly repeat the request, delete items to recreate them, or restore an old snapshot over newer work. Agree on a bounded recovery after inspecting the actual result and confirming the intended target. A revision may help, but restoring it can replace subsequent changes.

## Report a problem

Use [Report a problem](https://github.com/singularlive/composer/issues/new?template=bug-report.yml) for reproducible failures or [Request a feature](https://github.com/singularlive/composer/issues/new?template=feature-request.yml) for workflow improvements.

Include the expected result, actual result, minimal reproduction, agent application, operating system, Node version, skill version, and any safe error code or protocol numbers. State whether the problem occurs before pairing, during editing, or during Player verification.

GitHub issues are public. Do not include pairing codes, tokens, browser storage, full command lines containing secrets, private composition or asset URLs, customer content, or unsanitized logs. Inspect screenshots for sensitive information too. If you cannot describe the problem safely in public, contact your Singular support representative privately.