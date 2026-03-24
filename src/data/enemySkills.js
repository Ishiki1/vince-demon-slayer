/**
 * enemySkills.js
 * Shared enemy-only combat skills and scheduling helpers.
 */

const ENEMY_SKILLS = {
  'buff-removal-skill': {
    id: 'buff-removal-skill',
    name: 'Buff Removal',
    effect: 'clearHeroCombatBuffs',
    useAttackAnimation: true,
  },
  'witch-poison-skill': {
    id: 'witch-poison-skill',
    name: 'Poison',
    effect: 'poisonHero',
    poisonRounds: 3,
    poisonDamageFactor: 0.4,
    useAttackAnimation: true,
  },
  'mushroom-spore-skill': {
    id: 'mushroom-spore-skill',
    name: 'Spore Burst',
    effect: 'weakenHero',
    weakenRounds: 2,
    weakenFactor: 0.25,
    useAttackAnimation: true,
  },
  'plant-vine-skill': {
    id: 'plant-vine-skill',
    name: 'Vine Grasp',
    effect: 'vulnerableHero',
    vulnerableRounds: 2,
    vulnerableFactor: 0.25,
    useAttackAnimation: true,
  },
  'toad-spit-skill': {
    id: 'toad-spit-skill',
    name: 'Toxic Spit',
    effect: 'poisonHero',
    poisonRounds: 2,
    poisonDamageFactor: 0.25,
    useAttackAnimation: true,
  },
  'shade-sap-skill': {
    id: 'shade-sap-skill',
    name: 'Shadow Sap',
    effect: 'drainHeroMana',
    drainFactor: 0.15,
    useAttackAnimation: true,
  },
  'broodmother-venom-skill': {
    id: 'broodmother-venom-skill',
    name: 'Venom Fang',
    effect: 'poisonHero',
    poisonRounds: 3,
    poisonDamageFactor: 0.3,
    maxPoisonPercentHp: 0.05,
    useAttackAnimation: true,
  },
  'broodmother-spawn-skill': {
    id: 'broodmother-spawn-skill',
    name: 'Spawn Broodling',
    effect: 'summonBroodling',
    maxSummons: 2,
    summonHpFactor: 0.3,
    summonDmgFactor: 0.6,
    useAttackAnimation: false,
  },
  'skeleton-shield-skill': {
    id: 'skeleton-shield-skill',
    name: 'Bone Shield',
    effect: 'shieldEnemy',
    shieldDefense: 2,
    shieldRounds: 2,
    useAttackAnimation: true,
  },
  'bat-screech-skill': {
    id: 'bat-screech-skill',
    name: 'Screech',
    effect: 'weakenHero',
    weakenRounds: 1,
    weakenFactor: 0.20,
    useAttackAnimation: true,
  },
  'imp-hex-skill': {
    id: 'imp-hex-skill',
    name: 'Hex',
    effect: 'vulnerableHero',
    vulnerableRounds: 2,
    vulnerableFactor: 0.20,
    useAttackAnimation: true,
  },
  'witch-summon-skill': {
    id: 'witch-summon-skill',
    name: 'Summon Minion',
    effect: 'summonDungeonGoon',
    maxSummons: 1,
    useAttackAnimation: false,
  },
  'witch-heal-skill': {
    id: 'witch-heal-skill',
    name: 'Greater Health Potion',
    effect: 'healSelf',
    healFactor: 0.3,
    useAttackAnimation: false,
  },
};

function getEnemySkill(skillId) {
  return skillId && ENEMY_SKILLS[skillId] ? ENEMY_SKILLS[skillId] : null;
}

function normalizeEnemySkillEntry(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') return { id: entry };
  return typeof entry === 'object' ? entry : null;
}

/**
 * Check whether a conditional skill entry should fire.
 * Conditions: 'hpBelow' (enemy HP below threshold %), 'heroHpBelow' (hero HP below threshold %).
 * @param {object} entry - skill entry with condition/threshold
 * @param {object} enemy
 * @param {object} [hero] - hero object (optional, for hero-targeting conditions)
 */
function checkSkillCondition(entry, enemy, hero) {
  if (!entry.condition) return true;
  if (entry.condition === 'hpBelow') {
    const threshold = entry.threshold || 0.3;
    return enemy.maxHp > 0 && (enemy.hp / enemy.maxHp) < threshold;
  }
  if (entry.condition === 'heroHpBelow' && hero) {
    const threshold = entry.threshold || 0.3;
    const maxHp = hero.getEffectiveHealth ? hero.getEffectiveHealth() : hero.health;
    return maxHp > 0 && (hero.currentHealth / maxHp) < threshold;
  }
  return false;
}

/**
 * Pick a skill from a weighted random pool. Entries with `weight` participate.
 * @param {Array} entries - skill entries
 * @param {object} enemy
 * @param {object} [hero]
 * @returns {object|null} merged skill + config, or null
 */
function pickWeightedSkill(entries, enemy, hero) {
  const candidates = [];
  let totalWeight = 0;
  for (const rawEntry of entries) {
    const entry = normalizeEnemySkillEntry(rawEntry);
    if (!entry || !entry.id || entry.weight == null) continue;
    if (entry.condition && !checkSkillCondition(entry, enemy, hero)) continue;
    const skill = getEnemySkill(entry.id);
    if (!skill) continue;
    candidates.push({ skill, entry, weight: entry.weight });
    totalWeight += entry.weight;
  }
  if (candidates.length === 0 || totalWeight <= 0) return null;
  let roll = Math.random() * totalWeight;
  for (const c of candidates) {
    roll -= c.weight;
    if (roll <= 0) return { ...c.skill, config: c.entry };
  }
  return { ...candidates[candidates.length - 1].skill, config: candidates[candidates.length - 1].entry };
}

function getEnemyScheduledSkillForTurn(enemy, turnNumber, hero) {
  if (!enemy || !Array.isArray(enemy.skills) || turnNumber <= 0) return null;
  const hasWeighted = enemy.skills.some(e => {
    const n = normalizeEnemySkillEntry(e);
    return n && n.weight != null;
  });
  if (hasWeighted) {
    return pickWeightedSkill(enemy.skills, enemy, hero);
  }
  for (const rawEntry of enemy.skills) {
    const entry = normalizeEnemySkillEntry(rawEntry);
    if (!entry || !entry.id) continue;
    const skill = getEnemySkill(entry.id);
    if (!skill) continue;
    if (entry.condition && !checkSkillCondition(entry, enemy, hero)) continue;
    const everyTurns = entry.everyTurns != null ? entry.everyTurns : 0;
    const firstUseTurn = entry.firstUseTurn != null ? entry.firstUseTurn : everyTurns;
    if (everyTurns <= 0 || firstUseTurn <= 0) continue;
    if (turnNumber < firstUseTurn) continue;
    if ((turnNumber - firstUseTurn) % everyTurns !== 0) continue;
    return {
      ...skill,
      config: entry,
    };
  }
  return null;
}
