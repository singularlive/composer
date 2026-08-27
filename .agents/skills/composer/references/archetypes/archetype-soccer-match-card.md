# Soccer match card

## Use when

The user asks for a matchup, match preview, halftime card, final-score graphic, result card, or larger/full-screen soccer scoreboard.

## Default interpretation

Create one prominent matchup or result module suited to a full-frame or large presentation. If the wording names a final result, prioritize the result state; otherwise use a pre-match matchup state with editable samples such as `Northbridge FC`, `Riverside United`, `SAT 19:30`, and `National Stadium`.

## Semantic content

- Required: home and away identities plus an event state appropriate to preview, live, halftime, or final.
- Required for score/result states: both scores.
- Recommended: competition or round and date/time or match status.
- Optional: team logos, venue, aggregate or penalty result, sponsor, and background artwork supplied by the user.

## Composition structure

- One independently cued match-card composition unless the supplied background must persist separately.
- Mirrored team identity regions around a central event/status region.
- Native Text and Image elements with public controls for all event-specific values and assets.
- Use distinct operating states only when the requested workflow changes content or hierarchy, such as Preview, Halftime, and Final.

## Design rules

- Make the two teams balanced peers and the score or matchup the focal relationship.
- Use the larger canvas to create confident whitespace and a clear central axis instead of stretching a score bug.
- Keep competition/status context subordinate and reserve one motif for event identity.
- Maintain readability over the intended background; do not invent a full-frame background when the user asks for a large transparent card.

## Variations

Pre-match versus final result; full-frame versus large transparent overlay; logo-led versus typography-led; horizontal versus centered vertical matchup; optional aggregate or penalties.

## Edge cases

Long club names, missing one or both logos, double-digit scores, draws, postponed/abandoned status, aggregate and penalty notation, absent venue, and portrait versus landscape output.

## Ask only when

- Overlay versus full-frame cannot be inferred and changes the intended background treatment.
- The operating state is essential but the prompt does not distinguish preview from result.
- Mandatory official branding or artwork is missing.

## Related techniques

- [Stagger by information importance](../techniques/technique-stagger-by-importance.md)
- [Occlusion line handoff](../techniques/technique-occlusion-line-handoff.md)

## Verify

Confirm state-appropriate content and public controls; team sides remain balanced with long names or missing logos; preview and result samples do not collide; the focal relationship is legible at output resolution; intended states and In/Out motion are complete; and unrelated composition content is preserved.
