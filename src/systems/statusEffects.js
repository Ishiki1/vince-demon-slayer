/**
 * statusEffects.js
 * Pure status-effect state manipulation and UI helpers extracted from CombatScene.
 */

function getStatusEffectString(hero, displayedEvasionPercent) {
  const parts = [];
  if (hero.battleDefenseBonus > 0) parts.push('Def +' + hero.battleDefenseBonus);
  if ((hero.battleEvasionChance || 0) > 0) parts.push('Evasion ' + displayedEvasionPercent + '%');
  if ((hero.flameAuraRounds || 0) > 0) parts.push('Flame Aura ' + hero.flameAuraRounds + 'r');
  if ((hero.blockReflectRounds || 0) > 0) parts.push('Reflect ' + hero.blockReflectRounds + 'r');
  if ((hero.invulnerableRounds || 0) > 0) parts.push('Invulnerable ' + hero.invulnerableRounds + 'r');
  if ((hero.poisonRounds || 0) > 0) parts.push('Poisoned ' + hero.poisonRounds + 'r');
  if ((hero.regenRounds || 0) > 0) parts.push('Regen ' + hero.regenRounds + 'r');
  if ((hero.weakenedRounds || 0) > 0) parts.push('Weakened ' + hero.weakenedRounds + 'r');
  if ((hero.vulnerableRounds || 0) > 0) parts.push('Vulnerable ' + hero.vulnerableRounds + 'r');
  if (hero.doubletapActive) parts.push('Doubletap');
  if (hero.reaperFrightened) parts.push('Frightened');
  return parts.length ? parts.join(' | ') : '';
}

function clearHeroCombatBuffs(hero) {
  const removed = [];
  if ((hero.battleDefenseBonus || 0) > 0) removed.push('Def');
  if ((hero.battleEvasionChance || 0) > 0) removed.push('Evasion');
  if ((hero.flameAuraRounds || 0) > 0) removed.push('Flame Aura');
  if ((hero.blockReflectRounds || 0) > 0) removed.push('Reflect');
  if ((hero.invulnerableRounds || 0) > 0) removed.push('Invulnerable');
  hero.battleDefenseBonus = 0;
  hero.battleEvasionChance = 0;
  hero.flameAuraRounds = 0;
  hero.blockReflectRounds = 0;
  hero.invulnerableRounds = 0;
  return removed;
}

/** Tick poison: apply damage, decrement rounds. Returns { damage, faded, message }. */
function tickPoison(hero) {
  if ((hero.poisonRounds || 0) <= 0) return null;
  const damage = hero.poisonDamage || 1;
  hero.currentHealth = Math.max(0, hero.currentHealth - damage);
  hero.poisonRounds = Math.max(0, hero.poisonRounds - 1);
  const faded = hero.poisonRounds <= 0;
  const message = 'Poison tick! ' + damage + ' damage.' + (faded ? ' Poison faded.' : ' (' + hero.poisonRounds + ' turns left)');
  return { damage, faded, message };
}

/** Tick regen: heal, decrement rounds. Returns { amount, faded, message }. */
function tickRegen(hero) {
  if ((hero.regenRounds || 0) <= 0) return null;
  const amount = Math.max(1, Math.floor(hero.getEffectiveHealth() * (hero.regenPercent || 0.30)));
  hero.currentHealth = Math.min(hero.getEffectiveHealth(), hero.currentHealth + amount);
  hero.regenRounds = Math.max(0, hero.regenRounds - 1);
  const faded = hero.regenRounds <= 0;
  const message = 'Regen tick! +' + amount + ' HP.' + (faded ? ' Regen faded.' : ' (' + hero.regenRounds + ' turns left)');
  return { amount, faded, message };
}

/** Tick flame aura: deal DoT damage to all living enemies. Returns { damage, message }. */
function tickFlameAura(hero, enemies) {
  if ((hero.flameAuraRounds || 0) <= 0) return null;
  const weaponDamageMult = hero.getWeaponDamageMultiplier ? hero.getWeaponDamageMultiplier() : 1;
  const dmg = Math.floor((hero.getIntelligence ? hero.getIntelligence() : 0) * 1.0 * weaponDamageMult);
  const hitIndices = [];
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].hp > 0) {
      enemies[i].hp = Math.max(0, enemies[i].hp - dmg);
      hitIndices.push(i);
    }
  }
  hero.flameAuraRounds = hero.flameAuraRounds - 1;
  return { damage: dmg, hitIndices, message: 'Flame Aura tick. ' + dmg + ' damage to all.' };
}

/** Decay weakened status. Returns { faded, message } or null. */
function decayWeakened(hero) {
  if ((hero.weakenedRounds || 0) <= 0) return null;
  hero.weakenedRounds = Math.max(0, hero.weakenedRounds - 1);
  if (hero.weakenedRounds <= 0) {
    hero.weakenedFactor = 0;
    return { faded: true, message: 'Weakened effect faded.' };
  }
  return { faded: false, message: null };
}

/** Decay vulnerable status. Returns { faded, message } or null. */
function decayVulnerable(hero) {
  if ((hero.vulnerableRounds || 0) <= 0) return null;
  hero.vulnerableRounds = Math.max(0, hero.vulnerableRounds - 1);
  if (hero.vulnerableRounds <= 0) {
    hero.vulnerableFactor = 0;
    return { faded: true, message: 'Vulnerable effect faded.' };
  }
  return { faded: false, message: null };
}

function decayInvulnerable(hero) {
  if ((hero.invulnerableRounds || 0) > 0) {
    hero.invulnerableRounds = Math.max(0, hero.invulnerableRounds - 1);
  }
}

function decayBlockReflect(hero) {
  if ((hero.blockReflectRounds || 0) > 0) {
    hero.blockReflectRounds = Math.max(0, hero.blockReflectRounds - 1);
  }
}
