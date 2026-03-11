/**
 * SceneUi.js
 * Shared UI helpers for Phaser scenes (buttons, etc.).
 */

/**
 * Create a button: rectangle + centered label, interactive, pointerdown callback.
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} label
 * @param {object} options - Optional: bgColor (number), fontSize (number), textColor (string)
 * @param {function} callback
 * @returns {{ rect: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text }}
 */
function createButton(scene, x, y, width, height, label, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const bgColor = options.bgColor != null ? options.bgColor : 0x475569;
  const fontSize = options.fontSize != null ? options.fontSize : 16;
  const textColor = options.textColor != null ? options.textColor : '#fff';
  const rect = scene.add.rectangle(x, y, width, height, bgColor);
  rect.setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, { fontSize, color: textColor }).setOrigin(0.5, 0.5);
  rect.on('pointerdown', callback);
  return { rect, text };
}

/**
 * Attach a hover-only animated outline or swap effect to a sprite.
 * Keeps the base texture visible until the pointer is over the target.
 * @param {Phaser.GameObjects.Sprite} sprite
 * @param {{ hoverSheetKey?: string, hoverAnimKey?: string, useHandCursor?: boolean }} options
 * @returns {Phaser.GameObjects.Sprite}
 */
function attachHoverSpriteAnimation(sprite, options) {
  const baseTextureKey = sprite && sprite.texture ? sprite.texture.key : null;
  const hoverSheetKey = (options && options.hoverSheetKey) || (baseTextureKey ? `${baseTextureKey}-hover-sheet` : null);
  const hoverAnimKey = (options && options.hoverAnimKey) || (baseTextureKey ? `${baseTextureKey}-hover` : null);
  if (!sprite || !hoverSheetKey || !hoverAnimKey) return sprite;

  const baseFrame = sprite.frame ? sprite.frame.name : undefined;
  const baseDisplayWidth = sprite.displayWidth;
  const baseDisplayHeight = sprite.displayHeight;
  const scene = sprite.scene;
  if (!scene || !baseTextureKey) return sprite;

  sprite.setInteractive({ useHandCursor: options && options.useHandCursor !== false });
  sprite.on('pointerover', () => {
    if (!scene.textures.exists(hoverSheetKey) || !scene.anims.exists(hoverAnimKey)) return;
    sprite.setTexture(hoverSheetKey, 0);
    sprite.setDisplaySize(baseDisplayWidth, baseDisplayHeight);
    sprite.play(hoverAnimKey);
  });
  sprite.on('pointerout', () => {
    sprite.stop();
    sprite.setTexture(baseTextureKey, baseFrame);
    sprite.setDisplaySize(baseDisplayWidth, baseDisplayHeight);
  });
  return sprite;
}

function getResolvedItemHoverKeys(scene, item, options) {
  if (!scene || !item) return null;
  if (options && options.uniqueOnly && item.rarity !== 'unique') return null;
  const hoverSheetKey = item.hoverSheetKey || (item.assetKey ? `${item.assetKey}-hover-sheet` : null);
  const hoverAnimKey = item.hoverAnimKey || (item.assetKey ? `${item.assetKey}-hover` : null);
  if (!hoverSheetKey || !hoverAnimKey) return null;
  if (!scene.textures.exists(hoverSheetKey) || !scene.anims.exists(hoverAnimKey)) return null;
  return { hoverSheetKey, hoverAnimKey };
}

function setItemHoverTextureState(scene, icon, item, hovered, options) {
  const hoverKeys = getResolvedItemHoverKeys(scene, item, options);
  if (!hoverKeys || !icon || typeof icon.setTexture !== 'function') return;
  const baseTextureKey = item.assetKey || (icon.texture ? icon.texture.key : null);
  const baseFrame = icon.frame ? icon.frame.name : undefined;
  if (hovered) {
    icon.setTexture(hoverKeys.hoverSheetKey, 0);
    if (typeof icon.play === 'function') icon.play(hoverKeys.hoverAnimKey);
    return;
  }
  if (typeof icon.stop === 'function') icon.stop();
  if (baseTextureKey) icon.setTexture(baseTextureKey, baseFrame);
}

function attachHoverSpriteAnimationToItem(sprite, item, options) {
  if (!sprite || !sprite.scene) return sprite;
  const hoverKeys = getResolvedItemHoverKeys(sprite.scene, item, options);
  if (!hoverKeys) return sprite;
  return attachHoverSpriteAnimation(sprite, {
    hoverSheetKey: hoverKeys.hoverSheetKey,
    hoverAnimKey: hoverKeys.hoverAnimKey,
    useHandCursor: options && options.useHandCursor,
  });
}

function createFallbackItemIcon(scene, item, x, y, options) {
  const width = (options && options.width) || 32;
  const height = (options && options.height) || width;
  const fallbackLabel = (item && item.visual && item.visual.placeholderLabel)
    || (item && item.name ? item.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() : '?');
  const bg = scene.add.rectangle(0, 0, width, height, 0x334155).setStrokeStyle(2, 0x64748b, 0.9);
  const label = scene.add.text(0, 0, fallbackLabel || '?', {
    fontSize: Math.max(10, Math.floor(Math.min(width, height) * 0.35)),
    color: '#e5e7eb',
    fontFamily: 'Arial',
  }).setOrigin(0.5);
  const container = scene.add.container(x, y, [bg, label]);
  container.setSize(width, height);
  return container;
}

/**
 * Create a small item icon sprite if the item's texture exists.
 * Reuses the standard hover-sheet behavior when available.
 * @param {Phaser.Scene} scene
 * @param {object} item
 * @param {number} x
 * @param {number} y
 * @param {{ width?: number, height?: number, hover?: boolean }} options
 * @returns {Phaser.GameObjects.Sprite|null}
 */
function createItemIconSprite(scene, item, x, y, options) {
  if (!scene || !item) return null;
  const width = (options && options.width) || 32;
  const height = (options && options.height) || width;
  const hasTexture = !!(item.assetKey && scene.textures.exists(item.assetKey));
  const icon = hasTexture
    ? scene.add.sprite(x, y, item.assetKey).setDisplaySize(width, height)
    : createFallbackItemIcon(scene, item, x, y, { width, height });
  const shouldHover = !options || options.hover !== false;
  if (hasTexture && shouldHover && typeof attachHoverSpriteAnimationToItem === 'function') {
    if (typeof ensureItemHoverAnimations === 'function') ensureItemHoverAnimations(scene);
    attachHoverSpriteAnimationToItem(icon, item, options);
  }
  return icon;
}

/**
 * Attach slight hover growth plus a simple shared tooltip to an icon-style control.
 * @param {Phaser.GameObjects.GameObject} hitArea
 * @param {Phaser.GameObjects.Image|Phaser.GameObjects.Sprite} icon
 * @param {{
 *   tooltipText?: string|function,
 *   tooltipKey?: string,
 *   tooltipX?: number,
 *   tooltipY?: number,
 *   tooltipOriginX?: number,
 *   tooltipOriginY?: number,
 *   tooltipStyle?: object,
 *   tooltipWidth?: number,
 *   tooltipDepth?: number,
 *   hoverWidth?: number,
 *   hoverHeight?: number,
 *   onHoverChanged?: function,
 * }} options
 * @returns {{ destroyTooltip: function }}
 */
function attachHoverScaleTooltip(hitArea, icon, options) {
  if (!hitArea || !icon || !icon.scene) return { destroyTooltip() {} };
  const scene = icon.scene;
  const tooltipKey = (options && options.tooltipKey) || 'sharedHoverTooltipGraphic';
  const baseWidth = icon.displayWidth;
  const baseHeight = icon.displayHeight;
  const hoverWidth = (options && options.hoverWidth) || (baseWidth + 4);
  const hoverHeight = (options && options.hoverHeight) || (baseHeight + 4);
  const tooltipX = options && options.tooltipX != null ? options.tooltipX : CONFIG.WIDTH / 2;
  const tooltipY = options && options.tooltipY != null ? options.tooltipY : CONFIG.HEIGHT - 100;
  const tooltipOriginX = options && options.tooltipOriginX != null ? options.tooltipOriginX : 0.5;
  const tooltipOriginY = options && options.tooltipOriginY != null ? options.tooltipOriginY : 1;
  const tooltipWidth = options && options.tooltipWidth != null ? options.tooltipWidth : CONFIG.WIDTH - 80;
  const tooltipDepth = options && options.tooltipDepth != null ? options.tooltipDepth : 20;
  const tooltipStyle = (options && options.tooltipStyle) || { fontSize: 14, color: '#e5e7eb', fontFamily: 'Arial' };

  const destroyTooltip = () => {
    if (scene[tooltipKey]) {
      scene[tooltipKey].destroy();
      scene[tooltipKey] = null;
    }
  };

  const setHovered = (hovered) => {
    icon.setDisplaySize(hovered ? hoverWidth : baseWidth, hovered ? hoverHeight : baseHeight);
    if (options && typeof options.onHoverChanged === 'function') options.onHoverChanged(hovered);
  };

  hitArea.on('pointerover', () => {
    setHovered(true);
    destroyTooltip();
    const tooltipText = options && typeof options.tooltipText === 'function'
      ? options.tooltipText()
      : (options && options.tooltipText);
    if (tooltipText) {
      scene[tooltipKey] = scene.add.text(tooltipX, tooltipY, tooltipText, tooltipStyle)
        .setOrigin(tooltipOriginX, tooltipOriginY)
        .setWordWrapWidth(tooltipWidth)
        .setDepth(tooltipDepth);
    }
  });
  hitArea.on('pointerout', () => {
    setHovered(false);
    destroyTooltip();
  });

  return { destroyTooltip };
}

function addSceneBackground(scene, textureKey, options) {
  if (!scene || !textureKey || !scene.textures || !scene.textures.exists(textureKey)) return null;
  const width = (options && options.width) || CONFIG.WIDTH;
  const height = (options && options.height) || CONFIG.HEIGHT;
  const x = options && options.x != null ? options.x : width / 2;
  const y = options && options.y != null ? options.y : height / 2;
  const depth = options && options.depth != null ? options.depth : -20;
  return scene.add.image(x, y, textureKey).setDisplaySize(width, height).setDepth(depth);
}

function createUiArtButton(scene, x, y, textureKey, onClick, options) {
  if (!scene) return null;
  const width = (options && options.width) || 180;
  const height = (options && options.height) || 52;
  const depth = options && options.depth != null ? options.depth : 15;
  const hitPaddingX = (options && options.hitPaddingX) || 18;
  const hitPaddingY = (options && options.hitPaddingY) || 14;
  const useHandCursor = !options || options.useHandCursor !== false;

  if (scene.textures && scene.textures.exists(textureKey)) {
    const hitArea = scene.add.rectangle(x, y, width + hitPaddingX, height + hitPaddingY, 0x0f172a, 0.001).setDepth(depth);
    const button = scene.add.image(x, y, textureKey).setDisplaySize(width, height).setDepth(depth + 1);
    hitArea.setInteractive({ useHandCursor });
    hitArea.on('pointerdown', () => {
      if (typeof onClick === 'function') onClick();
    });
    attachHoverScaleTooltip(hitArea, button, {
      tooltipText: options && options.tooltipText,
      tooltipKey: options && options.tooltipKey,
      tooltipX: options && options.tooltipX,
      tooltipY: options && options.tooltipY,
      tooltipOriginX: options && options.tooltipOriginX,
      tooltipOriginY: options && options.tooltipOriginY,
      tooltipStyle: options && options.tooltipStyle,
      tooltipWidth: options && options.tooltipWidth,
      tooltipDepth: options && options.tooltipDepth,
      hoverWidth: (options && options.hoverWidth) || (width + 6),
      hoverHeight: (options && options.hoverHeight) || (height + 4),
    });
    return { hitArea, button };
  }

  if (options && options.fallbackLabel) {
    return createButton(scene, x, y, options.fallbackWidth || width, options.fallbackHeight || 48, options.fallbackLabel, {
      bgColor: options.bgColor,
      fontSize: options.fontSize,
      textColor: options.textColor,
    }, onClick);
  }
  return null;
}

function createUiIconButton(scene, x, y, textureKey, tooltipText, onClick, options) {
  if (!scene || !textureKey || !scene.textures || !scene.textures.exists(textureKey)) return null;
  const size = (options && options.size) || 40;
  const hitPadding = (options && options.hitPadding) || 14;
  const depth = options && options.depth != null ? options.depth : 15;
  const disabled = !!(options && options.disabled);
  const alpha = options && options.alpha != null ? options.alpha : (disabled ? 0.55 : 1);
  const hitArea = scene.add.rectangle(x, y, size + hitPadding, size + hitPadding, 0x0f172a, 0.001).setDepth(depth);
  const icon = scene.add.image(x, y, textureKey).setDisplaySize(size, size).setDepth(depth + 1).setAlpha(alpha);
  if (disabled) return { hitArea, icon };

  hitArea.setInteractive({ useHandCursor: true });
  hitArea.on('pointerdown', () => {
    if (typeof onClick === 'function') onClick();
  });
  attachHoverScaleTooltip(hitArea, icon, {
    tooltipText,
    tooltipKey: options && options.tooltipKey,
    tooltipX: options && options.tooltipX,
    tooltipY: options && options.tooltipY,
    tooltipOriginX: options && options.tooltipOriginX,
    tooltipOriginY: options && options.tooltipOriginY,
    tooltipStyle: options && options.tooltipStyle,
    tooltipWidth: options && options.tooltipWidth,
    tooltipDepth: options && options.tooltipDepth,
    hoverWidth: (options && options.hoverSize) || (size + 4),
    hoverHeight: (options && options.hoverSize) || (size + 4),
  });
  return { hitArea, icon };
}

function createRightAlignedUiIconRow(scene, buttons, options) {
  if (!scene || !Array.isArray(buttons) || buttons.length === 0) return [];
  const visibleButtons = buttons.filter((button) => !button.hidden && scene.textures.exists(button.textureKey));
  if (visibleButtons.length === 0) return [];
  const rightX = options && options.rightX != null ? options.rightX : (CONFIG.WIDTH - 56);
  const y = options && options.y != null ? options.y : 56;
  const spacing = (options && options.spacing) || 58;
  return visibleButtons.map((button, index) => {
    const x = rightX - spacing * (visibleButtons.length - 1 - index);
    return createUiIconButton(scene, x, y, button.textureKey, button.tooltip, button.onClick, {
      size: options && options.size,
      hoverSize: options && options.hoverSize,
      hitPadding: options && options.hitPadding,
      depth: options && options.depth,
      tooltipKey: options && options.tooltipKey,
      tooltipX: options && options.tooltipX != null ? options.tooltipX : x,
      tooltipY: options && options.tooltipY,
      tooltipOriginX: options && options.tooltipOriginX,
      tooltipOriginY: options && options.tooltipOriginY,
      tooltipStyle: options && options.tooltipStyle,
      tooltipWidth: options && options.tooltipWidth,
      tooltipDepth: options && options.tooltipDepth,
      disabled: button.disabled,
      alpha: button.alpha,
    });
  });
}

function groupBagSlots(bagSlots) {
  const groups = [];
  const seen = {};
  for (const slot of bagSlots) {
    if (seen[slot.itemId]) {
      seen[slot.itemId].slots.push(slot);
    } else {
      const group = { itemId: slot.itemId, slots: [slot] };
      seen[slot.itemId] = group;
      groups.push(group);
    }
  }
  return groups;
}

function createTownNavRow(scene, options) {
  if (!scene) return [];
  const currentSection = options && options.currentSection ? options.currentSection : null;
  const onInnAction = options && typeof options.onInnAction === 'function' ? options.onInnAction : null;
  const openShop = () => {
    GAME_STATE.shopFrom = 'town';
    GAME_STATE.shopView = 'choice';
    scene.scene.start('Shop');
  };
  const buttons = [
    {
      textureKey: 'inn-icon',
      tooltip: onInnAction ? 'Rest at the Inn' : 'Town / Inn',
      onClick: onInnAction || (() => scene.scene.start('Town')),
      disabled: currentSection === 'inn' && !onInnAction,
    },
    {
      textureKey: 'shop-icon',
      tooltip: 'Shop',
      onClick: openShop,
      disabled: currentSection === 'shop',
    },
    {
      textureKey: 'blacksmith-icon',
      tooltip: 'Blacksmith',
      onClick: () => scene.scene.start('Blacksmith', { mode: 'menu' }),
      disabled: currentSection === 'blacksmith',
    },
    {
      textureKey: 'mine-icon',
      tooltip: 'Mine',
      onClick: () => scene.scene.start('Mine'),
      disabled: currentSection === 'mine',
    },
    {
      textureKey: 'alchemist-icon',
      tooltip: 'Alchemist',
      onClick: () => scene.scene.start('Alchemist'),
      disabled: currentSection === 'alchemist',
    },
    {
      textureKey: 'overworld-icon',
      tooltip: 'Overworld',
      onClick: () => scene.scene.start('Overworld'),
      disabled: currentSection === 'overworld',
    },
  ];
  return createRightAlignedUiIconRow(scene, buttons, {
    rightX: options && options.rightX,
    y: options && options.y,
    spacing: options && options.spacing,
    size: options && options.size,
    hoverSize: options && options.hoverSize,
    hitPadding: options && options.hitPadding,
    depth: options && options.depth,
    tooltipKey: options && options.tooltipKey,
    tooltipX: options && options.tooltipX,
    tooltipY: options && options.tooltipY != null ? options.tooltipY : 98,
    tooltipOriginX: options && options.tooltipOriginX,
    tooltipOriginY: options && options.tooltipOriginY,
    tooltipStyle: options && options.tooltipStyle,
    tooltipWidth: options && options.tooltipWidth,
    tooltipDepth: options && options.tooltipDepth,
  });
}
