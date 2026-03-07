/**
 * durability.js
 * Max durability by rarity; weapon use and armor hit decrement; break handling.
 */

const DurabilitySystem = {
  getMaxDurability(itemId) {
    const item = ITEMS[itemId];
    if (!item || !['weapon', 'armor', 'accessory'].includes(item.type)) return null;
    if (item.rarity === 'unique') return CONFIG.DURABILITY_MAX_UNIQUE ?? CONFIG.DURABILITY_MAX_LEGENDARY;
    const key = 'DURABILITY_MAX_' + item.rarity.toUpperCase().replace('-', '');
    return CONFIG[key] ?? CONFIG.DURABILITY_MAX_COMMON;
  },

  getSlotById(hero, slotId) {
    if (slotId == null) return null;
    return hero.inventory.find(s => s.id === slotId) || null;
  },

  weaponUse(hero) {
    if (hero.unlimitedDurability) return null;
    const slot = this.getSlotById(hero, hero.weapon);
    if (!slot || slot.durability == null) return null;
    slot.durability = Math.max(0, slot.durability - 1);
    return this.checkBreak(hero, slot, 'weapon');
  },

  armorHit(hero) {
    if (hero.unlimitedDurability) return null;
    const slot = this.getSlotById(hero, hero.armor);
    if (!slot || slot.durability == null) return null;
    slot.durability = Math.max(0, slot.durability - 1);
    return this.checkBreak(hero, slot, 'armor');
  },

  checkBreak(hero, slot, equipmentType) {
    if (slot.durability > 0) return null;
    const item = ITEMS[slot.itemId];
    const name = item ? item.name : 'Item';
    InventorySystem.removeSlotById(hero, slot.id);
    if (hero[equipmentType] === slot.id) hero[equipmentType] = null;
    GAME_STATE.lastBrokenItemName = name;
    return name;
  },
};
