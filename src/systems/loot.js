/**
 * loot.js
 * Roll loot by type (weapon/armor/accessory/potion/material) and rarity.
 * Goons: common/rare only. Bosses: better legendary chance. Potions rare. Materials drop at same rate as weapon.
 */

const MATERIAL_IDS = ['fire-stone', 'wind-stone', 'ice-stone', 'lightning-stone', 'water-stone'];

const LootSystem = {
  rollRarity(isBoss, luckPercent) {
    let w = isBoss ? { ...CONFIG.LOOT_WEIGHTS_BOSS } : { ...CONFIG.LOOT_WEIGHTS_GOON };
    if (luckPercent > 0) {
      const shift = Math.min(luckPercent, w.common);
      w = { common: w.common - shift, rare: w.rare + Math.floor(shift * 0.6), legendary: (w.legendary || 0) + Math.floor(shift * 0.4) };
    }
    const total = w.common + w.rare + (w.legendary || 0);
    if (total <= 0) return 'common';
    let r = Math.random() * total;
    if (r < w.common) return 'common';
    if (r < w.common + w.rare) return 'rare';
    return 'legendary';
  },

  rollLootType() {
    const w = CONFIG.LOOT_TYPE_WEIGHTS;
    const total = w.weapon + w.armor + w.accessory + (w.potion || 0) + (w.material || 0);
    let r = Math.random() * total;
    if (r < w.weapon) return 'weapon';
    r -= w.weapon;
    if (r < w.armor) return 'armor';
    r -= w.armor;
    if (r < w.accessory) return 'accessory';
    r -= w.accessory;
    if (r < (w.potion || 0)) return 'potion';
    r -= (w.potion || 0);
    return 'material';
  },

  rollLoot(isBoss, heroClass) {
    const type = LootSystem.rollLootType();
    if (type === 'material') return MATERIAL_IDS[Math.floor(Math.random() * MATERIAL_IDS.length)];
    const runUnlocks = (typeof GAME_STATE !== 'undefined' && GAME_STATE && GAME_STATE.runUnlocks) ? GAME_STATE.runUnlocks : [];
    const luckPercent = Array.isArray(runUnlocks) && runUnlocks.includes('lucky') ? 5 : 0;
    const rarity = LootSystem.rollRarity(isBoss, luckPercent);
    const isInt = heroClass === 'sorceress';
    const gearMap = isInt ? ITEMS_BY_TYPE_RARITY_INT : ITEMS_BY_TYPE_RARITY_STRENGTH;
    const sharedMap = ITEMS_BY_TYPE_RARITY_SHARED;
    const pool = (gearMap[type] || sharedMap[type]) && (gearMap[type] || sharedMap[type])[rarity];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  },
};
