/**
 * InventoryOverworldScene.js
 * Full-screen Diablo-style inventory layout with paper-doll equipment slots.
 */

const INVENTORY_WINDOW = {
  x: 118,
  y: 54,
  width: 564,
  height: 462,
  slotFill: 0x0b1220,
  slotStroke: 0x4b5563,
  innerFill: 0x111827,
  frameFill: 0x1f2937,
  frameStroke: 0x6b7280,
};

const INVENTORY_GRID = {
  cols: 5,
  rows: 6,
  cellSize: 40,
  cellGap: 6,
  startX: 432,
  startY: 124,
};

class InventoryOverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InventoryOverworld' });
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    this.hero = GAME_STATE.hero;
    InventorySystem.ensureSlotBased(this.hero);
    InventorySystem.ensureAccessorySlots(this.hero);
    this.dynamicEls = [];
    this.statusTimer = null;

    this.createBackdrop();
    this.createWindowFrame();
    this.refreshInventory();
  }

  createBackdrop() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    this.usingLayoutImage = this.textures.exists('inventory-ui-layout');
    if (this.usingLayoutImage) {
      this.add.image(w / 2, h / 2, 'inventory-ui-layout').setDisplaySize(w, h);
    } else if (this.textures.exists('overworld-ui-background')) {
      this.add.image(w / 2, h / 2, 'overworld-ui-background').setDisplaySize(w, h);
      this.add.rectangle(w / 2, h / 2, w, h, 0x020617, 0.42);
    } else {
      this.add.rectangle(w / 2, h / 2, w, h, 0x0f172a);
    }
  }

  createWindowFrame() {
    this.slotBounds = {
      character: { x: 152, y: 126, width: 112, height: 180 },
      weapon: { x: 279, y: 126, width: 112, height: 78 },
      armor: { x: 279, y: 218, width: 112, height: 78 },
      accessory1: { x: 152, y: 310, width: 112, height: 78 },
      accessory2: { x: 279, y: 310, width: 112, height: 78 },
    };

    this.gridCells = [];
    for (let row = 0; row < INVENTORY_GRID.rows; row++) {
      for (let col = 0; col < INVENTORY_GRID.cols; col++) {
        const x = INVENTORY_GRID.startX + col * (INVENTORY_GRID.cellSize + INVENTORY_GRID.cellGap);
        const y = INVENTORY_GRID.startY + row * (INVENTORY_GRID.cellSize + INVENTORY_GRID.cellGap);
        this.gridCells.push({ x, y });
      }
    }

    if (this.usingLayoutImage) {
      this.createLayoutCover(this.slotBounds.weapon, 8);
      this.createLayoutCover(this.slotBounds.armor, 8);
      this.createLayoutCover(this.slotBounds.accessory1, 8);
      this.createLayoutCover(this.slotBounds.accessory2, 8);
      this.add.rectangle(150, 518, 122, 24, 0x132031, 0.98);
      const closeHitArea = this.add.rectangle(710, 520, 92, 34, 0x000000, 0.001).setInteractive({ useHandCursor: true });
      closeHitArea.on('pointerdown', () => this.scene.start('Overworld'));
      this.statusText = this.add.text(152, 518, '', {
        fontSize: 13,
        color: '#e5e7eb',
      }).setOrigin(0, 0.5);
      return;
    }

    this.add.rectangle(
      INVENTORY_WINDOW.x + INVENTORY_WINDOW.width / 2,
      INVENTORY_WINDOW.y + INVENTORY_WINDOW.height / 2,
      INVENTORY_WINDOW.width,
      INVENTORY_WINDOW.height,
      INVENTORY_WINDOW.frameFill,
      0.96
    ).setStrokeStyle(3, INVENTORY_WINDOW.frameStroke, 1);
    this.add.rectangle(
      INVENTORY_WINDOW.x + INVENTORY_WINDOW.width / 2,
      INVENTORY_WINDOW.y + 24,
      210,
      38,
      0x2b3444,
      0.95
    ).setStrokeStyle(2, 0x8b98aa, 0.9);
    this.add.text(INVENTORY_WINDOW.x + INVENTORY_WINDOW.width / 2, INVENTORY_WINDOW.y + 24, 'Inventory', {
      fontSize: 24,
      color: '#f3f4f6',
      fontFamily: 'Georgia',
    }).setOrigin(0.5);

    this.createStaticSlot(152, 126, 112, 180, 'Character');
    this.createStaticSlot(279, 126, 112, 78, 'Weapon');
    this.createStaticSlot(279, 218, 112, 78, 'Armor');
    this.createStaticSlot(152, 310, 112, 78, 'Accessory');
    this.createStaticSlot(279, 310, 112, 78, 'Accessory');

    const gridWidth = INVENTORY_GRID.cols * INVENTORY_GRID.cellSize + (INVENTORY_GRID.cols - 1) * INVENTORY_GRID.cellGap + 22;
    const gridHeight = INVENTORY_GRID.rows * INVENTORY_GRID.cellSize + (INVENTORY_GRID.rows - 1) * INVENTORY_GRID.cellGap + 22;
    this.add.rectangle(544, 255, gridWidth, gridHeight, 0x222d3c, 0.92).setStrokeStyle(2, 0x616d7f, 0.95);
    this.add.text(544, 96, 'General Inventory', { fontSize: 18, color: '#f3f4f6' }).setOrigin(0.5);

    this.gridCells = [];
    for (let row = 0; row < INVENTORY_GRID.rows; row++) {
      for (let col = 0; col < INVENTORY_GRID.cols; col++) {
        const x = INVENTORY_GRID.startX + col * (INVENTORY_GRID.cellSize + INVENTORY_GRID.cellGap);
        const y = INVENTORY_GRID.startY + row * (INVENTORY_GRID.cellSize + INVENTORY_GRID.cellGap);
        const cell = this.add.rectangle(x, y, INVENTORY_GRID.cellSize, INVENTORY_GRID.cellSize, INVENTORY_WINDOW.slotFill, 0.96)
          .setOrigin(0, 0)
          .setStrokeStyle(2, INVENTORY_WINDOW.slotStroke, 0.85);
        this.gridCells.push({ x, y, cell });
      }
    }

    const closeButton = createButton(
      this,
      INVENTORY_WINDOW.x + INVENTORY_WINDOW.width - 48,
      INVENTORY_WINDOW.y + INVENTORY_WINDOW.height - 24,
      94,
      34,
      'Close',
      { bgColor: 0x7c5a3a, fontSize: 15 },
      () => this.scene.start('Overworld')
    );
    closeButton.rect.setStrokeStyle(2, 0xb89b7a, 0.9);

    this.statusText = this.add.text(INVENTORY_WINDOW.x + 28, INVENTORY_WINDOW.y + INVENTORY_WINDOW.height - 34, '', {
      fontSize: 13,
      color: '#e5e7eb',
    });
  }

  createStaticSlot(x, y, width, height, label) {
    this.add.rectangle(x + width / 2, y - 18, width, 24, 0x253041, 0.95).setStrokeStyle(1, 0x7c8798, 0.8);
    this.add.text(x + width / 2, y - 18, label, { fontSize: 14, color: '#f9fafb' }).setOrigin(0.5);
    this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x222d3c, 0.92).setStrokeStyle(2, 0x616d7f, 0.95);
    this.add.rectangle(x + width / 2, y + height / 2, width - 10, height - 10, INVENTORY_WINDOW.slotFill, 0.98).setStrokeStyle(1, 0x39465a, 0.9);
  }

  createLayoutCover(bounds, inset) {
    this.add.rectangle(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2 + 2,
      bounds.width - inset,
      bounds.height - inset,
      INVENTORY_WINDOW.slotFill,
      0.98
    );
  }

  clearDynamic() {
    this.dynamicEls.forEach((el) => {
      if (el && typeof el.destroy === 'function') el.destroy();
    });
    this.dynamicEls = [];
  }

  refreshInventory() {
    this.clearDynamic();
    InventorySystem.ensureAccessorySlots(this.hero);
    this.renderCharacterPreview();
    this.renderEquippedSlot(this.slotBounds.weapon, this.hero.weapon, 'weapon');
    this.renderEquippedSlot(this.slotBounds.armor, this.hero.armor, 'armor');
    this.renderEquippedSlot(this.slotBounds.accessory1, this.hero.accessories[0], 'accessory', 0);
    this.renderEquippedSlot(this.slotBounds.accessory2, this.hero.accessories[1], 'accessory', 1);
    this.renderGeneralInventory();
  }

  renderCharacterPreview() {
    const bounds = this.slotBounds.character;
    if (this.textures.exists('hero_sheet')) {
      const portrait = this.add.sprite(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 6, 'hero_sheet', 0)
        .setDisplaySize(104, 150);
      this.dynamicEls.push(portrait);
    } else {
      const fallback = this.add.text(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, this.hero.name, {
        fontSize: 20,
        color: '#f8fafc',
      }).setOrigin(0.5);
      this.dynamicEls.push(fallback);
    }
  }

  renderEquippedSlot(bounds, slotId, type, accessoryIndex) {
    if (slotId == null) return;
    const slot = this.hero.inventory.find((entry) => entry.id === slotId);
    const item = slot && ITEMS[slot.itemId];
    if (!slot || !item) return;
    const icon = this.createItemIcon(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 6, slot, {
      width: Math.min(bounds.width - 24, 56),
      height: Math.min(bounds.height - 20, 56),
    });
    const hitArea = this.add.rectangle(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, bounds.width - 10, bounds.height - 10, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => {
      if (type === 'accessory') InventorySystem.unequip(this.hero, 'accessory', accessoryIndex);
      else InventorySystem.unequip(this.hero, type);
      this.setStatusMessage(item.name + ' unequipped.');
      this.refreshInventory();
    });
    attachHoverScaleTooltip(hitArea, icon, {
      tooltipText: () => this.getItemTooltipText(item, slot),
      tooltipY: INVENTORY_WINDOW.y + INVENTORY_WINDOW.height - 54,
      tooltipWidth: INVENTORY_WINDOW.width - 160,
      hoverWidth: icon.displayWidth + 4,
      hoverHeight: icon.displayHeight + 4,
      onHoverChanged: (hovered) => this.setInventoryUniqueHoverState(icon, item, hovered),
    });
    this.dynamicEls.push(hitArea);
    this.renderDurability(slot, bounds.x + bounds.width - 8, bounds.y + bounds.height - 14);
  }

  renderGeneralInventory() {
    const bagSlots = this.hero.inventory.filter((slot) => {
      const item = ITEMS[slot.itemId];
      if (!item) return false;
      if (slot.durability !== null && slot.durability <= 0) return false;
      return !InventorySystem.isSlotEquipped(this.hero, slot.id);
    });

    this.gridCells.forEach((cellData, index) => {
      const slot = bagSlots[index];
      if (!slot) return;
      const item = ITEMS[slot.itemId];
      if (!item) return;
      const centerX = cellData.x + INVENTORY_GRID.cellSize / 2;
      const centerY = cellData.y + INVENTORY_GRID.cellSize / 2;
      const icon = this.createItemIcon(centerX, centerY, slot, { width: 30, height: 30 });
      const hitArea = this.add.rectangle(centerX, centerY, INVENTORY_GRID.cellSize, INVENTORY_GRID.cellSize, 0x000000, 0.001)
        .setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => this.onBagItemClick(slot, item));
      attachHoverScaleTooltip(hitArea, icon, {
        tooltipText: () => this.getItemTooltipText(item, slot),
        tooltipY: INVENTORY_WINDOW.y + INVENTORY_WINDOW.height - 54,
        tooltipWidth: INVENTORY_WINDOW.width - 160,
        hoverWidth: icon.displayWidth + 4,
        hoverHeight: icon.displayHeight + 4,
        onHoverChanged: (hovered) => this.setInventoryUniqueHoverState(icon, item, hovered),
      });
      this.dynamicEls.push(hitArea);
      this.renderDurability(slot, cellData.x + INVENTORY_GRID.cellSize - 2, cellData.y + INVENTORY_GRID.cellSize - 4);
    });
  }

  createItemIcon(x, y, slot, size) {
    const item = slot && ITEMS[slot.itemId];
    const borderColor = this.getRarityColor(item && item.rarity);
    const border = this.add.rectangle(x, y, size.width + 8, size.height + 8, 0x000000, 0).setStrokeStyle(2, borderColor, 0.95);
    this.dynamicEls.push(border);
    let icon = null;
    if (item && item.assetKey && this.textures.exists(item.assetKey)) {
      icon = this.add.sprite(x, y, item.assetKey).setDisplaySize(size.width, size.height);
    } else {
      const fallbackBg = this.add.rectangle(x, y, size.width, size.height, 0x334155).setStrokeStyle(2, borderColor, 0.95);
      const fallbackText = this.add.text(x, y, item ? item.name.charAt(0) : '?', { fontSize: 14, color: '#f8fafc' }).setOrigin(0.5);
      this.dynamicEls.push(fallbackBg, fallbackText);
      return fallbackBg;
    }
    this.dynamicEls.push(icon);
    return icon;
  }

  getInventoryUniqueHoverKeys(item) {
    if (!item || item.rarity !== 'unique' || !item.assetKey) return null;
    const hoverSheetKey = item.hoverSheetKey || `${item.assetKey}-hover-sheet`;
    const hoverAnimKey = item.hoverAnimKey || `${item.assetKey}-hover`;
    if (!this.textures.exists(hoverSheetKey) || !this.anims.exists(hoverAnimKey)) return null;
    return { hoverSheetKey, hoverAnimKey };
  }

  setInventoryUniqueHoverState(icon, item, hovered) {
    const hoverKeys = this.getInventoryUniqueHoverKeys(item);
    if (!hoverKeys || !icon || typeof icon.setTexture !== 'function') return;
    if (hovered) {
      icon.setTexture(hoverKeys.hoverSheetKey, 0);
      if (typeof icon.play === 'function') icon.play(hoverKeys.hoverAnimKey);
      return;
    }
    if (typeof icon.stop === 'function') icon.stop();
    icon.setTexture(item.assetKey);
  }

  renderDurability(slot, x, y) {
    if (slot.durability == null) return;
    const text = this.add.text(x, y, slot.durability + '/' + slot.maxDurability, {
      fontSize: 10,
      color: '#e5e7eb',
      backgroundColor: '#0f172a',
    }).setOrigin(1, 1);
    this.dynamicEls.push(text);
  }

  onBagItemClick(slot, item) {
    if (item.type === 'potion') {
      InventorySystem.usePotion(this.hero, slot.itemId);
      this.setStatusMessage(item.name + ' used.');
      this.refreshInventory();
      return;
    }
    if (item.type === 'weapon' || item.type === 'armor') {
      InventorySystem.equip(this.hero, slot.id);
      this.setStatusMessage(item.name + ' equipped.');
      this.refreshInventory();
      return;
    }
    if (item.type === 'accessory') {
      if (InventorySystem.getFirstEmptyAccessoryIndex(this.hero) === -1) {
        this.setStatusMessage('Unequip an accessory first.');
        return;
      }
      InventorySystem.equip(this.hero, slot.id);
      this.setStatusMessage(item.name + ' equipped.');
      this.refreshInventory();
      return;
    }
    this.setStatusMessage(item.name + ' cannot be used here.');
  }

  getItemTooltipText(item, slot) {
    const parts = [item.name + ' [' + item.rarity + ']'];
    const effectLine = getItemEffectLine(item);
    if (effectLine) parts.push(effectLine);
    if (slot.durability != null) parts.push('Durability: ' + slot.durability + '/' + slot.maxDurability);
    return parts.join('\n');
  }

  getRarityColor(rarity) {
    if (rarity === 'rare') return 0x60a5fa;
    if (rarity === 'legendary') return 0xfbbf24;
    if (rarity === 'unique') return 0xa78bfa;
    return 0x94a3b8;
  }

  setStatusMessage(message) {
    if (!this.statusText) return;
    this.statusText.setText(message || '');
    if (this.statusTimer) this.statusTimer.remove(false);
    this.statusTimer = this.time.delayedCall(1800, () => {
      if (this.statusText) this.statusText.setText('');
      this.statusTimer = null;
    });
  }
}
