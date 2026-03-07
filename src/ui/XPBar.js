/**
 * XPBar.js
 * Draws an XP progress bar (colored rectangle + text) for the hero.
 */

function createXPBar(scene, x, y, width, height, hero) {
  const bg = scene.add.rectangle(x, y, width, height, 0x333333).setOrigin(0, 0);
  const fill = scene.add.rectangle(x, y, width * ProgressionSystem.xpProgress(hero), height, 0xf97316).setOrigin(0, 0);
  const text = scene.add.text(x + width / 2, y + height / 2, `Level ${hero.level}`, {
    fontSize: 14,
    color: '#fff',
  }).setOrigin(0.5, 0.5);

  return {
    bg,
    fill,
    text,
    update() {
      const p = ProgressionSystem.xpProgress(hero);
      fill.width = width * p;
      text.setText(`Level ${hero.level}`);
    },
    destroy() {
      bg.destroy();
      fill.destroy();
      text.destroy();
    },
  };
}
