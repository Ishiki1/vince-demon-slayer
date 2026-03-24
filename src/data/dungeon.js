/**
 * dungeon.js
 * Witch's Dungeon configuration: tile grid, outcomes, thresholds, and landmarks.
 */

const DUNGEON_COLS = 8;
const DUNGEON_ROWS = 6;
const DUNGEON_TILE_W = 100;
const DUNGEON_TILE_H = 100;

/** Tile type constants. */
const TILE_BLOCKED    = 'blocked';
const TILE_FLOOR      = 'floor';
const TILE_GATE       = 'gate';
const TILE_PENTAGRAM  = 'pentagram';
const TILE_CAULDRON   = 'cauldron';
const TILE_MUSHROOM   = 'mushroom';
const TILE_BOOKSHELF  = 'bookshelf';
const TILE_TABLE      = 'table';

const DUNGEON_GRID = [
  // row 0 (top wall / shelves / cauldron area)
  [TILE_BLOCKED, TILE_BLOCKED,  TILE_CAULDRON, TILE_BLOCKED,   TILE_BLOCKED,   TILE_BLOCKED, TILE_BOOKSHELF, TILE_BLOCKED],
  // row 1
  [TILE_BLOCKED, TILE_FLOOR,    TILE_FLOOR,    TILE_FLOOR,     TILE_FLOOR,     TILE_FLOOR,   TILE_FLOOR,     TILE_BLOCKED],
  // row 2
  [TILE_MUSHROOM,TILE_FLOOR,    TILE_FLOOR,    TILE_PENTAGRAM, TILE_PENTAGRAM, TILE_FLOOR,   TILE_FLOOR,     TILE_BLOCKED],
  // row 3
  [TILE_MUSHROOM,TILE_FLOOR,    TILE_FLOOR,    TILE_PENTAGRAM, TILE_PENTAGRAM, TILE_FLOOR,   TILE_FLOOR,     TILE_BLOCKED],
  // row 4
  [TILE_TABLE,   TILE_FLOOR,    TILE_FLOOR,    TILE_FLOOR,     TILE_FLOOR,     TILE_FLOOR,   TILE_FLOOR,     TILE_BLOCKED],
  // row 5 (bottom wall / gate)
  [TILE_BLOCKED, TILE_BLOCKED,  TILE_FLOOR,    TILE_GATE,      TILE_GATE,      TILE_FLOOR,   TILE_BLOCKED,   TILE_BLOCKED],
];

function isDungeonWalkable(tileType) {
  return tileType && tileType !== TILE_BLOCKED;
}

function getDungeonTile(col, row) {
  if (row < 0 || row >= DUNGEON_ROWS || col < 0 || col >= DUNGEON_COLS) return TILE_BLOCKED;
  return DUNGEON_GRID[row][col];
}

/** Pixel center of a grid cell on the 800x600 canvas. */
function getTileCenter(col, row) {
  return {
    x: col * DUNGEON_TILE_W + DUNGEON_TILE_W / 2,
    y: row * DUNGEON_TILE_H + DUNGEON_TILE_H / 2,
  };
}

/** Hero starting tile (first gate cell). */
const DUNGEON_START = { col: 3, row: 5 };

const DUNGEON_WITCH_MIN_STEPS = 8;
const DUNGEON_WITCH_GUARANTEED_STEPS = 12;
const DUNGEON_WITCH_CHANCE_PER_STEP = 0.25;

function shouldWitchSpawn(stepsTaken) {
  if (stepsTaken >= DUNGEON_WITCH_GUARANTEED_STEPS) return true;
  if (stepsTaken < DUNGEON_WITCH_MIN_STEPS) return false;
  return Math.random() < DUNGEON_WITCH_CHANCE_PER_STEP;
}

/** One pentagram tile where the witch marker appears. */
const DUNGEON_PENTAGRAM_TILE = { col: 3, row: 2 };

const DUNGEON_LANDMARK_REWARDS = {
  cauldron:  { type: 'herb', pool: [{ id: 'ghostcap', weight: 40 }, { id: 'witchbloom', weight: 40 }, { id: 'moonpetal', weight: 20 }] },
  mushroom:  { type: 'herb', pool: [{ id: 'moonpetal', weight: 50 }, { id: 'thornroot', weight: 50 }] },
  bookshelf: { type: 'flavor', text: 'Ancient potion recipes... the Alchemist would love these.' },
  table:     { type: 'flavor', text: "The Witch's journal mentions a powerful nightshade plant..." },
};

function pickWeightedHerb(pool) {
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return pool[pool.length - 1].id;
}

function rollLandmarkReward(tileType) {
  const def = DUNGEON_LANDMARK_REWARDS[tileType];
  if (!def) return null;
  if (def.type === 'flavor') return { type: 'flavor', text: def.text };
  if (def.type === 'herb') return { type: 'herb', herbId: pickWeightedHerb(def.pool) };
  return null;
}

const DUNGEON_FLOOR_OUTCOMES = [
  { type: 'herb',    weight: 30 },
  { type: 'goon',    weight: 25 },
  { type: 'trap',    weight: 15 },
  { type: 'nothing', weight: 30 },
];

const DUNGEON_FLOOR_HERBS = [
  { id: 'moonpetal',  weight: 40 },
  { id: 'thornroot',  weight: 40 },
  { id: 'ghostcap',   weight: 15 },
  { id: 'witchbloom', weight: 5 },
];

const DUNGEON_FLAVOR_TEXTS = [
  'The stone floor is cold and damp...',
  'Shadows flicker on the walls.',
  'You hear a distant bubbling sound.',
  'Cobwebs brush against your face.',
  'A faint green glow pulses in the darkness.',
  'Bones crunch underfoot.',
];

function rollFloorOutcome() {
  const total = DUNGEON_FLOOR_OUTCOMES.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of DUNGEON_FLOOR_OUTCOMES) {
    roll -= entry.weight;
    if (roll <= 0) {
      if (entry.type === 'herb') return { type: 'herb', herbId: pickWeightedHerb(DUNGEON_FLOOR_HERBS) };
      if (entry.type === 'goon') return { type: 'goon', goonType: pickWeightedGoonType() };
      if (entry.type === 'trap') return { type: 'trap' };
      return { type: 'nothing', text: DUNGEON_FLAVOR_TEXTS[Math.floor(Math.random() * DUNGEON_FLAVOR_TEXTS.length)] };
    }
  }
  return { type: 'nothing', text: DUNGEON_FLAVOR_TEXTS[0] };
}

/**
 * BFS shortest path between two grid cells. Returns array of {col, row} from
 * start (exclusive) to end (inclusive), or null if unreachable.
 */
function findDungeonPath(startCol, startRow, endCol, endRow) {
  if (startCol === endCol && startRow === endRow) return [];
  if (!isDungeonWalkable(getDungeonTile(endCol, endRow))) return null;

  const key = (c, r) => c + ',' + r;
  const visited = new Set();
  visited.add(key(startCol, startRow));
  const queue = [{ col: startCol, row: startRow, path: [] }];
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

  while (queue.length > 0) {
    const cur = queue.shift();
    for (const [dc, dr] of dirs) {
      const nc = cur.col + dc;
      const nr = cur.row + dr;
      const k = key(nc, nr);
      if (visited.has(k)) continue;
      if (!isDungeonWalkable(getDungeonTile(nc, nr))) continue;
      visited.add(k);
      const newPath = [...cur.path, { col: nc, row: nr }];
      if (nc === endCol && nr === endRow) return newPath;
      queue.push({ col: nc, row: nr, path: newPath });
    }
  }
  return null;
}

const DUNGEON_GOON_HERB_LOOT = [
  { id: 'moonpetal',  weight: 28 },
  { id: 'thornroot',  weight: 27 },
  { id: 'ghostcap',   weight: 15 },
  { id: 'witchbloom', weight: 15 },
  { id: 'nightshade', weight: 10 },
  { id: null,          weight: 5 },
];

function rollDungeonGoonHerbDrop() {
  const total = DUNGEON_GOON_HERB_LOOT.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of DUNGEON_GOON_HERB_LOOT) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return null;
}

const DUNGEON_GOON_WEIGHTS = [
  { type: 'mushroom', weight: 50 },
  { type: 'plant',    weight: 35 },
  { type: 'toad',     weight: 15 },
];

function pickWeightedGoonType() {
  const total = DUNGEON_GOON_WEIGHTS.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of DUNGEON_GOON_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }
  return 'mushroom';
}

const DUNGEON_GOON_NAMES = { mushroom: 'Mushroom Creature', plant: 'Thorn Creeper', toad: 'Plague Toad' };

const DUNGEON_GOON_PROFILES = {
  mushroom: { hpMult: 1,   dmgMult: 1,   skills: [{ id: 'mushroom-spore-skill', everyTurns: 3, firstUseTurn: 2 }] },
  plant:    { hpMult: 0.7, dmgMult: 1.4, skills: [{ id: 'plant-vine-skill',     everyTurns: 3, firstUseTurn: 1 }] },
  toad:     { hpMult: 1.5, dmgMult: 0.6, skills: [{ id: 'toad-spit-skill',      everyTurns: 3, firstUseTurn: 2 }] },
};

function createDungeonGoon(heroLevel, goonType) {
  const type = goonType || pickWeightedGoonType();
  const profile = DUNGEON_GOON_PROFILES[type] || DUNGEON_GOON_PROFILES.mushroom;
  const baseHp = 30 + heroLevel * 12;
  const baseDmg = 4 + heroLevel * 1.8;
  const hp = Math.floor(baseHp * profile.hpMult);
  const damage = Math.max(1, Math.floor(baseDmg * profile.dmgMult));
  return {
    levelIndex: -1,
    name: DUNGEON_GOON_NAMES[type] || 'Dungeon Creature',
    maxHp: hp,
    hp,
    damage,
    isBoss: false,
    goonType: type,
    turnsTaken: 0,
    skills: profile.skills.map(s => ({ ...s })),
  };
}

function createWitch(heroLevel) {
  const hp = 60 + heroLevel * 20;
  const damage = Math.max(1, Math.floor(6 + heroLevel * 2.5));
  return {
    levelIndex: -1,
    name: 'The Witch',
    maxHp: hp,
    hp,
    damage,
    isBoss: true,
    goonType: null,
    turnsTaken: 0,
    skills: [
      { id: 'witch-poison-skill', everyTurns: 2, firstUseTurn: 1 },
      { id: 'witch-summon-skill', everyTurns: 999, firstUseTurn: 2 },
      { id: 'witch-heal-skill', weight: 40, condition: 'hpBelow', threshold: 0.5 },
    ],
  };
}
