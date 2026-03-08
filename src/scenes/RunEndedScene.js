/**
 * RunEndedScene.js
 * Shown when a run ends (game over, victory, abandon). Shows points gained and total; Start New Run -> ClassSelect.
 */

class RunEndedScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RunEnded' });
  }

  startNewRunFlow() {
    const unlocked = typeof normalizeUnlockedClassIds === 'function'
      ? normalizeUnlockedClassIds(GAME_STATE.unlockedClasses)
      : (GAME_STATE.unlockedClasses || ['warrior']);
    const singleUnlockedClassId = typeof getSingleUnlockedClassId === 'function'
      ? getSingleUnlockedClassId(unlocked)
      : null;
    if (singleUnlockedClassId) {
      this.scene.start('UnlockSelect', { classId: singleUnlockedClassId });
      return;
    }
    this.scene.start('ClassSelect');
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const data = this.scene.settings.data || {};
    const runPoints = data.runPoints != null ? data.runPoints : 0;
    const title = data.title || 'Run ended';

    this.add.text(w / 2, h / 2 - 80, title, { fontSize: 36, color: title === 'You won!' ? '#4ade80' : '#e5e7eb' }).setOrigin(0.5);
    this.add.text(w / 2, h / 2 - 30, 'Run Points gained: ' + runPoints, { fontSize: 20, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, h / 2 + 10, 'Total Run Points: ' + (typeof getTotalPoints === 'function' ? getTotalPoints() : 0), { fontSize: 18, color: '#e5e7eb' }).setOrigin(0.5);

    const btn = this.add.rectangle(w / 2, h / 2 + 80, 180, 48, 0x2563eb);
    btn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h / 2 + 80, 'Start New Run', { fontSize: 18, color: '#fff' }).setOrigin(0.5);
    btn.on('pointerdown', () => {
      if (typeof playGameMusicLoop === 'function') playGameMusicLoop(this);
      resetRun();
      this.startNewRunFlow();
    });
  }
}
