/**
 * UnlockSelectScene.js
 * After class select: choose up to 2 unlocks for this run within the available RP budget. Continue -> ClassOrigin.
 */

class UnlockSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UnlockSelect' });
  }

  getUnlockCost(id) {
    return (typeof UNLOCKS !== 'undefined' && UNLOCKS[id] && UNLOCKS[id].cost != null) ? UNLOCKS[id].cost : 0;
  }

  getSelectedCostTotal() {
    return (this.selectedIds || []).reduce((sum, id) => sum + this.getUnlockCost(id), 0);
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const data = this.scene.settings.data || {};
    const classId = data.classId || DEFAULT_CLASS_ID;
    const totalPoints = typeof getTotalPoints === 'function' ? getTotalPoints() : 0;

    this.classId = classId;
    const savedSelection = (typeof getRunUnlockSelection === 'function' && getRunUnlockSelection()) || [];
    this.selectedIds = typeof sanitizeRunUnlockSelection === 'function'
      ? sanitizeRunUnlockSelection(totalPoints, savedSelection)
      : savedSelection.slice(0, typeof MAX_RUN_UNLOCKS !== 'undefined' ? MAX_RUN_UNLOCKS : 2);
    setRunUnlockSelection && setRunUnlockSelection(this.selectedIds);

    this.add.text(w / 2, 50, 'Choose Unlocks for This Run', { fontSize: 24, color: '#fbbf24' }).setOrigin(0.5);
    this.totalPointsText = this.add.text(w / 2, 85, 'Total Run Points: ' + totalPoints, { fontSize: 18, color: '#e5e7eb' }).setOrigin(0.5);

    const unlockIds = typeof UNLOCK_IDS !== 'undefined' ? UNLOCK_IDS : ['lucky', 'discount', 'growthSpurt'];
    const startY = 140;
    this.tooltipText = null;
    unlockIds.forEach((id, i) => {
      const u = typeof UNLOCKS !== 'undefined' && UNLOCKS[id] ? UNLOCKS[id] : { id, name: id, tooltip: '' };
      const selected = this.selectedIds.includes(id);
      const cost = this.getUnlockCost(id);
      const selectedCost = this.getSelectedCostTotal();
      const hasSlot = this.selectedIds.length < (typeof MAX_RUN_UNLOCKS !== 'undefined' ? MAX_RUN_UNLOCKS : 2);
      const canSelect = selected || (hasSlot && selectedCost + cost <= totalPoints);
      const y = startY + i * 70;
      const label = u.name + ' (' + cost + ' RP)' + (selected ? ' [selected]' : '');
      const baseColor = selected ? 0x2563eb : (canSelect ? 0x475569 : 0x64748b);
      const btn = this.add.rectangle(200, y, 280, 44, baseColor);
      btn.setInteractive({ useHandCursor: canSelect });
      const txt = this.add.text(200, y, label, { fontSize: 15, color: '#fff' }).setOrigin(0.5);
      btn.on('pointerover', () => {
        if (this.tooltipText) this.tooltipText.destroy();
        this.tooltipText = this.add.text(w / 2, h - 90, u.tooltip || '', { fontSize: 13, color: '#94a3b8' }).setOrigin(0.5).setWordWrapWidth(w - 80);
      });
      btn.on('pointerout', () => {
        if (this.tooltipText) { this.tooltipText.destroy(); this.tooltipText = null; }
      });
      btn.on('pointerdown', () => {
        if (selected) {
          this.selectedIds = this.selectedIds.filter(x => x !== id);
        } else {
          if (!hasSlot || selectedCost + cost > totalPoints) return;
          this.selectedIds.push(id);
        }
        setRunUnlockSelection && setRunUnlockSelection(this.selectedIds);
        this.scene.restart({ classId: this.classId });
      });
    });

    createUiArtButton(this, w / 2, h - 50, 'continue-button', () => {
      setRunUnlockSelection && setRunUnlockSelection(this.selectedIds);
      this.scene.start('ClassOrigin', { classId: this.classId });
    }, {
      width: 180,
      height: 52,
      fallbackLabel: 'Continue',
      fallbackWidth: 160,
      fallbackHeight: 48,
      bgColor: 0x4ade80,
      fontSize: 18,
      textColor: '#fff',
    });
  }
}
