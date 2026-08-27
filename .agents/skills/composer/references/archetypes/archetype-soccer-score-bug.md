# Soccer score bug

## Use when

The user asks for a soccer scoreboard, score bug, match-score overlay, or on-air score display without requesting a full-frame presentation.

## Default interpretation

Create one compact, transparent, independently cued score bug. Place it in an open broadcast-safe upper corner after inspecting existing content. Use editable sample values such as `ARS`, `CHE`, `1`, `0`, `67:42`, and `2H`.

## Semantic content

- Required: home and away names or abbreviations, home and away scores.
- Recommended: match clock and period or match status.
- Optional only when requested or supported by supplied assets/data: team logos, team colors, competition label, aggregate score, penalty score, cards, or possession.

## Composition structure

- One score-bug sub-composition with separate home identity, away identity, score, and clock/status regions.
- Native Text for labels and values; independent Image slots for intended logos.
- Public text controls for team identities, standalone number controls for scores, text controls for clock/status, color controls for team accents, and image controls for logos when present. Because a visible score is Text, mark the numeric-input-to-display mapping as runtime logic and follow [composition scripts](../composition-scripts.md) after the structure and controls are verified.
- Treat the clock as operator-controlled text by default. Use script-driven timing only when the user requests an autonomous clock.
- Keep shell and content lifecycles separate only when part of the bug must persist while another part changes or leaves.

## Design rules

- Keep everything outside the bug transparent and the footprint compact.
- Give scores the strongest hierarchy; mirror team identity alignment and keep the clock/status clearly subordinate.
- Use neutral high-contrast surfaces with team-color accents and a coherent broadcast-safe type hierarchy.
- Preserve balanced geometry when one or both logo assets are missing.
- Choose one restrained signature motif, such as a clipped accent rail, asymmetric clock tab, or controlled score-cell cutout.

## Variations

Horizontal or compact stacked layout; abbreviations or full names; with or without logos; clock or status-only; minimal, editorial, or energetic art direction.

## Edge cases

Long club names, scores from 0–99, added time such as `90+7`, extra time, penalty shootouts, empty status, missing logos, unknown team colors, and alternate output resolutions.

## Ask only when

- The request and existing composition cannot establish overlay versus full-frame output.
- Mandatory official branding or exact team assets are required but not supplied.

Otherwise use the compact overlay default, record the assumptions, and proceed.

## Related techniques

- [Stagger by information importance](../techniques/technique-stagger-by-importance.md)
- [Clipped group reveal](../techniques/technique-clipped-group-reveal.md)

## Verify

Confirm required controls and links through readback, including intentionally unlinked standalone number inputs; long and abbreviated names remain legible; 0–99 scores remain centered and balanced; added-time/status changes do not shift unrelated content; missing logos preserve layout; score payload changes update only the intended Text value; settled In and Out states are complete; and score mapping plus any autonomous clock works in Singular Player.
