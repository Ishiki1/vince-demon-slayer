/**
 * eventEffects.js
 * Apply random event effects to the hero. Narrative lives in events.js.
 */

const EventEffects = {
  /** Apply effect and return a short result message for the UI. */
  apply(hero, eventId, choiceIndex) {
    switch (eventId) {
      case 'temple':
        return this.applyTemple(hero);
      case 'trap':
        return this.applyTrap(hero);
      case 'witch':
        return this.applyWitch(hero);
      case 'dungeon':
        return this.applyDungeon(hero);
      case 'devil':
        return this.applyDevil(hero, choiceIndex);
      case 'mentor':
        return this.applyMentor(hero, choiceIndex);
      case 'priest':
        return this.applyPriest(hero);
      case 'robber':
        return this.applyRobber(hero);
      case 'legendaryMerchant':
        return '';
      case 'skillPointShrine':
        hero.skillPoints = (hero.skillPoints || 0) + 1;
        return 'You received: +1 Skill Point.';
      default:
        return '';
    }
  },

  applyTemple(hero) {
    const buffs = [
      { type: 'maxHealth', value: 5, msg: '+5 Max HP (until next boss)' },
      { type: 'maxMana', value: 5, msg: '+5 Max Mana (until next boss)' },
      { type: 'unlimitedDurability', msg: 'Unlimited durability (until next boss)' },
      { type: 'strength', value: 3, msg: '+3 Strength (until next boss)' },
    ];
    const pick = buffs[Math.floor(Math.random() * buffs.length)];
    if (pick.type === 'unlimitedDurability') {
      hero.unlimitedDurability = true;
      hero.tempBuffUntilBoss = true;
    } else {
      hero.tempBuff = pick;
      hero.tempBuffUntilBoss = true;
    }
    return 'You received: ' + pick.msg + '.';
  },

  applyTrap(hero) {
    const damage = Math.max(1, Math.floor(hero.getEffectiveHealth() * 0.1));
    hero.currentHealth = Math.max(1, hero.currentHealth - damage);
    return 'You took ' + damage + ' damage.';
  },

  applyWitch(hero) {
    const lockable = hero.skills.filter(id => id !== 'slash' && id !== 'fireball');
    if (lockable.length) {
      hero.lockedSkillId = lockable[Math.floor(Math.random() * lockable.length)];
      const skillMap = getSkillsForClass(hero) || {};
      const name = (skillMap[hero.lockedSkillId] && skillMap[hero.lockedSkillId].name) || hero.lockedSkillId;
      return 'Effect: ' + name + ' is locked for the next level.';
    }
    return 'Effect: No skill was locked.';
  },

  applyDungeon(hero) {
    const gold = 30 + 10 * hero.level;
    hero.gold += gold;
    return 'You received: ' + gold + ' gold.';
  },

  applyDevil(hero, choiceIndex) {
    if (choiceIndex === 0) {
      InventorySystem.add(hero, 'cursed-demon-blade');
      return 'You received: Cursed Demon Blade (-5 Max HP when equipped).';
    }
    return 'You refused the blade.';
  },

  applyMentor(hero, choiceIndex) {
    const stat = ['strength', 'health', 'mana', 'defense'][choiceIndex];
    if (stat && hero[stat] != null) {
      hero[stat] += 3;
      const labels = { strength: 'Strength', health: 'Health', mana: 'Mana', defense: 'Defense' };
      return 'You received: +3 ' + (labels[stat] || stat) + '.';
    }
    return '';
  },

  applyPriest(hero) {
    ProgressionSystem.addSkill(hero, 'holyLight');
    return 'You learned: Holy Light (4 mana, heals 5 HP).';
  },

  applyRobber(hero) {
    const pct = 0.1 + 0.2 * Math.random();
    const stolen = Math.floor(hero.gold * pct);
    hero.gold = Math.max(0, hero.gold - stolen);
    return 'Effect: You lost ' + stolen + ' gold.';
  },
};
