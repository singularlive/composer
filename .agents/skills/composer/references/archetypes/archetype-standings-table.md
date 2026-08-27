# Standings table

## Use when

The user asks for league standings, rankings, group tables, leaderboards, or a repeated comparison of teams and competition statistics.

## Default interpretation

Create one independently cued standings module with a title/header and a compact ranked table. Use a realistic five-row sample with rank, team, played, goal difference, and points unless the request or sport requires different columns.

## Semantic content

- Required: rank, participant identity, and the primary ranking metric.
- Recommended for soccer: played, goal difference, and points.
- Optional: form, movement, qualification/relegation zones, team logos, games won/drawn/lost, group label, or explanatory legend.

## Composition structure

- One standings composition per independently cued table or group.
- Use the supported Table widget and a widget-owned row template for genuinely repeated rows; keep title/header outside the row template when it has a different lifecycle.
- Expose only externally meaningful data and presentation options. Use coordinated payload/script logic only when one external data object must populate or derive multiple rows and values.
- Keep row identity stable so ordering changes do not corrupt team data.

## Design rules

- Make rank and primary metric easy to compare vertically; align numeric columns consistently.
- Use repeated row rhythm, restrained separators, and a clear header hierarchy.
- Use color bands or accents only for meaningful zones or highlighted teams, with a non-color cue when needed.
- Keep the visible row count and type size appropriate to the intended output resolution.

## Variations

League table, group standings, top/bottom subset, highlighted team, form indicators, logo-led rows, compact overlay, or full-frame table.

## Edge cases

Long team names, tied points, negative goal difference, double- or triple-digit statistics, missing logos, row additions/removals, reordered standings, empty optional columns, and localization.

## Ask only when

- The ranking metric or required columns cannot be inferred from the sport/context.
- The requested row count cannot fit the intended format without changing pagination or module structure.
- Live external data integration is mandatory but its input contract is unspecified.

## Related techniques

- [Stagger by information importance](../techniques/technique-stagger-by-importance.md)
- [Clipped group reveal](../techniques/technique-clipped-group-reveal.md)

## Verify

Confirm Table ownership and row-template identity through readback; rankings and numeric columns align; long names and extreme values remain legible; rows can reorder without identity leakage; missing logos and empty optional fields degrade cleanly; zone/highlight meaning remains clear; and any script-driven table population is verified in Singular Player.
