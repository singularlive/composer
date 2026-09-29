# Three.js inside AI Graphics

Shared authoring reference, not a new widget, scene generator or runtime API. Use it when Three.js is explicitly requested or is the agreed representation for one coherent programmable graphic. Read [AI Graphics](ai-graphics.md) and its [authoring contract](ai-graphics-authoring.md) first. Native Composer primitives remain preferable for independently editable elements. A composition-native request requires an installed graphic; an isolated browser example is not the deliverable.

## Ownership and dependencies

Own one renderer, canvas, scene and camera per mounted widget. Use only the authored root and its descendants; do not access application DOM, global stores, credentials or browser storage. Preserve existing control IDs/types/scopes, generated schemas, links, containers, layout, timelines and user values during renderer replacement. Keep direct native links as the sole writers of their generated fields and retain template-contract/revision safeguards.

Choosing Three.js grants no network permission. Self-contained content remains the default. An explicitly required external dependency needs the existing narrow resource exception: exact pinned versions, declared public HTTPS origins, bounded requests/redirects/bytes/timeouts and no credentials. Match addons to the core version; do not rely on an unpinned global or mix module and legacy builds. Libraries, models, textures, decoders and environment maps are separate dependencies; authorizing one does not authorize the rest. No local-preview allowlist or general ready-wait API currently exists.

Treat initialization as pending until the approved library and required assets are loaded and the latest values have been applied. Retain values and finite seek state delivered during loading. On completion, apply the latest state, not a captured older payload. Use generation checks and abortable requests; dispose late candidates after replacement or destruction. Errors must be visible within the authored widget and sanitized, never silent blank success or an unrequested substitute. Mark readiness in task-local verification without inventing a supported host context API. See the [preview evidence contract](ai-graphics.md#preview-evidence-contract).

## Scene and resource budgets

Choose perspective or orthographic projection for the requested graphic. Frame its full geometry, finite/ambient motion, shadows and other effects across supported aspect ratios; camera distance, clipping planes and bounds must agree. Do not use a fixed landscape camera for portrait output or compensate by moving the Composer tile. Composer owns outer placement; the scene fits its widget-local viewport.

Cap DPR, backing pixels, draw calls, triangle/instance counts, texture sizes, shadow-map sizes, cache entries and per-update work for the target device. Avoid rebuilding a renderer or scene on every control change. Mutate transforms/material properties in place; rebuild geometry only when required, build it off-scene, then swap and release the replaced resources. Share materials/textures deliberately with an ownership ledger; do not dispose borrowed/shared resources from an arbitrary mesh traversal.

Metallic materials, PMREM environments, lighting rigs, shadows and receiver planes are optional design techniques, not mandatory Three.js defaults. Font shaping, binary resolution, glyph holes and bevel construction belong to the [extruded-text candidate](../recipes/threejs-extruded-text.md); non-text scenes need no font fetching or Font Control Node.

## Control and timeline updates

Declare only needed generated fields and discover their published live schema before linking native controls. Normalize only present changed values: finite numeric strings, explicit boolean strings and host-supported color/image/font representations. Omitted fields retain their effective value. Do not rewrite controls from the renderer or add duplicate script forwarding. Preserve text casing.

Singular owns finite In/Out through `seek`. Keep its transforms on a separate parent from ambient motion, particles, simulation or user rotation. Timeline progress is local to each In/Out; map exit properties explicitly rather than globally reversing Out. Retain widget Timeline effects and the inspected separate-Out/reversed-In setup. Ambient clocks may advance only non-conflicting properties, clamp elapsed time after pauses and stop when disabled, zero-sized or destroyed. Render static changes without starting a permanent animation loop.

## Minimal lifecycle example

This injected-dependency example illustrates ownership with a diagnostic box, not a complete definition, dependency loader, artistic preset or production-tested Three.js renderer. Supply an already approved, compatible `THREE` module; adapt geometry and camera fit to the actual graphic. The definition's lifecycle body can return `createThreeLifecycle(THREE)`. Declare `animate` as Checkbox and `speed` as Number when those controls are wanted. Saved values arrive through `update`; do not reset them during mount. Async library loading needs the pending/latest-state gates described above before constructing this lifecycle.

```javascript
function createThreeLifecycle(THREE) {
  var root, renderer, scene, camera, finite, mesh, geometry, material, observer;
  var width = 0, height = 0, ratio = 0, frame = null, previousTime = null;
  var destroyed = false, animate = false, speed = 0.5;

  function cancelFrame() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previousTime = null;
  }
  function draw() {
    if (!destroyed && renderer && width > 0 && height > 0) renderer.render(scene, camera);
  }
  function schedule() {
    if (!destroyed && animate && width > 0 && height > 0 && frame === null) frame = requestAnimationFrame(tick);
  }
  function tick(time) {
    frame = null;
    if (destroyed || !animate || width <= 0 || height <= 0) return;
    var elapsed = previousTime === null ? 0 : Math.max(0, Math.min(0.05, (time - previousTime) / 1000));
    previousTime = time;
    mesh.rotation.y += elapsed * speed;
    draw();
    schedule();
  }
  function measure() {
    if (destroyed || !root || !renderer) return;
    var nextWidth = root.clientWidth, nextHeight = root.clientHeight;
    if (nextWidth <= 0 || nextHeight <= 0) {
      width = nextWidth;
      height = nextHeight;
      cancelFrame();
      return;
    }
    var nextRatio = Math.min(window.devicePixelRatio || 1, 2, 4096 / nextWidth, 4096 / nextHeight,
      Math.sqrt(4000000 / (nextWidth * nextHeight)));
    if (width !== nextWidth || height !== nextHeight || ratio !== nextRatio) {
      width = nextWidth;
      height = nextHeight;
      ratio = nextRatio;
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = 4 / Math.min(1, camera.aspect);
      camera.updateProjectionMatrix();
    }
    draw();
    schedule();
  }
  return {
    mount: function (context) {
      root = context.root;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      root.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      finite = new THREE.Group();
      geometry = new THREE.BoxGeometry(1, 1, 1);
      material = new THREE.MeshNormalMaterial();
      mesh = new THREE.Mesh(geometry, material);
      finite.add(mesh);
      scene.add(finite);
      observer = new ResizeObserver(measure);
      observer.observe(root);
      measure();
    },
    update: function (changes) {
      if (destroyed) return;
      if (Object.prototype.hasOwnProperty.call(changes, 'speed')) {
        var value = changes.speed;
        var parsed = typeof value === 'number' || typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
        if (Number.isFinite(parsed)) speed = Math.max(-2, Math.min(2, parsed));
      }
      if (Object.prototype.hasOwnProperty.call(changes, 'animate')) animate = changes.animate === true || changes.animate === 'true';
      if (!animate) cancelFrame();
      draw();
      schedule();
    },
    seek: function (animation) {
      if (destroyed || !finite) return;
      var progress = Math.max(0, Math.min(1, animation.progress));
      var scale = animation.timeline === 'Out' ? 1 - progress : progress;
      finite.scale.setScalar(scale);
      draw();
    },
    resize: function () { measure(); },
    destroy: function () {
      if (destroyed) return;
      destroyed = true;
      cancelFrame();
      if (observer) observer.disconnect();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    }
  };
}
```

For an authored static-pose control, reset only the ambient transform deliberately; disabling animation in this minimal example freezes its current angle. Finite seek is still deterministic and independent. The sample's camera near/far and box fit are intentionally bounded; they are not suitable for arbitrary model dimensions. At extreme aspect ratios, define a supported layout range or fit camera clipping planes as well as distance.

## Resize, teardown and verification

Observe the owned root's untransformed local dimensions; route the observer and host `resize` through one idempotent function. Suspend zero-sized work and restore from fresh measurements without creating another renderer. Guard queued callbacks after teardown. The example disposes only its box resources; a real scene must also abort requests, detach listeners, stop mixers/timers/workers, release owned textures, PMREM/render targets, postprocessing passes and asset caches. Renderer disposal alone does not release scene resources. Handle initialization failure and WebGL context loss visibly; do not retry forever or assume GPU availability.

Verify one mounted instance across landscape, square, portrait, zero-size and restored dimensions, repeated updates and destruction. Check renderer/canvas identity, callback/resource counts and stale async completions separately from screenshot appearance. For an actual graphic, use real Three.js/production-host local or Player evidence with nonblank canvas pixels and reviewed framing, meaningful movement and resource loading. Mocked lifecycle calls cannot prove GPU output or performance.

Model readback proves authored schemas/values/links/layout. Local runtime proves only its exercised lifecycle. One running Player is needed for native-control propagation without reload and finite playback. Reviewed captures prove sampled appearance, not every transition or prolonged resource stability. Actual Control App delivery requires its own extract/reload/update checks. Keep these evidence categories separate and disclose network/readiness limitations rather than treating `valid: true` or a PNG as success.