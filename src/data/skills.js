/**
 * skills.js
 * Warrior skill tree. Slash is available from level 1 (default). Others unlocked by tier.
 * skillTier: when this skill can be offered. cost: 1, 2, or 3 (ultimate).
 */

const WARRIOR_SKILLS = {
  slash: {
    id: 'slash',
    name: 'Slash',
    manaCost: 0,
    damageMultiplier: 1.0,
    assetKey: 'button-slash',
    skillTier: 1,
    cost: 0,
  },
  heavyStrike: {
    id: 'heavyStrike',
    name: 'Heavy Strike',
    manaCost: 3,
    damageMultiplier: 1.5,
    assetKey: 'button-heavy-strike',
    skillTier: 1,
    cost: 1,
  },
  whirlwind: {
    id: 'whirlwind',
    name: 'Whirlwind',
    manaCost: 7,
    damageMultiplier: 2.2,
    isAoe: true,
    assetKey: 'button-whirlwind',
    skillTier: 3,
    cost: 1,
  },
  execute: {
    id: 'execute',
    name: 'Execute',
    manaCost: 5,
    damageMultiplier: 2.0,
    assetKey: 'button-execute',
    skillTier: 2,
    cost: 1,
  },
  ironSkin: {
    id: 'ironSkin',
    name: 'Iron Skin',
    manaCost: 2,
    assetKey: 'button-iron-skin',
    battleDefenseBonus: 8,
    skillTier: 2,
    cost: 1,
  },
  evasion: {
    id: 'evasion',
    name: 'Evasion',
    manaCost: 2,
    assetKey: 'button-evasion',
    battleEvasionChance: 0.5,
    skillTier: 2,
    cost: 1,
  },
  holyLight: {
    id: 'holyLight',
    name: 'Holy Light',
    manaCost: 5,
    assetKey: 'button-holy-light',
    isHeal: true,
    healPercentMaxHealth: 0.35,
    skillTier: 2,
    cost: 1,
  },
  lifeDrain: {
    id: 'lifeDrain',
    name: 'Life Drain',
    manaCost: 10,
    damageMultiplier: 1.2,
    isAoe: true,
    lifeSteal: true,
    assetKey: 'button-life-drain',
    skillTier: 5,
    cost: 2,
    isUltimate: true,
  },
  thorncape: {
    id: 'thorncape',
    name: 'Thorncape',
    manaCost: 15,
    assetKey: 'button-thorncape',
    skillTier: 10,
    cost: 2,
    isUltimate: true,
    blockReflectRounds: 2,
  },
  ironEvasion: {
    id: 'ironEvasion',
    name: 'Iron Evasion',
    manaCost: 10,
    assetKey: 'button-iron-evasion',
    skillTier: 10,
    cost: 3,
    isUltimate: true,
    battleDefenseBonus: 10,
    battleEvasionChance: 0.55,
  },
};

const SORCERESS_SKILLS = {
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    manaCost: 0,
    damageMultiplier: 1.0,
    damageStat: 'intelligence',
    assetKey: 'button-fireball',
    skillTier: 1,
    cost: 0,
  },
  flameAura: {
    id: 'flameAura',
    name: 'Flame Aura',
    manaCost: 4,
    damageStat: 'intelligence',
    dotRounds: 3,
    dotMultiplier: 1.0,
    assetKey: 'button-flame-aura',
    skillTier: 1,
    cost: 1,
  },
  flameWall: {
    id: 'flameWall',
    name: 'Flame Wall',
    manaCost: 5,
    battleEvasionChance: 0.4,
    assetKey: 'button-flame-wall',
    skillTier: 3,
    cost: 1,
  },
  scorch: {
    id: 'scorch',
    name: 'Scorch',
    manaCost: 4,
    damageMultiplier: 1.6,
    damageStat: 'intelligence',
    assetKey: 'button-scorch',
    skillTier: 1,
    cost: 1,
  },
  inferno: {
    id: 'inferno',
    name: 'Inferno',
    manaCost: 7,
    damageMultiplier: 2.0,
    damageStat: 'intelligence',
    isAoe: true,
    assetKey: 'button-inferno',
    skillTier: 2,
    cost: 1,
  },
  manaShield: {
    id: 'manaShield',
    name: 'Mana Shield',
    manaCost: 2,
    assetKey: 'button-mana-shield',
    battleDefenseBonus: 5,
    skillTier: 2,
    cost: 1,
  },
  blink: {
    id: 'blink',
    name: 'Blink',
    manaCost: 2,
    assetKey: 'button-blink',
    battleEvasionChance: 0.5,
    skillTier: 2,
    cost: 1,
  },
  arcaneHeal: {
    id: 'arcaneHeal',
    name: 'Arcane Heal',
    manaCost: 4,
    assetKey: 'button-arcane-heal',
    isHeal: true,
    healValue: 5,
    skillTier: 2,
    cost: 1,
  },
  meteor: {
    id: 'meteor',
    name: 'Meteor',
    manaCost: 10,
    damageMultiplier: 2.2,
    damageStat: 'intelligence',
    isAoe: true,
    assetKey: 'button-meteor',
    skillTier: 4,
    cost: 2,
    isUltimate: true,
  },
  arcaneEcho: {
    id: 'arcaneEcho',
    name: 'Arcane Echo',
    manaCost: 15,
    assetKey: 'button-mana-shield',
    skillTier: 10,
    cost: 2,
    isUltimate: true,
    blockReflectRounds: 2,
  },
  crystalFortress: {
    id: 'crystalFortress',
    name: 'Crystal Fortress',
    manaCost: 15,
    assetKey: 'button-mana-shield',
    skillTier: 10,
    cost: 3,
    isUltimate: true,
    battleEvasionChance: 0.6,
    battleDefenseBonus: 5,
  },
};

// Passives: rebalanced. Tier 1 (level 2): weak. Tier 2 (level 4+): stronger.
const PASSIVES = {
  str1: { id: 'str1', name: '+1 Strength', effect: { stat: 'strength', value: 1 }, skillTier: 1, cost: 1, assetKey: 'passive-str1' },
  hp2: { id: 'hp2', name: '+2 Max Health', effect: { stat: 'health', value: 2 }, skillTier: 1, cost: 1, assetKey: 'passive-hp2' },
  mana2: { id: 'mana2', name: '+2 Max Mana', effect: { stat: 'mana', value: 2 }, skillTier: 1, cost: 1, assetKey: 'passive-mana2' },
  def1: { id: 'def1', name: '+1 Defense', effect: { stat: 'defense', value: 1 }, skillTier: 1, cost: 1, assetKey: 'passive-def1' },
  str2: { id: 'str2', name: '+2 Strength', effect: { stat: 'strength', value: 2 }, skillTier: 2, cost: 1, assetKey: 'passive-str2' },
  hp4: { id: 'hp4', name: '+4 Max Health', effect: { stat: 'health', value: 4 }, skillTier: 2, cost: 1, assetKey: 'passive-hp4' },
  mana4: { id: 'mana4', name: '+4 Max Mana', effect: { stat: 'mana', value: 4 }, skillTier: 2, cost: 1, assetKey: 'passive-mana4' },
  def2: { id: 'def2', name: '+2 Defense', effect: { stat: 'defense', value: 2 }, skillTier: 2, cost: 1, assetKey: 'passive-def2' },
  translucentSkin: { id: 'translucentSkin', name: 'Translucent Skin', effect: { stat: 'evasion', value: 0.1 }, skillTier: 3, cost: 1, assetKey: 'passive-translucent-skin' },
  int1: { id: 'int1', name: '+1 Intelligence', effect: { stat: 'intelligence', value: 1 }, skillTier: 1, cost: 1 },
  int2: { id: 'int2', name: '+2 Intelligence', effect: { stat: 'intelligence', value: 2 }, skillTier: 2, cost: 1 },
  // Warrior tier 6-10 passives
  w_t6: { id: 'w_t6', name: 'Reinforced Hide', effect: { stat: 'defense', value: 3 }, skillTier: 6, cost: 1, assetKey: 'passive-reinforced-hide' },
  w_t7: { id: 'w_t7', name: 'Brutal Might', effect: { stat: 'strength', value: 3 }, skillTier: 7, cost: 1, assetKey: 'passive-brutal-might' },
  w_t8: { id: 'w_t8', name: 'Vitality', effect: { stat: 'health', value: 6 }, skillTier: 8, cost: 1, assetKey: 'passive-vitality' },
  w_t9: { id: 'w_t9', name: 'Battle Focus', effect: { stat: 'mana', value: 6 }, skillTier: 9, cost: 1, assetKey: 'passive-battle-focus' },
  w_t10: { id: 'w_t10', name: 'Combat Reflexes', effect: { stat: 'evasion', value: 0.15 }, skillTier: 10, cost: 1, assetKey: 'passive-combat-reflexes' },
  // Sorceress tier 6-10 passives
  s_t6: { id: 's_t6', name: 'Arcane Mind', effect: { stat: 'intelligence', value: 3 }, skillTier: 6, cost: 1 },
  s_t7: { id: 's_t7', name: 'Mana Well', effect: { stat: 'mana', value: 6 }, skillTier: 7, cost: 1 },
  s_t8: { id: 's_t8', name: 'Ethereal Vitality', effect: { stat: 'health', value: 6 }, skillTier: 8, cost: 1 },
  s_t9: { id: 's_t9', name: 'Ward Skin', effect: { stat: 'defense', value: 3 }, skillTier: 9, cost: 1 },
  s_t10: { id: 's_t10', name: 'Mystic Dodge', effect: { stat: 'evasion', value: 0.15 }, skillTier: 10, cost: 1 },
};

const SKILLS_BY_CLASS = {
  warrior: WARRIOR_SKILLS,
  sorceress: SORCERESS_SKILLS,
};

/** Get skill cost (1 or 2 for ultimate). */
function getSkillCost(skillId) {
  const skill = WARRIOR_SKILLS[skillId] || SORCERESS_SKILLS[skillId];
  return skill ? (skill.cost != null ? skill.cost : 1) : 0;
}

/** Get passive cost. */
function getPassiveCost(passiveId) {
  const p = PASSIVES[passiveId];
  return p ? (p.cost != null ? p.cost : 1) : 0;
}

/** Get cost for any choice id (skill or passive). */
function getChoiceCost(choiceId) {
  if (WARRIOR_SKILLS[choiceId] || SORCERESS_SKILLS[choiceId]) return getSkillCost(choiceId);
  if (PASSIVES[choiceId]) return getPassiveCost(choiceId);
  return 1;
}

function getSkillCatalogIdForClass(classId) {
  const classDef = typeof getClassDef === 'function' ? getClassDef(classId) : null;
  return (classDef && classDef.skillCatalogId) || classId || 'warrior';
}

/** Skill map for the hero's class. */
function getSkillsForClass(heroOrClassId) {
  const classId = typeof heroOrClassId === 'string'
    ? heroOrClassId
    : (heroOrClassId && heroOrClassId.class);
  const catalogId = getSkillCatalogIdForClass(classId);
  return SKILLS_BY_CLASS[catalogId] || WARRIOR_SKILLS;
}

function getDefaultSkillIdForClass(classId) {
  const classDef = typeof getClassDef === 'function' ? getClassDef(classId) : null;
  if (classDef && Array.isArray(classDef.startingSkills) && classDef.startingSkills.length > 0) {
    return classDef.startingSkills[0];
  }
  return 'slash';
}

function getDefaultZeroManaSkillId(hero) {
  if (!hero || !Array.isArray(hero.skills)) return null;
  const defaultSkillId = getDefaultSkillIdForClass(hero.class);
  if (!defaultSkillId || hero.lockedSkillId === defaultSkillId || !hero.skills.includes(defaultSkillId)) {
    return null;
  }
  const skill = getSkill(hero, defaultSkillId);
  if (!skill || skill.manaCost !== 0 || skill.isAoe || skill.isHeal) return null;
  return defaultSkillId;
}

/** Get a single skill by id for the given hero. */
function getSkill(hero, skillId) {
  const map = getSkillsForClass(hero);
  return map ? map[skillId] : null;
}

function getSkillHealAmount(hero, skill) {
  if (!skill || !skill.isHeal) return 0;
  if (skill.healPercentMaxHealth != null && hero && typeof hero.getEffectiveHealth === 'function') {
    return Math.round(hero.getEffectiveHealth() * skill.healPercentMaxHealth);
  }
  return skill.healValue != null ? skill.healValue : 0;
}

function getSkillHealDescription(skill) {
  if (!skill || !skill.isHeal) return '';
  if (skill.healPercentMaxHealth != null) {
    return 'Heals ' + Math.round(skill.healPercentMaxHealth * 100) + '% Max HP';
  }
  if (skill.healValue != null) {
    return 'Heals ' + skill.healValue + ' HP';
  }
  return 'Heals';
}

function getChoiceAssetKey(choiceId, hero) {
  const skill = getSkill(hero, choiceId);
  if (skill && skill.assetKey) return skill.assetKey;
  const passive = PASSIVES[choiceId];
  return passive && passive.assetKey ? passive.assetKey : null;
}

/** All choice ids that can appear in tree, by tier. Slash is never offered (default at level 1). Whirlwind tier 3+. */
const SKILL_TREE_BY_TIER = {
  1: ['heavyStrike', 'str1', 'hp2', 'mana2', 'def1'],
  2: ['execute', 'ironSkin', 'evasion', 'holyLight', 'str2', 'hp4', 'mana4', 'def2'],
  3: ['whirlwind', 'execute', 'ironSkin', 'evasion', 'holyLight', 'translucentSkin', 'str2', 'hp4', 'mana4', 'def2'],
  4: ['whirlwind', 'execute', 'ironSkin', 'evasion', 'holyLight', 'translucentSkin', 'str2', 'hp4', 'mana4', 'def2'],
  5: ['lifeDrain', 'whirlwind', 'execute', 'ironSkin', 'evasion', 'holyLight', 'translucentSkin', 'str2', 'hp4', 'mana4', 'def2'],
  6: ['w_t6'],
  7: ['w_t7'],
  8: ['w_t8'],
  9: ['w_t9'],
  10: ['thorncape', 'ironEvasion', 'w_t10'],
};

const SKILL_TREE_BY_TIER_SORCERESS = {
  1: ['scorch', 'flameAura', 'int1', 'hp2', 'mana2', 'def1'],
  2: ['inferno', 'manaShield', 'blink', 'arcaneHeal', 'int2', 'hp4', 'mana4', 'def2'],
  3: ['flameWall', 'inferno', 'manaShield', 'blink', 'arcaneHeal', 'translucentSkin', 'int2', 'hp4', 'mana4', 'def2'],
  4: ['meteor', 'inferno', 'manaShield', 'blink', 'arcaneHeal', 'translucentSkin', 'int2', 'hp4', 'mana4', 'def2'],
  5: ['meteor', 'inferno', 'manaShield', 'blink', 'arcaneHeal', 'translucentSkin', 'int2', 'hp4', 'mana4', 'def2'],
  6: ['s_t6'],
  7: ['s_t7'],
  8: ['s_t8'],
  9: ['s_t9'],
  10: ['arcaneEcho', 'crystalFortress', 's_t10'],
};

const LEVEL_UP_SKILL_CHOICES = ['heavyStrike', 'whirlwind', 'execute'];
const LEVEL_UP_SKILL_CHOICES_SORCERESS = ['scorch', 'inferno', 'arcaneHeal'];

const SKILL_TREES_BY_CLASS = {
  warrior: SKILL_TREE_BY_TIER,
  sorceress: SKILL_TREE_BY_TIER_SORCERESS,
};

const LEVEL_UP_SKILL_CHOICES_BY_CLASS = {
  warrior: LEVEL_UP_SKILL_CHOICES,
  sorceress: LEVEL_UP_SKILL_CHOICES_SORCERESS,
};

function getSkillTreeForClass(classId) {
  const classDef = typeof getClassDef === 'function' ? getClassDef(classId) : null;
  const treeId = (classDef && classDef.skillTreeId) || classId || 'warrior';
  return SKILL_TREES_BY_CLASS[treeId] || SKILL_TREE_BY_TIER;
}

function getLevelUpSkillChoicesForClass(classId) {
  const classDef = typeof getClassDef === 'function' ? getClassDef(classId) : null;
  const treeId = (classDef && classDef.skillTreeId) || classId || 'warrior';
  return LEVEL_UP_SKILL_CHOICES_BY_CLASS[treeId] || LEVEL_UP_SKILL_CHOICES;
}

/** Tooltip text for skill tree: active skill (damage, mana, single/AoE, heal/buff). */
function getSkillChoiceTooltip(choiceId, hero) {
  const skillMap = getSkillsForClass(hero);
  const skill = skillMap[choiceId];
  if (!skill) return '';
  const lines = [skill.name, skill.manaCost + ' mana'];
  if (skill.damageMultiplier != null) {
    const stat = skill.damageStat === 'intelligence' ? 'Int' : 'Str';
    lines.push((skill.damageMultiplier) + 'x ' + stat + ' damage');
  }
  if (skill.isAoe) lines.push('AoE');
  else if (skill.damageMultiplier != null || skill.isHeal) lines.push('Single target');
  if (skill.isHeal) lines.push(getSkillHealDescription(skill));
  if (skill.battleDefenseBonus != null) lines.push('Def +' + skill.battleDefenseBonus + ' this battle');
  if (skill.battleEvasionChance != null) lines.push('Evasion +' + Math.round((skill.battleEvasionChance || 0) * 100) + '%');
  if (skill.dotRounds != null) lines.push('DoT ' + skill.dotRounds + ' rounds');
  if (skill.lifeSteal) lines.push('Life steal');
  if (skill.blockReflectRounds != null) lines.push('Block damage for ' + skill.blockReflectRounds + ' turns, reflect to attackers');
  return lines.join(' | ');
}

/** Tooltip text for skill tree: passive (name and effect). */
function getPassiveChoiceTooltip(choiceId) {
  const p = PASSIVES[choiceId];
  if (!p) return '';
  const effect = p.effect;
  if (!effect) return p.name;
  if (effect.stat === 'evasion') return p.name + ' | ' + Math.round((effect.value || 0) * 100) + '% Evasion (passive)';
  const val = effect.value;
  const statNames = { strength: 'Strength', health: 'Max Health', mana: 'Max Mana', defense: 'Defense', intelligence: 'Intelligence' };
  return p.name + ' | +' + val + ' ' + (statNames[effect.stat] || effect.stat);
}
