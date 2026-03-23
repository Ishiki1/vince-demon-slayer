# Goon Generator -- Reference

Prompt templates and code snippets for the goon generation pipeline. Read by the agent when it needs the full prompt text or exact insertion-point code.

---

## Prompt Templates

### Static Reference Image

```
Realistic-looking pixel art of a [CREATURE NAME] for a dark-fantasy RPG game.
Single creature only, facing left (looking toward the left side of the image),
[DESCRIBE CREATURE APPEARANCE -- body shape, coloring, distinguishing features,
any special markings or effects], thick black outline around the entire silhouette,
strong readable silhouette that works at small display sizes like 120x150 pixels,
perfectly centered composition on a bright solid green (#00FF00) background,
no text, no border, no extra objects, pixel art style with visible individual pixels,
limited color palette, dark fantasy aesthetic. The creature MUST face left.
```

### Idle Sprite Sheet

```
A pixel art sprite sheet showing exactly [N] frames of an idle breathing animation,
arranged in exactly [ROWS] rows of [COLS] frames each ([COLS] columns, [ROWS] rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
[CREATURE NAME] creature FACING LEFT (looking toward the left side of the image).
Bright solid green (#00FF00) background with NO grid lines, NO borders, NO separators
between frames. Pixel art style with visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - [creature] in normal resting pose facing left.
Frame 2 - [creature] facing left, body slightly [describe subtle motion, e.g. swelling].
Frame 3 - [creature] facing left, [peak of motion, e.g. maximum inhale].
Frame 4 - [creature] facing left, [beginning to return, e.g. deflating].

Row 2 (left to right):
Frame 5 - [creature] facing left, [continuing return].
Frame 6 - [creature] facing left, [slightly compressed or alternate subtle pose].
Frame 7 - [creature] facing left, [transitioning back].
Frame 8 - [creature] facing left, back to normal resting pose.

All frames must maintain the same [describe key visual traits -- colors, markings, eyes,
outline style]. Every single frame the [creature] faces LEFT.
```

### Attack Sprite Sheet

```
A pixel art sprite sheet showing exactly 6 frames of a [ATTACK TYPE] attack animation,
arranged in exactly 2 rows of 3 frames each (3 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
[CREATURE NAME] creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - [creature] crouching low facing left, compressing body, preparing to attack.
Frame 2 - [creature] facing left, [describe wind-up, e.g. mouth opening, body tensing].
Frame 3 - [creature] facing left, [peak of attack, e.g. lunging, striking, spitting],
body fully extended toward the left.

Row 2 (left to right):
Frame 4 - [creature] facing left, [follow-through, e.g. projectile in flight, recoiling].
Frame 5 - [creature] facing left, [pulling back, recovering].
Frame 6 - [creature] facing left, returning to normal crouching pose.

All frames must maintain the same [describe key visual traits]. Every single frame
the [creature] faces LEFT.
```

---

## Processing Commands

### Clean reference image

```bash
npm run asset:clean -- --input <raw-path> --output assets/goons/<goon>-reference.png --canvas 512 --padding 20 --threshold 32
```

### Process idle sheet

```bash
node scripts/process-spritesheet.mjs <raw-idle-path> assets/goons/<goon>_idle_512x512_sheet.png 4 2
```

### Process attack sheet

```bash
node scripts/process-spritesheet.mjs <raw-attack-path> assets/goons/<goon>_attack_512x512_sheet.png 3 2
```

---

## Verification Snippet

Run after processing to confirm both sheets are valid:

```bash
node -e "
const {PNG}=require('pngjs'),fs=require('fs');
const goon='<GOON_TYPE>';
for(const anim of ['idle','attack']){
  const p='assets/goons/'+goon+'_'+anim+'_512x512_sheet.png';
  if(!fs.existsSync(p)){console.log(anim,'MISSING');continue;}
  const d=PNG.sync.read(fs.readFileSync(p));
  const frames=d.width/512;
  console.log(anim+':',d.width+'x'+d.height,'=',frames,'frames');
  for(let f=0;f<frames;f++){
    let px=0;
    for(let y=0;y<512;y++) for(let x=0;x<512;x++)
      if(d.data[((y*d.width+f*512+x)*4)+3]>0) px++;
    console.log('  Frame '+f+': '+px+' opaque pixels');
  }
}
"
```

Every frame should have at least 30,000 opaque pixels. If any frame has fewer than 10,000, it likely failed to extract properly -- check the grid dimensions passed to `process-spritesheet.mjs`.

---

## Wiring Code Templates

Replace `<goon>` with the actual goonType string (e.g. `toad`, `spider`, `mushroom`).

### BootScene -- GamePreloadScene.preload()

Insert near the other goon `load.spritesheet` calls:

```js
this.load.spritesheet('<goon>_idle_sheet', 'assets/goons/<goon>_idle_512x512_sheet.png', { frameWidth: 512, frameHeight: 512 });
this.load.spritesheet('<goon>_attack_sheet', 'assets/goons/<goon>_attack_512x512_sheet.png', { frameWidth: 512, frameHeight: 512 });
```

### BootScene -- ENEMY_ANIMATIONS array

Insert near other goon entries:

```js
{ sheetKey: '<goon>_idle_sheet', animKey: '<goon>_idle', frameRate: 20, repeat: -1 },
{ sheetKey: '<goon>_attack_sheet', animKey: '<goon>_attack', frameRate: 24, repeat: 0 },
```

### CombatScene -- getEnemyAnimationSet()

Insert before `return null`:

```js
if (enemy.goonType === '<goon>') {
  return {
    idleSheetKey: '<goon>_idle_sheet',
    idleAnimKey: '<goon>_idle',
    attackSheetKey: '<goon>_attack_sheet',
    attackAnimKey: '<goon>_attack',
  };
}
```

### CombatScene -- sprite creation chain in create()

Insert BEFORE the `} else {` rectangle fallback:

```js
} else if (enemy.goonType === '<goon>' && this.textures.exists('<goon>_idle_sheet') && this.anims.exists('<goon>_idle')) {
  const sprite = this.add.sprite(x, spriteY, '<goon>_idle_sheet', 0).setDisplaySize(enemyW, enemyH);
  sprite.play('<goon>_idle');
  displayObj = sprite;
}
```

### dungeon.js -- goon data (new goon types only)

```js
// In DUNGEON_GOON_NAMES:
<goon>: '<Display Name>',

// In DUNGEON_GOON_PROFILES:
<goon>: { hpMult: <number>, dmgMult: <number>, skills: [{ id: '<skill-id>', everyTurns: <n>, firstUseTurn: <n> }] },

// In DUNGEON_GOON_WEIGHTS:
{ type: '<goon>', weight: <number> },
```

### enemySkills.js -- skill definition (new skills only)

```js
'<skill-id>': {
  id: '<skill-id>',
  name: '<Skill Display Name>',
  effect: '<effectHandler>',
  useAttackAnimation: true,
},
```

Available effects: `clearHeroCombatBuffs`, `poisonHero`, `weakenHero`, `vulnerableHero`. Check `enemySkills.js` for parameter shapes for each effect.

---

## Playwright MCP Animation Test (Optional -- on user request only)

### Force-encounter injection snippet

Use with `browser_run_code`. Replace `<goon>` with the goonType string.

```js
async (page) => {
  return await page.evaluate(() => {
    GAME_STATE.hero = createHero('warrior');
    GAME_STATE.hero.level = 5;
    GAME_STATE.hero.currentHealth = GAME_STATE.hero.getEffectiveHealth();
    GAME_STATE.hero.currentMana = GAME_STATE.hero.getEffectiveMana();
    GAME_STATE.forcedEncounter = { type: 'dungeonGoon', goonType: '<goon>', heroLevel: 5 };
    const active = window.game.scene.getScenes(true).map(s => s.scene.key);
    active.forEach(k => window.game.scene.stop(k));
    window.game.scene.start('Combat');
    return { hero: GAME_STATE.hero.name, encounter: GAME_STATE.forcedEncounter };
  });
}
```

### Read sprite position from Combat scene

Use with `browser_run_code` after Combat scene has loaded:

```js
async (page) => {
  return await page.evaluate(() => {
    const scene = window.game.scene.getScene('Combat');
    const sprites = scene.enemySprites || [];
    const canvas = document.querySelector('canvas');
    const rect = canvas.getBoundingClientRect();
    return {
      sprites: sprites.map(s => ({ x: s.x, y: s.y, w: s.displayWidth, h: s.displayHeight })),
      canvas: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      game: { w: canvas.width, h: canvas.height }
    };
  });
}
```

Then compute browser click coordinates:

```
browserX = canvas.x + sprite.x * (canvas.w / game.w)
browserY = canvas.y + sprite.y * (canvas.h / game.h)
```

### Full test sequence

1. `browser_navigate` -- `http://localhost:3000`
2. `browser_wait_for` -- 3 seconds
3. `browser_start_video` -- `{ size: { width: 800, height: 600 } }`
4. `browser_run_code` -- force-encounter snippet above
5. `browser_wait_for` -- 3 seconds (asset preload)
6. `browser_take_screenshot` -- verify goon visible, facing left
7. `browser_wait_for` -- 5 seconds (capture idle loop in video)
8. `browser_run_code` -- read sprite position snippet above
9. Compute browser click coordinates
10. `browser_mouse_click_xy` -- click on goon (triggers hero turn then enemy attack)
11. `browser_wait_for` -- 3 seconds
12. Repeat click + wait 2-3 more times for multiple attack cycles
13. `browser_take_screenshot` -- verify HP changes and combat log
14. `browser_stop_video` -- `{ filename: '<goon>-animation-demo.webm' }`

### spritework.md -- Enemy spritesheets table

Add two rows:

```
| <Name> idle | `assets/goons/<goon>_idle_512x512_sheet.png` | `<goon>_idle_sheet` |
| <Name> attack | `assets/goons/<goon>_attack_512x512_sheet.png` | `<goon>_attack_sheet` |
```
