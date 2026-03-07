/**
 * MenuScene.js
 * Title, Start New Game, and Load Game (when a save exists).
 */

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);

    if (typeof playGameMusicLoop === 'function') playGameMusicLoop(this);

    this.add.text(w / 2, h / 2 - 50, 'Vince the Demon Slayer', { fontSize: 42, color: '#fbbf24' }).setOrigin(0.5);

    const newGameBtn = this.add.rectangle(w / 2, h / 2 + 30, 220, 52, 0x4ade80);
    newGameBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h / 2 + 30, 'Start New Game', { fontSize: 22, color: '#fff' }).setOrigin(0.5);
    newGameBtn.on('pointerdown', () => {
      if (typeof resetRun === 'function') resetRun();
      if (typeof deleteSave === 'function') deleteSave();
      this.scene.start('ClassSelect');
    });

    const settingsBtn = this.add.rectangle(w - 80, 40, 100, 36, 0x475569);
    settingsBtn.setInteractive({ useHandCursor: true });
    this.add.text(w - 80, 40, 'Settings', { fontSize: 16, color: '#fff' }).setOrigin(0.5);
    settingsBtn.on('pointerdown', () => this.scene.start('Settings', { from: 'Menu' }));

    const canLoad = typeof hasSave === 'function' && hasSave();
    const loadY = h / 2 + 95;
    const loadBtn = this.add.rectangle(w / 2, loadY, 220, 52, canLoad ? 0x0ea5e9 : 0x475569);
    loadBtn.setInteractive({ useHandCursor: canLoad });
    const loadText = this.add.text(w / 2, loadY, 'Load Game', { fontSize: 22, color: '#fff' }).setOrigin(0.5);
    if (!canLoad) loadText.setColor('#94a3b8');
    loadBtn.on('pointerdown', () => {
      if (!canLoad) return;
      if (typeof loadGame === 'function' && loadGame()) {
        this.scene.start('Overworld');
      } else {
        const err = this.add.text(w / 2, loadY + 40, 'Could not load save.', { fontSize: 14, color: '#f87171' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => err.destroy());
      }
    });
  }
}
