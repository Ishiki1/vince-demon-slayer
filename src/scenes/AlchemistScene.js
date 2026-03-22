/**
 * AlchemistScene.js
 * Hotspot-driven alchemy: clean background on landing, click the cauldron to
 * open a recipe overlay panel. Follows the same manifest pattern as MineScene.
 */

class AlchemistScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Alchemist' });
  }

  getHotspotManifest() {
    if (!this.cache || !this.cache.json) return null;
    const manifest = this.cache.json.get('alchemist-hotspots');
    if (!manifest || !Array.isArray(manifest.hotspots)) return null;
    return manifest;
  }

  getHotspot(id) {
    const manifest = this.getHotspotManifest();
    if (!manifest) return null;
    return manifest.hotspots.find(h => h.id === id) || null;
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }

    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    InventorySystem.ensureSlotBased(hero);

    const hasArt = !!addSceneBackground(this, 'alchemist-ui-background');
    if (!hasArt) {
      this.add.rectangle(w / 2, h / 2, w, h, 0x0f172a);
    }

    this.add.text(20, 32, 'Alchemist', {
      fontSize: 28,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0, 0.5);

    this.goldText = this.add.text(w - 20, 32, 'Gold: ' + hero.gold, {
      fontSize: 18,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 4,
    }).setOrigin(1, 0.5);

    createTownNavRow(this, { currentSection: 'alchemist' });

    this.cauldronTooltip = null;
    this.panelObjects = [];
    this.confirmationText = null;

    const hs = this.getHotspot('cauldron');
    if (hs) {
      const area = this.add.rectangle(hs.centerX, hs.centerY, hs.width, hs.height, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      area.on('pointerover', () => {
        if (this.cauldronTooltip) { this.cauldronTooltip.destroy(); this.cauldronTooltip = null; }
        this.cauldronTooltip = this.add.text(w / 2, h - 40, 'Brew potions', {
          fontSize: 16,
          color: '#fbbf24',
          stroke: '#0f172a',
          strokeThickness: 4,
        }).setOrigin(0.5).setDepth(20);
      });

      area.on('pointerout', () => {
        if (this.cauldronTooltip) { this.cauldronTooltip.destroy(); this.cauldronTooltip = null; }
      });

      area.on('pointerdown', () => {
        if (this.cauldronTooltip) { this.cauldronTooltip.destroy(); this.cauldronTooltip = null; }
        this.openBrewingPanel(hero);
      });
    }
  }

  openBrewingPanel(hero) {
    if (this.panelObjects.length > 0) return;

    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.75)
      .setInteractive().setDepth(30);
    this.panelObjects.push(overlay);

    const panelW = 700;
    const panelH = 440;
    const panel = this.add.rectangle(w / 2, h / 2, panelW, panelH, 0x1e293b, 0.95)
      .setDepth(31);
    this.panelObjects.push(panel);

    const title = this.add.text(w / 2, h / 2 - panelH / 2 + 24, 'Brew Potions', {
      fontSize: 22, color: '#fbbf24', stroke: '#0f172a', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(32);
    this.panelObjects.push(title);

    const goldLabel = this.add.text(w / 2 + panelW / 2 - 16, h / 2 - panelH / 2 + 24, 'Gold: ' + hero.gold, {
      fontSize: 15, color: '#fbbf24', stroke: '#0f172a', strokeThickness: 3,
    }).setOrigin(1, 0.5).setDepth(32);
    this.panelObjects.push(goldLabel);
    this.panelGoldLabel = goldLabel;

    const closeBtn = this.add.rectangle(w / 2, h / 2 + panelH / 2 - 30, 100, 34, 0x475569)
      .setInteractive({ useHandCursor: true }).setDepth(32);
    this.panelObjects.push(closeBtn);
    const closeTxt = this.add.text(w / 2, h / 2 + panelH / 2 - 30, 'Close', {
      fontSize: 14, color: '#fff', stroke: '#0f172a', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(32);
    this.panelObjects.push(closeTxt);
    closeBtn.on('pointerdown', () => this.closeBrewingPanel());

    this.recipeRows = [];
    this.drawRecipes(hero);
  }

  closeBrewingPanel() {
    this.recipeRows.forEach(objs => objs.forEach(o => o.destroy && o.destroy()));
    this.recipeRows = [];
    this.panelObjects.forEach(o => o.destroy && o.destroy());
    this.panelObjects = [];
    this.panelGoldLabel = null;
    if (this.confirmationText) { this.confirmationText.destroy(); this.confirmationText = null; }
    this.goldText.setText('Gold: ' + GAME_STATE.hero.gold);
  }

  countHerb(hero, herbId) {
    return hero.inventory.filter(s => s.itemId === herbId).length;
  }

  removeOneHerb(hero, herbId) {
    const idx = hero.inventory.findIndex(s => s.itemId === herbId);
    if (idx !== -1) hero.inventory.splice(idx, 1);
  }

  drawRecipes(hero) {
    this.recipeRows.forEach(objs => objs.forEach(o => o.destroy && o.destroy()));
    this.recipeRows = [];

    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const recipes = typeof ALCHEMY_RECIPES !== 'undefined' ? ALCHEMY_RECIPES : [];

    if (recipes.length === 0) {
      const t = this.add.text(w / 2, h / 2, 'No recipes available.', {
        fontSize: 18, color: '#94a3b8', stroke: '#0f172a', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(33);
      this.recipeRows.push([t]);
      return;
    }

    const panelTop = h / 2 - 220;
    const startY = panelTop + 60;
    const rowH = 56;
    const leftX = w / 2 - 320;

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const herb = ITEMS[recipe.herbId];
      const result = ITEMS[recipe.resultId];
      if (!herb || !result) continue;

      const y = startY + i * rowH;
      const objs = [];

      const herbCount = this.countHerb(hero, recipe.herbId);
      const canAfford = hero.gold >= recipe.gold;
      const invFull = hero.inventory.length >= hero.maxInventory;
      const enabled = herbCount > 0 && canAfford && !invFull;
      const baseAlpha = enabled ? 1.0 : 0.4;

      const rowBg = this.add.rectangle(w / 2, y, 660, rowH - 6, 0x0f172a, 0.6)
        .setOrigin(0.5, 0.5).setDepth(32);
      objs.push(rowBg);

      const resultName = this.add.text(leftX, y - 10, result.name, {
        fontSize: 16,
        color: this.getRarityColor(result.rarity),
        stroke: '#0f172a',
        strokeThickness: 3,
      }).setOrigin(0, 0.5).setAlpha(baseAlpha).setDepth(33);
      objs.push(resultName);

      const effectLine = typeof getItemEffectLine === 'function' ? getItemEffectLine(result) : '';
      if (effectLine) {
        const effectText = this.add.text(leftX, y + 10, effectLine, {
          fontSize: 12, color: '#94a3b8', stroke: '#0f172a', strokeThickness: 3,
        }).setOrigin(0, 0.5).setAlpha(baseAlpha).setDepth(33);
        objs.push(effectText);
      }

      const costStr = herb.name + ' x1 (' + herbCount + ')  +  ' + recipe.gold + 'g';
      const costColor = (!canAfford || herbCount === 0) ? '#ef4444' : '#e5e7eb';
      const costText = this.add.text(w / 2 + 50, y, costStr, {
        fontSize: 13, color: costColor, stroke: '#0f172a', strokeThickness: 3,
      }).setOrigin(0, 0.5).setAlpha(baseAlpha).setDepth(33);
      objs.push(costText);

      const btnColor = enabled ? 0x16a34a : 0x475569;
      const brewBtn = this.add.rectangle(w / 2 + 290, y, 80, 34, btnColor)
        .setOrigin(0.5, 0.5).setAlpha(baseAlpha).setDepth(33);
      objs.push(brewBtn);

      const brewLabel = this.add.text(w / 2 + 290, y, 'Brew', {
        fontSize: 14, color: enabled ? '#fff' : '#94a3b8',
        stroke: '#0f172a', strokeThickness: 3,
      }).setOrigin(0.5, 0.5).setAlpha(baseAlpha).setDepth(33);
      objs.push(brewLabel);

      if (enabled) {
        brewBtn.setInteractive({ useHandCursor: true });
        brewBtn.on('pointerdown', () => this.brewRecipe(hero, recipe));
      } else if (invFull && herbCount > 0 && canAfford) {
        brewBtn.setInteractive({ useHandCursor: true });
        brewBtn.on('pointerdown', () => this.showMessage('Inventory full!'));
      }

      this.recipeRows.push(objs);
    }
  }

  brewRecipe(hero, recipe) {
    const herbCount = this.countHerb(hero, recipe.herbId);
    if (herbCount <= 0 || hero.gold < recipe.gold) return;
    if (hero.inventory.length >= hero.maxInventory) {
      this.showMessage('Inventory full!');
      return;
    }

    this.removeOneHerb(hero, recipe.herbId);
    hero.gold -= recipe.gold;
    InventorySystem.add(hero, recipe.resultId);

    const result = ITEMS[recipe.resultId];
    this.showMessage('Brewed ' + (result ? result.name : 'potion') + '!');

    if (this.panelGoldLabel) this.panelGoldLabel.setText('Gold: ' + hero.gold);
    this.goldText.setText('Gold: ' + hero.gold);
    this.drawRecipes(hero);
  }

  showMessage(msg) {
    if (this.confirmationText) this.confirmationText.destroy();
    this.confirmationText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 170, msg, {
      fontSize: 16, color: '#4ade80', stroke: '#0f172a', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(34);
    this.tweens.add({
      targets: this.confirmationText,
      alpha: 0,
      duration: 1800,
      delay: 800,
      onComplete: () => {
        if (this.confirmationText) this.confirmationText.destroy();
        this.confirmationText = null;
      },
    });
  }

  getRarityColor(rarity) {
    if (rarity === 'legendary') return '#fbbf24';
    if (rarity === 'rare') return '#60a5fa';
    return '#e5e7eb';
  }
}
