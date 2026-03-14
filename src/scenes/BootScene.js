/**
 * BootScene.js
 * Minimal boot for menu/settings, plus deferred gameplay preload for the heavy bundle.
 * Use createSeamlessLoop() for any looping sprite animation to avoid a blink when the animation repeats.
 */

let GAMEPLAY_ASSETS_READY = false;
let COMBAT_ANIMATIONS_READY = false;
let ITEM_HOVER_ANIMATIONS_READY = false;

const HERO_SET_IDLE_ANIMATIONS = [
  { sheetKey: 'hero_lightning_set_idle_sheet', animKey: 'hero_lightning_set_idle' },
  { sheetKey: 'hero_wind_set_idle_sheet', animKey: 'hero_wind_set_idle' },
  { sheetKey: 'hero_fire_set_idle_sheet', animKey: 'hero_fire_set_idle' },
  { sheetKey: 'hero_water_set_idle_sheet', animKey: 'hero_water_set_idle' },
  { sheetKey: 'hero_ice_set_idle_sheet', animKey: 'hero_ice_set_idle' },
];

const HERO_ONE_SHOT_ANIMATIONS = [
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

const ENEMY_ANIMATIONS = [
  { sheetKey: 'skeleton_idle_sheet', animKey: 'skeleton_idle', frameRate: 20, repeat: -1 },
  { sheetKey: 'skeleton_attack_sheet', animKey: 'skeleton_attack', frameRate: 24, repeat: 0 },
  { sheetKey: 'imp_idle_sheet', animKey: 'imp_idle', frameRate: 20, repeat: -1 },
  { sheetKey: 'imp_attack_sheet', animKey: 'imp_attack', frameRate: 24, repeat: 0 },
  { sheetKey: 'bat_idle_sheet', animKey: 'bat_idle', frameRate: 20, repeat: -1 },
  { sheetKey: 'bat_attack_sheet', animKey: 'bat_attack', frameRate: 24, repeat: 0 },
  { sheetKey: 'reaper_idle_sheet', animKey: 'reaper_idle', frameRate: 20, repeat: -1 },
  { sheetKey: 'reaper_attack_sheet', animKey: 'reaper_attack', frameRate: 24, repeat: 0 },
  { sheetKey: 'vampire_idle_sheet', animKey: 'vampire_idle', frameRate: 20, repeat: -1 },
  { sheetKey: 'vampire_attack_sheet', animKey: 'vampire_attack', frameRate: 24, repeat: 0 },
];

function getTextureFrameCount(scene, sheetKey) {
  if (!scene || !scene.textures || !scene.textures.exists(sheetKey)) return 0;
  const frameNames = scene.textures.get(sheetKey).getFrameNames();
  return frameNames ? frameNames.length : 0;
}

function ensureGeneratedAnimation(scene, sheetKey, animKey, frameRate, repeat, options) {
  if (!scene || !scene.anims || scene.anims.exists(animKey)) return true;
  const count = getTextureFrameCount(scene, sheetKey);
  if (count === 0) return false;
  const endFrame = options && options.maxFrame != null ? Math.min(options.maxFrame, count - 1) : count - 1;
  const frames = options && options.pingPong
    ? [0, 1, 2, 3, 2, 1].filter((frame) => frame <= endFrame).map((frame) => ({ key: sheetKey, frame }))
    : scene.anims.generateFrameNumbers(sheetKey, { start: 0, end: endFrame });
  if (!frames || frames.length === 0) return false;
  if (options && options.seamlessLoop) frames.push(frames[0]);
  scene.anims.create({
    key: animKey,
    frames,
    frameRate,
    repeat,
  });
  return true;
}

function ensureHeroIdleAnimation(scene, warningPrefix) {
  const registered = ensureGeneratedAnimation(scene, 'hero_sheet', 'hero_idle', 30, 0, {
    maxFrame: 72,
    seamlessLoop: true,
  });
  if (!registered && warningPrefix) {
    console.warn(`${warningPrefix} hero_sheet missing or invalid; skipping hero_idle registration.`);
  }
  return registered;
}

function ensureCombatAnimations(scene) {
  if (!scene || COMBAT_ANIMATIONS_READY) return;
  ensureHeroIdleAnimation(scene, '[Combat]');
  HERO_SET_IDLE_ANIMATIONS.forEach(({ sheetKey, animKey }) => {
    ensureGeneratedAnimation(scene, sheetKey, animKey, 30, 0, { seamlessLoop: true });
  });
  HERO_ONE_SHOT_ANIMATIONS.forEach(({ sheetKey, animKey }) => {
    ensureGeneratedAnimation(scene, sheetKey, animKey, 24, 0);
  });
  ENEMY_ANIMATIONS.forEach(({ sheetKey, animKey, frameRate, repeat }) => {
    ensureGeneratedAnimation(scene, sheetKey, animKey, frameRate, repeat);
  });
  COMBAT_ANIMATIONS_READY = true;
}

function ensureItemHoverAnimations(scene) {
  if (!scene || ITEM_HOVER_ANIMATIONS_READY) return;
  const itemVisuals = typeof getPreloadItemVisuals === 'function' ? getPreloadItemVisuals() : [];
  itemVisuals.forEach((visual) => {
    if (!visual.hover) return;
    if (visual.hover.style === 'pingPong') {
      ensureGeneratedAnimation(scene, visual.hover.sheetKey, visual.hover.animKey, 10, -1, { pingPong: true });
      return;
    }
    ensureGeneratedAnimation(scene, visual.hover.sheetKey, visual.hover.animKey, visual.hover.frameRate || 16, -1);
  });
  ITEM_HOVER_ANIMATIONS_READY = true;
}

function preloadBootMenuAssets(scene) {
  if (!scene || !scene.load) return;
  scene.load.image('startgame-ui-background', 'assets/overworld/startgame-bg.png');
  scene.load.image('settingsscene-ui-background', 'assets/ui/SettingsScene-bg.png');
  scene.load.json('settingsscene-hotspots', 'assets/ui/SettingsScene-bg-hotspots-800x600.json');
  scene.load.image('continue-button', 'assets/ui/continue-button.png');
  scene.load.audio('game-music', 'assets/sounds/game-music.mp3');
}

function startSceneWithGameplayPreload(scene, targetKey, targetData) {
  if (!scene || !scene.scene || !targetKey) return;
  if (GAMEPLAY_ASSETS_READY) {
    scene.scene.start(targetKey, targetData || {});
    return;
  }
  if (GAME_STATE && GAME_STATE.hero && typeof persistPendingRunBootstrap === 'function') {
    persistPendingRunBootstrap(targetKey, targetData || {});
  }
  scene.scene.start('GamePreload', {
    target: targetKey,
    targetData: targetData || {},
  });
}

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    preloadBootMenuAssets(this);
  }

  create() {
    if (typeof restorePendingRunBootstrap === 'function') {
      const pendingRun = restorePendingRunBootstrap();
      if (pendingRun && pendingRun.targetKey && GAME_STATE && GAME_STATE.hero) {
        startSceneWithGameplayPreload(this, pendingRun.targetKey, pendingRun.targetData || {});
        return;
      }
    }
    this.scene.start('Menu');
  }
}

class GamePreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GamePreload' });
  }

  init(data) {
    this.nextTarget = data && data.target ? data.target : 'Overworld';
    this.nextTargetData = data && data.targetData ? data.targetData : {};
  }

  preload() {
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    this.add.rectangle(w / 2, h / 2, w, h, 0x0f172a);
    this.add.text(w / 2, h / 2 - 42, 'Loading game assets...', {
      fontSize: 28,
      color: '#fbbf24',
    }).setOrigin(0.5);
    const progressText = this.add.text(w / 2, h / 2 + 8, '0%', {
      fontSize: 18,
      color: '#e5e7eb',
    }).setOrigin(0.5);
    this.add.rectangle(w / 2, h / 2 + 58, 320, 18, 0x1e293b).setOrigin(0.5);
    const progressBar = this.add.rectangle(w / 2 - 156, h / 2 + 58, 0, 10, 0x22c55e).setOrigin(0, 0.5);
    this.load.on('progress', (value) => {
      const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
      progressText.setText(pct + '%');
      progressBar.width = 312 * value;
    });

    this.load.spritesheet('hero_sheet', 'assets/hero/vince-idle.png', {
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
    this.load.json('overworld-hotspots', 'assets/overworld/overworld-hotspots-800x600.json');
    [
      'settings-icon',
      'save-game-icon',
      'abandon-run-icon',
      'inventory-icon',
      'flee-icon',
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
    this.load.image('town-ui-background', 'assets/overworld/town-bg.png');
    this.load.image('blacksmith-ui-background', 'assets/overworld/blacksmith-bg.png');
    this.load.json('blacksmith-hotspots', 'assets/overworld/blacksmithscene-hotspots-800x600.json');
    this.load.image('shop-ui-background', 'assets/overworld/shop-with-buttons-bg.png');
    this.load.json('shop-landing-hotspots', 'assets/overworld/shop-with-buttons-bg-hotspots-800x600.json');
    this.load.image('buyandsell-ui-background', 'assets/overworld/buyandsellscene.png');
    this.load.json('buyandsell-hotspots', 'assets/overworld/buyandsellscene-hotspots-800x600.json');
    this.load.image('mine-ui-background', 'assets/overworld/mine-bg.png');
    this.load.json('mine-hotspots', 'assets/overworld/minescene-hotspots-800x600.json');
    this.load.image('alchemist-ui-background', 'assets/overworld/alchemist-bg.png');
    this.load.image('eventscene-ui-background', 'assets/ui/EventScene-bg.png');
    this.load.image('lootscene-ui-background', 'assets/ui/LootScene-bg.png');
    this.load.json('lootscene-hotspots', 'assets/ui/LootScene-bg-hotspots-800x600.json');
    this.load.image('overworld-ui-background', 'assets/overworld/overworld-bg-800x600-hotspots.png');
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
    soundEntries.forEach((e) => {
      if (this.cache && this.cache.audio && this.cache.audio.exists(e.key)) return;
      this.load.audio(e.key, e.path);
    });
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

  registerHeroIdleAnim() {
    return ensureHeroIdleAnimation(this, '[GamePreload]');
  }

  create() {
    GAMEPLAY_ASSETS_READY = true;
    this.scene.start(this.nextTarget || 'Overworld', this.nextTargetData || {});
  }
}
