/**
 * saveLoad.js
 * Save/load current run to localStorage. Depends on GAME_STATE and createHero (main.js, Hero.js).
 */

const SAVE_KEY = 'vince_saveState';
const SAVE_VERSION = 3;
const PENDING_RUN_KEY = 'vince_pendingRunBootstrap';
const PENDING_RUN_VERSION = 1;

const HERO_DATA_KEYS = [
  'name', 'class', 'strength', 'intelligence', 'health', 'mana', 'defense',
  'currentHealth', 'currentMana', 'skills', 'passives', 'skillPoints',
  'weapon', 'armor', 'accessories', 'inventory', 'battleDefenseBonus', 'battleEvasionChance',
  'invulnerableRounds', 'maxInventory', 'level', 'xp', 'gold', '_nextSlotId', 'runStatGrowthBonus'
];

function buildHeroDataSnapshot(hero) {
  if (!hero) return null;
  const heroData = {};
  HERO_DATA_KEYS.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(hero, key)) heroData[key] = hero[key];
  });
  return heroData;
}

function buildRunStatePayload() {
  if (!GAME_STATE || !GAME_STATE.hero) return null;
  const heroData = buildHeroDataSnapshot(GAME_STATE.hero);
  if (!heroData || !heroData.class) return null;
  return {
    version: SAVE_VERSION,
    hero: heroData,
    currentLevelId: GAME_STATE.currentLevelId,
    currentFightIndex: GAME_STATE.currentFightIndex,
    unlockedLevels: GAME_STATE.unlockedLevels,
    act: GAME_STATE.act,
    day: GAME_STATE.day,
    enteredLevelIds: GAME_STATE.enteredLevelIds,
    completedLevelIds: GAME_STATE.completedLevelIds,
    points: GAME_STATE.points,
    unlockedClasses: GAME_STATE.unlockedClasses,
    runUnlocks: GAME_STATE.runUnlocks,
    pendingDay10Reaper: GAME_STATE.pendingDay10Reaper,
    day10ReaperResolved: GAME_STATE.day10ReaperResolved,
    forcedEncounter: GAME_STATE.forcedEncounter,
    freeMineWeekUsed: GAME_STATE.freeMineWeekUsed,
    shopStock: GAME_STATE.shopStock,
  };
}

function applyRunStatePayload(payload) {
  if (!payload || !payload.hero || !payload.hero.class) return false;
  const hero = createHero(payload.hero.class);
  HERO_DATA_KEYS.forEach(key => {
    if (payload.hero[key] !== undefined) hero[key] = payload.hero[key];
  });
  if (!Array.isArray(hero.accessories)) {
    hero.accessories = [payload.hero.accessory != null ? payload.hero.accessory : null, null];
  }
  while (hero.accessories.length < 2) hero.accessories.push(null);
  if (hero.accessories.length > 2) hero.accessories = hero.accessories.slice(0, 2);
  delete hero.accessory;
  GAME_STATE.hero = hero;

  GAME_STATE.currentLevelId = payload.currentLevelId != null ? payload.currentLevelId : null;
  GAME_STATE.currentFightIndex = payload.currentFightIndex != null ? payload.currentFightIndex : 0;
  GAME_STATE.unlockedLevels = Array.isArray(payload.unlockedLevels) ? payload.unlockedLevels : ['level1'];
  GAME_STATE.act = payload.act === 2 ? 2 : 1;
  GAME_STATE.day = typeof payload.day === 'number' && payload.day > 0 ? payload.day : 1;
  GAME_STATE.enteredLevelIds = Array.isArray(payload.enteredLevelIds) ? payload.enteredLevelIds : [];
  GAME_STATE.completedLevelIds = Array.isArray(payload.completedLevelIds) ? payload.completedLevelIds : [];
  GAME_STATE.points = typeof payload.points === 'number' ? payload.points : 0;
  GAME_STATE.unlockedClasses = typeof normalizeUnlockedClassIds === 'function'
    ? normalizeUnlockedClassIds(payload.unlockedClasses)
    : (Array.isArray(payload.unlockedClasses) ? payload.unlockedClasses : ['warrior']);
  GAME_STATE.runUnlocks = Array.isArray(payload.runUnlocks) ? payload.runUnlocks : [];
  GAME_STATE.pendingDay10Reaper = payload.pendingDay10Reaper === true;
  GAME_STATE.day10ReaperResolved = payload.day10ReaperResolved === true;
  GAME_STATE.forcedEncounter = payload.forcedEncounter && typeof payload.forcedEncounter === 'object'
    ? payload.forcedEncounter
    : null;
  GAME_STATE.freeMineWeekUsed = typeof payload.freeMineWeekUsed === 'number' ? payload.freeMineWeekUsed : null;
  GAME_STATE.shopStock = Array.isArray(payload.shopStock) ? payload.shopStock : null;

  GAME_STATE.pendingLevelUpSkill = null;
  GAME_STATE.pendingLevelUp = false;
  GAME_STATE.pendingLootItemId = null;
  GAME_STATE.pendingRandomEvent = false;
  GAME_STATE.reaperFight = false;
  GAME_STATE.fledGoldLost = null;
  GAME_STATE.fledItemLostNames = [];
  GAME_STATE.levelJustCompleted = false;
  return true;
}

function persistPendingRunBootstrap(targetKey, targetData) {
  const payload = buildRunStatePayload();
  if (!payload || !targetKey) return false;
  try {
    localStorage.setItem(PENDING_RUN_KEY, JSON.stringify({
      version: PENDING_RUN_VERSION,
      targetKey,
      targetData: targetData || {},
      payload,
    }));
    return true;
  } catch (_) {
    return false;
  }
}

function getPendingRunBootstrap() {
  try {
    const raw = localStorage.getItem(PENDING_RUN_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw);
    if (!pending || pending.version !== PENDING_RUN_VERSION || !pending.payload || !pending.payload.hero || !pending.payload.hero.class) {
      return null;
    }
    return {
      targetKey: pending.targetKey || 'Overworld',
      targetData: pending.targetData || {},
      payload: pending.payload,
    };
  } catch (_) {
    return null;
  }
}

function restorePendingRunBootstrap() {
  const pending = getPendingRunBootstrap();
  if (!pending) return null;
  if (!applyRunStatePayload(pending.payload)) {
    clearPendingRunBootstrap();
    return null;
  }
  return {
    targetKey: pending.targetKey,
    targetData: pending.targetData,
  };
}

function clearPendingRunBootstrap() {
  try {
    localStorage.removeItem(PENDING_RUN_KEY);
  } catch (_) {}
}

function hasSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw || raw.length === 0) return false;
    const data = JSON.parse(raw);
    return data && (data.version === SAVE_VERSION || (data.hero && data.hero.class));
  } catch (_) {
    return false;
  }
}

function saveGame() {
  const payload = buildRunStatePayload();
  if (!payload) return false;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (_) {
    return false;
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const payload = JSON.parse(raw);
    return applyRunStatePayload(payload);
  } catch (_) {
    return false;
  }
}

function deleteSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (_) {}
}
