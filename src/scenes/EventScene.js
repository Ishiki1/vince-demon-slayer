/**
 * EventScene.js
 * Random event after level complete: narrative text box, apply effect, optional choices or Legendary Merchant shop.
 */

class EventScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Event' });
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    GAME_STATE.pendingRandomEvent = false;
    if (hero) hero.lockedSkillId = null;
    InventorySystem.ensureSlotBased(hero);

    if (!hero) {
      this.scene.start('Overworld');
      return;
    }

    const event = this.pickWeightedEvent();
    if (!event) {
      this.scene.start('Overworld');
      return;
    }

    this.event = event;
    this.hero = hero;

    if (event.isMerchant) {
      this.showMerchantEvent();
    } else if (event.choices && event.choices.length) {
      this.showChoiceEvent();
    } else {
      this.showSimpleEvent();
    }
  }

  pickWeightedEvent() {
    const total = RANDOM_EVENTS.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const e of RANDOM_EVENTS) {
      r -= e.weight;
      if (r <= 0) return e;
    }
    return RANDOM_EVENTS[0];
  }

  showSimpleEvent() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const ev = this.event;
    this.add.text(w / 2, 60, ev.title, { fontSize: 24, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 120, ev.body, { fontSize: 16, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(w - 80);
    const resultMsg = EventEffects.apply(this.hero, ev.id, null);
    if (resultMsg) {
      this.add.text(w / 2, 165, resultMsg, { fontSize: 15, color: '#4ade80' }).setOrigin(0.5).setWordWrapWidth(w - 80);
    }
    const contBtn = this.add.rectangle(w / 2, h - 80, 140, 48, 0x4ade80);
    contBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h - 80, 'Continue', { fontSize: 18, color: '#fff' }).setOrigin(0.5);
    contBtn.on('pointerdown', () => this.scene.start('Overworld'));
  }

  showChoiceEvent() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const ev = this.event;
    this.add.text(w / 2, 50, ev.title, { fontSize: 24, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 100, ev.body, { fontSize: 16, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(w - 80);
    const choiceGraphics = [];
    const choices = ev.choices || [];
    choices.forEach((label, i) => {
      const y = 180 + i * 52;
      const btn = this.add.rectangle(w / 2, y, 220, 44, 0x475569);
      btn.setInteractive({ useHandCursor: true });
      const txt = this.add.text(w / 2, y, label, { fontSize: 15, color: '#fff' }).setOrigin(0.5);
      choiceGraphics.push(btn, txt);
      btn.on('pointerdown', () => {
        choiceGraphics.forEach(g => g.destroy());
        const resultMsg = EventEffects.apply(this.hero, ev.id, i);
        this.showEventResult(resultMsg);
      });
    });
  }

  showEventResult(resultMsg) {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    if (resultMsg) {
      this.add.text(w / 2, h / 2 - 20, resultMsg, { fontSize: 16, color: '#4ade80' }).setOrigin(0.5).setWordWrapWidth(w - 80);
    }
    const contBtn = this.add.rectangle(w / 2, h / 2 + 40, 140, 48, 0x4ade80);
    contBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h / 2 + 40, 'Continue', { fontSize: 18, color: '#fff' }).setOrigin(0.5);
    contBtn.on('pointerdown', () => this.scene.start('Overworld'));
  }

  showMerchantEvent() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const ev = this.event;
    this.add.text(w / 2, 40, ev.title, { fontSize: 24, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 75, ev.body, { fontSize: 14, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(w - 80);

    const pool = typeof getLegendaryMerchantPool === 'function'
      ? getLegendaryMerchantPool({ classId: this.hero && this.hero.class }).filter((id) => ITEMS[id])
      : LEGENDARY_MERCHANT_POOL.filter((id) => ITEMS[id]);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const itemIds = shuffled.slice(0, 3);
    this.merchantItems = itemIds.map(itemId => ({ itemId, price: ShopSystem.getPrice(itemId), bought: false }));

    this.merchantGoldText = this.add.text(w / 2, 110, 'Gold: ' + this.hero.gold, { fontSize: 18, color: '#fbbf24' }).setOrigin(0.5);
    this.merchantRows = [];

    this.merchantItems.forEach((row, i) => {
      const item = ITEMS[row.itemId];
      if (!item) return;
      const y = 150 + i * 70;
      createItemIconSprite(this, item, 56, y + 14, { width: 34, height: 34 });
      this.add.text(100, y - 4, item.name + ' (' + item.rarity + ')', { fontSize: 16, color: '#e5e7eb' });
      const effectLine = getItemEffectLine(item);
      if (effectLine) this.add.text(100, y + 12, effectLine, { fontSize: 12, color: '#94a3b8' });
      this.add.text(100, y + 28, row.price + ' gold', { fontSize: 14, color: '#fbbf24' });
      const canBuy = this.hero.gold >= row.price;
      const buyBtn = this.add.rectangle(w - 100, y + 14, 70, 32, canBuy ? 0x4ade80 : 0x64748b);
      buyBtn.setInteractive({ useHandCursor: true });
      const buyTxt = this.add.text(w - 100, y + 14, 'Buy', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
      this.merchantRows.push({ row, buyBtn, buyTxt });
      buyBtn.on('pointerdown', () => {
        if (row.bought) return;
        if (this.hero.gold < row.price) return;
        ShopSystem.buy(this.hero, row.itemId);
        row.bought = true;
        this.merchantGoldText.setText('Gold: ' + this.hero.gold);
        this.refreshMerchantButtons();
      });
    });

    this.refreshMerchantButtons();

    const contBtn = this.add.rectangle(w / 2, h - 60, 140, 48, 0x475569);
    contBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h - 60, 'Continue', { fontSize: 18, color: '#fff' }).setOrigin(0.5);
    contBtn.on('pointerdown', () => this.scene.start('Overworld'));
  }

  refreshMerchantButtons() {
    if (!this.merchantRows) return;
    this.merchantRows.forEach(({ row, buyBtn, buyTxt }) => {
      if (row.bought) {
        buyBtn.setFillStyle(0x64748b);
        buyTxt.setText('Sold');
        return;
      }
      const canBuy = this.hero.gold >= row.price;
      buyBtn.setFillStyle(canBuy ? 0x4ade80 : 0x64748b);
      buyTxt.setText('Buy');
    });
  }
}
