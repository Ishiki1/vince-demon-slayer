/**
 * UpgradeScene.js
 * Upgrade unique items: 500g + 1 matching element stone. Only uniques can be upgraded.
 */

const UPGRADE_GOLD_BASE = 500;

class UpgradeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Upgrade' });
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    InventorySystem.ensureSlotBased(hero);

    const uniqueSlots = hero.inventory.filter(s => {
      const item = ITEMS[s.itemId];
      return item && item.rarity === 'unique' && (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory');
    });

    this.add.text(w / 2, 40, 'Upgrade Unique', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 72, 'Gold: ' + hero.gold, { fontSize: 18, color: '#fbbf24' }).setOrigin(0.5);

    if (uniqueSlots.length === 0) {
      this.add.text(w / 2, h / 2 - 40, 'You can only upgrade Unique Items. Craft one first!', { fontSize: 16, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(w - 80);
    } else {
      const upgradeCost = typeof getFinalGoldCost === 'function' ? getFinalGoldCost(UPGRADE_GOLD_BASE) : UPGRADE_GOLD_BASE;
      const typeLabels = { weapon: 'Weapon', armor: 'Armor', accessory: 'Accessory' };
      const startY = 130;
      uniqueSlots.forEach((slot, i) => {
        const item = ITEMS[slot.itemId];
        if (!item) return;
        const element = typeof getUniqueElement === 'function' ? getUniqueElement(slot.itemId) : null;
        const isUpgraded = slot.upgraded === true;
        const materialName = element && ITEMS[element] ? ITEMS[element].name : 'Stone';
        const hasMaterial = element ? hero.inventory.some(s => s.itemId === element) : false;
        const canUpgrade = !isUpgraded && hero.gold >= upgradeCost && hasMaterial;

        const y = startY + i * 72;
        createItemIconSprite(this, item, 44, y + 14, { width: 34, height: 34 });
        this.add.text(80, y - 2, item.name + ' (' + (typeLabels[item.type] || item.type) + ')', { fontSize: 15, color: '#e5e7eb' });
        if (isUpgraded) {
          this.add.text(80, y + 16, 'Upgraded', { fontSize: 14, color: '#4ade80' });
        } else {
          const costStr = upgradeCost + 'g + 1 ' + materialName;
          this.add.text(80, y + 16, costStr, { fontSize: 14, color: '#fbbf24' });
          const upgradeSummary = typeof getUniqueUpgradeSummary === 'function' ? getUniqueUpgradeSummary(item) : '';
          if (upgradeSummary) {
            this.add.text(80, y + 34, upgradeSummary, { fontSize: 12, color: '#94a3b8' });
          }
          const btn = this.add.rectangle(w - 90, y + 20, 80, 32, canUpgrade ? 0x4ade80 : 0x475569);
          btn.setInteractive({ useHandCursor: canUpgrade });
          this.add.text(w - 90, y + 20, 'Upgrade', { fontSize: 13, color: '#fff' }).setOrigin(0.5);
          if (canUpgrade) {
            btn.on('pointerdown', () => {
              hero.gold -= upgradeCost;
              const matSlot = hero.inventory.find(s => s.itemId === element);
              if (matSlot) InventorySystem.removeSlotById(hero, matSlot.id);
              slot.upgraded = true;
              slot.upgradeMultipliers = typeof getUniqueUpgradeMultipliers === 'function' ? getUniqueUpgradeMultipliers(item) : {};
              this.scene.restart();
            });
          }
        }
      });
    }

    const backBtn = this.add.rectangle(w / 2, h - 60, 160, 48, 0x475569);
    backBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h - 60, 'Back to Blacksmith', { fontSize: 16, color: '#fff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('Blacksmith'));
  }
}
