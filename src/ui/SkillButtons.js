/**
 * SkillButtons.js
 * Creates clickable skill buttons (shape + text) for combat.
 * Shows skill name and mana cost; disables when not enough mana.
 */

const SKILLS_PER_ROW = 5;
const SKILL_SLOT_SIZE = 58;
const SKILL_ICON_SIZE = 42;
const SKILL_CELL_WIDTH = 72;
const SKILL_CELL_HEIGHT = 78;
const SKILL_PADDING = 12;

function createSkillButtons(scene, hero, onSkillClick) {
  const buttons = [];
  const totalWidth = SKILLS_PER_ROW * SKILL_CELL_WIDTH + (SKILLS_PER_ROW - 1) * SKILL_PADDING;
  const startX = Math.max(28, Math.floor((CONFIG.WIDTH - totalWidth) / 2));
  const startY = 396;
  const skillMap = getSkillsForClass(hero);
  const visibleSkills = hero.skills.filter(skillId => hero.lockedSkillId !== skillId);

  let enabled = true;

  const applyVisualState = (button) => {
    const canUse = hero.currentMana >= button.skill.manaCost;
    button.slotBg.setFillStyle(0x0f172a, 0);
    button.slotBg.setStrokeStyle(0, 0x000000, 0);
    button.slotBg.setAlpha(0);
    button.manaBg.setFillStyle(canUse ? 0x1d4ed8 : 0x475569);
    button.manaBg.setAlpha(enabled ? 1 : 0.5);
    button.manaText.setAlpha(enabled ? 1 : 0.5);
    button.manaText.setColor(canUse ? '#e5e7eb' : '#cbd5e1');
    if (button.icon) button.icon.setAlpha(enabled ? (canUse ? 1 : 0.55) : 0.35);
    if (button.fallbackLabel) {
      button.fallbackLabel.setAlpha(enabled ? (canUse ? 1 : 0.7) : 0.45);
      button.fallbackLabel.setColor(canUse ? '#fff' : '#cbd5e1');
    }
  };

  const tipStyle = { fontSize: 14, color: '#e5e7eb', fontFamily: 'Arial' };
  const tipX = CONFIG.WIDTH / 2;
  const tipY = CONFIG.HEIGHT - 100;

  visibleSkills.forEach((skillId, i) => {
    const skill = skillMap[skillId];
    if (!skill) return;
    const row = Math.floor(i / SKILLS_PER_ROW);
    const col = i % SKILLS_PER_ROW;
    const x = startX + col * (SKILL_CELL_WIDTH + SKILL_PADDING);
    const y = startY + row * (SKILL_CELL_HEIGHT + SKILL_PADDING);
    const centerX = x + SKILL_CELL_WIDTH / 2;
    const slotY = y + SKILL_SLOT_SIZE / 2;
    const hitArea = scene.add.rectangle(centerX, y + SKILL_CELL_HEIGHT / 2, SKILL_CELL_WIDTH, SKILL_CELL_HEIGHT, 0x0f172a, 0.001);
    const slotBg = scene.add.rectangle(centerX, slotY, SKILL_SLOT_SIZE, SKILL_SLOT_SIZE, 0x0f172a, 0)
      .setStrokeStyle(0, 0x000000, 0);
    const iconKey = skill.assetKey;
    const icon = iconKey && scene.textures.exists(iconKey)
      ? scene.add.image(centerX, slotY - 4, iconKey).setDisplaySize(SKILL_ICON_SIZE, SKILL_ICON_SIZE)
      : null;
    const fallbackLabel = icon
      ? null
      : scene.add.text(centerX, slotY - 5, skill.name, {
          fontSize: 10,
          color: '#fff',
          align: 'center',
        }).setOrigin(0.5).setWordWrapWidth(SKILL_SLOT_SIZE - 10);
    const manaBg = scene.add.rectangle(centerX, y + 66, 34, 15, 0x1d4ed8);
    const manaText = scene.add.text(centerX, y + 66, `M${skill.manaCost}`, {
      fontSize: 10,
      color: '#e5e7eb',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    hitArea.setInteractive({ useHandCursor: true });

    const button = {
      hitArea,
      slotBg,
      icon,
      fallbackLabel,
      manaBg,
      manaText,
      skillId,
      skill,
      isHovered: false,
    };
    button.updateState = () => applyVisualState(button);

    if (icon && typeof attachHoverScaleTooltip === 'function') {
      attachHoverScaleTooltip(hitArea, icon, {
        tooltipKey: 'skillTooltipGraphic',
        tooltipX: tipX,
        tooltipY: tipY,
        tooltipText: () => (typeof getSkillChoiceTooltip === 'function' ? getSkillChoiceTooltip(skillId, hero) : ''),
        tooltipStyle: tipStyle,
        tooltipWidth: CONFIG.WIDTH - 80,
        hoverWidth: SKILL_ICON_SIZE + 4,
        hoverHeight: SKILL_ICON_SIZE + 4,
        onHoverChanged: (hovered) => {
          button.isHovered = hovered;
          button.updateState();
        },
      });
    } else {
      hitArea.on('pointerover', () => {
        button.isHovered = true;
        button.updateState();
        if (scene.skillTooltipGraphic) scene.skillTooltipGraphic.destroy();
        const tip = typeof getSkillChoiceTooltip === 'function' ? getSkillChoiceTooltip(skillId, hero) : '';
        if (tip) {
          scene.skillTooltipGraphic = scene.add.text(tipX, tipY, tip, tipStyle).setOrigin(0.5, 1).setWordWrapWidth(CONFIG.WIDTH - 80).setDepth(20);
        }
      });
      hitArea.on('pointerout', () => {
        button.isHovered = false;
        button.updateState();
        if (scene.skillTooltipGraphic) {
          scene.skillTooltipGraphic.destroy();
          scene.skillTooltipGraphic = null;
        }
      });
    }

    buttons.push(button);
    button.updateState();
  });

  buttons.forEach(b => {
    b.hitArea.on('pointerdown', () => {
      if (!enabled) return;
      if (hero.currentMana >= b.skill.manaCost) onSkillClick(b.skillId);
    });
  });

  return {
    update() {
      buttons.forEach(b => b.updateState());
    },
    setEnabled(e) {
      enabled = e;
      buttons.forEach(b => b.updateState());
    },
    destroy() {
      if (scene.skillTooltipGraphic) {
        scene.skillTooltipGraphic.destroy();
        scene.skillTooltipGraphic = null;
      }
      buttons.forEach(b => {
        b.hitArea.destroy();
        b.slotBg.destroy();
        if (b.icon) b.icon.destroy();
        if (b.fallbackLabel) b.fallbackLabel.destroy();
        b.manaBg.destroy();
        b.manaText.destroy();
      });
    },
  };
}
