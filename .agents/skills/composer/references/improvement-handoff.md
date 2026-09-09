# Composer skill improvement handoff

Use this workflow when the user says **generate improvement handoff** after they have corrected, taught, or refined how the Composer skill should perform a task. Produce a self-contained prompt that the user can paste into a session using the `develop-composer-agent-skill` workflow.

This is a retrospective feedback artifact. It is not the CLI `script-handoff`, does not carry credentials or persisted script context, and must not trigger additional Composer or Player work.

## Evidence boundary

Use only the completed task conversation and evidence already obtained during that task. Do not acquire or renew a work lease, run Composer commands, reopen scopes, capture more frames, edit the composition, or modify repository files merely to generate the handoff. If the immediately preceding task still owns a work lease, release it before responding.

Preserve the technical meaning of the user's correction. Separate:

- what the user explicitly taught or requested;
- what the skill originally did or proposed;
- what the final implementation and verification established;
- what remains inferred, disputed, or unverified.

Do not present every preference as universal guidance. Classify each lesson as one or more of:

- reusable Composer authoring guidance;
- candidate recipe;
- missing or inadequate command/tooling;
- product defect;
- documentation ambiguity;
- one-off design preference;
- uncertain and requiring more evidence.

Recommend a skill or product change only when the correction is reusable or exposes repeatable friction. A one-off visual choice may be useful task context but is not by itself a reason to change the runtime skill.

## Sanitization

Exclude credentials, tokens, secrets, private URLs, complete temporary paths, raw logs, image data, and unrelated composition content. Omit internal IDs unless one is essential to reproduce an identity or scope defect; prefer stable names and structural descriptions. Do not reproduce confidential payload values when representative placeholders preserve the lesson.

Keep authority claims precise:

- Composer model readback proves authored structure and stored values.
- A successful script write proves persistence only.
- Player evidence proves runtime behavior only for the scenarios actually exercised.
- A screenshot proves only the captured visual moment.

State missing evidence instead of filling gaps from memory. If the conversation has no correction, no implemented fix, or no verification, label those sections as unavailable or unverified and identify what evidence is needed. Do not invent a completed implementation to fill the template or run new commands to supply missing evidence.

## Required output

Return one copy-paste-ready prompt addressed to a Composer-skill development agent. Do not preface or follow it with conversational commentary. Use this structure:

```text
Improve the Singular Composer skill based on the completed user-guided task below.

## Original task
<What the user asked to build or change, including only relevant sanitized structure and behavior.>

## Initial approach
<What the Composer skill initially did or proposed, including the assumptions and workflow it followed.>

## User correction
<What the user explicitly identified as incorrect, incomplete, awkward, or below the expected quality. Distinguish explicit instruction from inference.>

## Correct implementation
<The final workflow and result, including relevant ownership, compositions, widgets, Control Nodes, links, scripts, timelines, Update animations, display variants, and verification. Explain why it is preferable.>

## Generalizable lessons
<For each lesson, give its classification and explain why it is reusable, composition-specific, or uncertain.>

## Evidence
<Separate Composer model readback, Player/runtime evidence, visual checkpoints, and anything not verified.>

## Friction observed
<For each meaningful issue: operation, observable symptom, impact, workaround, and concrete improvement candidate. State explicitly when none was observed.>

## Requested improvements
<Propose the smallest useful changes. Route each to SKILL.md guidance, a runtime reference, a reusable recipe, CLI/editor/server implementation, a focused regression, a reusable Player scenario, or contributor tracking.>

## Acceptance criteria
<Objective focused checks that prove each proposed improvement without weakening existing contracts.>

## Safety and preservation
<Relevant content that must remain untouched, authority boundaries, sanitization requirements, and prohibited shortcuts.>

## Requested-work checklist
- [ ] <Concrete development action>
- [ ] <Focused validation or evidence action>
```

Make the resulting prompt understandable without access to the original conversation. Prioritize root causes and reusable knowledge. Be candid about mistakes, workarounds, uncertainty, and unverified behavior. Do not instruct the development agent to implement a proposal that conflicts with the user's correction.