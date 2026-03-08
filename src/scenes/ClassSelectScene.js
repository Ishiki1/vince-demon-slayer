/**
 * ClassSelectScene.js
 * Choose class before starting. Warrior available; Class 2 unlocks after level 10.
 */

class ClassSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ClassSelect' });
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
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
    const classes = typeof getClassSelectEntries === 'function'
      ? getClassSelectEntries(unlocked)
      : [{ id: 'warrior', name: 'Warrior', available: true, unlockLabel: 'Select' }];

    this.add.text(w / 2, 50, 'Choose your class', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);

    const spacing = 150;
    const startX = w / 2 - ((classes.length - 1) * spacing) / 2;
    classes.forEach((c, i) => {
      const x = startX + i * spacing;
      const y = h / 2 - 20;
      const available = c.available === true;
      const color = available ? 0x4ade80 : 0x475569;
      const box = this.add.rectangle(x, y, 100, 80, color);
      this.add.text(x, y - 20, c.name, { fontSize: 14, color: '#fff' }).setOrigin(0.5);
      this.add.text(x, y + 15, c.unlockLabel || (available ? 'Select' : 'Locked'), {
        fontSize: 11,
        color: available ? '#e5e7eb' : '#94a3b8',
      }).setOrigin(0.5);
      if (available) {
        box.setInteractive({ useHandCursor: true });
        box.on('pointerdown', () => this.scene.start('UnlockSelect', { classId: c.id }));
      }
    });
  }
}
