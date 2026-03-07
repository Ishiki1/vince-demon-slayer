/**
 * inventory.js
 * Slot-based inventory: each entry is { id, itemId, durability?, maxDurability? }.
 * Equip by slot id; weapon/armor/accessory have durability.
 */

const InventorySystem = {
  ensureAccessorySlots(hero) {
    if (!hero) return;
    if (Array.isArray(hero.accessories)) {
      while (hero.accessories.length < 2) hero.accessories.push(null);
      if (hero.accessories.length > 2) hero.accessories = hero.accessories.slice(0, 2);
      return;
    }
    hero.accessories = [hero.accessory != null ? hero.accessory : null, null];
    delete hero.accessory;
  },

  ensureSlotBased(hero) {
    this.ensureAccessorySlots(hero);
    if (!hero.inventory.length || typeof hero.inventory[0] !== 'string') return;
    hero._nextSlotId = hero._nextSlotId || 1;
    const migrated = [];
    hero.inventory.forEach(itemId => {
      const item = ITEMS[itemId];
      const maxDur = item && ['weapon', 'armor', 'accessory'].includes(item.type)
        ? DurabilitySystem.getMaxDurability(itemId) : null;
      migrated.push({
        id: hero._nextSlotId++,
        itemId,
        durability: maxDur != null ? maxDur : null,
        maxDurability: maxDur != null ? maxDur : null,
      });
    });
    hero.inventory = migrated;
  },

  getAccessorySlotIds(hero) {
    this.ensureAccessorySlots(hero);
    return hero.accessories.filter((slotId) => slotId != null);
  },

  isAccessoryEquipped(hero, slotId) {
    return this.getAccessorySlotIds(hero).includes(slotId);
  },

  getFirstEmptyAccessoryIndex(hero) {
    this.ensureAccessorySlots(hero);
    return hero.accessories.findIndex((slotId) => slotId == null);
  },

  isSlotEquipped(hero, slotId) {
    this.ensureAccessorySlots(hero);
    return hero.weapon === slotId || hero.armor === slotId || this.isAccessoryEquipped(hero, slotId);
  },

  add(hero, itemId) {
    if (!ITEMS[itemId]) return false;
    this.ensureSlotBased(hero);
    this.ensureAccessorySlots(hero);
    if (hero.inventory.length >= hero.maxInventory) return false;
    hero._nextSlotId = hero._nextSlotId || 1;
    const item = ITEMS[itemId];
    const maxDur = item && ['weapon', 'armor', 'accessory'].includes(item.type)
      ? DurabilitySystem.getMaxDurability(itemId) : null;
    hero.inventory.push({
      id: hero._nextSlotId++,
      itemId,
      durability: maxDur != null ? maxDur : null,
      maxDurability: maxDur != null ? maxDur : null,
    });
    return true;
  },

  equip(hero, slotId) {
    this.ensureSlotBased(hero);
    this.ensureAccessorySlots(hero);
    const slot = DurabilitySystem.getSlotById(hero, slotId);
    if (!slot || slot.durability <= 0) return;
    const item = ITEMS[slot.itemId];
    if (!item || !['weapon', 'armor', 'accessory'].includes(item.type)) return;
    if (item.type === 'weapon') hero.weapon = slotId;
    if (item.type === 'armor') hero.armor = slotId;
    if (item.type === 'accessory') {
      if (this.isAccessoryEquipped(hero, slotId)) return;
      const emptyIndex = this.getFirstEmptyAccessoryIndex(hero);
      if (emptyIndex === -1) return;
      hero.accessories[emptyIndex] = slotId;
    }
  },

  unequip(hero, type, slotIdOrIndex) {
    this.ensureAccessorySlots(hero);
    if (type === 'weapon' || type === 'armor') {
      hero[type] = null;
      return;
    }
    if (type !== 'accessory') return;
    if (typeof slotIdOrIndex === 'number' && slotIdOrIndex >= 0 && slotIdOrIndex < hero.accessories.length) {
      hero.accessories[slotIdOrIndex] = null;
      return;
    }
    const idx = hero.accessories.findIndex((equippedSlotId) => equippedSlotId === slotIdOrIndex);
    if (idx !== -1) hero.accessories[idx] = null;
  },

  usePotion(hero, itemId) {
    const item = ITEMS[itemId];
    if (!item || item.type !== 'potion') return false;
    this.ensureSlotBased(hero);
    const idx = hero.inventory.findIndex(s => s.itemId === itemId);
    if (idx === -1) return false;
    const maxH = hero.getEffectiveHealth();
    const maxM = hero.getEffectiveMana();
    if (item.effect === 'health') hero.currentHealth = Math.min(maxH, hero.currentHealth + (item.value >= 999 ? maxH : item.value));
    if (item.effect === 'mana') hero.currentMana = Math.min(maxM, hero.currentMana + (item.value >= 999 ? maxM : item.value));
    if (item.effect === 'invulnerability') {
      hero.invulnerableRounds = Math.max(hero.invulnerableRounds || 0, item.value || 0);
    }
    hero.inventory.splice(idx, 1);
    return true;
  },

  useScroll(hero, itemId) {
    const item = ITEMS[itemId];
    if (!item || item.type !== 'spell_scroll') return false;
    this.ensureSlotBased(hero);
    const idx = hero.inventory.findIndex(s => s.itemId === itemId);
    if (idx === -1) return false;
    const skillMap = getSkillsForClass(hero);
    if (item.skillId && skillMap[item.skillId] && !hero.skills.includes(item.skillId)) {
      hero.skills.push(item.skillId);
    }
    hero.inventory.splice(idx, 1);
    return true;
  },

  remove(hero, itemId) {
    this.ensureSlotBased(hero);
    this.ensureAccessorySlots(hero);
    const idx = hero.inventory.findIndex(s => s.itemId === itemId);
    if (idx !== -1) hero.inventory.splice(idx, 1);
  },

  removeSlotById(hero, slotId) {
    this.ensureSlotBased(hero);
    this.ensureAccessorySlots(hero);
    const idx = hero.inventory.findIndex(s => s.id === slotId);
    if (idx === -1) return null;
    const removed = hero.inventory.splice(idx, 1)[0];
    if (hero.weapon === slotId) hero.weapon = null;
    if (hero.armor === slotId) hero.armor = null;
    hero.accessories = hero.accessories.map((equippedSlotId) => equippedSlotId === slotId ? null : equippedSlotId);
    return removed;
  },
};
