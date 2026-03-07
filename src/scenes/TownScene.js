/**
 * TownScene.js
 * Rest (full HP/Mana) and back to map.
 */

class TownScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Town' });
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    const restPrice = typeof getRestGoldCost === 'function'
      ? getRestGoldCost(hero)
      : (CONFIG.REST_PRICE_BASE + hero.level * CONFIG.REST_PRICE_PER_LEVEL);

    this.add.text(w / 2, 80, 'Town', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 120, 'Gold: ' + hero.gold, { fontSize: 18, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 150, 'Rest to restore full HP and Mana.', { fontSize: 16, color: '#e5e7eb' }).setOrigin(0.5);

    createButton(this, w / 2, h / 2 - 20, 220, 48, `Rest (Full HP & Mana) - ${restPrice}g`, { bgColor: 0x4ade80, fontSize: 15 }, () => {
      const rested = typeof performTownRest === 'function'
        ? performTownRest(hero)
        : (hero.gold >= restPrice ? (hero.gold -= restPrice, hero.refillCombatStats(), true) : false);
      if (!rested) {
        this.restText.setText('Not enough gold!').setColor('#ef4444');
        return;
      }
      this.restText.setText('HP and Mana restored!').setColor('#86efac');
    });
    this.restText = this.add.text(w / 2, h / 2 + 30, '', { fontSize: 14, color: '#86efac' }).setOrigin(0.5);

    createButton(this, w / 2, h / 2 + 70, 200, 48, 'Visit Shop', { bgColor: 0x8b5cf6 }, () => {
      GAME_STATE.shopFrom = 'town';
      this.scene.start('Shop');
    });
    createButton(this, w / 2, h / 2 + 130, 200, 48, 'Visit Blacksmith', { bgColor: 0x78716c }, () => this.scene.start('Blacksmith'));
    createButton(this, w / 2, h / 2 + 190, 200, 48, 'Visit Mine', { bgColor: 0x64748b }, () => this.scene.start('Mine'));
    createButton(this, w / 2, h - 80, 160, 48, 'Back to Map', () => this.scene.start('Overworld'));
  }
}
