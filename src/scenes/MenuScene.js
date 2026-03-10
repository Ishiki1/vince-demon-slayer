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
    }

    this.add.text(w / 2, hasArt ? 70 : (h / 2 - 68), 'Vince the Demon Slayer', {
      fontSize: hasArt ? 38 : 42,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const openSettings = () => this.scene.start('Settings', { from: 'Menu' });
    if (hasArt) {
      const menuButtons = [
        { action: 'load', x: 400, y: 197, width: 246, height: 78 },
        { action: 'newGame', x: 400, y: 293, width: 286, height: 82 },
        { action: 'settings', x: 400, y: 407, width: 266, height: 82 },
      ];

      const handleMenuAction = (action) => {
        if (action === 'load') {
          this.tryLoadExistingGame(h - 34);
          return;
        }
        if (action === 'newGame') {
          if (typeof hasSave === 'function' && hasSave()) {
            this.showExistingSaveWarning();
            return;
          }
          this.startFreshGame();
          return;
        }
        openSettings();
      };

      menuButtons.forEach((button) => {
        const hitArea = this.add.rectangle(button.x, button.y, button.width, button.height, 0x000000, 0.001).setDepth(10);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', () => handleMenuAction(button.action));
      });
      return;
    }

    const loadY = h / 2 + 30;
    const newGameY = h / 2 + 95;
    const settingsY = h / 2 + 160;
    const canLoad = typeof hasSave === 'function' && hasSave();

    const loadBtn = this.add.rectangle(w / 2, loadY, 220, 52, canLoad ? 0x0ea5e9 : 0x475569);
    loadBtn.setInteractive({ useHandCursor: true });
    const loadText = this.add.text(w / 2, loadY, 'Load Game', { fontSize: 22, color: canLoad ? '#fff' : '#94a3b8' }).setOrigin(0.5);
    loadBtn.on('pointerdown', () => this.tryLoadExistingGame(settingsY + 52));

    const newGameBtn = this.add.rectangle(w / 2, newGameY, 220, 52, 0x4ade80);
    newGameBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, newGameY, 'Start New Game', { fontSize: 22, color: '#fff' }).setOrigin(0.5);
    newGameBtn.on('pointerdown', () => {
      if (typeof hasSave === 'function' && hasSave()) {
        this.showExistingSaveWarning();
        return;
      }
      this.startFreshGame();
    });

    const settingsBtn = this.add.rectangle(w / 2, settingsY, 180, 48, 0x475569);
    settingsBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, settingsY, 'Settings', { fontSize: 20, color: '#fff' }).setOrigin(0.5);
    settingsBtn.on('pointerdown', openSettings);
  }
}
