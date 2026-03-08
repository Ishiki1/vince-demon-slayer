/**
 * levels.js
 * Ten levels (5 fights each: 4 goons + 1 boss). Level 10 = Castle.
 * Enemy stats are formula-based from level index and isBoss.
 */

/** Goon types by level: 0 = Skeleton only; 1 = Skeleton or Bat; 2+ = Skeleton, Bat, or Imp. */
function getGoonTypeForLevel(levelIndex) {
  if (levelIndex === 0) return 'skeleton';
  if (levelIndex === 1) return Math.random() < 0.5 ? 'skeleton' : 'bat';
  const roll = Math.random();
  if (roll < 1 / 3) return 'skeleton';
  if (roll < 2 / 3) return 'bat';
  return 'imp';
}

const GOON_NAMES = { skeleton: 'Skeleton', bat: 'Bat', imp: 'Imp' };

function getEnemyStatsForLevel(levelIndex, isBoss) {
  const scale = CONFIG.ENEMY_SCALE_FACTOR;
  const baseHp = CONFIG.ENEMY_BASE_HP * Math.pow(scale, levelIndex);
  const baseDmg = CONFIG.ENEMY_BASE_DAMAGE * Math.pow(scale, levelIndex);
  if (isBoss) {
    const levelScaleHp = 1 + levelIndex * (CONFIG.ENEMY_BOSS_PER_LEVEL_HP_FACTOR || 0.2);
    const levelScaleDmg = 1 + levelIndex * (CONFIG.ENEMY_BOSS_PER_LEVEL_DAMAGE_FACTOR || 0.15);
    const hp = Math.floor(baseHp * CONFIG.ENEMY_BOSS_HP_MULTIPLIER * levelScaleHp);
    const damage = Math.max(1, Math.floor(baseDmg * CONFIG.ENEMY_BOSS_DAMAGE_MULTIPLIER * levelScaleDmg));
    const name = 'Vampire';
    return { hp, damage, name };
  }
  const goonType = getGoonTypeForLevel(levelIndex);
  return {
    hp: Math.floor(baseHp),
    damage: Math.max(1, Math.floor(baseDmg)),
    name: GOON_NAMES[goonType] || 'Enemy',
    goonType,
  };
}

/**
 * How many enemies in this fight? Boss always 1. Goons: 1 to maxCount (level-capped),
 * with chance ramping by level and stage (fight index). Level 1 max 2, level 2 max 3,
 * level 3 max 4, level 4 max 4 (low P(4)), level 5+ max 5.
 */
function getEnemyCountForFight(levelIndex, fightIndex, isBoss) {
  if (isBoss) return 1;
  const maxByLevel = levelIndex < 3 ? levelIndex + 2 : (levelIndex === 3 ? 4 : CONFIG.MULTI_ENEMY_MAX);
  let count = 1;
  const baseChance = CONFIG.MULTI_ENEMY_BASE_CHANCE || 0.15;
  const perLevel = CONFIG.MULTI_ENEMY_PER_LEVEL || 0.06;
  const perStage = CONFIG.MULTI_ENEMY_PER_STAGE || 0.05;
  const rollChance = Math.min(0.95, baseChance + levelIndex * perLevel + fightIndex * perStage);
  while (count < maxByLevel && Math.random() < rollChance) count++;
  return count;
}

const LEVELS_ACT1 = [];
for (let n = 1; n <= 10; n++) {
  const id = n === 10 ? 'level10' : `level${n}`;
  const name = n === 10 ? 'Castle' : `Level ${n}`;
  LEVELS_ACT1.push({
    id,
    name,
    levelIndex: n - 1,
    act: 1,
    fights: [
      { slot: 0, isBoss: false },
      { slot: 1, isBoss: false },
      { slot: 2, isBoss: false },
      { slot: 3, isBoss: false },
      { slot: 4, isBoss: true },
    ],
  });
}

const LEVELS_ACT2 = [];
for (let n = 11; n <= 20; n++) {
  const id = `level${n}`;
  const name = n === 20 ? 'Demon Empire' : `Level ${n}`;
  LEVELS_ACT2.push({
    id,
    name,
    levelIndex: n - 1,
    act: 2,
    fights: [
      { slot: 0, isBoss: false },
      { slot: 1, isBoss: false },
      { slot: 2, isBoss: false },
      { slot: 3, isBoss: false },
      { slot: 4, isBoss: true },
    ],
  });
}

const LEVELS = [...LEVELS_ACT1, ...LEVELS_ACT2];

function getLevelBackgroundTextureKey(levelId) {
  if (typeof levelId !== 'string') return null;
  const match = /^level(10|[1-9])$/.exec(levelId);
  if (!match) return null;
  return `level${match[1]}-ui-background`;
}

/** Reaper enemy: scales with hero level, very high HP and damage. */
function createReaper(heroLevel) {
  const scale = 4 + heroLevel * 2;
  const hp = 80 + heroLevel * 25;
  const damage = 8 + heroLevel * 3;
  return {
    levelIndex: -1,
    name: 'The Reaper',
    maxHp: hp,
    hp,
    damage,
    isBoss: true,
    turnsTaken: 0,
    skills: [
      {
        id: 'buff-removal-skill',
        everyTurns: 3,
        firstUseTurn: 3,
      },
    ],
  };
}
