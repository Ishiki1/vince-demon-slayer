/**
 * enemyFormation.js
 * Enemy positioning and formation layout extracted from CombatScene.
 */

function getEnemyFormationLayout(enemyCount, enemyW, heroW, sceneWidth, heroCenterX) {
  heroCenterX = heroCenterX || 150;
  const minX = heroCenterX + heroW / 2 + enemyW / 2 + 20;
  const maxX = sceneWidth - enemyW / 2 - 20;
  const desiredStartX = heroCenterX + heroW / 2 + enemyW / 2 + 50;

  if (enemyCount <= 1) {
    return {
      startX: Math.max(minX, Math.min(desiredStartX + 70, maxX)),
      step: 0,
    };
  }

  const desiredStep = Math.max(enemyW - 10, 90);
  const maxStep = (maxX - minX) / (enemyCount - 1);
  const step = Math.max(0, Math.min(desiredStep, maxStep));
  const groupWidth = step * (enemyCount - 1);
  const startX = Math.max(minX, Math.min(desiredStartX, maxX - groupWidth));
  return { startX, step };
}

/**
 * Reposition all existing enemy sprites and labels after formation changes (e.g. summon).
 * @param {number} enemyCount - total enemies including new ones
 * @param {Array} enemySprites - sprite array
 * @param {Array} enemyNameTexts - name label array
 * @param {Array} enemyHpTexts - hp label array
 * @param {number} spriteY - shared Y position
 * @param {number} enemyW - enemy display width
 * @param {number} enemyH - enemy display height
 * @param {number} heroW - hero display width
 * @param {number} sceneWidth - scene width
 * @param {number} [heroCenterX] - hero sprite X, defaults to 150
 */
function repositionEnemyFormation(enemyCount, enemySprites, enemyNameTexts, enemyHpTexts, spriteY, enemyW, enemyH, heroW, sceneWidth, heroCenterX) {
  const { startX, step } = getEnemyFormationLayout(enemyCount, enemyW, heroW, sceneWidth, heroCenterX);
  const limit = Math.min(enemyCount, enemySprites.length);
  for (let j = 0; j < limit; j++) {
    const newX = startX + j * step;
    if (enemySprites[j]) enemySprites[j].setPosition(newX, spriteY);
    if (enemyNameTexts[j]) enemyNameTexts[j].setPosition(newX, spriteY - enemyH / 2 - CONFIG.COMBAT_LABEL_OFFSET_NAME);
    if (enemyHpTexts[j]) enemyHpTexts[j].setPosition(newX, spriteY - enemyH / 2 - CONFIG.COMBAT_LABEL_OFFSET_HP);
  }
  return { startX, step };
}
