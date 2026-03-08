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
};

function getEnemySkill(skillId) {
  return skillId && ENEMY_SKILLS[skillId] ? ENEMY_SKILLS[skillId] : null;
}

function normalizeEnemySkillEntry(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') return { id: entry };
  return typeof entry === 'object' ? entry : null;
}

function getEnemyScheduledSkillForTurn(enemy, turnNumber) {
  if (!enemy || !Array.isArray(enemy.skills) || turnNumber <= 0) return null;
  for (const rawEntry of enemy.skills) {
    const entry = normalizeEnemySkillEntry(rawEntry);
    if (!entry || !entry.id) continue;
    const skill = getEnemySkill(entry.id);
    if (!skill) continue;
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
