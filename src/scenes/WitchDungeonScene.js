/**
 * WitchDungeonScene.js
 * Grid-based room exploration in the Witch's Dungeon.
 * Hero walks between tiles on a painted background; each tile triggers an outcome.
 */

class WitchDungeonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WitchDungeon' });
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }

    this.hero = GAME_STATE.hero;
    this.isMoving = false;
    this.popupActive = false;
    this.witchSpawned = false;
    this.witchDefeated = false;

    const progress = GAME_STATE.dungeonProgress;
    if (progress) {
      this.heroCol = progress.heroCol != null ? progress.heroCol : DUNGEON_START.col;
      this.heroRow = progress.heroRow != null ? progress.heroRow : DUNGEON_START.row;
      this.steps = progress.steps || 0;
      this.visitedTiles = new Set(progress.visitedTiles || []);
      this.witchSpawned = progress.witchSpawned || false;
    } else {
      this.heroCol = DUNGEON_START.col;
      this.heroRow = DUNGEON_START.row;
      this.steps = 0;
      this.visitedTiles = new Set();
      this.visitedTiles.add(this.tileKey(this.heroCol, this.heroRow));
    }

    this.drawBackground();
    this.drawGrid();
    this.drawHero();
    this.drawUI();
    this.saveDungeonProgress();

    if (this.witchSpawned && !this.witchDefeated) {
      this.showWitchMarker();
    }
  }

  tileKey(col, row) {
    return col + ',' + row;
  }

  drawBackground() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    if (this.textures.exists('witch-dungeon-ui-background')) {
      this.add.image(w / 2, h / 2, 'witch-dungeon-ui-background').setDisplaySize(w, h);
    } else {
      this.add.rectangle(w / 2, h / 2, w, h, 0x1a0a2e);
    }
  }

  drawGrid() {
    this.tileZones = [];
    for (let row = 0; row < DUNGEON_ROWS; row++) {
      for (let col = 0; col < DUNGEON_COLS; col++) {
        const tile = getDungeonTile(col, row);
        if (!isDungeonWalkable(tile)) continue;

        const center = getTileCenter(col, row);
        const zone = this.add.rectangle(
          center.x, center.y,
          DUNGEON_TILE_W - 4, DUNGEON_TILE_H - 4,
          0xffffff, 0
        ).setInteractive({ useHandCursor: true });

        zone.tileCol = col;
        zone.tileRow = row;
        zone.tileType = tile;

        zone.on('pointerover', () => {
          if (!this.isMoving && !this.popupActive) {
            zone.setFillStyle(0xffffff, 0.12);
          }
        });
        zone.on('pointerout', () => {
          zone.setFillStyle(0xffffff, 0);
        });
        zone.on('pointerdown', () => {
          if (this.isMoving || this.popupActive) return;
          this.onTileClicked(col, row);
        });

        if (this.visitedTiles.has(this.tileKey(col, row))) {
          this.add.circle(center.x, center.y, 4, 0xffffff, 0.15).setDepth(1);
        }

        this.tileZones.push(zone);
      }
    }
  }

  drawHero() {
    const center = getTileCenter(this.heroCol, this.heroRow);
    if (this.textures.exists('hero_sheet')) {
      this.heroMarker = this.add.sprite(center.x, center.y, 'hero_sheet', 0)
        .setDisplaySize(48, 48).setDepth(10);
    } else {
      this.heroMarker = this.add.circle(center.x, center.y, 16, 0xfbbf24)
        .setDepth(10);
    }
  }

  drawUI() {
    const w = CONFIG.WIDTH;
    this.stepsText = this.add.text(16, 16, 'Steps: ' + this.steps, {
      fontSize: 16, color: '#e5e7eb',
      stroke: '#0f172a', strokeThickness: 4,
    }).setDepth(20);

    this.goldText = this.add.text(16, 38, 'Gold: ' + this.hero.gold, {
      fontSize: 14, color: '#fbbf24',
      stroke: '#0f172a', strokeThickness: 4,
    }).setDepth(20);

    if (typeof createUiIconButton === 'function' && this.textures.exists('overworld-icon')) {
      createUiIconButton(this, w - 30, 30, 'overworld-icon', 'Leave Dungeon', () => {
        this.leaveDungeon();
      }, { size: 40 });
    } else {
      const btn = this.add.rectangle(w - 60, 30, 100, 32, 0x475569).setInteractive({ useHandCursor: true }).setDepth(20);
      this.add.text(w - 60, 30, 'Leave', { fontSize: 14, color: '#fff' }).setOrigin(0.5).setDepth(21);
      btn.on('pointerdown', () => this.leaveDungeon());
    }
  }

  onTileClicked(col, row) {
    if (col === this.heroCol && row === this.heroRow) return;

    const path = findDungeonPath(this.heroCol, this.heroRow, col, row);
    if (!path || path.length === 0) return;

    this.isMoving = true;
    this.walkPath(path, 0);
  }

  walkPath(path, index) {
    if (index >= path.length) {
      this.isMoving = false;
      const tile = getDungeonTile(this.heroCol, this.heroRow);
      this.steps += path.length;
      this.stepsText.setText('Steps: ' + this.steps);
      this.saveDungeonProgress();
      this.resolveDestinationTile(tile);
      return;
    }

    const next = path[index];
    const center = getTileCenter(next.col, next.row);
    this.tweens.add({
      targets: this.heroMarker,
      x: center.x,
      y: center.y,
      duration: 150,
      ease: 'Linear',
      onComplete: () => {
        this.heroCol = next.col;
        this.heroRow = next.row;
        this.walkPath(path, index + 1);
      },
    });
  }

  resolveDestinationTile(tileType) {
    const key = this.tileKey(this.heroCol, this.heroRow);
    const alreadyVisited = this.visitedTiles.has(key);
    this.visitedTiles.add(key);

    if (tileType === TILE_GATE) {
      this.showLeavePrompt();
      return;
    }

    if (this.witchSpawned && !this.witchDefeated &&
        tileType === TILE_PENTAGRAM &&
        this.heroCol === DUNGEON_PENTAGRAM_TILE.col &&
        this.heroRow === DUNGEON_PENTAGRAM_TILE.row) {
      this.startWitchFight();
      return;
    }

    if (alreadyVisited) return;

    const isLandmark = [TILE_CAULDRON, TILE_MUSHROOM, TILE_BOOKSHELF, TILE_TABLE].includes(tileType);
    if (isLandmark) {
      const reward = rollLandmarkReward(tileType);
      if (reward) this.handleOutcome(reward);
      return;
    }

    if (tileType === TILE_PENTAGRAM || tileType === TILE_FLOOR) {
      const outcome = rollFloorOutcome();
      this.handleOutcome(outcome);
    }

    if (!this.witchSpawned && shouldWitchSpawn(this.steps)) {
      this.witchSpawned = true;
      this.saveDungeonProgress();
      this.showWitchMarker();
    }
  }

  handleOutcome(outcome) {
    if (!outcome) return;

    switch (outcome.type) {
      case 'herb':
        this.handleHerbFind(outcome.herbId);
        break;
      case 'goon':
        this.startGoonFight(outcome.goonType);
        break;
      case 'trap':
        this.handleTrap();
        break;
      case 'flavor':
        this.showPopup(outcome.text, '#94a3b8');
        break;
      case 'nothing':
        this.showPopup(outcome.text || 'Nothing here...', '#94a3b8');
        break;
    }
  }

  handleHerbFind(herbId) {
    const item = ITEMS[herbId];
    const herbName = item ? item.name : herbId;
    const added = typeof InventorySystem !== 'undefined'
      ? InventorySystem.add(this.hero, herbId)
      : false;

    if (added) {
      this.showResultPopup('You found:', herbName + '!', item, '#22c55e');
    } else {
      this.showPopup('You found ' + herbName + ', but your inventory is full!', '#f87171');
    }
  }

  handleTrap() {
    const dmg = Math.max(1, Math.floor(this.hero.getEffectiveHealth() * 0.1));
    this.hero.currentHealth = Math.max(1, this.hero.currentHealth - dmg);
    this.showPopup('Poisoned mushroom spores! You take ' + dmg + ' damage.', '#f87171');
  }

  startGoonFight(goonType) {
    this.saveDungeonProgress();
    GAME_STATE.forcedEncounter = {
      type: 'dungeonGoon',
      goonType: goonType || 'mushroom',
      heroLevel: this.hero.level,
    };
    this.scene.start('Combat');
  }

  startWitchFight() {
    this.saveDungeonProgress();
    GAME_STATE.forcedEncounter = {
      type: 'witchBoss',
      heroLevel: this.hero.level,
    };
    this.scene.start('Combat');
  }

  showWitchMarker() {
    const center = getTileCenter(DUNGEON_PENTAGRAM_TILE.col, DUNGEON_PENTAGRAM_TILE.row);
    if (this.witchMarker) return;

    this.witchMarker = this.add.circle(center.x, center.y, 22, 0x22c55e, 0.5).setDepth(9);
    this.tweens.add({
      targets: this.witchMarker,
      alpha: 0.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.text(center.x, center.y - 36, 'The Witch awaits...', {
      fontSize: 12, color: '#22c55e',
      stroke: '#0f172a', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
  }

  showPopup(text, color) {
    this.popupActive = true;
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.55).setInteractive().setDepth(50);
    const panel = this.add.rectangle(w / 2, h / 2, 360, 140, 0x1e293b).setDepth(51);
    const msg = this.add.text(w / 2, h / 2 - 20, text, {
      fontSize: 16, color: color || '#e5e7eb',
      stroke: '#0f172a', strokeThickness: 4,
      wordWrap: { width: 320 },
      align: 'center',
    }).setOrigin(0.5).setDepth(52);
    const okBtn = this.add.rectangle(w / 2, h / 2 + 40, 80, 32, 0x475569)
      .setInteractive({ useHandCursor: true }).setDepth(52);
    const okText = this.add.text(w / 2, h / 2 + 40, 'OK', { fontSize: 14, color: '#fff' }).setOrigin(0.5).setDepth(53);

    const parts = [overlay, panel, msg, okBtn, okText];
    const close = () => {
      parts.forEach(o => o.destroy());
      this.popupActive = false;
    };
    okBtn.on('pointerdown', close);
    overlay.on('pointerdown', close);
  }

  showResultPopup(title, subtitle, item, color) {
    this.popupActive = true;
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.55).setInteractive().setDepth(50);
    const panel = this.add.rectangle(w / 2, h / 2, 340, 230, 0x1e293b).setDepth(51);
    const titleText = this.add.text(w / 2, h / 2 - 80, title, {
      fontSize: 18, color: '#fbbf24',
      stroke: '#0f172a', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(52);

    let icon = null;
    if (item && typeof createItemIconSprite === 'function') {
      icon = createItemIconSprite(this, item, w / 2, h / 2 - 18, { width: 72, height: 72, hover: false });
      if (icon) icon.setDepth(52);
    }

    const subtitleText = this.add.text(w / 2, h / 2 + 38, subtitle, {
      fontSize: 20, color: color || '#e5e7eb',
      stroke: '#0f172a', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(52);
    const okBtn = this.add.rectangle(w / 2, h / 2 + 78, 80, 32, 0x475569)
      .setInteractive({ useHandCursor: true }).setDepth(52);
    const okText = this.add.text(w / 2, h / 2 + 78, 'OK', { fontSize: 14, color: '#fff' }).setOrigin(0.5).setDepth(53);

    const parts = [overlay, panel, titleText, subtitleText, okBtn, okText];
    if (icon) parts.push(icon);
    const close = () => {
      parts.forEach(o => o.destroy());
      this.popupActive = false;
    };
    okBtn.on('pointerdown', close);
    overlay.on('pointerdown', close);
  }

  showLeavePrompt() {
    this.popupActive = true;
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.55).setInteractive().setDepth(50);
    const panel = this.add.rectangle(w / 2, h / 2, 360, 160, 0x1e293b).setDepth(51);
    const msg = this.add.text(w / 2, h / 2 - 30, 'Leave the dungeon?', {
      fontSize: 18, color: '#fbbf24',
      stroke: '#0f172a', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(52);
    const sub = this.add.text(w / 2, h / 2, 'You will keep any herbs you collected.', {
      fontSize: 13, color: '#94a3b8',
      stroke: '#0f172a', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(52);

    const yesBtn = this.add.rectangle(w / 2 - 60, h / 2 + 42, 90, 32, 0x22c55e)
      .setInteractive({ useHandCursor: true }).setDepth(52);
    this.add.text(w / 2 - 60, h / 2 + 42, 'Leave', { fontSize: 14, color: '#fff' }).setOrigin(0.5).setDepth(53);
    const noBtn = this.add.rectangle(w / 2 + 60, h / 2 + 42, 90, 32, 0x475569)
      .setInteractive({ useHandCursor: true }).setDepth(52);
    this.add.text(w / 2 + 60, h / 2 + 42, 'Stay', { fontSize: 14, color: '#fff' }).setOrigin(0.5).setDepth(53);

    const parts = [overlay, panel, msg, sub, yesBtn, noBtn];
    const closeParts = () => { parts.forEach(o => o.destroy()); this.popupActive = false; };

    yesBtn.on('pointerdown', () => {
      closeParts();
      this.leaveDungeon();
    });
    noBtn.on('pointerdown', closeParts);
  }

  leaveDungeon() {
    GAME_STATE.dungeonProgress = null;
    GAME_STATE.pendingWitchDungeon = false;
    this.scene.start('Town');
  }

  saveDungeonProgress() {
    GAME_STATE.dungeonProgress = {
      heroCol: this.heroCol,
      heroRow: this.heroRow,
      steps: this.steps,
      visitedTiles: Array.from(this.visitedTiles),
      witchSpawned: this.witchSpawned,
    };
  }
}
