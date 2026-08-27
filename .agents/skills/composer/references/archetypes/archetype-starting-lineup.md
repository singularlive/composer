# Starting lineup

## Use when

The user asks for starters, a team sheet, roster introduction, starting eleven, or a pre-match lineup presentation.

## Default interpretation

Create one independently cued lineup presentation for a single team, with team identity, formation or roster context, and a complete realistic starter set. Default to a structured list when the prompt does not explicitly request a pitch formation.

## Semantic content

- Required: team identity and player names.
- Recommended: shirt numbers or positions and formation/lineup label.
- Optional: portraits, flags, captain/goalkeeper markers, coach, substitutes, and formation pitch.

## Composition structure

- One lineup composition per independently cued team; do not put both teams in one module unless requested.
- Use Table or semantic repeats for a regular list; use independently placed native elements for a formation layout.
- Give repeated live roster values stable public controls or an explicit supported update contract. Keep formation-derived placement separate from player identity.
- Add runtime logic only when an external payload must be transformed or routed across multiple player fields.

## Design rules

- Establish team identity first, then lineup title/formation, then a fast scan path through players.
- Make repeated rows or position clusters rhythmically consistent while preserving a clear goalkeeper/captain marker hierarchy.
- Use portraits only when intended; placeholders must retain the final asset bounds.
- Keep the display legible long enough for viewers to scan the full roster.

## Variations

List, two-column list, or pitch formation; names only or number/name/position; with or without portraits; one team or separately cued team modules.

## Edge cases

Long surnames, compound names, duplicate shirt numbers in sample data, missing portraits, formation changes, fewer or more rows than expected, empty position labels, and localization.

## Ask only when

- List versus pitch formation materially changes the requested result and cannot be inferred.
- One versus two teams changes the module count.
- Supplied roster data is required for fidelity but absent and placeholders would not satisfy the request.

## Related techniques

- [Stagger by information importance](../techniques/technique-stagger-by-importance.md)
- [Clipped group reveal](../techniques/technique-clipped-group-reveal.md)

## Verify

Confirm the roster count and public update contract; long names and missing portraits remain usable; repeated alignment and spacing are consistent; formation/list variants preserve reading order; In/Out covers every intended row or cluster; dynamic updates affect only the targeted player; and any payload-routing script is verified in Singular Player.
