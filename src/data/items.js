/**
 * items.js
 * Weapons (strength), armor (defense), accessories (str/health/mana), potions.
 * Rarity: common, rare, legendary. Used for loot and shop.
 */

const ITEMS = {
  // Weapons (Warrior / strength)
  'common-sword': { id: 'common-sword', name: 'Rusty Sword', type: 'weapon', rarity: 'common', strength: 2, statClass: 'strength', assetKey: 'common-sword', hoverSheetKey: 'common-sword-hover-sheet', hoverAnimKey: 'common-sword-hover' },
  'rare-sword': { id: 'rare-sword', name: 'Steel Blade', type: 'weapon', rarity: 'rare', strength: 4, statClass: 'strength', assetKey: 'rare-sword' },
  'legendary-sword': { id: 'legendary-sword', name: 'Demon Slayer', type: 'weapon', rarity: 'legendary', strength: 8, statClass: 'strength', assetKey: 'legendary-sword' },
  'cursed-demon-blade': { id: 'cursed-demon-blade', name: 'Cursed Demon Blade', type: 'weapon', rarity: 'legendary', strength: 12, maxHealthModifier: -5, statClass: 'strength', assetKey: 'cursed-demon-blade' },
  // Weapons (Sorceress / intelligence)
  'common-staff': { id: 'common-staff', name: 'Oak Staff', type: 'weapon', rarity: 'common', intelligence: 2, statClass: 'intelligence' },
  'rare-staff': { id: 'rare-staff', name: 'Crystal Staff', type: 'weapon', rarity: 'rare', intelligence: 4, statClass: 'intelligence' },
  'legendary-staff': { id: 'legendary-staff', name: 'Flameheart Staff', type: 'weapon', rarity: 'legendary', intelligence: 8, statClass: 'intelligence' },
  // Armor (Warrior)
  'common-armor': { id: 'common-armor', name: 'Leather Vest', type: 'armor', rarity: 'common', defense: 1, statClass: 'strength', assetKey: 'common-armor' },
  'rare-armor': { id: 'rare-armor', name: 'Chain Mail', type: 'armor', rarity: 'rare', defense: 3, statClass: 'strength', assetKey: 'rare-armor' },
  'legendary-armor': { id: 'legendary-armor', name: 'Demon Plate', type: 'armor', rarity: 'legendary', defense: 6, statClass: 'strength', assetKey: 'legendary-armor' },
  'shadow-veil': { id: 'shadow-veil', name: 'Shadow Veil', type: 'armor', rarity: 'legendary', defense: 3, evasion: 0.2, statClass: 'strength', assetKey: 'shadow-veil' },
  // Armor (Sorceress)
  'common-robe': { id: 'common-robe', name: 'Cloth Robe', type: 'armor', rarity: 'common', defense: 1, statClass: 'intelligence' },
  'rare-robe': { id: 'rare-robe', name: 'Silk Robe', type: 'armor', rarity: 'rare', defense: 3, statClass: 'intelligence' },
  'legendary-robe': { id: 'legendary-robe', name: 'Archmage Robe', type: 'armor', rarity: 'legendary', defense: 6, statClass: 'intelligence' },
  // Accessories (Warrior: strength, health, mana)
  'common-ring': { id: 'common-ring', name: 'Copper Ring', type: 'accessory', rarity: 'common', strength: 1, health: 0, mana: 0, statClass: 'strength', assetKey: 'common-ring' },
  'rare-ring': { id: 'rare-ring', name: 'Silver Ring', type: 'accessory', rarity: 'rare', strength: 2, health: 2, mana: 0, statClass: 'strength', assetKey: 'rare-ring' },
  'legendary-ring': { id: 'legendary-ring', name: 'Crown Ring', type: 'accessory', rarity: 'legendary', strength: 3, health: 5, mana: 5, statClass: 'strength', assetKey: 'legendary-ring' },
  'common-amulet': { id: 'common-amulet', name: 'Wood Amulet', type: 'accessory', rarity: 'common', strength: 0, health: 2, mana: 1, statClass: 'strength', assetKey: 'common-amulet' },
  'rare-amulet': { id: 'rare-amulet', name: 'Jade Amulet', type: 'accessory', rarity: 'rare', strength: 1, health: 4, mana: 3, statClass: 'strength', assetKey: 'rare-amulet' },
  'legendary-amulet': { id: 'legendary-amulet', name: 'Demon Heart', type: 'accessory', rarity: 'legendary', strength: 4, health: 8, mana: 8, statClass: 'strength', assetKey: 'legendary-amulet' },
  'phantom-cloak': { id: 'phantom-cloak', name: 'Phantom Cloak', type: 'accessory', rarity: 'legendary', evasion: 0.15, health: 3, mana: 3, statClass: 'strength', assetKey: 'phantom-cloak' },
  // Accessories (Sorceress: intelligence)
  'common-orb': { id: 'common-orb', name: 'Glass Orb', type: 'accessory', rarity: 'common', intelligence: 1, health: 0, mana: 0, statClass: 'intelligence' },
  'rare-orb': { id: 'rare-orb', name: 'Arcane Orb', type: 'accessory', rarity: 'rare', intelligence: 2, health: 2, mana: 0, statClass: 'intelligence' },
  'legendary-orb': { id: 'legendary-orb', name: 'Phoenix Tear', type: 'accessory', rarity: 'legendary', intelligence: 3, health: 5, mana: 5, statClass: 'intelligence' },
  // Potions (effect value by rarity: common low, legendary high)
  'health-potion': { id: 'health-potion', name: 'Health Potion', type: 'potion', rarity: 'common', effect: 'health', value: 5, assetKey: 'health-potion' },
  'mana-potion': { id: 'mana-potion', name: 'Mana Potion', type: 'potion', rarity: 'common', effect: 'mana', value: 5, assetKey: 'mana-potion' },
  'health-potion-rare': { id: 'health-potion-rare', name: 'Greater Health Potion', type: 'potion', rarity: 'rare', effect: 'health', value: 10, assetKey: 'health-potion' },
  'mana-potion-rare': { id: 'mana-potion-rare', name: 'Greater Mana Potion', type: 'potion', rarity: 'rare', effect: 'mana', value: 10, assetKey: 'mana-potion' },
  'health-potion-legendary': { id: 'health-potion-legendary', name: 'Supreme Health Potion', type: 'potion', rarity: 'legendary', effect: 'health', value: 999, assetKey: 'health-potion' },
  'mana-potion-legendary': { id: 'mana-potion-legendary', name: 'Supreme Mana Potion', type: 'potion', rarity: 'legendary', effect: 'mana', value: 999, assetKey: 'mana-potion' },
  'avoid-death-potion': { id: 'avoid-death-potion', name: 'Avoid Death Potion', type: 'potion', rarity: 'legendary', effect: 'invulnerability', value: 3, assetKey: 'avoid-death-potion' },
  // Materials (crafting only, not equippable)
  'fire-stone': { id: 'fire-stone', name: 'Fire Stone', type: 'material', rarity: 'rare', assetKey: 'fire-stone' },
  'wind-stone': { id: 'wind-stone', name: 'Wind Stone', type: 'material', rarity: 'rare', assetKey: 'wind-stone' },
  'ice-stone': { id: 'ice-stone', name: 'Ice Stone', type: 'material', rarity: 'rare', assetKey: 'ice-stone' },
  'lightning-stone': { id: 'lightning-stone', name: 'Lightning Stone', type: 'material', rarity: 'rare', assetKey: 'lightning-stone' },
  'water-stone': { id: 'water-stone', name: 'Water Stone', type: 'material', rarity: 'rare', assetKey: 'water-stone' },
  // Unique weapons (Warrior / Fire, Wind, Ice, Lightning, Water)
  'unique-ember-cleaver': { id: 'unique-ember-cleaver', name: 'Ember Cleaver', type: 'weapon', rarity: 'unique', strength: 11, health: 3, statClass: 'strength', assetKey: 'ember-cleaver' },
  'unique-gale-edge': { id: 'unique-gale-edge', name: 'Gale Edge', type: 'weapon', rarity: 'unique', strength: 11, evasion: 0.06, statClass: 'strength', assetKey: 'gale-edge' },
  'unique-frostbite': { id: 'unique-frostbite', name: 'Frostbite', type: 'weapon', rarity: 'unique', strength: 11, defense: 3, statClass: 'strength', assetKey: 'frostbite' },
  'unique-stormbreaker': { id: 'unique-stormbreaker', name: 'Stormbreaker', type: 'weapon', rarity: 'unique', strength: 13, statClass: 'strength', assetKey: 'stormbreaker' },
  'unique-tide-blade': { id: 'unique-tide-blade', name: 'Tide Blade', type: 'weapon', rarity: 'unique', strength: 11, mana: 4, statClass: 'strength', assetKey: 'tide-blade' },
  // Unique armor (Warrior)
  'unique-inferno-plate': { id: 'unique-inferno-plate', name: 'Inferno Plate', type: 'armor', rarity: 'unique', defense: 8, strength: 3, statClass: 'strength', assetKey: 'inferno-plate' },
  'unique-storm-guard': { id: 'unique-storm-guard', name: 'Storm Guard', type: 'armor', rarity: 'unique', defense: 6, evasion: 0.16, statClass: 'strength', assetKey: 'storm-guard' },
  'unique-glacier-plate': { id: 'unique-glacier-plate', name: 'Glacier Plate', type: 'armor', rarity: 'unique', defense: 9, health: 3, statClass: 'strength', assetKey: 'glacier-plate' },
  'unique-volt-mail': { id: 'unique-volt-mail', name: 'Volt Mail', type: 'armor', rarity: 'unique', defense: 7, strength: 3, statClass: 'strength', assetKey: 'volt-mail' },
  'unique-wave-guard': { id: 'unique-wave-guard', name: 'Wave Guard', type: 'armor', rarity: 'unique', defense: 7, health: 6, statClass: 'strength', assetKey: 'wave-guard' },
  // Unique accessories (Warrior)
  'unique-flame-pendant': { id: 'unique-flame-pendant', name: 'Flame Pendant', type: 'accessory', rarity: 'unique', strength: 5, health: 7, statClass: 'strength', assetKey: 'flame-pendant' },
  'unique-wind-band': { id: 'unique-wind-band', name: 'Wind Band', type: 'accessory', rarity: 'unique', strength: 4, evasion: 0.11, statClass: 'strength', assetKey: 'wind-band' },
  'unique-ice-shard': { id: 'unique-ice-shard', name: 'Ice Shard', type: 'accessory', rarity: 'unique', strength: 3, defense: 6, statClass: 'strength', assetKey: 'legendary-amulet' },
  'unique-spark-ring': { id: 'unique-spark-ring', name: 'Spark Ring', type: 'accessory', rarity: 'unique', strength: 5, health: 4, mana: 4, statClass: 'strength', assetKey: 'legendary-ring' },
  'unique-dew-pendant': { id: 'unique-dew-pendant', name: 'Dew Pendant', type: 'accessory', rarity: 'unique', strength: 3, health: 9, mana: 6, statClass: 'strength', assetKey: 'legendary-amulet' },
  // Unique weapons (Sorceress)
  'unique-pyre-staff': { id: 'unique-pyre-staff', name: 'Pyre Staff', type: 'weapon', rarity: 'unique', intelligence: 11, mana: 3, statClass: 'intelligence' },
  'unique-zephyr-staff': { id: 'unique-zephyr-staff', name: 'Zephyr Staff', type: 'weapon', rarity: 'unique', intelligence: 11, evasion: 0.06, statClass: 'intelligence' },
  'unique-glacial-staff': { id: 'unique-glacial-staff', name: 'Glacial Staff', type: 'weapon', rarity: 'unique', intelligence: 11, defense: 3, statClass: 'intelligence' },
  'unique-thunder-rod': { id: 'unique-thunder-rod', name: 'Thunder Rod', type: 'weapon', rarity: 'unique', intelligence: 13, statClass: 'intelligence' },
  'unique-stream-staff': { id: 'unique-stream-staff', name: 'Stream Staff', type: 'weapon', rarity: 'unique', intelligence: 11, mana: 4, statClass: 'intelligence' },
  // Unique armor (Sorceress)
  'unique-phoenix-robe': { id: 'unique-phoenix-robe', name: 'Phoenix Robe', type: 'armor', rarity: 'unique', defense: 8, intelligence: 3, statClass: 'intelligence' },
  'unique-breeze-wrap': { id: 'unique-breeze-wrap', name: 'Breeze Wrap', type: 'armor', rarity: 'unique', defense: 6, evasion: 0.16, statClass: 'intelligence' },
  'unique-rime-robe': { id: 'unique-rime-robe', name: 'Rime Robe', type: 'armor', rarity: 'unique', defense: 9, mana: 3, statClass: 'intelligence' },
  'unique-static-robe': { id: 'unique-static-robe', name: 'Static Robe', type: 'armor', rarity: 'unique', defense: 7, intelligence: 3, statClass: 'intelligence' },
  'unique-mist-robe': { id: 'unique-mist-robe', name: 'Mist Robe', type: 'armor', rarity: 'unique', defense: 7, mana: 6, statClass: 'intelligence' },
  // Unique accessories (Sorceress)
  'unique-cinder-orb': { id: 'unique-cinder-orb', name: 'Cinder Orb', type: 'accessory', rarity: 'unique', intelligence: 5, mana: 7, statClass: 'intelligence' },
  'unique-gust-charm': { id: 'unique-gust-charm', name: 'Gust Charm', type: 'accessory', rarity: 'unique', intelligence: 4, evasion: 0.11, statClass: 'intelligence' },
  'unique-frozen-tear': { id: 'unique-frozen-tear', name: 'Frozen Tear', type: 'accessory', rarity: 'unique', intelligence: 3, defense: 6, statClass: 'intelligence' },
  'unique-arc-ring': { id: 'unique-arc-ring', name: 'Arc Ring', type: 'accessory', rarity: 'unique', intelligence: 5, health: 4, mana: 4, statClass: 'intelligence' },
  'unique-rain-crystal': { id: 'unique-rain-crystal', name: 'Rain Crystal', type: 'accessory', rarity: 'unique', intelligence: 3, mana: 9, health: 6, statClass: 'intelligence' },
};

// For loot/shop: class-specific gear + shared potions
const ITEMS_BY_TYPE_RARITY_STRENGTH = {
  weapon: { common: ['common-sword'], rare: ['rare-sword'], legendary: ['legendary-sword', 'cursed-demon-blade'] },
  armor: { common: ['common-armor'], rare: ['rare-armor'], legendary: ['legendary-armor', 'shadow-veil'] },
  accessory: { common: ['common-ring', 'common-amulet'], rare: ['rare-ring', 'rare-amulet'], legendary: ['legendary-ring', 'legendary-amulet', 'phantom-cloak'] },
};
const ITEMS_BY_TYPE_RARITY_INT = {
  weapon: { common: ['common-staff'], rare: ['rare-staff'], legendary: ['legendary-staff'] },
  armor: { common: ['common-robe'], rare: ['rare-robe'], legendary: ['legendary-robe'] },
  accessory: { common: ['common-orb'], rare: ['rare-orb'], legendary: ['legendary-orb'] },
};
const ITEMS_BY_TYPE_RARITY_SHARED = {
  potion: { common: ['health-potion', 'mana-potion'], rare: ['health-potion-rare', 'mana-potion-rare'], legendary: ['health-potion-legendary', 'mana-potion-legendary'] },
};
// Legacy: default strength pool
const ITEMS_BY_TYPE_RARITY = {
  ...ITEMS_BY_TYPE_RARITY_STRENGTH,
  ...ITEMS_BY_TYPE_RARITY_SHARED,
};

// Crafting: 350g + 1 material per unique. Recipes by class (15 each).
const CRAFT_RECIPES_STRENGTH = [
  { itemId: 'unique-ember-cleaver', material: 'fire-stone', slot: 'weapon' },
  { itemId: 'unique-inferno-plate', material: 'fire-stone', slot: 'armor' },
  { itemId: 'unique-flame-pendant', material: 'fire-stone', slot: 'accessory' },
  { itemId: 'unique-gale-edge', material: 'wind-stone', slot: 'weapon' },
  { itemId: 'unique-storm-guard', material: 'wind-stone', slot: 'armor' },
  { itemId: 'unique-wind-band', material: 'wind-stone', slot: 'accessory' },
  { itemId: 'unique-frostbite', material: 'ice-stone', slot: 'weapon' },
  { itemId: 'unique-glacier-plate', material: 'ice-stone', slot: 'armor' },
  { itemId: 'unique-ice-shard', material: 'ice-stone', slot: 'accessory' },
  { itemId: 'unique-stormbreaker', material: 'lightning-stone', slot: 'weapon' },
  { itemId: 'unique-volt-mail', material: 'lightning-stone', slot: 'armor' },
  { itemId: 'unique-spark-ring', material: 'lightning-stone', slot: 'accessory' },
  { itemId: 'unique-tide-blade', material: 'water-stone', slot: 'weapon' },
  { itemId: 'unique-wave-guard', material: 'water-stone', slot: 'armor' },
  { itemId: 'unique-dew-pendant', material: 'water-stone', slot: 'accessory' },
];
const CRAFT_RECIPES_INT = [
  { itemId: 'unique-pyre-staff', material: 'fire-stone', slot: 'weapon' },
  { itemId: 'unique-phoenix-robe', material: 'fire-stone', slot: 'armor' },
  { itemId: 'unique-cinder-orb', material: 'fire-stone', slot: 'accessory' },
  { itemId: 'unique-zephyr-staff', material: 'wind-stone', slot: 'weapon' },
  { itemId: 'unique-breeze-wrap', material: 'wind-stone', slot: 'armor' },
  { itemId: 'unique-gust-charm', material: 'wind-stone', slot: 'accessory' },
  { itemId: 'unique-glacial-staff', material: 'ice-stone', slot: 'weapon' },
  { itemId: 'unique-rime-robe', material: 'ice-stone', slot: 'armor' },
  { itemId: 'unique-frozen-tear', material: 'ice-stone', slot: 'accessory' },
  { itemId: 'unique-thunder-rod', material: 'lightning-stone', slot: 'weapon' },
  { itemId: 'unique-static-robe', material: 'lightning-stone', slot: 'armor' },
  { itemId: 'unique-arc-ring', material: 'lightning-stone', slot: 'accessory' },
  { itemId: 'unique-stream-staff', material: 'water-stone', slot: 'weapon' },
  { itemId: 'unique-mist-robe', material: 'water-stone', slot: 'armor' },
  { itemId: 'unique-rain-crystal', material: 'water-stone', slot: 'accessory' },
];
function getCraftRecipesForClass(hero) {
  return hero && hero.class === 'sorceress' ? CRAFT_RECIPES_INT : CRAFT_RECIPES_STRENGTH;
}

// Set bonus when wearing weapon + armor + either matching accessory of the same element (unique only).
const UNIQUE_SET_BONUSES = {
  'fire-stone': { warrior: { strength: 4, health: 6 }, sorceress: { intelligence: 4, mana: 6 } },
  'wind-stone': { warrior: { evasion: 0.06 }, sorceress: { evasion: 0.06 } },
  'ice-stone': { warrior: { defense: 3, health: 4 }, sorceress: { defense: 3, mana: 4 } },
  'lightning-stone': { warrior: { strength: 3, mana: 3 }, sorceress: { intelligence: 3, health: 3 } },
  'water-stone': { warrior: { health: 5, mana: 5 }, sorceress: { health: 5, mana: 5 } },
};

let _uniqueItemToElementCache = null;
function getUniqueElement(itemId) {
  const item = ITEMS[itemId];
  if (!item || item.rarity !== 'unique') return null;
  if (!_uniqueItemToElementCache) {
    _uniqueItemToElementCache = {};
    CRAFT_RECIPES_STRENGTH.concat(CRAFT_RECIPES_INT).forEach(r => { _uniqueItemToElementCache[r.itemId] = r.material; });
  }
  return _uniqueItemToElementCache[itemId] || null;
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

// Shop: class-specific gear + shared consumables
const SHOP_POOL_STRENGTH = [
  'common-sword', 'rare-sword', 'legendary-sword', 'cursed-demon-blade',
  'common-armor', 'rare-armor', 'legendary-armor', 'shadow-veil',
  'common-ring', 'rare-ring', 'legendary-ring',
  'common-amulet', 'rare-amulet', 'legendary-amulet', 'phantom-cloak',
];
const SHOP_POOL_INT = [
  'common-staff', 'rare-staff', 'legendary-staff',
  'common-robe', 'rare-robe', 'legendary-robe',
  'common-orb', 'rare-orb', 'legendary-orb',
];
const SHOP_POOL_SHARED = [
  'health-potion', 'mana-potion', 'health-potion-rare', 'mana-potion-rare',
  'health-potion-legendary', 'mana-potion-legendary',
];
const SHOP_POOL = SHOP_POOL_STRENGTH.concat(SHOP_POOL_SHARED);
