/**
 * BlacksmithScene.js
 * Combined three-column blacksmith: Repair | Craft | Upgrade.
 * Icon-only item slots, hover tooltips with full decision info, click-to-act.
 */

const UPGRADE_GOLD_BASE = 500;

const BLACKSMITH_TYPE_LABELS = {
  weapon: 'Weapon',
  armor: 'Armor',
  accessory: 'Accessory',
};

class BlacksmithScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Blacksmith' });
  }

  getHotspotManifest() {
    if (!this.cache || !this.cache.json) return null;
    const manifest = this.cache.json.get('blacksmith-hotspots');
    if (!manifest || !Array.isArray(manifest.hotspots)) return null;
    return manifest;
  }

  getHotspot(id) {
    const manifest = this.getHotspotManifest();
    if (!manifest) return null;
    return manifest.hotspots.find(h => h.id === id) || null;
  }

  showTooltip(lines, x, y, lineColors) {
    this.hideTooltip();
    const padX = 12;
    const padY = 8;
    const clampedX = Math.min(Math.max(x, 120), CONFIG.WIDTH - 120);
    const hasCustomColors = lineColors && lineColors.some(c => c !== null);

    if (!hasCustomColors) {
      const text = this.add.text(clampedX, y, lines.join('\n'), {
        fontSize: 13,
        color: '#e5e7eb',
        fontFamily: 'Arial',
        lineSpacing: 2,
        align: 'center',
      }).setOrigin(0.5, 1).setDepth(30).setWordWrapWidth(200);
      const bgW = text.width + padX * 2;
      const bgH = text.height + padY * 2;
      const bg = this.add.rectangle(clampedX, y - text.height / 2, bgW, bgH, 0x0f172a, 0.92)
        .setStrokeStyle(1, 0x94a3b8, 0.9).setDepth(29);
      this.tooltipBg = bg;
      this.tooltipText = text;
      return;
    }

    const textObjects = [];
    let totalHeight = 0;
    let maxWidth = 0;
    lines.forEach((line, i) => {
      const color = (lineColors[i]) || '#e5e7eb';
      const txt = this.add.text(0, 0, line, {
        fontSize: 13, color, fontFamily: 'Arial', align: 'center',
      }).setOrigin(0.5, 0).setDepth(30).setWordWrapWidth(200);
      textObjects.push(txt);
      maxWidth = Math.max(maxWidth, txt.width);
      totalHeight += txt.height;
    });
    totalHeight += (lines.length - 1) * 2;

    let curY = y - totalHeight;
    textObjects.forEach((txt) => {
      txt.setX(clampedX);
      txt.setY(curY);
      curY += txt.height + 2;
    });

    const bgW = maxWidth + padX * 2;
    const bgH = totalHeight + padY * 2;
    const bg = this.add.rectangle(clampedX, y - totalHeight / 2, bgW, bgH, 0x0f172a, 0.92)
      .setStrokeStyle(1, 0x94a3b8, 0.9).setDepth(29);
    this.tooltipBg = bg;
    this.tooltipTexts = textObjects;
  }

  hideTooltip() {
    if (this.tooltipBg) { this.tooltipBg.destroy(); this.tooltipBg = null; }
    if (this.tooltipText) { this.tooltipText.destroy(); this.tooltipText = null; }
    if (this.tooltipTexts) { this.tooltipTexts.forEach(t => t.destroy()); this.tooltipTexts = null; }
  }

  createItemSlot(hotspot, icon, tooltipLines, onClick, lineColors) {
    if (!hotspot) return;
    const baseW = icon && typeof icon.displayWidth === 'number' ? icon.displayWidth : 40;
    const baseH = icon && typeof icon.displayHeight === 'number' ? icon.displayHeight : 40;
    const hitArea = this.add.rectangle(
      hotspot.centerX, hotspot.centerY,
      hotspot.width + 8, hotspot.height + 8,
      0x000000, 0
    ).setInteractive({ useHandCursor: !!onClick }).setDepth(20);
    hitArea.on('pointerover', () => {
      if (icon && typeof icon.setDisplaySize === 'function') {
        icon.setDisplaySize(baseW + 4, baseH + 4);
      }
      this.showTooltip(tooltipLines, hotspot.centerX, hotspot.y - 6, lineColors);
    });
    hitArea.on('pointerout', () => {
      if (icon && typeof icon.setDisplaySize === 'function') {
        icon.setDisplaySize(baseW, baseH);
      }
      this.hideTooltip();
    });
    if (onClick) {
      hitArea.on('pointerdown', () => {
        this.hideTooltip();
        onClick();
      });
    }
  }

  buildRepairTooltipLines(item, slot, slotType, cost, hero) {
    const typeLabel = BLACKSMITH_TYPE_LABELS[item.type] || item.type;
    const lines = [item.name + ' (' + item.rarity + ')', typeLabel];
    const lineColors = [null, null];
    if (slotType) { lines.push('Equipped: ' + slotType); lineColors.push(null); }
    lines.push('Durability: ' + slot.durability + ' / ' + slot.maxDurability);
    lineColors.push(null);
    const effectLine = typeof getItemEffectLine === 'function' ? getItemEffectLine(item) : '';
    if (effectLine) { lines.push(effectLine); lineColors.push(null); }
    lines.push('Repair: ' + cost + ' gold');
    lineColors.push(hero.gold >= cost ? null : '#ef4444');
    return { lines, lineColors };
  }

  buildCraftTooltipLines(item, materialItem, cost, hero) {
    const typeLabel = BLACKSMITH_TYPE_LABELS[item.type] || item.type;
    const lines = [item.name, typeLabel];
    const lineColors = [null, null];
    const effectLine = typeof getItemEffectLine === 'function' ? getItemEffectLine(item) : '';
    if (effectLine) { lines.push(effectLine); lineColors.push(null); }
    lines.push('Durability: ' + CONFIG.DURABILITY_MAX_UNIQUE);
    lineColors.push(null);
    const materialName = materialItem ? materialItem.name : 'Material';
    lines.push(cost + 'g + 1 ' + materialName);
    lineColors.push(hero.gold >= cost ? null : '#ef4444');
    return { lines, lineColors };
  }

  buildUpgradeTooltipLines(item, slot, materialName, cost, upgradeSummary, hero) {
    const typeLabel = BLACKSMITH_TYPE_LABELS[item.type] || item.type;
    const lines = [item.name + ' (' + typeLabel + ')'];
    const lineColors = [null];
    if (slot.upgraded) {
      lines.push('Already upgraded');
      lineColors.push('#4ade80');
      return { lines, lineColors };
    }
    if (upgradeSummary) { lines.push(upgradeSummary); lineColors.push(null); }
    lines.push(cost + 'g + 1 ' + materialName);
    lineColors.push(hero.gold >= cost ? null : '#ef4444');
    return { lines, lineColors };
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);
    const hero = GAME_STATE.hero;
    InventorySystem.ensureSlotBased(hero);
    InventorySystem.ensureAccessorySlots(hero);
    this.tooltipBg = null;
    this.tooltipText = null;
    this.tooltipTexts = null;

    const hasArt = !!addSceneBackground(this, 'blacksmith-ui-background');
    if (!hasArt) {
      this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0f172a);
    }

    this.add.text(20, 32, 'Blacksmith', {
      fontSize: 28,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0, 0.5);
    this.add.text(20, 62, 'Gold: ' + hero.gold, {
      fontSize: 18,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 4,
    }).setOrigin(0, 0.5);
    createTownNavRow(this, { currentSection: 'blacksmith' });

    this.populateRepairColumn(hero);
    this.populateCraftColumn(hero);
    this.populateUpgradeColumn(hero);

    const backHotspot = this.getHotspot('back');
    if (backHotspot) {
      const backArea = this.add.rectangle(
        backHotspot.centerX, backHotspot.centerY,
        backHotspot.width, backHotspot.height,
        0x000000, 0
      ).setInteractive({ useHandCursor: true });
      backArea.on('pointerdown', () => this.scene.start('Town'));
    }
  }

  populateRepairColumn(hero) {
    const damaged = [];
    const equippedIds = new Set();
    const equippedEntries = [
      { slotId: hero.weapon, slotType: 'Weapon' },
      { slotId: hero.armor, slotType: 'Armor' },
      { slotId: hero.accessories[0], slotType: 'Accessory 1' },
      { slotId: hero.accessories[1], slotType: 'Accessory 2' },
    ];
    equippedEntries.forEach(({ slotId, slotType }) => {
      const slot = DurabilitySystem.getSlotById(hero, slotId);
      if (slot && slot.durability != null && slot.durability < slot.maxDurability) {
        damaged.push({ slot, slotType });
        equippedIds.add(slot.id);
      }
    });
    hero.inventory.forEach(slot => {
      if (equippedIds.has(slot.id) || slot.durability == null || slot.durability >= slot.maxDurability) return;
      const item = ITEMS[slot.itemId];
      if (item && (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')) {
        damaged.push({ slot, slotType: null });
      }
    });

    const maxSlots = 5;
    damaged.slice(0, maxSlots).forEach((entry, i) => {
      const hotspot = this.getHotspot('repair-' + (i + 1));
      if (!hotspot) return;
      const item = ITEMS[entry.slot.itemId];
      if (!item) return;
      const cost = ShopSystem.getRepairPrice(entry.slot.itemId);
      const canRepair = hero.gold >= cost;
      const icon = createItemIconSprite(this, item, hotspot.centerX, hotspot.centerY, {
        width: 40, height: 40,
      });
      const tooltip = this.buildRepairTooltipLines(item, entry.slot, entry.slotType, cost, hero);
      this.createItemSlot(hotspot, icon, tooltip.lines, canRepair ? () => {
        hero.gold -= cost;
        entry.slot.durability = entry.slot.maxDurability;
        this.scene.restart();
      } : null, tooltip.lineColors);
    });
  }

  populateCraftColumn(hero) {
    const materialItemIds = new Set(
      hero.inventory.filter(s => ITEMS[s.itemId] && ITEMS[s.itemId].type === 'material').map(s => s.itemId)
    );
    const allRecipes = getCraftRecipesForClass(hero);
    const recipes = allRecipes.filter(r => materialItemIds.has(r.material));
    const craftCost = typeof getFinalGoldCost === 'function' ? getFinalGoldCost(CONFIG.CRAFT_COST) : CONFIG.CRAFT_COST;

    const maxSlots = 5;
    recipes.slice(0, maxSlots).forEach((recipe, i) => {
      const hotspot = this.getHotspot('craft-' + (i + 1));
      if (!hotspot) return;
      const item = ITEMS[recipe.itemId];
      const materialItem = ITEMS[recipe.material];
      if (!item) return;
      const hasMaterial = hero.inventory.some(s => s.itemId === recipe.material);
      const canCraft = hero.gold >= craftCost && hasMaterial;
      const icon = createItemIconSprite(this, item, hotspot.centerX, hotspot.centerY, {
        width: 40, height: 40,
      });
      const tooltip = this.buildCraftTooltipLines(item, materialItem, craftCost, hero);
      this.createItemSlot(hotspot, icon, tooltip.lines, canCraft ? () => {
        hero.gold -= craftCost;
        const matSlot = hero.inventory.find(s => s.itemId === recipe.material);
        if (matSlot) InventorySystem.removeSlotById(hero, matSlot.id);
        InventorySystem.add(hero, recipe.itemId);
        this.scene.restart();
      } : null, tooltip.lineColors);
    });
  }

  populateUpgradeColumn(hero) {
    const upgradeCost = typeof getFinalGoldCost === 'function' ? getFinalGoldCost(UPGRADE_GOLD_BASE) : UPGRADE_GOLD_BASE;
    const upgradeable = [];
    hero.inventory.forEach(slot => {
      const item = ITEMS[slot.itemId];
      if (!item || item.rarity !== 'unique') return;
      if (item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory') return;
      if (slot.upgraded) return;
      const element = typeof getUniqueElement === 'function' ? getUniqueElement(slot.itemId) : null;
      if (!element) return;
      const hasStone = hero.inventory.some(s => s.itemId === element);
      if (!hasStone) return;
      upgradeable.push({ slot, item, element });
    });

    const maxSlots = 5;
    upgradeable.slice(0, maxSlots).forEach((entry, i) => {
      const hotspot = this.getHotspot('upgrade-' + (i + 1));
      if (!hotspot) return;
      const materialName = ITEMS[entry.element] ? ITEMS[entry.element].name : 'Stone';
      const canUpgrade = hero.gold >= upgradeCost;
      const upgradeSummary = typeof getUniqueUpgradeSummary === 'function' ? getUniqueUpgradeSummary(entry.item) : '';
      const icon = createItemIconSprite(this, entry.item, hotspot.centerX, hotspot.centerY, {
        width: 40, height: 40,
      });
      const tooltip = this.buildUpgradeTooltipLines(entry.item, entry.slot, materialName, upgradeCost, upgradeSummary, hero);
      this.createItemSlot(hotspot, icon, tooltip.lines, canUpgrade ? () => {
        hero.gold -= upgradeCost;
        const matSlot = hero.inventory.find(s => s.itemId === entry.element);
        if (matSlot) InventorySystem.removeSlotById(hero, matSlot.id);
        entry.slot.upgraded = true;
        entry.slot.upgradeMultipliers = typeof getUniqueUpgradeMultipliers === 'function' ? getUniqueUpgradeMultipliers(entry.item) : {};
        this.scene.restart();
      } : null, tooltip.lineColors);
    });
  }
}
