/**
 * LootScene.js
 * After a fight: show gold earned, rolled loot, and continue via the painted background plaque.
 */

class LootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Loot' });
  }

  getLootHotspotManifest() {
    if (!this.cache || !this.cache.json) return null;
    const manifest = this.cache.json.get('lootscene-hotspots');
    if (!manifest || !Array.isArray(manifest.hotspots)) return null;
    return manifest;
  }

  getLootHotspot(hotspotId) {
    const manifest = this.getLootHotspotManifest();
    if (!manifest) return null;
    return manifest.hotspots.find((hotspot) => hotspot.id === hotspotId) || null;
  }

  createLootHotspot(rect, onClick) {
    if (!rect || typeof onClick !== 'function') return null;
    const hotspot = this.add.rectangle(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width,
      rect.height,
      0x000000,
      0
    );
    hotspot.setInteractive({ useHandCursor: true });
    hotspot.on('pointerdown', onClick);
    return hotspot;
  }

  createFallbackContinueButton(x, y, onClick) {
    return createUiArtButton(this, x, y, 'continue-button', onClick, {
      width: 180,
      height: 52,
      fallbackLabel: 'Continue',
      fallbackWidth: 170,
      fallbackHeight: 48,
      bgColor: 0x4ade80,
      fontSize: 18,
      textColor: '#fff',
    });
  }

  handleContinue(hero, itemId) {
    if (this.continueHandled) return;
    this.continueHandled = true;
    // The art-first loot screen now uses a single Continue plaque to claim any pending loot and move on.
    if (hero && itemId && ITEMS[itemId]) {
      InventorySystem.add(hero, itemId);
    }
    this.finishLoot();
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    if (GAME_STATE.levelJustCompleted) {
      if (typeof playSfx === 'function') playSfx(this, 'level-won');
      GAME_STATE.levelJustCompleted = false;
    }

    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    const itemId = GAME_STATE.pendingLootItemId;
    const goldEarned = GAME_STATE.goldEarned || 0;
    this.continueHandled = false;
    const levelBackgroundKey = typeof getLevelBackgroundTextureKey === 'function'
      ? getLevelBackgroundTextureKey(GAME_STATE.currentLevelId)
      : null;

    const lootBackgroundKey = 'lootscene-ui-background';
    const hasDedicatedLootBackground = typeof addSceneBackground === 'function'
      && !!addSceneBackground(this, lootBackgroundKey, { width: w, height: h, depth: -30 });
    const continueHotspot = hasDedicatedLootBackground ? this.getLootHotspot('continue') : null;
    const handleContinue = () => this.handleContinue(hero, itemId);

    if (hasDedicatedLootBackground) {
      this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.18).setDepth(-25);
    } else if (levelBackgroundKey && typeof addSceneBackground === 'function' && this.textures.exists(levelBackgroundKey)) {
      addSceneBackground(this, levelBackgroundKey, { width: w, height: h, depth: -30 });
      this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.32).setDepth(-25);
    } else {
      this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e).setDepth(-30);
    }

    this.add.text(w / 2, 60, 'Loot', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);
    if (goldEarned > 0) {
      this.add.text(w / 2, 100, `+${goldEarned} Gold`, { fontSize: 20, color: '#fbbf24' }).setOrigin(0.5);
    }

    if (itemId && ITEMS[itemId]) {
      const item = ITEMS[itemId];
      createItemIconSprite(this, item, w / 2, h / 2 - 120, { width: 96, height: 96 });
      this.add.text(w / 2, h / 2 - 50, item.name, { fontSize: 24, color: '#e5e7eb' }).setOrigin(0.5);
      this.add.text(w / 2, h / 2 - 20, `(${item.rarity})`, { fontSize: 18, color: '#94a3b8' }).setOrigin(0.5);
      const effectLine = getItemEffectLine(item);
      if (effectLine) this.add.text(w / 2, h / 2 + 10, effectLine, { fontSize: 14, color: '#a5b4fc' }).setOrigin(0.5);
    } else {
      this.add.text(w / 2, h / 2 - 20, 'No loot this time.', { fontSize: 18, color: '#94a3b8' }).setOrigin(0.5);
    }

    if (continueHotspot) {
      this.createLootHotspot(continueHotspot, handleContinue);
    } else {
      this.createFallbackContinueButton(w / 2, h - 92, handleContinue);
    }
  }

  finishLoot() {
    GAME_STATE.pendingLootItemId = null;
    GAME_STATE.goldEarned = 0;
    const level = LEVELS.find(l => l.id === GAME_STATE.currentLevelId);
    if (!level) { this.scene.start('Overworld'); return; }
    const nextIndex = GAME_STATE.currentFightIndex + 1;
    if (nextIndex < level.fights.length) {
      GAME_STATE.currentFightIndex = nextIndex;
      this.scene.start('Combat');
    } else {
      if (!GAME_STATE.completedLevelIds) GAME_STATE.completedLevelIds = [];
      const firstTime = !GAME_STATE.completedLevelIds.includes(level.id);
      if (firstTime) {
        GAME_STATE.completedLevelIds.push(level.id);
        GAME_STATE.points = (GAME_STATE.points || 0) + (level.levelIndex + 1);
      }
      GAME_STATE.day = Math.max(1, (GAME_STATE.day || 1) + 1);
      if (!GAME_STATE.day10ReaperResolved && (GAME_STATE.day || 1) >= 10) {
        GAME_STATE.pendingDay10Reaper = true;
      }
      GAME_STATE.shopStock = ShopSystem.generateStock(GAME_STATE.hero);
      const levelIndex = LEVELS.findIndex(l => l.id === level.id);
      const nextLevelData = LEVELS[levelIndex + 1];
      if (nextLevelData && !GAME_STATE.unlockedLevels.includes(nextLevelData.id)) {
        GAME_STATE.unlockedLevels.push(nextLevelData.id);
      }
      GAME_STATE.currentLevelId = null;
      GAME_STATE.currentFightIndex = 0;
      const lastFight = level.fights[level.fights.length - 1];
      if (lastFight && lastFight.isBoss && level.id === 'level10') {
        this.scene.start('Transition');
        return;
      }
      if (lastFight && lastFight.isBoss && level.id === 'level20') {
        this.showVictory();
        return;
      }
      GAME_STATE.pendingRandomEvent = true;
      this.scene.start('Event');
    }
  }

  showVictory() {
    const runPoints = GAME_STATE.points || 0;
    addTotalPoints(runPoints);
    this.scene.start('RunEnded', { runPoints, title: 'You won!' });
  }
}
