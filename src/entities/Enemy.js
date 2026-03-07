/**
 * Enemy.js
 * Creates an enemy from level index and isBoss. Stats from getEnemyStatsForLevel.
 */

function createEnemy(levelIndex, isBoss) {
  const stats = getEnemyStatsForLevel(levelIndex, isBoss);
  return {
    levelIndex,
    name: stats.name,
    maxHp: stats.hp,
    hp: stats.hp,
    damage: stats.damage,
    isBoss: !!isBoss,
    goonType: stats.goonType || null,
  };
}
