# Motion commands

Use these command contracts with the motion semantics in [composition-motion.md](composition-motion.md).

## Timeline animations

| Command | Purpose |
| --- | --- |
| `timeline-animations` | Read the In/Out effect, easing, and parameter catalog. |
| `set-timeline-animation --id <id> --timeline <In\|Out> --effect <id> [...]` | **Targeted only:** assign one isolated keyframed In/Out animation atomically. |
| `set-timeline-animations --file <choreography.json>` | **Preferred for related assignments:** assign up to 100 keyed Timeline animations in one rollback-safe batch, with optional `after` dependencies and relative `offset` values. |

Always read `timeline-animations` before assigning one. Timeline animation supports `--start`, `--duration`, `--params-file`, and `--easing-file`. Prefer the batch command whenever two or more assignments form one choreography. See [compositions.md](compositions.md).

## Property-change Update animations

| Command | Purpose |
| --- | --- |
| `update-animations` | Read the Update effect, easing, phase, and shared-setting catalog. |
| `set-update-animation --id <id> --phase <in\|out> --effect <id> [...]` | **Targeted only:** assign one isolated property-change Update phase and any explicitly supplied shared settings. |
| `set-update-animations --file <assignments.json>` | **Preferred for related assignments:** assign up to 100 keyed Update phases in one rollback-safe batch. |

Update animation supports `--duration`, `--params-file`, `--easing-file`, `--active`, `--always-execute`, and `--offset`. It has no Timeline `start` or `after` fields. Prefer the batch command for two or more related Update assignments.

## Continuous behaviors

| Command | Purpose |
| --- | --- |
| `behaviors` | Read the shared Composer behavior property, effect, easing, and limit catalog. |
| `behaviors --id <tile-id>` | Return the tile's current behaviors together with the catalog. |
| `set-behavior --id <tile-id> --property <id> [...]` | **Targeted only:** add or replace one isolated continuous behavior by property. |
| `set-behavior --id <tile-id> --property <id> --remove` | **Targeted only:** remove one isolated behavior without replacing the rest of the array. |
| `set-behaviors --file <assignments.json>` | **Preferred for related assignments:** upsert or remove up to 100 keyed behavior assignments in one rollback-safe batch. |

`set-behavior` accepts `--effect`, `--active <true|false>`, `--value-min`, `--value-max`, `--duration`, `--duration-range`, `--delay`, `--delay-range`, and `--easing-file`. Values are checked against the live shared catalog before one sorted behavior array is written.
