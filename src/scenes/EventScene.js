/**
 * EventScene.js
 * Random event after level complete: narrative text box, apply effect, optional choices or Legendary Merchant shop.
 */

class EventScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Event' });
  }

  buildLayout(w, h) {
    if (typeof addSceneBackground === 'function' && addSceneBackground(this, 'eventscene-ui-background')) {
      return {
        hasArt: true,
        titleY: 94,
        bodyY: 142,
        bodyWrapWidth: 520,
        choiceStartY: 254,
        choiceSpacing: 56,
        resultY: 286,
        continueY: h - 56,
        merchantGoldY: 178,
        merchantRowStartY: 232,
        merchantRowSpacing: 72,
        merchantIconX: 146,
        merchantTextX: 182,
        merchantBuyX: 610,
      };
    }

    this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e);
    return {
      hasArt: false,
      titleY: 60,
      bodyY: 120,
      bodyWrapWidth: w - 80,
      choiceStartY: 180,
      choiceSpacing: 52,
      resultY: h / 2 - 20,
      continueY: h - 80,
      merchantGoldY: 110,
      merchantRowStartY: 150,
      merchantRowSpacing: 70,
      merchantIconX: 56,
      merchantTextX: 100,
      merchantBuyX: w - 100,
    };
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
    this.layout = this.buildLayout(w, h);

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
    const ev = this.event;
    const layout = this.layout;
    this.add.text(w / 2, layout.titleY, ev.title, { fontSize: 24, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, layout.bodyY, ev.body, { fontSize: 16, color: '#e5e7eb', align: 'center' }).setOrigin(0.5).setWordWrapWidth(layout.bodyWrapWidth);
    const resultMsg = EventEffects.apply(this.hero, ev.id, null);
    if (resultMsg) {
      this.add.text(w / 2, layout.bodyY + 52, resultMsg, { fontSize: 15, color: '#4ade80', align: 'center' }).setOrigin(0.5).setWordWrapWidth(layout.bodyWrapWidth);
    }
    createUiArtButton(this, w / 2, layout.continueY, 'continue-button', () => this.scene.start('Overworld'), {
      width: 180,
      height: 52,
      fallbackLabel: 'Continue',
      fallbackWidth: 140,
      fallbackHeight: 48,
      bgColor: 0x4ade80,
      fontSize: 18,
      textColor: '#fff',
    });
  }

  showChoiceEvent() {
    const w = CONFIG.WIDTH;
    const ev = this.event;
    const layout = this.layout;
    this.add.text(w / 2, layout.titleY, ev.title, { fontSize: 24, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, layout.bodyY, ev.body, { fontSize: 16, color: '#e5e7eb', align: 'center' }).setOrigin(0.5).setWordWrapWidth(layout.bodyWrapWidth);
    const choiceGraphics = [];
    const choices = ev.choices || [];
    choices.forEach((label, i) => {
      const y = layout.choiceStartY + i * layout.choiceSpacing;
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
    const layout = this.layout;
    if (resultMsg) {
      this.add.text(w / 2, layout.resultY, resultMsg, { fontSize: 16, color: '#4ade80', align: 'center' }).setOrigin(0.5).setWordWrapWidth(layout.bodyWrapWidth);
    }
    createUiArtButton(this, w / 2, layout.continueY, 'continue-button', () => this.scene.start('Overworld'), {
      width: 180,
      height: 52,
      fallbackLabel: 'Continue',
      fallbackWidth: 140,
      fallbackHeight: 48,
      bgColor: 0x4ade80,
      fontSize: 18,
      textColor: '#fff',
    });
  }

  showMerchantEvent() {
    const w = CONFIG.WIDTH;
    const ev = this.event;
    const layout = this.layout;
    this.add.text(w / 2, layout.titleY - 6, ev.title, { fontSize: 24, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, layout.bodyY - 6, ev.body, { fontSize: 14, color: '#e5e7eb', align: 'center' }).setOrigin(0.5).setWordWrapWidth(layout.bodyWrapWidth);

    const pool = typeof getLegendaryMerchantPool === 'function'
      ? getLegendaryMerchantPool({ classId: this.hero && this.hero.class }).filter((id) => ITEMS[id])
      : LEGENDARY_MERCHANT_POOL.filter((id) => ITEMS[id]);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const itemIds = shuffled.slice(0, 3);
    this.merchantItems = itemIds.map(itemId => ({ itemId, price: ShopSystem.getPrice(itemId), bought: false }));

    this.merchantGoldText = this.add.text(w / 2, layout.merchantGoldY, 'Gold: ' + this.hero.gold, { fontSize: 18, color: '#fbbf24' }).setOrigin(0.5);
    this.merchantRows = [];

    this.merchantItems.forEach((row, i) => {
      const item = ITEMS[row.itemId];
      if (!item) return;
      const y = layout.merchantRowStartY + i * layout.merchantRowSpacing;
      createItemIconSprite(this, item, layout.merchantIconX, y + 14, { width: 34, height: 34 });
      this.add.text(layout.merchantTextX, y - 4, item.name + ' (' + item.rarity + ')', { fontSize: 16, color: '#e5e7eb' });
      const effectLine = getItemEffectLine(item);
      if (effectLine) this.add.text(layout.merchantTextX, y + 12, effectLine, { fontSize: 12, color: '#94a3b8' });
      this.add.text(layout.merchantTextX, y + 28, row.price + ' gold', { fontSize: 14, color: '#fbbf24' });
      const canBuy = this.hero.gold >= row.price;
      const buyBtn = this.add.rectangle(layout.merchantBuyX, y + 14, 70, 32, canBuy ? 0x4ade80 : 0x64748b);
      buyBtn.setInteractive({ useHandCursor: true });
      const buyTxt = this.add.text(layout.merchantBuyX, y + 14, 'Buy', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
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

    createUiArtButton(this, w / 2, layout.continueY, 'continue-button', () => this.scene.start('Overworld'), {
      width: 180,
      height: 52,
      fallbackLabel: 'Continue',
      fallbackWidth: 140,
      fallbackHeight: 48,
      bgColor: 0x475569,
      fontSize: 18,
      textColor: '#fff',
    });
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
