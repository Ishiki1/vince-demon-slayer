/**
 * SettingsScene.js
 * Music, SFX, and animation-speed settings. Opened from Menu or Overworld; Back returns to the scene that opened it.
 */

class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Settings' });
  }

  create() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    const data = this.scene.settings.data || {};
    const from = data.from === 'Overworld' ? 'Overworld' : 'Menu';
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);

    this.add.text(w / 2, 50, 'Settings', { fontSize: 28, color: '#fbbf24' }).setOrigin(0.5);

    let musicVol = typeof getMusicVolume === 'function' ? getMusicVolume() : 0.7;
    let sfxVol = typeof getSfxVolume === 'function' ? getSfxVolume() : 0.8;
    const animationOptions = typeof getAnimationSpeedOptions === 'function' ? getAnimationSpeedOptions() : [1, 1.5, 2];
    let animationSpeed = typeof getAnimationSpeed === 'function' ? getAnimationSpeed() : 1;

    const row1Y = 140;
    this.add.text(120, row1Y, 'Music', { fontSize: 18, color: '#e5e7eb' }).setOrigin(0, 0.5);
    const musicMinus = this.add.rectangle(280, row1Y, 44, 36, 0x475569).setInteractive({ useHandCursor: true });
    this.add.text(280, row1Y, '−', { fontSize: 22, color: '#fff' }).setOrigin(0.5);
    this.musicLabel = this.add.text(360, row1Y, Math.round(musicVol * 100) + '%', { fontSize: 18, color: '#fbbf24' }).setOrigin(0.5);
    const musicPlus = this.add.rectangle(440, row1Y, 44, 36, 0x475569).setInteractive({ useHandCursor: true });
    this.add.text(440, row1Y, '+', { fontSize: 22, color: '#fff' }).setOrigin(0.5);

    const row2Y = 200;
    this.add.text(120, row2Y, 'SFX', { fontSize: 18, color: '#e5e7eb' }).setOrigin(0, 0.5);
    const sfxMinus = this.add.rectangle(280, row2Y, 44, 36, 0x475569).setInteractive({ useHandCursor: true });
    this.add.text(280, row2Y, '−', { fontSize: 22, color: '#fff' }).setOrigin(0.5);
    this.sfxLabel = this.add.text(360, row2Y, Math.round(sfxVol * 100) + '%', { fontSize: 18, color: '#fbbf24' }).setOrigin(0.5);
    const sfxPlus = this.add.rectangle(440, row2Y, 44, 36, 0x475569).setInteractive({ useHandCursor: true });
    this.add.text(440, row2Y, '+', { fontSize: 22, color: '#fff' }).setOrigin(0.5);

    const row3Y = 260;
    this.add.text(120, row3Y, 'Animations', { fontSize: 18, color: '#e5e7eb' }).setOrigin(0, 0.5);
    const animationMinus = this.add.rectangle(280, row3Y, 44, 36, 0x475569).setInteractive({ useHandCursor: true });
    this.add.text(280, row3Y, '−', { fontSize: 22, color: '#fff' }).setOrigin(0.5);
    this.animationLabel = this.add.text(
      360,
      row3Y,
      typeof getAnimationSpeedLabel === 'function' ? getAnimationSpeedLabel(animationSpeed) : (Math.round(animationSpeed * 100) + '%'),
      { fontSize: 18, color: '#fbbf24' }
    ).setOrigin(0.5);
    const animationPlus = this.add.rectangle(440, row3Y, 44, 36, 0x475569).setInteractive({ useHandCursor: true });
    this.add.text(440, row3Y, '+', { fontSize: 22, color: '#fff' }).setOrigin(0.5);

    const step = 0.1;

    musicMinus.on('pointerdown', () => {
      musicVol = Math.max(0, musicVol - step);
      if (typeof setMusicVolume === 'function') setMusicVolume(musicVol);
      this.musicLabel.setText(Math.round(musicVol * 100) + '%');
      if (typeof updateMusicVolume === 'function') updateMusicVolume(this);
    });
    musicPlus.on('pointerdown', () => {
      musicVol = Math.min(1, musicVol + step);
      if (typeof setMusicVolume === 'function') setMusicVolume(musicVol);
      this.musicLabel.setText(Math.round(musicVol * 100) + '%');
      if (typeof updateMusicVolume === 'function') updateMusicVolume(this);
    });

    sfxMinus.on('pointerdown', () => {
      sfxVol = Math.max(0, sfxVol - step);
      if (typeof setSfxVolume === 'function') setSfxVolume(sfxVol);
      this.sfxLabel.setText(Math.round(sfxVol * 100) + '%');
    });
    sfxPlus.on('pointerdown', () => {
      sfxVol = Math.min(1, sfxVol + step);
      if (typeof setSfxVolume === 'function') setSfxVolume(sfxVol);
      this.sfxLabel.setText(Math.round(sfxVol * 100) + '%');
    });

    const updateAnimationSpeed = (delta) => {
      const currentIndex = Math.max(0, animationOptions.indexOf(animationSpeed));
      const nextIndex = Phaser.Math.Clamp(currentIndex + delta, 0, animationOptions.length - 1);
      animationSpeed = animationOptions[nextIndex];
      if (typeof setAnimationSpeed === 'function') setAnimationSpeed(animationSpeed);
      this.animationLabel.setText(
        typeof getAnimationSpeedLabel === 'function' ? getAnimationSpeedLabel(animationSpeed) : (Math.round(animationSpeed * 100) + '%')
      );
      if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);
    };

    animationMinus.on('pointerdown', () => updateAnimationSpeed(-1));
    animationPlus.on('pointerdown', () => updateAnimationSpeed(1));

    const backBtn = this.add.rectangle(w / 2, h - 80, 140, 48, 0x475569);
    backBtn.setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h - 80, 'Back', { fontSize: 18, color: '#fff' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this.scene.start(from));
  }
}
