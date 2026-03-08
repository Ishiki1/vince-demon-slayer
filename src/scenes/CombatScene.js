/**
 * CombatScene.js
 * Turn-based fight: Vince vs one or more enemies. Shake + damage numbers. Target selection for single-target skills; AoE hits all.
 */

class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Combat' });
  }

  isHeroIdleAnimKey(animKey) {
    return animKey === 'hero_idle'
      || (typeof animKey === 'string' && animKey.startsWith('hero_') && animKey.endsWith('_set_idle'));
  }

  isVampireBossEnemy(enemy) {
    return !!enemy && enemy.isBoss === true && enemy.name === 'Vampire';
  }

  getEnemyFormationLayout(enemyCount, enemyW, heroW, sceneWidth) {
    const heroCenterX = this.heroSprite ? this.heroSprite.x : 150;
    const minX = heroCenterX + heroW / 2 + enemyW / 2 + 20;
    const maxX = sceneWidth - enemyW / 2 - 20;
    const desiredStartX = heroCenterX + heroW / 2 + enemyW / 2 + 50;

    if (enemyCount <= 1) {
      return {
        startX: Math.max(minX, Math.min(desiredStartX + 70, maxX)),
        step: 0,
      };
    }

    // Keep enemy groups closer to Vince while compressing just enough to stay in bounds.
    const desiredStep = Math.max(enemyW - 10, 90);
    const maxStep = (maxX - minX) / (enemyCount - 1);
    const step = Math.max(0, Math.min(desiredStep, maxStep));
    const groupWidth = step * (enemyCount - 1);
    const startX = Math.max(minX, Math.min(desiredStartX, maxX - groupWidth));
    return { startX, step };
  }

  getHeroIdleVisual() {
    const hero = this.hero;
    if (hero && typeof getUniqueElement === 'function' && typeof getClassCombatIdleVisual === 'function') {
      const weaponSlot = hero.weapon != null ? hero.inventory.find(s => s.id === hero.weapon) : null;
      const armorSlot = hero.armor != null ? hero.inventory.find(s => s.id === hero.armor) : null;
      const weaponElement = weaponSlot ? getUniqueElement(weaponSlot.itemId) : null;
      const armorElement = armorSlot ? getUniqueElement(armorSlot.itemId) : null;
      const accessorySlots = typeof hero.getEquippedAccessorySlots === 'function'
        ? hero.getEquippedAccessorySlots()
        : [];
      const fullSetElement = weaponElement
        && weaponElement === armorElement
        && accessorySlots.some((slot) => getUniqueElement(slot.itemId) === weaponElement)
        ? weaponElement
        : null;
      const classVisual = getClassCombatIdleVisual(hero.class, fullSetElement);
      if (classVisual && this.textures.exists(classVisual.sheetKey) && this.anims.exists(classVisual.animKey)) {
        return classVisual;
      }
    }
    return { sheetKey: 'hero_sheet', animKey: 'hero_idle' };
  }

  playCurrentHeroIdle() {
    if (!this.heroSprite) return;
    const { sheetKey, animKey } = this.getHeroIdleVisual();
    this.heroSprite.setTexture(sheetKey);
    this.heroSprite.setFrame(0);
    this.heroSprite.play(animKey);
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);
    const hero = GAME_STATE.hero;
    const forcedEncounter = GAME_STATE.forcedEncounter;
    const isForcedDay10Reaper = forcedEncounter && forcedEncounter.type === 'day10Reaper';
    let level = null;
    let fightIndex = 0;
    let fight = null;
    if (isForcedDay10Reaper) {
      level = {
        id: 'day10Reaper',
        name: 'The Reaper',
        levelIndex: Math.max(0, (hero.level || 1) - 1),
        fights: [{ slot: 0, isBoss: false }],
      };
      fight = level.fights[0];
    } else {
      level = LEVELS.find(l => l.id === GAME_STATE.currentLevelId);
      fightIndex = GAME_STATE.currentFightIndex;
      if (!level || !level.fights[fightIndex]) {
        this.scene.start('Overworld');
        return;
      }
      fight = level.fights[fightIndex];
    }
    if (fight.isBoss && hero.tempBuffUntilBoss) {
      hero.tempBuff = null;
      hero.tempBuffUntilBoss = false;
      hero.unlimitedDurability = false;
    }

    let reaperAppears = false;
    if (isForcedDay10Reaper) {
      reaperAppears = true;
    } else {
      const completedLevelIds = GAME_STATE.completedLevelIds || [];
      const isRevisit = completedLevelIds.includes(level.id);
      const reaperChance = CONFIG.REAPER_BASE_CHANCE + level.levelIndex * CONFIG.REAPER_PER_LEVEL;
      reaperAppears = isRevisit && fightIndex === 0 && !fight.isBoss && Math.random() < reaperChance;
    }
    GAME_STATE.reaperFight = reaperAppears;

    if (reaperAppears) {
      hero.reaperFrightened = true;
      this.enemies = [createReaper(hero.level)];
      this.isBossFight = true;
    } else {
      const count = getEnemyCountForFight(level.levelIndex, fightIndex, fight.isBoss);
      this.enemies = [];
      for (let i = 0; i < count; i++) {
        const e = createEnemy(level.levelIndex, fight.isBoss);
        if (count > 1 && !e.isBoss) e.name = e.name + ' #' + (i + 1);
        this.enemies.push(e);
      }
      this.isBossFight = fight.isBoss;
    }
    this.hero = hero;
    this.forcedEncounter = forcedEncounter;
    hero.battleEvasionChance = 0;
    hero.blockReflectRounds = 0;
    hero.flameAuraRounds = 0;
    this.fightIndex = fightIndex;
    this.level = level;
    this.skillButtons = null;
    this.xpBar = null;
    this.inventoryPanel = null;
    this.turnState = 'playerTurn';
    this.selectedSkillId = null;
    this.heroSprite = null;
    this.enemySprites = [];
    this.enemyHpTexts = [];
    this.enemyNameTexts = [];
    this.targetHintText = null;
    this.cancelTargetBtn = null;
    this.cancelTargetTxt = null;
    this.statusEffectsText = null;
    this.justWonReaperFight = false;
    this.enemyTurnUsedInvulnerability = false;
    this.combatLogLines = [];
    this.combatLogText = null;
    this.combatLogMaxLines = 8;

    if (GAME_STATE.reaperFight) {
      if (typeof stopAllMusic === 'function') stopAllMusic(this);
      if (typeof playMusicOnce === 'function') playMusicOnce(this, 'reaper-appears');
    } else if (this.isBossFight) {
      if (level.id === 'level10' || level.id === 'level20') {
        if (typeof playMusicLoop === 'function') playMusicLoop(this, 'boss-music');
      } else {
        if (typeof playMusicLoop === 'function') playMusicLoop(this, 'generic-bossfight-music');
      }
    }

    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;

    const heroW = CONFIG.HERO_SPRITE_DISPLAY_WIDTH;
    const heroH = CONFIG.HERO_SPRITE_DISPLAY_HEIGHT;
    const heroIdleVisual = this.getHeroIdleVisual();
    this.heroSprite = this.add.sprite(150, h / 2, heroIdleVisual.sheetKey)
      .setDisplaySize(heroW, heroH)
      .setOrigin(0.5, 0.5);
    this.heroSprite.setFrame(0);
    this.heroSprite.play(heroIdleVisual.animKey);
    this.heroSprite.on('animationcomplete', (anim) => {
      if (anim.key === 'hero_slash' || anim.key === 'hero_heavy_strike' || anim.key === 'hero_execute' || anim.key === 'hero_whirlwind' || anim.key === 'hero_life_drain' || anim.key === 'hero_evade' || anim.key === 'hero_iron_skin' || anim.key === 'hero_healing' || anim.key === 'hero_thorncape' || anim.key === 'hero_iron_evasion') {
        this.playCurrentHeroIdle();
      } else if (this.isHeroIdleAnimKey(anim.key)) {
        this.playCurrentHeroIdle();
      }
    });
    this.add.text(150, h / 2 - heroH / 2 - 24, this.hero.name || 'Hero', { fontSize: 16, color: '#fff' }).setOrigin(0.5);

    const enemyW = CONFIG.ENEMY_SPRITE_WIDTH;
    const enemyH = CONFIG.ENEMY_SPRITE_HEIGHT;
    const enemyColor = this.isBossFight ? 0x991b1b : 0xdc2626;
    const { startX, step } = this.getEnemyFormationLayout(this.enemies.length, enemyW, heroW, w);
    for (let i = 0; i < this.enemies.length; i++) {
      const x = startX + i * step;
      const enemy = this.enemies[i];
      let displayObj;
      if (enemy.name === 'The Reaper' && this.textures.exists('reaper_idle_sheet') && this.anims.exists('reaper_idle')) {
        const sprite = this.add.sprite(x, h / 2, 'reaper_idle_sheet', 0).setDisplaySize(enemyW, enemyH);
        sprite.play('reaper_idle');
        displayObj = sprite;
      } else if (this.isVampireBossEnemy(enemy) && this.textures.exists('vampire_idle_sheet') && this.anims.exists('vampire_idle')) {
        const sprite = this.add.sprite(x, h / 2, 'vampire_idle_sheet', 0).setDisplaySize(enemyW, enemyH);
        sprite.play('vampire_idle');
        displayObj = sprite;
      } else if (enemy.goonType === 'skeleton' && this.textures.exists('skeleton_idle_sheet') && this.anims.exists('skeleton_idle')) {
        const sprite = this.add.sprite(x, h / 2, 'skeleton_idle_sheet', 0).setDisplaySize(enemyW, enemyH);
        sprite.play('skeleton_idle');
        displayObj = sprite;
      } else if (enemy.goonType === 'bat' && this.textures.exists('bat_idle_sheet') && this.anims.exists('bat_idle')) {
        const sprite = this.add.sprite(x, h / 2, 'bat_idle_sheet', 0).setDisplaySize(enemyW, enemyH);
        sprite.play('bat_idle');
        displayObj = sprite;
      } else if (enemy.goonType === 'imp' && this.textures.exists('imp_idle_sheet') && this.anims.exists('imp_idle')) {
        const sprite = this.add.sprite(x, h / 2, 'imp_idle_sheet', 0).setDisplaySize(enemyW, enemyH);
        sprite.play('imp_idle');
        displayObj = sprite;
      } else {
        displayObj = this.add.rectangle(x, h / 2, enemyW, enemyH, enemyColor);
      }
      const nameText = this.add.text(x, h / 2 - enemyH / 2 - 28, enemy.name, { fontSize: 12, color: '#fff' }).setOrigin(0.5);
      const hpText = this.add.text(x, h / 2 - enemyH / 2 - 12, `HP: ${enemy.hp}/${enemy.maxHp}`, { fontSize: 12, color: '#fff' }).setOrigin(0.5);
      displayObj.setInteractive({ useHandCursor: true });
      const enemyIndex = i;
      displayObj.on('pointerdown', () => this.onEnemyClicked(enemyIndex));
      this.enemySprites.push(displayObj);
      this.enemyHpTexts.push(hpText);
      this.enemyNameTexts.push(nameText);
    }

    const barW = 200;
    const barH = 20;
    this.hpBarBg = this.add.rectangle(20, 20, barW, barH, 0x333333).setOrigin(0, 0);
    this.hpBarFill = this.add.rectangle(20, 20, barW * (hero.currentHealth / hero.getEffectiveHealth()), barH, 0xdc2626).setOrigin(0, 0);
    this.heroHpText = this.add.text(20 + barW / 2, 20 + barH / 2, `HP: ${hero.currentHealth}/${hero.getEffectiveHealth()}`, { fontSize: 14, color: '#fff' }).setOrigin(0.5, 0.5);
    this.manaBarBg = this.add.rectangle(20, 42, barW, barH, 0x333333).setOrigin(0, 0);
    this.manaBarFill = this.add.rectangle(20, 42, barW * (hero.currentMana / hero.getEffectiveMana()), barH, 0x3b82f6).setOrigin(0, 0);
    this.heroManaText = this.add.text(20 + barW / 2, 42 + barH / 2, `Mana: ${hero.currentMana}/${hero.getEffectiveMana()}`, { fontSize: 14, color: '#fff' }).setOrigin(0.5, 0.5);

    this.xpBar = createXPBar(this, 20, 64, barW, barH, hero);
    this.xpBar.update();

    this.statusEffectsText = this.add.text(20, 88, '', { fontSize: 14, color: '#e5e7eb' }).setDepth(10);

    this.combatLogText = this.add.text(w - 220, 20, '', { fontSize: 12, color: '#e5e7eb' }).setWordWrapWidth(210);
    this.combatLogText.setOrigin(0, 0);

    this.skillButtons = createSkillButtons(this, hero, (skillId) => this.useSkill(skillId));
    const inventoryButton = typeof createIconButton === 'function'
      ? createIconButton(this, w - 80, h - 40, 'inventory-icon', 'Inventory', () => this.openInventoryScene(), {
          size: 52,
          tooltipY: h - 82,
        })
      : null;
    if (!inventoryButton) {
      const invBtn = this.add.rectangle(w - 80, h - 40, 120, 44, 0x475569);
      invBtn.setInteractive({ useHandCursor: true });
      this.add.text(w - 80, h - 40, 'Inventory', { fontSize: 16, color: '#fff' }).setOrigin(0.5);
      invBtn.on('pointerdown', () => this.openInventoryScene());
    }

    const fleeButton = typeof createIconButton === 'function'
      ? createIconButton(this, w - 80, h - 95, 'flee-icon', 'Flee', () => this.showFleeConfirmModal(), {
          size: 52,
          tooltipY: h - 137,
        })
      : null;
    if (!fleeButton) {
      const fleeBtn = this.add.rectangle(w - 80, h - 95, 120, 40, 0x7f1d1d);
      fleeBtn.setInteractive({ useHandCursor: true });
      this.add.text(w - 80, h - 95, 'Flee', { fontSize: 14, color: '#fecaca' }).setOrigin(0.5);
      fleeBtn.on('pointerdown', () => this.showFleeConfirmModal());
    }

    if (GAME_STATE.reaperFight) {
      this.showReaperPopup();
    }
    this.updateStatusEffects();
  }

  showReaperPopup() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const box = this.add.rectangle(w / 2, h / 2, 380, 160, 0x1e293b);
    const t1 = this.add.text(w / 2, h / 2 - 55, 'The Reaper', { fontSize: 22, color: '#f87171' }).setOrigin(0.5);
    const t2 = this.add.text(w / 2, h / 2 - 25, 'Death has found you. You are frightened.', { fontSize: 14, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(340);
    const t3 = this.add.text(w / 2, h / 2 + 5, 'Your strength is halved and your evasion is lost.', { fontSize: 14, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(340);
    const fightBtn = this.add.rectangle(w / 2, h / 2 + 45, 100, 36, 0x475569);
    fightBtn.setInteractive({ useHandCursor: true });
    const t4 = this.add.text(w / 2, h / 2 + 45, 'Fight', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    fightBtn.on('pointerdown', () => {
      [box, t1, t2, t3, fightBtn, t4].forEach(o => o.destroy && o.destroy());
    });
  }

  showFleeConfirmModal() {
    if (this.turnState !== 'playerTurn') return;
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const goldLost = Math.floor((this.hero.gold || 0) * 0.5);
    const box = this.add.rectangle(w / 2, h / 2, 400, 140, 0x1e293b);
    const t1 = this.add.text(w / 2, h / 2 - 45, 'Flee?', { fontSize: 20, color: '#fbbf24' }).setOrigin(0.5);
    const t2 = this.add.text(w / 2, h / 2 - 15, 'If you flee, you will lose 50% of your gold (' + goldLost + ' gold) and 2 random inventory items.', { fontSize: 13, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(360);
    const cancelBtn = this.add.rectangle(w / 2 - 70, h / 2 + 35, 100, 36, 0x475569);
    cancelBtn.setInteractive({ useHandCursor: true });
    const cancelTxt = this.add.text(w / 2 - 70, h / 2 + 35, 'Cancel', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    const fleeConfirmBtn = this.add.rectangle(w / 2 + 70, h / 2 + 35, 100, 36, 0x7f1d1d);
    fleeConfirmBtn.setInteractive({ useHandCursor: true });
    const fleeTxt = this.add.text(w / 2 + 70, h / 2 + 35, 'Flee', { fontSize: 14, color: '#fecaca' }).setOrigin(0.5);
    const all = [box, t1, t2, cancelBtn, cancelTxt, fleeConfirmBtn, fleeTxt];
    const destroyAll = () => all.forEach(o => o.destroy && o.destroy());
    cancelBtn.on('pointerdown', destroyAll);
    fleeConfirmBtn.on('pointerdown', () => {
      destroyAll();
      if (typeof playGameMusicLoop === 'function') playGameMusicLoop(this);
      this.doFlee();
    });
  }

  doFlee() {
    if (this.turnState !== 'playerTurn') return;
    InventorySystem.ensureSlotBased(this.hero);
    const goldLost = Math.floor((this.hero.gold || 0) * 0.5);
    const itemLostNames = [];
    const slotPool = [...this.hero.inventory];
    const itemsToLose = Math.min(2, slotPool.length);
    for (let i = 0; i < itemsToLose; i++) {
      const randomIndex = Math.floor(Math.random() * slotPool.length);
      const slot = slotPool.splice(randomIndex, 1)[0];
      if (!slot) continue;
      const item = ITEMS[slot.itemId];
      const removed = InventorySystem.removeSlotById(this.hero, slot.id);
      if (removed) {
        itemLostNames.push(item ? item.name : slot.itemId);
      }
    }
    this.hero.gold = Math.max(0, this.hero.gold - goldLost);
    this.hero.reaperFrightened = false;
    GAME_STATE.reaperFight = false;
    GAME_STATE.forcedEncounter = null;
    GAME_STATE.currentLevelId = null;
    GAME_STATE.currentFightIndex = 0;
    this.hero.battleDefenseBonus = 0;
    this.hero.battleEvasionChance = 0;
    this.hero.blockReflectRounds = 0;
    this.hero.flameAuraRounds = 0;
    GAME_STATE.fledGoldLost = goldLost;
    GAME_STATE.fledItemLostNames = itemLostNames;
    this.scene.start('Overworld');
  }

  openInventoryScene() {
    this.scene.pause();
    this.scene.launch('InventoryOverworld', {
      returnSceneKey: 'Combat',
      returnMode: 'resume',
    });
  }

  getEnemyClickSkillId() {
    if (this.selectedSkillId) return this.selectedSkillId;
    return typeof getDefaultZeroManaSkillId === 'function'
      ? getDefaultZeroManaSkillId(this.hero)
      : null;
  }

  onEnemyClicked(enemyIndex) {
    if (this.turnState !== 'playerTurn') return;
    const enemy = this.enemies[enemyIndex];
    if (!enemy || enemy.hp <= 0) return;
    const skillId = this.getEnemyClickSkillId();
    if (!skillId) return;
    this.selectedSkillId = null;
    this.clearTargetMode();
    this.applySingleTargetSkill(skillId, enemyIndex);
  }

  clearTargetMode() {
    if (this.targetHintText) { this.targetHintText.destroy(); this.targetHintText = null; }
    if (this.cancelTargetBtn) { this.cancelTargetBtn.destroy(); this.cancelTargetBtn = null; }
    if (this.cancelTargetTxt) { this.cancelTargetTxt.destroy(); this.cancelTargetTxt = null; }
    if (this.skillButtons && this.skillButtons.setEnabled) this.skillButtons.setEnabled(true);
  }

  endPlayerTurn() {
    this.updateBars();
    this.turnState = 'enemyTurn';
    if (this.skillButtons && this.skillButtons.setEnabled) this.skillButtons.setEnabled(false);
    this.time.delayedCall(700, () => this.doEnemyTurn(), [], this);
  }

  playHeroAnimThen(sheetKey, animKey, callback) {
    if (this.heroSprite && this.anims.exists(animKey)) {
      this.heroSprite.stop();
      this.heroSprite.setTexture(sheetKey);
      this.heroSprite.play(animKey);
      const anim = this.anims.get(animKey);
      const durationMs = anim && anim.frames && anim.frames.length ? (anim.frames.length / (anim.frameRate || 24)) * 1000 : 600;
      this.time.delayedCall(durationMs, callback, [], this);
    } else {
      callback();
    }
  }

  applySingleTargetSkill(skillId, enemyIndex) {
    const skill = getSkill(this.hero, skillId);
    if (!skill || this.hero.currentMana < skill.manaCost) return;
    const enemy = this.enemies[enemyIndex];
    if (!enemy || enemy.hp <= 0) return;
    this.hero.currentMana -= skill.manaCost;

    if (this.heroSprite) {
      if (skillId === 'slash' && this.anims.exists('hero_slash')) {
        this.heroSprite.stop();
        this.heroSprite.setTexture('hero_slash_sheet');
        this.heroSprite.play('hero_slash');
      } else if (skillId === 'heavyStrike' && this.anims.exists('hero_heavy_strike')) {
        this.heroSprite.stop();
        this.heroSprite.setTexture('hero_heavy_strike_sheet');
        this.heroSprite.play('hero_heavy_strike');
      } else if (skillId === 'execute' && this.anims.exists('hero_execute')) {
        this.heroSprite.stop();
        this.heroSprite.setTexture('hero_execute_sheet');
        this.heroSprite.play('hero_execute');
      }
    }

    const damage = CombatSystem.dealDamage(this.hero, enemy, skillId);
    if (damage > 0 && typeof playSfx === 'function') playSfx(this, 'damage-dealt-and-received');
    this.logCombat((skill ? skill.name : 'Attack') + ' on ' + enemy.name + '. ' + damage + ' damage.');
    this.shakeSprite(this.enemySprites[enemyIndex], () => {});
    this.showDamageNumber(this.enemySprites[enemyIndex].x, this.enemySprites[enemyIndex].y, damage);
    this.updateBars();
    DurabilitySystem.weaponUse(this.hero);
    if (GAME_STATE.lastBrokenItemName) {
      this.showBreakPopup();
    }
    if (this.areAllEnemiesDead()) {
      this.onCombatWin();
      return;
    }
    this.clearTargetMode();
    this.endPlayerTurn();
  }

  areAllEnemiesDead() {
    return this.enemies.every(e => e.hp <= 0);
  }

  shakeSprite(sprite, onComplete) {
    if (!sprite) { if (onComplete) onComplete(); return; }
    const startX = sprite.x;
    this.tweens.add({
      targets: sprite,
      x: startX - 8,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        sprite.x = startX;
        if (onComplete) onComplete();
      },
    });
  }

  showDamageNumber(x, y, amount) {
    const text = this.add.text(x, y - 30, `-${amount}`, { fontSize: 22, color: '#ef4444' }).setOrigin(0.5);
    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy(),
    });
  }

  useSkill(skillId) {
    if (this.turnState !== 'playerTurn') return;
    const skill = getSkill(this.hero, skillId);
    if (!skill || this.hero.currentMana < skill.manaCost) return;
    const living = this.enemies.filter(e => e.hp > 0);
    if (living.length === 0) return;

    if (skill.isHeal) {
      this.hero.currentMana -= skill.manaCost;
      const healAmount = typeof getSkillHealAmount === 'function'
        ? getSkillHealAmount(this.hero, skill)
        : (skill.healValue != null ? skill.healValue : 0);
      this.hero.currentHealth = Math.min(this.hero.getEffectiveHealth(), this.hero.currentHealth + healAmount);
      this.logCombat(skill.name + '. Healed ' + healAmount + ' HP.');
      // Healing animation only for Warrior (Holy Light); Sorceress (Arcane Heal) uses different sprites.
      if (skillId !== 'arcaneHeal') {
        this.playHeroAnimThen('hero_healing_sheet', 'hero_healing', () => this.endPlayerTurn());
      } else {
        this.endPlayerTurn();
      }
      return;
    }

    if (skill.battleDefenseBonus != null && skill.battleEvasionChance != null) {
      this.hero.currentMana -= skill.manaCost;
      this.hero.battleDefenseBonus = Math.max(this.hero.battleDefenseBonus || 0, skill.battleDefenseBonus);
      this.hero.battleEvasionChance = Math.max(this.hero.battleEvasionChance || 0, skill.battleEvasionChance);
      this.logCombat(
        skill.name +
        '. +' + skill.battleDefenseBonus +
        ' Def, ' + Math.round((skill.battleEvasionChance || 0) * 100) +
        '% Evasion this battle.'
      );
      if (this.hero.getEvasionChance && this.hero.getEvasionChance() >= 0.95) {
        this.logCombat('Max evasion (95%) reached.');
      }
      if (skillId === 'ironEvasion') {
        this.playHeroAnimThen('hero_iron_evasion_sheet', 'hero_iron_evasion', () => this.endPlayerTurn());
      } else {
        this.endPlayerTurn();
      }
      return;
    }

    if (skill.battleDefenseBonus != null) {
      this.hero.currentMana -= skill.manaCost;
      this.hero.battleDefenseBonus = skill.battleDefenseBonus;
      this.logCombat(skill.name + '. +' + skill.battleDefenseBonus + ' Def this battle.');
      if (skillId === 'ironSkin') {
        this.playHeroAnimThen('hero_iron_skin_sheet', 'hero_iron_skin', () => this.endPlayerTurn());
      } else {
        this.endPlayerTurn();
      }
      return;
    }

    if (skill.dotRounds != null) {
      this.hero.currentMana -= skill.manaCost;
      this.hero.flameAuraRounds = skill.dotRounds;
      this.logCombat(skill.name + '. DoT for ' + skill.dotRounds + ' rounds.');
      this.endPlayerTurn();
      return;
    }

    if (skill.battleEvasionChance != null) {
      this.hero.currentMana -= skill.manaCost;
      this.hero.battleEvasionChance = Math.min(1, (this.hero.battleEvasionChance || 0) + skill.battleEvasionChance);
      this.logCombat(skill.name + '. +' + Math.round((skill.battleEvasionChance || 0) * 100) + '% Evasion.');
      if (this.hero.getEvasionChance && this.hero.getEvasionChance() >= 0.95) {
        this.logCombat('Max evasion (95%) reached.');
      }
      if (skillId === 'evasion') {
        this.playHeroAnimThen('hero_evade_sheet', 'hero_evade', () => this.endPlayerTurn());
      } else {
        this.endPlayerTurn();
      }
      return;
    }

    if (skill.blockReflectRounds != null) {
      this.hero.currentMana -= skill.manaCost;
      this.hero.blockReflectRounds = skill.blockReflectRounds;
      this.logCombat(skill.name + '. Block and reflect for ' + skill.blockReflectRounds + ' turns.');
      if (skillId === 'thorncape') {
        this.playHeroAnimThen('hero_thorncape_sheet', 'hero_thorncape', () => this.endPlayerTurn());
      } else {
        this.endPlayerTurn();
      }
      return;
    }

    if (skill.isAoe) {
      this.hero.currentMana -= skill.manaCost;
      const runAoeEffects = () => {
        const damages = CombatSystem.dealDamageToAll(this.hero, this.enemies, skillId);
        let totalDamage = 0;
        for (let i = 0; i < this.enemies.length; i++) {
          if (damages[i] != null) totalDamage += damages[i];
          if (damages[i] != null && this.enemySprites[i]) {
            this.shakeSprite(this.enemySprites[i], () => {});
            this.showDamageNumber(this.enemySprites[i].x, this.enemySprites[i].y, damages[i]);
          }
        }
        if (totalDamage > 0 && typeof playSfx === 'function') playSfx(this, 'damage-dealt-and-received');
        if (skill.lifeSteal && totalDamage > 0) {
          this.hero.currentHealth = Math.min(this.hero.getEffectiveHealth(), this.hero.currentHealth + totalDamage);
        }
        this.logCombat(skill.name + ' (AoE). ' + totalDamage + ' total damage.');
        this.updateBars();
        if (!skill.lifeSteal) DurabilitySystem.weaponUse(this.hero);
        if (GAME_STATE.lastBrokenItemName) {
          this.showBreakPopup();
        }
        if (this.areAllEnemiesDead()) {
          this.onCombatWin();
          return;
        }
        this.endPlayerTurn();
      };
      if (skillId === 'whirlwind') {
        this.playHeroAnimThen('hero_whirlwind_sheet', 'hero_whirlwind', runAoeEffects);
      } else if (skillId === 'lifeDrain') {
        this.playHeroAnimThen('hero_life_drain_sheet', 'hero_life_drain', runAoeEffects);
      } else {
        runAoeEffects();
      }
      return;
    }

    const livingCount = this.enemies.filter(e => e.hp > 0).length;
    if (livingCount === 1) {
      const idx = this.enemies.findIndex(e => e.hp > 0);
      this.applySingleTargetSkill(skillId, idx);
      return;
    }
    this.selectedSkillId = skillId;
    if (this.skillButtons && this.skillButtons.setEnabled) this.skillButtons.setEnabled(false);
    this.targetHintText = this.add.text(CONFIG.WIDTH / 2, 100, 'Click an enemy to target', { fontSize: 16, color: '#fbbf24' }).setOrigin(0.5);
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    this.cancelTargetBtn = this.add.rectangle(w / 2, h - 100, 120, 40, 0x64748b);
    this.cancelTargetBtn.setInteractive({ useHandCursor: true });
    this.cancelTargetTxt = this.add.text(w / 2, h - 100, 'Cancel', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    this.cancelTargetBtn.on('pointerdown', () => {
      this.selectedSkillId = null;
      this.clearTargetMode();
    });
  }

  doEnemyTurn() {
    if (!this.enemies || this.enemies.length === 0) {
      this.onCombatWin();
      return;
    }
    const living = this.enemies.filter(e => e.hp > 0);
    if (living.length === 0) {
      this.onCombatWin();
      return;
    }
    if (CombatSystem.isHeroDead(this.hero)) return;
    this.enemyTurnUsedInvulnerability = false;

    const isSingleReaper = this.enemies.length === 1 && this.enemies[0].name === 'The Reaper' && this.enemies[0].hp > 0;
    const reaperSprite = this.enemySprites[0];
    if (isSingleReaper && this.anims.exists('reaper_attack') && reaperSprite && typeof reaperSprite.play === 'function') {
      reaperSprite.stop();
      reaperSprite.setTexture('reaper_attack_sheet');
      reaperSprite.play('reaper_attack');
      reaperSprite.once('animationcomplete', () => {
        const totalDamage = this.applyEnemyTurnDamage();
        reaperSprite.setTexture('reaper_idle_sheet');
        reaperSprite.play('reaper_idle');
        this.finishEnemyTurn(totalDamage);
      });
      return;
    }

    const reflecting = (this.hero.blockReflectRounds || 0) > 0;
    this.processEnemyAttacks(0, 0, reflecting);
  }

  applySingleEnemyAttack(enemyIndex, result, reflecting) {
    const enemy = this.enemies[enemyIndex];
    if (reflecting) {
      if (result.invulnerable) {
        this.logCombat(enemy.name + ' attacks. Avoid Death Potion blocked it.');
        return 0;
      }
      if (!result.evaded && result.damage > 0) {
        if (typeof playSfx === 'function') playSfx(this, 'damage-dealt-and-received');
        enemy.hp = Math.max(0, enemy.hp - result.damage);
        if (this.enemySprites[enemyIndex]) {
          this.shakeSprite(this.enemySprites[enemyIndex], () => {});
          this.showDamageNumber(this.enemySprites[enemyIndex].x, this.enemySprites[enemyIndex].y, result.damage);
        }
        this.logCombat(enemy.name + ' attacks. Reflected ' + result.damage + ' damage.');
      } else {
        this.logCombat(enemy.name + ' attacks. Dodged!');
      }
      return 0;
    }
    if (result.invulnerable) {
      this.enemyTurnUsedInvulnerability = true;
      this.logCombat(enemy.name + ' attacks. Avoid Death Potion blocked it.');
      return 0;
    }
    if (!result.evaded) {
      if (result.damage > 0 && typeof playSfx === 'function') playSfx(this, 'damage-dealt-and-received');
      this.hero.currentHealth = Math.max(0, this.hero.currentHealth - result.damage);
      DurabilitySystem.armorHit(this.hero);
      this.logCombat(enemy.name + ' attacks. ' + result.damage + ' damage.');
      return result.damage;
    }
    this.logCombat(enemy.name + ' attacks. Dodged!');
    return 0;
  }

  processEnemyAttacks(i, totalSoFar, reflecting) {
    if (i >= this.enemies.length) {
      if (reflecting) this.hero.blockReflectRounds = Math.max(0, (this.hero.blockReflectRounds || 0) - 1);
      this.finishEnemyTurn(totalSoFar);
      return;
    }
    const enemy = this.enemies[i];
    if (enemy.hp <= 0) {
      this.processEnemyAttacks(i + 1, totalSoFar, reflecting);
      return;
    }
    const result = CombatSystem.getEnemyAttackDamage(enemy, this.hero);
    const sprite = this.enemySprites[i];
    const isVampireBossWithAnim = this.isVampireBossEnemy(enemy) && this.anims.exists('vampire_attack') && sprite && typeof sprite.play === 'function';
    const isSkeletonWithAnim = enemy.goonType === 'skeleton' && this.anims.exists('skeleton_attack') && sprite && typeof sprite.play === 'function';
    const isBatWithAnim = enemy.goonType === 'bat' && this.anims.exists('bat_attack') && sprite && typeof sprite.play === 'function';
    const isImpWithAnim = enemy.goonType === 'imp' && this.anims.exists('imp_attack') && sprite && typeof sprite.play === 'function';

    if (isVampireBossWithAnim) {
      sprite.stop();
      sprite.setTexture('vampire_attack_sheet');
      sprite.play('vampire_attack');
      const self = this;
      sprite.once('animationcomplete', () => {
        const dmg = self.applySingleEnemyAttack(i, result, reflecting);
        sprite.setTexture('vampire_idle_sheet');
        sprite.play('vampire_idle');
        self.processEnemyAttacks(i + 1, totalSoFar + dmg, reflecting);
      });
    } else if (isSkeletonWithAnim) {
      sprite.stop();
      sprite.setTexture('skeleton_attack_sheet');
      sprite.play('skeleton_attack');
      const self = this;
      sprite.once('animationcomplete', () => {
        const dmg = self.applySingleEnemyAttack(i, result, reflecting);
        sprite.setTexture('skeleton_idle_sheet');
        sprite.play('skeleton_idle');
        self.processEnemyAttacks(i + 1, totalSoFar + dmg, reflecting);
      });
    } else if (isBatWithAnim) {
      sprite.stop();
      sprite.setTexture('bat_attack_sheet');
      sprite.play('bat_attack');
      const self = this;
      sprite.once('animationcomplete', () => {
        const dmg = self.applySingleEnemyAttack(i, result, reflecting);
        sprite.setTexture('bat_idle_sheet');
        sprite.play('bat_idle');
        self.processEnemyAttacks(i + 1, totalSoFar + dmg, reflecting);
      });
    } else if (isImpWithAnim) {
      sprite.stop();
      sprite.setTexture('imp_attack_sheet');
      sprite.play('imp_attack');
      const self = this;
      sprite.once('animationcomplete', () => {
        const dmg = self.applySingleEnemyAttack(i, result, reflecting);
        sprite.setTexture('imp_idle_sheet');
        sprite.play('imp_idle');
        self.processEnemyAttacks(i + 1, totalSoFar + dmg, reflecting);
      });
    } else {
      const dmg = this.applySingleEnemyAttack(i, result, reflecting);
      this.processEnemyAttacks(i + 1, totalSoFar + dmg, reflecting);
    }
  }

  applyEnemyTurnDamage() {
    let totalDamage = 0;
    const reflecting = (this.hero.blockReflectRounds || 0) > 0;
    this.enemyTurnUsedInvulnerability = false;
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (enemy.hp <= 0) continue;
      const result = CombatSystem.getEnemyAttackDamage(enemy, this.hero);
      if (reflecting) {
        if (result.invulnerable) {
          this.logCombat(enemy.name + ' attacks. Avoid Death Potion blocked it.');
          continue;
        }
        if (!result.evaded && result.damage > 0) {
          if (typeof playSfx === 'function') playSfx(this, 'damage-dealt-and-received');
          enemy.hp = Math.max(0, enemy.hp - result.damage);
          if (this.enemySprites[i]) {
            this.shakeSprite(this.enemySprites[i], () => {});
            this.showDamageNumber(this.enemySprites[i].x, this.enemySprites[i].y, result.damage);
          }
          this.logCombat(enemy.name + ' attacks. Reflected ' + result.damage + ' damage.');
        } else {
          this.logCombat(enemy.name + ' attacks. Dodged!');
        }
      } else {
        if (result.invulnerable) {
          this.enemyTurnUsedInvulnerability = true;
          this.logCombat(enemy.name + ' attacks. Avoid Death Potion blocked it.');
          continue;
        }
        if (!result.evaded) {
          if (result.damage > 0 && typeof playSfx === 'function') playSfx(this, 'damage-dealt-and-received');
          this.hero.currentHealth = Math.max(0, this.hero.currentHealth - result.damage);
          totalDamage += result.damage;
          DurabilitySystem.armorHit(this.hero);
        }
        this.logCombat(enemy.name + ' attacks. ' + (result.damage > 0 ? result.damage + ' damage.' : 'Dodged!'));
      }
    }
    if (reflecting) this.hero.blockReflectRounds = Math.max(0, (this.hero.blockReflectRounds || 0) - 1);
    return totalDamage;
  }

  finishEnemyTurn(totalDamage) {
    const reflecting = (this.hero.blockReflectRounds || 0) > 0;
    this.shakeSprite(this.heroSprite, () => {});
    if (totalDamage > 0) {
      this.showDamageNumber(this.heroSprite.x, this.heroSprite.y, totalDamage);
    } else if (this.enemyTurnUsedInvulnerability) {
      const txt = this.add.text(this.heroSprite.x, this.heroSprite.y - 30, 'Invulnerable!', { fontSize: 18, color: '#fde68a' }).setOrigin(0.5);
      this.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, duration: 500, onComplete: () => txt.destroy() });
    } else if (!reflecting) {
      const txt = this.add.text(this.heroSprite.x, this.heroSprite.y - 30, 'Dodged!', { fontSize: 18, color: '#94a3b8' }).setOrigin(0.5);
      this.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, duration: 500, onComplete: () => txt.destroy() });
    }
    if ((this.hero.invulnerableRounds || 0) > 0) {
      this.hero.invulnerableRounds = Math.max(0, (this.hero.invulnerableRounds || 0) - 1);
    }
    this.updateBars();
    if (GAME_STATE.lastBrokenItemName) this.showBreakPopup();
    if (CombatSystem.isHeroDead(this.hero)) {
      this.onCombatLose();
      return;
    }
    this.startOfPlayerTurn();
  }

  startOfPlayerTurn() {
    this.clearTargetMode();
    if (this.hero.flameAuraRounds > 0) {
      const weaponDamageMult = this.hero.getWeaponDamageMultiplier ? this.hero.getWeaponDamageMultiplier() : 1;
      const dmg = Math.floor((this.hero.getIntelligence ? this.hero.getIntelligence() : 0) * 1.0 * weaponDamageMult);
      const living = this.enemies.filter(e => e.hp > 0);
      for (let i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].hp > 0) {
          this.enemies[i].hp = Math.max(0, this.enemies[i].hp - dmg);
          if (this.enemySprites[i]) {
            this.shakeSprite(this.enemySprites[i], () => {});
            this.showDamageNumber(this.enemySprites[i].x, this.enemySprites[i].y, dmg);
          }
        }
      }
      if (dmg > 0 && typeof playSfx === 'function') playSfx(this, 'damage-dealt-and-received');
      this.logCombat('Flame Aura tick. ' + dmg + ' damage to all.');
      this.hero.flameAuraRounds = this.hero.flameAuraRounds - 1;
      this.updateBars();
      if (this.areAllEnemiesDead()) {
        this.onCombatWin();
        return;
      }
    }
    this.turnState = 'playerTurn';
    if (this.skillButtons && this.skillButtons.setEnabled) this.skillButtons.setEnabled(true);
  }

  showBreakPopup() {
    const name = GAME_STATE.lastBrokenItemName || 'Item';
    GAME_STATE.lastBrokenItemName = null;
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const box = this.add.rectangle(w / 2, h / 2, 340, 100, 0x1e293b);
    const msg = this.add.text(w / 2, h / 2 - 20, name + ' broke! Visit Inventory to equip another.', { fontSize: 14, color: '#fbbf24' }).setOrigin(0.5);
    const okBtn = this.add.rectangle(w / 2, h / 2 + 24, 80, 36, 0x475569);
    okBtn.setInteractive({ useHandCursor: true });
    const okTxt = this.add.text(w / 2, h / 2 + 24, 'OK', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    okBtn.on('pointerdown', () => {
      box.destroy();
      msg.destroy();
      okBtn.destroy();
      okTxt.destroy();
      this.updateBars();
    });
  }

  onInventoryItemClick(slot) {
    const item = ITEMS[slot.itemId];
    if (!item) return;
    if (item.type === 'potion') {
      InventorySystem.usePotion(this.hero, slot.itemId);
    } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
      if (item.type === 'accessory' && typeof this.hero.isAccessoryEquipped === 'function' && this.hero.isAccessoryEquipped(slot.id)) {
        InventorySystem.unequip(this.hero, 'accessory', slot.id);
      } else if (item.type !== 'accessory' && this.hero[item.type] === slot.id) {
        InventorySystem.unequip(this.hero, item.type);
      } else {
        InventorySystem.equip(this.hero, slot.id);
      }
    }
    this.playCurrentHeroIdle();
    this.updateBars();
  }

  logCombat(msg) {
    this.combatLogLines.push(msg);
    if (this.combatLogLines.length > this.combatLogMaxLines) this.combatLogLines.shift();
    if (this.combatLogText) this.combatLogText.setText(this.combatLogLines.join('\n'));
  }

  updateStatusEffects() {
    const parts = [];
    if (this.hero.battleDefenseBonus > 0) parts.push('Def +' + this.hero.battleDefenseBonus);
    if ((this.hero.battleEvasionChance || 0) > 0) parts.push('Evasion ' + Math.round(this.hero.battleEvasionChance * 100) + '%');
    if ((this.hero.flameAuraRounds || 0) > 0) parts.push('Flame Aura ' + this.hero.flameAuraRounds + 'r');
    if ((this.hero.blockReflectRounds || 0) > 0) parts.push('Reflect ' + this.hero.blockReflectRounds + 'r');
    if ((this.hero.invulnerableRounds || 0) > 0) parts.push('Invulnerable ' + this.hero.invulnerableRounds + 'r');
    if (this.hero.reaperFrightened) parts.push('Frightened');
    this.statusEffectsText.setText(parts.length ? parts.join(' | ') : '');
  }

  updateBars() {
    const maxHp = this.hero.getEffectiveHealth();
    const maxMana = this.hero.getEffectiveMana();
    const barW = 200;
    const barH = 20;
    const hpRatio = maxHp > 0 ? this.hero.currentHealth / maxHp : 0;
    const manaRatio = maxMana > 0 ? this.hero.currentMana / maxMana : 0;
    this.hpBarFill.width = barW * hpRatio;
    this.manaBarFill.width = barW * manaRatio;
    this.heroHpText.setText(`HP: ${this.hero.currentHealth}/${maxHp}`);
    this.heroManaText.setText(`Mana: ${this.hero.currentMana}/${maxMana}`);
    this.updateStatusEffects();
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemyHpTexts[i].setText(`HP: ${this.enemies[i].hp}/${this.enemies[i].maxHp}`);
      const dead = this.enemies[i].hp <= 0;
      this.enemySprites[i].setVisible(!dead);
      this.enemyHpTexts[i].setVisible(!dead);
      if (this.enemyNameTexts[i]) this.enemyNameTexts[i].setVisible(!dead);
      if (dead) {
        this.enemySprites[i].removeInteractive();
        this.enemySprites[i].setDepth(-10);
        this.enemyHpTexts[i].setDepth(-10);
        if (this.enemyNameTexts[i]) this.enemyNameTexts[i].setDepth(-10);
      }
    }
    if (this.xpBar) this.xpBar.update();
    if (this.skillButtons) this.skillButtons.update();
  }

  onCombatWin() {
    this.justWonReaperFight = this.enemies.length === 1 && this.enemies[0] && this.enemies[0].name === 'The Reaper';
    this.hero.battleDefenseBonus = 0;
    this.hero.battleEvasionChance = 0;
    this.hero.flameAuraRounds = 0;
    this.hero.blockReflectRounds = 0;
    this.hero.invulnerableRounds = 0;
    this.hero.reaperFrightened = false;
    GAME_STATE.reaperFight = false;
    const wasForcedEncounter = !!this.forcedEncounter;
    GAME_STATE.forcedEncounter = null;
    if (typeof playGameMusicLoop === 'function') playGameMusicLoop(this);

    if (wasForcedEncounter) {
      GAME_STATE.currentLevelId = null;
      GAME_STATE.currentFightIndex = 0;
      GAME_STATE.pendingLootItemId = this.justWonReaperFight ? 'avoid-death-potion' : null;
      GAME_STATE.goldEarned = 0;
      this.scene.start(this.justWonReaperFight ? 'Loot' : 'Overworld');
      return;
    }

    const levelJustCompleted = this.fightIndex + 1 >= this.level.fights.length;
    if (levelJustCompleted) GAME_STATE.levelJustCompleted = true;

    let totalXp = 0;
    let totalGold = 0;
    for (const enemy of this.enemies) {
      totalXp += enemy.isBoss ? CONFIG.XP_BOSS : CONFIG.XP_GOON;
      totalGold += enemy.isBoss
        ? CONFIG.GOLD_BOSS_BASE + this.level.levelIndex * CONFIG.GOLD_BOSS_PER_LEVEL
        : CONFIG.GOLD_GOON_BASE + this.level.levelIndex * CONFIG.GOLD_GOON_PER_LEVEL;
    }
    this.hero.gold += totalGold;
    GAME_STATE.goldEarned = totalGold;

    const leveledUp = ProgressionSystem.giveXP(this.hero, totalXp);
    if (leveledUp) {
      const choices = ProgressionSystem.getChoicesForLevel(this.hero.level);
      if (choices.length > 0) {
        GAME_STATE.pendingLevelUp = true;
        this.scene.start('SkillTree', { from: 'combat', isBossFight: this.isBossFight });
        return;
      }
    }
    this.goToLoot();
  }

  goToLoot() {
    GAME_STATE.pendingLootItemId = this.justWonReaperFight
      ? 'avoid-death-potion'
      : LootSystem.rollLoot(this.isBossFight, this.hero ? this.hero.class : 'warrior');
    this.scene.start('Loot');
  }

  onCombatLose() {
    if (this.hero) {
      this.hero.battleDefenseBonus = 0;
      this.hero.battleEvasionChance = 0;
      this.hero.blockReflectRounds = 0;
      this.hero.invulnerableRounds = 0;
      this.hero.reaperFrightened = false;
    }
    GAME_STATE.reaperFight = false;
    GAME_STATE.forcedEncounter = null;
    if (typeof stopAllMusic === 'function') stopAllMusic(this);
    if (typeof playMusicOnce === 'function') playMusicOnce(this, 'game-over');
    const runPoints = GAME_STATE.points || 0;
    addTotalPoints(runPoints);
    this.scene.start('RunEnded', { runPoints, title: 'Game Over' });
  }

  shutdown() {
    if (this.hero) {
      this.hero.battleDefenseBonus = 0;
      this.hero.battleEvasionChance = 0;
      this.hero.flameAuraRounds = 0;
      this.hero.blockReflectRounds = 0;
      this.hero.invulnerableRounds = 0;
      this.hero.reaperFrightened = false;
    }
    GAME_STATE.reaperFight = false;
    if (this.skillButtons) this.skillButtons.destroy();
    if (this.xpBar) this.xpBar.destroy();
    if (this.inventoryPanel) this.inventoryPanel.destroy();
    if (this.statusEffectsText) this.statusEffectsText.destroy();
    if (this.combatLogText) this.combatLogText.destroy();
    this.clearTargetMode();
    if (this.enemySprites) this.enemySprites.forEach(s => s.destroy && s.destroy());
    if (this.enemyHpTexts) this.enemyHpTexts.forEach(t => t.destroy && t.destroy());
  }
}
