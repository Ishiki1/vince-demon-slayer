# Dry-run: Stone Golem (`golem`) — baseline (goon-generator skill only)

Simulated agent trace: only steps, prompts, commands, and code templates explicitly prescribed by `.cursor/skills/goon-generator/SKILL.md` and `.cursor/skills/goon-generator/reference.md`.

---

## Phase 1: Read Project Context

Read before generating anything:

- `cursor.md`
- `GAME_DESIGN.md`
- `spritework.md`
- `src/config.js`

Key constants noted from skill:

- `ENEMY_SPRITE_WIDTH: 120` / `ENEMY_SPRITE_HEIGHT: 150`
- Frame size: `512x512` per frame for all goon spritesheets

---

## Phase 2: Define the Goon

| Field | Value |
|-------|-------|
| `goonType` | `'golem'` |
| Display name | `'Stone Golem'` |
| `hpMult` | `2.0` |
| `dmgMult` | `0.7` |
| Skill id | `'quake-slam-skill'` |
| Skill effect | `clearHeroCombatBuffs` |
| Skill schedule | `{ everyTurns: 4, firstUseTurn: 3 }` |
| Spawn weight | `8` |

Registries (per skill): `DUNGEON_GOON_NAMES`, `DUNGEON_GOON_PROFILES`, `DUNGEON_GOON_WEIGHTS` in `src/data/dungeon.js`; skill definition in `src/data/enemySkills.js`.

---

## Phase 3: Generate Static Reference Image

**Tool:** `GenerateImage` (no `reference_image_paths` unless restyling an existing goon).

**Prompt:**

```
Realistic-looking pixel art of a Stone Golem for a dark-fantasy RPG game.
Single creature only, facing left (looking toward the left side of the image),
a massive humanoid of cracked granite and dark stone with glowing orange magma visible through the cracks, thick heavy limbs, broad shoulders, small glowing orange eyes, no neck with the head merging into the torso, chunks of rock floating near the shoulders, much larger and bulkier silhouette than a typical small monster, thick black outline around the entire silhouette,
strong readable silhouette that works at 120x150 display size, perfectly centered
on a bright solid green (#00FF00) background, no text, no border, no extra objects,
pixel art style with visible individual pixels, limited color palette,
dark fantasy aesthetic. The creature MUST face left.
```

**Clean:**

```bash
npm run asset:clean -- --input <raw-image> --output assets/goons/golem-reference.png --canvas 512 --padding 20 --threshold 32
```

If green fringe survives, raise `--threshold` to 36 or 40.

Inspect the cleaned image before proceeding. The creature must be centered, facing left, with no green halo.

---

## Phase 4: Generate Idle Sprite Sheet

**Tool:** `GenerateImage` with `reference_image_paths` pointing to the cleaned reference: `assets/goons/golem-reference.png`.

Prompt rules applied: reference image, exactly 2 rows of 4 frames each (4 columns, 2 rows), NO divider lines or borders, bright solid green (#00FF00) background, all frames face left, subtle idle motion (breathing, swaying, etc.).

**Prompt (from reference.md idle template, filled):**

```
A pixel art sprite sheet showing exactly 8 frames of an idle breathing animation,
arranged in exactly 2 rows of 4 frames each (4 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Stone Golem creature FACING LEFT (looking toward the left side of the image).
Bright solid green (#00FF00) background with NO grid lines, NO borders, NO separators
between frames. Pixel art style with visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - Stone Golem in normal resting pose facing left.
Frame 2 - Stone Golem facing left, body slightly swaying, floating shoulder rocks shift subtly.
Frame 3 - Stone Golem facing left, peak of slow inhale/swell, magma glow slightly brighter.
Frame 4 - Stone Golem facing left, beginning to return, chest and shoulders relaxing.

Row 2 (left to right):
Frame 5 - Stone Golem facing left, continuing return, slight backward sway.
Frame 6 - Stone Golem facing left, slightly compressed stance, rocks drifting inward a touch.
Frame 7 - Stone Golem facing left, transitioning back toward neutral.
Frame 8 - Stone Golem facing left, back to normal resting pose.

All frames must maintain the same cracked granite and dark stone with orange magma in the cracks, small orange eyes, floating rock chunks near shoulders, thick black outline style. Every single frame the Stone Golem faces LEFT.
```

**Before processing:** Visually inspect the generated idle sheet. Every frame must face left (hood/head/eyes point toward the left edge). If any frame is mirrored or faces right, regenerate immediately.

---

## Phase 5: Generate Attack Sprite Sheet

**Tool:** `GenerateImage` with `reference_image_paths`: `assets/goons/golem-reference.png`.

Prompt rules applied: 3x2 grid (6 frames), NO divider lines, green background, every frame faces left, attack sequence frame by frame (wind-up, peak, recovery), attack direction toward the LEFT edge.

**Prompt (from reference.md attack template, filled):**

```
A pixel art sprite sheet showing exactly 6 frames of a ground slam attack animation,
arranged in exactly 2 rows of 3 frames each (3 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Stone Golem creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - Stone Golem crouching low facing left, compressing body, preparing to attack.
Frame 2 - Stone Golem facing left, raising both massive fists overhead, body tensing, leaning slightly forward toward the left.
Frame 3 - Stone Golem facing left, slamming fists down into the ground toward the left, shockwave and scattered rocks/debris, peak of impact,
body fully extended toward the left.

Row 2 (left to right):
Frame 4 - Stone Golem facing left, follow-through, debris still scattering, recoiling from the slam.
Frame 5 - Stone Golem facing left, pulling back, slowly rising, recovering.
Frame 6 - Stone Golem facing left, returning to normal crouching pose.

All frames must maintain the same cracked granite and dark stone with orange magma in the cracks, small orange eyes, floating rock chunks near shoulders, thick black outline style. Every single frame
the Stone Golem faces LEFT.
```

**Before processing:** Visually inspect the generated attack sheet. The lunge/strike in the peak frames MUST go toward the LEFT edge. If any frame faces right, regenerate immediately. Do not process a right-facing attack sheet.

---

## Phase 6: Process Sprite Sheets

```bash
node scripts/process-spritesheet.mjs <raw-idle-path> assets/goons/golem_idle_512x512_sheet.png 4 2
node scripts/process-spritesheet.mjs <raw-attack-path> assets/goons/golem_attack_512x512_sheet.png 3 2
```

**Verify output:**

```bash
node -e "const {PNG}=require('pngjs'),fs=require('fs'); for(const f of ['idle','attack']){const p='assets/goons/golem_'+f+'_512x512_sheet.png'; if(!fs.existsSync(p)){console.log(f,'MISSING');continue;} const d=PNG.sync.read(fs.readFileSync(p)); console.log(f,d.width+'x'+d.height,'=',(d.width/512),'frames');}"
```

Both sheets must exist, have height 512, and width divisible by 512.

---

## Phase 7: Wire into Codebase

### A. `src/scenes/BootScene.js` — `GamePreloadScene.preload()`

```js
this.load.spritesheet('golem_idle_sheet', 'assets/goons/golem_idle_512x512_sheet.png', { frameWidth: 512, frameHeight: 512 });
this.load.spritesheet('golem_attack_sheet', 'assets/goons/golem_attack_512x512_sheet.png', { frameWidth: 512, frameHeight: 512 });
```

### B. `src/scenes/BootScene.js` — `ENEMY_ANIMATIONS`

```js
{ sheetKey: 'golem_idle_sheet', animKey: 'golem_idle', frameRate: 20, repeat: -1 },
{ sheetKey: 'golem_attack_sheet', animKey: 'golem_attack', frameRate: 24, repeat: 0 },
```

### C. `src/scenes/CombatScene.js` — `getEnemyAnimationSet()`

```js
if (enemy.goonType === 'golem') {
  return {
    idleSheetKey: 'golem_idle_sheet',
    idleAnimKey: 'golem_idle',
    attackSheetKey: 'golem_attack_sheet',
    attackAnimKey: 'golem_attack',
  };
}
```

### D. `src/scenes/CombatScene.js` — sprite creation chain in `create()`

```js
} else if (enemy.goonType === 'golem' && this.textures.exists('golem_idle_sheet') && this.anims.exists('golem_idle')) {
  const sprite = this.add.sprite(x, spriteY, 'golem_idle_sheet', 0).setDisplaySize(enemyW, enemyH);
  sprite.play('golem_idle');
  displayObj = sprite;
}
```

### E. `src/data/dungeon.js`

```js
// In DUNGEON_GOON_NAMES:
golem: 'Stone Golem',

// In DUNGEON_GOON_PROFILES:
golem: { hpMult: 2.0, dmgMult: 0.7, skills: [{ id: 'quake-slam-skill', everyTurns: 4, firstUseTurn: 3 }] },

// In DUNGEON_GOON_WEIGHTS:
{ type: 'golem', weight: 8 },
```

### F. `src/data/enemySkills.js`

```js
'quake-slam-skill': {
  id: 'quake-slam-skill',
  name: 'Quake Slam',
  effect: 'clearHeroCombatBuffs',
  useAttackAnimation: true,
},
```

---

## Phase 8: Update Docs and Validate

1. Add idle/attack rows to the Enemy spritesheets table in `spritework.md`:

```
| Stone Golem idle | `assets/goons/golem_idle_512x512_sheet.png` | `golem_idle_sheet` |
| Stone Golem attack | `assets/goons/golem_attack_512x512_sheet.png` | `golem_attack_sheet` |
```

2. Add a changelog entry to `changelog.md`.

3. Syntax check:

```bash
node --check src/scenes/BootScene.js
node --check src/scenes/CombatScene.js
node --check src/data/dungeon.js
node --check src/data/enemySkills.js
```

4. Verify both PNGs exist on disk at `assets/goons/golem_idle_512x512_sheet.png` and `assets/goons/golem_attack_512x512_sheet.png`.

---

## Skill checklist (as written in SKILL.md)

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
- [ ] Both PNG files exist at assets/goons/golem_(idle|attack)_512x512_sheet.png
- [ ] *(Optional, on request)* Playwright MCP video demo recorded and verified

<!-- SCORES
{
  "scores": {
    "Attack Animation Quality": 45,
    "Facing Direction Enforcement": 40,
    "Green Cleanup Verification": 30,
    "Frame Count Adequacy": 30,
    "Phase Completeness": 75,
    "Prompt Adaptability": 35
  },
  "reasoning": {
    "Attack Animation Quality": "Template forces crouching-low and body-extended-toward-left which fits lunges but not downward slams; a ground slam's direction is down-and-forward, not a horizontal lunge, making the template structurally awkward for melee-only attacks; no negative prompts.",
    "Facing Direction Enforcement": "Same vague visually inspect; no concrete criteria for what facing-left looks like on a symmetrical standing golem vs an asymmetric creature; no retry count.",
    "Green Cleanup Verification": "No post-processing green residue check; dark stone near black outline blending is unaddressed; missing the reference.md opaque-pixel verification snippet entirely in this dry-run.",
    "Frame Count Adequacy": "6 attack frames at 24fps = 0.25s for a massive golem slam is actively harmful; the weight and impact cannot read in a quarter second; no timing analysis, no creature-mass consideration, no trade-off discussion.",
    "Phase Completeness": "All 8 phases present and all code insertion points covered, but missing the detailed opaque-pixel verification snippet from reference.md.",
    "Prompt Adaptability": "Golem's massive proportions get no special sizing consideration; dark-on-dark outline risk unmentioned; slam attack poorly fits the lunge-oriented template; the skill assumes compact organic creatures."
  }
}
-->
Weighted case score: 45*0.25 + 40*0.20 + 30*0.20 + 30*0.15 + 75*0.10 + 35*0.10 = 11.25 + 8.0 + 6.0 + 4.5 + 7.5 + 3.5 = **40.8**
