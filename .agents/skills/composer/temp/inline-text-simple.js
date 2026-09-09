(function() {
  var composition = null;
  var items = [];
  var itemsById = {};
  var gap = 0;
  var layoutFrame = null;

  var itemDefinitions = [
    { id: '5682d34e-f04a-2cb7-2e51-7df9e1fdfa8e', name: 'Text 1' },
    { id: '40a53b1c-09cb-7ad7-7b24-48acb4b86d8b', name: 'Text 2' },
    { id: 'e3c3207d-c93f-2760-fe5f-35e5ed76caab', name: 'Text 3' }
  ];

  function findItem(params) {
    if (params.id && itemsById[params.id]) return itemsById[params.id];

    for (var index = 0; index < items.length; index += 1) {
      if (items[index].name === params.name) return items[index];
    }
    return null;
  }

  function scheduleLayout() {
    if (layoutFrame !== null) return;
    layoutFrame = requestAnimationFrame(function() {
      layoutFrame = null;
      layout();
    });
  }

  function layout() {
    var visibleItems = items.filter(function(item) {
      return item.visible;
    });

    for (var index = 0; index < visibleItems.length; index += 1) {
      if (!visibleItems[index].bounds) return;
    }

    var previous = null;
    for (var itemIndex = 0; itemIndex < visibleItems.length; itemIndex += 1) {
      var item = visibleItems[itemIndex];
      var targetX = 0;

      if (previous) {
        var previousWidth = previous.widget.getSizeX();
        var currentWidth = item.widget.getSizeX();
        var previousRight = previous.positionX +
          previousWidth * (previous.bounds.left + previous.bounds.width) / 100;
        var currentLeft = currentWidth * item.bounds.left / 100;
        targetX = previousRight + gap - currentLeft;
      }

      if (Math.abs(item.widget.getPositionX() - targetX) > 0.001) {
        item.widget.setPositionX(targetX);
      }
      item.positionX = targetX;
      previous = item;
    }
  }

  function applyControls(force) {
    var payload = composition.getPayload2();
    var nextGap = Number(payload.Gap);
    gap = isFinite(nextGap) ? nextGap : 0;

    items.forEach(function(item, index) {
      var number = index + 1;
      var text = payload['Text ' + number];
      text = text == null ? '' : String(text);
      var visible = text.trim().length > 0;
      var widgetPayload = {
        text: text,
        font: payload['Font ' + number],
        color: payload['Color ' + number],
        alignment: 'left',
        overflow: 'none',
        transform: 'none',
        emitEvents: true
      };
      var signature = JSON.stringify(widgetPayload);

      item.visible = visible;
      item.widget.setVisibility(visible);

      if (force || signature !== item.signature) {
        item.signature = signature;
        item.bounds = null;
        item.widget.setPayload(widgetPayload);
      }
    });

    scheduleLayout();
  }

  function onMessage(event, msg, propagationEvent) {
    var params = msg && msg.params;
    var data = params && params.data;

    if (!params || params.type !== 'widget' || !data || data.event !== 'bounds') {
      return;
    }

    var item = findItem(params);
    if (!item) return;

    item.bounds = data;
    scheduleLayout();
    propagationEvent.stopPropagation();
  }

  function onPayloadChanged(event, msg, propagationEvent) {
    if (!msg || !msg.compositionId || msg.compositionId === composition.id) {
      applyControls(false);
      propagationEvent.stopPropagation();
    }
  }

  return {
    init: function(comp) {
      composition = comp;
      items = itemDefinitions.map(function(definition) {
        var widget = comp.findWidget(definition.name)[0];
        if (!widget) throw new Error(definition.name + ' widget was not found');

        var item = {
          id: definition.id,
          name: definition.name,
          widget: widget,
          bounds: null,
          signature: null,
          visible: false,
          positionX: 0
        };
        itemsById[item.id] = item;
        return item;
      });

      composition.addListener('message', onMessage);
      composition.addListener('payload_changed', onPayloadChanged);
      applyControls(true);
    },

    close: function() {
      if (layoutFrame !== null) cancelAnimationFrame(layoutFrame);
      composition = null;
      items = [];
      itemsById = {};
      layoutFrame = null;
    }
  };
})();