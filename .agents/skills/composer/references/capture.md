# Capture reference index

Capture only when pixels answer an unresolved question. Use model readback for structure and avoid screenshots as progress checks.

Capture reads persisted content. Complete held edits with `finish-work --save` (or user Save in manual mode) before reacquiring work for capture; see the [save prerequisite](capture-basics.md#unified-capture-command). Capture success does not certify that an unsaved editor batch was included.

| Task | Reference |
| --- | --- |
| Prerequisites, command contract, readiness, results, worker recovery, errors | [Capture basics and troubleshooting](capture-basics.md) |
| Root/active/template targeting, measurements, timeline positions, examples | [Capture targeting and examples](capture-targeting.md) |
| Player scenarios and continuous runtime verification | [Debugging and verification](composition-scripting/debugging-and-verification.md) |

## Seeked versus live evidence

A seeked Timeline capture establishes the rendered frame at the requested position in its private Player instance, not the lifecycle ordering of uninterrupted playback. In particular, a hidden pre-start frame does not prove that a delayed widget effect stays hidden during a real take In. Follow the [temporal evidence guidance](capture-targeting.md#temporal-evidence-for-animated-and-live-output) when acceptance concerns transitions or pre-start visibility; keep model, sampled-frame, live-playback and Control App evidence separate.

## Verification unavailable

On `CHROME_NOT_FOUND` or an unavailable system Chrome channel, stop capture attempts until the prerequisite changes. Structure readback, mocked tests and persisted script readback remain useful but are not Player or visual proof. Report **pending verification**, naming the missing prerequisite and these remaining checks as applicable:

- Load the persisted composition in Singular Player and confirm script initialization without typed script errors.
- Trigger the requested behavior, including a source/payload change after initialization; verify the exact resulting value and visible output.
- For public-sheet data, verify anonymous exact-tab/range access, browser network/CORS/parsing, interval refresh, error retention and disabled-update behavior.
- Check target-resolution table fit, long labels, row count/pagination, assets, overlap and clipping; check In/Out and Update states where applicable.
- Update a managed Control App extract before testing that output. Restore final controls/state/scope and clean up task-owned fixtures.

State which checks were completed and which remain. Do not call a successful script write or a mock response a successful live refresh, and do not imply that the user's manual checks have already passed.
