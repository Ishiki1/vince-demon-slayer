/**
 * InventoryPanel.js
 * Combat inventory overlay using the same art and placement as the overworld inventory.
 */

const COMBAT_INVENTORY_WINDOW = {
  x: 88,
  y: 40,
  width: 624,
  height: 520,
  slotFill: 0x0b1220,
  slotStroke: 0x4b5563,
  frameFill: 0x1f2937,
  frameStroke: 0x6b7280,
};

const COMBAT_INVENTORY_GRID = {
  cols: 5,
  rows: 6,
  cellSize: 54,
  cellGap: 8,
  startX: 366,
  startY: 96,
};

const COMBAT_INVENTORY_LAYOUT = {
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
    iconWidth: 54,
    iconHeight: 54,
    durabilityXOffset: -2,
    durabilityYOffset: 0,
  },
  closeButton: { x: 636, y: 528, width: 96, height: 36 },
  statusText: { x: 400, y: 72, originX: 0.5, originY: 0.5 },
  tooltip: { x: 400, y: 498, width: 520 },
};

const COMBAT_INVENTORY_DEPTH = {
  blocker: 40,
  backdrop: 41,
  frame: 45,
  dynamic: 55,
  tooltip: 70,
};

function createInventoryPanel(scene, hero, onEquipOrUse) {
  InventorySystem.ensureSlotBased(hero);
  InventorySystem.ensureAccessorySlots(hero);

  let visible = false;
  let usingLayoutImage = false;
  let staticEls = [];
  let dynamicEls = [];
  let gridCells = [];
  let slotBounds = {};
  let statusText = null;
  let statusTimer = null;
  const tooltipKey = 'combatInventoryTooltipGraphic';

  function destroyTooltip() {
    if (scene[tooltipKey]) {
      scene[tooltipKey].destroy();
      scene[tooltipKey] = null;
    }
  }

  function destroyObjects(objects) {
    objects.forEach((obj) => {
      if (obj && typeof obj.destroy === 'function') obj.destroy();
    });
  }

  function clearDynamic() {
    destroyTooltip();
    destroyObjects(dynamicEls);
    dynamicEls = [];
    if (statusTimer) {
      statusTimer.remove(false);
      statusTimer = null;
    }
    if (statusText) statusText.setText('');
  }

  function setStaticVisible(nextVisible) {
    staticEls.forEach((obj) => {
      if (obj && typeof obj.setVisible === 'function') obj.setVisible(nextVisible);
      if (obj && obj.input) obj.input.enabled = nextVisible;
    });
  }

  function pushStatic(...objects) {
    objects.forEach((obj) => {
      if (obj) staticEls.push(obj);
    });
  }

  function pushDynamic(...objects) {
    objects.forEach((obj) => {
      if (obj) dynamicEls.push(obj);
    });
  }

  function setStatusMessage(message) {
    if (!statusText) return;
    statusText.setText(message || '');
    if (statusTimer) statusTimer.remove(false);
    statusTimer = scene.time.delayedCall(1800, () => {
      if (statusText) statusText.setText('');
      statusTimer = null;
    });
  }

  function getInventoryUniqueHoverKeys(item) {
    return typeof getResolvedItemHoverKeys === 'function'
      ? getResolvedItemHoverKeys(scene, item, { uniqueOnly: true })
      : null;
  }

  function setInventoryUniqueHoverState(icon, item, hovered) {
    if (typeof setItemHoverTextureState === 'function') {
      setItemHoverTextureState(scene, icon, item, hovered, { uniqueOnly: true });
    }
  }

  function getItemTooltipText(item, slot) {
    const parts = [item.name + ' [' + item.rarity + ']'];
    const effectLine = getItemEffectLine(item);
    if (effectLine) parts.push(effectLine);
    if (slot.durability != null) parts.push('Durability: ' + slot.durability + '/' + slot.maxDurability);
    return parts.join('\n');
  }

  function renderDurability(slot, x, y) {
    if (slot.durability == null) return;
    const text = scene.add.text(x, y, slot.durability + '/' + slot.maxDurability, {
      fontSize: 10,
      color: '#e5e7eb',
      backgroundColor: '#0f172a',
    }).setOrigin(1, 1).setDepth(COMBAT_INVENTORY_DEPTH.dynamic + 1);
    pushDynamic(text);
  }

  function createStaticSlot(x, y, width, height, label) {
    const labelBg = scene.add.rectangle(x + width / 2, y - 18, width, 24, 0x253041, 0.95)
      .setStrokeStyle(1, 0x7c8798, 0.8)
      .setDepth(COMBAT_INVENTORY_DEPTH.frame);
    const labelText = scene.add.text(x + width / 2, y - 18, label, {
      fontSize: 14,
      color: '#f9fafb',
    }).setOrigin(0.5).setDepth(COMBAT_INVENTORY_DEPTH.frame + 1);
    const outerSlot = scene.add.rectangle(x + width / 2, y + height / 2, width, height, 0x222d3c, 0.92)
      .setStrokeStyle(2, 0x616d7f, 0.95)
      .setDepth(COMBAT_INVENTORY_DEPTH.frame);
    const innerSlot = scene.add.rectangle(x + width / 2, y + height / 2, width - 10, height - 10, COMBAT_INVENTORY_WINDOW.slotFill, 0.98)
      .setStrokeStyle(1, 0x39465a, 0.9)
      .setDepth(COMBAT_INVENTORY_DEPTH.frame + 1);
    pushStatic(labelBg, labelText, outerSlot, innerSlot);
  }

  function createStaticLayout() {
    if (staticEls.length > 0) return;

    usingLayoutImage = scene.textures.exists('inventory-ui-layout');
    slotBounds = {
      character: { ...COMBAT_INVENTORY_LAYOUT.slots.character },
      weapon: { ...COMBAT_INVENTORY_LAYOUT.slots.weapon },
      armor: { ...COMBAT_INVENTORY_LAYOUT.slots.armor },
      accessory1: { ...COMBAT_INVENTORY_LAYOUT.slots.accessory1 },
      accessory2: { ...COMBAT_INVENTORY_LAYOUT.slots.accessory2 },
    };

    const blocker = scene.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x000000, 0.001)
      .setInteractive()
      .setDepth(COMBAT_INVENTORY_DEPTH.blocker);
    blocker.on('pointerdown', () => {});
    pushStatic(blocker);

    gridCells = [];
    for (let row = 0; row < COMBAT_INVENTORY_GRID.rows; row++) {
      for (let col = 0; col < COMBAT_INVENTORY_GRID.cols; col++) {
        const x = COMBAT_INVENTORY_GRID.startX + col * (COMBAT_INVENTORY_GRID.cellSize + COMBAT_INVENTORY_GRID.cellGap);
        const y = COMBAT_INVENTORY_GRID.startY + row * (COMBAT_INVENTORY_GRID.cellSize + COMBAT_INVENTORY_GRID.cellGap);
        gridCells.push({
          x,
          y,
          centerX: x + COMBAT_INVENTORY_GRID.cellSize / 2,
          centerY: y + COMBAT_INVENTORY_GRID.cellSize / 2,
        });
      }
    }

    if (usingLayoutImage) {
      const backdrop = scene.add.image(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 'inventory-ui-layout')
        .setDisplaySize(CONFIG.WIDTH, CONFIG.HEIGHT)
        .setDepth(COMBAT_INVENTORY_DEPTH.backdrop);
      const closeHitArea = scene.add.rectangle(
        COMBAT_INVENTORY_LAYOUT.closeButton.x,
        COMBAT_INVENTORY_LAYOUT.closeButton.y,
        COMBAT_INVENTORY_LAYOUT.closeButton.width,
        COMBAT_INVENTORY_LAYOUT.closeButton.height,
        0x000000,
        0.001
      ).setInteractive({ useHandCursor: true }).setDepth(COMBAT_INVENTORY_DEPTH.frame + 5);
      closeHitArea.on('pointerdown', hide);
      statusText = scene.add.text(COMBAT_INVENTORY_LAYOUT.statusText.x, COMBAT_INVENTORY_LAYOUT.statusText.y, '', {
        fontSize: 13,
        color: '#e5e7eb',
      }).setOrigin(
        COMBAT_INVENTORY_LAYOUT.statusText.originX,
        COMBAT_INVENTORY_LAYOUT.statusText.originY
      ).setDepth(COMBAT_INVENTORY_DEPTH.frame + 5);
      pushStatic(backdrop, closeHitArea, statusText);
      return;
    }

    if (scene.textures.exists('overworld-ui-background')) {
      const backdrop = scene.add.image(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 'overworld-ui-background')
        .setDisplaySize(CONFIG.WIDTH, CONFIG.HEIGHT)
        .setDepth(COMBAT_INVENTORY_DEPTH.backdrop);
      const shade = scene.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x020617, 0.42)
        .setDepth(COMBAT_INVENTORY_DEPTH.backdrop + 1);
      pushStatic(backdrop, shade);
    } else {
      const fallbackBg = scene.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0f172a)
        .setDepth(COMBAT_INVENTORY_DEPTH.backdrop);
      pushStatic(fallbackBg);
    }

    const windowFrame = scene.add.rectangle(
      COMBAT_INVENTORY_WINDOW.x + COMBAT_INVENTORY_WINDOW.width / 2,
      COMBAT_INVENTORY_WINDOW.y + COMBAT_INVENTORY_WINDOW.height / 2,
      COMBAT_INVENTORY_WINDOW.width,
      COMBAT_INVENTORY_WINDOW.height,
      COMBAT_INVENTORY_WINDOW.frameFill,
      0.96
    ).setStrokeStyle(3, COMBAT_INVENTORY_WINDOW.frameStroke, 1).setDepth(COMBAT_INVENTORY_DEPTH.frame);
    const titleBg = scene.add.rectangle(
      COMBAT_INVENTORY_WINDOW.x + COMBAT_INVENTORY_WINDOW.width / 2,
      COMBAT_INVENTORY_WINDOW.y + 24,
      210,
      38,
      0x2b3444,
      0.95
    ).setStrokeStyle(2, 0x8b98aa, 0.9).setDepth(COMBAT_INVENTORY_DEPTH.frame + 1);
    const titleText = scene.add.text(COMBAT_INVENTORY_WINDOW.x + COMBAT_INVENTORY_WINDOW.width / 2, COMBAT_INVENTORY_WINDOW.y + 24, 'Inventory', {
      fontSize: 24,
      color: '#f3f4f6',
      fontFamily: 'Georgia',
    }).setOrigin(0.5).setDepth(COMBAT_INVENTORY_DEPTH.frame + 2);
    pushStatic(windowFrame, titleBg, titleText);

    createStaticSlot(
      COMBAT_INVENTORY_LAYOUT.slots.character.x,
      COMBAT_INVENTORY_LAYOUT.slots.character.y,
      COMBAT_INVENTORY_LAYOUT.slots.character.width,
      COMBAT_INVENTORY_LAYOUT.slots.character.height,
      'Character'
    );
    createStaticSlot(
      COMBAT_INVENTORY_LAYOUT.slots.weapon.x,
      COMBAT_INVENTORY_LAYOUT.slots.weapon.y,
      COMBAT_INVENTORY_LAYOUT.slots.weapon.width,
      COMBAT_INVENTORY_LAYOUT.slots.weapon.height,
      'Weapon'
    );
    createStaticSlot(
      COMBAT_INVENTORY_LAYOUT.slots.armor.x,
      COMBAT_INVENTORY_LAYOUT.slots.armor.y,
      COMBAT_INVENTORY_LAYOUT.slots.armor.width,
      COMBAT_INVENTORY_LAYOUT.slots.armor.height,
      'Armor'
    );
    createStaticSlot(
      COMBAT_INVENTORY_LAYOUT.slots.accessory1.x,
      COMBAT_INVENTORY_LAYOUT.slots.accessory1.y,
      COMBAT_INVENTORY_LAYOUT.slots.accessory1.width,
      COMBAT_INVENTORY_LAYOUT.slots.accessory1.height,
      'Accessory'
    );
    createStaticSlot(
      COMBAT_INVENTORY_LAYOUT.slots.accessory2.x,
      COMBAT_INVENTORY_LAYOUT.slots.accessory2.y,
      COMBAT_INVENTORY_LAYOUT.slots.accessory2.width,
      COMBAT_INVENTORY_LAYOUT.slots.accessory2.height,
      'Accessory'
    );

    const gridWidth = COMBAT_INVENTORY_GRID.cols * COMBAT_INVENTORY_GRID.cellSize + (COMBAT_INVENTORY_GRID.cols - 1) * COMBAT_INVENTORY_GRID.cellGap + 22;
    const gridHeight = COMBAT_INVENTORY_GRID.rows * COMBAT_INVENTORY_GRID.cellSize + (COMBAT_INVENTORY_GRID.rows - 1) * COMBAT_INVENTORY_GRID.cellGap + 22;
    const gridFrameCenterX = COMBAT_INVENTORY_GRID.startX - 11 + gridWidth / 2;
    const gridFrameCenterY = COMBAT_INVENTORY_GRID.startY - 11 + gridHeight / 2;
    const gridFrame = scene.add.rectangle(gridFrameCenterX, gridFrameCenterY, gridWidth, gridHeight, 0x222d3c, 0.92)
      .setStrokeStyle(2, 0x616d7f, 0.95)
      .setDepth(COMBAT_INVENTORY_DEPTH.frame);
    const gridTitle = scene.add.text(gridFrameCenterX, COMBAT_INVENTORY_GRID.startY - 38, 'General Inventory', {
      fontSize: 18,
      color: '#f3f4f6',
    }).setOrigin(0.5).setDepth(COMBAT_INVENTORY_DEPTH.frame + 1);
    pushStatic(gridFrame, gridTitle);

    gridCells = [];
    for (let row = 0; row < COMBAT_INVENTORY_GRID.rows; row++) {
      for (let col = 0; col < COMBAT_INVENTORY_GRID.cols; col++) {
        const x = COMBAT_INVENTORY_GRID.startX + col * (COMBAT_INVENTORY_GRID.cellSize + COMBAT_INVENTORY_GRID.cellGap);
        const y = COMBAT_INVENTORY_GRID.startY + row * (COMBAT_INVENTORY_GRID.cellSize + COMBAT_INVENTORY_GRID.cellGap);
        const cell = scene.add.rectangle(x, y, COMBAT_INVENTORY_GRID.cellSize, COMBAT_INVENTORY_GRID.cellSize, COMBAT_INVENTORY_WINDOW.slotFill, 0.96)
          .setOrigin(0, 0)
          .setStrokeStyle(2, COMBAT_INVENTORY_WINDOW.slotStroke, 0.85)
          .setDepth(COMBAT_INVENTORY_DEPTH.frame + 1);
        pushStatic(cell);
        gridCells.push({
          x,
          y,
          centerX: x + COMBAT_INVENTORY_GRID.cellSize / 2,
          centerY: y + COMBAT_INVENTORY_GRID.cellSize / 2,
        });
      }
    }

    const closeButton = createButton(
      scene,
      COMBAT_INVENTORY_WINDOW.x + COMBAT_INVENTORY_WINDOW.width - 48,
      COMBAT_INVENTORY_WINDOW.y + COMBAT_INVENTORY_WINDOW.height - 24,
      94,
      34,
      'Close',
      { bgColor: 0x7c5a3a, fontSize: 15 },
      hide
    );
    closeButton.rect.setStrokeStyle(2, 0xb89b7a, 0.9);
    closeButton.rect.setDepth(COMBAT_INVENTORY_DEPTH.frame + 2);
    closeButton.text.setDepth(COMBAT_INVENTORY_DEPTH.frame + 3);
    pushStatic(closeButton.rect, closeButton.text);

    statusText = scene.add.text(COMBAT_INVENTORY_WINDOW.x + 28, COMBAT_INVENTORY_WINDOW.y + COMBAT_INVENTORY_WINDOW.height - 34, '', {
      fontSize: 13,
      color: '#e5e7eb',
    }).setDepth(COMBAT_INVENTORY_DEPTH.frame + 2);
    pushStatic(statusText);
  }

  function createItemIcon(x, y, slot, size) {
    const item = slot && ITEMS[slot.itemId];
    let icon = null;
    if (item && item.assetKey && scene.textures.exists(item.assetKey)) {
      icon = scene.add.sprite(x, y, item.assetKey).setDisplaySize(size.width, size.height);
      icon.setDepth(COMBAT_INVENTORY_DEPTH.dynamic);
      pushDynamic(icon);
      return icon;
    }
    const fallbackBg = scene.add.rectangle(x, y, size.width, size.height, 0x334155, 0.82)
      .setDepth(COMBAT_INVENTORY_DEPTH.dynamic);
    const fallbackText = scene.add.text(x, y, item ? item.name.charAt(0) : '?', {
      fontSize: 14,
      color: '#f8fafc',
    }).setOrigin(0.5).setDepth(COMBAT_INVENTORY_DEPTH.dynamic + 1);
    pushDynamic(fallbackBg, fallbackText);
    return fallbackBg;
  }

  function renderCharacterPreview() {
    if (scene.textures.exists('hero_sheet')) {
      const portrait = scene.add.sprite(
        COMBAT_INVENTORY_LAYOUT.hero.x,
        COMBAT_INVENTORY_LAYOUT.hero.y,
        'hero_sheet',
        0
      ).setDisplaySize(COMBAT_INVENTORY_LAYOUT.hero.width, COMBAT_INVENTORY_LAYOUT.hero.height);
      portrait.setDepth(COMBAT_INVENTORY_DEPTH.dynamic);
      pushDynamic(portrait);
      return;
    }
    const fallback = scene.add.text(COMBAT_INVENTORY_LAYOUT.hero.x, COMBAT_INVENTORY_LAYOUT.hero.y, hero.name, {
      fontSize: 20,
      color: '#f8fafc',
    }).setOrigin(0.5).setDepth(COMBAT_INVENTORY_DEPTH.dynamic);
    pushDynamic(fallback);
  }

  function handleSlotClick(slot, item, actionText) {
    if (!slot || !item) return;
    if (item.type === 'accessory'
      && !InventorySystem.isAccessoryEquipped(hero, slot.id)
      && InventorySystem.getFirstEmptyAccessoryIndex(hero) === -1) {
      setStatusMessage('Unequip an accessory first.');
      return;
    }
    onEquipOrUse(slot);
    if (actionText) setStatusMessage(item.name + ' ' + actionText + '.');
  }

  function renderEquippedSlot(bounds, slotId, layoutKey) {
    if (slotId == null) return;
    const slot = hero.inventory.find((entry) => entry.id === slotId);
    const item = slot && ITEMS[slot.itemId];
    if (!slot || !item) return;
    const layout = COMBAT_INVENTORY_LAYOUT.equipped[layoutKey];
    const icon = createItemIcon(layout.x, layout.y, slot, { width: layout.width, height: layout.height });
    const hitArea = scene.add.rectangle(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, bounds.width - 10, bounds.height - 10, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(COMBAT_INVENTORY_DEPTH.dynamic + 2);
    hitArea.on('pointerdown', () => handleSlotClick(slot, item, 'unequipped'));
    attachHoverScaleTooltip(hitArea, icon, {
      tooltipKey,
      tooltipText: () => getItemTooltipText(item, slot),
      tooltipX: COMBAT_INVENTORY_LAYOUT.tooltip.x,
      tooltipY: COMBAT_INVENTORY_LAYOUT.tooltip.y,
      tooltipWidth: COMBAT_INVENTORY_LAYOUT.tooltip.width,
      tooltipDepth: COMBAT_INVENTORY_DEPTH.tooltip,
      hoverWidth: icon.displayWidth + 4,
      hoverHeight: icon.displayHeight + 4,
      onHoverChanged: (hovered) => setInventoryUniqueHoverState(icon, item, hovered),
    });
    pushDynamic(hitArea);
    renderDurability(slot, bounds.x + bounds.width - 8, bounds.y + bounds.height - 14);
  }

  function renderGeneralInventory() {
    const bagSlots = hero.inventory.filter((slot) => {
      const item = ITEMS[slot.itemId];
      if (!item) return false;
      if (slot.durability !== null && slot.durability <= 0) return false;
      return !InventorySystem.isSlotEquipped(hero, slot.id);
    });

    gridCells.forEach((cellData, index) => {
      const slot = bagSlots[index];
      if (!slot) return;
      const item = ITEMS[slot.itemId];
      if (!item) return;
      const icon = createItemIcon(cellData.centerX, cellData.centerY, slot, {
        width: COMBAT_INVENTORY_LAYOUT.bag.iconWidth,
        height: COMBAT_INVENTORY_LAYOUT.bag.iconHeight,
      });
      const hitArea = scene.add.rectangle(
        cellData.x + COMBAT_INVENTORY_GRID.cellSize / 2,
        cellData.y + COMBAT_INVENTORY_GRID.cellSize / 2,
        COMBAT_INVENTORY_GRID.cellSize,
        COMBAT_INVENTORY_GRID.cellSize,
        0x000000,
        0.001
      ).setInteractive({ useHandCursor: true }).setDepth(COMBAT_INVENTORY_DEPTH.dynamic + 2);
      const actionText = item.type === 'potion'
        ? 'used'
        : ((item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') ? 'equipped' : '');
      hitArea.on('pointerdown', () => handleSlotClick(slot, item, actionText));
      attachHoverScaleTooltip(hitArea, icon, {
        tooltipKey,
        tooltipText: () => getItemTooltipText(item, slot),
        tooltipX: COMBAT_INVENTORY_LAYOUT.tooltip.x,
        tooltipY: COMBAT_INVENTORY_LAYOUT.tooltip.y,
        tooltipWidth: COMBAT_INVENTORY_LAYOUT.tooltip.width,
        tooltipDepth: COMBAT_INVENTORY_DEPTH.tooltip,
        hoverWidth: icon.displayWidth + 4,
        hoverHeight: icon.displayHeight + 4,
        onHoverChanged: (hovered) => setInventoryUniqueHoverState(icon, item, hovered),
      });
      pushDynamic(hitArea);
      renderDurability(
        slot,
        cellData.x + COMBAT_INVENTORY_GRID.cellSize - 2 + COMBAT_INVENTORY_LAYOUT.bag.durabilityXOffset,
        cellData.y + COMBAT_INVENTORY_GRID.cellSize - 4 + COMBAT_INVENTORY_LAYOUT.bag.durabilityYOffset
      );
    });
  }

  function refresh() {
    InventorySystem.ensureSlotBased(hero);
    InventorySystem.ensureAccessorySlots(hero);
    if (!visible) return;
    clearDynamic();
    renderCharacterPreview();
    renderEquippedSlot(slotBounds.weapon, hero.weapon, 'weapon');
    renderEquippedSlot(slotBounds.armor, hero.armor, 'armor');
    renderEquippedSlot(slotBounds.accessory1, hero.accessories[0], 'accessory1');
    renderEquippedSlot(slotBounds.accessory2, hero.accessories[1], 'accessory2');
    renderGeneralInventory();
  }

  function show() {
    createStaticLayout();
    visible = true;
    setStaticVisible(true);
    refresh();
  }

  function hide() {
    visible = false;
    clearDynamic();
    setStaticVisible(false);
  }

  function toggle() {
    if (visible) hide();
    else show();
  }

  return {
    toggle,
    show,
    hide,
    refresh,
    isVisible() {
      return visible;
    },
    destroy() {
      hide();
      destroyObjects(staticEls);
      staticEls = [];
      statusText = null;
      if (statusTimer) {
        statusTimer.remove(false);
        statusTimer = null;
      }
      destroyTooltip();
    },
  };
}
