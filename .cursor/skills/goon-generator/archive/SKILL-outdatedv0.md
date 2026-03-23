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
[DESCRIBE APPEARANCE], thick black outline around the entire silhouette,
strong readable silhouette that works at 120x150 display size, perfectly centered
on a bright solid green (#00FF00) background, no text, no border, no extra objects,
pixel art style with visible individual pixels, limited color palette,
dark fantasy aesthetic. The creature MUST face left.
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

See [reference.md](reference.md) for the full idle prompt template.

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

See [reference.md](reference.md) for the full attack prompt template.

**Before processing:** Visually inspect the generated attack sheet. This is the most common failure point -- attack animations frequently flip direction. The lunge/strike in the peak frames MUST go toward the LEFT edge. If any frame faces right, regenerate immediately. Do not process a right-facing attack sheet.

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
node -e "const {PNG}=require('pngjs'),fs=require('fs'); for(const f of ['idle','attack']){const p='assets/goons/<goon>_'+f+'_512x512_sheet.png'; if(!fs.existsSync(p)){console.log(f,'MISSING');continue;} const d=PNG.sync.read(fs.readFileSync(p)); console.log(f,d.width+'x'+d.height,'=',(d.width/512),'frames');}"
```

Both sheets must exist, have height 512, and width divisible by 512.

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

## Optional: Playwright MCP Animation Test

**Only run this when the user explicitly asks for a visual test or video demo.**

This uses the Playwright MCP (`project-0-Vince-playwright`) to launch the game in a browser, force a combat encounter with the new goon, and record video of both idle and attack animations.

Prerequisites: dev server running (`npm run dev` on port 3000).

Steps:

1. `browser_navigate` to `http://localhost:3000`. Wait 3 seconds for Phaser to load.
2. `browser_start_video` with `{ width: 800, height: 600 }`.
3. `browser_run_code` to inject game state -- create a hero, set `GAME_STATE.forcedEncounter` to force the goon, stop the current scene, and start Combat directly. See [reference.md](reference.md) for the full injection snippet.
4. Wait 3 seconds for Combat scene to load assets.
5. `browser_take_screenshot` to verify the goon is visible and facing left.
6. Wait 5 seconds to capture idle animation in the video.
7. Calculate browser click coordinates from the toad's game-space position. The canvas scales from 800x600 to the viewport size; use `browser_run_code` to read the canvas `getBoundingClientRect()` and the sprite's `x`/`y` from the Combat scene, then convert:
   - `browserX = canvasRect.x + spriteX * (canvasRect.width / 800)`
   - `browserY = canvasRect.y + spriteY * (canvasRect.height / 600)`
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
