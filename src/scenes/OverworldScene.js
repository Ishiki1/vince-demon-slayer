/**
 * OverworldScene.js
 * Overworld: level nodes, Visit Town, Inventory, Character Sheet, Abandon run. Shop is inside Town.
 */

class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Overworld' });
  }

  getOverworldHotspotManifest() {
    if (!this.cache || !this.cache.json) return null;
    const manifest = this.cache.json.get('overworld-hotspots');
    if (!manifest || !Array.isArray(manifest.hotspots)) return null;
    return manifest;
  }

  getLevelNodePosition(level, index) {
    const act1GridPositions = {
      level1: { x: 112, y: 190 },
      level2: { x: 256, y: 190 },
      level3: { x: 400, y: 190 },
      level4: { x: 544, y: 190 },
      level5: { x: 688, y: 190 },
      level6: { x: 112, y: 340 },
      level7: { x: 256, y: 340 },
      level8: { x: 400, y: 340 },
      level9: { x: 544, y: 340 },
      level10: { x: 688, y: 340 },
    };
    if (level && act1GridPositions[level.id]) return act1GridPositions[level.id];

    const cols = 5;
    const levelAreaY = 130;
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      x: 100 + col * 150,
      y: levelAreaY + row * 90,
    };
  }

  showTooltip(label, x, y) {
    this.hideTooltip();
    const paddingX = 10;
    const paddingY = 6;
    const text = this.add.text(x, y, label, {
      fontSize: 13,
      color: '#e5e7eb',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(30);
    const bg = this.add.rectangle(
      x,
      y,
      text.width + paddingX * 2,
      text.height + paddingY * 2,
      0x0f172a,
      0.92
    ).setStrokeStyle(1, 0x94a3b8, 0.9).setDepth(29);
    this.tooltipBg = bg;
    this.tooltipText = text;
  }

  hideTooltip() {
    if (this.tooltipBg) {
      this.tooltipBg.destroy();
      this.tooltipBg = null;
    }
    if (this.tooltipText) {
      this.tooltipText.destroy();
      this.tooltipText = null;
    }
  }

  clearHotspotHoverState(interactive) {
    if (interactive && this.activeHoverTarget !== interactive) return;
    this.activeHoverTarget = null;
    this.hideTooltip();
  }

  createHoverableHotspot(rect, tooltip, onClick, options) {
    const interactive = this.add.rectangle(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width,
      rect.height,
      0x000000,
      0
    );
    const tooltipX = rect.x + rect.width / 2;
    const tooltipY = rect.y > 30 ? rect.y - 14 : rect.y + rect.height + 18;
    interactive.setInteractive({ useHandCursor: !!onClick });
    interactive.on('pointerover', () => {
      this.activeHoverTarget = interactive;
      this.showTooltip(tooltip, tooltipX, tooltipY);
    });
    interactive.on('pointerout', () => {
      this.clearHotspotHoverState(interactive);
    });
    if (onClick) {
      interactive.on('pointerdown', () => {
        this.clearHotspotHoverState(interactive);
        onClick();
      });
    }
    return interactive;
  }

  createSceneIconButton(x, y, textureKey, tooltip, onClick, options) {
    if (typeof createUiIconButton === 'function') {
      return createUiIconButton(this, x, y, textureKey, tooltip, onClick, options);
    }
    return null;
  }

  createTownMapButton(x, y) {
    const textureKey = 'town-overworld';
    if (!this.textures.exists(textureKey)) {
      const fallback = this.add.rectangle(x, y, 140, 48, 0x0ea5e9);
      fallback.setInteractive({ useHandCursor: true });
      this.add.text(x, y, 'Visit Town', { fontSize: 16, color: '#fff' }).setOrigin(0.5);
      fallback.on('pointerdown', () => this.scene.start('Town'));
      return;
    }

    const baseIconSize = 144;
    const hoverIconSize = baseIconSize + 6;
    const hitArea = this.add.rectangle(x, y - 8, baseIconSize + 20, baseIconSize + 20, 0x0f172a, 0.001);
    hitArea.setInteractive({ useHandCursor: true });
    const icon = this.add.image(x, y - 14, textureKey).setDisplaySize(baseIconSize, baseIconSize);
    this.add.text(x, y + 42, 'Visit Town', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    hitArea.on('pointerdown', () => this.scene.start('Town'));
    hitArea.on('pointerover', () => icon.setDisplaySize(hoverIconSize, hoverIconSize));
    hitArea.on('pointerout', () => icon.setDisplaySize(baseIconSize, baseIconSize));
  }

  createTownHotspot(overlay) {
    if (!overlay || !overlay.spriteRect || !this.textures.exists(overlay.textureKey || 'town-overworld')) {
      return false;
    }
    const spriteRect = overlay.spriteRect;
    const hotspotRect = overlay.hotspot || spriteRect;
    const textureKey = overlay.textureKey || 'town-overworld';
    const centerX = spriteRect.x + spriteRect.width / 2;
    const centerY = spriteRect.y + spriteRect.height / 2;
    const icon = this.add.image(centerX, centerY, textureKey)
      .setDisplaySize(spriteRect.width, spriteRect.height)
      .setDepth(2);
    const hoverWidth = spriteRect.width + 6;
    const hoverHeight = spriteRect.height + 6;
    const hitArea = this.createHoverableHotspot(
      hotspotRect,
      'Town',
      () => this.scene.start('Town')
    );
    hitArea.on('pointerover', () => icon.setDisplaySize(hoverWidth, hoverHeight));
    hitArea.on('pointerout', () => icon.setDisplaySize(spriteRect.width, spriteRect.height));
    return true;
  }

  getLevelHotspot(manifest, levelId) {
    if (!manifest || !Array.isArray(manifest.hotspots)) return null;
    return manifest.hotspots.find((hotspot) => hotspot.id === levelId) || null;
  }

  createManifestLevelHotspot(level, hotspot, unlocked) {
    const tooltip = unlocked ? level.name : `${level.name} (Locked)`;
    return this.createHoverableHotspot(
      hotspot,
      tooltip,
      unlocked ? () => this.handleLevelClick(level) : null
    );
  }

  createLevelNode(level, x, y, unlocked) {
    const color = unlocked ? 0x4ade80 : 0x64748b;
    const box = this.add.rectangle(x, y, 120, 64, color, 0.9).setStrokeStyle(2, 0x0f172a, 0.5);
    this.add.text(x, y - 8, level.name, { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    this.add.text(x, y + 14, unlocked ? 'Click to enter' : 'Locked', {
      fontSize: 11,
      color: unlocked ? '#e5e7eb' : '#94a3b8',
    }).setOrigin(0.5);
    if (unlocked) {
      box.setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.handleLevelClick(level));
    }
  }

  isHeroReadyForDay10Reaper() {
    const hero = GAME_STATE.hero;
    if (!hero) return false;
    const fullHealth = hero.currentHealth >= hero.getEffectiveHealth();
    const fullMana = hero.currentMana >= hero.getEffectiveMana();
    return fullHealth && fullMana;
  }

  shouldShowDay10Reaper() {
    return GAME_STATE.pendingDay10Reaper && !GAME_STATE.day10ReaperResolved && this.isHeroReadyForDay10Reaper();
  }

  create() {
    if (!GAME_STATE.hero) {
      if (typeof restorePendingRunBootstrap === 'function') {
        const pendingRun = restorePendingRunBootstrap();
        if (pendingRun && GAME_STATE.hero) {
          if (typeof startSceneWithGameplayPreload === 'function') {
            startSceneWithGameplayPreload(this, pendingRun.targetKey || 'Overworld', pendingRun.targetData || {});
          } else {
            this.scene.start(pendingRun.targetKey || 'Overworld', pendingRun.targetData || {});
          }
          return;
        }
      }
      if (typeof clearPendingRunBootstrap === 'function') clearPendingRunBootstrap();
      this.scene.start('Menu', { pendingRunLost: true });
      return;
    }
    if (typeof clearPendingRunBootstrap === 'function') clearPendingRunBootstrap();
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    this.tooltipBg = null;
    this.tooltipText = null;
    this.activeHoverTarget = null;

    if (this.textures.exists('overworld-ui-background')) {
      this.add.image(w / 2, h / 2, 'overworld-ui-background')
        .setDisplaySize(w, h)
        .setDepth(-20);
    }

    this.add.text(w / 2, 28, 'Overworld', { fontSize: 32, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 58, 'Gold: ' + hero.gold, { fontSize: 16, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 84, 'Day: ' + (GAME_STATE.day || 1), { fontSize: 16, color: '#e5e7eb' }).setOrigin(0.5);

    const btnY = h - 70;
    const manifest = this.getOverworldHotspotManifest();
    if (!this.createTownHotspot(manifest && manifest.townOverlay)) {
      this.createTownMapButton(82, btnY);
    }

    const uiIconSpacing = 72;
    const bottomRightRightX = w - 42;
    const bottomRightY = btnY;

    this.createSceneIconButton(bottomRightRightX - uiIconSpacing, bottomRightY, 'inventory-icon', 'Inventory', () => this.scene.start('InventoryOverworld', { from: 'Overworld' }), {
      size: 52,
      tooltipX: bottomRightRightX - uiIconSpacing,
      tooltipY: bottomRightY - 42,
    });
    this.createSceneIconButton(bottomRightRightX, bottomRightY, 'character-sheet-icon', 'Character Sheet', () => this.scene.start('CharacterSheet', { from: 'Overworld' }), {
      size: 52,
      tooltipX: bottomRightRightX,
      tooltipY: bottomRightY - 42,
      tooltipOriginX: 1,
    });

    const topRightX = w - 42;
    const topRightY = 30;
    const topRightSpacing = 56;
    this.createSceneIconButton(topRightX - topRightSpacing * 2, topRightY, 'settings-icon', 'Settings', () => this.scene.start('Settings', { from: 'Overworld' }), {
      size: 42,
      tooltipX: topRightX - topRightSpacing * 2,
      tooltipY: topRightY + 34,
      tooltipOriginY: 0,
    });
    this.createSceneIconButton(topRightX - topRightSpacing, topRightY, 'save-game-icon', 'Save Game', () => {
      if (GAME_STATE.hero && typeof saveGame === 'function' && saveGame()) {
        const msg = this.add.text(w / 2, 100, 'Game saved.', { fontSize: 16, color: '#86efac' }).setOrigin(0.5);
        this.time.delayedCall(1500, () => msg.destroy());
      }
    }, {
      size: 42,
      tooltipX: topRightX - topRightSpacing,
      tooltipY: topRightY + 34,
      tooltipOriginY: 0,
    });
    this.createSceneIconButton(topRightX, topRightY, 'abandon-run-icon', 'Abandon Run', () => {
      const runPoints = GAME_STATE.points || 0;
      addTotalPoints(runPoints);
      resetRun();
      this.scene.start('RunEnded', { runPoints, title: 'Run ended' });
    }, {
      size: 42,
      tooltipX: topRightX,
      tooltipY: topRightY + 34,
      tooltipOriginX: 1,
      tooltipOriginY: 0,
    });

    const levelsToShow = GAME_STATE.act === 2 ? LEVELS_ACT2 : LEVELS_ACT1;
    levelsToShow.forEach((level, i) => {
      const unlocked = GAME_STATE.unlockedLevels.includes(level.id);
      const hotspot = this.getLevelHotspot(manifest, level.id);
      if (hotspot) {
        this.createManifestLevelHotspot(level, hotspot, unlocked);
        return;
      }
      const { x, y } = this.getLevelNodePosition(level, i);
      this.createLevelNode(level, x, y, unlocked);
    });

    this.showPendingDialogs();
  }

  showPendingDialogs() {
    if (GAME_STATE.fledGoldLost != null) {
      this.showFleeResultPopup(() => this.showPendingDialogs());
      return;
    }
    if (this.shouldShowDay10Reaper()) {
      this.showDay10ReaperPopup();
    }
  }

  shutdown() {
    this.clearHotspotHoverState();
    this.hideTooltip();
  }

  handleLevelClick(level) {
    const hero = GAME_STATE.hero;
    if (this.shouldShowDay10Reaper()) {
      this.showDay10ReaperPopup();
      return;
    }
    const enteredLevelIds = GAME_STATE.enteredLevelIds || [];
    const firstVisit = !enteredLevelIds.includes(level.id);
    const needsWarning = firstVisit && hero.currentHealth < hero.getEffectiveHealth();
    if (needsWarning) {
      this.showLowHealthWarning(level);
      return;
    }
    this.startLevel(level);
  }

  startLevel(level) {
    if (!Array.isArray(GAME_STATE.enteredLevelIds)) GAME_STATE.enteredLevelIds = [];
    if (!GAME_STATE.enteredLevelIds.includes(level.id)) {
      GAME_STATE.enteredLevelIds.push(level.id);
    }
    GAME_STATE.currentLevelId = level.id;
    GAME_STATE.currentFightIndex = 0;
    this.scene.start('Combat');
  }

  showFleeResultPopup(onClose) {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const goldLost = GAME_STATE.fledGoldLost;
    const itemNames = Array.isArray(GAME_STATE.fledItemLostNames) ? GAME_STATE.fledItemLostNames : [];
    GAME_STATE.fledGoldLost = null;
    GAME_STATE.fledItemLostNames = [];
    const msg = itemNames.length > 0
      ? 'You fled. You lost ' + goldLost + ' gold and these items: ' + itemNames.join(', ') + '.'
      : 'You fled. You lost ' + goldLost + ' gold. No items were lost.';
    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.65).setInteractive();
    const box = this.add.rectangle(w / 2, h / 2, 460, 150, 0x1e293b);
    const txt = this.add.text(w / 2, h / 2 - 18, msg, { fontSize: 15, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(410);
    const okBtn = this.add.rectangle(w / 2, h / 2 + 38, 90, 36, 0x475569).setInteractive({ useHandCursor: true });
    const okTxt = this.add.text(w / 2, h / 2 + 38, 'OK', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    const close = () => {
      [overlay, box, txt, okBtn, okTxt].forEach(obj => obj.destroy());
      if (onClose) onClose();
    };
    okBtn.on('pointerdown', close);
  }

  showLowHealthWarning(level) {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    const restPrice = typeof getRestGoldCost === 'function'
      ? getRestGoldCost(hero)
      : (CONFIG.REST_PRICE_BASE + hero.level * CONFIG.REST_PRICE_PER_LEVEL);
    const canRest = hero.gold >= restPrice;
    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.65).setInteractive();
    const box = this.add.rectangle(w / 2, h / 2, 520, 190, 0x1e293b);
    const title = this.add.text(w / 2, h / 2 - 62, 'Travel Warning', { fontSize: 22, color: '#fbbf24' }).setOrigin(0.5);
    const body = this.add.text(w / 2, h / 2 - 24, 'You don\'t look healthy, are you sure you want to proceed?', {
      fontSize: 16,
      color: '#e5e7eb',
    }).setOrigin(0.5).setWordWrapWidth(460);
    const restBtn = this.add.rectangle(w / 2 - 120, h / 2 + 42, 190, 44, canRest ? 0x4ade80 : 0x64748b);
    restBtn.setInteractive({ useHandCursor: canRest });
    const restTxt = this.add.text(w / 2 - 120, h / 2 + 42, 'Rest for ' + restPrice + ' gold', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    const continueBtn = this.add.rectangle(w / 2 + 120, h / 2 + 42, 210, 44, 0x7f1d1d).setInteractive({ useHandCursor: true });
    const continueTxt = this.add.text(w / 2 + 120, h / 2 + 42, 'I\'m not afraid! Continue', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    const all = [overlay, box, title, body, restBtn, restTxt, continueBtn, continueTxt];
    const close = () => all.forEach(obj => obj.destroy());
    if (canRest) {
      restBtn.on('pointerdown', () => {
        const rested = typeof performTownRest === 'function'
          ? performTownRest(hero)
          : (hero.gold >= restPrice ? (hero.gold -= restPrice, hero.refillCombatStats(), true) : false);
        close();
        if (rested) this.scene.restart();
      });
    }
    continueBtn.on('pointerdown', () => {
      close();
      this.startLevel(level);
    });
  }

  showDay10ReaperPopup() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    const fee = Math.floor((hero.gold || 0) * 0.5);
    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setInteractive();
    const box = this.add.rectangle(w / 2, h / 2, 560, 210, 0x1e293b);
    const title = this.add.text(w / 2, h / 2 - 68, 'The Reaper', { fontSize: 24, color: '#f87171' }).setOrigin(0.5);
    const body = this.add.text(
      w / 2,
      h / 2 - 24,
      'It is time for me to take you with me, but I\'m willing to wait for a fee...',
      { fontSize: 16, color: '#e5e7eb' }
    ).setOrigin(0.5).setWordWrapWidth(500);
    const payBtn = this.add.rectangle(w / 2 - 120, h / 2 + 52, 190, 46, 0x78716c).setInteractive({ useHandCursor: true });
    const payTxt = this.add.text(w / 2 - 120, h / 2 + 52, 'Pay ' + fee + ' gold', { fontSize: 15, color: '#fff' }).setOrigin(0.5);
    const fightBtn = this.add.rectangle(w / 2 + 120, h / 2 + 52, 170, 46, 0x7f1d1d).setInteractive({ useHandCursor: true });
    const fightTxt = this.add.text(w / 2 + 120, h / 2 + 52, 'Fight the Reaper', { fontSize: 15, color: '#fff' }).setOrigin(0.5);
    const all = [overlay, box, title, body, payBtn, payTxt, fightBtn, fightTxt];
    const close = () => all.forEach(obj => obj.destroy());
    payBtn.on('pointerdown', () => {
      hero.gold = Math.max(0, hero.gold - fee);
      GAME_STATE.pendingDay10Reaper = false;
      GAME_STATE.day10ReaperResolved = true;
      close();
      this.scene.restart();
    });
    fightBtn.on('pointerdown', () => {
      GAME_STATE.pendingDay10Reaper = false;
      GAME_STATE.day10ReaperResolved = true;
      GAME_STATE.forcedEncounter = { type: 'day10Reaper' };
      GAME_STATE.currentLevelId = null;
      GAME_STATE.currentFightIndex = 0;
      close();
      this.scene.start('Combat');
    });
  }
}
