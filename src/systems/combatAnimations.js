/**
 * combatAnimations.js
 * Enemy/hero animation routing and helpers extracted from CombatScene.
 */

function isHeroIdleAnimKey(animKey) {
  return animKey === 'hero_idle'
    || (typeof animKey === 'string' && animKey.startsWith('hero_') && animKey.endsWith('_set_idle'));
}

function isVampireBossEnemy(enemy) {
  return !!enemy && enemy.isBoss === true && enemy.name === 'Vampire';
}

function getEnemyAnimationSet(enemy) {
  if (!enemy) return null;
  if (enemy.name === 'The Reaper') {
    return { idleSheetKey: 'reaper_idle_sheet', idleAnimKey: 'reaper_idle', attackSheetKey: 'reaper_attack_sheet', attackAnimKey: 'reaper_attack' };
  }
  if (isVampireBossEnemy(enemy)) {
    return { idleSheetKey: 'vampire_idle_sheet', idleAnimKey: 'vampire_idle', attackSheetKey: 'vampire_attack_sheet', attackAnimKey: 'vampire_attack' };
  }
  const GOON_ANIM_MAP = {
    skeleton:    { idle: 'skeleton',    attack: 'skeleton' },
    bat:         { idle: 'bat',         attack: 'bat' },
    imp:         { idle: 'imp',         attack: 'imp' },
    mushroom:    { idle: 'mushroom',    attack: 'mushroom' },
    spider:      { idle: 'spider',      attack: 'spider' },
    plant:       { idle: 'plant',       attack: 'plant' },
    toad:        { idle: 'toad',        attack: 'toad' },
    shade:       { idle: 'shade',       attack: 'shade' },
    broodmother: { idle: 'broodmother', attack: 'broodmother' },
  };
  const mapping = GOON_ANIM_MAP[enemy.goonType];
  if (mapping) {
    return {
      idleSheetKey: mapping.idle + '_idle_sheet',
      idleAnimKey: mapping.idle + '_idle',
      attackSheetKey: mapping.attack + '_attack_sheet',
      attackAnimKey: mapping.attack + '_attack',
    };
  }
  if (enemy.name === 'The Witch') {
    return { idleSheetKey: 'witch_idle_sheet', idleAnimKey: 'witch_idle', attackSheetKey: 'witch_attack_sheet', attackAnimKey: 'witch_attack' };
  }
  return null;
}

function getHeroIdleVisual(hero, scene) {
  if (hero && typeof getUniqueElement === 'function' && typeof getClassCombatIdleVisual === 'function') {
    const weaponSlot = hero.weapon != null ? hero.inventory.find(s => s.id === hero.weapon) : null;
    const armorSlot = hero.armor != null ? hero.inventory.find(s => s.id === hero.armor) : null;
    const weaponElement = weaponSlot ? getUniqueElement(weaponSlot.itemId) : null;
    const armorElement = armorSlot ? getUniqueElement(armorSlot.itemId) : null;
    const accessorySlots = typeof hero.getEquippedAccessorySlots === 'function'
      ? hero.getEquippedAccessorySlots()
      : [];
    const fullSetElement = weaponElement
      && weaponElement === armorElement
      && accessorySlots.some((slot) => getUniqueElement(slot.itemId) === weaponElement)
      ? weaponElement
      : null;
    const classVisual = getClassCombatIdleVisual(hero.class, fullSetElement);
    if (classVisual && scene.textures.exists(classVisual.sheetKey) && scene.anims.exists(classVisual.animKey)) {
      return classVisual;
    }
  }
  if (scene.textures.exists('hero_sheet') && scene.anims.exists('hero_idle')) {
    return { sheetKey: 'hero_sheet', animKey: 'hero_idle' };
  }
  return null;
}

/**
 * Create an enemy display object (animated sprite or colored rectangle fallback).
 * Returns the Phaser display object.
 */
function createEnemyDisplayObject(scene, enemy, x, y, enemyW, enemyH, isBossFight) {
  const animSet = getEnemyAnimationSet(enemy);
  if (animSet && scene.textures.exists(animSet.idleSheetKey) && scene.anims.exists(animSet.idleAnimKey)) {
    const sprite = scene.add.sprite(x, y, animSet.idleSheetKey, 0).setDisplaySize(enemyW, enemyH);
    sprite.play(animSet.idleAnimKey);
    return sprite;
  }
  const enemyColor = isBossFight ? 0x991b1b : 0xdc2626;
  return scene.add.rectangle(x, y, enemyW, enemyH, enemyColor);
}
