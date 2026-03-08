/**
 * MenuScene.js
 * Title, Start New Game, and Load Game (when a save exists).
 */

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
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

  startFreshGame() {
    if (typeof resetRun === 'function') resetRun();
    if (typeof deleteSave === 'function') deleteSave();
    this.startNewRunFlow();
  }

  tryLoadExistingGame(errorY) {
    if (typeof loadGame === 'function' && loadGame()) {
      this.scene.start('Overworld');
      return true;
    }
    this.showLoadError(errorY);
    return false;
  }

  showLoadError(y) {
    if (this.loadErrorText) this.loadErrorText.destroy();
    this.loadErrorText = this.add.text(CONFIG.WIDTH / 2, y, 'Could not load save.', {
      fontSize: 14,
      color: '#f87171',
    }).setOrigin(0.5);
    this.time.delayedCall(2000, () => {
      if (this.loadErrorText) {
        this.loadErrorText.destroy();
        this.loadErrorText = null;
      }
    });
  }

  showExistingSaveWarning() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
      .setDepth(10)
      .setInteractive();
    const panel = this.add.rectangle(w / 2, h / 2, 540, 240, 0x1e293b).setDepth(11);
    const title = this.add.text(w / 2, h / 2 - 72, 'Existing Save Found', {
      fontSize: 24,
      color: '#fbbf24',
    }).setOrigin(0.5).setDepth(12);
    const body = this.add.text(
      w / 2,
      h / 2 - 26,
      'A save state already exists, are you sure you want to start a new game?',
      {
        fontSize: 18,
        color: '#e5e7eb',
        align: 'center',
      }
    ).setOrigin(0.5).setWordWrapWidth(470).setDepth(12);

    const loadBtn = createButton(this, w / 2 - 125, h / 2 + 56, 200, 48, 'Load Save Game', {
      bgColor: 0x0ea5e9,
      fontSize: 18,
    }, () => {
      close();
      this.tryLoadExistingGame(h / 2 + 145);
    });
    const newGameBtn = createButton(this, w / 2 + 125, h / 2 + 56, 220, 48, 'Start a New Game', {
      bgColor: 0x7f1d1d,
      fontSize: 18,
    }, () => {
      close();
      this.startFreshGame();
    });
    loadBtn.rect.setDepth(12);
    loadBtn.text.setDepth(13);
    newGameBtn.rect.setDepth(12);
    newGameBtn.text.setDepth(13);

    const popupObjects = [
      overlay,
      panel,
      title,
      body,
      loadBtn.rect,
      loadBtn.text,
      newGameBtn.rect,
      newGameBtn.text,
    ];
    const close = () => popupObjects.forEach(obj => obj.destroy());
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);

    if (typeof playGameMusicLoop === 'function') playGameMusicLoop(this);

    const hasArt = !!(typeof addSceneBackground === 'function' && addSceneBackground(this, 'startgame-ui-background'));
    if (!hasArt) {
      this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e);
    } else {
      this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.28);
      this.add.rectangle(w / 2, h / 2 + 38, 340, 210, 0x0f172a, 0.56).setStrokeStyle(2, 0x94a3b8, 0.35);
    }

    this.add.text(w / 2, h / 2 - 68, 'Vince the Demon Slayer', {
      fontSize: 42,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const newGameBtn = this.add.rectangle(w / 2, h / 2 + 30, 220, 52, 0x4ade80);
    newGameBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h / 2 + 30, 'Start New Game', { fontSize: 22, color: '#fff' }).setOrigin(0.5);
    newGameBtn.on('pointerdown', () => {
      if (typeof hasSave === 'function' && hasSave()) {
        this.showExistingSaveWarning();
        return;
      }
      this.startFreshGame();
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
      this.tryLoadExistingGame(loadY + 40);
    });
  }
}
