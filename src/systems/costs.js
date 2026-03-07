/**
 * costs.js
 * Central gold cost modifier. Applies run unlocks (e.g. Discount %) so all gold flows use final cost.
 * Depends: GAME_STATE (main.js).
 */

function getFinalGoldCost(baseGold) {
  if (baseGold == null || baseGold <= 0) return 0;
  const hasDiscount = hasRunUnlock('discount');
  if (hasDiscount) {
    return Math.floor(baseGold * (1 - 0.05));
  }
  return Math.floor(baseGold);
}

function hasRunUnlock(unlockId) {
  const runUnlocks = (typeof GAME_STATE !== 'undefined' && GAME_STATE && GAME_STATE.runUnlocks) ? GAME_STATE.runUnlocks : [];
  return Array.isArray(runUnlocks) && runUnlocks.includes(unlockId);
}

function getRestGoldCost(hero) {
  if (!hero) return 0;
  const baseCost = CONFIG.REST_PRICE_BASE + hero.level * CONFIG.REST_PRICE_PER_LEVEL;
  return getFinalGoldCost(baseCost);
}

function performTownRest(hero) {
  if (!hero) return false;
  const restPrice = getRestGoldCost(hero);
  if (hero.gold < restPrice) return false;
  hero.gold -= restPrice;
  hero.refillCombatStats();
  return true;
}
