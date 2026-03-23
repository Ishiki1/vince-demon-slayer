/**
 * CombatScene.js
 * Turn-based fight: Vince vs one or more enemies. Shake + damage numbers. Target selection for single-target skills; AoE hits all.
 */

class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Combat' });
  }

  isHeroIdleAnimKey(animKey) {
    return isHeroIdleAnimKey(animKey);
  }

  isVampireBossEnemy(enemy) {
    return isVampireBossEnemy(enemy);
  }

  getEnemyFormationLayout(enemyCount, enemyW, heroW, sceneWidth) {
    const heroCenterX = this.heroSprite ? this.heroSprite.x : CONFIG.COMBAT_HERO_X;
    return getEnemyFormationLayout(enemyCount, enemyW, heroW, sceneWidth, heroCenterX);
  }

  getHeroIdleVisual() {
    return getHeroIdleVisual(this.hero, this);
  }

  playCurrentHeroIdle() {
    if (!this.heroSprite) return;
    const heroIdleVisual = this.getHeroIdleVisual();
    if (!heroIdleVisual || typeof this.heroSprite.setTexture !== 'function' || typeof this.heroSprite.play !== 'function') return;
    const { sheetKey, animKey } = heroIdleVisual;
    this.heroSprite.setTexture(sheetKey);
    this.heroSprite.setFrame(0);
    this.heroSprite.play(animKey);
  }

  getHeroEvasionCap() {
    return CONFIG.HERO_MAX_EVASION != null ? CONFIG.HERO_MAX_EVASION : 0.9;
  }

  getDisplayedEvasionPercent() {
    if (this.hero && typeof this.hero.getEvasionChance === 'function') {
      return Math.round(this.hero.getEvasionChance() * 100);
    }
    const uncappedEvasion = this.hero ? (this.hero.battleEvasionChance || 0) : 0;
    return Math.round(Math.min(this.getHeroEvasionCap(), uncappedEvasion) * 100);
  }

  logMaxEvasionReachedIfNeeded() {
    if (!this.hero || typeof this.hero.getEvasionChance !== 'function') return;
    if (this.hero.getEvasionChance() >= this.getHeroEvasionCap()) {
      this.logCombat('Max evasion (' + Math.round(this.getHeroEvasionCap() * 100) + '%) reached.');
    }
  }

  getEnemyAnimationSet(enemy) {
    return getEnemyAnimationSet(enemy);
  }

  drawCombatBackground(w, h) {
    if (this.level && (this.level.id === 'dungeonGoon' || this.level.id === 'witchBoss')) {
      const key = 'witch-dungeon-ui-background';
      if (this.textures.exists(key)) {
        addSceneBackground(this, key, { width: w, height: h, depth: -30 });
        this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.18).setDepth(-25);
        return;
      }
    }
    const textureKey = this.level ? getLevelBackgroundTextureKey(this.level.id) : null;
    if (textureKey && this.textures.exists(textureKey)) {
      addSceneBackground(this, textureKey, { width: w, height: h, depth: -30 });
      this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.18).setDepth(-25);
      return;
    }
    this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e).setDepth(-30);
  }

  restoreEnemyIdleAnimation(enemyIndex) {
    const enemy = this.enemies[enemyIndex];
    const sprite = this.enemySprites[enemyIndex];
    const animSet = this.getEnemyAnimationSet(enemy);
    if (!enemy || !sprite || !animSet || typeof sprite.play !== 'function') return;
    if (!this.textures.exists(animSet.idleSheetKey) || !this.anims.exists(animSet.idleAnimKey)) return;
    sprite.setTexture(animSet.idleSheetKey);
    sprite.play(animSet.idleAnimKey);
  }

  playEnemyAttackAnimationThen(enemyIndex, callback) {
    const enemy = this.enemies[enemyIndex];
    const sprite = this.enemySprites[enemyIndex];
    const animSet = this.getEnemyAnimationSet(enemy);
    if (!enemy || !sprite || !animSet || typeof sprite.play !== 'function') {
      callback();
      return;
    }
    if (!this.textures.exists(animSet.attackSheetKey) || !this.anims.exists(animSet.attackAnimKey)) {
      callback();
      return;
    }
    sprite.stop();
    sprite.setTexture(animSet.attackSheetKey);
    sprite.play(animSet.attackAnimKey);
    sprite.once('animationcomplete', () => {
      this.restoreEnemyIdleAnimation(enemyIndex);
      callback();
    });
  }

  getUpcomingEnemyTurnNumber(enemy) {
    return ((enemy && enemy.turnsTaken) || 0) + 1;
  }

  markEnemyTurnTaken(enemy) {
    if (!enemy) return;
    enemy.turnsTaken = this.getUpcomingEnemyTurnNumber(enemy);
    if ((enemy.shieldRounds || 0) > 0) {
      enemy.shieldRounds--;
      if (enemy.shieldRounds <= 0) {
        enemy.shieldDefense = 0;
      }
    }
  }

  clearHeroCombatBuffs() {
    return clearHeroCombatBuffs(this.hero);
  }

  executeEnemySkill(enemyIndex, skill, callback) {
    const enemy = this.enemies[enemyIndex];
    if (!enemy || !skill) {
      callback(0);
      return;
    }
    this.enemyTurnHadUtilitySkill = true;
    if (skill.effect === 'clearHeroCombatBuffs') {
      const removedBuffs = this.clearHeroCombatBuffs();
      if (removedBuffs.length > 0) {
        this.logCombat(enemy.name + ' uses ' + skill.name + '. Removed: ' + removedBuffs.join(', ') + '.');
      } else {
        this.logCombat(enemy.name + ' uses ' + skill.name + '. But no buffs were active.');
      }
      callback(0);
      return;
    }
    if (skill.effect === 'poisonHero') {
      const rounds = skill.poisonRounds || 3;
      let dmg = Math.max(1, Math.floor(enemy.damage * (skill.poisonDamageFactor || 0.4)));
      if (skill.maxPoisonPercentHp) {
        const maxDmg = Math.max(1, Math.floor(this.hero.getEffectiveHealth() * skill.maxPoisonPercentHp));
        dmg = Math.min(dmg, maxDmg);
      }
      this.hero.poisonRounds = rounds;
      this.hero.poisonDamage = dmg;
      this.logCombat(enemy.name + ' casts Poison! ' + dmg + ' damage/turn for ' + rounds + ' turns.');
      this.updateStatusEffects();
      callback(0);
      return;
    }
    if (skill.effect === 'weakenHero') {
      const rounds = skill.weakenRounds || 2;
      const factor = skill.weakenFactor || 0.25;
      this.hero.weakenedRounds = rounds;
      this.hero.weakenedFactor = factor;
      this.logCombat(enemy.name + ' uses ' + skill.name + '! Your damage is reduced by ' + Math.round(factor * 100) + '% for ' + rounds + ' turns.');
      this.updateStatusEffects();
      callback(0);
      return;
    }
    if (skill.effect === 'vulnerableHero') {
      const rounds = skill.vulnerableRounds || 2;
      const factor = skill.vulnerableFactor || 0.25;
      this.hero.vulnerableRounds = rounds;
      this.hero.vulnerableFactor = factor;
      this.logCombat(enemy.name + ' uses ' + skill.name + '! You take ' + Math.round(factor * 100) + '% more damage for ' + rounds + ' turns.');
      this.updateStatusEffects();
      callback(0);
      return;
    }
    if (skill.effect === 'shieldEnemy') {
      const def = skill.shieldDefense || 2;
      const rounds = skill.shieldRounds || 2;
      enemy.shieldDefense = (enemy.shieldDefense || 0) + def;
      enemy.shieldRounds = rounds;
      this.logCombat(enemy.name + ' uses ' + skill.name + '! +' + def + ' defense for ' + rounds + ' turns.');
      callback(0);
      return;
    }
    if (skill.effect === 'summonBroodling') {
      const livingSummons = this.enemies.filter((e, idx) => idx > 0 && e.hp > 0).length;
      if (livingSummons >= (skill.maxSummons || 2)) {
        this.logCombat(enemy.name + ' hisses but has no room for more broodlings!');
        callback(0);
        return;
      }
      const hp = Math.max(1, Math.floor(enemy.maxHp * (skill.summonHpFactor || 0.3)));
      const dmg = Math.max(1, Math.floor(enemy.damage * (skill.summonDmgFactor || 0.6)));
      const broodling = {
        name: 'Spiderling',
        hp, maxHp: hp, damage: dmg,
        isBoss: false, goonType: 'spider',
        turnsTaken: 0, skills: [],
        levelIndex: enemy.levelIndex,
      };
      this.enemies.push(broodling);
      const w = CONFIG.WIDTH;
      const h = CONFIG.HEIGHT;
      const enemyW = CONFIG.ENEMY_SPRITE_WIDTH;
      const enemyH = CONFIG.ENEMY_SPRITE_HEIGHT;
      const heroW = CONFIG.HERO_SPRITE_DISPLAY_WIDTH;
      const spriteY = h / 2 + CONFIG.COMBAT_ROW_Y_OFFSET;
      const heroCenterX = this.heroSprite ? this.heroSprite.x : CONFIG.COMBAT_HERO_X;
      const { startX, step } = repositionEnemyFormation(
        this.enemies.length, this.enemySprites, this.enemyNameTexts, this.enemyHpTexts,
        spriteY, enemyW, enemyH, heroW, w, heroCenterX
      );
      const newIdx = this.enemies.length - 1;
      const newX = startX + newIdx * step;
      const displayObj = createEnemyDisplayObject(this, broodling, newX, spriteY, enemyW, enemyH, false);
      const nameText = this.add.text(newX, spriteY - enemyH / 2 - CONFIG.COMBAT_LABEL_OFFSET_NAME, broodling.name, { fontSize: 12, color: '#fff' }).setOrigin(0.5);
      const hpText = this.add.text(newX, spriteY - enemyH / 2 - CONFIG.COMBAT_LABEL_OFFSET_HP, 'HP: ' + hp + '/' + hp, { fontSize: 12, color: '#fff' }).setOrigin(0.5);
      displayObj.setInteractive({ useHandCursor: true });
      displayObj.on('pointerdown', () => this.onEnemyClicked(newIdx));
      this.enemySprites.push(displayObj);
      this.enemyHpTexts.push(hpText);
      this.enemyNameTexts.push(nameText);
      this.logCombat(enemy.name + ' spawns a Spiderling!');
      callback(0);
      return;
    }
    if (skill.effect === 'drainHeroMana') {
      const drain = Math.ceil(this.hero.currentMana * (skill.drainFactor || 0.15));
      this.hero.currentMana = Math.max(0, this.hero.currentMana - drain);
      this.logCombat(enemy.name + ' uses ' + skill.name + '! Drained ' + drain + ' mana.');
      if (drain > 0 && this.heroSprite) {
        const txt = this.add.text(this.heroSprite.x, this.heroSprite.y - 30, '-' + drain + ' Mana', { fontSize: 20, color: '#a78bfa' }).setOrigin(0.5);
        this.tweens.add({ targets: txt, y: txt.y - 40, alpha: 0, duration: 600, onComplete: () => txt.destroy() });
      }
      this.updateBars();
      callback(0);
      return;
    }
    callback(0);
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    applyAnimationSettings(this);
    ensureCombatAnimations(this);
    const hero = GAME_STATE.hero;
    const forcedEncounter = GAME_STATE.forcedEncounter;
    const isForcedDay10Reaper = forcedEncounter && forcedEncounter.type === 'day10Reaper';
    const isDungeonGoon = forcedEncounter && forcedEncounter.type === 'dungeonGoon';
    const isWitchBoss = forcedEncounter && forcedEncounter.type === 'witchBoss';
    let level = null;
    let fightIndex = 0;
    let fight = null;
    if (isDungeonGoon || isWitchBoss) {
      level = {
        id: isWitchBoss ? 'witchBoss' : 'dungeonGoon',
        name: isWitchBoss ? "The Witch's Lair" : 'Dungeon Encounter',
        levelIndex: Math.max(0, (hero.level || 1) - 1),
        fights: [{ slot: 0, isBoss: isWitchBoss }],
      };
      fight = level.fights[0];
    } else if (isForcedDay10Reaper) {
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

    hero.reaperSuppressEquipmentEvasion = false;
    if (isDungeonGoon) {
      const goonType = forcedEncounter.goonType || 'mushroom';
      const goon = createDungeonGoon(hero.level, goonType);
      this.enemies = [goon];
      this.isBossFight = false;
    } else if (isWitchBoss) {
      const witch = createWitch(hero.level);
      this.enemies = [witch];
      this.isBossFight = true;
    } else if (reaperAppears) {
      hero.reaperFrightened = true;
      hero.reaperSuppressEquipmentEvasion = true;
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
    hero.resetBattleState();
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
    this.enemyTurnHadUtilitySkill = false;
    this.enemyTurnWasReflecting = false;
    this.combatLogLines = [];
    this.combatLogText = null;
    this.combatLogMaxLines = 8;

    if (GAME_STATE.reaperFight) {
      stopAllMusic(this);
      playMusicOnce(this, 'reaper-appears');
    } else if (this.isBossFight) {
      if (level.id === 'level10' || level.id === 'level20') {
        playMusicLoop(this, 'boss-music');
      } else {
        playMusicLoop(this, 'generic-bossfight-music');
      }
    }

    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    this.drawCombatBackground(w, h);

    const heroW = CONFIG.HERO_SPRITE_DISPLAY_WIDTH;
    const heroH = CONFIG.HERO_SPRITE_DISPLAY_HEIGHT;
    const heroIdleVisual = this.getHeroIdleVisual();
    const spriteY = h / 2 + CONFIG.COMBAT_ROW_Y_OFFSET;
    if (heroIdleVisual) {
      this.heroSprite = this.add.sprite(CONFIG.COMBAT_HERO_X, spriteY, heroIdleVisual.sheetKey)
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
    } else {
      this.heroSprite = this.add.rectangle(CONFIG.COMBAT_HERO_X, spriteY, heroW, heroH, 0x2563eb).setOrigin(0.5, 0.5);
    }
    this.add.text(CONFIG.COMBAT_HERO_X, spriteY - heroH / 2 - 24, this.hero.name || 'Hero', { fontSize: 16, color: '#fff' }).setOrigin(0.5);

    const enemyW = CONFIG.ENEMY_SPRITE_WIDTH;
    const enemyH = CONFIG.ENEMY_SPRITE_HEIGHT;
    const enemyColor = this.isBossFight ? 0x991b1b : 0xdc2626;
    const { startX, step } = this.getEnemyFormationLayout(this.enemies.length, enemyW, heroW, w);
    for (let i = 0; i < this.enemies.length; i++) {
      const x = startX + i * step;
      const enemy = this.enemies[i];
      const displayObj = createEnemyDisplayObject(this, enemy, x, spriteY, enemyW, enemyH, this.isBossFight);
      const nameText = this.add.text(x, spriteY - enemyH / 2 - CONFIG.COMBAT_LABEL_OFFSET_NAME, enemy.name, { fontSize: 12, color: '#fff' }).setOrigin(0.5);
      const hpText = this.add.text(x, spriteY - enemyH / 2 - CONFIG.COMBAT_LABEL_OFFSET_HP, `HP: ${enemy.hp}/${enemy.maxHp}`, { fontSize: 12, color: '#fff' }).setOrigin(0.5);
      displayObj.setInteractive({ useHandCursor: true });
      const enemyIndex = i;
      displayObj.on('pointerdown', () => this.onEnemyClicked(enemyIndex));
      this.enemySprites.push(displayObj);
      this.enemyHpTexts.push(hpText);
      this.enemyNameTexts.push(nameText);
    }

    const barW = CONFIG.COMBAT_BAR_WIDTH;
    const barH = CONFIG.COMBAT_BAR_HEIGHT;
    const barX = CONFIG.COMBAT_BAR_X;
    const barY = CONFIG.COMBAT_BAR_Y;
    this.hpBarBg = this.add.rectangle(barX, barY, barW, barH, 0x333333).setOrigin(0, 0);
    this.hpBarFill = this.add.rectangle(barX, barY, barW * (hero.currentHealth / hero.getEffectiveHealth()), barH, 0xdc2626).setOrigin(0, 0);
    this.heroHpText = this.add.text(barX + barW / 2, barY + barH / 2, `HP: ${hero.currentHealth}/${hero.getEffectiveHealth()}`, { fontSize: 14, color: '#fff' }).setOrigin(0.5, 0.5);
    this.manaBarBg = this.add.rectangle(barX, CONFIG.COMBAT_BAR_MANA_Y, barW, barH, 0x333333).setOrigin(0, 0);
    this.manaBarFill = this.add.rectangle(barX, CONFIG.COMBAT_BAR_MANA_Y, barW * (hero.currentMana / hero.getEffectiveMana()), barH, 0x3b82f6).setOrigin(0, 0);
    this.heroManaText = this.add.text(barX + barW / 2, CONFIG.COMBAT_BAR_MANA_Y + barH / 2, `Mana: ${hero.currentMana}/${hero.getEffectiveMana()}`, { fontSize: 14, color: '#fff' }).setOrigin(0.5, 0.5);

    this.xpBar = createXPBar(this, barX, CONFIG.COMBAT_BAR_XP_Y, barW, barH, hero);
    this.xpBar.update();

    this.statusEffectsText = this.add.text(barX, CONFIG.COMBAT_STATUS_Y, '', { fontSize: 14, color: '#e5e7eb' }).setDepth(10);

    this.combatLogText = this.add.text(w - CONFIG.COMBAT_LOG_OFFSET_X, barY, '', { fontSize: 12, color: '#e5e7eb' }).setWordWrapWidth(CONFIG.COMBAT_LOG_WIDTH);
    this.combatLogText.setOrigin(0, 0);

    this.skillButtons = createSkillButtons(this, hero, (skillId) => this.useSkill(skillId));
    createUiIconButton(this, w - 44, h - 100, 'inventory-icon', 'Inventory', () => this.openInventoryScene(), {
      size: 52,
      tooltipY: h - 68,
      tooltipOriginY: 0,
    });
    createUiIconButton(this, w - 44, h - 156, 'flee-icon', 'Flee', () => this.showFleeConfirmModal(), {
      size: 52,
      tooltipY: h - 198,
    });

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
    const t3 = this.add.text(w / 2, h / 2 + 5, 'Your strength is halved and your equipment evasion is stripped at the start of this fight.', { fontSize: 14, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(340);
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
      playGameMusicLoop(this);
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
    this.hero.resetBattleState();
    GAME_STATE.reaperFight = false;
    GAME_STATE.forcedEncounter = null;
    GAME_STATE.currentLevelId = null;
    GAME_STATE.currentFightIndex = 0;
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
    return getDefaultZeroManaSkillId(this.hero);
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
    if (this.heroSprite && typeof this.heroSprite.stop === 'function' && typeof this.heroSprite.setTexture === 'function' && typeof this.heroSprite.play === 'function' && this.anims.exists(animKey)) {
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

    if (this.heroSprite && typeof this.heroSprite.stop === 'function' && typeof this.heroSprite.setTexture === 'function' && typeof this.heroSprite.play === 'function') {
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

    const hitResult = CombatSystem.dealDamage(this.hero, enemy, skillId);
    if (hitResult.dodged) {
      this.logCombat((skill ? skill.name : 'Attack') + ' on ' + enemy.name + '. Missed!');
      this.showMissText(this.enemySprites[enemyIndex].x, this.enemySprites[enemyIndex].y);
      this.updateBars();
      if (this.areAllEnemiesDead()) { this.onCombatWin(); return; }
      this.clearTargetMode();
      this.endPlayerTurn();
      return;
    }
    let damage = hitResult.damage;
    if (this.hero.doubletapActive) {
      enemy.hp = Math.max(0, enemy.hp - damage);
      damage = damage * 2;
      this.hero.doubletapActive = false;
      this.logCombat('Doubletap! Damage doubled!');
    }
    if ((this.hero.weakenedRounds || 0) > 0 && damage > 0) {
      const reduction = Math.floor(damage * (this.hero.weakenedFactor || 0));
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + reduction);
      damage -= reduction;
    }
    if (damage > 0) playSfx(this, 'damage-dealt-and-received');
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

  showMissText(x, y) {
    const txt = this.add.text(x, y - 30, 'Miss!', { fontSize: 20, color: '#94a3b8' }).setOrigin(0.5);
    this.tweens.add({
      targets: txt,
      y: txt.y - 40,
      alpha: 0,
      duration: 600,
      onComplete: () => txt.destroy(),
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
      const healAmount = getSkillHealAmount(this.hero, skill);
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
      this.hero.battleDefenseBonus = (this.hero.battleDefenseBonus || 0) + skill.battleDefenseBonus;
      this.hero.battleEvasionChance = (this.hero.battleEvasionChance || 0) + skill.battleEvasionChance;
      this.logCombat(
        skill.name +
        '. +' + skill.battleDefenseBonus +
        ' Def, ' + Math.round((skill.battleEvasionChance || 0) * 100) +
        '% Evasion this battle. Total: Def +' + this.hero.battleDefenseBonus +
        ', Evasion ' + this.getDisplayedEvasionPercent() + '%.'
      );
      this.logMaxEvasionReachedIfNeeded();
      if (skillId === 'ironEvasion') {
        this.playHeroAnimThen('hero_iron_evasion_sheet', 'hero_iron_evasion', () => this.endPlayerTurn());
      } else {
        this.endPlayerTurn();
      }
      return;
    }

    if (skill.battleDefenseBonus != null) {
      this.hero.currentMana -= skill.manaCost;
      this.hero.battleDefenseBonus = (this.hero.battleDefenseBonus || 0) + skill.battleDefenseBonus;
      this.logCombat(
        skill.name +
        '. +' + skill.battleDefenseBonus +
        ' Def this battle. Total: Def +' + this.hero.battleDefenseBonus + '.'
      );
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
      this.hero.battleEvasionChance = (this.hero.battleEvasionChance || 0) + skill.battleEvasionChance;
      this.logCombat(
        skill.name +
        '. +' + Math.round((skill.battleEvasionChance || 0) * 100) +
        '% Evasion. Total: Evasion ' + this.getDisplayedEvasionPercent() + '%.'
      );
      this.logMaxEvasionReachedIfNeeded();
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
        const hitResults = CombatSystem.dealDamageToAll(this.hero, this.enemies, skillId);
        const dmgValues = hitResults.map(r => r.damage);
        const wasDoubletap = this.hero.doubletapActive;
        if (wasDoubletap) {
          this.hero.doubletapActive = false;
          this.logCombat('Doubletap! Damage doubled!');
          for (let i = 0; i < dmgValues.length; i++) {
            if (dmgValues[i] > 0) {
              this.enemies[i].hp = Math.max(0, this.enemies[i].hp - dmgValues[i]);
              dmgValues[i] = dmgValues[i] * 2;
            }
          }
        }
        if ((this.hero.weakenedRounds || 0) > 0) {
          for (let i = 0; i < dmgValues.length; i++) {
            if (dmgValues[i] > 0) {
              const reduction = Math.floor(dmgValues[i] * (this.hero.weakenedFactor || 0));
              this.enemies[i].hp = Math.min(this.enemies[i].maxHp, this.enemies[i].hp + reduction);
              dmgValues[i] -= reduction;
            }
          }
        }
        let totalDamage = 0;
        let dodgeCount = 0;
        for (let i = 0; i < this.enemies.length; i++) {
          if (hitResults[i] && hitResults[i].dodged && this.enemySprites[i]) {
            this.showMissText(this.enemySprites[i].x, this.enemySprites[i].y);
            dodgeCount++;
            continue;
          }
          if (dmgValues[i] != null) totalDamage += dmgValues[i];
          if (dmgValues[i] != null && this.enemySprites[i]) {
            this.shakeSprite(this.enemySprites[i], () => {});
            this.showDamageNumber(this.enemySprites[i].x, this.enemySprites[i].y, dmgValues[i]);
          }
        }
        if (totalDamage > 0) playSfx(this, 'damage-dealt-and-received');
        if (skill.lifeSteal && totalDamage > 0) {
          this.hero.currentHealth = Math.min(this.hero.getEffectiveHealth(), this.hero.currentHealth + totalDamage);
        }
        const logParts = [skill.name + ' (AoE). ' + totalDamage + ' total damage.'];
        if (dodgeCount > 0) logParts.push(dodgeCount + ' dodged.');
        this.logCombat(logParts.join(' '));
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
    this.enemyTurnHadUtilitySkill = false;
    this.enemyTurnWasReflecting = false;
    this.processEnemyAttacks(0, 0);
  }

  applySingleEnemyAttack(enemyIndex, result) {
    const enemy = this.enemies[enemyIndex];
    const reflecting = (this.hero.blockReflectRounds || 0) > 0;
    if (reflecting) this.enemyTurnWasReflecting = true;
    if (reflecting) {
      if (result.invulnerable) {
        this.logCombat(enemy.name + ' attacks. Avoid Death Potion blocked it.');
        return 0;
      }
      if (!result.evaded && result.damage > 0) {
        playSfx(this, 'damage-dealt-and-received');
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
      let finalDmg = result.damage;
      if ((this.hero.vulnerableRounds || 0) > 0 && finalDmg > 0) {
        finalDmg = Math.floor(finalDmg * (1 + (this.hero.vulnerableFactor || 0)));
      }
      if (finalDmg > 0 ) playSfx(this, 'damage-dealt-and-received');
      this.hero.currentHealth = Math.max(0, this.hero.currentHealth - finalDmg);
      DurabilitySystem.armorHit(this.hero);
      this.logCombat(enemy.name + ' attacks. ' + finalDmg + ' damage.');
      return finalDmg;
    }
    this.logCombat(enemy.name + ' attacks. Dodged!');
    return 0;
  }

  processEnemyAttacks(i, totalSoFar) {
    if (i >= this.enemies.length) {
      decayBlockReflect(this.hero);
      this.finishEnemyTurn(totalSoFar);
      return;
    }
    const enemy = this.enemies[i];
    if (enemy.hp <= 0) {
      this.processEnemyAttacks(i + 1, totalSoFar);
      return;
    }
    const scheduledSkill = getEnemyScheduledSkillForTurn(enemy, this.getUpcomingEnemyTurnNumber(enemy), this.hero);
    if (scheduledSkill) {
      const finishSkill = (addedDamage) => {
        this.markEnemyTurnTaken(enemy);
        this.processEnemyAttacks(i + 1, totalSoFar + (addedDamage || 0));
      };
      if (scheduledSkill.useAttackAnimation) {
        this.playEnemyAttackAnimationThen(i, () => this.executeEnemySkill(i, scheduledSkill, finishSkill));
      } else {
        this.executeEnemySkill(i, scheduledSkill, finishSkill);
      }
      return;
    }
    const result = CombatSystem.getEnemyAttackDamage(enemy, this.hero);
    const continueAfterAttack = (dmg) => {
      this.markEnemyTurnTaken(enemy);
      this.processEnemyAttacks(i + 1, totalSoFar + dmg);
    };
    this.playEnemyAttackAnimationThen(i, () => {
      const dmg = this.applySingleEnemyAttack(i, result);
      continueAfterAttack(dmg);
    });
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
          playSfx(this, 'damage-dealt-and-received');
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
          let finalDmg = result.damage;
          if ((this.hero.vulnerableRounds || 0) > 0 && finalDmg > 0) {
            finalDmg = Math.floor(finalDmg * (1 + (this.hero.vulnerableFactor || 0)));
          }
          if (finalDmg > 0 ) playSfx(this, 'damage-dealt-and-received');
          this.hero.currentHealth = Math.max(0, this.hero.currentHealth - finalDmg);
          totalDamage += finalDmg;
          DurabilitySystem.armorHit(this.hero);
        }
        this.logCombat(enemy.name + ' attacks. ' + (result.damage > 0 ? result.damage + ' damage.' : 'Dodged!'));
      }
    }
    if (reflecting) decayBlockReflect(this.hero);
    return totalDamage;
  }

  finishEnemyTurn(totalDamage) {
    const shouldShakeHero = totalDamage > 0 || this.enemyTurnUsedInvulnerability || (!this.enemyTurnWasReflecting && !this.enemyTurnHadUtilitySkill);
    if (shouldShakeHero) this.shakeSprite(this.heroSprite, () => {});
    if (totalDamage > 0) {
      this.showDamageNumber(this.heroSprite.x, this.heroSprite.y, totalDamage);
    } else if (this.enemyTurnUsedInvulnerability) {
      const txt = this.add.text(this.heroSprite.x, this.heroSprite.y - 30, 'Invulnerable!', { fontSize: 18, color: '#fde68a' }).setOrigin(0.5);
      this.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, duration: 500, onComplete: () => txt.destroy() });
    } else if (!this.enemyTurnWasReflecting && !this.enemyTurnHadUtilitySkill) {
      const txt = this.add.text(this.heroSprite.x, this.heroSprite.y - 30, 'Dodged!', { fontSize: 18, color: '#94a3b8' }).setOrigin(0.5);
      this.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, duration: 500, onComplete: () => txt.destroy() });
    }
    decayInvulnerable(this.hero);
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
    const poisonResult = tickPoison(this.hero);
    if (poisonResult) {
      this.logCombat(poisonResult.message);
      if (this.heroSprite) {
        this.shakeSprite(this.heroSprite, () => {});
        this.showDamageNumber(this.heroSprite.x, this.heroSprite.y, poisonResult.damage);
      }
      this.updateBars();
      if (CombatSystem.isHeroDead(this.hero)) {
        this.onCombatLose();
        return;
      }
    }
    const regenResult = tickRegen(this.hero);
    if (regenResult) {
      this.logCombat(regenResult.message);
      if (this.heroSprite) {
        const txt = this.add.text(this.heroSprite.x, this.heroSprite.y - 30, '+' + regenResult.amount, { fontSize: 22, color: '#4ade80' }).setOrigin(0.5);
        this.tweens.add({ targets: txt, y: txt.y - 40, alpha: 0, duration: 600, onComplete: () => txt.destroy() });
      }
      this.updateBars();
    }
    const auraResult = tickFlameAura(this.hero, this.enemies);
    if (auraResult) {
      for (const idx of auraResult.hitIndices) {
        if (this.enemySprites[idx]) {
          this.shakeSprite(this.enemySprites[idx], () => {});
          this.showDamageNumber(this.enemySprites[idx].x, this.enemySprites[idx].y, auraResult.damage);
        }
      }
      if (auraResult.damage > 0 ) playSfx(this, 'damage-dealt-and-received');
      this.logCombat(auraResult.message);
      this.updateBars();
      if (this.areAllEnemiesDead()) {
        this.onCombatWin();
        return;
      }
    }
    const weakResult = decayWeakened(this.hero);
    if (weakResult) {
      if (weakResult.message) this.logCombat(weakResult.message);
      this.updateStatusEffects();
    }
    const vulnResult = decayVulnerable(this.hero);
    if (vulnResult) {
      if (vulnResult.message) this.logCombat(vulnResult.message);
      this.updateStatusEffects();
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
    this.statusEffectsText.setText(getStatusEffectString(this.hero, this.getDisplayedEvasionPercent()));
  }

  updateBars() {
    const maxHp = this.hero.getEffectiveHealth();
    const maxMana = this.hero.getEffectiveMana();
    const barW = CONFIG.COMBAT_BAR_WIDTH;
    const barH = CONFIG.COMBAT_BAR_HEIGHT;
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
    this.hero.resetBattleState();
    GAME_STATE.reaperFight = false;
    const wasForcedEncounter = !!this.forcedEncounter;
    const wasDungeonGoon = wasForcedEncounter && this.forcedEncounter.type === 'dungeonGoon';
    const wasWitchBoss = wasForcedEncounter && this.forcedEncounter.type === 'witchBoss';
    GAME_STATE.forcedEncounter = null;
    playGameMusicLoop(this);

    if (wasDungeonGoon) {
      GAME_STATE.currentLevelId = null;
      GAME_STATE.currentFightIndex = 0;
      const heroLvl = this.hero.level || 1;
      const goonGold = CONFIG.GOLD_GOON_BASE + heroLvl * CONFIG.GOLD_GOON_PER_LEVEL;
      const goonXp = CONFIG.XP_GOON;
      this.hero.gold += goonGold;
      const herbDrop = rollDungeonGoonHerbDrop();
      GAME_STATE.pendingLootItemId = herbDrop;
      GAME_STATE.goldEarned = goonGold;
      GAME_STATE.returnToDungeon = true;
      const leveledUp = ProgressionSystem.giveXP(this.hero, goonXp);
      if (leveledUp) {
        const choices = ProgressionSystem.getChoicesForLevel(this.hero.level);
        if (choices.length > 0) {
          GAME_STATE.pendingLevelUp = true;
          this.scene.start('SkillTree', { from: 'dungeonGoon' });
          return;
        }
      }
      this.scene.start('Loot');
      return;
    }
    if (wasWitchBoss) {
      GAME_STATE.currentLevelId = null;
      GAME_STATE.currentFightIndex = 0;
      const witchGold = 50 + (this.hero.level || 1) * 15;
      this.hero.gold += witchGold;
      if (typeof InventorySystem !== 'undefined') InventorySystem.add(this.hero, 'nightshade');
      GAME_STATE.dungeonProgress = null;
      GAME_STATE.pendingWitchDungeon = false;
      GAME_STATE.pendingLootItemId = null;
      GAME_STATE.goldEarned = witchGold;
      const witchLeveledUp = ProgressionSystem.giveXP(this.hero, CONFIG.XP_BOSS);
      if (witchLeveledUp) {
        const choices = ProgressionSystem.getChoicesForLevel(this.hero.level);
        if (choices.length > 0) {
          GAME_STATE.pendingLevelUp = true;
          this.scene.start('SkillTree', { from: 'witchBoss' });
          return;
        }
      }
      this.scene.start('Overworld');
      return;
    }

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
      this.hero.resetBattleState();
    }
    GAME_STATE.reaperFight = false;
    GAME_STATE.forcedEncounter = null;
    stopAllMusic(this);
    playMusicOnce(this, 'game-over');
    const runPoints = GAME_STATE.points || 0;
    addTotalPoints(runPoints);
    this.scene.start('RunEnded', { runPoints, title: 'Game Over' });
  }

  shutdown() {
    if (this.hero) {
      this.hero.resetBattleState();
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
