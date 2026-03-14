/**
 * TownScene.js
 * Rest (full HP/Mana) and back to map.
 */

class TownScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Town' });
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    this.hero = GAME_STATE.hero;
    this.restPrice = typeof getRestGoldCost === 'function'
      ? getRestGoldCost(this.hero)
      : (CONFIG.REST_PRICE_BASE + this.hero.level * CONFIG.REST_PRICE_PER_LEVEL);

    this.buildLandingMenu(w, h);
  }

  buildLandingMenu(w, h) {
    const hasArt = !!addSceneBackground(this, 'town-ui-background');
    if (!hasArt) {
      this.add.rectangle(w / 2, h / 2, w, h, 0x0f172a);
    }

    this.createHeaderText();
    this.createOverlayText(hasArt ? h - 20 : 120);
    createTownNavRow(this, {
      currentSection: 'town',
      onInnAction: () => this.handleLandingAction('rest'),
    });
    const bottomUtilityY = h - 70;
    const bottomUtilityRightX = w - 42;
    const bottomUtilitySpacing = 72;
    createUiIconButton(
      this,
      bottomUtilityRightX - bottomUtilitySpacing,
      bottomUtilityY,
      'inventory-icon',
      'Inventory',
      () => this.scene.start('InventoryOverworld', { from: 'Town' }),
      {
        size: 52,
        tooltipY: bottomUtilityY - 42,
      }
    );
    createUiIconButton(
      this,
      bottomUtilityRightX,
      bottomUtilityY,
      'character-sheet-icon',
      'Character Sheet',
      () => this.scene.start('CharacterSheet', { from: 'Town' }),
      {
        size: 52,
        tooltipY: bottomUtilityY - 42,
      }
    );

    const bottomLeftX = 42;
    const bottomLeftSpacing = 56;
    createUiIconButton(this, bottomLeftX, bottomUtilityY, 'settings-icon', 'Settings',
      () => this.scene.start('Settings', { from: 'Town' }),
      { size: 42, tooltipX: bottomLeftX, tooltipY: bottomUtilityY - 34 }
    );
    createUiIconButton(this, bottomLeftX + bottomLeftSpacing, bottomUtilityY, 'save-game-icon', 'Save Game', () => {
      if (GAME_STATE.hero && typeof saveGame === 'function' && saveGame()) {
        const msg = this.add.text(w / 2, h - 120, 'Game saved.', { fontSize: 16, color: '#86efac' }).setOrigin(0.5);
        this.time.delayedCall(1500, () => msg.destroy());
      }
    }, { size: 42, tooltipX: bottomLeftX + bottomLeftSpacing, tooltipY: bottomUtilityY - 34 });
    createUiIconButton(this, bottomLeftX + bottomLeftSpacing * 2, bottomUtilityY, 'abandon-run-icon', 'Abandon Run', () => {
      const runPoints = GAME_STATE.points || 0;
      addTotalPoints(runPoints);
      resetRun();
      this.scene.start('RunEnded', { runPoints, title: 'Run ended' });
    }, { size: 42, tooltipX: bottomLeftX + bottomLeftSpacing * 2, tooltipY: bottomUtilityY - 34 });

    if (!hasArt) {
      createButton(this, w / 2, h / 2 - 20, 220, 48, `Rest (Full HP & Mana) - ${this.restPrice}g`, { bgColor: 0x4ade80, fontSize: 15 }, () => {
        this.handleLandingAction('rest');
      });
      createButton(this, w / 2, h / 2 + 70, 200, 48, 'Visit Shop', { bgColor: 0x8b5cf6 }, () => this.handleLandingAction('shop'));
      createButton(this, w / 2, h / 2 + 130, 200, 48, 'Visit Blacksmith', { bgColor: 0x78716c }, () => this.handleLandingAction('blacksmith'));
      createButton(this, w / 2, h / 2 + 190, 200, 48, 'Visit Mine', { bgColor: 0x64748b }, () => this.handleLandingAction('mine'));
      createButton(this, w / 2, h / 2 + 250, 200, 48, 'Visit Alchemist', { bgColor: 0x0f766e }, () => this.handleLandingAction('alchemist'));
      createButton(this, w / 2, h - 80, 180, 48, 'Back to Overworld', () => this.handleLandingAction('overworld'));
    }
  }

  createHeaderText() {
    const sharedTextStyle = {
      fontSize: 18,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 4,
    };
    this.add.text(20, 32, 'Town', {
      fontSize: 28,
      color: '#fbbf24',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0, 0.5);
    this.goldText = this.add.text(20, 62, 'Gold: ' + this.hero.gold, sharedTextStyle).setOrigin(0, 0.5);
  }

  createOverlayText(statusY) {
    const sharedTextStyle = {
      fontSize: 14,
      color: '#f8fafc',
      stroke: '#0f172a',
      strokeThickness: 4,
    };
    this.restText = this.add.text(CONFIG.WIDTH / 2, statusY, `Rest restores full HP and Mana for ${this.restPrice}g.`, {
      ...sharedTextStyle,
      align: 'center',
    }).setOrigin(0.5, 1);
  }

  handleLandingAction(action) {
    if (action === 'rest') {
      const rested = typeof performTownRest === 'function'
        ? performTownRest(this.hero)
        : (this.hero.gold >= this.restPrice ? (this.hero.gold -= this.restPrice, this.hero.refillCombatStats(), true) : false);
      this.refreshGoldText();
      if (!rested) {
        this.restText.setText('Not enough gold!').setColor('#ef4444');
        return;
      }
      this.restText.setText('HP and Mana restored!').setColor('#86efac');
      return;
    }
    if (action === 'shop') {
      GAME_STATE.shopFrom = 'town';
      this.scene.start('Shop');
      return;
    }
    if (action === 'blacksmith') {
      this.scene.start('Blacksmith');
      return;
    }
    if (action === 'mine') {
      this.scene.start('Mine');
      return;
    }
    if (action === 'alchemist') {
      this.scene.start('Alchemist');
      return;
    }
    this.scene.start('Overworld');
  }

  refreshGoldText() {
    if (!this.goldText) return;
    this.goldText.setText('Gold: ' + this.hero.gold);
  }
}
