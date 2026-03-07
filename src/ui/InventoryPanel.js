/**
 * InventoryPanel.js
 * Slot-based inventory: slot summary, list grouped by type with Equip/Unequip.
 * Scroll and type filter. Shows durability for equippables.
 */

const PANEL_TYPE_ORDER = ['weapon', 'armor', 'accessory', 'potion'];
const PANEL_TYPE_LABELS = {
  weapon: 'Weapons',
  armor: 'Armor',
  accessory: 'Accessories',
  potion: 'Consumables',
};
const PANEL_RARITY_ORDER = { common: 0, rare: 1, legendary: 2 };

function groupInventoryByTypePanel(hero, typeFilter) {
  InventorySystem.ensureSlotBased(hero);
  const groups = {};
  PANEL_TYPE_ORDER.forEach(t => { groups[t] = []; });
  hero.inventory.forEach(slot => {
    const item = ITEMS[slot.itemId];
    if (!item || !groups[item.type]) return;
    if (slot.durability !== null && slot.durability <= 0) return;
    if (typeFilter && typeFilter !== 'all' && item.type !== typeFilter) return;
    groups[item.type].push(slot);
  });
  PANEL_TYPE_ORDER.forEach(type => {
    groups[type].sort((a, b) => {
      const ra = PANEL_RARITY_ORDER[ITEMS[a.itemId].rarity] ?? 0;
      const rb = PANEL_RARITY_ORDER[ITEMS[b.itemId].rarity] ?? 0;
      return ra - rb;
    });
  });
  return groups;
}

function createInventoryPanel(scene, hero, onEquipOrUse) {
  InventorySystem.ensureAccessorySlots(hero);
  const panelWidth = 320;
  const panelHeight = 420;
  const x = CONFIG.WIDTH - panelWidth - 20;
  const y = 60;
  let visible = false;
  let bg = null;
  let titleText = null;
  let goldText = null;
  let slotWeaponText = null;
  let slotArmorText = null;
  let slotAccessory1Text = null;
  let slotAccessory2Text = null;
  let itemTexts = [];
  let filterEls = [];
  let scrollOffset = 0;
  let typeFilter = 'all';
  const slotLineHeight = 14;
  const listStartOffset = 56 + 4 * slotLineHeight;
  const lineHeight = 32;
  const headerHeight = 14;
  const listVisibleHeight = panelHeight - listStartOffset - 50;
  const rowHeightEst = 38;
  const maxVisibleRows = Math.max(1, Math.floor(listVisibleHeight / rowHeightEst));

  function getSlotName(slotId) {
    if (slotId == null) return 'None';
    const slot = hero.inventory.find(s => s.id === slotId);
    if (!slot || !ITEMS[slot.itemId]) return 'None';
    return ITEMS[slot.itemId].name;
  }

  function isSlotEquipped(slotId, type) {
    if (type === 'accessory') return InventorySystem.isAccessoryEquipped(hero, slotId);
    return hero[type] === slotId;
  }

  function refresh() {
    itemTexts.forEach(t => t.destroy && t.destroy());
    itemTexts = [];
    if (goldText) goldText.setText('Gold: ' + hero.gold);
    if (slotWeaponText) slotWeaponText.setText('Weapon: ' + getSlotName(hero.weapon));
    if (slotArmorText) slotArmorText.setText('Armor: ' + getSlotName(hero.armor));
    if (slotAccessory1Text) slotAccessory1Text.setText('Accessory 1: ' + getSlotName(hero.accessories[0]));
    if (slotAccessory2Text) slotAccessory2Text.setText('Accessory 2: ' + getSlotName(hero.accessories[1]));
    if (!bg || !visible) return;

    const groups = groupInventoryByTypePanel(hero, typeFilter);
    let flatSlots = [];
    PANEL_TYPE_ORDER.forEach(type => {
      const slots = groups[type];
      if (slots.length) flatSlots.push({ type, header: PANEL_TYPE_LABELS[type], slots });
    });

    let totalRows = 0;
    flatSlots.forEach(g => { totalRows += 1 + g.slots.length; });
    const maxScroll = Math.max(0, totalRows - maxVisibleRows);
    scrollOffset = Math.min(scrollOffset, maxScroll);

    let currentY = y + listStartOffset;
    let rowIndex = 0;
    flatSlots.forEach(({ type, header, slots }) => {
      if (rowIndex >= scrollOffset + maxVisibleRows) return;
      if (rowIndex >= scrollOffset) {
        const headerObj = scene.add.text(x + 16, currentY, header, { fontSize: 11, color: '#64748b' });
        itemTexts.push(headerObj);
        currentY += headerHeight;
      }
      rowIndex++;
      slots.forEach(slot => {
        if (rowIndex < scrollOffset) { rowIndex++; return; }
        if (rowIndex >= scrollOffset + maxVisibleRows) return;
        const item = ITEMS[slot.itemId];
        if (!item) return;
        const ty = currentY;
        const tx = x + 16;
        const isEquipped = isSlotEquipped(slot.id, item.type);
        const hasAction = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory' || item.type === 'potion';
        const btnLabel = (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') ? (isEquipped ? 'Unequip' : 'Equip') : (item.type === 'potion' ? 'Use' : null);
        let line1Str = item.name + ' [' + item.rarity + ']';
        if (slot.durability != null) line1Str += ' ' + slot.durability + '/' + slot.maxDurability;
        const line1 = scene.add.text(tx, ty, line1Str, { fontSize: 13, color: '#fff' });
        const effectLine = getItemEffectLine(item);
        const line2 = effectLine ? scene.add.text(tx, ty + 14, effectLine, { fontSize: 11, color: '#a5b4fc' }) : null;
        const rowHeight = lineHeight + (line2 ? 14 : 0);
        if (btnLabel) {
          const btnWidth = 56;
          const btnHeight = 20;
          const btnX = x + panelWidth - 16 - btnWidth;
          const btnY = ty + (rowHeight - btnHeight) / 2;
          const btn = scene.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x475569).setOrigin(0, 0);
          btn.setInteractive({ useHandCursor: true });
          btn.setDepth(1);
          const btnText = scene.add.text(btnX + btnWidth / 2, btnY + btnHeight / 2, btnLabel, { fontSize: 11, color: '#fff' }).setOrigin(0.5);
          btnText.setDepth(1);
          btn.on('pointerdown', () => onEquipOrUse(slot));
          itemTexts.push(line1, btn, btnText);
        } else {
          itemTexts.push(line1);
        }
        if (line2) itemTexts.push(line2);
        currentY += rowHeight;
        rowIndex++;
      });
      currentY += 4;
    });

    if (totalRows > maxVisibleRows) {
      const upBtn = scene.add.rectangle(x + panelWidth - 28, y + listStartOffset + 10, 24, 24, 0x475569);
      upBtn.setInteractive({ useHandCursor: true });
      upBtn.setDepth(2);
      upBtn.on('pointerdown', () => { scrollOffset = Math.max(0, scrollOffset - 1); refresh(); });
      itemTexts.push(upBtn);
      const downBtn = scene.add.rectangle(x + panelWidth - 28, y + listStartOffset + listVisibleHeight - 34, 24, 24, 0x475569);
      downBtn.setInteractive({ useHandCursor: true });
      downBtn.setDepth(2);
      downBtn.on('pointerdown', () => { scrollOffset = Math.min(maxScroll, scrollOffset + 1); refresh(); });
      itemTexts.push(downBtn);
    }
  }

  function show() {
    visible = true;
    scrollOffset = 0;
    if (!bg) {
      bg = scene.add.rectangle(x, y, panelWidth, panelHeight, 0x1e293b).setOrigin(0, 0);
      titleText = scene.add.text(x + panelWidth / 2, y + 16, 'Inventory', { fontSize: 18, color: '#fff' }).setOrigin(0.5, 0);
      goldText = scene.add.text(x + 16, y + 38, 'Gold: ' + hero.gold, { fontSize: 14, color: '#fbbf24' });
      slotWeaponText = scene.add.text(x + 16, y + 56, 'Weapon: None', { fontSize: 12, color: '#94a3b8' });
      slotArmorText = scene.add.text(x + 16, y + 56 + slotLineHeight, 'Armor: None', { fontSize: 12, color: '#94a3b8' });
      slotAccessory1Text = scene.add.text(x + 16, y + 56 + 2 * slotLineHeight, 'Accessory 1: None', { fontSize: 12, color: '#94a3b8' });
      slotAccessory2Text = scene.add.text(x + 16, y + 56 + 3 * slotLineHeight, 'Accessory 2: None', { fontSize: 12, color: '#94a3b8' });
      const filterLabels = ['All', 'Weap', 'Armor', 'Acc', 'Cons'];
      const filterValues = ['all', 'weapon', 'armor', 'accessory', 'potion'];
      filterLabels.forEach((label, i) => {
        const btn = scene.add.rectangle(x + 16 + i * 50, y + listStartOffset - 22, 48, 18, 0x334155).setOrigin(0, 0);
        btn.setInteractive({ useHandCursor: true });
        const txt = scene.add.text(x + 16 + i * 50 + 24, y + listStartOffset - 13, label, { fontSize: 9, color: '#94a3b8' }).setOrigin(0.5);
        const v = filterValues[i];
        btn.on('pointerdown', () => { typeFilter = v; refresh(); });
        filterEls.push(btn, txt);
      });
    }
    bg.setVisible(true);
    if (titleText) titleText.setVisible(true);
    if (goldText) goldText.setVisible(true);
    if (slotWeaponText) slotWeaponText.setVisible(true);
    if (slotArmorText) slotArmorText.setVisible(true);
    if (slotAccessory1Text) slotAccessory1Text.setVisible(true);
    if (slotAccessory2Text) slotAccessory2Text.setVisible(true);
    filterEls.forEach(t => t.setVisible && t.setVisible(true));
    refresh();
  }

  function hide() {
    visible = false;
    if (bg) bg.setVisible(false);
    if (titleText) titleText.setVisible(false);
    if (goldText) goldText.setVisible(false);
    if (slotWeaponText) slotWeaponText.setVisible(false);
    if (slotArmorText) slotArmorText.setVisible(false);
    if (slotAccessory1Text) slotAccessory1Text.setVisible(false);
    if (slotAccessory2Text) slotAccessory2Text.setVisible(false);
    itemTexts.forEach(t => t.destroy && t.destroy());
    itemTexts = [];
    filterEls.forEach(t => t.setVisible && t.setVisible(false));
  }

  function toggle() {
    visible = !visible;
    if (visible) show();
    else hide();
  }

  return {
    toggle,
    show,
    hide,
    refresh,
    destroy() {
      hide();
      filterEls.forEach(t => t.destroy && t.destroy());
      filterEls = [];
      if (bg) bg.destroy();
      if (titleText) titleText.destroy();
      if (goldText) goldText.destroy();
      if (slotWeaponText) slotWeaponText.destroy();
      if (slotArmorText) slotArmorText.destroy();
      if (slotAccessory1Text) slotAccessory1Text.destroy();
      if (slotAccessory2Text) slotAccessory2Text.destroy();
    },
  };
}
