# Video Clip authoring

Use `video-clip` for a muted controllable clip. It maps to widget `812`.

Run `primitives --primitive video-clip`. Published version 16 exposes `videoFile`; numeric-string `volume`, `shift`, and `opacity`; `autoplay`; `loop`; `objectFit`; and the `start`, `play`, `pause`, and `seek0` buttons. The built-in renderer keeps the video element muted, so do not promise audible volume behavior; choose `video-clip-with-audio` when sound is required.

Composition transitions pause the widget on Out and resume on In only when its internal play state is active. Out is not a continuously enforced playback guard: asset/autoplay changes or playback buttons can start playback while already Out. Use a Player-reachable MP4 or WebM URL. Verify load, autoplay, loop, button order, seek, transition pause/resume, replacement or playback while Out, opacity, fit/shift, resize, and failures as affected by the change in the Player.
