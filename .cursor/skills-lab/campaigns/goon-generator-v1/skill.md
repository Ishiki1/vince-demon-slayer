---
name: goon-generator
description: Generates animated goon (enemy) sprites for Demon Slayer (Vince) combat. Handles the full pipeline from static reference art through idle and attack sprite sheet generation, green-background cleanup, 512x512 frame processing, Phaser preload/animation wiring, CombatScene sprite creation, dungeon data definitions, and doc updates. Use when creating new goons, enemies, dungeon creatures, or adding animated combat sprites.
---

# Goon Generator

## Quick Start

Use this skill when generating a new animated goon for combat. The pipeline produces two sprite sheets (idle + attack), wires them into Phaser, and registers the goon in the data layer.

Default workflow:

1. Read project docs.
2. Define the goon (type key, name, stats, skill, spawn weight).
3. Generate a static reference image -- **facing left**.
4. Generate an idle sprite sheet from the reference.
5. Generate an attack sprite sheet from the reference.
6. Process both sheets into 512x512-per-frame strips.
7. Wire preload, animations, sprite creation, and data.
8. Update docs and validate.

## Critical Rules

These were learned the hard way during the Plague Toad POC:

- **Goons MUST face left.** They spawn on the right side of combat and face the hero. Say "facing left" in every prompt. Say it twice.
- **VERIFY facing direction after EVERY generation.** Before processing any sprite sheet, visually inspect the generated image and confirm ALL frames face left. Attack sheets are especially prone to flipping -- the lunge/strike must go toward the LEFT edge. If any frame faces right, regenerate the sheet immediately. Do not process a sheet with wrong-facing frames.
- **NO divider lines in sprite sheets.** Image generators love adding black grid separators. Explicitly forbid them.
- **Green flood fill preserves interior green.** The cleanup script only removes border-connected green, so creatures with green markings keep their coloring.
- **Idle = 20fps loop, Attack = 24fps one-shot.** This is universal across all goons.
- **Both getEnemyAnimationSet AND the sprite creation chain need branches.** Forgetting either means the goon either renders as a rectangle or does not animate on attack.
- **Phaser auto-detects frame count.** `ensureGeneratedAnimation` reads frame count from the loaded texture. Do not hardcode frame numbers.

## Phase 1: Read Project Context

Read before generating anything:

- `cursor.md`
- `GAME_DESIGN.md`
- `spritework.md`
- `src/config.js`

Key constants:

- `ENEMY_SPRITE_WIDTH: 120` / `ENEMY_SPRITE_HEIGHT: 150`
- Frame size: `512x512` per frame for all goon spritesheets

## Phase 2: Define the Goon

Decide all data fields before generating art:

| Field | Example |
|-------|---------|
| `goonType` | `'toad'` |
| Display name | `'Plague Toad'` |
| `hpMult` | `1.5` |
| `dmgMult` | `0.6` |
| Skill id | `'toad-spit-skill'` |
| Skill schedule | `{ everyTurns: 3, firstUseTurn: 2 }` |
| Spawn weight | `15` |

Registries in `src/data/dungeon.js`:

- `DUNGEON_GOON_NAMES` -- `{ <goonType>: '<Display Name>' }`
- `DUNGEON_GOON_PROFILES` -- `{ <goonType>: { hpMult, dmgMult, skills: [{ id, everyTurns, firstUseTurn }] } }`
- `DUNGEON_GOON_WEIGHTS` -- `{ type: '<goonType>', weight: <number> }`

Skill definition in `src/data/enemySkills.js`:

```js
'<skill-id>': {
  id: '<skill-id>',
  name: '<Skill Name>',
  effect: '<effectHandler>',
  // effect-specific params (e.g. poisonRounds, poisonDamageFactor)
  useAttackAnimation: true,
},
```

## Phase 3: Generate Static Reference Image

Use the `GenerateImage` tool with `reference_image_paths` if restyling an existing goon.

Prompt template:

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

Clean the result:

```bash
npm run asset:clean -- --input <raw-image> --output assets/goons/<goon>-reference.png --canvas 512 --padding 20 --threshold 32
```

If green fringe survives, raise `--threshold` to 36 or 40.

Inspect the cleaned image before proceeding. The creature must be centered, facing left, with no green halo.

## Phase 4: Generate Idle Sprite Sheet

Generate a single image containing all idle animation frames in a grid.

Prompt rules:

- Reference the cleaned goon image via `reference_image_paths`.
- Request a specific grid: "exactly 2 rows of 4 frames each (4 columns, 2 rows)".
- Say "NO divider lines or borders between frames".
- Say "bright solid green (#00FF00) background".
- All frames face left.
- Describe subtle idle motion: breathing, pulsing, throat-sac inflating, body swaying.

Idle prompt template:

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

**Before processing:** Visually inspect the generated idle sheet. Every frame must face left (hood/head/eyes point toward the left edge). If any frame is mirrored or faces right, regenerate immediately.

## Phase 5: Generate Attack Sprite Sheet

Generate a single image containing all attack animation frames in a grid.

Prompt rules:

- Reference the cleaned goon image via `reference_image_paths`.
- Request a 3x2 grid (6 frames).
- Say "NO divider lines or borders between frames".
- Say "bright solid green (#00FF00) background".
- **Every frame** must face left -- repeat "facing left" in each frame description.
- Describe the attack sequence frame by frame: wind-up, action peak, recovery.
- Explicitly state the attack/lunge direction goes toward the LEFT edge.
- **Add negative prompts:** Include "The creature must NOT face right. The attack must NOT go toward the right side. Do NOT mirror or flip any frame." at the end of the prompt.
- **Add anti-pattern warning** in the prompt: "CRITICAL: attack animations are prone to accidental right-facing. Double-check that every frame's action goes LEFT."

Attack prompt template:

```
A pixel art sprite sheet showing exactly 6 frames of a [ATTACK TYPE] attack animation,
arranged in exactly 2 rows of 3 frames each (3 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
[CREATURE NAME] creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

CRITICAL DIRECTION RULE: The creature faces LEFT in ALL frames. The attack motion,
lunge, projectile, or strike goes TOWARD THE LEFT EDGE of the image. The creature
must NOT face right. The attack must NOT go toward the right side. Do NOT mirror
or flip any frame.

Row 1 (left to right):
Frame 1 - [creature] crouching low facing left, compressing body, preparing to attack.
Frame 2 - [creature] facing left, [describe wind-up, e.g. mouth opening, body tensing].
Frame 3 - [creature] facing left, [peak of attack, e.g. lunging, striking, spitting],
body fully extended toward the left. Attack goes LEFT, not right.

Row 2 (left to right):
Frame 4 - [creature] facing left, [follow-through, e.g. projectile in flight, recoiling].
Frame 5 - [creature] facing left, [pulling back, recovering].
Frame 6 - [creature] facing left, returning to normal crouching pose.

All frames must maintain the same [describe key visual traits]. Every single frame
the [creature] faces LEFT. No frame may face right.
```

**Before processing:** Visually inspect the generated attack sheet. This is the most common failure point -- attack animations frequently flip direction. The lunge/strike in the peak frames MUST go toward the LEFT edge. If any frame faces right, regenerate immediately. Do not process a right-facing attack sheet.

**Attack direction anti-patterns to watch for:**
- The creature's body or head turned to face the right edge
- A projectile, bolt, or lunge going toward the right side of the frame
- Frames 3-4 (peak/follow-through) mirrored compared to frames 1-2
- The creature "winding up" by leaning right (the wind-up should compress the body, not change facing)

## Phase 6: Process Sprite Sheets

Run the processing script for each raw sheet:

```bash
node scripts/process-spritesheet.mjs <raw-idle-path> assets/goons/<goon>_idle_512x512_sheet.png <cols> <rows>
node scripts/process-spritesheet.mjs <raw-attack-path> assets/goons/<goon>_attack_512x512_sheet.png <cols> <rows>
```

The script:

1. Flood-fill removes border-connected green.
2. Splits into grid cells by cols/rows.
3. Centers each cell's content in a 512x512 transparent frame.
4. Composites all frames into a single-row horizontal strip.

Verify the output:

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

Both sheets must exist, have height 512, and width divisible by 512.

### Green residue check

After processing, verify no green outline remains on the sprites. Run this check on both processed sheets:

```bash
node -e "
const {PNG}=require('pngjs'),fs=require('fs');
const goon='<GOON_TYPE>';
for(const anim of ['idle','attack']){
  const p='assets/goons/'+goon+'_'+anim+'_512x512_sheet.png';
  if(!fs.existsSync(p)){continue;}
  const d=PNG.sync.read(fs.readFileSync(p));
  let greenPx=0;
  for(let i=0;i<d.data.length;i+=4){
    const r=d.data[i],g=d.data[i+1],b=d.data[i+2],a=d.data[i+3];
    if(a>0 && g>200 && r<100 && b<100) greenPx++;
  }
  console.log(anim+': '+greenPx+' bright-green pixels detected');
}
"
```

**Acceptable:** 0 bright-green pixels (or a small count under 50 for creatures with intentional green markings).

**If green residue is found (>50 pixels on a non-green creature):**
1. Re-run `process-spritesheet.mjs` with the raw sheet that was cleaned at a higher threshold.
2. Or re-run `npm run asset:clean` on the raw sheet first with `--threshold 40` (or `48` for stubborn fringe), then re-process.
3. After remediation, re-run this green check to confirm the count is acceptable.

**Special case -- green-skinned creatures:** Creatures with intentionally green skin (e.g. goblins) will have high green pixel counts that are correct. For these creatures, visually inspect the processed frames instead: zoom into the creature outline and confirm there is no bright-green (#00FF00) halo between the creature edge and the transparent background. The flood-fill preserves interior green but border-connected green should be gone.

## Phase 7: Wire into Codebase

Five insertion points across four files. Use `<goon>` as the goonType string throughout.

### A. BootScene -- preload

In `src/scenes/BootScene.js`, inside `GamePreloadScene.preload()`, add near the other goon sheets:

```js
this.load.spritesheet('<goon>_idle_sheet', 'assets/goons/<goon>_idle_512x512_sheet.png', { frameWidth: 512, frameHeight: 512 });
this.load.spritesheet('<goon>_attack_sheet', 'assets/goons/<goon>_attack_512x512_sheet.png', { frameWidth: 512, frameHeight: 512 });
```

### B. BootScene -- ENEMY_ANIMATIONS

In the `ENEMY_ANIMATIONS` array at the top of `src/scenes/BootScene.js`, add:

```js
{ sheetKey: '<goon>_idle_sheet', animKey: '<goon>_idle', frameRate: 20, repeat: -1 },
{ sheetKey: '<goon>_attack_sheet', animKey: '<goon>_attack', frameRate: 24, repeat: 0 },
```

### C. CombatScene -- getEnemyAnimationSet

In `src/scenes/CombatScene.js`, add a branch inside `getEnemyAnimationSet()` before the `return null`:

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

### D. CombatScene -- sprite creation chain

In `src/scenes/CombatScene.js`, add a branch in the `create()` sprite if-else chain, BEFORE the rectangle fallback (`} else {`):

```js
} else if (enemy.goonType === '<goon>' && this.textures.exists('<goon>_idle_sheet') && this.anims.exists('<goon>_idle')) {
  const sprite = this.add.sprite(x, spriteY, '<goon>_idle_sheet', 0).setDisplaySize(enemyW, enemyH);
  sprite.play('<goon>_idle');
  displayObj = sprite;
}
```

**Gotcha:** The `plant` goon has a `getEnemyAnimationSet` branch but is missing from the sprite creation chain, so it falls to the rectangle fallback. Always add both.

### E. Data files (new goon types only)

- `src/data/dungeon.js`: add to `DUNGEON_GOON_NAMES`, `DUNGEON_GOON_PROFILES`, `DUNGEON_GOON_WEIGHTS`
- `src/data/enemySkills.js`: add the skill definition

```js
// In DUNGEON_GOON_NAMES:
<goon>: '<Display Name>',

// In DUNGEON_GOON_PROFILES:
<goon>: { hpMult: <number>, dmgMult: <number>, skills: [{ id: '<skill-id>', everyTurns: <n>, firstUseTurn: <n> }] },

// In DUNGEON_GOON_WEIGHTS:
{ type: '<goon>', weight: <number> },
```

Available effects: `clearHeroCombatBuffs`, `poisonHero`, `weakenHero`, `vulnerableHero`. Check `enemySkills.js` for parameter shapes for each effect.

## Phase 8: Update Docs and Validate

1. Add idle/attack rows to the Enemy spritesheets table in `spritework.md`.
2. Add a changelog entry to `changelog.md`.
3. Syntax check all touched files:

```bash
node --check src/scenes/BootScene.js
node --check src/scenes/CombatScene.js
node --check src/data/dungeon.js
node --check src/data/enemySkills.js
```

4. Verify both PNGs exist on disk.

Add two rows to spritework.md:

```
| <Name> idle | `assets/goons/<goon>_idle_512x512_sheet.png` | `<goon>_idle_sheet` |
| <Name> attack | `assets/goons/<goon>_attack_512x512_sheet.png` | `<goon>_attack_sheet` |
```

## Optional: Playwright MCP Animation Test

**Only run this when the user explicitly asks for a visual test or video demo.**

This uses the Playwright MCP (`project-0-Vince-playwright`) to launch the game in a browser, force a combat encounter with the new goon, and record video of both idle and attack animations.

Prerequisites: dev server running (`npm run dev` on port 3000).

Steps:

1. `browser_navigate` to `http://localhost:3000`. Wait 3 seconds for Phaser to load.
2. `browser_start_video` with `{ width: 800, height: 600 }`.
3. `browser_run_code` to inject game state -- create a hero, set `GAME_STATE.forcedEncounter` to force the goon, stop the current scene, and start Combat directly.

Force-encounter injection snippet (replace `<goon>` with the goonType string):

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

4. Wait 3 seconds for Combat scene to load assets.
5. `browser_take_screenshot` to verify the goon is visible and facing left.
6. Wait 5 seconds to capture idle animation in the video.
7. Calculate browser click coordinates from the sprite's game-space position. The canvas scales from 800x600 to the viewport size; use `browser_run_code` to read the canvas `getBoundingClientRect()` and the sprite's `x`/`y` from the Combat scene, then convert:
   - `browserX = canvasRect.x + spriteX * (canvasRect.width / 800)`
   - `browserY = canvasRect.y + spriteY * (canvasRect.height / 600)`

Read sprite position snippet:

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

8. `browser_mouse_click_xy` on the goon sprite to trigger a combat round (hero attacks, then goon attacks back with its attack animation).
9. Wait 3 seconds between clicks. Repeat 2-3 times to capture multiple attack cycles.
10. `browser_stop_video` with filename `<goon>-animation-demo.webm`.

What to verify from the recording and screenshots:

- Goon faces left throughout both animations.
- Idle loop is smooth and continuous between attacks.
- Attack animation plays on the goon's turn, then transitions back to idle.
- No visual glitches, missing frames, or sprite popping.

## AutoSprite (Future)

`scripts/autosprite-poc.mjs` is a ready-to-use MCP client for AutoSprite. It requires a paid subscription (Starter $12/mo minimum). If available, it replaces Phases 4-6 with API-driven animation generation:

```bash
node scripts/autosprite-poc.mjs <API_KEY> [CHARACTER_ID]
```

The MCP config lives at `.cursor/mcp.json`. The default workflow (image generation + `process-spritesheet.mjs`) works without any external API.

## Utility Scripts

| Script | Purpose |
|--------|---------|
| `scripts/process-spritesheet.mjs` | Green removal, grid split, 512x512 centering, strip compositing |
| `scripts/finalize-icon.mjs` | Clean single reference images from green background |
| `scripts/autosprite-poc.mjs` | AutoSprite MCP API client (paid plan only) |

## Naming Conventions

| Asset | Path | Texture key |
|-------|------|-------------|
| Reference (not preloaded) | `assets/goons/<goon>-reference.png` | -- |
| Idle sheet | `assets/goons/<goon>_idle_512x512_sheet.png` | `<goon>_idle_sheet` |
| Attack sheet | `assets/goons/<goon>_attack_512x512_sheet.png` | `<goon>_attack_sheet` |

Animation keys: `<goon>_idle` (20fps, repeat -1), `<goon>_attack` (24fps, repeat 0).

## Checklist

- [ ] Read project docs (cursor.md, GAME_DESIGN.md, spritework.md, config.js)
- [ ] Defined goonType, display name, combat profile, skill, spawn weight
- [ ] Generated reference image FACING LEFT on bright green background
- [ ] Cleaned reference image (no green halo, centered in 512x512)
- [ ] Generated idle sprite sheet (grid layout, no divider lines, all frames face left)
- [ ] **Verified idle sheet facing direction** -- all frames face left before processing
- [ ] Generated attack sprite sheet (grid layout, no divider lines, all frames face left)
- [ ] **Verified attack sheet facing direction** -- lunge/strike goes toward LEFT edge, no mirrored frames
- [ ] Processed both sheets through process-spritesheet.mjs
- [ ] Verified frame counts and opaque pixels per frame
- [ ] Added load.spritesheet() calls to BootScene GamePreloadScene.preload
- [ ] Added entries to ENEMY_ANIMATIONS array
- [ ] Added branch to getEnemyAnimationSet()
- [ ] Added branch to sprite creation if-else chain in CombatScene.create()
- [ ] Added data definitions (names, profiles, weights, skill) if new goon type
- [ ] Updated spritework.md Enemy spritesheets table
- [ ] Added changelog.md entry
- [ ] Ran node --check on all touched JS files
- [ ] Both PNG files exist at assets/goons/<goon>_(idle|attack)_512x512_sheet.png
- [ ] *(Optional, on request)* Playwright MCP video demo recorded and verified
