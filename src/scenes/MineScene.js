/**
 * MineScene.js
 * Rent a pickaxe for 250g to mine one random material. Popup shows what you got.
 */

const MINE_MATERIAL_IDS = ['fire-stone', 'wind-stone', 'ice-stone', 'lightning-stone', 'water-stone'];

class MineScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Mine' });
  }

  getHotspotManifest() {
    if (!this.cache || !this.cache.json) return null;
    const manifest = this.cache.json.get('mine-hotspots');
    if (!manifest || !Array.isArray(manifest.hotspots)) return null;
    return manifest;
  }

  getHotspot(id) {
    const manifest = this.getHotspotManifest();
    if (!manifest) return null;
    return manifest.hotspots.find(h => h.id === id) || null;
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
    const inventoryFull = hero.inventory.length >= hero.maxInventory;
    const canAfford = freeMineAvailable || hero.gold >= rentPrice;
    const canMine = canAfford && !inventoryFull;
    const tooltipLabel = inventoryFull
      ? 'Inventory is full'
      : freeMineAvailable ? 'Mine for free' : `Rent pickaxe (${rentPrice}g)`;
    this.drawSceneFrame(hero);

    this.mineTooltipText = null;
    this.mineMessageText = this.add.text(w / 2, h - 80, '', {
      fontSize: 14,
      color: '#94a3b8',
      stroke: '#0f172a',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(10);

    if (inventoryFull) {
      this.mineMessageText.setText('Inventory is full.');
    } else if (!canAfford) {
      this.mineMessageText.setText('Not enough gold.');
    }

    const hs = this.getHotspot('minecart');
    if (hs) {
      const area = this.add.rectangle(hs.centerX, hs.centerY, hs.width, hs.height, 0x000000, 0)
        .setInteractive({ useHandCursor: canMine });

      area.on('pointerover', () => {
        if (this.mineTooltipText) { this.mineTooltipText.destroy(); this.mineTooltipText = null; }
        this.mineTooltipText = this.add.text(w / 2, h - 40, tooltipLabel, {
          fontSize: 16,
          color: canMine ? '#fbbf24' : '#94a3b8',
          fontFamily: 'Arial',
          stroke: '#0f172a',
          strokeThickness: 4,
        }).setOrigin(0.5).setWordWrapWidth(w - 80).setDepth(20);
      });

      area.on('pointerout', () => {
        if (this.mineTooltipText) { this.mineTooltipText.destroy(); this.mineTooltipText = null; }
      });

      if (canMine) {
        area.on('pointerdown', () => {
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
          this.showMineResultPopup(item || { name: materialName });
        });
      }
    }
  }

  showMineResultPopup(item) {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const materialName = item && item.name ? item.name : 'Unknown material';

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setInteractive();
    const panel = this.add.rectangle(w / 2, h / 2, 340, 250, 0x1e293b);
    const title = this.add.text(w / 2, h / 2 - 88, 'You found:', { fontSize: 18, color: '#fbbf24' }).setOrigin(0.5);
    const icon = createItemIconSprite(this, item, w / 2, h / 2 - 18, { width: 96, height: 96, hover: false });
    const result = this.add.text(w / 2, h / 2 + 58, materialName + '!', { fontSize: 22, color: '#e5e7eb' }).setOrigin(0.5);
    const okBtn = this.add.rectangle(w / 2, h / 2 + 95, 100, 36, 0x475569).setInteractive({ useHandCursor: true });
    const okText = this.add.text(w / 2, h / 2 + 95, 'OK', { fontSize: 14, color: '#fff' }).setOrigin(0.5);

    const popupParts = [overlay, panel, title, result, okBtn, okText];
    if (icon) popupParts.push(icon);
    const close = () => {
      popupParts.forEach(obj => obj.destroy());
      this.scene.restart();
    };

    okBtn.on('pointerdown', close);
    overlay.on('pointerdown', close);
  }

  drawSceneFrame(hero) {
    const hasArt = !!addSceneBackground(this, 'mine-ui-background');
    if (!hasArt) {
      this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH, CONFIG.HEIGHT, 0x0f172a);
    }
    this.add.text(20, 32, 'Mine', {
      fontSize: 28,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0, 0.5);
    this.goldText = this.add.text(20, 62, 'Gold: ' + hero.gold, {
      fontSize: 18,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 4,
    }).setOrigin(0, 0.5);
    createTownNavRow(this, { currentSection: 'mine' });
  }
}
