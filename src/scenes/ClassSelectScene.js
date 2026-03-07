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
    const unlocked = GAME_STATE.unlockedClasses || ['warrior'];

    this.add.text(w / 2, 50, 'Choose your class', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);

    const classes = [
      { id: 'warrior', name: 'Warrior', unlock: true },
      { id: 'sorceress', name: 'Sorceress', unlock: unlocked.includes('sorceress') },
      { id: 'class3', name: 'Class 3', unlock: false },
      { id: 'class4', name: 'Class 4', unlock: false },
      { id: 'class5', name: 'Class 5', unlock: false },
    ];

    classes.forEach((c, i) => {
      const x = 120 + i * 130;
      const y = h / 2 - 20;
      const available = c.id === 'warrior' || c.unlock;
      const color = available ? 0x4ade80 : 0x475569;
      const box = this.add.rectangle(x, y, 100, 80, color);
      this.add.text(x, y - 20, c.name, { fontSize: 14, color: '#fff' }).setOrigin(0.5);
      const sub = this.add.text(x, y + 15, available ? 'Select' : (c.id === 'sorceress' ? 'Unlock at L10' : 'Locked'), { fontSize: 11, color: available ? '#e5e7eb' : '#94a3b8' }).setOrigin(0.5);
      if (available) {
        box.setInteractive({ useHandCursor: true });
        box.on('pointerdown', () => this.scene.start('UnlockSelect', { classId: c.id }));
      }
    });
  }
}
