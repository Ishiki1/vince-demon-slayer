/**
 * Hero.js
 * Vince - the player character. Effective stats scale with level and equipment (weapon, armor, accessories).
 */

function createHero(classId) {
  const classDef = typeof getClassDef === 'function' ? getClassDef(classId) : null;
  const resolvedClassId = classDef && classDef.id ? classDef.id : (classId || 'warrior');
  const baseStats = (classDef && classDef.baseStats) || {};
  const startingSkills = Array.isArray(classDef && classDef.startingSkills)
    ? classDef.startingSkills.slice()
    : [resolvedClassId === 'sorceress' ? 'fireball' : 'slash'];
  return {
    name: (classDef && classDef.heroName) || (resolvedClassId === 'sorceress' ? 'Isabella' : 'Vince'),
    class: resolvedClassId,
    strength: baseStats.strength != null ? baseStats.strength : 10,
    intelligence: baseStats.intelligence != null ? baseStats.intelligence : 5,
    health: baseStats.health != null ? baseStats.health : 10,
    mana: baseStats.mana != null ? baseStats.mana : 10,
    defense: baseStats.defense != null ? baseStats.defense : 0,
    currentHealth: baseStats.health != null ? baseStats.health : 10,
    currentMana: baseStats.mana != null ? baseStats.mana : 10,
    skills: startingSkills,
    passives: [],
    skillPoints: 0,
    weapon: null,
    armor: null,
    accessories: [null, null],
    inventory: [],
    battleDefenseBonus: 0,
    battleEvasionChance: 0,
    reaperSuppressEquipmentEvasion: false,
    invulnerableRounds: 0,
    maxInventory: 20,
    level: 1,
    xp: 0,
    gold: 0,
    runStatGrowthBonus: 0,

    getEffectiveHealth() {
      const growthMap = (typeof getClassGrowth === 'function' && getClassGrowth(this.class))
        || CONFIG.HERO_STAT_PER_LEVEL[this.class]
        || CONFIG.HERO_STAT_PER_LEVEL.default;
      const growth = (growthMap.health || 0) + (this.runStatGrowthBonus || 0);
      const base = this.health + (this.level - 1) * growth + (this.getArmorStatValue('health') || 0) + (this.getAccessoryStat('health') || 0);
      const passiveHp = (this.passives || []).reduce((s, id) => {
        const p = typeof PASSIVES !== 'undefined' && PASSIVES[id];
        return s + (p && p.effect && p.effect.stat === 'health' ? p.effect.value : 0);
      }, 0);
      const weaponMod = this.getWeaponMaxHealthModifier ? this.getWeaponMaxHealthModifier() : 0;
      const tempHp = this.tempBuff && this.tempBuff.type === 'maxHealth' ? this.tempBuff.value : 0;
      const setBonus = (this.getUniqueSetBonus && this.getUniqueSetBonus()) || {};
      return Math.max(1, base + passiveHp + weaponMod + tempHp + (setBonus.health || 0));
    },
    getEffectiveMana() {
      const growthMap = (typeof getClassGrowth === 'function' && getClassGrowth(this.class))
        || CONFIG.HERO_STAT_PER_LEVEL[this.class]
        || CONFIG.HERO_STAT_PER_LEVEL.default;
      const growth = (growthMap.mana || 0) + (this.runStatGrowthBonus || 0);
      const base = this.mana + (this.level - 1) * growth + (this.getArmorStatValue('mana') || 0) + (this.getAccessoryStat('mana') || 0);
      const passiveMana = (this.passives || []).reduce((s, id) => {
        const p = typeof PASSIVES !== 'undefined' && PASSIVES[id];
        return s + (p && p.effect && p.effect.stat === 'mana' ? p.effect.value : 0);
      }, 0);
      const tempMana = this.tempBuff && this.tempBuff.type === 'maxMana' ? this.tempBuff.value : 0;
      const setBonus = (this.getUniqueSetBonus && this.getUniqueSetBonus()) || {};
      return base + passiveMana + tempMana + (setBonus.mana || 0);
    },
    getEffectiveStrength() {
      const growthMap = (typeof getClassGrowth === 'function' && getClassGrowth(this.class))
        || CONFIG.HERO_STAT_PER_LEVEL[this.class]
        || CONFIG.HERO_STAT_PER_LEVEL.default;
      const growth = (growthMap.strength || 0) + (this.runStatGrowthBonus || 0);
      const base = this.strength + (this.level - 1) * growth + (this.getWeaponStat()) + (this.getArmorStatValue('strength') || 0) + (this.getAccessoryStat('strength') || 0);
      const passiveStr = (this.passives || []).reduce((s, id) => {
        const p = typeof PASSIVES !== 'undefined' && PASSIVES[id];
        return s + (p && p.effect && p.effect.stat === 'strength' ? p.effect.value : 0);
      }, 0);
      const tempStr = this.tempBuff && this.tempBuff.type === 'strength' ? this.tempBuff.value : 0;
      const setBonus = (this.getUniqueSetBonus && this.getUniqueSetBonus()) || {};
      return base + passiveStr + tempStr + (setBonus.strength || 0);
    },
    getEffectiveIntelligence() {
      const growthMap = (typeof getClassGrowth === 'function' && getClassGrowth(this.class))
        || CONFIG.HERO_STAT_PER_LEVEL[this.class]
        || CONFIG.HERO_STAT_PER_LEVEL.default;
      const growth = (growthMap.intelligence || 0) + (this.runStatGrowthBonus || 0);
      const base = (this.intelligence || 0) + (this.level - 1) * growth + (this.getWeaponIntelligence ? this.getWeaponIntelligence() : 0) + (this.getArmorStatValue('intelligence') || 0) + (this.getAccessoryStat('intelligence') || 0);
      const passiveInt = (this.passives || []).reduce((s, id) => {
        const p = typeof PASSIVES !== 'undefined' && PASSIVES[id];
        return s + (p && p.effect && p.effect.stat === 'intelligence' ? p.effect.value : 0);
      }, 0);
      const tempInt = this.tempBuff && this.tempBuff.type === 'intelligence' ? this.tempBuff.value : 0;
      const setBonus = (this.getUniqueSetBonus && this.getUniqueSetBonus()) || {};
      return base + passiveInt + tempInt + (setBonus.intelligence || 0);
    },
    getEffectiveDefense() {
      // Defense from armor and accessories only; no per-level growth
      const base = this.defense + (this.getArmorStat()) + (this.getAccessoryStat('defense') || 0);
      const passiveDef = (this.passives || []).reduce((s, id) => {
        const p = typeof PASSIVES !== 'undefined' && PASSIVES[id];
        return s + (p && p.effect && p.effect.stat === 'defense' ? p.effect.value : 0);
      }, 0);
      const setBonus = (this.getUniqueSetBonus && this.getUniqueSetBonus()) || {};
      return base + passiveDef + (this.battleDefenseBonus || 0) + (setBonus.defense || 0);
    },

    getSlotUpgradeMultipliers(slot, item) {
      if (!slot || !slot.upgraded) return (slot && slot.upgradeMultipliers) || {};
      if (item && item.rarity === 'unique' && typeof getUniqueUpgradeMultipliers === 'function') {
        return getUniqueUpgradeMultipliers(item);
      }
      return slot.upgradeMultipliers || {};
    },

    getWeaponStat() {
      const slot = this.inventory.find(s => s.id === this.weapon);
      if (!slot || slot.durability <= 0) return 0;
      const item = ITEMS[slot.itemId];
      const base = item && item.strength != null ? item.strength : 0;
      const multipliers = this.getSlotUpgradeMultipliers(slot, item);
      const mult = 1 + (multipliers && multipliers.strength != null ? multipliers.strength : 0);
      return base * mult;
    },
    getWeaponIntelligence() {
      const slot = this.inventory.find(s => s.id === this.weapon);
      if (!slot || slot.durability <= 0) return 0;
      const item = ITEMS[slot.itemId];
      const base = item && item.intelligence != null ? item.intelligence : 0;
      const multipliers = this.getSlotUpgradeMultipliers(slot, item);
      const mult = 1 + (multipliers && multipliers.intelligence != null ? multipliers.intelligence : 0);
      return base * mult;
    },
    getWeaponMaxHealthModifier() {
      const slot = this.inventory.find(s => s.id === this.weapon);
      if (!slot || !slot.durability) return 0;
      const item = ITEMS[slot.itemId];
      const base = item && item.maxHealthModifier != null ? item.maxHealthModifier : 0;
      const multipliers = this.getSlotUpgradeMultipliers(slot, item);
      const mult = 1 + (multipliers && multipliers.maxHealthModifier != null ? multipliers.maxHealthModifier : 0);
      return base * mult;
    },
    getWeaponDamageMultiplier() {
      const slot = this.inventory.find(s => s.id === this.weapon);
      if (!slot || slot.durability <= 0) return 1;
      const item = ITEMS[slot.itemId];
      const multipliers = this.getSlotUpgradeMultipliers(slot, item);
      return 1 + (multipliers && multipliers.damage != null ? multipliers.damage : 0);
    },
    getArmorStatValue(stat) {
      const slot = this.inventory.find(s => s.id === this.armor);
      if (!slot || slot.durability <= 0) return 0;
      const item = ITEMS[slot.itemId];
      const base = item && item[stat] != null ? item[stat] : 0;
      const multipliers = this.getSlotUpgradeMultipliers(slot, item);
      const mult = 1 + (multipliers && multipliers[stat] != null ? multipliers[stat] : 0);
      return base * mult;
    },
    getArmorStat() {
      return this.getArmorStatValue('defense');
    },
    getEquippedAccessorySlotIds() {
      if (Array.isArray(this.accessories)) {
        return this.accessories.filter((slotId) => slotId != null);
      }
      return this.accessory != null ? [this.accessory] : [];
    },

    getEquippedAccessorySlots() {
      return this.getEquippedAccessorySlotIds()
        .map((slotId) => this.inventory.find((slot) => slot.id === slotId))
        .filter(Boolean);
    },

    isAccessoryEquipped(slotId) {
      return this.getEquippedAccessorySlotIds().includes(slotId);
    },

    getAccessoryStatTotal(stat) {
      return this.getEquippedAccessorySlots().reduce((sum, slot) => {
        if (slot.durability <= 0) return sum;
        const item = ITEMS[slot.itemId];
        const base = item && item[stat] != null ? item[stat] : 0;
        const multipliers = this.getSlotUpgradeMultipliers(slot, item);
        const mult = 1 + (multipliers && multipliers[stat] != null ? multipliers[stat] : 0);
        return sum + (base * mult);
      }, 0);
    },

    getAccessoryStat(stat) {
      return this.getAccessoryStatTotal(stat);
    },

    getArmorEvasion() {
      return this.getArmorStatValue('evasion');
    },
    getAccessoryEvasionTotal() {
      return this.getEquippedAccessorySlots().reduce((sum, slot) => {
        if (slot.durability <= 0) return sum;
        const item = ITEMS[slot.itemId];
        const base = item && item.evasion != null ? item.evasion : 0;
        const multipliers = this.getSlotUpgradeMultipliers(slot, item);
        const mult = 1 + (multipliers && multipliers.evasion != null ? multipliers.evasion : 0);
        return sum + (base * mult);
      }, 0);
    },

    getAccessoryEvasion() {
      return this.getAccessoryEvasionTotal();
    },

    getPassiveEvasionChance() {
      return (this.passives || []).reduce((sum, id) => {
        const passive = typeof PASSIVES !== 'undefined' ? PASSIVES[id] : null;
        return sum + (passive && passive.effect && passive.effect.stat === 'evasion' ? passive.effect.value : 0);
      }, 0);
    },

    getEquipmentEvasionChance() {
      let evasion = (this.getArmorEvasion ? this.getArmorEvasion() : 0) + (this.getAccessoryEvasion ? this.getAccessoryEvasion() : 0);
      const setBonus = (this.getUniqueSetBonus && this.getUniqueSetBonus()) || {};
      evasion += setBonus.evasion || 0;
      return evasion;
    },

    getUniqueSetBonus() {
      if (typeof getUniqueElement !== 'function' || typeof UNIQUE_SET_BONUSES === 'undefined') return null;
      const wSlot = this.weapon != null ? this.inventory.find(s => s.id === this.weapon) : null;
      const aSlot = this.armor != null ? this.inventory.find(s => s.id === this.armor) : null;
      const accessorySlots = this.getEquippedAccessorySlots();
      if (!wSlot || !aSlot || accessorySlots.length === 0) return null;
      const elW = getUniqueElement(wSlot.itemId);
      const elA = getUniqueElement(aSlot.itemId);
      if (!elW || !elA || elW !== elA) return null;
      const hasMatchingAccessory = accessorySlots.some((slot) => getUniqueElement(slot.itemId) === elW);
      if (!hasMatchingAccessory) return null;
      const key = this.class || 'warrior';
      return UNIQUE_SET_BONUSES[elW] && UNIQUE_SET_BONUSES[elW][key] ? UNIQUE_SET_BONUSES[elW][key] : null;
    },

    getEvasionChance() {
      let ev = (this.battleEvasionChance || 0);
      ev += this.getPassiveEvasionChance ? this.getPassiveEvasionChance() : 0;
      if (!this.reaperSuppressEquipmentEvasion) {
        ev += this.getEquipmentEvasionChance ? this.getEquipmentEvasionChance() : 0;
      }
      const maxEvasion = CONFIG.HERO_MAX_EVASION != null ? CONFIG.HERO_MAX_EVASION : 0.9;
      return Math.min(maxEvasion, Math.max(0, ev));
    },

    getStrength() {
      let str = this.getEffectiveStrength();
      if (this.reaperFrightened) str = str * 0.5;
      return Math.floor(str);
    },
    getIntelligence() {
      return Math.floor(this.getEffectiveIntelligence ? this.getEffectiveIntelligence() : 0);
    },
    getDefense() {
      return Math.floor(this.getEffectiveDefense());
    },

    refillCombatStats() {
      this.currentHealth = this.getEffectiveHealth();
      this.currentMana = this.getEffectiveMana();
    },
  };
}
