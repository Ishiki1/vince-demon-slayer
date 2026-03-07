/**
 * BlacksmithScene.js
 * List damaged equipment (durability < max); repair for a price (by rarity). Craft mode: uniques for 350g + 1 material. Back to Town.
 */

class BlacksmithScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Blacksmith' });
  }

  create(data) {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    InventorySystem.ensureSlotBased(hero);
    InventorySystem.ensureAccessorySlots(hero);
    const mode = (data && data.mode === 'craft') ? 'craft' : 'repair';

    this.add.text(w / 2, 40, 'Blacksmith', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 72, 'Gold: ' + hero.gold, { fontSize: 18, color: '#fbbf24' }).setOrigin(0.5);

    const repairBtn = this.add.rectangle(w / 2 - 140, 100, 90, 36, mode === 'repair' ? 0x64748b : 0x475569);
    repairBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2 - 140, 100, 'Repair', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    repairBtn.on('pointerdown', () => {
      if (mode !== 'repair') this.scene.restart({});
    });

    const craftBtn = this.add.rectangle(w / 2, 100, 90, 36, mode === 'craft' ? 0x64748b : 0x475569);
    craftBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, 100, 'Craft', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    craftBtn.on('pointerdown', () => {
      if (mode !== 'craft') this.scene.restart({ mode: 'craft' });
    });

    const upgradeBtn = this.add.rectangle(w / 2 + 140, 100, 90, 36, 0x475569);
    upgradeBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2 + 140, 100, 'Upgrade', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    upgradeBtn.on('pointerdown', () => this.scene.start('Upgrade'));

    if (mode === 'repair') {
      this.buildRepairContent(w, h, hero);
    } else {
      this.craftTooltipGraphic = null;
      this.buildCraftContent(w, h, hero);
    }

    const backBtn = this.add.rectangle(w / 2, h - 60, 160, 48, 0x475569);
    backBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h - 60, 'Back to Town', { fontSize: 16, color: '#fff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start('Town'));
  }

  buildRepairContent(w, h, hero) {
    const damaged = [];
    const equippedIds = new Set();
    const equippedEntries = [
      { slotId: hero.weapon, slotType: 'weapon' },
      { slotId: hero.armor, slotType: 'armor' },
      { slotId: hero.accessories[0], slotType: 'accessory 1' },
      { slotId: hero.accessories[1], slotType: 'accessory 2' },
    ];
    equippedEntries.forEach(({ slotId, slotType }) => {
      const slot = DurabilitySystem.getSlotById(hero, slotId);
      if (slot && slot.durability != null && slot.durability < slot.maxDurability) {
        damaged.push({ slot, slotType });
        equippedIds.add(slot.id);
      }
    });
    hero.inventory.forEach(slot => {
      if (equippedIds.has(slot.id) || slot.durability == null || slot.durability >= slot.maxDurability) return;
      const item = ITEMS[slot.itemId];
      if (item && (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')) {
        damaged.push({ slot, slotType: null });
      }
    });

    if (damaged.length === 0) {
      this.add.text(w / 2, h / 2 - 30, 'No damaged equipment.', { fontSize: 18, color: '#94a3b8' }).setOrigin(0.5);
    } else {
      damaged.forEach(({ slot, slotType }, i) => {
        const item = ITEMS[slot.itemId];
        if (!item) return;
        const y = 150 + i * 70;
        const slotLabel = slotType ? ' (' + slotType + ')' : '';
        createItemIconSprite(this, item, 44, y + 10, { width: 34, height: 34 });
        this.add.text(80, y - 2, item.name + slotLabel, { fontSize: 16, color: '#e5e7eb' });
        this.add.text(80, y + 14, 'Durability: ' + slot.durability + ' / ' + slot.maxDurability, { fontSize: 12, color: '#94a3b8' });
        const cost = ShopSystem.getRepairPrice(slot.itemId);
        this.add.text(80, y + 30, cost + ' gold to repair', { fontSize: 14, color: '#fbbf24' });
        const canRepair = hero.gold >= cost;
        const repairBtn = this.add.rectangle(w - 100, y + 14, 80, 32, canRepair ? 0x4ade80 : 0x64748b);
        repairBtn.setInteractive({ useHandCursor: true });
        this.add.text(w - 100, y + 14, 'Repair', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
        if (canRepair) {
          repairBtn.on('pointerdown', () => {
            hero.gold -= cost;
            slot.durability = slot.maxDurability;
            this.scene.restart();
          });
        }
      });
    }
  }

  buildCraftContent(w, h, hero) {
    const materialItemIds = new Set(
      hero.inventory.filter(s => ITEMS[s.itemId] && ITEMS[s.itemId].type === 'material').map(s => s.itemId)
    );

    if (materialItemIds.size === 0) {
      this.add.text(w / 2, h / 2 - 20, 'You do not currently own any materials for crafting.', { fontSize: 16, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(w - 80);
      this.add.text(w / 2, h / 2 + 12, 'Try to visit the mine or find them by defeating monsters.', { fontSize: 14, color: '#94a3b8' }).setOrigin(0.5).setWordWrapWidth(w - 80);
      return;
    }

    const allRecipes = getCraftRecipesForClass(hero);
    const recipes = allRecipes.filter(r => materialItemIds.has(r.material));

    const rowHeight = 36;
    const startY = 140;
    const visibleHeight = (h - 70) - startY;
    const totalHeight = recipes.length * rowHeight;
    const maxScroll = Math.max(0, totalHeight - visibleHeight);
    let scrollOffset = 0;

    const maskShape = this.add.graphics();
    maskShape.fillRect(0, startY, w, visibleHeight);
    const mask = maskShape.createGeometryMask();

    const container = this.add.container(0, startY);
    container.setMask(mask);

    const scrollUp = () => {
      scrollOffset = Math.max(0, scrollOffset - rowHeight * 2);
      container.y = startY - scrollOffset;
    };
    const scrollDown = () => {
      scrollOffset = Math.min(maxScroll, scrollOffset + rowHeight * 2);
      container.y = startY - scrollOffset;
    };

    const scene = this;
    const craftCost = typeof getFinalGoldCost === 'function' ? getFinalGoldCost(CONFIG.CRAFT_COST) : CONFIG.CRAFT_COST;
    const maxDurUnique = CONFIG.DURABILITY_MAX_UNIQUE;
    const craftTypeLabels = { weapon: 'Weapon', armor: 'Armor', accessory: 'Accessory' };

    recipes.forEach((recipe, i) => {
      const item = ITEMS[recipe.itemId];
      const materialItem = ITEMS[recipe.material];
      if (!item || !materialItem) return;
      const y = i * rowHeight + rowHeight / 2;
      const materialName = materialItem.name;
      const costStr = craftCost + 'g + 1 ' + materialName;
      const hasMaterial = hero.inventory.some(s => s.itemId === recipe.material);
      const canCraft = hero.gold >= craftCost && hasMaterial;
      const typeLabel = craftTypeLabels[item.type] || item.type;

      const hitArea = this.add.rectangle(0, y, w - 20, rowHeight - 2, 0x000000, 0).setOrigin(0, 0.5);
      hitArea.setPosition(10, y);
      container.add(hitArea);
      hitArea.setInteractive({ useHandCursor: false });
      hitArea.on('pointerover', () => {
        if (scene.craftTooltipGraphic) scene.craftTooltipGraphic.destroy();
        const effectLine = getItemEffectLine(item);
        const tip = item.name + ' — ' + typeLabel + (effectLine ? ' — ' + effectLine : '') + ' Unique. Durability: ' + maxDurUnique + '.';
        scene.craftTooltipGraphic = scene.add.text(w / 2, h - 100, tip, { fontSize: 14, color: '#e5e7eb', fontFamily: 'Arial' }).setOrigin(0.5, 1).setWordWrapWidth(w - 80).setDepth(20);
      });
      hitArea.on('pointerout', () => {
        if (scene.craftTooltipGraphic) { scene.craftTooltipGraphic.destroy(); scene.craftTooltipGraphic = null; }
      });

      const icon = createItemIconSprite(this, item, 28, y, { width: 24, height: 24 });
      const nameTxt = this.add.text(48, y - 8, item.name, { fontSize: 14, color: '#e5e7eb' }).setOrigin(0, 0.5);
      const costTxt = this.add.text(48, y + 8, costStr, { fontSize: 12, color: '#fbbf24' }).setOrigin(0, 0.5);
      container.add(icon ? [icon, nameTxt, costTxt] : [nameTxt, costTxt]);

      const craftBtn = this.add.rectangle(w - 90, y, 70, 28, canCraft ? 0x4ade80 : 0x64748b);
      craftBtn.setInteractive({ useHandCursor: true });
      const craftTxt = this.add.text(w - 90, y, 'Craft', { fontSize: 12, color: '#fff' }).setOrigin(0.5);
      container.add([craftBtn, craftTxt]);
      if (canCraft) {
        craftBtn.on('pointerdown', () => {
          hero.gold -= craftCost;
          const slot = hero.inventory.find(s => s.itemId === recipe.material);
          if (slot) InventorySystem.removeSlotById(hero, slot.id);
          InventorySystem.add(hero, recipe.itemId);
          scene.scene.restart({ mode: 'craft' });
        });
      }
    });

    container.y = startY - scrollOffset;

    if (maxScroll > 0) {
      const upBtn = this.add.rectangle(w - 24, startY + visibleHeight / 2 - 30, 32, 24, 0x475569);
      upBtn.setInteractive({ useHandCursor: true });
      this.add.text(w - 24, startY + visibleHeight / 2 - 30, '\u2191', { fontSize: 16, color: '#fff' }).setOrigin(0.5);
      upBtn.on('pointerdown', scrollUp);
      const downBtn = this.add.rectangle(w - 24, startY + visibleHeight / 2 + 30, 32, 24, 0x475569);
      downBtn.setInteractive({ useHandCursor: true });
      this.add.text(w - 24, startY + visibleHeight / 2 + 30, '\u2193', { fontSize: 16, color: '#fff' }).setOrigin(0.5);
      downBtn.on('pointerdown', scrollDown);
    }
  }
}
