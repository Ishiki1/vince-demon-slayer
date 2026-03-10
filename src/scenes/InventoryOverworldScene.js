/**
 * InventoryOverworldScene.js
 * Full-screen Diablo-style inventory layout with paper-doll equipment slots.
 */

const INVENTORY_WINDOW = {
  x: 88,
  y: 40,
  width: 624,
  height: 520,
  slotFill: 0x0b1220,
  slotStroke: 0x4b5563,
  innerFill: 0x111827,
  frameFill: 0x1f2937,
  frameStroke: 0x6b7280,
};

const INVENTORY_GRID = {
  cols: 5,
  rows: 6,
  cellSize: 54,
  cellGap: 8,
  startX: 366,
  startY: 96,
};

// These coordinates mirror inventory-layout-redesign-guide.svg on the fixed 800x600 canvas.
const INVENTORY_LAYOUT = {
  slots: {
    character: { x: 116, y: 96, width: 100, height: 180 },
    weapon: { x: 236, y: 96, width: 100, height: 84 },
    armor: { x: 236, y: 192, width: 100, height: 84 },
    accessory1: { x: 116, y: 300, width: 100, height: 84 },
    accessory2: { x: 236, y: 300, width: 100, height: 84 },
  },
  hero: {
    x: 166,
    y: 186,
    width: 84,
    height: 128,
  },
  equipped: {
    weapon: { x: 286, y: 138, width: 100, height: 84 },
    armor: { x: 286, y: 234, width: 100, height: 84 },
    accessory1: { x: 166, y: 342, width: 100, height: 84 },
    accessory2: { x: 286, y: 342, width: 100, height: 84 },
  },
  bag: {
    iconWidth: 49,
    iconHeight: 49,
    columnXOffsets: [10, 10, 0, 0, 0],
    durabilityXOffset: -2,
    durabilityYOffset: 0,
  },
  closeButton: { x: 636, y: 528, width: 96, height: 36 },
  statusText: { x: 400, y: 72, originX: 0.5, originY: 0.5 },
  tooltip: { x: 400, y: 498, width: 520 },
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
    const data = this.scene.settings.data || {};
    this.returnScene = data.from === 'Town' ? 'Town' : 'Overworld';
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
      character: { ...INVENTORY_LAYOUT.slots.character },
      weapon: { ...INVENTORY_LAYOUT.slots.weapon },
      armor: { ...INVENTORY_LAYOUT.slots.armor },
      accessory1: { ...INVENTORY_LAYOUT.slots.accessory1 },
      accessory2: { ...INVENTORY_LAYOUT.slots.accessory2 },
    };

    this.gridCells = [];
    for (let row = 0; row < INVENTORY_GRID.rows; row++) {
      for (let col = 0; col < INVENTORY_GRID.cols; col++) {
        const x = INVENTORY_GRID.startX + col * (INVENTORY_GRID.cellSize + INVENTORY_GRID.cellGap);
        const y = INVENTORY_GRID.startY + row * (INVENTORY_GRID.cellSize + INVENTORY_GRID.cellGap);
        this.gridCells.push({
          x,
          y,
          centerX: x + INVENTORY_GRID.cellSize / 2,
          centerY: y + INVENTORY_GRID.cellSize / 2,
        });
      }
    }

    if (this.usingLayoutImage) {
      const closeHitArea = this.add.rectangle(
        INVENTORY_LAYOUT.closeButton.x,
        INVENTORY_LAYOUT.closeButton.y,
        INVENTORY_LAYOUT.closeButton.width,
        INVENTORY_LAYOUT.closeButton.height,
        0x000000,
        0.001
      ).setInteractive({ useHandCursor: true }).setDepth(30);
      closeHitArea.on('pointerdown', () => this.scene.start(this.returnScene));
      this.statusText = this.add.text(INVENTORY_LAYOUT.statusText.x, INVENTORY_LAYOUT.statusText.y, '', {
        fontSize: 13,
        color: '#e5e7eb',
      }).setOrigin(
        INVENTORY_LAYOUT.statusText.originX,
        INVENTORY_LAYOUT.statusText.originY
      ).setDepth(30);
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

    this.createStaticSlot(
      INVENTORY_LAYOUT.slots.character.x,
      INVENTORY_LAYOUT.slots.character.y,
      INVENTORY_LAYOUT.slots.character.width,
      INVENTORY_LAYOUT.slots.character.height,
      'Character'
    );
    this.createStaticSlot(
      INVENTORY_LAYOUT.slots.weapon.x,
      INVENTORY_LAYOUT.slots.weapon.y,
      INVENTORY_LAYOUT.slots.weapon.width,
      INVENTORY_LAYOUT.slots.weapon.height,
      'Weapon'
    );
    this.createStaticSlot(
      INVENTORY_LAYOUT.slots.armor.x,
      INVENTORY_LAYOUT.slots.armor.y,
      INVENTORY_LAYOUT.slots.armor.width,
      INVENTORY_LAYOUT.slots.armor.height,
      'Armor'
    );
    this.createStaticSlot(
      INVENTORY_LAYOUT.slots.accessory1.x,
      INVENTORY_LAYOUT.slots.accessory1.y,
      INVENTORY_LAYOUT.slots.accessory1.width,
      INVENTORY_LAYOUT.slots.accessory1.height,
      'Accessory'
    );
    this.createStaticSlot(
      INVENTORY_LAYOUT.slots.accessory2.x,
      INVENTORY_LAYOUT.slots.accessory2.y,
      INVENTORY_LAYOUT.slots.accessory2.width,
      INVENTORY_LAYOUT.slots.accessory2.height,
      'Accessory'
    );

    const gridWidth = INVENTORY_GRID.cols * INVENTORY_GRID.cellSize + (INVENTORY_GRID.cols - 1) * INVENTORY_GRID.cellGap + 22;
    const gridHeight = INVENTORY_GRID.rows * INVENTORY_GRID.cellSize + (INVENTORY_GRID.rows - 1) * INVENTORY_GRID.cellGap + 22;
    const gridFrameCenterX = INVENTORY_GRID.startX - 11 + gridWidth / 2;
    const gridFrameCenterY = INVENTORY_GRID.startY - 11 + gridHeight / 2;
    this.add.rectangle(gridFrameCenterX, gridFrameCenterY, gridWidth, gridHeight, 0x222d3c, 0.92).setStrokeStyle(2, 0x616d7f, 0.95);
    this.add.text(gridFrameCenterX, INVENTORY_GRID.startY - 38, 'General Inventory', { fontSize: 18, color: '#f3f4f6' }).setOrigin(0.5);

    this.gridCells = [];
    for (let row = 0; row < INVENTORY_GRID.rows; row++) {
      for (let col = 0; col < INVENTORY_GRID.cols; col++) {
        const x = INVENTORY_GRID.startX + col * (INVENTORY_GRID.cellSize + INVENTORY_GRID.cellGap);
        const y = INVENTORY_GRID.startY + row * (INVENTORY_GRID.cellSize + INVENTORY_GRID.cellGap);
        const cell = this.add.rectangle(x, y, INVENTORY_GRID.cellSize, INVENTORY_GRID.cellSize, INVENTORY_WINDOW.slotFill, 0.96)
          .setOrigin(0, 0)
          .setStrokeStyle(2, INVENTORY_WINDOW.slotStroke, 0.85);
        this.gridCells.push({
          x,
          y,
          centerX: x + INVENTORY_GRID.cellSize / 2,
          centerY: y + INVENTORY_GRID.cellSize / 2,
          cell,
        });
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
      () => this.scene.start(this.returnScene)
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
    if (this.textures.exists('hero_sheet')) {
      const portrait = this.add.sprite(
        INVENTORY_LAYOUT.hero.x,
        INVENTORY_LAYOUT.hero.y,
        'hero_sheet',
        0
      ).setDisplaySize(INVENTORY_LAYOUT.hero.width, INVENTORY_LAYOUT.hero.height);
      this.dynamicEls.push(portrait);
    } else {
      const fallback = this.add.text(INVENTORY_LAYOUT.hero.x, INVENTORY_LAYOUT.hero.y, this.hero.name, {
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
    const equippedLayoutKey = type === 'accessory' ? `accessory${accessoryIndex + 1}` : type;
    const equippedLayout = INVENTORY_LAYOUT.equipped[equippedLayoutKey];
    const icon = this.createItemIcon(
      equippedLayout.x,
      equippedLayout.y,
      slot,
      { width: equippedLayout.width, height: equippedLayout.height }
    );
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
      tooltipX: INVENTORY_LAYOUT.tooltip.x,
      tooltipY: INVENTORY_LAYOUT.tooltip.y,
      tooltipWidth: INVENTORY_LAYOUT.tooltip.width,
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

    const groups = groupBagSlots(bagSlots);

    this.gridCells.forEach((cellData, index) => {
      const group = groups[index];
      if (!group) return;
      const slot = group.slots[0];
      const item = ITEMS[slot.itemId];
      if (!item) return;
      const count = group.slots.length;
      const col = index % INVENTORY_GRID.cols;
      const columnXOffset = (INVENTORY_LAYOUT.bag.columnXOffsets && INVENTORY_LAYOUT.bag.columnXOffsets[col]) || 0;
      const centerX = cellData.centerX + columnXOffset;
      const centerY = cellData.centerY;
      const icon = this.createItemIcon(centerX, centerY, slot, {
        width: INVENTORY_LAYOUT.bag.iconWidth,
        height: INVENTORY_LAYOUT.bag.iconHeight,
      });
      const hitArea = this.add.rectangle(cellData.x + INVENTORY_GRID.cellSize / 2 + columnXOffset, cellData.y + INVENTORY_GRID.cellSize / 2, INVENTORY_GRID.cellSize, INVENTORY_GRID.cellSize, 0x000000, 0.001)
        .setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => this.onBagItemClick(slot, item));
      attachHoverScaleTooltip(hitArea, icon, {
        tooltipText: () => this.getItemTooltipText(item, slot, count),
        tooltipX: INVENTORY_LAYOUT.tooltip.x,
        tooltipY: INVENTORY_LAYOUT.tooltip.y,
        tooltipWidth: INVENTORY_LAYOUT.tooltip.width,
        hoverWidth: icon.displayWidth + 4,
        hoverHeight: icon.displayHeight + 4,
        onHoverChanged: (hovered) => this.setInventoryUniqueHoverState(icon, item, hovered),
      });
      this.dynamicEls.push(hitArea);
      if (count > 1) {
        const qtyText = this.add.text(
          cellData.x + 4 + columnXOffset,
          cellData.y + INVENTORY_GRID.cellSize - 4,
          'x' + count,
          { fontSize: 8, color: '#ffffff' }
        ).setOrigin(0, 1);
        this.dynamicEls.push(qtyText);
      }
    });
  }

  createItemIcon(x, y, slot, size) {
    const item = slot && ITEMS[slot.itemId];
    let icon = null;
    if (item && item.assetKey && this.textures.exists(item.assetKey)) {
      icon = this.add.sprite(x, y, item.assetKey).setDisplaySize(size.width, size.height);
    } else {
      const fallbackBg = this.add.rectangle(x, y, size.width, size.height, 0x334155, 0.82);
      const fallbackText = this.add.text(x, y, item ? item.name.charAt(0) : '?', { fontSize: 14, color: '#f8fafc' }).setOrigin(0.5);
      this.dynamicEls.push(fallbackBg, fallbackText);
      return fallbackBg;
    }
    this.dynamicEls.push(icon);
    return icon;
  }

  getInventoryUniqueHoverKeys(item) {
    return typeof getResolvedItemHoverKeys === 'function'
      ? getResolvedItemHoverKeys(this, item, { uniqueOnly: true })
      : null;
  }

  setInventoryUniqueHoverState(icon, item, hovered) {
    if (typeof setItemHoverTextureState === 'function') {
      setItemHoverTextureState(this, icon, item, hovered, { uniqueOnly: true });
      return;
    }
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

  getItemTooltipText(item, slot, count) {
    const parts = [item.name + ' [' + item.rarity + ']'];
    const effectLine = getItemEffectLine(item);
    if (effectLine) parts.push(effectLine);
    if (count != null && count > 1) {
      parts.push('Owned: ' + count);
    } else if (slot.durability != null) {
      parts.push('Durability: ' + slot.durability + '/' + slot.maxDurability);
    }
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
