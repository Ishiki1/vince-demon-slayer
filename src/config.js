/**
 * config.js
 * Game constants: XP curve, hero growth, enemy scaling, loot, gold, shop.
 */

const CONFIG = {
  // Screen
  WIDTH: 800,
  HEIGHT: 600,
  MIN_BUTTON_HEIGHT: 48,

  // Combat sprite display sizes (use these for hero and enemy sprites going forward)
  HERO_SPRITE_DISPLAY_WIDTH: 200,
  HERO_SPRITE_DISPLAY_HEIGHT: 200,
  // Goon sprites (skeleton, imp, reaper) scaled 1.5x so they read better next to hero (still a bit smaller than hero since there can be several)
  ENEMY_SPRITE_WIDTH: 120,   // 80 * 1.5
  ENEMY_SPRITE_HEIGHT: 150,  // 100 * 1.5

  // XP: total XP needed for level N (index = level). Levels 1-20.
  XP_PER_LEVEL: [0, 10, 25, 45, 70, 100, 140, 190, 250, 320, 400, 500, 620, 760, 920, 1100, 1300, 1520, 1760, 2020, 2300],
  XP_GOON: 3,
  XP_BOSS: 10,

  // Hero: base stats at level 1; per-class growth per level. Defense from armor only, not level.
  HERO_STAT_PER_LEVEL: {
    default: { health: 3, mana: 3, strength: 1, intelligence: 1, dexterity: 1 },
    warrior: { health: 4, mana: 2, strength: 1, intelligence: 1 },
    sorceress: { health: 2, mana: 4, strength: 1, intelligence: 1 },
  },
  HERO_MAX_EVASION: 0.9,

  // Enemy scaling: base * scale^level; boss gets multipliers and per-level scaling (tuned for harder game)
  ENEMY_BASE_HP: 8,
  ENEMY_BASE_DAMAGE: 2,
  ENEMY_SCALE_FACTOR: 1.30,
  ENEMY_BOSS_HP_MULTIPLIER: 2.2,
  ENEMY_BOSS_DAMAGE_MULTIPLIER: 1.5,
  ENEMY_BOSS_PER_LEVEL_HP_FACTOR: 0.2,
  ENEMY_BOSS_PER_LEVEL_DAMAGE_FACTOR: 0.08,
  REAPER_BASE_CHANCE: 0.05,
  REAPER_PER_LEVEL: 0.02,

  // Gold drop (min, max) by level; goon vs boss
  GOLD_GOON_BASE: 5,
  GOLD_GOON_PER_LEVEL: 2,
  GOLD_BOSS_BASE: 20,
  GOLD_BOSS_PER_LEVEL: 8,

  // Loot: goons no legendary; bosses use LOOT_WEIGHTS_BOSS
  LOOT_WEIGHTS_GOON: { common: 75, rare: 25 },
  LOOT_WEIGHTS_BOSS: { common: 55, rare: 30, legendary: 15 },
  LOOT_TYPE_WEIGHTS: { weapon: 25, armor: 25, accessory: 20, potion: 5, material: 25 },

  // Shop: max items per visit; legendary chance per slot (0-1)
  SHOP_MAX_ITEMS: 5,
  SHOP_LEGENDARY_CHANCE: 0.08,
  SHOP_REROLL_COST: 200,
  SHOP_BASE_PRICE: { common: 25, rare: 80, legendary: 350 },

  // Town rest: price scales by hero level
  REST_PRICE_BASE: 10,
  REST_PRICE_PER_LEVEL: 5,

  // Multi-enemy: max goons per fight; 5 only from level 5+, level 4 max 4 with low P(4)
  MULTI_ENEMY_MAX: 5,
  // Ramp: chance per "step" to add another enemy (0-1). Higher level + later stage = more chance.
  MULTI_ENEMY_BASE_CHANCE: 0.15,
  MULTI_ENEMY_PER_LEVEL: 0.06,
  MULTI_ENEMY_PER_STAGE: 0.05,

  // Durability: max uses/hits per rarity (weapon = skill use, armor = damage taken)
  DURABILITY_MAX_COMMON: 5,
  DURABILITY_MAX_RARE: 20,
  DURABILITY_MAX_LEGENDARY: 40,
  DURABILITY_MAX_UNIQUE: 60,

  // Crafting: cost in gold + 1 material for each unique
  CRAFT_COST: 350,

  // Mine: rent pickaxe to get one random material
  MINE_PICKAXE_RENT: 250,

  // Blacksmith repair cost as ratio of buy price
  REPAIR_PRICE_RATIO: { common: 0.2, rare: 0.35, legendary: 0.5 },
};
