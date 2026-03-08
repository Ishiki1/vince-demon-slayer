/**
 * BootScene.js
 * Loads minimal assets and starts Menu.
 * Use createSeamlessLoop() for any looping sprite animation to avoid a blink when the animation repeats.
 */

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    this.load.spritesheet('hero_sheet', 'assets/hero/Vince-idle.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_slash_sheet', 'assets/hero/vince-regular-attack1.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_heavy_strike_sheet', 'assets/hero/heavy_strike_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_healing_sheet', 'assets/hero/healing_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_execute_sheet', 'assets/hero/execute_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_whirlwind_sheet', 'assets/hero/whirlwind_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_evade_sheet', 'assets/hero/evade_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_iron_skin_sheet', 'assets/hero/iron_skin_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_life_drain_sheet', 'assets/hero/lifedrain2_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_thorncape_sheet', 'assets/hero/thorncape_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_iron_evasion_sheet', 'assets/hero/iron_evasion_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_lightning_set_idle_sheet', 'assets/hero/lightning_set_idle_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_wind_set_idle_sheet', 'assets/hero/wind_set_idle_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_fire_set_idle_sheet', 'assets/hero/fire_set_idle_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_water_set_idle_sheet', 'assets/hero/water_set_idle_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('hero_ice_set_idle_sheet', 'assets/hero/ice_set_idle_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('skeleton_idle_sheet', 'assets/goons/skeleton_idle_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('skeleton_attack_sheet', 'assets/goons/skeletonattack_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('imp_idle_sheet', 'assets/goons/impidle_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('imp_attack_sheet', 'assets/goons/impattack_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('bat_idle_sheet', 'assets/goons/bat_idle_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('bat_attack_sheet', 'assets/goons/bat_attack_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('reaper_idle_sheet', 'assets/goons/reaper_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('reaper_attack_sheet', 'assets/goons/reaper_attack_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('vampire_idle_sheet', 'assets/goons/vampire_idle_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('vampire_attack_sheet', 'assets/goons/vampire_attack_512x512_sheet.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.image('town-overworld', 'assets/overworld/town-overworld.png');
    this.load.image('level1-overworld', 'assets/overworld/level1-overworld.png');
    this.load.image('level2-overworld', 'assets/overworld/level2-overworld.png');
    this.load.image('level3-overworld', 'assets/overworld/level3-overworld.png');
    this.load.image('level4-overworld', 'assets/overworld/level4-overworld.png');
    this.load.image('level5-overworld', 'assets/overworld/level5-overworld.png');
    this.load.image('level6-overworld', 'assets/overworld/level6-overworld.png');
    this.load.image('level7-overworld', 'assets/overworld/level7-overworld.png');
    this.load.image('level8-overworld', 'assets/overworld/level8-overworld.png');
    this.load.image('level9-overworld', 'assets/overworld/level9-overworld.png');
    this.load.image('castle-overworld', 'assets/overworld/castle-overworld.png');
    [
      'settings-icon',
      'save-game-icon',
      'abandon-run-icon',
      'inventory-icon',
      'character-sheet-icon',
      'inn-icon',
      'shop-icon',
      'blacksmith-icon',
      'mine-icon',
      'alchemist-icon',
      'overworld-icon',
    ].forEach((key) => {
      this.load.image(key, `assets/ui/${key}.png`);
    });
    this.load.image('inventory-ui-layout', 'assets/ui/Inventory.png');
    for (let n = 1; n <= 10; n++) {
      this.load.image(`level${n}-ui-background`, `assets/overworld/level${n}-bg.png`);
    }
    this.load.image('startgame-ui-background', 'assets/overworld/Startgame-bg.png');
    this.load.image('town-ui-background', 'assets/overworld/town-bg.png');
    this.load.image('blacksmith-ui-background', 'assets/overworld/blacksmith-bg.png');
    this.load.image('shop-ui-background', 'assets/overworld/shop-bg.png');
    this.load.image('mine-ui-background', 'assets/overworld/mine-bg.png');
    this.load.image('alchemist-ui-background', 'assets/overworld/alchemist-bg.png');
    this.load.image('overworld-ui-background', 'assets/overworld/overworld-bg.png');
    [
      'button-slash',
      'button-heavy-strike',
      'button-execute',
      'button-iron-skin',
      'button-evasion',
      'button-holy-light',
      'button-whirlwind',
      'button-life-drain',
      'button-thorncape',
      'button-iron-evasion',
      'passive-str1',
      'passive-hp2',
      'passive-mana2',
      'passive-def1',
      'passive-str2',
      'passive-hp4',
      'passive-mana4',
      'passive-def2',
      'passive-translucent-skin',
      'passive-reinforced-hide',
      'passive-brutal-might',
      'passive-vitality',
      'passive-battle-focus',
      'passive-combat-reflexes',
    ].forEach((key) => {
      this.load.image(key, `assets/ui/skills/${key}.png`);
    });
    const itemVisuals = typeof getPreloadItemVisuals === 'function' ? getPreloadItemVisuals() : [];
    itemVisuals.forEach((visual) => {
      this.load.image(visual.textureKey, visual.basePath);
      if (visual.hover) {
        this.load.spritesheet(visual.hover.sheetKey, visual.hover.path, {
          frameWidth: visual.hover.frameWidth,
          frameHeight: visual.hover.frameHeight,
        });
      }
    });

    const soundEntries = typeof getAllSoundEntries === 'function' ? getAllSoundEntries() : [];
    soundEntries.forEach((e) => this.load.audio(e.key, e.path));
  }

  /**
   * Looping animation with repeat: 0 so the scene can restart it on 'animationcomplete'
   * to avoid Phaser's repeat causing a one-frame blink.
   */
  createSeamlessLoop(sheetKey, animKey, startFrame, endFrame, frameRate = 30) {
    const frames = this.anims.generateFrameNumbers(sheetKey, { start: startFrame, end: endFrame });
    this.anims.create({
      key: animKey,
      frames,
      frameRate,
      repeat: 0,
    });
  }

  /**
   * Register a one-shot hero animation from a spritesheet. No-op if texture does not exist.
   */
  registerOneShotHeroAnim(sheetKey, animKey, frameRate = 24) {
    if (!this.textures.exists(sheetKey)) return;
    const frameNames = this.textures.get(sheetKey).getFrameNames();
    const count = frameNames.length;
    if (count === 0) return;
    const frames = this.anims.generateFrameNumbers(sheetKey, { start: 0, end: count - 1 });
    this.anims.create({ key: animKey, frames, frameRate, repeat: 0 });
  }

  registerHoverIconAnim(sheetKey, animKey) {
    if (!this.textures.exists(sheetKey)) return;
    const frameNames = this.textures.get(sheetKey).getFrameNames();
    const count = frameNames ? frameNames.length : 0;
    if (count < 4) return;
    this.anims.create({
      key: animKey,
      frames: [0, 1, 2, 3, 2, 1].map((frame) => ({ key: sheetKey, frame })),
      frameRate: 10,
      repeat: -1,
    });
  }

  registerFullCycleHoverIconAnim(sheetKey, animKey, frameRate = 16) {
    if (!this.textures.exists(sheetKey)) return;
    const frameNames = this.textures.get(sheetKey).getFrameNames();
    const count = frameNames ? frameNames.length : 0;
    if (count < 2) return;
    this.anims.create({
      key: animKey,
      frames: this.anims.generateFrameNumbers(sheetKey, { start: 0, end: count - 1 }),
      frameRate,
      repeat: -1,
    });
  }

  create() {
    // Sheet has 73 frames (0-72); last row is incomplete. Duplicate frame 0 at end for seamless loop.
    const idleFrames = this.anims.generateFrameNumbers('hero_sheet', { start: 0, end: 72 });
    idleFrames.push(idleFrames[0]);
    this.anims.create({
      key: 'hero_idle',
      frames: idleFrames,
      frameRate: 30,
      repeat: 0,
    });
    if (this.textures.exists('hero_lightning_set_idle_sheet')) {
      const lightningIdleFrameNames = this.textures.get('hero_lightning_set_idle_sheet').getFrameNames();
      const lightningIdleCount = lightningIdleFrameNames ? lightningIdleFrameNames.length : 0;
      if (lightningIdleCount > 0) {
        const lightningIdleFrames = this.anims.generateFrameNumbers('hero_lightning_set_idle_sheet', { start: 0, end: lightningIdleCount - 1 });
        lightningIdleFrames.push(lightningIdleFrames[0]);
        this.anims.create({
          key: 'hero_lightning_set_idle',
          frames: lightningIdleFrames,
          frameRate: 30,
          repeat: 0,
        });
      }
    }
    if (this.textures.exists('hero_wind_set_idle_sheet')) {
      const windIdleFrameNames = this.textures.get('hero_wind_set_idle_sheet').getFrameNames();
      const windIdleCount = windIdleFrameNames ? windIdleFrameNames.length : 0;
      if (windIdleCount > 0) {
        const windIdleFrames = this.anims.generateFrameNumbers('hero_wind_set_idle_sheet', { start: 0, end: windIdleCount - 1 });
        windIdleFrames.push(windIdleFrames[0]);
        this.anims.create({
          key: 'hero_wind_set_idle',
          frames: windIdleFrames,
          frameRate: 30,
          repeat: 0,
        });
      }
    }
    if (this.textures.exists('hero_fire_set_idle_sheet')) {
      const fireIdleFrameNames = this.textures.get('hero_fire_set_idle_sheet').getFrameNames();
      const fireIdleCount = fireIdleFrameNames ? fireIdleFrameNames.length : 0;
      if (fireIdleCount > 0) {
        const fireIdleFrames = this.anims.generateFrameNumbers('hero_fire_set_idle_sheet', { start: 0, end: fireIdleCount - 1 });
        fireIdleFrames.push(fireIdleFrames[0]);
        this.anims.create({
          key: 'hero_fire_set_idle',
          frames: fireIdleFrames,
          frameRate: 30,
          repeat: 0,
        });
      }
    }
    if (this.textures.exists('hero_water_set_idle_sheet')) {
      const waterIdleFrameNames = this.textures.get('hero_water_set_idle_sheet').getFrameNames();
      const waterIdleCount = waterIdleFrameNames ? waterIdleFrameNames.length : 0;
      if (waterIdleCount > 0) {
        const waterIdleFrames = this.anims.generateFrameNumbers('hero_water_set_idle_sheet', { start: 0, end: waterIdleCount - 1 });
        waterIdleFrames.push(waterIdleFrames[0]);
        this.anims.create({
          key: 'hero_water_set_idle',
          frames: waterIdleFrames,
          frameRate: 30,
          repeat: 0,
        });
      }
    }
    if (this.textures.exists('hero_ice_set_idle_sheet')) {
      const iceIdleFrameNames = this.textures.get('hero_ice_set_idle_sheet').getFrameNames();
      const iceIdleCount = iceIdleFrameNames ? iceIdleFrameNames.length : 0;
      if (iceIdleCount > 0) {
        const iceIdleFrames = this.anims.generateFrameNumbers('hero_ice_set_idle_sheet', { start: 0, end: iceIdleCount - 1 });
        iceIdleFrames.push(iceIdleFrames[0]);
        this.anims.create({
          key: 'hero_ice_set_idle',
          frames: iceIdleFrames,
          frameRate: 30,
          repeat: 0,
        });
      }
    }
    const oneShotAnims = [
      { sheetKey: 'hero_slash_sheet', animKey: 'hero_slash' },
      { sheetKey: 'hero_heavy_strike_sheet', animKey: 'hero_heavy_strike' },
      { sheetKey: 'hero_healing_sheet', animKey: 'hero_healing' },
      { sheetKey: 'hero_execute_sheet', animKey: 'hero_execute' },
      { sheetKey: 'hero_whirlwind_sheet', animKey: 'hero_whirlwind' },
      { sheetKey: 'hero_evade_sheet', animKey: 'hero_evade' },
      { sheetKey: 'hero_iron_skin_sheet', animKey: 'hero_iron_skin' },
      { sheetKey: 'hero_life_drain_sheet', animKey: 'hero_life_drain' },
      { sheetKey: 'hero_thorncape_sheet', animKey: 'hero_thorncape' },
      { sheetKey: 'hero_iron_evasion_sheet', animKey: 'hero_iron_evasion' },
    ];
    oneShotAnims.forEach(({ sheetKey, animKey }) => this.registerOneShotHeroAnim(sheetKey, animKey));

    // Skeleton idle: loop for combat display
    if (this.textures.exists('skeleton_idle_sheet')) {
      const skeletonFrameNames = this.textures.get('skeleton_idle_sheet').getFrameNames();
      const skeletonCount = skeletonFrameNames ? skeletonFrameNames.length : 0;
      if (skeletonCount > 0) {
        this.anims.create({
          key: 'skeleton_idle',
          frames: this.anims.generateFrameNumbers('skeleton_idle_sheet', { start: 0, end: skeletonCount - 1 }),
          frameRate: 20,
          repeat: -1,
        });
      }
    }
    // Skeleton attack: one-shot for when skeleton attacks in combat
    if (this.textures.exists('skeleton_attack_sheet')) {
      const skeletonAttackFrames = this.textures.get('skeleton_attack_sheet').getFrameNames();
      const skeletonAttackCount = skeletonAttackFrames ? skeletonAttackFrames.length : 0;
      if (skeletonAttackCount > 0) {
        this.anims.create({
          key: 'skeleton_attack',
          frames: this.anims.generateFrameNumbers('skeleton_attack_sheet', { start: 0, end: skeletonAttackCount - 1 }),
          frameRate: 24,
          repeat: 0,
        });
      }
    }
    // Imp idle (goon enemy): 6×8 grid = 48 frames, all with imp; use only those frames
    const IMP_IDLE_FRAME_COUNT = 48;
    if (this.textures.exists('imp_idle_sheet')) {
      this.anims.create({
        key: 'imp_idle',
        frames: this.anims.generateFrameNumbers('imp_idle_sheet', { start: 0, end: IMP_IDLE_FRAME_COUNT - 1 }),
        frameRate: 20,
        repeat: -1,
      });
    }
    // Imp attack: one-shot for when imp attacks in combat
    if (this.textures.exists('imp_attack_sheet')) {
      const impAttackFrames = this.textures.get('imp_attack_sheet').getFrameNames();
      const impAttackCount = impAttackFrames ? impAttackFrames.length : 0;
      if (impAttackCount > 0) {
        this.anims.create({
          key: 'imp_attack',
          frames: this.anims.generateFrameNumbers('imp_attack_sheet', { start: 0, end: impAttackCount - 1 }),
          frameRate: 24,
          repeat: 0,
        });
      }
    }
    // Bat idle: loop for combat display
    if (this.textures.exists('bat_idle_sheet')) {
      const batFrameNames = this.textures.get('bat_idle_sheet').getFrameNames();
      const batCount = batFrameNames ? batFrameNames.length : 0;
      if (batCount > 0) {
        this.anims.create({
          key: 'bat_idle',
          frames: this.anims.generateFrameNumbers('bat_idle_sheet', { start: 0, end: batCount - 1 }),
          frameRate: 20,
          repeat: -1,
        });
      }
    }
    // Bat attack: one-shot for when bat attacks in combat
    if (this.textures.exists('bat_attack_sheet')) {
      const batAttackFrames = this.textures.get('bat_attack_sheet').getFrameNames();
      const batAttackCount = batAttackFrames ? batAttackFrames.length : 0;
      if (batAttackCount > 0) {
        this.anims.create({
          key: 'bat_attack',
          frames: this.anims.generateFrameNumbers('bat_attack_sheet', { start: 0, end: batAttackCount - 1 }),
          frameRate: 24,
          repeat: 0,
        });
      }
    }
    // Reaper idle: loop for combat display
    if (this.textures.exists('reaper_idle_sheet')) {
      const reaperFrameNames = this.textures.get('reaper_idle_sheet').getFrameNames();
      const reaperCount = reaperFrameNames ? reaperFrameNames.length : 0;
      if (reaperCount > 0) {
        this.anims.create({
          key: 'reaper_idle',
          frames: this.anims.generateFrameNumbers('reaper_idle_sheet', { start: 0, end: reaperCount - 1 }),
          frameRate: 20,
          repeat: -1,
        });
      }
    }
    // Reaper attack: one-shot for when reaper attacks in combat
    if (this.textures.exists('reaper_attack_sheet')) {
      const attackFrameNames = this.textures.get('reaper_attack_sheet').getFrameNames();
      const attackCount = attackFrameNames ? attackFrameNames.length : 0;
      if (attackCount > 0) {
        this.anims.create({
          key: 'reaper_attack',
          frames: this.anims.generateFrameNumbers('reaper_attack_sheet', { start: 0, end: attackCount - 1 }),
          frameRate: 24,
          repeat: 0,
        });
      }
    }
    // Vampire idle: loop for standard boss combat display
    if (this.textures.exists('vampire_idle_sheet')) {
      const vampireFrameNames = this.textures.get('vampire_idle_sheet').getFrameNames();
      const vampireCount = vampireFrameNames ? vampireFrameNames.length : 0;
      if (vampireCount > 0) {
        this.anims.create({
          key: 'vampire_idle',
          frames: this.anims.generateFrameNumbers('vampire_idle_sheet', { start: 0, end: vampireCount - 1 }),
          frameRate: 20,
          repeat: -1,
        });
      }
    }
    // Vampire attack: one-shot for standard boss attacks in combat
    if (this.textures.exists('vampire_attack_sheet')) {
      const vampireAttackFrameNames = this.textures.get('vampire_attack_sheet').getFrameNames();
      const vampireAttackCount = vampireAttackFrameNames ? vampireAttackFrameNames.length : 0;
      if (vampireAttackCount > 0) {
        this.anims.create({
          key: 'vampire_attack',
          frames: this.anims.generateFrameNumbers('vampire_attack_sheet', { start: 0, end: vampireAttackCount - 1 }),
          frameRate: 24,
          repeat: 0,
        });
      }
    }
    const itemVisuals = typeof getPreloadItemVisuals === 'function' ? getPreloadItemVisuals() : [];
    itemVisuals.forEach((visual) => {
      if (!visual.hover) return;
      if (visual.hover.style === 'pingPong') {
        this.registerHoverIconAnim(visual.hover.sheetKey, visual.hover.animKey);
        return;
      }
      this.registerFullCycleHoverIconAnim(visual.hover.sheetKey, visual.hover.animKey, visual.hover.frameRate || 16);
    });
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);

    this.scene.start('Menu');
  }
}
