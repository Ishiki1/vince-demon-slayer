/**
 * MineScene.js
 * Rent a pickaxe for 250g to mine one random material. Popup shows what you got.
 */

const MINE_MATERIAL_IDS = ['fire-stone', 'wind-stone', 'ice-stone', 'lightning-stone', 'water-stone'];

class MineScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Mine' });
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    const rentPrice = typeof getFinalGoldCost === 'function' ? getFinalGoldCost(CONFIG.MINE_PICKAXE_RENT) : CONFIG.MINE_PICKAXE_RENT;
    const currentWeek = Math.floor((((GAME_STATE.day || 1) - 1) / 7)) + 1;
    const freeMineAvailable = typeof hasRunUnlock === 'function'
      ? hasRunUnlock('iLoveMining') && GAME_STATE.freeMineWeekUsed !== currentWeek
      : false;
    const canMine = freeMineAvailable || hero.gold >= rentPrice;
    const costLabel = freeMineAvailable ? 'Free this week' : (rentPrice + ' gold');
    const buttonLabel = freeMineAvailable ? 'Mine for free' : `Rent pickaxe (${rentPrice}g)`;

    this.add.text(w / 2, 80, 'Mine', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);
    this.goldText = this.add.text(w / 2, 120, 'Gold: ' + hero.gold, { fontSize: 18, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 160, 'Rent a pickaxe to mine for a random crafting material.', { fontSize: 14, color: '#e5e7eb' }).setOrigin(0.5);
    this.add.text(w / 2, 185, 'Cost: ' + costLabel, { fontSize: 16, color: freeMineAvailable ? '#86efac' : '#94a3b8' }).setOrigin(0.5);

    const rentBtn = this.add.rectangle(w / 2, h / 2 - 20, 240, 48, canMine ? 0x78716c : 0x475569);
    rentBtn.setInteractive({ useHandCursor: canMine });
    this.add.text(w / 2, h / 2 - 20, buttonLabel, { fontSize: 16, color: '#fff' }).setOrigin(0.5);
    this.mineMessageText = this.add.text(w / 2, h / 2 + 25, '', { fontSize: 14, color: '#94a3b8' }).setOrigin(0.5);

    if (canMine) {
      rentBtn.on('pointerdown', () => {
        const materialId = MINE_MATERIAL_IDS[Math.floor(Math.random() * MINE_MATERIAL_IDS.length)];
        const added = InventorySystem.add(hero, materialId);
        if (!added) {
          this.mineMessageText.setText('Inventory is full.');
          return;
        }
        if (freeMineAvailable) {
          GAME_STATE.freeMineWeekUsed = currentWeek;
        } else {
          hero.gold -= rentPrice;
        }
        const item = ITEMS[materialId];
        const materialName = item ? item.name : materialId;
        this.showMineResultPopup(materialName);
      });
    } else {
      this.mineMessageText.setText('Not enough gold.');
    }

    const backBtn = this.add.rectangle(w / 2, h - 80, 160, 48, 0x475569);
    backBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h - 80, 'Back to Town', { fontSize: 16, color: '#fff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('Town'));
  }

  showMineResultPopup(materialName) {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setInteractive();
    const panel = this.add.rectangle(w / 2, h / 2, 320, 160, 0x1e293b);
    const title = this.add.text(w / 2, h / 2 - 45, 'You found:', { fontSize: 18, color: '#fbbf24' }).setOrigin(0.5);
    const result = this.add.text(w / 2, h / 2 - 5, materialName + '!', { fontSize: 22, color: '#e5e7eb' }).setOrigin(0.5);
    const okBtn = this.add.rectangle(w / 2, h / 2 + 45, 100, 36, 0x475569).setInteractive({ useHandCursor: true });
    const okText = this.add.text(w / 2, h / 2 + 45, 'OK', { fontSize: 14, color: '#fff' }).setOrigin(0.5);

    const popupParts = [overlay, panel, title, result, okBtn, okText];
    const close = () => {
      popupParts.forEach(obj => obj.destroy());
      this.scene.restart();
    };

    okBtn.on('pointerdown', close);
    overlay.on('pointerdown', close);
  }
}
