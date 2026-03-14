---
name: skill-icon-generator
description: Generates square 256x256 dark-fantasy framed pixel-art skill icons for Demon Slayer (Vince) warrior and sorceress skill trees. Handles the full pipeline from generation through cleanup and compositing. Use when creating new skill icons, passive icons, or replacing placeholder skill art.
---

# Skill Icon Generator

## Quick Start

Use this skill when generating new skill or passive icons for the warrior/sorceress skill tree and level-up UI.

Pipeline:

1. Generate the subject on a bright green background
2. Run `remove-background` to get a transparent PNG
3. Run `composite-skill-icon` to place on dark background with matching border
4. Show result for user approval before saving
5. Save approved icon to `assets/ui/skills/`

## Pipeline Steps

### Step 1: Generate on Green Background

Use the `GenerateImage` tool with this prompt structure:

```text
Realistic-looking pixel art skill icon for a fantasy RPG. Single object only,
perfectly centered, thick black outline, strong silhouette, readable at 32x32
and 48x48, limited palette, no text, no border, bright green background for
later cleanup. [DESCRIBE THE SPECIFIC SUBJECT HERE]. The object should be
roughly as tall as it is wide so it reads well in a square frame.
```

Key rules:
- Always request bright green background (never dark, never transparent)
- Ask for a single centered object with thick black outline
- Describe the subject so it fills the canvas roughly square
- Use existing approved icons as `reference_image_paths` when possible

### Step 2: Remove Background

```bash
node scripts/remove-background.mjs \
  --input "<generated-image-path>" \
  --output "assets/ui/skills/<name>-clean.png" \
  --canvas 256 --padding 20 --threshold 32
```

Verify the output JSON: `finalContent.width` and `finalContent.height` should be roughly equal (within ~15%). If one dimension is much smaller, the subject will look stretched or squished -- regenerate with a more square composition.

If green fringe survives, rerun with `--threshold 36` or `--threshold 40`.

### Step 3: Composite onto Dark Background

```bash
node scripts/composite-skill-icon.mjs \
  --input "assets/ui/skills/<name>-clean.png" \
  --output "assets/ui/skills/<name>-preview.png" \
  --ref "assets/ui/skills/passive-combat-reflexes.png"
```

The `--ref` icon provides the dark background fill and frame border pixels. Use `passive-combat-reflexes.png` as the default reference for consistent borders.

### Step 4: Show for Approval

Always show the preview to the user before saving. Read the preview image and display it inline. Do not save to the final filename until the user approves.

### Step 5: Save

```bash
copy "assets/ui/skills/<name>-preview.png" "assets/ui/skills/<name>.png"
```

Then delete intermediate files (`*-clean.png`, `*-preview.png`).

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Active skill | `button-<skill-id>.png` | `button-slash.png` |
| Passive stat | `passive-<stat><tier>.png` | `passive-str2.png` |
| Passive named | `passive-<kebab-name>.png` | `passive-brutal-might.png` |

## Style Reference

All warrior skill icons share this style:
- 256x256 square PNG
- Dark navy/charcoal background (~RGB 22,24,34)
- Frame border sampled from reference icon
- Dark fantasy aesthetic with steel/silver metallic tones
- Orange/red/warm glowing accents for strength/defense/health
- Blue/cyan accents for mana-related passives
- Silver/white with speed accents for evasion passives

## Wiring

Skill icon texture keys are defined in `src/data/skills.js` via `assetKey`, preloaded in `src/scenes/BootScene.js`, and rendered by `src/ui/SkillButtons.js`. If replacing an existing placeholder, no code changes are needed. For new skills, add the texture key to the preload array in BootScene and set `assetKey` in the skill definition.

## Utility Scripts

| Script | Purpose |
|--------|---------|
| `scripts/remove-background.mjs` | Strips green/matte backgrounds, trims, repacks to square transparent canvas |
| `scripts/composite-skill-icon.mjs` | Composites transparent icon onto dark background with border from a reference icon |
| `scripts/crop-square.mjs` | Center-crops landscape images to square with optional border overlay |

## Checklist

- [ ] Generated on bright green background
- [ ] Subject is roughly square-proportioned (not too wide or too tall)
- [ ] Background removed with no green fringe
- [ ] Composited onto dark background with matching frame border
- [ ] Final image is exactly 256x256
- [ ] Shown to user for approval before saving
- [ ] Intermediate files cleaned up
- [ ] Texture key wired in skills.js, BootScene.js, SkillButtons.js
