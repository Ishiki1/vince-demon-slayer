/**
 * progression.js
 * XP, level-up, skill points, and skill tree choices.
 */

const ProgressionSystem = {
  /** Give XP to hero; returns true if level-up happened. On level-up, grant 2 skill points. */
  giveXP(hero, amount) {
    hero.xp += amount;
    const needed = CONFIG.XP_PER_LEVEL[hero.level];
    if (needed != null && hero.xp >= needed) {
      hero.level += 1;
      hero.skillPoints = (hero.skillPoints || 0) + 2;
      return true;
    }
    return false;
  },

  /** XP needed for next level (total). */
  xpNeededForNextLevel(hero) {
    return CONFIG.XP_PER_LEVEL[hero.level] || 999;
  },

  /** XP progress toward next level (for bar). 0..1. */
  xpProgress(hero) {
    const current = hero.level === 1 ? 0 : CONFIG.XP_PER_LEVEL[hero.level - 1];
    const next = ProgressionSystem.xpNeededForNextLevel(hero);
    const range = next - current;
    if (range <= 0) return 1;
    return (hero.xp - current) / range;
  },

  /** Get affordable choices for skill tree. Level 2 only offers tier-1 (weak) passives. For each level, only the strongest passive per stat is offered (one health, one mana, etc.). */
  getChoicesForLevel(level) {
    const hero = GAME_STATE.hero;
    if (!hero) return [];
    const points = hero.skillPoints || 0;
    const skillMap = getSkillsForClass(hero);
    const tierMap = typeof getSkillTreeForClass === 'function'
      ? getSkillTreeForClass(hero.class)
      : SKILL_TREE_BY_TIER;
    const maxTier = level >= 2 ? Math.min(level, 10) : 0;
    const maxPassiveTier = level === 2 ? 1 : maxTier;
    const pool = [];
    for (let t = 1; t <= maxTier; t++) {
      const tierChoices = tierMap[t];
      if (!tierChoices) continue;
      tierChoices.forEach(id => {
        if (PASSIVES[id] && t > maxPassiveTier) return;
        pool.push(id);
      });
    }
    const unique = [...new Set(pool)];
    const defaultSkill = typeof getDefaultSkillIdForClass === 'function'
      ? getDefaultSkillIdForClass(hero.class)
      : 'slash';
    const candidates = unique.filter(id => {
      if (id === defaultSkill) return false;
      const cost = typeof getChoiceCost === 'function' ? getChoiceCost(id) : 1;
      if (points < cost) return false;
      if (skillMap[id]) return !hero.skills.includes(id);
      if (PASSIVES[id]) return !(hero.passives || []).includes(id);
      return true;
    });
    const actives = candidates.filter(id => skillMap[id]);
    const passiveIds = candidates.filter(id => PASSIVES[id]);
    const bestByStat = {};
    passiveIds.forEach(id => {
      const p = PASSIVES[id];
      if (!p || !p.effect) return;
      const stat = p.effect.stat === 'evasion' ? 'evasion' : p.effect.stat;
      const tier = p.skillTier != null ? p.skillTier : 0;
      if (!bestByStat[stat] || (PASSIVES[bestByStat[stat]].skillTier || 0) < tier) bestByStat[stat] = id;
    });
    const onePerStat = Object.values(bestByStat);
    return [...actives, ...onePerStat];
  },

  /** Apply a skill tree choice (deduct cost, add skill or passive). */
  applyChoice(hero, choiceId) {
    const cost = typeof getChoiceCost === 'function' ? getChoiceCost(choiceId) : 1;
    if ((hero.skillPoints || 0) < cost) return false;
    const skillMap = getSkillsForClass(hero);
    if (skillMap[choiceId] && !hero.skills.includes(choiceId)) {
      hero.skillPoints = (hero.skillPoints || 0) - cost;
      hero.skills.push(choiceId);
      return true;
    }
    if (PASSIVES[choiceId] && !(hero.passives || []).includes(choiceId)) {
      hero.skillPoints = (hero.skillPoints || 0) - cost;
      hero.passives = hero.passives || [];
      hero.passives.push(choiceId);
      return true;
    }
    return false;
  },

  /** Add chosen skill to hero (e.g. from priest event). */
  addSkill(hero, skillId) {
    const skillMap = getSkillsForClass(hero);
    if (skillMap[skillId] && !hero.skills.includes(skillId)) {
      hero.skills.push(skillId);
    }
  },
};
