/**
 * CharacterSheetScene.js
 * Full character summary: level & XP, stats, skills, equipped items and their effects.
 */

class CharacterSheetScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSheet' });
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    const data = this.scene.settings.data || {};
    const returnScene = data.from === 'Town' ? 'Town' : 'Overworld';
    const skillTreeFrom = returnScene === 'Town' ? 'town' : 'overworld';
    const backLabel = returnScene === 'Town' ? 'Back to Town' : 'Back to Map';
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    InventorySystem.ensureAccessorySlots(hero);

    this.add.text(w / 2, 36, 'Character Sheet', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);

    const left = 80;
    let y = 88;

    // Level & XP
    const needed = ProgressionSystem.xpNeededForNextLevel(hero);
    const current = hero.level === 1 ? 0 : CONFIG.XP_PER_LEVEL[hero.level - 1];
    const xpInLevel = hero.xp - current;
    const xpForLevel = needed - current;
    this.add.text(left, y, 'Level ' + hero.level, { fontSize: 18, color: '#fff' });
    y += 24;
    this.add.text(left, y, 'XP: ' + xpInLevel + ' / ' + xpForLevel + ' (next level)', { fontSize: 14, color: '#94a3b8' });
    y += 32;

    // Stats
    this.add.text(left, y, 'Stats', { fontSize: 16, color: '#fbbf24' });
    y += 24;
    const str = Math.floor(hero.getEffectiveStrength());
    const def = Math.floor(hero.getEffectiveDefense());
    const maxHp = hero.getEffectiveHealth();
    const maxMana = hero.getEffectiveMana();
    this.add.text(left, y, 'Strength: ' + str, { fontSize: 14, color: '#fff' });
    y += 20;
    if (hero.getEffectiveIntelligence) {
      const int = Math.floor(hero.getEffectiveIntelligence());
      this.add.text(left, y, 'Intelligence: ' + int, { fontSize: 14, color: '#fff' });
      y += 20;
    }
    this.add.text(left, y, 'Defense: ' + def, { fontSize: 14, color: '#fff' });
    y += 20;
    this.add.text(left, y, 'HP: ' + hero.currentHealth + ' / ' + maxHp, { fontSize: 14, color: '#fff' });
    y += 20;
    this.add.text(left, y, 'Mana: ' + hero.currentMana + ' / ' + maxMana, { fontSize: 14, color: '#93c5fd' });
    y += 36;

    // Skills
    this.add.text(left, y, 'Skills', { fontSize: 16, color: '#fbbf24' });
    y += 24;
    const skillMap = getSkillsForClass(hero);
    hero.skills.forEach(skillId => {
      const skill = skillMap[skillId];
      if (skill) {
        let skillLine = skill.name + ' (' + skill.manaCost + ' Mana)';
        if (skill.damageMultiplier != null) {
          const statLabel = skill.damageStat === 'intelligence' ? 'Int' : 'Str';
          skillLine += ' — ' + skill.damageMultiplier + 'x ' + statLabel + ' damage';
        }
        if (skill.isHeal) {
          const healDescription = typeof getSkillHealDescription === 'function'
            ? getSkillHealDescription(skill)
            : (skill.healValue != null ? 'Heals ' + skill.healValue + ' HP' : 'Heals');
          skillLine += ' — ' + healDescription;
        }
        if (skill.battleDefenseBonus != null) skillLine += ' — +' + skill.battleDefenseBonus + ' Def';
        if (skill.battleEvasionChance != null) skillLine += ' — +' + Math.round((skill.battleEvasionChance || 0) * 100) + '% Evasion';
        if (skill.blockReflectRounds != null) skillLine += ' — Block/reflect ' + skill.blockReflectRounds + ' turns';
        this.add.text(left, y, skillLine, { fontSize: 14, color: '#fff' });
        y += 20;
      }
    });
    y += 16;

    // Run unlock bonuses
    const runUnlocks = GAME_STATE.runUnlocks || [];
    if (runUnlocks.length > 0 && typeof UNLOCKS !== 'undefined') {
      this.add.text(left, y, 'Run bonuses', { fontSize: 16, color: '#fbbf24' });
      y += 24;
      runUnlocks.forEach(id => {
        const u = UNLOCKS[id];
        if (u) {
          this.add.text(left, y, u.name + ': ' + (u.tooltip || ''), { fontSize: 12, color: '#a5b4fc' }).setWordWrapWidth(w - left - 40);
          y += 36;
        }
      });
      y += 8;
    } else {
      y += 8;
    }

    // Equipped items
    this.add.text(left, y, 'Equipped', { fontSize: 16, color: '#fbbf24' });
    y += 24;
    const slots = [
      { key: 'weapon', label: 'Weapon' },
      { key: 'armor', label: 'Armor' },
      { key: 'accessories.0', label: 'Accessory 1' },
      { key: 'accessories.1', label: 'Accessory 2' },
    ];
    slots.forEach(({ key, label }) => {
      const slotId = key.startsWith('accessories.')
        ? hero.accessories[Number(key.split('.')[1])]
        : hero[key];
      const slot = slotId != null ? hero.inventory.find(s => s.id === slotId) : null;
      const item = slot && ITEMS[slot.itemId] ? ITEMS[slot.itemId] : null;
      const name = item ? item.name : 'None';
      this.add.text(left, y, label + ': ' + name, { fontSize: 14, color: '#fff' });
      y += 18;
      if (item) {
        const effectLine = getItemEffectLine(item);
        if (effectLine) {
          this.add.text(left + 12, y, effectLine, { fontSize: 12, color: '#a5b4fc' });
          y += 18;
        } else {
          y += 4;
        }
      } else {
        y += 4;
      }
    });

    if (typeof getUniqueSetBonusDisplay === 'function') {
      const setDisplay = getUniqueSetBonusDisplay(hero);
      if (setDisplay) {
        y += 8;
        this.add.text(left, y, 'Set: ' + setDisplay.elementName + ' (' + setDisplay.summary + ')', { fontSize: 14, color: '#a5b4fc' });
        y += 22;
      }
    }

    const skillTreeBtn = this.add.rectangle(w / 2 - 90, h - 60, 140, 48, 0x8b5cf6);
    skillTreeBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2 - 90, h - 60, 'Skill Tree', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    skillTreeBtn.on('pointerdown', () => this.scene.start('SkillTree', { from: skillTreeFrom }));

    const backBtn = this.add.rectangle(w / 2 + 90, h - 60, 160, 48, 0x475569);
    backBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2 + 90, h - 60, backLabel, { fontSize: 16, color: '#fff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start(returnScene));
  }
}
