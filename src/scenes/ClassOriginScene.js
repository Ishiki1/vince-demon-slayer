/**
 * ClassOriginScene.js
 * Origin story narrative after choosing a class. Continue creates hero and starts Overworld.
 */

class ClassOriginScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ClassOrigin' });
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const data = this.scene.settings.data || {};
    const classId = data.classId || DEFAULT_CLASS_ID;

    const origin = typeof getClassOrigin === 'function'
      ? getClassOrigin(classId)
      : { title: 'Warrior', body: '' };
    this.add.text(w / 2, 80, origin.title, { fontSize: 32, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 160, origin.body, { fontSize: 18, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(w - 80);

    const contBtn = this.add.rectangle(w / 2, h - 80, 160, 48, 0x4ade80);
    contBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h - 80, 'Continue', { fontSize: 20, color: '#fff' }).setOrigin(0.5);
    contBtn.on('pointerdown', () => {
      GAME_STATE.runUnlocks = (typeof getRunUnlockSelection === 'function' && getRunUnlockSelection()) || [];
      GAME_STATE.hero = createHero(classId);
      if (GAME_STATE.runUnlocks && GAME_STATE.runUnlocks.includes('growthSpurt')) {
        GAME_STATE.hero.runStatGrowthBonus = 1;
      }
      this.scene.start('Overworld');
    });
  }
}
