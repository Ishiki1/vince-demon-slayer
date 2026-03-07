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
    this.load.image('settings-icon', 'assets/ui/settings-icon.png');
    this.load.image('save-game-icon', 'assets/ui/save-game-icon.png');
    this.load.image('abandon-run-icon', 'assets/ui/abandon-run-icon.png');
    this.load.image('inventory-icon', 'assets/ui/inventory-icon.png');
    this.load.image('character-sheet-icon', 'assets/ui/character-sheet-icon.png');
    this.load.image('inventory-ui-layout', 'assets/ui/Inventory.png');
    this.load.image('overworld-ui-background', 'assets/ui/overworld.png');
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
    this.load.image('common-sword', 'assets/items/common-sword.png');
    this.load.image('common-armor', 'assets/items/common-armor.png');
    this.load.image('common-ring', 'assets/items/common-ring.png');
    this.load.image('common-amulet', 'assets/items/common-amulet.png');
    this.load.image('rare-sword', 'assets/items/rare-sword.png');
    this.load.image('rare-armor', 'assets/items/rare-armor.png');
    this.load.image('rare-ring', 'assets/items/rare-ring.png');
    this.load.image('rare-amulet', 'assets/items/rare-amulet.png');
    this.load.image('legendary-sword', 'assets/items/legendary-sword.png');
    this.load.image('legendary-armor', 'assets/items/legendary-armor.png');
    this.load.image('legendary-ring', 'assets/items/legendary-ring.png');
    this.load.image('legendary-amulet', 'assets/items/legendary-amulet.png');
    this.load.image('cursed-demon-blade', 'assets/items/cursed-demon-blade.png');
    this.load.image('shadow-veil', 'assets/items/shadow-veil.png');
    this.load.image('phantom-cloak', 'assets/items/phantom-cloak.png');
    this.load.image('ember-cleaver', 'assets/items/ember-cleaver.png');
    this.load.image('inferno-plate', 'assets/items/inferno-plate.png');
    this.load.image('flame-pendant', 'assets/items/flame-pendant.png');
    this.load.image('gale-edge', 'assets/items/gale-edge.png');
    this.load.image('storm-guard', 'assets/items/storm-guard.png');
    this.load.image('wind-band', 'assets/items/wind-band.png');
    this.load.image('frostbite', 'assets/items/frostbite.png');
    this.load.image('glacier-plate', 'assets/items/glacier-plate.png');
    this.load.image('fire-stone', 'assets/items/fire-stone.png');
    this.load.image('wind-stone', 'assets/items/wind-stone.png');
    this.load.image('ice-stone', 'assets/items/ice-stone.png');
    this.load.image('lightning-stone', 'assets/items/lightning-stone.png');
    this.load.image('water-stone', 'assets/items/water-stone.png');
    this.load.spritesheet('common-armor-hover-sheet', 'assets/items/common-armor-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('common-ring-hover-sheet', 'assets/items/common-ring-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('common-amulet-hover-sheet', 'assets/items/common-amulet-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('rare-sword-hover-sheet', 'assets/items/rare-sword-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('rare-armor-hover-sheet', 'assets/items/rare-armor-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('rare-ring-hover-sheet', 'assets/items/rare-ring-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('rare-amulet-hover-sheet', 'assets/items/rare-amulet-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('legendary-sword-hover-sheet', 'assets/items/legendary-sword-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('cursed-demon-blade-hover-sheet', 'assets/items/cursed-demon-blade-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('ember-cleaver-hover-sheet', 'assets/items/ember-cleaver-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('frostbite-hover-sheet', 'assets/items/frostbite-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('legendary-armor-hover-sheet', 'assets/items/legendary-armor-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('shadow-veil-hover-sheet', 'assets/items/shadow-veil-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('inferno-plate-hover-sheet', 'assets/items/inferno-plate-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('storm-guard-hover-sheet', 'assets/items/storm-guard-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('glacier-plate-hover-sheet', 'assets/items/glacier-plate-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('legendary-ring-hover-sheet', 'assets/items/legendary-ring-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('legendary-amulet-hover-sheet', 'assets/items/legendary-amulet-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('phantom-cloak-hover-sheet', 'assets/items/phantom-cloak-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('flame-pendant-hover-sheet', 'assets/items/flame-pendant-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('gale-edge-hover-sheet', 'assets/items/gale-edge-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('wind-band-hover-sheet', 'assets/items/wind-band-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('common-sword-hover-sheet', 'assets/items/common-sword-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('health-potion-hover-sheet', 'assets/items/health-potion-hover_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('mana-potion-hover-sheet', 'assets/items/mana-potion-hover_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('avoid-death-potion-hover-sheet', 'assets/items/avoid-death-potion-hover_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('fire-stone-hover-sheet', 'assets/items/fire-stone-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('wind-stone-hover-sheet', 'assets/items/wind-stone-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('ice-stone-hover-sheet', 'assets/items/ice-stone-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('lightning-stone-hover-sheet', 'assets/items/lightning-stone-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('water-stone-hover-sheet', 'assets/items/water-stone-hover-pulse_256x256_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.image('health-potion', 'assets/items/health-potion.png');
    this.load.image('mana-potion', 'assets/items/mana-potion.png');
    this.load.image('avoid-death-potion', 'assets/items/avoid-death-potion.png');

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
    this.registerFullCycleHoverIconAnim('common-sword-hover-sheet', 'common-sword-hover', 16);
    this.registerFullCycleHoverIconAnim('common-armor-hover-sheet', 'common-armor-hover', 16);
    this.registerFullCycleHoverIconAnim('common-ring-hover-sheet', 'common-ring-hover', 16);
    this.registerFullCycleHoverIconAnim('common-amulet-hover-sheet', 'common-amulet-hover', 16);
    this.registerFullCycleHoverIconAnim('rare-sword-hover-sheet', 'rare-sword-hover', 16);
    this.registerFullCycleHoverIconAnim('rare-armor-hover-sheet', 'rare-armor-hover', 16);
    this.registerFullCycleHoverIconAnim('rare-ring-hover-sheet', 'rare-ring-hover', 16);
    this.registerFullCycleHoverIconAnim('rare-amulet-hover-sheet', 'rare-amulet-hover', 16);
    this.registerFullCycleHoverIconAnim('legendary-sword-hover-sheet', 'legendary-sword-hover', 16);
    this.registerFullCycleHoverIconAnim('cursed-demon-blade-hover-sheet', 'cursed-demon-blade-hover', 16);
    this.registerFullCycleHoverIconAnim('ember-cleaver-hover-sheet', 'ember-cleaver-hover', 16);
    this.registerFullCycleHoverIconAnim('frostbite-hover-sheet', 'frostbite-hover', 16);
    this.registerFullCycleHoverIconAnim('gale-edge-hover-sheet', 'gale-edge-hover', 16);
    this.registerFullCycleHoverIconAnim('legendary-armor-hover-sheet', 'legendary-armor-hover', 16);
    this.registerFullCycleHoverIconAnim('shadow-veil-hover-sheet', 'shadow-veil-hover', 16);
    this.registerFullCycleHoverIconAnim('inferno-plate-hover-sheet', 'inferno-plate-hover', 16);
    this.registerFullCycleHoverIconAnim('storm-guard-hover-sheet', 'storm-guard-hover', 16);
    this.registerFullCycleHoverIconAnim('glacier-plate-hover-sheet', 'glacier-plate-hover', 16);
    this.registerFullCycleHoverIconAnim('legendary-ring-hover-sheet', 'legendary-ring-hover', 16);
    this.registerFullCycleHoverIconAnim('legendary-amulet-hover-sheet', 'legendary-amulet-hover', 16);
    this.registerFullCycleHoverIconAnim('phantom-cloak-hover-sheet', 'phantom-cloak-hover', 16);
    this.registerFullCycleHoverIconAnim('flame-pendant-hover-sheet', 'flame-pendant-hover', 16);
    this.registerFullCycleHoverIconAnim('wind-band-hover-sheet', 'wind-band-hover', 16);
    this.registerFullCycleHoverIconAnim('fire-stone-hover-sheet', 'fire-stone-hover', 16);
    this.registerFullCycleHoverIconAnim('wind-stone-hover-sheet', 'wind-stone-hover', 16);
    this.registerFullCycleHoverIconAnim('ice-stone-hover-sheet', 'ice-stone-hover', 16);
    this.registerFullCycleHoverIconAnim('lightning-stone-hover-sheet', 'lightning-stone-hover', 16);
    this.registerFullCycleHoverIconAnim('water-stone-hover-sheet', 'water-stone-hover', 16);
    this.registerHoverIconAnim('health-potion-hover-sheet', 'health-potion-hover');
    this.registerHoverIconAnim('mana-potion-hover-sheet', 'mana-potion-hover');
    this.registerHoverIconAnim('avoid-death-potion-hover-sheet', 'avoid-death-potion-hover');
    if (typeof applyAnimationSettings === 'function') applyAnimationSettings(this);

    this.scene.start('Menu');
  }
}
