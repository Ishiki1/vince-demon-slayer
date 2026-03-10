/**
 * items.js
 * Central item data plus metadata-driven selectors for loot, shop, crafting, and event pools.
 */

function defineItem(id, data) {
  return {
    id,
    allowedClasses: ['shared'],
    primaryStat: null,
    visualId: id,
    lootEligible: false,
    shopEligible: false,
    craftable: false,
    merchantEligible: false,
    ...data,
  };
}

function applyVisualManifest(item) {
  if (!item) return item;
  const visualId = item.visualId || item.id;
  const visual = typeof getItemVisual === 'function' ? getItemVisual(visualId) : null;
  item.visualId = visualId;
  item.statClass = item.primaryStat || item.statClass || null;
  if (visual) {
    item.assetKey = visual.textureKey || item.assetKey || null;
    if (visual.hover) {
      item.hoverSheetKey = visual.hover.sheetKey;
      item.hoverAnimKey = visual.hover.animKey;
    } else {
      item.hoverSheetKey = item.hoverSheetKey || null;
      item.hoverAnimKey = item.hoverAnimKey || null;
    }
    item.visual = visual;
  }
  return item;
}

const ITEMS = {
  // Warrior weapons
  'common-sword': defineItem('common-sword', { name: 'Rusty Sword', type: 'weapon', rarity: 'common', strength: 2, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true }),
  'rare-sword': defineItem('rare-sword', { name: 'Steel Blade', type: 'weapon', rarity: 'rare', strength: 4, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true }),
  'legendary-sword': defineItem('legendary-sword', { name: 'Demon Slayer', type: 'weapon', rarity: 'legendary', strength: 8, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true, merchantEligible: true }),
  'cursed-demon-blade': defineItem('cursed-demon-blade', { name: 'Cursed Demon Blade', type: 'weapon', rarity: 'legendary', strength: 12, maxHealthModifier: -5, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true, merchantEligible: true }),

  // Sorceress weapons
  'common-staff': defineItem('common-staff', { name: 'Oak Staff', type: 'weapon', rarity: 'common', intelligence: 2, primaryStat: 'intelligence', allowedClasses: ['sorceress'], lootEligible: true, shopEligible: true }),
  'rare-staff': defineItem('rare-staff', { name: 'Crystal Staff', type: 'weapon', rarity: 'rare', intelligence: 4, primaryStat: 'intelligence', allowedClasses: ['sorceress'], lootEligible: true, shopEligible: true }),
  'legendary-staff': defineItem('legendary-staff', { name: 'Flameheart Staff', type: 'weapon', rarity: 'legendary', intelligence: 8, primaryStat: 'intelligence', allowedClasses: ['sorceress'], lootEligible: true, shopEligible: true, merchantEligible: true }),

  // Warrior armor
  'common-armor': defineItem('common-armor', { name: 'Leather Vest', type: 'armor', rarity: 'common', defense: 1, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true }),
  'rare-armor': defineItem('rare-armor', { name: 'Chain Mail', type: 'armor', rarity: 'rare', defense: 3, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true }),
  'legendary-armor': defineItem('legendary-armor', { name: 'Demon Plate', type: 'armor', rarity: 'legendary', defense: 6, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true, merchantEligible: true }),
  'shadow-veil': defineItem('shadow-veil', { name: 'Shadow Veil', type: 'armor', rarity: 'legendary', defense: 3, evasion: 0.2, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true }),

  // Sorceress armor
  'common-robe': defineItem('common-robe', { name: 'Cloth Robe', type: 'armor', rarity: 'common', defense: 1, primaryStat: 'intelligence', allowedClasses: ['sorceress'], lootEligible: true, shopEligible: true }),
  'rare-robe': defineItem('rare-robe', { name: 'Silk Robe', type: 'armor', rarity: 'rare', defense: 3, primaryStat: 'intelligence', allowedClasses: ['sorceress'], lootEligible: true, shopEligible: true }),
  'legendary-robe': defineItem('legendary-robe', { name: 'Archmage Robe', type: 'armor', rarity: 'legendary', defense: 6, primaryStat: 'intelligence', allowedClasses: ['sorceress'], lootEligible: true, shopEligible: true, merchantEligible: true }),

  // Warrior accessories
  'common-ring': defineItem('common-ring', { name: 'Copper Ring', type: 'accessory', rarity: 'common', strength: 1, health: 0, mana: 0, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true }),
  'rare-ring': defineItem('rare-ring', { name: 'Silver Ring', type: 'accessory', rarity: 'rare', strength: 2, health: 2, mana: 0, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true }),
  'legendary-ring': defineItem('legendary-ring', { name: 'Crown Ring', type: 'accessory', rarity: 'legendary', strength: 3, health: 5, mana: 5, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true, merchantEligible: true }),
  'common-amulet': defineItem('common-amulet', { name: 'Wood Amulet', type: 'accessory', rarity: 'common', strength: 0, health: 2, mana: 1, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true }),
  'rare-amulet': defineItem('rare-amulet', { name: 'Jade Amulet', type: 'accessory', rarity: 'rare', strength: 1, health: 4, mana: 3, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true }),
  'legendary-amulet': defineItem('legendary-amulet', { name: 'Demon Heart', type: 'accessory', rarity: 'legendary', strength: 4, health: 8, mana: 8, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true, merchantEligible: true }),
  'phantom-cloak': defineItem('phantom-cloak', { name: 'Phantom Cloak', type: 'accessory', rarity: 'legendary', evasion: 0.15, health: 3, mana: 3, primaryStat: 'strength', allowedClasses: ['warrior'], lootEligible: true, shopEligible: true }),

  // Sorceress accessories
  'common-orb': defineItem('common-orb', { name: 'Glass Orb', type: 'accessory', rarity: 'common', intelligence: 1, health: 0, mana: 0, primaryStat: 'intelligence', allowedClasses: ['sorceress'], lootEligible: true, shopEligible: true }),
  'rare-orb': defineItem('rare-orb', { name: 'Arcane Orb', type: 'accessory', rarity: 'rare', intelligence: 2, health: 2, mana: 0, primaryStat: 'intelligence', allowedClasses: ['sorceress'], lootEligible: true, shopEligible: true }),
  'legendary-orb': defineItem('legendary-orb', { name: 'Phoenix Tear', type: 'accessory', rarity: 'legendary', intelligence: 3, health: 5, mana: 5, primaryStat: 'intelligence', allowedClasses: ['sorceress'], lootEligible: true, shopEligible: true, merchantEligible: true }),

  // Shared consumables
  'health-potion': defineItem('health-potion', { name: 'Health Potion', type: 'potion', rarity: 'common', effect: 'health', value: 5, lootEligible: true, shopEligible: true }),
  'mana-potion': defineItem('mana-potion', { name: 'Mana Potion', type: 'potion', rarity: 'common', effect: 'mana', value: 5, lootEligible: true, shopEligible: true }),
  'health-potion-rare': defineItem('health-potion-rare', { name: 'Greater Health Potion', type: 'potion', rarity: 'rare', effect: 'health', value: 10, lootEligible: true, shopEligible: true, visualId: 'health-potion' }),
  'mana-potion-rare': defineItem('mana-potion-rare', { name: 'Greater Mana Potion', type: 'potion', rarity: 'rare', effect: 'mana', value: 10, lootEligible: true, shopEligible: true, visualId: 'mana-potion' }),
  'health-potion-legendary': defineItem('health-potion-legendary', { name: 'Supreme Health Potion', type: 'potion', rarity: 'legendary', effect: 'health', value: 999, lootEligible: true, shopEligible: true, merchantEligible: true, visualId: 'health-potion' }),
  'mana-potion-legendary': defineItem('mana-potion-legendary', { name: 'Supreme Mana Potion', type: 'potion', rarity: 'legendary', effect: 'mana', value: 999, lootEligible: true, shopEligible: true, merchantEligible: true, visualId: 'mana-potion' }),
  'avoid-death-potion': defineItem('avoid-death-potion', { name: 'Avoid Death Potion', type: 'potion', rarity: 'legendary', effect: 'invulnerability', value: 3, visualId: 'avoid-death-potion' }),

  // Shared materials
  'fire-stone': defineItem('fire-stone', { name: 'Fire Stone', type: 'material', rarity: 'rare' }),
  'wind-stone': defineItem('wind-stone', { name: 'Wind Stone', type: 'material', rarity: 'rare' }),
  'ice-stone': defineItem('ice-stone', { name: 'Ice Stone', type: 'material', rarity: 'rare' }),
  'lightning-stone': defineItem('lightning-stone', { name: 'Lightning Stone', type: 'material', rarity: 'rare' }),
  'water-stone': defineItem('water-stone', { name: 'Water Stone', type: 'material', rarity: 'rare' }),

  // Warrior uniques
  'unique-ember-cleaver': defineItem('unique-ember-cleaver', { name: 'Ember Cleaver', type: 'weapon', rarity: 'unique', strength: 11, health: 3, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'fire-stone', setId: 'fire-stone', visualId: 'ember-cleaver' }),
  'unique-inferno-plate': defineItem('unique-inferno-plate', { name: 'Inferno Plate', type: 'armor', rarity: 'unique', defense: 8, strength: 3, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'fire-stone', setId: 'fire-stone', visualId: 'inferno-plate' }),
  'unique-flame-pendant': defineItem('unique-flame-pendant', { name: 'Flame Pendant', type: 'accessory', rarity: 'unique', strength: 5, health: 7, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'fire-stone', setId: 'fire-stone', visualId: 'flame-pendant' }),
  'unique-gale-edge': defineItem('unique-gale-edge', { name: 'Gale Edge', type: 'weapon', rarity: 'unique', strength: 11, evasion: 0.06, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'wind-stone', setId: 'wind-stone', visualId: 'gale-edge' }),
  'unique-storm-guard': defineItem('unique-storm-guard', { name: 'Storm Guard', type: 'armor', rarity: 'unique', defense: 6, evasion: 0.16, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'wind-stone', setId: 'wind-stone', visualId: 'storm-guard' }),
  'unique-wind-band': defineItem('unique-wind-band', { name: 'Wind Band', type: 'accessory', rarity: 'unique', strength: 4, evasion: 0.11, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'wind-stone', setId: 'wind-stone', visualId: 'wind-band' }),
  'unique-frostbite': defineItem('unique-frostbite', { name: 'Frostbite', type: 'weapon', rarity: 'unique', strength: 11, defense: 3, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'ice-stone', setId: 'ice-stone', visualId: 'frostbite' }),
  'unique-glacier-plate': defineItem('unique-glacier-plate', { name: 'Glacier Plate', type: 'armor', rarity: 'unique', defense: 9, health: 3, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'ice-stone', setId: 'ice-stone', visualId: 'glacier-plate' }),
  'unique-ice-shard': defineItem('unique-ice-shard', { name: 'Ice Shard', type: 'accessory', rarity: 'unique', strength: 3, defense: 6, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'ice-stone', setId: 'ice-stone', visualId: 'ice-shard' }),
  'unique-stormbreaker': defineItem('unique-stormbreaker', { name: 'Stormbreaker', type: 'weapon', rarity: 'unique', strength: 13, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'lightning-stone', setId: 'lightning-stone', visualId: 'stormbreaker' }),
  'unique-volt-mail': defineItem('unique-volt-mail', { name: 'Volt Mail', type: 'armor', rarity: 'unique', defense: 7, strength: 3, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'lightning-stone', setId: 'lightning-stone', visualId: 'volt-mail' }),
  'unique-spark-ring': defineItem('unique-spark-ring', { name: 'Spark Ring', type: 'accessory', rarity: 'unique', strength: 5, health: 4, mana: 4, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'lightning-stone', setId: 'lightning-stone', visualId: 'spark-ring' }),
  'unique-tide-blade': defineItem('unique-tide-blade', { name: 'Tide Blade', type: 'weapon', rarity: 'unique', strength: 11, mana: 4, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'water-stone', setId: 'water-stone', visualId: 'tide-blade' }),
  'unique-wave-guard': defineItem('unique-wave-guard', { name: 'Wave Guard', type: 'armor', rarity: 'unique', defense: 7, health: 6, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'water-stone', setId: 'water-stone', visualId: 'wave-guard' }),
  'unique-dew-pendant': defineItem('unique-dew-pendant', { name: 'Dew Pendant', type: 'accessory', rarity: 'unique', strength: 3, health: 9, mana: 6, primaryStat: 'strength', allowedClasses: ['warrior'], craftable: true, recipeMaterial: 'water-stone', setId: 'water-stone', visualId: 'dew-pendant' }),

  // Sorceress uniques
  'unique-pyre-staff': defineItem('unique-pyre-staff', { name: 'Pyre Staff', type: 'weapon', rarity: 'unique', intelligence: 11, mana: 3, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'fire-stone', setId: 'fire-stone' }),
  'unique-phoenix-robe': defineItem('unique-phoenix-robe', { name: 'Phoenix Robe', type: 'armor', rarity: 'unique', defense: 8, intelligence: 3, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'fire-stone', setId: 'fire-stone' }),
  'unique-cinder-orb': defineItem('unique-cinder-orb', { name: 'Cinder Orb', type: 'accessory', rarity: 'unique', intelligence: 5, mana: 7, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'fire-stone', setId: 'fire-stone' }),
  'unique-zephyr-staff': defineItem('unique-zephyr-staff', { name: 'Zephyr Staff', type: 'weapon', rarity: 'unique', intelligence: 11, evasion: 0.06, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'wind-stone', setId: 'wind-stone' }),
  'unique-breeze-wrap': defineItem('unique-breeze-wrap', { name: 'Breeze Wrap', type: 'armor', rarity: 'unique', defense: 6, evasion: 0.16, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'wind-stone', setId: 'wind-stone' }),
  'unique-gust-charm': defineItem('unique-gust-charm', { name: 'Gust Charm', type: 'accessory', rarity: 'unique', intelligence: 4, evasion: 0.11, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'wind-stone', setId: 'wind-stone' }),
  'unique-glacial-staff': defineItem('unique-glacial-staff', { name: 'Glacial Staff', type: 'weapon', rarity: 'unique', intelligence: 11, defense: 3, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'ice-stone', setId: 'ice-stone' }),
  'unique-rime-robe': defineItem('unique-rime-robe', { name: 'Rime Robe', type: 'armor', rarity: 'unique', defense: 9, mana: 3, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'ice-stone', setId: 'ice-stone' }),
  'unique-frozen-tear': defineItem('unique-frozen-tear', { name: 'Frozen Tear', type: 'accessory', rarity: 'unique', intelligence: 3, defense: 6, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'ice-stone', setId: 'ice-stone' }),
  'unique-thunder-rod': defineItem('unique-thunder-rod', { name: 'Thunder Rod', type: 'weapon', rarity: 'unique', intelligence: 13, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'lightning-stone', setId: 'lightning-stone' }),
  'unique-static-robe': defineItem('unique-static-robe', { name: 'Static Robe', type: 'armor', rarity: 'unique', defense: 7, intelligence: 3, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'lightning-stone', setId: 'lightning-stone' }),
  'unique-arc-ring': defineItem('unique-arc-ring', { name: 'Arc Ring', type: 'accessory', rarity: 'unique', intelligence: 5, health: 4, mana: 4, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'lightning-stone', setId: 'lightning-stone' }),
  'unique-stream-staff': defineItem('unique-stream-staff', { name: 'Stream Staff', type: 'weapon', rarity: 'unique', intelligence: 11, mana: 4, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'water-stone', setId: 'water-stone' }),
  'unique-mist-robe': defineItem('unique-mist-robe', { name: 'Mist Robe', type: 'armor', rarity: 'unique', defense: 7, mana: 6, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'water-stone', setId: 'water-stone' }),
  'unique-rain-crystal': defineItem('unique-rain-crystal', { name: 'Rain Crystal', type: 'accessory', rarity: 'unique', intelligence: 3, mana: 9, health: 6, primaryStat: 'intelligence', allowedClasses: ['sorceress'], craftable: true, recipeMaterial: 'water-stone', setId: 'water-stone' }),
};

Object.values(ITEMS).forEach((item) => applyVisualManifest(item));

function resolveClassId(heroOrClassId) {
  if (typeof heroOrClassId === 'string') return heroOrClassId;
  if (heroOrClassId && heroOrClassId.class) return heroOrClassId.class;
  return typeof DEFAULT_CLASS_ID !== 'undefined' ? DEFAULT_CLASS_ID : 'warrior';
}

function itemMatchesClass(item, classId) {
  if (!item) return false;
  const allowedClasses = Array.isArray(item.allowedClasses) ? item.allowedClasses : ['shared'];
  if (allowedClasses.includes('shared')) return true;
  return allowedClasses.includes(resolveClassId(classId));
}

function selectItems(filters) {
  const options = filters || {};
  const classId = resolveClassId(options.classId);
  return Object.values(ITEMS).filter((item) => {
    if (options.classId != null && !itemMatchesClass(item, classId)) return false;
    if (options.type && item.type !== options.type) return false;
    if (options.rarity && item.rarity !== options.rarity) return false;
    if (options.lootEligible === true && item.lootEligible !== true) return false;
    if (options.shopEligible === true && item.shopEligible !== true) return false;
    if (options.craftable === true && item.craftable !== true) return false;
    if (options.merchantEligible === true && item.merchantEligible !== true) return false;
    return true;
  });
}

function getLootPool(options) {
  const filters = options || {};
  return selectItems({
    classId: filters.classId,
    type: filters.type,
    rarity: filters.rarity,
    lootEligible: true,
  }).map((item) => item.id);
}

function getShopPool(options) {
  const filters = options || {};
  return selectItems({
    classId: filters.classId,
    shopEligible: true,
  }).map((item) => item.id);
}

function getCraftRecipes(options) {
  const filters = options || {};
  return selectItems({
    classId: filters.classId,
    craftable: true,
  }).map((item) => ({
    itemId: item.id,
    material: item.recipeMaterial,
    slot: item.type,
  }));
}

function getCraftRecipesForClass(heroOrClassId) {
  return getCraftRecipes({ classId: resolveClassId(heroOrClassId) });
}

function getLegendaryMerchantPool(options) {
  const filters = options || {};
  return selectItems({
    classId: filters.classId,
    merchantEligible: true,
  }).map((item) => item.id);
}

const UNIQUE_SET_BONUSES = {
  'fire-stone': { warrior: { strength: 4, health: 6 }, sorceress: { intelligence: 4, mana: 6 } },
  'wind-stone': { warrior: { evasion: 0.06 }, sorceress: { evasion: 0.06 } },
  'ice-stone': { warrior: { defense: 3, health: 4 }, sorceress: { defense: 3, mana: 4 } },
  'lightning-stone': { warrior: { strength: 3, mana: 3 }, sorceress: { intelligence: 3, health: 3 } },
  'water-stone': { warrior: { health: 5, mana: 5 }, sorceress: { health: 5, mana: 5 } },
};

function getUniqueElement(itemId) {
  const item = ITEMS[itemId];
  if (!item || item.rarity !== 'unique') return null;
  return item.setId || item.recipeMaterial || null;
}

/** Upgrade: 500g + 1 matching stone. Unique weapons get +10% damage; armor/accessories get +10% to the stats they actually grant. */
function getUniqueUpgradeMultipliers(item) {
  if (!item || item.rarity !== 'unique') return {};
  if (item.type === 'weapon') return { damage: 0.1 };

  const multipliers = {};
  ['strength', 'intelligence', 'defense', 'health', 'mana', 'evasion', 'maxHealthModifier'].forEach((stat) => {
    if (item[stat] != null) multipliers[stat] = 0.1;
  });
  return multipliers;
}

function formatUpgradeMultiplierLabel(stat) {
  if (stat === 'damage') return '+10% Damage';
  if (stat === 'strength') return '+10% Str';
  if (stat === 'intelligence') return '+10% Int';
  if (stat === 'defense') return '+10% Def';
  if (stat === 'health') return '+10% HP';
  if (stat === 'mana') return '+10% Mana';
  if (stat === 'evasion') return '+10% Evasion';
  if (stat === 'maxHealthModifier') return '+10% Max HP Modifier';
  return '+10% ' + stat.charAt(0).toUpperCase() + stat.slice(1);
}

function getUniqueUpgradeSummary(item) {
  const multipliers = getUniqueUpgradeMultipliers(item);
  return Object.keys(multipliers).map(formatUpgradeMultiplierLabel).join(', ');
}

const ELEMENT_DISPLAY_NAMES = { 'fire-stone': 'Fire', 'wind-stone': 'Wind', 'ice-stone': 'Ice', 'lightning-stone': 'Lightning', 'water-stone': 'Water' };

function getUniqueSetBonusDisplay(hero) {
  if (!hero || typeof hero.getUniqueSetBonus !== 'function') return null;
  const bonus = hero.getUniqueSetBonus();
  if (!bonus) return null;
  const wSlot = hero.weapon != null ? hero.inventory.find(s => s.id === hero.weapon) : null;
  const element = wSlot ? getUniqueElement(wSlot.itemId) : null;
  const elementName = element ? (ELEMENT_DISPLAY_NAMES[element] || element) : '';
  const parts = [];
  if (bonus.strength) parts.push('+' + bonus.strength + ' Str');
  if (bonus.intelligence) parts.push('+' + bonus.intelligence + ' Int');
  if (bonus.defense) parts.push('+' + bonus.defense + ' Def');
  if (bonus.health) parts.push('+' + bonus.health + ' HP');
  if (bonus.mana) parts.push('+' + bonus.mana + ' Mana');
  if (bonus.evasion != null) parts.push('+' + Math.round(bonus.evasion * 100) + '% Evasion');
  return { elementName, summary: parts.join(', ') };
}

/** One-line effect description for UI (e.g. "+2 Str", "+1 Str, +2 HP"). */
function getItemEffectLine(item) {
  if (!item) return '';
  if (item.type === 'material') return 'Crafting material';
  const parts = [];
  if (item.strength) parts.push('+' + item.strength + ' Str');
  if (item.defense) parts.push('+' + item.defense + ' Def');
  if (item.health) parts.push('+' + item.health + ' HP');
  if (item.mana) parts.push('+' + item.mana + ' Mana');
  if (item.effect === 'health' && item.value) parts.push(item.value >= 999 ? 'Full HP' : '+' + item.value + ' HP');
  if (item.effect === 'mana' && item.value) parts.push(item.value >= 999 ? 'Full Mana' : '+' + item.value + ' Mana');
  if (item.effect === 'invulnerability' && item.value) parts.push('Invulnerable ' + item.value + ' turns');
  if (item.skillId) parts.push('Learn: ' + ((WARRIOR_SKILLS[item.skillId] || SORCERESS_SKILLS[item.skillId]) ? (WARRIOR_SKILLS[item.skillId] || SORCERESS_SKILLS[item.skillId]).name : item.skillId));
  if (item.maxHealthModifier != null) parts.push(item.maxHealthModifier >= 0 ? '+' + item.maxHealthModifier + ' Max HP' : item.maxHealthModifier + ' Max HP');
  if (item.evasion != null) parts.push('+' + Math.round(item.evasion * 100) + '% Evasion');
  if (item.intelligence) parts.push('+' + item.intelligence + ' Int');
  return parts.join(', ') || '';
}
