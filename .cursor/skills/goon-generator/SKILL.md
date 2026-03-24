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
- **Idle = 20fps loop, Attack = 24fps one-shot.** This is universal across all goons. Idle: 12 frames at 20fps = 0.6s loop. Attack: 12 frames at 24fps = 0.5s one-shot -- enough for wind-up, peak, and recovery to read clearly with smooth motion.
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

### Creature-Specific Adaptations

Before generating art, identify which of these edge cases apply to the new creature and plan accordingly:

| Creature trait | Risk | Mitigation |
|---|---|---|
| **Green/teal coloring** (goblins, slimes, plant creatures) | Green skin blends with #00FF00 background during cleanup | **Use magenta (#FF00FF) background instead of green.** In reference and sprite sheet prompts, replace "green (#00FF00) background" with "bright solid magenta (#FF00FF) background". Process with `--hueLo 270 --hueHi 330` to target magenta. If magenta is not viable, use narrow green hue: `--hueLo 100 --hueHi 140 --satMin 0.5` to target only pure bright green. Visually inspect creature outline for halo after processing. |
| **Thin limbs or fine detail** (spiders, insects, skeletal creatures) | Thin legs/antennae get eaten by aggressive flood-fill or spill suppression | Use conservative cleanup: `--spillPasses 1 --matteRadius 1`. After processing, zoom into thin features and confirm they survived with black outline intact. If limbs are lost, try `--spillPasses 0 --matteRadius 0` for zero edge erosion. |
| **Dark coloring near black** (stone golems, shadow creatures, dark metal) | Dark body blends with outline; green fringe is highly visible on dark edges | In the prompt, request "clearly visible thick black outline that contrasts with the dark body." Process with extra spill passes: `--spillPasses 3`. Verify: (1) no green fringe on any dark edge, (2) outline distinguishable from body at display size. |
| **Held items** (staffs, weapons, shields, orbs) | Items disappear, swap hands, or change position between frames | In every frame description, mention the held item and which hand holds it. Add to the closing line: "The [item] must appear in every frame in the [left/right] hand." |
| **Massive/unusual proportions** (golems, giants, dragons) | Creature may not read well at 120x150 display size; standard framing may clip extremities | In the reference prompt, emphasize "the creature fits entirely within the frame with no clipping." Consider whether the silhouette is recognizable at small display size. |
| **Melee/slam attacks** (no projectile) | The attack template assumes horizontal lunge; vertical slams need different motion description | Describe the slam as "leaning forward toward the LEFT while striking downward" so the leftward direction is clear even in a vertical motion. |
| **Spell/projectile attacks** | Projectile direction is the most common facing failure | In the attack prompt, explicitly describe the projectile's path: "the [spell/bolt] travels from the [creature] toward the LEFT edge of the frame." |
| **Combined: dark + thin** (dark spiders, shadow insects) | Dark edges need extra spill passes but thin limbs need fewer | Use `--spillPasses 2 --matteRadius 1` as a compromise. If green fringe remains on the body, manually inspect thin limbs after each spill pass increase. Prefer `--spillPasses 2` over `3` to protect limbs. |
| **Combined: green + thin** (plant tendrils, vine creatures) | Green creature needs magenta bg but thin features need conservative cleanup | Use magenta background + `--hueLo 270 --hueHi 330 --spillPasses 1 --matteRadius 1`. Magenta removal is less aggressive on thin features than green removal. |

## Phase 3: Generate Static Reference Image

Use the `GenerateImage` tool with `reference_image_paths` if restyling an existing goon.

**Background color decision:** Before writing the prompt, decide the background color based on the creature's coloring:
- **Default (most creatures):** Use bright solid green (#00FF00) background.
- **Green/teal/olive creatures:** Use bright solid magenta (#FF00FF) background to avoid green-on-green conflicts.

Prompt template (green background -- default):

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

Prompt template (magenta background -- for green creatures):

```
Realistic-looking pixel art of a [CREATURE NAME] for a dark-fantasy RPG game.
Single creature only, facing left (looking toward the left side of the image),
[DESCRIBE CREATURE APPEARANCE -- body shape, coloring, distinguishing features,
any special markings or effects], thick black outline around the entire silhouette,
strong readable silhouette that works at small display sizes like 120x150 pixels,
perfectly centered composition on a bright solid magenta (#FF00FF) background,
no text, no border, no extra objects, pixel art style with visible individual pixels,
limited color palette, dark fantasy aesthetic. The creature MUST face left.
```

Clean the result:

```bash
# Green background (default):
npm run asset:clean -- --input <raw-image> --output assets/goons/<goon>-reference.png --canvas 512 --padding 20 --threshold 32

# Magenta background (green creatures):
npm run asset:clean -- --input <raw-image> --output assets/goons/<goon>-reference.png --canvas 512 --padding 20 --threshold 32
```

If green fringe survives on a green-background creature, raise `--threshold` to 36 or 40. For magenta-background creatures, fringe is magenta-tinted and handled by the default cleanup.

Inspect the cleaned image before proceeding. The creature must be centered, facing left, with no background-color halo.

## Frame Count Guidance

Both idle and attack use 12 frames in a 4x3 grid. This gives smooth, fluid animation while staying within image-generator consistency limits:

| Animation | Frames | Grid | FPS | Duration | Notes |
|-----------|--------|------|-----|----------|-------|
| Idle | 12 | 4x3 | 20 | 0.6s loop | Must form a perfect loop: frame 12 transitions seamlessly back to frame 1. Describe a full motion cycle (rest → peak → return → rest). |
| Attack | 12 | 4x3 | 24 | 0.5s one-shot | Covers wind-up → peak → follow-through → recovery. 0.5s gives enough time for the full motion to read clearly. |

**Idle loop rule:** The idle animation MUST form a perfect seamless loop. Frame 1 is the resting pose. The motion should rise through the middle frames and return so that frame 12 looks nearly identical to frame 1. This prevents a visible "pop" when the animation restarts.

**Trade-offs:**
- **Fewer frames (8):** Acceptable fallback if 12-frame sheets have consistency issues. Use a 4x2 grid instead. Animation will be slightly choppier but functional.
- **More frames (16+):** Not recommended. Image generators lose character consistency and frame quality degrades.
- **Heavy/massive creatures** (golems, giants): 12 attack frames at 24fps = 0.5s which reads well for heavy attacks. If it still feels too fast, reduce the attack `frameRate` to 20fps (0.6s) in the ENEMY_ANIMATIONS entry.

## Phase 4: Generate Idle Sprite Sheet

Generate a single image containing all idle animation frames in a grid.

Prompt rules:

- Reference the cleaned goon image via `reference_image_paths`.
- Request a specific grid: "exactly 3 rows of 4 frames each (4 columns, 3 rows)".
- Say "NO divider lines or borders between frames".
- Say "bright solid green (#00FF00) background" (or "bright solid magenta (#FF00FF) background" for green creatures -- must match the background color used for the reference image).
- All frames face left.
- Describe subtle idle motion: breathing, pulsing, throat-sac inflating, body swaying.
- **Perfect loop:** Frame 12 must transition seamlessly back to frame 1. Describe a full motion cycle that starts and ends in the same resting pose.
- **Consistency anchor:** Add "Maintain EXACT proportions, colors, and features from the reference image in every frame. Do not change the creature's size, shape, or detail level between frames."

Idle prompt template:

```
A pixel art sprite sheet showing exactly 12 frames of an idle breathing animation,
arranged in exactly 3 rows of 4 frames each (4 columns, 3 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
[CREATURE NAME] creature FACING LEFT. The creature's HEAD and FACE point toward
the LEFT MARGIN of the image (the left edge). The creature's BACK and TAIL face
toward the RIGHT MARGIN. The creature moves toward the LEFT. Think of the creature
walking or charging toward a wall that is off-screen to the LEFT.
Bright solid [green (#00FF00) | magenta (#FF00FF)] background with NO grid lines,
NO borders, NO separators between frames. Pixel art style with visible pixels,
thick black outlines. Maintain EXACT proportions and features from the reference
image in every frame.

This is a LOOPING animation. Frame 1 and Frame 12 must look nearly identical (both
the neutral resting pose) so the loop is seamless with no visible pop or jump.

Row 1 (left to right):
Frame 1 - [creature] in normal resting pose. HEAD points toward LEFT EDGE. Back/tail toward RIGHT EDGE.
Frame 2 - [creature] facing left, body beginning to [describe early subtle motion, e.g. inhale].
Frame 3 - [creature] facing left, motion continuing, [describe mid-rise, e.g. chest lifting].
Frame 4 - [creature] facing left, [approaching peak of motion, e.g. body swelling].

Row 2 (left to right):
Frame 5 - [creature] facing left, [at peak of motion, e.g. maximum inhale/swell].
Frame 6 - [creature] facing left, [just past peak, beginning to settle, e.g. exhale starting].
Frame 7 - [creature] facing left, [continuing to return, e.g. body deflating].
Frame 8 - [creature] facing left, [past midpoint of return, e.g. settling lower].

Row 3 (left to right):
Frame 9 - [creature] facing left, [nearly returned to rest, e.g. slight residual sway].
Frame 10 - [creature] facing left, [subtle secondary motion, e.g. micro leg shift or tail twitch].
Frame 11 - [creature] facing left, [final transition, easing into rest].
Frame 12 - [creature] facing left, back to normal resting pose (identical to Frame 1 for seamless loop).

All frames must maintain the same [describe key visual traits -- colors, markings, eyes,
outline style]. Every single frame the [creature] faces LEFT. Frame 12 must match
Frame 1 so the animation loops without a visible jump.
```

**Before processing -- facing direction gate (max 3 attempts):**

Inspect the generated idle sheet before processing. Check every frame for these specific cues:
1. The creature's head/face/eyes point toward the **left** edge of the image.
2. Any asymmetric features (held items, dominant limb, mouth opening) are on the **left** side of the body as viewed.
3. No frame is a mirror image of the others.

If ANY frame faces right, regenerate the entire sheet. Do not process a sheet with even one right-facing frame. After 3 failed generation attempts, adjust the prompt: add "The creature is looking to the LEFT, toward the left margin of the image" as an additional line and try again. If a 4th attempt also fails, use the **horizontal flip fallback** below rather than continuing to fight the generator.

**Horizontal flip fallback** (use after 4 failed generation attempts):

This is a deterministic fix. Flip the raw sheet horizontally so every right-facing frame becomes left-facing, then process normally.

```bash
node -e "
const {PNG}=require('pngjs'),fs=require('fs');
const raw=fs.readFileSync('<raw-sheet-path>');
const img=PNG.sync.read(raw);
for(let y=0;y<img.height;y++){
  for(let x=0;x<Math.floor(img.width/2);x++){
    const L=(y*img.width+x)*4, R=(y*img.width+(img.width-1-x))*4;
    for(let c=0;c<4;c++){const t=img.data[L+c];img.data[L+c]=img.data[R+c];img.data[R+c]=t;}
  }
}
fs.writeFileSync('<raw-sheet-path>',PNG.sync.write(img));
console.log('Flipped horizontally. Verify creature now faces LEFT before processing.');
"
```

After flipping, re-inspect every frame to confirm the creature now faces left before running `process-spritesheet.mjs`. Note: held items and asymmetric markings will be mirrored — this is acceptable for enemy goons.

## Phase 5: Generate Attack Sprite Sheet

Generate a single image containing all attack animation frames in a grid.

Prompt rules:

- Reference the cleaned goon image via `reference_image_paths`.
- Request a 4x3 grid (12 frames). At 24fps this gives ~0.5s of animation -- enough time for a full wind-up, peak, follow-through, and recovery to read clearly.
- Say "NO divider lines or borders between frames".
- Say "bright solid green (#00FF00) background" (or "bright solid magenta (#FF00FF) background" for green creatures -- must match the reference image background).
- **Every frame** must face left -- repeat "facing left" in each frame description.
- Describe the attack sequence frame by frame: wind-up, action peak, recovery.
- Explicitly state the attack/lunge direction goes toward the LEFT edge.
- **Add negative prompts:** Include "The creature must NOT face right. The attack must NOT go toward the right side. Do NOT mirror or flip any frame." at the end of the prompt.
- **Add anti-pattern warning** in the prompt: "CRITICAL: attack animations are prone to accidental right-facing. Double-check that every frame's action goes LEFT."

Attack prompt template:

```
A pixel art sprite sheet showing exactly 12 frames of a [ATTACK TYPE] attack animation,
arranged in exactly 3 rows of 4 frames each (4 columns, 3 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
[CREATURE NAME] creature FACING LEFT. The creature's HEAD and FACE point toward
the LEFT MARGIN of the image (the left edge). The creature's BACK and TAIL face
the RIGHT MARGIN. Every attack, lunge, and projectile goes toward the LEFT EDGE.
Bright solid green (#00FF00) background with NO grid lines, NO borders, NO separators
between frames. Pixel art style with visible pixels, thick black outlines.

CRITICAL DIRECTION RULE: The creature faces LEFT in ALL frames. The attack motion,
lunge, projectile, or strike goes TOWARD THE LEFT EDGE of the image. The creature
must NOT face right. The attack must NOT go toward the right side. Do NOT mirror
or flip any frame.

Row 1 (left to right):
Frame 1 - [creature] in ready stance facing left, tensing, preparing to attack.
Frame 2 - [creature] facing left, [early wind-up, e.g. shifting weight, coiling].
Frame 3 - [creature] facing left, [mid wind-up, e.g. pulling back, raising weapon].
Frame 4 - [creature] facing left, [full wind-up, e.g. body at maximum tension, weapon raised high].

Row 2 (left to right):
Frame 5 - [creature] facing left, [peak of attack, e.g. lunging, striking, releasing],
body/attack fully committed toward the left. Attack goes LEFT, not right.
Frame 6 - [creature] facing left, [impact/release moment, e.g. projectile just launched, fist connecting].
Frame 7 - [creature] facing left, [early follow-through, e.g. recoiling from impact].
Frame 8 - [creature] facing left, [late follow-through, e.g. weapon swinging past, body rotating back].

Row 3 (left to right):
Frame 9 - [creature] facing left, [early recovery, pulling back from extended position].
Frame 10 - [creature] facing left, [mid recovery, body settling, re-centering weight].
Frame 11 - [creature] facing left, [nearly back to neutral, final settling].
Frame 12 - [creature] facing left, returning to ready stance.

All frames must maintain the same [describe key visual traits]. Every single frame
the [creature] faces LEFT. No frame may face right.
```

**Attack-type motion arc examples** -- use the one closest to your creature's attack, then customize:

*Melee lunge (biting, clawing, pouncing):*
- F1: ready stance, body low. F2: shifting weight forward. F3: legs coiling, body compressing toward left. F4: muscles at maximum tension, jaws/claws drawn back. F5: explosive lunge toward LEFT, body stretched, jaws/claws at full extension. F6: impact moment, jaws clamping / claws raking. F7: recoil from hit, body bouncing back. F8: pulling back, momentum fading. F9: body curling inward. F10: re-centering weight. F11: legs settling. F12: back to ready stance.

*Vertical slam (fist pound, ground strike, stomp):*
- F1: standing ready, facing left. F2: shoulders tensing, weight shifting. F3: both arms/fists rising. F4: arms at apex overhead, body leaning forward-left. F5: slamming DOWN and toward LEFT, arms descending fast. F6: impact -- fists hitting ground, debris/shockwave spreading. F7: ground crack visible, body still low. F8: aftershock, small debris bouncing. F9: slowly pushing back up. F10: arms withdrawing, torso rising. F11: re-centering to upright. F12: returning to standing ready.

*Ranged spell/projectile (bolts, spit, thrown objects):*
- F1: caster in ready stance, staff/arm resting. F2: beginning to raise staff/arm. F3: energy beginning to gather at focal point. F4: energy building, glowing brighter. F5: energy at peak, staff tip / hand / mouth flaring. F6: release -- projectile launching TOWARD THE LEFT. F7: projectile in flight toward LEFT edge, caster recoiling. F8: follow-through, caster off-balance from release. F9: projectile fading into distance. F10: caster steadying. F11: energy dissipating. F12: returning to ready stance.

**Before processing -- facing direction gate (max 3 attempts):**

This is the most common failure point -- attack animations frequently flip direction. Inspect EVERY frame for:
1. The creature's head/face/eyes point toward the **left** edge.
2. The attack action (lunge, projectile, slam) goes toward the **left** edge.
3. Peak frames (5-7) are NOT mirrored compared to wind-up frames (1-4).
4. No frame shows the creature facing or attacking toward the right.

**Attack direction anti-patterns to reject immediately:**
- The creature's body or head turned to face the right edge
- A projectile, bolt, or lunge going toward the right side of the frame
- Frames 5-7 (peak/follow-through) mirrored compared to frames 1-4
- The creature "winding up" by leaning right (the wind-up should compress the body, not change facing)

If ANY frame fails, regenerate the entire attack sheet. After 3 failed attempts, modify the prompt: emphasize facing direction even more heavily by adding "IMPORTANT: This creature attacks toward the LEFT margin. Every frame faces LEFT." and consider simplifying the attack motion description. If a 4th attempt also fails, use the **horizontal flip fallback** (same script as Phase 4) on the raw attack sheet before processing.

## Phase 6: Process Sprite Sheets

### Pre-processing: Inspect the raw sheet before running the script

Before running `process-spritesheet.mjs`, visually inspect each raw sheet. This catches grid problems early — fixing them before processing is always easier than debugging a broken output.

Check all four of these:

1. **Frame count**: Count rows and columns. Should be exactly 4 columns × 3 rows = 12 frames. If you see partial frames, extra blank rows, or frames that bleed into each other, the AI generated uneven spacing — use `--noAutoGrid` below.

2. **Uniform frame size**: All frames should look the same width and height. If any frame appears wider, narrower, taller, or shorter than its neighbors, the spacing is non-uniform — use `--noAutoGrid`.

3. **Aspect ratio check**: For a 4×3 grid, the raw sheet width should be roughly 4/3 × the height (e.g., 2048×1536, 1536×1152, 1024×768). Run:
   ```bash
   node -e "const {PNG}=require('pngjs'),fs=require('fs'); const d=PNG.sync.read(fs.readFileSync('<raw-sheet-path>')); console.log(d.width+'x'+d.height, 'ratio:', (d.width/d.height).toFixed(2), '(expected ~1.33 for 4x3)');"
   ```
   If the ratio is not close to 1.33, the frame spacing is likely non-uniform — use `--noAutoGrid`.

4. **Divider lines**: Despite being told not to, generators sometimes add faint lines between frames. Any visible grid lines will confuse the content-aware detector — use `--noAutoGrid`.

**`--noAutoGrid` decision rule**: If ANY of the above checks raise a concern, add `--noAutoGrid` to the processing command. This forces a perfectly uniform grid, which is more reliable than the content-aware detector when the raw sheet has any irregularity.

```bash
# Default (use when raw sheet looks clean and evenly spaced):
node scripts/process-spritesheet.mjs <raw-idle-path> assets/goons/<goon>_idle_512x512_sheet.png 4 3

# Use this when any pre-processing check raised a concern:
node scripts/process-spritesheet.mjs <raw-idle-path> assets/goons/<goon>_idle_512x512_sheet.png 4 3 --noAutoGrid
node scripts/process-spritesheet.mjs <raw-attack-path> assets/goons/<goon>_attack_512x512_sheet.png 4 3 --noAutoGrid
```

The script runs a three-pass cleanup pipeline:

1. **HSV chroma-key flood fill** -- converts pixels to HSV color space and removes border-connected pixels in the green hue range. Much more accurate than the old RGB heuristic, especially for dark creatures.
2. **Green spill suppression** -- scans edge pixels (adjacent to transparency) and clamps the green channel to neutralize green fringe without destroying intentionally green interior pixels.
3. **Alpha matting** -- computes soft alpha for pixels near the transparency boundary, creating smooth edges instead of hard jagged boundaries.
4. **Content-aware grid detection** -- automatically finds frame boundaries by scanning for vertical/horizontal transparent gaps, rather than assuming a perfectly uniform grid. Falls back to uniform grid if auto-detection fails.
5. Centers each frame's content in a 512x512 transparent frame and composites into a horizontal strip.

### Cleanup flags reference

| Flag | Default | Purpose |
|------|---------|---------|
| `--hueLo N` | 60 | HSV hue lower bound for green detection |
| `--hueHi N` | 170 | HSV hue upper bound for green detection |
| `--satMin N` | 0.15 | Minimum saturation to count as green |
| `--valMin N` | 0.10 | Minimum value (brightness) to count as green |
| `--spillPasses N` | 2 | Number of green spill suppression passes |
| `--matteRadius N` | 2 | Alpha matting radius in pixels |
| `--noAutoGrid` | false | Disable content-aware grid detection |

### Creature-specific cleanup parameters

| Creature type | Recommended flags | Why |
|---------------|-------------------|-----|
| **Standard** (most creatures) | *(defaults)* | Default HSV range and 2 spill passes work for most cases |
| **Dark creatures** (shades, wraiths, golems) | `--spillPasses 3` | Extra spill pass catches green fringe that is highly visible on dark edges |
| **Green creatures** on magenta bg | `--hueLo 270 --hueHi 330` | Targets magenta hue range instead of green |
| **Green creatures** on green bg (fallback) | `--hueLo 100 --hueHi 140 --satMin 0.5` | Narrow range targets only pure bright green, preserves olive/forest greens |
| **Thin-limbed creatures** (spiders, insects) | `--spillPasses 1 --matteRadius 1` | Conservative cleanup preserves thin features |
| **Fragile thin features** (if limbs still lost) | `--spillPasses 0 --matteRadius 0` | Zero edge erosion -- may leave slight fringe but preserves all features |

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
1. Re-run `process-spritesheet.mjs` with `--spillPasses 3` (or `4` for stubborn fringe).
2. If fringe persists on dark creatures, try `--spillPasses 4 --matteRadius 3`.
3. If fringe persists on light creatures, widen the hue range: `--hueLo 50 --hueHi 180`.
4. After remediation, re-run the green check to confirm the count is acceptable.

**Special case -- green-skinned creatures:** If the creature was generated on a magenta background, green pixel counts reflect the creature's real coloring and are correct. If generated on a green background with narrow hue targeting, visually inspect the creature outline for bright-green (#00FF00) halo between the creature edge and transparent background.

### Frame integrity check

After processing, verify every frame extracted intact:

```bash
node -e "
const {PNG}=require('pngjs'),fs=require('fs');
const goon='<GOON_TYPE>';
for(const anim of ['idle','attack']){
  const p='assets/goons/'+goon+'_'+anim+'_512x512_sheet.png';
  if(!fs.existsSync(p)){console.log(anim,'MISSING');continue;}
  const d=PNG.sync.read(fs.readFileSync(p));
  const frames=d.width/512;
  let broken=false;
  for(let f=0;f<frames;f++){
    let px=0;
    for(let y=0;y<512;y++) for(let x=0;x<512;x++)
      if(d.data[((y*d.width+f*512+x)*4)+3]>0) px++;
    const ok=px>=30000?'OK':'BROKEN';
    if(px<30000) broken=true;
    console.log('  Frame '+f+': '+px+' opaque px ['+ok+']');
  }
  if(broken) console.log('  WARNING: broken frames detected -- see troubleshooting');
}
"
```

**Every frame must have at least 30,000 opaque pixels.** Frames below 10,000 are broken (clipped/split by grid detection).

**If any frame is broken, follow this sequence:**
1. Re-run with `--noAutoGrid` (most common fix — forces uniform grid regardless of raw sheet irregularities).
2. If still broken after `--noAutoGrid`: go back and check the raw sheet aspect ratio (pre-processing step 3 above). If it's not close to 1.33 for a 4×3 sheet, the AI generated uneven frames — regenerate the sheet.
3. If the aspect ratio looks right but frames still break: visually count actual frames in the raw sheet and pass the correct `cols rows` to the script (the sheet may have snuck in an extra row, e.g. 4×4 instead of 4×3).

### Troubleshooting decision tree

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| **Green fringe on dark creature** | Default spill passes insufficient for dark edges | Re-run with `--spillPasses 3` or `--spillPasses 4` |
| **Green fringe on green creature** | Green background matches creature coloring | Regenerate reference and sheets on magenta (#FF00FF) background; process with `--hueLo 270 --hueHi 330` |
| **Creature body partially erased** | Cleanup hue range too wide for this creature's coloring | Narrow the range: `--hueLo 100 --hueHi 140 --satMin 0.5` |
| **Thin limbs eaten/missing** | Spill suppression or matting too aggressive | Re-run with `--spillPasses 0 --matteRadius 0` |
| **Frames are thin vertical/horizontal slices** | AI generator produced uneven frame spacing; grid detection failed | Re-run with `--noAutoGrid` (uniform grid) — run the aspect ratio check first to confirm dimensions are right |
| **Some frames empty or <10k pixels** | Grid detection misaligned with actual frame layout | First try `--noAutoGrid`; if still broken, count frames visually and pass correct `cols rows` to the script |
| **Frames face different directions** | AI generator inconsistency | Regenerate the entire sheet; do not process mixed-direction sheets |
| **Character proportions change across frames** | AI generator lost consistency in later frames | Reduce frame count to 8 (4x2 grid) as fallback; adjust frameRate to compensate |
| **Black outline merged with dark body** | Outline too thin or body too dark | Regenerate reference with "thick bright-colored outline" or "dark gray outline instead of black" |

### Outline integrity check

After cleanup, verify the creature's black outline survived processing intact. This catches two common issues:

1. **Dark creatures** (golems, shadow beings): dark body pixels can merge with the black outline during cleanup, making the silhouette blobby. Inspect the first frame of each processed sheet -- the creature should have a clearly visible black border separating it from the transparent background.
2. **Thin features** (spider legs, antennae, tails): aggressive cleanup thresholds can eat into thin features. Verify thin extremities still have their black outline visible at the edges.

If the outline is degraded, lower the cleanup `--threshold` (try 24 or 20) and reprocess. The trade-off: lower threshold may leave more green residue, so balance both checks.

### Animation consistency verification

After processing, compare the first and last frames of each sheet for proportion and feature consistency:

1. **Silhouette check:** The creature's overall shape (width, height, limb positions) should be similar in frame 0 and the last frame. If the creature shrinks, grows, or changes shape dramatically, the animation will look broken.
2. **Feature count check:** For multi-limbed creatures (spiders, insects), count visible limbs in frames 0, 4, and 8. If limb count varies (e.g. 8 legs in frame 0 but 5 in frame 8), the sheet has consistency degradation.
3. **Facing check (redundant but critical):** Confirm the creature faces left in frames 0, 4, 8, and the last frame. Direction flips mid-animation are the most common consistency failure.

**If consistency degrades across frames:**
1. First try: regenerate the sheet with stronger reference-locking language: "Maintain EXACT proportions, limb count, and features from the reference image in EVERY frame."
2. Second try: reduce frame count to 8 (4x2 grid) -- fewer frames means less opportunity for drift. Adjust the `process-spritesheet.mjs` call to `4 2` and update the ENEMY_ANIMATIONS frameRate if needed (8 frames at 20fps = 0.4s idle, 8 frames at 24fps = 0.33s attack).
3. Third try: reduce to 6 frames (3x2 grid) as a last resort.

**Creature-specific consistency tips:**

| Creature type | Consistency risk | Prompt addition |
|---------------|-----------------|-----------------|
| **Multi-limbed** (spiders, insects) | Limb count varies across frames | Add: "The creature has exactly [N] legs visible in EVERY frame. Do not add or remove legs." |
| **Wispy/ethereal** (wraiths, ghosts) | Tendril shapes change wildly | Add: "The creature's wispy tendrils maintain the same general flow direction and count in every frame. Only subtle movement, not reshaping." |
| **Complex organic** (vines, plants) | Shape changes between frames | Add: "The creature's overall silhouette shape stays consistent. Only small movements within the existing shape, not structural changes." |
| **Large boss** (broodmother, dragons) | Direction flips mid-animation | The v1 facing-direction gates already handle this. Additionally: "The creature's egg sac / wings / distinctive features remain on the same side in every frame." |

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
| `scripts/process-spritesheet.mjs` | HSV chroma-key removal, spill suppression, alpha matting, content-aware grid detection, 512x512 centering, strip compositing |
| `scripts/finalize-icon.mjs` | Clean single reference images from green/magenta background |
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
- [ ] Identified creature-specific adaptations (green skin, thin limbs, dark coloring, held items, massive proportions, attack type)
- [ ] Generated reference image FACING LEFT on bright green background
- [ ] Cleaned reference image (no green halo, centered in 512x512)
- [ ] Generated idle sprite sheet (12 frames, 4x3 grid, no divider lines, all frames face left, perfect loop)
- [ ] **Verified idle sheet facing direction (max 3 attempts)** -- all frames face left before processing
- [ ] Generated attack sprite sheet (12 frames, 4x3 grid, no divider lines, all frames face left, negative prompts included)
- [ ] **Verified attack sheet facing direction (max 3 attempts)** -- lunge/strike goes toward LEFT edge, checked anti-patterns, no mirrored frames
- [ ] Chose correct background color (green default, magenta for green creatures)
- [ ] Processed both sheets through process-spritesheet.mjs with creature-appropriate flags
- [ ] **Ran frame integrity check** -- every frame has >=30,000 opaque pixels, no broken/clipped frames
- [ ] Verified frame counts and opaque pixels per frame
- [ ] **Ran green residue check** -- 0 bright-green pixels (or visual inspection for green-skinned creatures)
- [ ] **Ran outline integrity check** -- black outline visible, thin features preserved
- [ ] **Ran consistency check** -- compared first and last frames for proportion/feature match
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
