/**
 * AlchemistScene.js
 * Placeholder for future alchemy features.
 */

class AlchemistScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Alchemist' });
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }

    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hasArt = !!addSceneBackground(this, 'alchemist-ui-background');
    if (!hasArt) {
      this.add.rectangle(w / 2, h / 2, w, h, 0x0f172a);
    }
    this.add.text(20, 32, 'Alchemist', {
      fontSize: 28,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0, 0.5);
    this.add.text(20, 62, 'Brews, recipes, and potion crafting will live here soon.', {
      fontSize: 14,
      color: '#e5e7eb',
      stroke: '#0f172a',
      strokeThickness: 4,
    }).setOrigin(0, 0.5);
    createTownNavRow(this, { currentSection: 'alchemist' });
    this.add.text(w / 2, h / 2, 'Coming Soon', {
      fontSize: 36,
      color: '#f8fafc',
      stroke: '#0f172a',
      strokeThickness: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }
}
