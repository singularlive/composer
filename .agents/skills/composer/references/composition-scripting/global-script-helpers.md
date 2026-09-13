# Global Script helpers

Use this template when multiple composition scripts need the same small, deterministic operations. Install it in the existing Global Script and consume it through `context.global.composerHelpers`. Keep one-off behavior local to its owning composition script.

This is a source template, not an importable module. Read the current Global Script before editing it. If it already contains behavior, merge the factory and registration block into its existing IIFE, call the registration from its existing `init(context)`, and preserve its `close(context)` logic. Never replace an existing Global Script wholesale.

## Global Script template

```javascript
(function() {
  var VERSION = 1;

  function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function sameValue(left, right) {
    if (left === right) return true;
    try {
      return JSON.stringify(left) === JSON.stringify(right);
    } catch (error) {
      return false;
    }
  }

  function createHelpers(context) {
    if (!context || !context.utils || typeof context.utils.createTinyColor !== 'function') {
      throw new Error('composerHelpers requires context.utils.createTinyColor');
    }
    var tinyColor = context.utils.createTinyColor;

    function parseColor(value, fallback) {
      var candidate = value && value.type === 'solid' ? value.solidColor : value;
      var parsed = tinyColor(candidate);
      if (!parsed.isValid() && fallback !== undefined) {
        candidate = fallback && fallback.type === 'solid' ? fallback.solidColor : fallback;
        parsed = tinyColor(candidate);
      }
      if (!parsed.isValid()) throw new Error('Invalid color value');
      return parsed;
    }

    function readLocalControl(comp, id, fallback) {
      if (!comp || typeof comp.getPayload2 !== 'function') return fallback;
      var payload = comp.getPayload2() || {};
      return Object.prototype.hasOwnProperty.call(payload, id) ? payload[id] : fallback;
    }

    function setPayloadIfChanged(widget, previous, patch) {
      if (!widget || typeof widget.setPayload !== 'function') throw new Error('Expected a widget with setPayload');
      if (!isObject(patch)) throw new Error('Payload patch must be an object');
      var snapshot = isObject(previous) ? previous : {};
      var next = {};
      var changed = {};
      Object.keys(snapshot).forEach(function(key) { next[key] = snapshot[key]; });
      Object.keys(patch).forEach(function(key) {
        next[key] = patch[key];
        if (!Object.prototype.hasOwnProperty.call(snapshot, key) || !sameValue(snapshot[key], patch[key])) {
          changed[key] = patch[key];
        }
      });
      if (Object.keys(changed).length) widget.setPayload(changed);
      return next;
    }

    function toCssColor(value, fallback) {
      return parseColor(value, fallback).toRgbString();
    }

    function mixColor(first, second, amount) {
      var weight = Number(amount);
      if (!isFinite(weight)) throw new Error('Color mix amount must be finite');
      weight = Math.max(0, Math.min(1, weight));
      var left = parseColor(first).toRgb();
      var right = parseColor(second).toRgb();
      return tinyColor({
        r: left.r + (right.r - left.r) * weight,
        g: left.g + (right.g - left.g) * weight,
        b: left.b + (right.b - left.b) * weight,
        a: left.a + (right.a - left.a) * weight
      }).toRgbString();
    }

    return Object.freeze({
      version: VERSION,
      readLocalControl: readLocalControl,
      setPayloadIfChanged: setPayloadIfChanged,
      toCssColor: toCssColor,
      mixColor: mixColor
    });
  }

  function isCompatible(helpers) {
    return helpers && helpers.version === VERSION &&
      typeof helpers.readLocalControl === 'function' &&
      typeof helpers.setPayloadIfChanged === 'function' &&
      typeof helpers.toCssColor === 'function' &&
      typeof helpers.mixColor === 'function';
  }

  return {
    init: function(context) {
      var existing = context && context.global && context.global.composerHelpers;
      if (existing !== undefined) {
        if (!isCompatible(existing)) throw new Error('Incompatible context.global.composerHelpers namespace');
        return;
      }
      if (!context || !context.global) throw new Error('Global script context is unavailable');
      context.global.composerHelpers = createHelpers(context);
    },
    close: function() {}
  };
})();
```

`setPayloadIfChanged(widget, previous, patch)` compares only keys present in `patch`, sends only changed keys, and returns the next caller-owned snapshot. Keep one snapshot per widget. Reset that snapshot whenever another writer may have changed the widget; the helper deliberately has no hidden cache.

`readLocalControl(comp, id, fallback)` reads the current local `getPayload2()` object and returns the fallback only when the ID is absent. It preserves intentional falsy values such as `false`, `0`, and an empty string.

`toCssColor(value, fallback)` accepts TinyColor-compatible values and Singular solid-color wrappers. `mixColor(first, second, amount)` clamps `amount` to `0..1` and returns a CSS RGB/RGBA string. Palette roles and derivation percentages belong to the graphic's design contract; compose them from `mixColor` rather than adding one universal palette policy here.

## Composition-script usage

```javascript
(function() {
  var helpers = null;
  var titleWidget = null;
  var titleSnapshot = null;

  function render(comp) {
    var title = helpers.readLocalControl(comp, 'Title', '');
    titleSnapshot = helpers.setPayloadIfChanged(titleWidget, titleSnapshot, { text: String(title) });
  }

  return {
    init: function(comp, context) {
      helpers = context.global.composerHelpers;
      if (!helpers || helpers.version !== 1) throw new Error('composerHelpers version 1 is required');
      titleWidget = comp.findWidget('Title')[0];
      if (!titleWidget) throw new Error('Title widget was not found');
      comp.addListener('payload_changed', function(event, message) {
        if (!message || message.compositionId === comp.id) render(comp);
      });
      render(comp);
    },
    close: function() {
      helpers = null;
      titleWidget = null;
      titleSnapshot = null;
    }
  };
})();
```

Read the Global Script back after writing, then verify at least one consuming composition script in Player. A persisted helper template proves neither initialization nor widget behavior.