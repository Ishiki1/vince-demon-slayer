/**
 * ShopScene.js
 * First screen: Buy or Sell. Buy: random stock with type, buy with gold. Sell: list inventory, sell at 50% price.
 */

const SHOP_TYPE_LABELS = {
  weapon: 'Weapon',
  armor: 'Armor',
  accessory: 'Accessory',
  potion: 'Consumable',
};

const SHOP_SELL_FILTER_LABELS = ['All', 'Weapons', 'Armor', 'Accessories', 'Consumables'];
const SHOP_SELL_FILTER_VALUES = ['all', 'weapon', 'armor', 'accessory', 'potion'];

class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Shop' });
  }

  getShopHotspotManifest() {
    if (!this.cache || !this.cache.json) return null;
    const manifest = this.cache.json.get('shop-hotspots');
    if (!manifest || !Array.isArray(manifest.hotspots)) return null;
    return manifest;
  }

  getShopHotspot(hotspotId) {
    const manifest = this.getShopHotspotManifest();
    if (!manifest) return null;
    return manifest.hotspots.find((hotspot) => hotspot.id === hotspotId) || null;
  }

  createChoiceHotspot(rect, onClick) {
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

  openShopView(nextView) {
    GAME_STATE.shopView = nextView;
    this.scene.restart();
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    InventorySystem.ensureAccessorySlots(hero);
    const shopView = GAME_STATE.shopView || 'choice';
    const hasArt = this.drawSceneFrame(hero, shopView);

    if (shopView === 'choice') {
      const buyHotspot = hasArt ? this.getShopHotspot('buy') : null;
      const sellHotspot = hasArt ? this.getShopHotspot('sell') : null;
      if (buyHotspot && sellHotspot) {
        this.createChoiceHotspot(buyHotspot, () => this.openShopView('buy'));
        this.createChoiceHotspot(sellHotspot, () => this.openShopView('sell'));
        return;
      }
      const buyBtn = this.add.rectangle(w / 2, h / 2 - 50, 200, 56, 0x4ade80);
      buyBtn.setInteractive({ useHandCursor: true });
      this.add.text(w / 2, h / 2 - 50, 'Buy', { fontSize: 22, color: '#fff' }).setOrigin(0.5);
      buyBtn.on('pointerdown', () => this.openShopView('buy'));
      const sellBtn = this.add.rectangle(w / 2, h / 2 + 30, 200, 56, 0x0ea5e9);
      sellBtn.setInteractive({ useHandCursor: true });
      this.add.text(w / 2, h / 2 + 30, 'Sell', { fontSize: 22, color: '#fff' }).setOrigin(0.5);
      sellBtn.on('pointerdown', () => this.openShopView('sell'));
      return;
    }

    if (shopView === 'buy') {
      if (!GAME_STATE.shopStock || GAME_STATE.shopStock.length === 0) {
        GAME_STATE.shopStock = ShopSystem.generateStock(hero);
      }
      this.stock = GAME_STATE.shopStock;
      const rerollCost = typeof getFinalGoldCost === 'function' ? getFinalGoldCost(CONFIG.SHOP_REROLL_COST) : CONFIG.SHOP_REROLL_COST;
      const canReroll = hero.gold >= rerollCost;
      const rerollBtn = this.add.rectangle(w - 100, 100, 140, 36, canReroll ? 0x78716c : 0x475569);
      rerollBtn.setInteractive({ useHandCursor: canReroll });
      this.add.text(w - 100, 100, 'Re-roll (' + rerollCost + 'g)', { fontSize: 13, color: '#fff' }).setOrigin(0.5);
      if (canReroll) {
        rerollBtn.on('pointerdown', () => {
          hero.gold -= rerollCost;
          GAME_STATE.shopStock = ShopSystem.generateStock(hero);
          this.scene.restart();
        });
      }
      this.stock.forEach((itemId, i) => {
        const item = ITEMS[itemId];
        if (!item) return;
        const y = 120 + i * 88;
        const typeLabel = SHOP_TYPE_LABELS[item.type] || item.type;
        const canBuy = ShopSystem.canBuy(hero, itemId);
        createItemIconSprite(this, item, 44, y + 12, { width: 36, height: 36 });
        this.add.text(80, y - 4, item.name + ' (' + item.rarity + ') — ' + typeLabel, { fontSize: 16, color: '#e5e7eb' });
        const effectLine = getItemEffectLine(item);
        if (effectLine) this.add.text(80, y + 14, effectLine, { fontSize: 12, color: '#a5b4fc' });
        const price = ShopSystem.getPrice(itemId);
        this.add.text(80, y + 32, price + ' gold', { fontSize: 14, color: '#fbbf24' });
        const buyBtn = this.add.rectangle(w - 120, y + 16, 80, 44, canBuy ? 0x4ade80 : 0x64748b);
        buyBtn.setInteractive({ useHandCursor: true });
        this.add.text(w - 120, y + 16, 'Buy', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
        if (canBuy) {
          buyBtn.on('pointerdown', () => {
            ShopSystem.buy(hero, itemId);
            const idx = GAME_STATE.shopStock.indexOf(itemId);
            if (idx !== -1) GAME_STATE.shopStock.splice(idx, 1);
            this.scene.restart();
          });
        }
      });
      const backToChoice = this.add.rectangle(w / 2, h - 60, 180, 48, 0x475569);
      backToChoice.setInteractive({ useHandCursor: true });
      this.add.text(w / 2, h - 60, 'Back to Shop', { fontSize: 16, color: '#fff' }).setOrigin(0.5);
      backToChoice.on('pointerdown', () => this.openShopView('choice'));
      return;
    }

    if (shopView === 'sell') {
      InventorySystem.ensureSlotBased(hero);
      const sellFilter = GAME_STATE.shopSellFilter != null ? GAME_STATE.shopSellFilter : 'all';

      let sellable = hero.inventory.filter(s => ITEMS[s.itemId] && ShopSystem.getSellPrice(s.itemId) >= 0);
      if (sellFilter !== 'all') {
        sellable = sellable.filter(s => ITEMS[s.itemId].type === sellFilter);
      }

      const nonEquippedNonPotion = hero.inventory.filter(s => {
        const item = ITEMS[s.itemId];
        if (!item || item.type === 'potion') return false;
        const isEquipped = InventorySystem.isSlotEquipped(hero, s.id);
        return !isEquipped && ShopSystem.getSellPrice(s.itemId) >= 0;
      });
      const sellAllY = 72;
      if (nonEquippedNonPotion.length > 0) {
        const sellAllBtn = this.add.rectangle(w - 100, sellAllY, 140, 44, 0x0ea5e9);
        sellAllBtn.setInteractive({ useHandCursor: true });
        this.add.text(w - 100, sellAllY, 'Sell All (no potions)', { fontSize: 12, color: '#fff' }).setOrigin(0.5);
        sellAllBtn.on('pointerdown', () => {
          let total = 0;
          nonEquippedNonPotion.forEach(slot => {
            total += ShopSystem.getSellPrice(slot.itemId);
            InventorySystem.removeSlotById(hero, slot.id);
          });
          hero.gold += total;
          this.scene.restart();
        });
      }

      const filterY = 100;
      const filterBtnStartX = 130;
      SHOP_SELL_FILTER_LABELS.forEach((label, i) => {
        const val = SHOP_SELL_FILTER_VALUES[i];
        const isActive = sellFilter === val;
        const cx = filterBtnStartX + i * 108;
        const btn = this.add.rectangle(cx, filterY, 100, 28, isActive ? 0x475569 : 0x334155);
        btn.setInteractive({ useHandCursor: true });
        this.add.text(cx, filterY + 14, label, { fontSize: 11, color: isActive ? '#fbbf24' : '#94a3b8' }).setOrigin(0.5);
        btn.on('pointerdown', () => {
          GAME_STATE.shopSellFilter = val;
          this.scene.restart();
        });
      });

      const listStartY = filterY + 44;
      const equippedRows = sellable.filter(s => InventorySystem.isSlotEquipped(hero, s.id));
      const nonEquipped = sellable.filter(s => !InventorySystem.isSlotEquipped(hero, s.id));
      const groupedNonEquipped = groupBagSlots(nonEquipped);
      const sellRows = [];
      groupedNonEquipped.forEach(group => {
        sellRows.push({ slots: group.slots, item: ITEMS[group.itemId], count: group.slots.length, equipped: false });
      });
      equippedRows.forEach(slot => {
        sellRows.push({ slots: [slot], item: ITEMS[slot.itemId], count: 1, equipped: true });
      });
      sellRows.forEach((row, i) => {
        const item = row.item;
        if (!item) return;
        const y = listStartY + i * 72;
        const typeLabel = SHOP_TYPE_LABELS[item.type] || item.type;
        const sellPrice = ShopSystem.getSellPrice(row.slots[0].itemId);
        const qtyLabel = row.count > 1 ? ' x' + row.count : '';
        const nameLine = item.name + ' (' + item.rarity + ') — ' + typeLabel + qtyLabel + (row.equipped ? ' (Equipped)' : '');
        createItemIconSprite(this, item, 44, y + 10, { width: 34, height: 34 });
        this.add.text(80, y - 2, nameLine, { fontSize: 15, color: '#e5e7eb' });
        const priceLabel = row.count > 1 ? sellPrice + ' gold each' : sellPrice + ' gold';
        this.add.text(80, y + 16, priceLabel, { fontSize: 14, color: '#fbbf24' });
        const sellBtn = this.add.rectangle(w - 100, y + 8, 76, 44, 0x0ea5e9);
        sellBtn.setInteractive({ useHandCursor: true });
        this.add.text(w - 100, y + 8, 'Sell', { fontSize: 13, color: '#fff' }).setOrigin(0.5);
        sellBtn.on('pointerdown', () => {
          hero.gold += sellPrice;
          InventorySystem.removeSlotById(hero, row.slots[0].id);
          this.scene.restart();
        });
      });
      if (sellRows.length === 0) {
        this.add.text(w / 2, h / 2 - 40, 'Nothing to sell.', { fontSize: 18, color: '#94a3b8' }).setOrigin(0.5);
      }
      const backToChoice = this.add.rectangle(w / 2, h - 60, 180, 48, 0x475569);
      backToChoice.setInteractive({ useHandCursor: true });
      this.add.text(w / 2, h - 60, 'Back to Shop', { fontSize: 16, color: '#fff' }).setOrigin(0.5);
      backToChoice.on('pointerdown', () => this.openShopView('choice'));
    }
  }

  drawSceneFrame(hero, shopView) {
    const hasArt = !!addSceneBackground(this, 'shop-ui-background');
    if (!hasArt) {
      this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0f172a);
    }
    const title = shopView === 'buy' ? 'Shop — Buy' : (shopView === 'sell' ? 'Shop — Sell' : 'Shop');
    this.add.text(20, 32, title, {
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
    createTownNavRow(this, { currentSection: 'shop' });
    return hasArt;
  }
}
