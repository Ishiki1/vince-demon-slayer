/**
 * shop.js
 * Random stock of up to 5 items per visit. Legendaries rare and expensive.
 */

const ShopSystem = {
  generateStock(hero) {
    const pool = typeof getShopPool === 'function'
      ? getShopPool({ classId: hero && hero.class })
      : [];
    const count = Math.min(CONFIG.SHOP_MAX_ITEMS, pool.length);
    const stock = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      let itemId = pool[idx];
      if (Math.random() < CONFIG.SHOP_LEGENDARY_CHANCE) {
        const legendaries = pool.filter(id => ITEMS[id] && ITEMS[id].rarity === 'legendary');
        if (legendaries.length) itemId = legendaries[Math.floor(Math.random() * legendaries.length)];
      }
      stock.push(itemId);
      pool.splice(pool.indexOf(itemId), 1);
      if (pool.length === 0) break;
    }
    return stock;
  },

  getPrice(itemId) {
    const item = ITEMS[itemId];
    if (!item) return 0;
    const base = CONFIG.SHOP_BASE_PRICE[item.rarity] || 50;
    return typeof getFinalGoldCost === 'function' ? getFinalGoldCost(base) : base;
  },

  getSellPrice(itemId) {
    return Math.floor(this.getPrice(itemId) * 0.5);
  },

  getRepairPrice(itemId) {
    const item = ITEMS[itemId];
    if (!item) return 0;
    const ratio = CONFIG.REPAIR_PRICE_RATIO && CONFIG.REPAIR_PRICE_RATIO[item.rarity];
    const basePrice = CONFIG.SHOP_BASE_PRICE[item.rarity] || 50;
    const baseRepair = Math.floor(basePrice * (ratio != null ? ratio : 0.2));
    return typeof getFinalGoldCost === 'function' ? getFinalGoldCost(baseRepair) : baseRepair;
  },

  canBuy(hero, itemId) {
    return hero.gold >= ShopSystem.getPrice(itemId);
  },

  buy(hero, itemId) {
    if (!ShopSystem.canBuy(hero, itemId)) return false;
    const price = ShopSystem.getPrice(itemId);
    hero.gold -= price;
    InventorySystem.add(hero, itemId);
    return true;
  },
};
