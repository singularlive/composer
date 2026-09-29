# Composer skill improvement handoff

Use this workflow when the user says **generate improvement handoff** after they have corrected, taught, or refined how the Composer skill should perform a task. Produce a self-contained prompt that the user can paste into a session using the `develop-composer-agent-skill` workflow.

This is a retrospective feedback artifact. It is not the CLI `script-handoff`, does not carry credentials or persisted script context, and must not trigger additional Composer or Player work.

## Skill relevance filter

Report only improvements to the Composer skill and its agent integration. Every proposed improvement must name the affected skill command, documented authoring instruction, API contract, verification capability, or safety guarantee, explain the observed gap, and propose the smallest relevant correction.

Apply this filter before filling the template, including lessons, friction, acceptance criteria, and checklist items:

- Include incorrect or missing operating guidance, command response ambiguity, installation or handoff failures, ownership and lifecycle instructions, and capture/verifier contract defects when supported by the completed task's evidence.
- Exclude graphic-specific design refinements, visual construction recipes, composition-script application algorithms, native renderer/widget QA, browser-tool QA, and Control App product defects as requested skill work. Reusability alone does not establish skill relevance.
- A product symptom may supply minimal context for a specific instruction or API-contract gap; it does not authorize a product fix, product issue filing, or a renderer regression project. Separate observed behavior from an inferred cause and require confirmation before changing an API claim.
- Missing Player evidence alone is not a skill task. Scope any proposed check to the named instruction or verification contract, not acceptance of the completed graphic or general widget behavior.
- Do not turn user declines, cancellations, or repeated prompts into consent to relax revision, authorization, work-lease, single-write-authority, or credential-pipe safeguards.

Keep original-task and implementation details only where needed to explain a qualifying gap. Do not include an excluded-work backlog or invent improvements to populate every section. If nothing qualifies, say that no Composer-skill improvement was established and omit actionable checklist items.

## Evidence boundary

Use only the completed task conversation and evidence already obtained during that task. Do not acquire or renew a work lease, run Composer commands, reopen scopes, capture more frames, edit the composition, or modify repository files merely to generate the handoff. If the immediately preceding task still owns a work lease, release it before responding.

Preserve the technical meaning of the user's correction. Separate:

- what the user explicitly taught or requested;
- what the skill originally did or proposed;
- what the final implementation and verification established;
- what remains inferred, disputed, or unverified.

Do not present every preference as universal guidance. Classify observations before applying the skill relevance filter:

- reusable Composer authoring guidance;
- missing or inadequate command/tooling;
- product defect;
- documentation ambiguity;
- one-off design preference;
- uncertain and requiring more evidence.

Retain only lessons that identify a qualifying skill gap. Product defects and one-off preferences are not standalone skill improvements; uncertainty is not a reason to create general investigation work.

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
<Minimal sanitized task context needed to understand the qualifying skill gaps, not a full graphic specification.>

## Initial approach
<What the Composer skill initially did or proposed, including the assumptions and workflow it followed.>

## User correction
<What the user explicitly identified as incorrect, incomplete, awkward, or below the expected quality. Distinguish explicit instruction from inference.>

## Correct implementation
<The established correction relevant to the skill gap and its evidence. Omit unrelated final-design details and application algorithms.>

## Generalizable lessons
<Only qualifying skill lessons: name the affected command, instruction, API contract, verification capability, or safety guarantee; classify the gap and distinguish evidence from inference.>

## Evidence
<Separate Composer model readback, Player/runtime evidence, visual checkpoints, and anything not verified.>

## Friction observed
<For each skill-relevant issue: operation, observable symptom, impact, workaround, and bounded skill improvement candidate. State explicitly when none qualifies.>

## Requested improvements
<Propose the smallest qualifying changes. Route each to SKILL.md guidance, a runtime reference, CLI/editor/server agent integration, a focused skill-contract regression, or contributor skill tracking. Do not request new graphic recipes or standalone product work.>

## Acceptance criteria
<Objective focused checks for each named skill contract, using existing evidence where sufficient, without general graphic/widget QA or weakening existing contracts.>

## Safety and preservation
<Relevant content that must remain untouched, authority boundaries, sanitization requirements, and prohibited shortcuts.>

## Requested-work checklist
- [ ] <Concrete development action>
- [ ] <Focused validation or evidence action>
```

Make the resulting prompt understandable without access to the original conversation. Prioritize root causes and reusable knowledge. Be candid about mistakes, workarounds, uncertainty, and unverified behavior. Do not instruct the development agent to implement a proposal that conflicts with the user's correction.