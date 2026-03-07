/**
 * combat.js
 * Deal damage, apply defense, check win/lose.
 */

const CombatSystem = {
  /**
   * Deal skill damage from attacker to target.
   * @returns actual damage dealt
   */
  dealDamage(attacker, target, skillId) {
    const skill = getSkill(attacker, skillId);
    if (!skill || skill.damageMultiplier == null) return 0;
    const stat = skill.damageStat === 'intelligence' && attacker.getIntelligence ? attacker.getIntelligence() : attacker.getStrength();
    const weaponDamageMult = attacker && attacker.getWeaponDamageMultiplier ? attacker.getWeaponDamageMultiplier() : 1;
    let damage = Math.floor(stat * skill.damageMultiplier * weaponDamageMult);
    if (target.getDefense) damage = Math.max(1, damage - target.getDefense());
    else if (target.defense != null) damage = Math.max(1, damage - (target.defense || 0));
    target.hp = Math.max(0, target.hp - damage);
    return damage;
  },

  /**
   * Deal skill damage to all targets (e.g. Whirlwind AoE). Same formula per target.
   * @returns array of damage dealt per target (results[i] = damage to targets[i], 0 if already dead)
   */
  dealDamageToAll(attacker, targets, skillId) {
    const skill = getSkill(attacker, skillId);
    if (!skill) return targets.map(() => 0);
    const results = [];
    for (const target of targets) {
      if (target.hp <= 0) results.push(0);
      else results.push(this.dealDamage(attacker, target, skillId));
    }
    return results;
  },

  /** Returns { damage, evaded } for an enemy attack. Evasion is rolled here so callers can use it for reflect. Does not modify hero. */
  getEnemyAttackDamage(enemy, hero) {
    if ((hero.invulnerableRounds || 0) > 0) return { damage: 0, evaded: false, invulnerable: true };
    const evasionChance = hero.getEvasionChance ? hero.getEvasionChance() : (hero.battleEvasionChance || 0);
    if (evasionChance > 0 && Math.random() < evasionChance) return { damage: 0, evaded: true };
    const damage = Math.max(1, enemy.damage - hero.getDefense());
    return { damage, evaded: false };
  },

  /** Enemy hits hero. Hero has getDefense(). Evasion can negate damage. Returns damage dealt (0 if evaded). */
  enemyAttack(enemy, hero) {
    const result = this.getEnemyAttackDamage(enemy, hero);
    if (!result.evaded) hero.currentHealth = Math.max(0, hero.currentHealth - result.damage);
    return result.damage;
  },

  isEnemyDead(enemy) {
    return enemy.hp <= 0;
  },

  isHeroDead(hero) {
    return hero.currentHealth <= 0;
  },
};
