/**
 * BuyAndSellScene.js
 * Combined buy and sell shop: icon-only panels, hover tooltips, painted background.
 */

const SHOP_TYPE_LABELS = {
  weapon: 'Weapon',
  armor: 'Armor',
  accessory: 'Accessory',
  potion: 'Consumable',
  material: 'Material',
};

class BuyAndSellScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BuyAndSell' });
  }

  getBuyAndSellHotspotManifest() {
    if (!this.cache || !this.cache.json) return null;
    const manifest = this.cache.json.get('buyandsell-hotspots');
    if (!manifest || !Array.isArray(manifest.hotspots)) return null;
    return manifest;
  }

  getHotspot(id) {
    const manifest = this.getBuyAndSellHotspotManifest();
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
    textObjects.forEach((txt, i) => {
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

  buildBuyTooltipLines(item, itemId, hero) {
    const typeLabel = SHOP_TYPE_LABELS[item.type] || item.type;
    const lines = [item.name + ' (' + item.rarity + ')', typeLabel];
    const lineColors = [null, null];
    const effectLine = typeof getItemEffectLine === 'function' ? getItemEffectLine(item) : '';
    if (effectLine) { lines.push(effectLine); lineColors.push(null); }
    const price = ShopSystem.getPrice(itemId);
    lines.push(price + ' gold');
    lineColors.push(hero.gold >= price ? null : '#ef4444');
    return { lines, lineColors };
  }

  buildSellTooltipLines(item, itemId, isEquipped) {
    const typeLabel = SHOP_TYPE_LABELS[item.type] || item.type;
    const tag = isEquipped ? ' (Equipped)' : '';
    const lines = [item.name + ' (' + item.rarity + ')' + tag, typeLabel];
    const effectLine = typeof getItemEffectLine === 'function' ? getItemEffectLine(item) : '';
    if (effectLine) lines.push(effectLine);
    if (isEquipped) {
      lines.push('Unequip before selling');
    } else {
      lines.push('Sell: ' + ShopSystem.getSellPrice(itemId) + ' gold');
    }
    return lines;
  }

  createItemSlot(hotspot, icon, tooltipLines, onClick, lineColors) {
    if (!hotspot) return;
    const hitArea = this.add.rectangle(
      hotspot.centerX, hotspot.centerY,
      hotspot.width + 8, hotspot.height + 8,
      0x000000, 0
    ).setInteractive({ useHandCursor: !!onClick }).setDepth(20);
    hitArea.on('pointerover', () => {
      if (icon && typeof icon.setDisplaySize === 'function') {
        icon.setDisplaySize(hotspot.width + 4, hotspot.height + 4);
      }
      this.showTooltip(tooltipLines, hotspot.centerX, hotspot.y - 6, lineColors);
    });
    hitArea.on('pointerout', () => {
      if (icon && typeof icon.setDisplaySize === 'function') {
        icon.setDisplaySize(hotspot.width, hotspot.height);
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

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);
    const hero = GAME_STATE.hero;
    InventorySystem.ensureAccessorySlots(hero);
    InventorySystem.ensureSlotBased(hero);
    this.tooltipBg = null;
    this.tooltipText = null;
    this.tooltipTexts = null;

    const hasArt = !!addSceneBackground(this, 'buyandsell-ui-background');
    if (!hasArt) {
      this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0f172a);
    }

    this.add.text(CONFIG.WIDTH / 2, 20, 'Gold: ' + hero.gold, {
      fontSize: 18,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0.5, 0.5).setDepth(25);

    createTownNavRow(this, { currentSection: 'shop' });

    if (!GAME_STATE.shopStock || GAME_STATE.shopStock.length === 0) {
      GAME_STATE.shopStock = ShopSystem.generateStock(hero);
    }

    GAME_STATE.shopStock.forEach((itemId, i) => {
      if (i >= 12) return;
      const item = ITEMS[itemId];
      if (!item) return;
      const row = Math.floor(i / 3) + 1;
      const col = (i % 3) + 1;
      const hotspot = this.getHotspot('buy-' + row + '-' + col);
      if (!hotspot) return;
      const icon = createItemIconSprite(this, item, hotspot.centerX, hotspot.centerY, {
        width: hotspot.width, height: hotspot.height,
      });
      const tooltipData = this.buildBuyTooltipLines(item, itemId, hero);
      const canBuy = ShopSystem.canBuy(hero, itemId);
      this.createItemSlot(hotspot, icon, tooltipData.lines, canBuy ? () => {
        ShopSystem.buy(hero, itemId);
        const idx = GAME_STATE.shopStock.indexOf(itemId);
        if (idx !== -1) GAME_STATE.shopStock.splice(idx, 1);
        this.scene.restart();
      } : null, tooltipData.lineColors);
    });

    const sellable = hero.inventory.filter(s => ITEMS[s.itemId] && ShopSystem.getSellPrice(s.itemId) >= 0);
    const nonEquipped = sellable.filter(s => !InventorySystem.isSlotEquipped(hero, s.id));
    const equipped = sellable.filter(s => InventorySystem.isSlotEquipped(hero, s.id));
    const groupedNonEquipped = typeof groupBagSlots === 'function' ? groupBagSlots(nonEquipped) : nonEquipped.map(s => ({ itemId: s.itemId, slots: [s] }));
    const sellGroups = [];
    groupedNonEquipped.forEach(g => sellGroups.push({ itemId: g.itemId, slots: g.slots, count: g.slots.length, equipped: false }));
    equipped.forEach(s => sellGroups.push({ itemId: s.itemId, slots: [s], count: 1, equipped: true }));

    sellGroups.forEach((group, i) => {
      if (i >= 12) return;
      const row = Math.floor(i / 3) + 1;
      const col = (i % 3) + 1;
      const hotspot = this.getHotspot('sell-' + row + '-' + col);
      if (!hotspot) return;
      const item = ITEMS[group.itemId];
      if (!item) return;
      const icon = createItemIconSprite(this, item, hotspot.centerX, hotspot.centerY, {
        width: hotspot.width, height: hotspot.height,
      });
      if (group.count > 1) {
        this.add.text(hotspot.x + hotspot.width - 2, hotspot.y + hotspot.height - 2, 'x' + group.count, {
          fontSize: 12, color: '#fff', fontFamily: 'Arial',
          stroke: '#0f172a', strokeThickness: 3,
        }).setOrigin(1, 1).setDepth(22);
      }
      const tooltipLines = this.buildSellTooltipLines(item, group.itemId, group.equipped);
      if (group.count > 1) tooltipLines[0] += ' x' + group.count;
      this.createItemSlot(hotspot, icon, tooltipLines, group.equipped ? null : () => {
        hero.gold += ShopSystem.getSellPrice(group.slots[0].itemId);
        InventorySystem.removeSlotById(hero, group.slots[0].id);
        this.scene.restart();
      });
    });

    const backHotspot = this.getHotspot('back-btn');
    if (backHotspot) {
      const backArea = this.add.rectangle(
        backHotspot.centerX, backHotspot.centerY,
        backHotspot.width, backHotspot.height,
        0x000000, 0
      ).setInteractive({ useHandCursor: true });
      backArea.on('pointerdown', () => this.scene.start('Shop'));
    }
  }
}
