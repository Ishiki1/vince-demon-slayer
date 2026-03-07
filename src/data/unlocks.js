/**
 * unlocks.js
 * Unlock definitions and per-run selection helpers.
 * Select up to 2 unlocks per run as long as their combined RP cost fits within Total Run Points.
 */

const MAX_RUN_UNLOCKS = 2;
const RUN_SELECTION_KEY = 'vince_runUnlockSelection';

const UNLOCKS = {
  lucky: {
    id: 'lucky',
    name: 'Lucky',
    tooltip: '5% higher chance to drop rare and legendary items',
    effect: 'luck',
    cost: 50,
    value: 5,
  },
  discount: {
    id: 'discount',
    name: 'Discount',
    tooltip: '5% Discount on anything that costs gold!',
    effect: 'discount',
    cost: 50,
    value: 5,
  },
  growthSpurt: {
    id: 'growthSpurt',
    name: 'Growth Spurt',
    tooltip: 'Int/Str/Def, health and mana stats grow 1 point more for each level',
    effect: 'statGrowth',
    cost: 50,
    value: 1,
  },
  iLoveMining: {
    id: 'iLoveMining',
    name: 'I Love Mining',
    tooltip: 'Mine for free once a week',
    effect: 'freeMineWeekly',
    cost: 50,
    value: 1,
  },
};

const UNLOCK_IDS = ['lucky', 'discount', 'growthSpurt', 'iLoveMining'];

function getRunUnlockSelection() {
  try {
    const raw = localStorage.getItem(RUN_SELECTION_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(id => !!UNLOCKS[id]).slice(0, MAX_RUN_UNLOCKS) : [];
  } catch (_) {
    return [];
  }
}

function sanitizeRunUnlockSelection(totalPoints, arr) {
  const budget = Math.max(0, totalPoints || 0);
  const source = Array.isArray(arr) ? arr : [];
  const selected = [];
  let spent = 0;
  source.forEach((id) => {
    if (!UNLOCKS[id] || selected.includes(id) || selected.length >= MAX_RUN_UNLOCKS) return;
    const cost = UNLOCKS[id].cost != null ? UNLOCKS[id].cost : 0;
    if (spent + cost > budget) return;
    selected.push(id);
    spent += cost;
  });
  return selected;
}

function setRunUnlockSelection(arr) {
  try {
    const totalPoints = typeof getTotalPoints === 'function' ? getTotalPoints() : 0;
    const sanitized = sanitizeRunUnlockSelection(totalPoints, arr);
    localStorage.setItem(RUN_SELECTION_KEY, JSON.stringify(sanitized));
  } catch (_) {}
}
