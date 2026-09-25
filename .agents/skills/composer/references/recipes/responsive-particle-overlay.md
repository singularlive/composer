# Responsive particle overlay

Candidate: the supplied precipitation task has Player evidence at full and half widget width, but output-resolution changes, quarter width and reduced height have only local-harness evidence. The reference implementation below is locally tested, not independently installed and Player-verified. Read [AI Graphics](../widgets/ai-graphics.md) and its [authoring contract](../widgets/ai-graphics-authoring.md) before generating a definition.

Use one transparent AI Graphics widget for a coherent additive particle overlay. Clear the Canvas to transparency each frame; do not paint a background, floor or accumulation layer unless requested. Color alpha supplies the requested opacity; multiply it only by deliberate particle fades, not a duplicate opacity control.

## Public controls and preservation

When the user needs mixtures, independent Snow, Rain, Hail and Sleet systems can each have an enabled Checkbox and individual appearance/motion fields, including Color. Put public controls in semantic native Large Control Node containers with each Checkbox as `activeId`, and directly link one-to-one generated widget fields. Generated definition groups are not native Control Node containers. Neither four groups nor a fixed control count is a universal requirement; exclusive modes can use a selector when that is the desired contract.

Preserve existing IDs, values, links, settings, layout, effects and keyframes. Snapshot those through bounded readback before editing, compare afterward and restore only authorized temporary changes. Do not add composition-script forwarding for directly linked fields. Preserve template/API contracts and revision gates. Retrospective reproduction uses sanitized disposable local fixtures, not production scenes.

## Sizing and motion

Measure the runtime root's local `clientWidth/clientHeight`, not the scene resolution or a transformed viewport rectangle. Observe it with an owned `ResizeObserver` and retain the host `resize()` callback; both call the same idempotent function. Canvas bitmap resizing alone is insufficient: dimensions, drawing transform, geometry, velocities and population policy must agree.

Choose a uniform design scale, for example `scale = height / 1080`. Multiply radius, streak length, stroke width, horizontal wind and vertical speed by that same scale. At constant height, changing width must leave particle size, proportions, speed and trajectory angle unchanged. Height changes scale both axes together. Do not multiply wind by width while multiplying fall speed by height.

Population is separate from particle scale. One coverage-preserving policy is `target = round(density * width * height / (scale * scale * 1920 * 1080))`, clamped to a per-system and aggregate budget. Here density is the count at the design frame; narrower width reduces count, while reduced height with unchanged width increases count to preserve coverage by smaller particles. If another density definition is requested, document its units and expected counts. Bound backing pixels/DPR as well as particle count. Fade departures before removing them and distinguish target count, transitioning allocation and settled visible count.

## Lifecycle building block

This is an ES2017 lifecycle body for one rain-like system, not a complete four-weather definition. Put `<canvas></canvas>` in `html` and `canvas { display:block; width:100%; height:100%; }` in `css`. Declare generated fields `enabled` (Checkbox, true), `density` (Number, 64), `size` (Number, 1), `speed` (Number, 240), `wind` (Number, 60), and `color` (Color, plain RGBA). Keep IDs aligned with the existing contract when adapting. Other particle shapes can share measurement, time and budget handling while maintaining their own arrays and settings.

```javascript
var root, canvas, painter, observer;
var width = 0, height = 0, scale = 0, frameId = null, lastTime = null;
var destroyed = false, particles = [];
var settings = { enabled: true, density: 64, size: 1, speed: 240, wind: 60, color: 'rgba(210,225,245,0.7)' };
var capacity = 256, fadeSeconds = 0.25;

function numeric(value, fallback, minimum, maximum) {
  var parsed = typeof value === 'number' || typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : fallback;
}

function schedule() {
  if (!destroyed && width > 0 && height > 0 && frameId === null) frameId = requestAnimationFrame(draw);
}

function measure() {
  if (destroyed) return;
  var nextWidth = root.clientWidth, nextHeight = root.clientHeight;
  var ratio = Math.min(2, window.devicePixelRatio || 1, 4096 / Math.max(1, nextWidth), 4096 / Math.max(1, nextHeight));
  var bitmapWidth = Math.max(1, Math.round(nextWidth * ratio));
  var bitmapHeight = Math.max(1, Math.round(nextHeight * ratio));
  if (nextWidth === width && nextHeight === height && canvas.width === bitmapWidth && canvas.height === bitmapHeight) return;
  particles.forEach(function(particle) {
    particle.x *= width > 0 ? nextWidth / width : 0;
    particle.y *= height > 0 ? nextHeight / height : 0;
  });
  width = nextWidth;
  height = nextHeight;
  scale = height / 1080;
  if (canvas.width !== bitmapWidth) canvas.width = bitmapWidth;
  if (canvas.height !== bitmapHeight) canvas.height = bitmapHeight;
  painter.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (width <= 0 || height <= 0) {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    lastTime = null;
    particles = [];
    painter.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    return;
  }
  schedule();
}

function draw(now) {
  frameId = null;
  if (destroyed || width <= 0 || height <= 0) return;
  var elapsed = lastTime === null ? 0 : Math.max(0, Math.min(0.05, (now - lastTime) / 1000));
  lastTime = now;
  var target = settings.enabled ? Math.min(capacity, Math.round(settings.density * width * height / (scale * scale * 1920 * 1080))) : 0;
  while (particles.length < target) particles.push({ x: Math.random() * width, y: Math.random() * height, alpha: 0 });
  painter.clearRect(0, 0, width, height);
  painter.strokeStyle = settings.color;
  painter.lineWidth = 2 * settings.size * scale;
  var velocityX = settings.wind * scale, velocityY = settings.speed * scale;
  var magnitude = Math.hypot(velocityX, velocityY);
  var length = 20 * settings.size * scale;
  particles.forEach(function(particle, index) {
    particle.alpha = Math.max(0, Math.min(1, particle.alpha + (index < target ? 1 : -1) * elapsed / fadeSeconds));
    particle.x += velocityX * elapsed;
    particle.y += velocityY * elapsed;
    if (particle.x > width + length) particle.x = -length;
    if (particle.x < -length) particle.x = width + length;
    if (particle.y > height + length) particle.y = -length;
    if (particle.alpha === 0) return;
    painter.globalAlpha = particle.alpha;
    painter.beginPath();
    painter.moveTo(particle.x, particle.y);
    painter.lineTo(particle.x - length * velocityX / magnitude, particle.y - length * velocityY / magnitude);
    painter.stroke();
  });
  particles = particles.filter(function(particle, index) { return index < target || particle.alpha > 0; });
  painter.globalAlpha = 1;
  schedule();
}

return {
  mount: function(context) {
    root = context.root;
    canvas = root.querySelector('canvas');
    painter = canvas.getContext('2d');
    measure();
    observer = new ResizeObserver(measure);
    observer.observe(root);
  },
  update: function(changes, context) {
    if (destroyed) return;
    if (Object.prototype.hasOwnProperty.call(changes, 'enabled')) settings.enabled = changes.enabled === true || changes.enabled === 'true';
    ['density', 'size', 'speed', 'wind'].forEach(function(key) {
      if (!Object.prototype.hasOwnProperty.call(changes, key)) return;
      var limits = { density: [0, 256], size: [0.1, 8], speed: [1, 2000], wind: [-2000, 2000] }[key];
      settings[key] = numeric(changes[key], settings[key], limits[0], limits[1]);
    });
    if (Object.prototype.hasOwnProperty.call(changes, 'color')) {
      var css = context.colors.toCss(changes.color);
      settings.color = css && CSS.supports('color', css) ? css : 'rgba(210,225,245,0.7)';
    }
    schedule();
  },
  resize: function() { measure(); },
  seek: function(animation) {
    if (!destroyed) canvas.style.opacity = String(animation.timeline === 'Out' ? 1 - animation.progress : animation.progress);
  },
  destroy: function() {
    destroyed = true;
    if (observer) observer.disconnect();
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    particles = [];
  }
};
```

The observer never calls `context.requestLayout()` recursively. Ambient motion owns its clock; `seek()` owns only finite whole-overlay opacity. Repeated size notifications do not reset the bitmap or particle ages. Zero-size boxes stop frame scheduling and spawning; restored dimensions restart from a fresh timestamp. Teardown guards both queued observer delivery and queued frames.

## Resize scenario and evidence

[The reusable local resize matrix](responsive-particle-resize-scenario.json) is an input to the contributor's focused `responsive-particle-test.js`, not the Player verifier's version-1 action schema. It changes one mounted root through full, half and quarter width, reduced height, zero width/height and restored dimensions. It checks actual Canvas draw geometry/displacement, angle, proportional stroke/length scaling, settled count after the 250 ms fade, bounded capacity, transparency, root identity and observer/frame teardown. A separate callback check covers the lifecycle resize route. Local root sizing is not proof of a changed composition-output resolution.

For an authorized disposable Player verification, preserve model values/types and links as described in [layout commands](../element-commands.md). Capture the installed widget at full, half and quarter width while output resolution stays fixed, then reduced height and restored geometry. Independently change actual composition-output resolution and repeat. Record both widget-local dimensions and output dimensions, normalize scaled captures, and measure geometry and frame-to-frame motion separately. Wait beyond the intended fade duration before settled-density assertions; retain a transition sample too. Test transparent Color alpha through the native directly linked RGBA control, not only a renderer wrapper. Require complete zero-error telemetry and exact final preservation readback. Do not claim unexercised Player cases passed.