# Dry-run: iter_000 — case_02_goblin_shaman

Simulated agent output when following **only** `.cursor/skills/goon-generator/SKILL.md` and `.cursor/skills/goon-generator/reference.md` (no extra steps).

---

## Phase 1: Read Project Context

Per skill, read before generating anything:

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
| `goonType` | `'shaman'` |
| Display name | `'Goblin Shaman'` |
| `hpMult` | `0.9` |
| `dmgMult` | `1.1` |
| Skill id | `'hex-bolt-skill'` |
| Skill schedule | `{ everyTurns: 2, firstUseTurn: 1 }` |
| Spawn weight | `10` |

Registries to update (per skill): `src/data/dungeon.js` — `DUNGEON_GOON_NAMES`, `DUNGEON_GOON_PROFILES`, `DUNGEON_GOON_WEIGHTS`.

Skill definition (per skill): `src/data/enemySkills.js` — effect `'vulnerableHero'` (parameter shapes per existing entries in that file).

---

## Phase 3: Generate Static Reference Image

**Tool:** `GenerateImage` (per skill). `reference_image_paths` omitted (new goon).

**Prompt (skill template, placeholders filled):**

```
Realistic-looking pixel art of a Goblin Shaman for a dark-fantasy RPG game.
Single creature only, facing left (looking toward the left side of the image),
a hunched green-skinned goblin wearing a tattered robe and bone necklace, clutching a gnarled wooden staff topped with a glowing purple crystal, yellow eyes, pointed ears, sharp teeth visible in a snarl, the staff crystal emits faint purple wisps of magical energy, thick black outline around the entire silhouette,
strong readable silhouette that works at 120x150 display size, perfectly centered
on a bright solid green (#00FF00) background, no text, no border, no extra objects,
pixel art style with visible individual pixels, limited color palette,
dark fantasy aesthetic. The creature MUST face left.
```

**Clean (skill command):**

```bash
npm run asset:clean -- --input <raw-image> --output assets/goons/shaman-reference.png --canvas 512 --padding 20 --threshold 32
```

Per skill: if green fringe survives, raise `--threshold` to 36 or 40.

Per skill: inspect the cleaned image before proceeding — creature centered, facing left, no green halo.

Per skill **Critical Rules** (quoted only; no additional procedure): *"Green flood fill preserves interior green."* The skill does not mention green-skinned creatures on `#00FF00` background or threshold tuning for that case beyond fringe / 36 / 40.

---

## Phase 4: Generate Idle Sprite Sheet

Per skill:

- Reference the cleaned goon image via `reference_image_paths`.
- Grid: exactly 2 rows of 4 frames each (4 columns, 2 rows).
- Say NO divider lines or borders between frames.
- Say bright solid green (#00FF00) background.
- All frames face left.
- Describe subtle idle motion: breathing, swaying (skill); skill also defers to reference.md for full template.

**Prompt (reference.md idle template, filled):**

```
A pixel art sprite sheet showing exactly 8 frames of an idle breathing animation,
arranged in exactly 2 rows of 4 frames each (4 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Goblin Shaman creature FACING LEFT (looking toward the left side of the image).
Bright solid green (#00FF00) background with NO grid lines, NO borders, NO separators
between frames. Pixel art style with visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - Goblin Shaman in normal resting pose facing left.
Frame 2 - Goblin Shaman facing left, body slightly swaying and robe shifting with breathing.
Frame 3 - Goblin Shaman facing left, chest lifted, slight peak of inhale, crystal glow a bit brighter.
Frame 4 - Goblin Shaman facing left, beginning to exhale, crystal glow easing.

Row 2 (left to right):
Frame 5 - Goblin Shaman facing left, continuing exhale, subtle slump.
Frame 6 - Goblin Shaman facing left, slightly compressed posture mid-breath.
Frame 7 - Goblin Shaman facing left, transitioning back toward neutral.
Frame 8 - Goblin Shaman facing left, back to normal resting pose.

All frames must maintain the same hunched green-skinned goblin, tattered robe, bone necklace, gnarled staff with purple crystal and faint wisps, yellow eyes, thick black outline style. Every single frame the Goblin Shaman faces LEFT.
```

**Before processing (skill):** Visually inspect the generated idle sheet. Every frame must face left (hood/head/eyes point toward the left edge). If any frame is mirrored or faces right, regenerate immediately.

The skill does not specify how many regeneration attempts, what zoom or criteria to use for “visually inspect,” or explicit held-item consistency across frames.

---

## Phase 5: Generate Attack Sprite Sheet

Per skill:

- Reference the cleaned goon image via `reference_image_paths`.
- 3x2 grid (6 frames).
- NO divider lines or borders between frames.
- Bright solid green (#00FF00) background.
- Every frame must face left; describe attack frame by frame: wind-up, action peak, recovery.
- Attack/lunge direction toward the LEFT edge.

**Prompt (reference.md attack template, filled):**

```
A pixel art sprite sheet showing exactly 6 frames of a spell cast attack animation,
arranged in exactly 2 rows of 3 frames each (3 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Goblin Shaman creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - Goblin Shaman crouching low facing left, compressing body, preparing to attack, staff low.
Frame 2 - Goblin Shaman facing left, raising staff high, crystal beginning to flare with energy.
Frame 3 - Goblin Shaman facing left, peak of attack: crystal flares bright, a bolt of purple magic fires from the staff tip toward the LEFT, body fully committed toward the left.

Row 2 (left to right):
Frame 4 - Goblin Shaman facing left, bolt traveling toward the LEFT edge of the frame, shaman staggering back slightly from recoil.
Frame 5 - Goblin Shaman facing left, pulling back, recovering from recoil, staff lowering.
Frame 6 - Goblin Shaman facing left, returning to normal crouching pose.

All frames must maintain the same hunched green-skinned goblin, tattered robe, bone necklace, gnarled staff with purple crystal, yellow eyes, thick black outline style. Every single frame
the Goblin Shaman faces LEFT.
```

**Before processing (skill):** Visually inspect the generated attack sheet — lunge/strike in peak frames MUST go toward the LEFT edge. If any frame faces right, regenerate immediately. Do not process a right-facing attack sheet.

The skill templates do not include negative prompts (e.g. what not to draw). No explicit retry count. No separate “held staff” consistency checklist beyond generic “same key visual traits.”

---

## Phase 6: Process Sprite Sheets

**Commands (skill):**

```bash
node scripts/process-spritesheet.mjs <raw-idle-path> assets/goons/shaman_idle_512x512_sheet.png 4 2
node scripts/process-spritesheet.mjs <raw-attack-path> assets/goons/shaman_attack_512x512_sheet.png 3 2
```

Per skill, the script: (1) flood-fill removes border-connected green, (2) splits grid, (3) centers each cell in 512x512, (4) composites horizontal strip.

**Verify (skill Phase 6 snippet, `<goon>` = `shaman`):**

```bash
node -e "const {PNG}=require('pngjs'),fs=require('fs'); for(const f of ['idle','attack']){const p='assets/goons/shaman_'+f+'_512x512_sheet.png'; if(!fs.existsSync(p)){console.log(f,'MISSING');continue;} const d=PNG.sync.read(fs.readFileSync(p)); console.log(f,d.width+'x'+d.height,'=',(d.width/512),'frames');}"
```

Both sheets must exist, have height 512, and width divisible by 512.

**Verify (reference.md “Verification Snippet” — skill checklist references opaque pixels per frame):**

```bash
node -e "
const {PNG}=require('pngjs'),fs=require('fs');
const goon='shaman';
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

Per reference.md: every frame should have at least 30,000 opaque pixels; fewer than 10,000 suggests grid/process failure.

The skill does not instruct a green-residue or chroma check on processed frames.

---

## Phase 7: Wire into Codebase

`<goon>` = `shaman` throughout.

### A. `src/scenes/BootScene.js` — `GamePreloadScene.preload()`

```js
this.load.spritesheet('shaman_idle_sheet', 'assets/goons/shaman_idle_512x512_sheet.png', { frameWidth: 512, frameHeight: 512 });
this.load.spritesheet('shaman_attack_sheet', 'assets/goons/shaman_attack_512x512_sheet.png', { frameWidth: 512, frameHeight: 512 });
```

### B. `src/scenes/BootScene.js` — `ENEMY_ANIMATIONS`

```js
{ sheetKey: 'shaman_idle_sheet', animKey: 'shaman_idle', frameRate: 20, repeat: -1 },
{ sheetKey: 'shaman_attack_sheet', animKey: 'shaman_attack', frameRate: 24, repeat: 0 },
```

### C. `src/scenes/CombatScene.js` — `getEnemyAnimationSet()`

```js
if (enemy.goonType === 'shaman') {
  return {
    idleSheetKey: 'shaman_idle_sheet',
    idleAnimKey: 'shaman_idle',
    attackSheetKey: 'shaman_attack_sheet',
    attackAnimKey: 'shaman_attack',
  };
}
```

### D. `src/scenes/CombatScene.js` — sprite creation chain (before rectangle fallback)

```js
} else if (enemy.goonType === 'shaman' && this.textures.exists('shaman_idle_sheet') && this.anims.exists('shaman_idle')) {
  const sprite = this.add.sprite(x, spriteY, 'shaman_idle_sheet', 0).setDisplaySize(enemyW, enemyH);
  sprite.play('shaman_idle');
  displayObj = sprite;
}
```

### E. `src/data/dungeon.js`

Per skill / reference.md shapes:

```js
// In DUNGEON_GOON_NAMES:
shaman: 'Goblin Shaman',

// In DUNGEON_GOON_PROFILES:
shaman: { hpMult: 0.9, dmgMult: 1.1, skills: [{ id: 'hex-bolt-skill', everyTurns: 2, firstUseTurn: 1 }] },

// In DUNGEON_GOON_WEIGHTS:
{ type: 'shaman', weight: 10 },
```

### F. `src/data/enemySkills.js` (new skill — skill template + effect params per file convention for `vulnerableHero`)

```js
'hex-bolt-skill': {
  id: 'hex-bolt-skill',
  name: 'Hex Bolt',
  effect: 'vulnerableHero',
  vulnerableRounds: 2,
  vulnerableFactor: 0.25,
  useAttackAnimation: true,
},
```

---

## Phase 8: Update Docs and Validate

1. Add idle/attack rows to the Enemy spritesheets table in `spritework.md` (reference.md table format):

```
| Goblin Shaman idle | `assets/goons/shaman_idle_512x512_sheet.png` | `shaman_idle_sheet` |
| Goblin Shaman attack | `assets/goons/shaman_attack_512x512_sheet.png` | `shaman_attack_sheet` |
```

2. Add a changelog entry to `changelog.md`.

3. Syntax check (skill):

```bash
node --check src/scenes/BootScene.js
node --check src/scenes/CombatScene.js
node --check src/data/dungeon.js
node --check src/data/enemySkills.js
```

4. Verify both PNGs exist on disk at `assets/goons/shaman_idle_512x512_sheet.png` and `assets/goons/shaman_attack_512x512_sheet.png`.

**Not included:** Optional Playwright MCP animation test (skill: only when user explicitly asks).

**Not included:** AutoSprite / `scripts/autosprite-poc.mjs` (skill: future / paid alternative).

<!-- SCORES
{
  "scores": {
    "Attack Animation Quality": 50,
    "Facing Direction Enforcement": 40,
    "Green Cleanup Verification": 25,
    "Frame Count Adequacy": 35,
    "Phase Completeness": 80,
    "Prompt Adaptability": 35
  },
  "reasoning": {
    "Attack Animation Quality": "Spell cast prompt includes bolt firing toward the LEFT with facing-left per frame, but no negative prompts, no anti-patterns, and 6 frames at 24fps is only 0.25s for a spell cast sequence that needs visual time for crystal flare and bolt travel.",
    "Facing Direction Enforcement": "Same vague visually inspect instruction as all cases; no concrete criteria, no retry count, no structural prevention for right-facing projectile generation.",
    "Green Cleanup Verification": "Worst case scenario: green goblin on green background gets zero special handling; skill only mentions interior green preservation as a rule but provides no threshold guidance or verification for green-skinned creatures; no post-processing green residue check exists.",
    "Frame Count Adequacy": "Same fixed 8/6 counts; spell cast with crystal flare plus bolt plus recoil needs more visual time than 0.25s to read clearly.",
    "Phase Completeness": "All 8 phases covered, all code insertion points present, enemy skill correctly uses vulnerableHero with params, both verification snippets included.",
    "Prompt Adaptability": "Prompts fill in goblin shaman details but completely miss the green-on-green edge case and held-item consistency; staff consistency across frames relies only on generic same key visual traits instruction which is insufficient."
  }
}
-->
Weighted case score: 50*0.25 + 40*0.20 + 25*0.20 + 35*0.15 + 80*0.10 + 35*0.10 = 12.5 + 8.0 + 5.0 + 5.25 + 8.0 + 3.5 = **42.3**
