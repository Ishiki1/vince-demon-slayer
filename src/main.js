/**
 * main.js
 * Phaser 3 config and scene registration. Mouse-only input.
 */

// Persistent total run points across runs (for future unlocks). Stored in localStorage.
function getTotalPoints() {
  try {
    return parseInt(localStorage.getItem('vince_totalPoints') || '0', 10);
  } catch (_) { return 0; }
}
function addTotalPoints(amount) {
  try {
    const n = getTotalPoints() + (amount || 0);
    localStorage.setItem('vince_totalPoints', String(n));
    return n;
  } catch (_) { return getTotalPoints(); }
}

function resetRun() {
  GAME_STATE.hero = null;
  GAME_STATE.currentLevelId = null;
  GAME_STATE.currentFightIndex = 0;
  GAME_STATE.unlockedLevels = ['level1'];
  GAME_STATE.act = 1;
  GAME_STATE.day = 1;
  GAME_STATE.enteredLevelIds = [];
  GAME_STATE.completedLevelIds = [];
  GAME_STATE.points = 0;
  GAME_STATE.pendingLevelUpSkill = null;
  GAME_STATE.pendingLevelUp = false;
  GAME_STATE.pendingLootItemId = null;
  GAME_STATE.pendingRandomEvent = false;
  GAME_STATE.reaperFight = false;
  GAME_STATE.pendingDay10Reaper = false;
  GAME_STATE.day10ReaperResolved = false;
  GAME_STATE.forcedEncounter = null;
  GAME_STATE.fledGoldLost = null;
  GAME_STATE.fledItemLostNames = [];
  GAME_STATE.shopStock = null;
  GAME_STATE.runUnlocks = [];
  GAME_STATE.freeMineWeekUsed = null;
  GAME_STATE.levelJustCompleted = false;
  if (typeof clearRunUnlockSelection === 'function') clearRunUnlockSelection();
  if (typeof clearPendingRunBootstrap === 'function') clearPendingRunBootstrap();
}

// Global game state shared by all scenes (reset on new run or game over)
const GAME_STATE = {
  hero: null,
  currentLevelId: null,
  currentFightIndex: 0,
  unlockedLevels: ['level1'],
  act: 1,
  day: 1,
  enteredLevelIds: [],
  completedLevelIds: [],
  points: 0,
  unlockedClasses: typeof normalizeUnlockedClassIds === 'function'
    ? normalizeUnlockedClassIds()
    : ['warrior'],
  pendingLevelUpSkill: null,
  pendingLevelUp: false,
  pendingLootItemId: null,
  goldEarned: 0,
  pendingRandomEvent: false,
  reaperFight: false,
  pendingDay10Reaper: false,
  day10ReaperResolved: false,
  forcedEncounter: null,
  fledGoldLost: null,
  fledItemLostNames: [],
  shopStock: null,
  freeMineWeekUsed: null,
  levelJustCompleted: false,
  runUnlocks: [], // set at run start from getRunUnlockSelection(); Multiplier is a future run modifier (stub).
};

const config = {
  type: Phaser.AUTO,
  width: CONFIG.WIDTH,
  height: CONFIG.HEIGHT,
  parent: 'phaser-game',
  backgroundColor: '#1a1a2e',
  physics: { default: 'arcade' },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
    min: { width: 400, height: 300 },
    max: { width: 1600, height: 1200 },
  },
  scene: [BootScene, MenuScene, GamePreloadScene, ClassSelectScene, ClassOriginScene, OverworldScene, CombatScene, LootScene, EventScene, SkillTreeScene, TransitionScene, TownScene, AlchemistScene, ShopScene, BlacksmithScene, UpgradeScene, MineScene, InventoryOverworldScene, CharacterSheetScene, RunEndedScene, UnlockSelectScene, SettingsScene],
  input: {
    activePointers: 1,
  },
};

// Create game when DOM is ready
window.addEventListener('load', function () {
  const game = new Phaser.Game(config);
  window.game = game;
});
