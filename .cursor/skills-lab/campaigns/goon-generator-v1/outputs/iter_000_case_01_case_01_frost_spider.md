# Dry-run: iter_000 — case_01 — Frost Spider (goon-generator skill only)

Simulated agent actions limited to explicit instructions in `.cursor/skills/goon-generator/SKILL.md` and `.cursor/skills/goon-generator/reference.md`. Creature and data come from the test case.

---

## Phase 1: Read project context

Read these files before generating anything:

- `cursor.md`
- `GAME_DESIGN.md`
- `spritework.md`
- `src/config.js`

Note constants called out in the skill: `ENEMY_SPRITE_WIDTH: 120`, `ENEMY_SPRITE_HEIGHT: 150`, frame size `512x512` per goon spritesheet frame.

---

## Phase 2: Define the goon

| Field | Value |
|-------|-------|
| `goonType` | `'spider'` |
| Display name | `'Frost Spider'` |
| `hpMult` | `1.2` |
| `dmgMult` | `0.8` |
| Skill id | `'frost-web-skill'` |
| Skill schedule | `{ everyTurns: 3, firstUseTurn: 2 }` |
| Spawn weight | `12` |

Registries (per skill): `DUNGEON_GOON_NAMES`, `DUNGEON_GOON_PROFILES`, `DUNGEON_GOON_WEIGHTS` in `src/data/dungeon.js`. Skill definition in `src/data/enemySkills.js`.

---

## Phase 3: Generate static reference image

**Tool:** `GenerateImage` (no `reference_image_paths` unless restyling an existing goon).

**Prompt (reference template from skill / reference.md, placeholders filled):**

```
Realistic-looking pixel art of a Frost Spider for a dark-fantasy RPG game.
Single creature only, facing left (looking toward the left side of the image),
a large ice-covered spider with crystalline legs, glowing pale-blue eyes, frost particles drifting from its body, eight thin segmented legs with icy tips, dark blue-gray carapace coated in frost, thick black outline around the entire silhouette,
strong readable silhouette that works at small display sizes like 120x150 pixels,
perfectly centered composition on a bright solid green (#00FF00) background,
no text, no border, no extra objects, pixel art style with visible individual pixels,
limited color palette, dark fantasy aesthetic. The creature MUST face left.
```

**Clean command:**

```bash
npm run asset:clean -- --input <raw-image> --output assets/goons/spider-reference.png --canvas 512 --padding 20 --threshold 32
```

**Per skill:** If green fringe survives, raise `--threshold` to 36 or 40. Inspect the cleaned image before proceeding; creature must be centered, facing left, with no green halo.

---

## Phase 4: Generate idle sprite sheet

**Prompt rules applied (from skill):** Reference cleaned goon via `reference_image_paths` → `assets/goons/spider-reference.png`. Grid: exactly 2 rows of 4 frames (4 columns, 2 rows). NO divider lines or borders between frames. Bright solid green (#00FF00) background. All frames face left. Subtle idle: breathing, pulsing, body swaying (adapted to spider).

**Before processing:** Visually inspect the generated idle sheet. Every frame must face left (hood/head/eyes point toward the left edge). If any frame is mirrored or faces right, regenerate immediately.

**Tool:** `GenerateImage` with `reference_image_paths: ['assets/goons/spider-reference.png']`.

**Prompt (full idle template from reference.md, `[N]` = 8, grid 4×2):**

```
A pixel art sprite sheet showing exactly 8 frames of an idle breathing animation,
arranged in exactly 2 rows of 4 frames each (4 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Frost Spider creature FACING LEFT (looking toward the left side of the image).
Bright solid green (#00FF00) background with NO grid lines, NO borders, NO separators
between frames. Pixel art style with visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - Frost Spider in normal resting pose facing left.
Frame 2 - Frost Spider facing left, body slightly rising with a subtle inhale, frost particles drifting.
Frame 3 - Frost Spider facing left, peak of subtle swell / widest leg stance, frost wisps at peak.
Frame 4 - Frost Spider facing left, beginning to settle, legs easing back.

Row 2 (left to right):
Frame 5 - Frost Spider facing left, continuing return, slight carapace dip.
Frame 6 - Frost Spider facing left, slight compressed pose, delicate leg micro-adjustment.
Frame 7 - Frost Spider facing left, transitioning back toward rest, sway easing.
Frame 8 - Frost Spider facing left, back to normal resting pose.

All frames must maintain the same dark blue-gray frost-coated carapace, crystalline icy legs, pale-blue glowing eyes, black outline style. Every single frame the Frost Spider faces LEFT.
```

---

## Phase 5: Generate attack sprite sheet

**Prompt rules applied (from skill):** Reference `assets/goons/spider-reference.png`. Grid 3×2 (6 frames). NO divider lines. Green (#00FF00) background. Every frame must face left; repeat “facing left” in each frame description. Sequence: wind-up, peak, recovery. Attack/lunge direction toward the LEFT edge.

**Before processing:** Visually inspect the attack sheet. Lunge/strike in peak frames MUST go toward the LEFT edge. If any frame faces right, regenerate immediately.

**Tool:** `GenerateImage` with `reference_image_paths: ['assets/goons/spider-reference.png']`.

**Prompt (full attack template from reference.md, attack type = lunging bite):**

```
A pixel art sprite sheet showing exactly 6 frames of a lunging bite attack animation,
arranged in exactly 2 rows of 3 frames each (3 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Frost Spider creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - Frost Spider crouching low facing left, compressing body, mandibles tucked, preparing to lunge.
Frame 2 - Frost Spider facing left, wind-up: legs coiled, mandibles opening, body tensing toward a forward snap.
Frame 3 - Frost Spider facing left, peak of lunging bite: body launched forward toward the LEFT, mandibles extended in a snap, crystalline legs trailing.

Row 2 (left to right):
Frame 4 - Frost Spider facing left, follow-through after the snap, slight recoil from the lunge.
Frame 5 - Frost Spider facing left, pulling back along the same axis, recovering from the bite.
Frame 6 - Frost Spider facing left, returning to a low resting crouch.

All frames must maintain the same dark blue-gray frost-coated carapace, crystalline icy legs, pale-blue glowing eyes, black outline style. Every single frame
the Frost Spider faces LEFT.
```

---

## Phase 6: Process sprite sheets

**Commands (from skill / reference.md):**

```bash
node scripts/process-spritesheet.mjs <raw-idle-path> assets/goons/spider_idle_512x512_sheet.png 4 2
node scripts/process-spritesheet.mjs <raw-attack-path> assets/goons/spider_attack_512x512_sheet.png 3 2
```

**Verify output (exact snippet from SKILL.md Phase 6, `spider` substituted):**

```bash
node -e "const {PNG}=require('pngjs'),fs=require('fs'); for(const f of ['idle','attack']){const p='assets/goons/spider_'+f+'_512x512_sheet.png'; if(!fs.existsSync(p)){console.log(f,'MISSING');continue;} const d=PNG.sync.read(fs.readFileSync(p)); console.log(f,d.width+'x'+d.height,'=',(d.width/512),'frames');}"
```

**Per skill:** Both sheets must exist, have height 512, and width divisible by 512.

**Verify output (exact snippet from reference.md “Verification Snippet”, `goon` = `spider`):**

```bash
node -e "
const {PNG}=require('pngjs'),fs=require('fs');
const goon='spider';
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

**Per reference.md:** Every frame should have at least 30,000 opaque pixels; if any frame has fewer than 10,000, likely bad grid dimensions for `process-spritesheet.mjs`.

---

## Phase 7: Wire into codebase

### A. `src/scenes/BootScene.js` — `GamePreloadScene.preload()`

```js
this.load.spritesheet('spider_idle_sheet', 'assets/goons/spider_idle_512x512_sheet.png', { frameWidth: 512, frameHeight: 512 });
this.load.spritesheet('spider_attack_sheet', 'assets/goons/spider_attack_512x512_sheet.png', { frameWidth: 512, frameHeight: 512 });
```

### B. `src/scenes/BootScene.js` — `ENEMY_ANIMATIONS`

```js
{ sheetKey: 'spider_idle_sheet', animKey: 'spider_idle', frameRate: 20, repeat: -1 },
{ sheetKey: 'spider_attack_sheet', animKey: 'spider_attack', frameRate: 24, repeat: 0 },
```

### C. `src/scenes/CombatScene.js` — `getEnemyAnimationSet()` (before `return null`)

```js
if (enemy.goonType === 'spider') {
  return {
    idleSheetKey: 'spider_idle_sheet',
    idleAnimKey: 'spider_idle',
    attackSheetKey: 'spider_attack_sheet',
    attackAnimKey: 'spider_attack',
  };
}
```

### D. `src/scenes/CombatScene.js` — sprite creation chain (before `} else {` rectangle fallback)

```js
} else if (enemy.goonType === 'spider' && this.textures.exists('spider_idle_sheet') && this.anims.exists('spider_idle')) {
  const sprite = this.add.sprite(x, spriteY, 'spider_idle_sheet', 0).setDisplaySize(enemyW, enemyH);
  sprite.play('spider_idle');
  displayObj = sprite;
}
```

### E. `src/data/dungeon.js`

```js
// In DUNGEON_GOON_NAMES:
spider: 'Frost Spider',

// In DUNGEON_GOON_PROFILES:
spider: { hpMult: 1.2, dmgMult: 0.8, skills: [{ id: 'frost-web-skill', everyTurns: 3, firstUseTurn: 2 }] },

// In DUNGEON_GOON_WEIGHTS:
{ type: 'spider', weight: 12 },
```

### F. `src/data/enemySkills.js`

```js
'frost-web-skill': {
  id: 'frost-web-skill',
  name: 'Frost Web',
  effect: 'weakenHero',
  // effect-specific params (e.g. poisonRounds, poisonDamageFactor)
  useAttackAnimation: true,
},
```

---

## Phase 8: Update docs and validate

1. Add two rows to the Enemy spritesheets table in `spritework.md`:

```
| Frost Spider idle | `assets/goons/spider_idle_512x512_sheet.png` | `spider_idle_sheet` |
| Frost Spider attack | `assets/goons/spider_attack_512x512_sheet.png` | `spider_attack_sheet` |
```

2. Add a changelog entry to `changelog.md`.

3. Syntax checks:

```bash
node --check src/scenes/BootScene.js
node --check src/scenes/CombatScene.js
node --check src/data/dungeon.js
node --check src/data/enemySkills.js
```

4. Verify both PNGs exist on disk at `assets/goons/spider_idle_512x512_sheet.png` and `assets/goons/spider_attack_512x512_sheet.png`.

<!-- SCORES
{
  "scores": {
    "Attack Animation Quality": 50,
    "Facing Direction Enforcement": 40,
    "Green Cleanup Verification": 30,
    "Frame Count Adequacy": 35,
    "Phase Completeness": 80,
    "Prompt Adaptability": 45
  },
  "reasoning": {
    "Attack Animation Quality": "Template says facing-left per frame and body extended toward left, but no negative prompts, no anti-patterns called out, and 6 frames at 24fps gives only 0.25s which is too short for a spider lunge.",
    "Facing Direction Enforcement": "Says visually inspect and regenerate immediately, but no concrete criteria for what to look for on a spider, no retry count, no structural measures to prevent right-facing generation.",
    "Green Cleanup Verification": "Reference cleanup has threshold 32/36/40 guidance but zero post-processing green residue check after process-spritesheet.mjs; thin crystalline legs are high-risk for cleanup loss and this is unaddressed.",
    "Frame Count Adequacy": "Fixed 8 idle / 6 attack with no timing analysis; 0.25s attack is very short for a multi-leg lunging spider; no reasoning about why these counts or what trade-offs exist.",
    "Phase Completeness": "All 8 phases covered, all code insertion points present, both verification snippets included, data registration complete, docs and syntax checks listed.",
    "Prompt Adaptability": "Prompts fill in frost spider details but do not address thin-leg preservation risk during cleanup, multi-limb idle complexity, or spider-specific lunge direction challenges."
  }
}
-->
Weighted case score: 50*0.25 + 40*0.20 + 30*0.20 + 35*0.15 + 80*0.10 + 45*0.10 = 12.5 + 8.0 + 6.0 + 5.25 + 8.0 + 4.5 = **44.3**
