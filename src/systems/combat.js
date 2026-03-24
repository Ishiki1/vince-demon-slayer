/**
 * combat.js
 * Deal damage, apply defense, check win/lose.
 */

const CombatSystem = {
  /**
   * Deal skill damage from attacker to target.
   * @returns {{ damage: number, dodged: boolean }}
   */
  dealDamage(attacker, target, skillId) {
    const skill = getSkill(attacker, skillId);
    if (!skill || skill.damageMultiplier == null) return { damage: 0, dodged: false };
    const attackerTrueDmg = attacker.hasEquippedTrueDamage ? attacker.hasEquippedTrueDamage() : false;
    if (!skill.trueDamage && !attackerTrueDmg && target.dodgeChance > 0 && Math.random() < target.dodgeChance) {
      return { damage: 0, dodged: true };
    }
    const stat = skill.damageStat === 'intelligence' && attacker.getIntelligence ? attacker.getIntelligence() : attacker.getStrength();
    const weaponDamageMult = attacker && attacker.getWeaponDamageMultiplier ? attacker.getWeaponDamageMultiplier() : 1;
    let damage = Math.floor(stat * skill.damageMultiplier * weaponDamageMult);
    let targetDef = target.getDefense ? target.getDefense() : (target.defense || 0);
    targetDef += (target.shieldDefense || 0);
    damage = Math.max(1, damage - targetDef);
    target.hp = Math.max(0, target.hp - damage);
    return { damage, dodged: false };
  },

  /**
   * Deal skill damage to all targets (e.g. Whirlwind AoE). Same formula per target.
   * @returns {Array<{ damage: number, dodged: boolean }>}
   */
  dealDamageToAll(attacker, targets, skillId) {
    const skill = getSkill(attacker, skillId);
    if (!skill) return targets.map(() => ({ damage: 0, dodged: false }));
    const results = [];
    for (const target of targets) {
      if (target.hp <= 0) results.push({ damage: 0, dodged: false });
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
