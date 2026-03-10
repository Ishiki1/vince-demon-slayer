/**
 * itemVisuals.js
 * Source of truth for item icon paths, hover sheets, preload metadata, and placeholder-only future visuals.
 */

const ITEM_VISUALS = {};

function createHoverVisual(textureKey, overrides) {
  const config = overrides || {};
  return {
    sheetKey: config.sheetKey || `${textureKey}-hover-sheet`,
    animKey: config.animKey || `${textureKey}-hover`,
    path: config.path || `assets/items/${textureKey}-hover-pulse_256x256_sheet.png`,
    frameWidth: config.frameWidth || 256,
    frameHeight: config.frameHeight || 256,
    frameRate: config.frameRate || 16,
    style: config.style || 'fullCycle',
  };
}

function registerItemVisual(visualId, spec) {
  const textureKey = spec.textureKey || visualId;
  ITEM_VISUALS[visualId] = {
    visualId,
    textureKey,
    basePath: spec.basePath || `assets/items/${textureKey}.png`,
    preload: spec.preload !== false,
    placeholderLabel: spec.placeholderLabel || null,
    hover: spec.hover === null
      ? null
      : createHoverVisual(textureKey, spec.hover),
  };
  return ITEM_VISUALS[visualId];
}

function registerVisualList(visualIds, specFactory) {
  visualIds.forEach((visualId) => {
    const spec = typeof specFactory === 'function' ? specFactory(visualId) : (specFactory || {});
    registerItemVisual(visualId, spec);
  });
}

registerVisualList([
  'common-sword',
  'common-armor',
  'common-ring',
  'common-amulet',
  'rare-sword',
  'rare-armor',
  'rare-ring',
  'rare-amulet',
  'legendary-sword',
  'legendary-armor',
  'legendary-ring',
  'legendary-amulet',
  'cursed-demon-blade',
  'shadow-veil',
  'phantom-cloak',
  'ember-cleaver',
  'inferno-plate',
  'flame-pendant',
  'gale-edge',
  'storm-guard',
  'wind-band',
  'frostbite',
  'glacier-plate',
  'stormbreaker',
  'tide-blade',
  'volt-mail',
  'wave-guard',
  'ice-shard',
  'spark-ring',
  'dew-pendant',
  'fire-stone',
  'wind-stone',
  'ice-stone',
  'lightning-stone',
  'water-stone',
], {});

registerItemVisual('health-potion', {
  hover: {
    path: 'assets/items/health-potion-hover_256x256_sheet.png',
    style: 'pingPong',
    frameRate: 10,
  },
});

registerItemVisual('mana-potion', {
  hover: {
    path: 'assets/items/mana-potion-hover_256x256_sheet.png',
    style: 'pingPong',
    frameRate: 10,
  },
});

registerItemVisual('avoid-death-potion', {
  hover: {
    path: 'assets/items/avoid-death-potion-hover_256x256_sheet.png',
    style: 'pingPong',
    frameRate: 10,
  },
});

registerVisualList([
  'unique-pyre-staff',
  'unique-phoenix-robe',
  'unique-cinder-orb',
], {});

registerVisualList([
  'common-staff',
  'rare-staff',
  'legendary-staff',
  'common-robe',
  'rare-robe',
  'legendary-robe',
  'common-orb',
  'rare-orb',
  'legendary-orb',
  'unique-zephyr-staff',
  'unique-glacial-staff',
  'unique-thunder-rod',
  'unique-stream-staff',
  'unique-breeze-wrap',
  'unique-rime-robe',
  'unique-static-robe',
  'unique-mist-robe',
  'unique-gust-charm',
  'unique-frozen-tear',
  'unique-arc-ring',
  'unique-rain-crystal',
], (visualId) => ({
  preload: false,
  hover: null,
  placeholderLabel: visualId.replace(/^unique-/, '').split('-')[0].slice(0, 2).toUpperCase(),
}));

function getItemVisual(visualId) {
  return ITEM_VISUALS[visualId] || null;
}

function getAllItemVisuals() {
  return Object.values(ITEM_VISUALS);
}

function getPreloadItemVisuals() {
  return getAllItemVisuals().filter((visual) => visual.preload !== false);
}
