/**
 * TransitionScene.js
 * After beating level 10: narrative about the demon's son and the empire; transition to levels 11-20.
 */

class TransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Transition' });
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;

    this.add.text(w / 2, 80, 'The Demon is Defeated', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);
    this.add.text(w / 2, 140, 'The son of the demon takes on the demon empire.', { fontSize: 18, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(w - 80);
    this.add.text(w / 2, 180, 'Reach him to defeat him.', { fontSize: 18, color: '#e5e7eb' }).setOrigin(0.5).setWordWrapWidth(w - 80);
    this.add.text(w / 2, 240, 'Levels 11-20 unlocked. You cannot return to previous levels.', { fontSize: 16, color: '#94a3b8' }).setOrigin(0.5).setWordWrapWidth(w - 80);

    createUiArtButton(this, w / 2, h - 80, 'continue-button', () => {
      GAME_STATE.act = 2;
      GAME_STATE.unlockedLevels = ['level11'];
      GAME_STATE.unlockedClasses = typeof unlockClassesForAct === 'function'
        ? unlockClassesForAct(GAME_STATE.unlockedClasses, 2)
        : ['warrior', 'sorceress'];
      this.scene.start('Overworld');
    }, {
      width: 180,
      height: 52,
      fallbackLabel: 'Continue',
      fallbackWidth: 180,
      fallbackHeight: 48,
      bgColor: 0x4ade80,
      fontSize: 20,
      textColor: '#fff',
    });
  }
}
