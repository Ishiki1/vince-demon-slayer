/**
 * SkillButtons.js
 * Creates clickable skill buttons (icon-only, single row) for combat.
 * Dynamically centres the row based on visible skill count.
 */

const SKILL_SLOT_SIZE = 58;
const SKILL_ICON_SIZE = 42;
const SKILL_CELL_SIZE = 58;
const SKILL_PADDING = 6;

function createSkillButtons(scene, hero, onSkillClick) {
  const buttons = [];
  const skillMap = getSkillsForClass(hero);
  const visibleSkills = hero.skills.filter(skillId => hero.lockedSkillId !== skillId);

  const totalWidth = visibleSkills.length * SKILL_CELL_SIZE + Math.max(0, visibleSkills.length - 1) * SKILL_PADDING;
  const startX = Math.max(8, Math.floor((CONFIG.WIDTH - totalWidth) / 2));
  const startY = CONFIG.HEIGHT - SKILL_CELL_SIZE - 8;

  let enabled = true;

  const applyVisualState = (button) => {
    const canUse = hero.currentMana >= button.skill.manaCost;
    button.slotBg.setFillStyle(0x0f172a, 0);
    button.slotBg.setStrokeStyle(0, 0x000000, 0);
    button.slotBg.setAlpha(0);
    if (button.icon) button.icon.setAlpha(enabled ? (canUse ? 1 : 0.55) : 0.35);
    if (button.fallbackLabel) {
      button.fallbackLabel.setAlpha(enabled ? (canUse ? 1 : 0.7) : 0.45);
      button.fallbackLabel.setColor(canUse ? '#fff' : '#cbd5e1');
    }
  };

  const tipStyle = { fontSize: 14, color: '#e5e7eb', fontFamily: 'Arial' };
  const tipX = CONFIG.WIDTH / 2;
  const tipY = startY - 12;

  visibleSkills.forEach((skillId, i) => {
    const skill = skillMap[skillId];
    if (!skill) return;
    const x = startX + i * (SKILL_CELL_SIZE + SKILL_PADDING);
    const centerX = x + SKILL_CELL_SIZE / 2;
    const centerY = startY + SKILL_CELL_SIZE / 2;
    const hitArea = scene.add.rectangle(centerX, centerY, SKILL_CELL_SIZE, SKILL_CELL_SIZE, 0x0f172a, 0.001);
    const slotBg = scene.add.rectangle(centerX, centerY, SKILL_SLOT_SIZE, SKILL_SLOT_SIZE, 0x0f172a, 0)
      .setStrokeStyle(0, 0x000000, 0);
    const iconKey = skill.assetKey;
    const icon = iconKey && scene.textures.exists(iconKey)
      ? scene.add.image(centerX, centerY, iconKey).setDisplaySize(SKILL_ICON_SIZE, SKILL_ICON_SIZE)
      : null;
    const fallbackLabel = icon
      ? null
      : scene.add.text(centerX, centerY, skill.name, {
          fontSize: 10,
          color: '#fff',
          align: 'center',
        }).setOrigin(0.5).setWordWrapWidth(SKILL_SLOT_SIZE - 10);

    hitArea.setInteractive({ useHandCursor: true });

    const button = {
      hitArea,
      slotBg,
      icon,
      fallbackLabel,
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
      });
    },
  };
}
