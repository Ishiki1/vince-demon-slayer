/**
 * classes.js
 * Central registry for class metadata, unlock rules, stats, skills, and combat visuals.
 */

const DEFAULT_CLASS_ID = 'warrior';

const CLASSES = {
  warrior: {
    id: 'warrior',
    displayName: 'Warrior',
    heroName: 'Vince',
    primaryStat: 'strength',
    baseStats: {
      strength: 10,
      intelligence: 5,
      health: 10,
      mana: 10,
      defense: 0,
    },
    growthPerLevel: {
      health: 4,
      mana: 2,
      strength: 1,
      intelligence: 1,
    },
    startingSkills: ['slash'],
    skillCatalogId: 'warrior',
    skillTreeId: 'warrior',
    unlock: {
      kind: 'default',
      label: 'Select',
    },
    classSelectOrder: 1,
    origin: {
      title: 'Warrior',
      body: 'His daughter was kidnapped by the evil demon lord. He must rescue her.',
    },
    visuals: {
      combatIdle: { sheetKey: 'hero_sheet', animKey: 'hero_idle' },
      uniqueSetIdleByElement: {
        'fire-stone': { sheetKey: 'hero_fire_set_idle_sheet', animKey: 'hero_fire_set_idle' },
        'ice-stone': { sheetKey: 'hero_ice_set_idle_sheet', animKey: 'hero_ice_set_idle' },
        'lightning-stone': { sheetKey: 'hero_lightning_set_idle_sheet', animKey: 'hero_lightning_set_idle' },
        'water-stone': { sheetKey: 'hero_water_set_idle_sheet', animKey: 'hero_water_set_idle' },
        'wind-stone': { sheetKey: 'hero_wind_set_idle_sheet', animKey: 'hero_wind_set_idle' },
      },
    },
  },
  sorceress: {
    id: 'sorceress',
    displayName: 'Sorceress',
    heroName: 'Isabella',
    primaryStat: 'intelligence',
    baseStats: {
      strength: 5,
      intelligence: 10,
      health: 10,
      mana: 10,
      defense: 0,
    },
    growthPerLevel: {
      health: 2,
      mana: 4,
      strength: 1,
      intelligence: 1,
    },
    startingSkills: ['fireball'],
    skillCatalogId: 'sorceress',
    skillTreeId: 'sorceress',
    unlock: {
      kind: 'story',
      act: 2,
      label: 'Unlock at L10',
    },
    classSelectOrder: 2,
    origin: {
      title: 'Sorceress',
      body: 'She will ensure no one else suffers as she did. She will defeat the demons once and for all!',
    },
    visuals: {
      combatIdle: { sheetKey: 'hero_sheet', animKey: 'hero_idle' },
      uniqueSetIdleByElement: {},
    },
  },
};

function getClassIds() {
  return Object.values(CLASSES)
    .sort((a, b) => (a.classSelectOrder || 0) - (b.classSelectOrder || 0))
    .map((classDef) => classDef.id);
}

function getClassDef(classId) {
  return CLASSES[classId] || CLASSES[DEFAULT_CLASS_ID];
}

function getDefaultUnlockedClassIds() {
  return getClassIds().filter((classId) => {
    const unlock = getClassDef(classId).unlock || {};
    return unlock.kind === 'default';
  });
}

const DEFAULT_UNLOCKED_CLASS_IDS = getDefaultUnlockedClassIds();

function normalizeUnlockedClassIds(unlockedClassIds) {
  const normalized = new Set(DEFAULT_UNLOCKED_CLASS_IDS);
  (Array.isArray(unlockedClassIds) ? unlockedClassIds : []).forEach((classId) => {
    if (CLASSES[classId]) normalized.add(classId);
  });
  return [...normalized];
}

function isClassUnlocked(classId, unlockedClassIds) {
  return normalizeUnlockedClassIds(unlockedClassIds).includes(classId);
}

function getSingleUnlockedClassId(unlockedClassIds) {
  const unlocked = getClassSelectEntries(unlockedClassIds).filter((entry) => entry.available);
  return unlocked.length === 1 ? unlocked[0].id : null;
}

function getClassSelectEntries(unlockedClassIds) {
  const unlocked = normalizeUnlockedClassIds(unlockedClassIds);
  return getClassIds().map((classId) => {
    const classDef = getClassDef(classId);
    const available = unlocked.includes(classId);
    const unlock = classDef.unlock || {};
    return {
      id: classId,
      name: classDef.displayName || classId,
      available,
      unlockLabel: available ? 'Select' : (unlock.label || 'Locked'),
    };
  });
}

function unlockClassesForAct(unlockedClassIds, act) {
  const unlocked = new Set(normalizeUnlockedClassIds(unlockedClassIds));
  getClassIds().forEach((classId) => {
    const unlock = getClassDef(classId).unlock || {};
    if (unlock.kind === 'story' && typeof unlock.act === 'number' && act >= unlock.act) {
      unlocked.add(classId);
    }
  });
  return [...unlocked];
}

function getClassGrowth(classId) {
  const classDef = getClassDef(classId);
  return classDef.growthPerLevel || {};
}

function getClassOrigin(classId) {
  const classDef = getClassDef(classId);
  return classDef.origin || {
    title: classDef.displayName || classDef.id,
    body: '',
  };
}

function getClassCombatIdleVisual(classId, setElement) {
  const classDef = getClassDef(classId);
  const visuals = classDef.visuals || {};
  const setVisual = setElement && visuals.uniqueSetIdleByElement
    ? visuals.uniqueSetIdleByElement[setElement]
    : null;
  return setVisual || visuals.combatIdle || { sheetKey: 'hero_sheet', animKey: 'hero_idle' };
}
