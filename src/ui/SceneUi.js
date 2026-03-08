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
 * Create an icon-first button with hover growth and a shared tooltip.
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {string} textureKey
 * @param {string} tooltip
 * @param {function} onClick
 * @param {object} options
 * @returns {{ hitArea: Phaser.GameObjects.Rectangle, icon: Phaser.GameObjects.Image }|null}
 */
function createIconButton(scene, x, y, textureKey, tooltip, onClick, options) {
  if (!scene || !textureKey || !scene.textures.exists(textureKey)) return null;
  const size = options && options.size ? options.size : 50;
  const hoverSize = options && options.hoverSize ? options.hoverSize : size + 4;
  const tooltipY = options && options.tooltipY != null ? options.tooltipY : (y + 42);
  const tooltipX = options && options.tooltipX != null ? options.tooltipX : x;
  const tooltipKey = (options && options.tooltipKey) || `${textureKey}-tooltip`;
  const tooltipBgKey = `${tooltipKey}-bg`;
  const hitArea = scene.add.rectangle(x, y, size + 14, size + 14, 0x0f172a, 0.001);
  const icon = scene.add.image(x, y, textureKey).setDisplaySize(size, size);
  hitArea.setInteractive({ useHandCursor: true });
  const destroyTooltip = () => {
    if (scene[tooltipBgKey]) {
      scene[tooltipBgKey].destroy();
      scene[tooltipBgKey] = null;
    }
    if (scene[tooltipKey]) {
      scene[tooltipKey].destroy();
      scene[tooltipKey] = null;
    }
  };
  const showTooltip = () => {
    if (!tooltip) return;
    destroyTooltip();
    const text = scene.add.text(tooltipX, tooltipY, tooltip, {
      fontSize: 13,
      color: '#e5e7eb',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(30);
    scene[tooltipBgKey] = scene.add.rectangle(
      tooltipX,
      tooltipY,
      text.width + 20,
      text.height + 12,
      0x0f172a,
      0.92
    ).setStrokeStyle(1, 0x94a3b8, 0.9).setDepth(29);
    scene[tooltipKey] = text;
  };
  hitArea.on('pointerdown', onClick);
  hitArea.on('pointerover', () => {
    icon.setDisplaySize(hoverSize, hoverSize);
    showTooltip();
  });
  hitArea.on('pointerout', () => {
    icon.setDisplaySize(size, size);
    destroyTooltip();
  });
  return { hitArea, icon };
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
