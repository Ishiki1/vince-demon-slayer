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
