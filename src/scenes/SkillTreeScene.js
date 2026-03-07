/**
 * SkillTreeScene.js
 * Level-up: spend skill points on skills or passives. Multiple picks until points run out or Continue.
 */

class SkillTreeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SkillTree' });
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    const data = this.scene.settings.data || {};
    this.from = data.from;
    this.isBossFight = data.isBossFight === true;

    if (!hero) {
      this.goNext();
      return;
    }

    this.hero = hero;
    this.choiceGraphics = [];

    if (this.from === 'combat' && typeof playSfx === 'function') playSfx(this, 'level-up');

    this.add.text(w / 2, 40, (this.from === 'overworld' ? 'Skill Tree' : 'Level Up') + ' — Level ' + hero.level, { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);
    this.pointsText = this.add.text(w / 2, 75, 'Skill points: ' + (hero.skillPoints || 0), { fontSize: 18, color: '#e5e7eb' }).setOrigin(0.5);
    this.add.text(w / 2, 105, 'Spend points or Continue:', { fontSize: 16, color: '#94a3b8' }).setOrigin(0.5);

    this.buildChoiceButtons();

    const contBtn = this.add.rectangle(w / 2, h - 60, 160, 48, 0x475569);
    contBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h - 60, 'Continue', { fontSize: 18, color: '#fff' }).setOrigin(0.5);
    contBtn.on('pointerdown', () => {
      GAME_STATE.pendingLevelUp = false;
      if (this.from === 'combat') this.hero.refillCombatStats();
      this.goNext();
    });
  }

  buildChoiceButtons() {
    this.choiceGraphics.forEach(g => { if (g.destroy) g.destroy(); });
    this.choiceGraphics = [];
    if (this.tooltipGraphic) {
      this.tooltipGraphic.destroy();
      this.tooltipGraphic = null;
    }
    const hero = this.hero;
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const skillMap = getSkillsForClass(hero);
    const choices = ProgressionSystem.getChoicesForLevel(hero.level);
    this.pointsText.setText('Skill points: ' + (hero.skillPoints || 0));

    const actives = choices.filter(id => skillMap[id]);
    const passives = choices.filter(id => PASSIVES[id]);

    const colLeftX = 180;
    const colRightX = 500;
    const startY = 155;
    const rowH = 54;
    const btnW = 220;
    const btnH = 44;
    const iconSize = 30;

    const createChoiceRow = (choiceId, x, y, label, fillColor, tooltipText) => {
      const btn = this.add.rectangle(x, y, btnW, btnH, fillColor).setOrigin(0, 0.5);
      btn.setStrokeStyle(2, 0x0f172a, 0.22);
      btn.setInteractive({ useHandCursor: true });

      const assetKey = typeof getChoiceAssetKey === 'function' ? getChoiceAssetKey(choiceId, hero) : null;
      const icon = assetKey && this.textures.exists(assetKey)
        ? this.add.image(x + 26, y, assetKey).setDisplaySize(iconSize, iconSize)
        : null;
      const labelText = this.add.text(icon ? x + 50 : x + 12, y, label, {
        fontSize: 13,
        color: '#fff',
        fontFamily: 'Arial',
      }).setOrigin(0, 0.5).setWordWrapWidth(icon ? btnW - 84 : btnW - 46);

      this.choiceGraphics.push(btn, labelText);
      if (icon) this.choiceGraphics.push(icon);

      if (icon && typeof attachHoverScaleTooltip === 'function') {
        attachHoverScaleTooltip(btn, icon, {
          tooltipKey: 'tooltipGraphic',
          tooltipText,
          tooltipX: w / 2,
          tooltipY: h - 100,
          tooltipWidth: w - 80,
          hoverWidth: iconSize + 4,
          hoverHeight: iconSize + 4,
          onHoverChanged: (hovered) => {
            btn.setStrokeStyle(2, hovered ? 0xfbbf24 : 0x0f172a, hovered ? 0.85 : 0.22);
          },
        });
      } else {
        btn.on('pointerover', () => {
          btn.setStrokeStyle(2, 0xfbbf24, 0.85);
          if (this.tooltipGraphic) this.tooltipGraphic.destroy();
          if (tooltipText) {
            this.tooltipGraphic = this.add.text(w / 2, h - 100, tooltipText, {
              fontSize: 14,
              color: '#e5e7eb',
              fontFamily: 'Arial',
            }).setOrigin(0.5, 1).setWordWrapWidth(w - 80).setDepth(20);
          }
        });
        btn.on('pointerout', () => {
          btn.setStrokeStyle(2, 0x0f172a, 0.22);
          if (this.tooltipGraphic) {
            this.tooltipGraphic.destroy();
            this.tooltipGraphic = null;
          }
        });
      }

      return btn;
    };

    if (actives.length > 0) {
      const activeHead = this.add.text(colLeftX, 125, 'Active skills', { fontSize: 16, color: '#fbbf24' }).setOrigin(0, 0.5);
      this.choiceGraphics.push(activeHead);
      actives.forEach((choiceId, i) => {
        const cost = getChoiceCost(choiceId);
        const label = (skillMap[choiceId].name || choiceId) + ' (' + cost + ' SP)';
        const y = startY + i * rowH;
        const tip = typeof getSkillChoiceTooltip === 'function' ? getSkillChoiceTooltip(choiceId, hero) : '';
        const btn = createChoiceRow(choiceId, colLeftX, y, label, 0x16a34a, tip);
        btn.on('pointerdown', () => {
          if (ProgressionSystem.applyChoice(hero, choiceId)) this.buildChoiceButtons();
        });
      });
    } else {
      const activeHeadDim = this.add.text(colLeftX, 125, 'Active skills', { fontSize: 16, color: '#94a3b8' }).setOrigin(0, 0.5);
      const activeNone = this.add.text(colLeftX, startY, 'None available', { fontSize: 14, color: '#64748b' }).setOrigin(0, 0.5);
      this.choiceGraphics.push(activeHeadDim, activeNone);
    }

    if (passives.length > 0) {
      const passHead = this.add.text(colRightX, 125, 'Passive skills', { fontSize: 16, color: '#fbbf24' }).setOrigin(0, 0.5);
      this.choiceGraphics.push(passHead);
      passives.forEach((choiceId, i) => {
        const cost = getChoiceCost(choiceId);
        const label = (PASSIVES[choiceId].name || choiceId) + ' (' + cost + ' SP)';
        const y = startY + i * rowH;
        const tip = typeof getPassiveChoiceTooltip === 'function' ? getPassiveChoiceTooltip(choiceId) : '';
        const btn = createChoiceRow(choiceId, colRightX, y, label, 0x16a34a, tip);
        btn.on('pointerdown', () => {
          if (ProgressionSystem.applyChoice(hero, choiceId)) this.buildChoiceButtons();
        });
      });
    } else {
      const passHeadDim = this.add.text(colRightX, 125, 'Passive skills', { fontSize: 16, color: '#94a3b8' }).setOrigin(0, 0.5);
      const passNone = this.add.text(colRightX, startY, 'None available', { fontSize: 14, color: '#64748b' }).setOrigin(0, 0.5);
      this.choiceGraphics.push(passHeadDim, passNone);
    }
  }

  goNext() {
    if (this.from === 'combat') {
      GAME_STATE.pendingLootItemId = LootSystem.rollLoot(this.isBossFight === true, this.hero.class);
      this.scene.start('Loot');
    } else {
      this.scene.start('Overworld');
    }
  }
}
