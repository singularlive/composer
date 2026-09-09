# Video Background authoring

Use `video-background` for a continuously looping muted background video. It maps to widget `3936`.

Run `primitives --primitive video-background`. Published version 3 exposes `videoFile`, `objectFit` (`contain`, `cover`, or `fill`), and numeric-string `shift`. Preserve the live runtime types.

The renderer autoplays and loops. Composition transitions pause on Out and resume on In, but Out is not a continuously enforced playback guard: replacing `videoFile` while already Out can start playback again. Use a Player-reachable video URL. Verify load, loop continuity, transition pause/resume, replacement while Out, fit/shift, resize, and media failure as affected by the change, using timed Player evidence.
