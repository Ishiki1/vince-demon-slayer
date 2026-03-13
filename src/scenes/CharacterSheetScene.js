/**
 * CharacterSheetScene.js
 * Two-column, icon-driven character summary: stats on the left, equipment sprites
 * on the right, skill/passive icon rows in the center, and navigation at the bottom.
 */

class CharacterSheetScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSheet' });
  }

  create() {
    if (!GAME_STATE.hero) {
      this.scene.start('Menu');
      return;
    }
    const data = this.scene.settings.data || {};
    const returnScene = data.from === 'Town' ? 'Town' : 'Overworld';
    const skillTreeFrom = returnScene === 'Town' ? 'town' : 'overworld';
    const backLabel = returnScene === 'Town' ? 'Back to Town' : 'Back to Map';
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const hero = GAME_STATE.hero;
    InventorySystem.ensureAccessorySlots(hero);

    this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e).setDepth(-30);
    this.add.text(w / 2, 30, 'Character Sheet', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);

    this.buildStatsColumn(hero, w);
    this.buildEquipmentColumn(hero, w);
    this.buildSkillIconRows(hero, w);
    this.buildRunBonuses(w);
    this.buildNavButtons(w, h, returnScene, backLabel, skillTreeFrom);
  }

  buildStatsColumn(hero, w) {
    const x = 60;
    createXPBar(this, x, 68, 260, 20, hero);
    const needed = ProgressionSystem.xpNeededForNextLevel(hero);
    const baseLevelXP = hero.level === 1 ? 0 : CONFIG.XP_PER_LEVEL[hero.level - 1];
    this.add.text(x, 92, 'XP: ' + (hero.xp - baseLevelXP) + ' / ' + (needed - baseLevelXP), {
      fontSize: 12, color: '#94a3b8',
    });

    let y = 120;
    this.add.text(x, y, 'Stats', { fontSize: 16, color: '#fbbf24' });
    y += 24;

    const lines = [
      ['Strength', Math.floor(hero.getEffectiveStrength()), '#fff'],
    ];
    if (hero.getEffectiveIntelligence) {
      lines.push(['Intelligence', Math.floor(hero.getEffectiveIntelligence()), '#fff']);
    }
    lines.push(
      ['Defense', Math.floor(hero.getEffectiveDefense()), '#fff'],
      ['HP', hero.currentHealth + ' / ' + hero.getEffectiveHealth(), '#fff'],
      ['Mana', hero.currentMana + ' / ' + hero.getEffectiveMana(), '#93c5fd'],
    );
    lines.forEach(([label, val, color]) => {
      this.add.text(x, y, label + ': ' + val, { fontSize: 14, color });
      y += 20;
    });
  }

  buildEquipmentColumn(hero, w) {
    const headerX = 430;
    this.add.text(headerX, 68, 'Equipment', { fontSize: 16, color: '#fbbf24' });

    const ICON = 48;
    const colCenters = [headerX + 50, headerX + 200];
    const rowTops = [96, 180];

    const slots = [
      { key: 'weapon', label: 'Weapon', col: 0, row: 0 },
      { key: 'armor', label: 'Armor', col: 1, row: 0 },
      { key: 'accessories.0', label: 'Acc 1', col: 0, row: 1 },
      { key: 'accessories.1', label: 'Acc 2', col: 1, row: 1 },
    ];

    slots.forEach(({ key, label, col, row }) => {
      const cx = colCenters[col];
      const top = rowTops[row];
      this.add.text(cx, top, label, { fontSize: 12, color: '#94a3b8' }).setOrigin(0.5, 0);

      const slotId = key.startsWith('accessories.')
        ? hero.accessories[Number(key.split('.')[1])]
        : hero[key];
      const slot = slotId != null ? hero.inventory.find(s => s.id === slotId) : null;
      const item = slot && ITEMS[slot.itemId] ? ITEMS[slot.itemId] : null;
      const iconY = top + 18 + ICON / 2;

      if (item) {
        const icon = createItemIconSprite(this, item, cx, iconY, {
          width: ICON, height: ICON, hover: false,
        });
        const hit = this.add.rectangle(cx, iconY, ICON + 8, ICON + 8, 0x000000, 0.001);
        hit.setInteractive({ useHandCursor: false });
        const effect = getItemEffectLine(item);
        attachHoverScaleTooltip(hit, icon, {
          tooltipText: item.name + (effect ? '\n' + effect : ''),
          tooltipKey: 'equipTooltip',
          tooltipX: w / 2,
          tooltipY: 282,
          tooltipOriginY: 1,
          tooltipStyle: { fontSize: 13, color: '#e5e7eb', fontFamily: 'Arial' },
          tooltipWidth: w - 100,
          hoverWidth: ICON + 4,
          hoverHeight: ICON + 4,
        });
      } else {
        this.add.rectangle(cx, iconY, ICON, ICON, 0x334155).setStrokeStyle(2, 0x64748b, 0.5);
        this.add.text(cx, iconY, 'None', { fontSize: 10, color: '#64748b' }).setOrigin(0.5);
      }
    });

    if (typeof getUniqueSetBonusDisplay === 'function') {
      const setDisplay = getUniqueSetBonusDisplay(hero);
      if (setDisplay) {
        this.add.text(headerX, 266, 'Set: ' + setDisplay.elementName + ' (' + setDisplay.summary + ')', {
          fontSize: 13, color: '#a5b4fc',
        });
      }
    }
  }

  buildSkillIconRows(hero, w) {
    const ICON_SIZE = 42;
    const ICON_PAD = 8;
    const CELL = ICON_SIZE + ICON_PAD;
    const GAP = 16;
    const MAX_PER_ROW = Math.floor((w - 80) / CELL);
    const tipStyle = { fontSize: 13, color: '#e5e7eb', fontFamily: 'Arial' };

    const skillMap = getSkillsForClass(hero);
    const actives = hero.skills
      .map(id => ({ id, data: skillMap[id], type: 'active' }))
      .filter(e => e.data);
    const passives = (hero.passives || [])
      .map(id => ({ id, data: PASSIVES[id], type: 'passive' }))
      .filter(e => e.data);
    const all = actives.concat(passives);
    const activeCount = actives.length;

    if (all.length === 0) return;

    const sectionY = 304;
    this.add.text(w / 2, sectionY, 'Skills & Passives', { fontSize: 16, color: '#fbbf24' }).setOrigin(0.5);

    const rows = [];
    for (let i = 0; i < all.length; i += MAX_PER_ROW) {
      rows.push(all.slice(i, i + MAX_PER_ROW));
    }

    let globalIdx = 0;
    rows.forEach((row, ri) => {
      const rowY = sectionY + 34 + ri * (ICON_SIZE + 14);
      const rowStart = globalIdx;

      let gapCol = -1;
      for (let i = 0; i < row.length; i++) {
        if (rowStart + i === activeCount && activeCount > 0 && activeCount < all.length) {
          gapCol = i;
        }
      }

      const totalW = row.length * CELL - ICON_PAD + (gapCol >= 0 ? GAP : 0);
      const startX = Math.floor((w - totalW) / 2) + ICON_SIZE / 2;
      const tipY = sectionY + 34 + rows.length * (ICON_SIZE + 14) + 6;

      row.forEach((entry, ci) => {
        let xOff = ci * CELL;
        if (gapCol >= 0 && ci >= gapCol) xOff += GAP;
        const cx = startX + xOff;

        const key = entry.data.assetKey;
        const hasTex = key && this.textures.exists(key);

        const icon = hasTex
          ? this.add.image(cx, rowY, key).setDisplaySize(ICON_SIZE, ICON_SIZE)
          : null;

        if (!icon) {
          this.add.rectangle(cx, rowY, ICON_SIZE, ICON_SIZE, 0x334155)
            .setStrokeStyle(1, 0x64748b, 0.5);
          this.add.text(cx, rowY, entry.data.name.slice(0, 3), {
            fontSize: 10, color: '#cbd5e1', align: 'center',
          }).setOrigin(0.5);
        }

        const hit = this.add.rectangle(cx, rowY, ICON_SIZE + 6, ICON_SIZE + 6, 0x000000, 0.001);
        hit.setInteractive({ useHandCursor: false });

        const getTooltip = entry.type === 'active'
          ? () => (typeof getSkillChoiceTooltip === 'function' ? getSkillChoiceTooltip(entry.id, hero) : entry.data.name)
          : () => (typeof getPassiveChoiceTooltip === 'function' ? getPassiveChoiceTooltip(entry.id) : entry.data.name);

        if (icon) {
          attachHoverScaleTooltip(hit, icon, {
            tooltipText: getTooltip,
            tooltipKey: 'sheetSkillTip',
            tooltipX: w / 2,
            tooltipY: tipY,
            tooltipOriginY: 0,
            tooltipStyle: tipStyle,
            tooltipWidth: w - 100,
            hoverWidth: ICON_SIZE + 4,
            hoverHeight: ICON_SIZE + 4,
          });
        } else {
          hit.on('pointerover', () => {
            if (this.sheetSkillTip) this.sheetSkillTip.destroy();
            const tip = getTooltip();
            if (tip) {
              this.sheetSkillTip = this.add.text(w / 2, tipY, tip, tipStyle)
                .setOrigin(0.5, 0).setWordWrapWidth(w - 100).setDepth(20);
            }
          });
          hit.on('pointerout', () => {
            if (this.sheetSkillTip) { this.sheetSkillTip.destroy(); this.sheetSkillTip = null; }
          });
        }

        globalIdx++;
      });
    });
  }

  buildRunBonuses(w) {
    const runUnlocks = GAME_STATE.runUnlocks || [];
    if (runUnlocks.length === 0 || typeof UNLOCKS === 'undefined') return;
    const names = runUnlocks.map(id => UNLOCKS[id]).filter(Boolean).map(u => u.name);
    if (names.length === 0) return;
    this.add.text(w / 2, 468, 'Run bonuses: ' + names.join(', '), {
      fontSize: 12, color: '#a5b4fc',
    }).setOrigin(0.5).setWordWrapWidth(w - 100);
  }

  buildNavButtons(w, h, returnScene, backLabel, skillTreeFrom) {
    const btnY = h - 40;

    const stBtn = this.add.rectangle(w / 2 - 100, btnY, 140, 44, 0x8b5cf6);
    stBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2 - 100, btnY, 'Skill Tree', { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    stBtn.on('pointerdown', () => this.scene.start('SkillTree', { from: skillTreeFrom }));

    const bkBtn = this.add.rectangle(w / 2 + 100, btnY, 160, 44, 0x475569);
    bkBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2 + 100, btnY, backLabel, { fontSize: 16, color: '#fff' }).setOrigin(0.5);
    bkBtn.on('pointerdown', () => this.scene.start(returnScene));
  }
}
