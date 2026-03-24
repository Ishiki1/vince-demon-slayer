# Campaign Brief -- Goon Generator v2

## What skill are we training?
`.cursor/skills/goon-generator/SKILL.md` -- the full goon generation pipeline. This is a continuation of the v1 campaign which improved the skill from 42.5 to 74.8. The v2 campaign targets the remaining weaknesses that v1 did not fully solve.

## What's working well? (Protect these)
- The 8-phase pipeline structure is solid
- Code templates for BootScene, CombatScene, dungeon.js, enemySkills.js wiring are correct
- Naming conventions are consistent
- Facing-direction enforcement (improved in v1) -- attack prompts have negative prompts and anti-patterns
- Frame count guidance (12 frames, 4x3 grid) from v1
- Attack-type motion arc examples from v1
- Creature-specific adaptations table from v1
- Outline integrity check from v1

## What specific weaknesses do you want to fix?

### 1. Green fringe on dark creatures (CRITICAL)
The shade (dark wraith) has heavy green fringe on its tentacles/wisps after cleanup. The `process-spritesheet.mjs` script has been upgraded with HSV-based chroma keying, spill suppression, and alpha matting, but the skill needs to:
- Document the new `--hueLo`, `--hueHi`, `--satMin`, `--valMin`, `--spillPasses`, `--matteRadius` flags
- Provide creature-specific flag recommendations (dark creatures need lower satMin, green creatures need narrower hue range)
- Add a post-cleanup visual inspection step that specifically checks for green halos on dark edges

### 2. Green-on-green creature separation (CRITICAL)
The plant (Thorn Creeper) is a green creature on a green background. The cleanup can't distinguish creature green from background green. The skill needs:
- Explicit guidance for generating green creatures with a NON-green background color (e.g. magenta #FF00FF or blue #0000FF)
- Or: guidance for using a much narrower hue range that targets only pure #00FF00 and not olive/forest greens
- A decision tree: "If creature has green coloring, use [alternative approach]"

### 3. Frame extraction failures (HIGH)
The plant attack sheet has frames 5-7 that are thin vertical slices -- the AI generator produced uneven frame spacing and the uniform grid splitter cut through frames. The upgraded script has content-aware grid detection, but the skill needs:
- Guidance on when to use `--noAutoGrid` vs letting auto-detection work
- A frame integrity check: "After processing, verify every frame has >30k opaque pixels"
- Fallback: "If frames are broken, try different grid dimensions or re-generate"

### 4. Animation consistency across frames (MEDIUM)
Spider legs degrade across frames (frames 7-12 have disconnected stubs). Broodmother flips direction mid-animation. The skill needs:
- Stronger reference-locking language in prompts ("maintain EXACT proportions from the reference image")
- A consistency check: "Compare first and last frames -- proportions should match"
- Guidance on reducing frame count if consistency degrades (12 -> 8 as fallback)

### 5. Pipeline robustness (MEDIUM)
When things go wrong, agents don't know what to try. The skill needs:
- A troubleshooting decision tree for common failures
- Specific remediation paths for each failure type
- Clear "when to regenerate vs when to adjust parameters" guidance

## What does a perfect output look like?
A perfect goon generation run would:
1. Produce a reference image with clean transparent background (no green halo)
2. For green creatures, use an alternative background color and adjusted cleanup parameters
3. Generate sprite sheets where EVERY frame is intact (no clipped/split frames)
4. Maintain character proportions and features across all frames
5. After cleanup, have zero visible green fringe on any creature type (dark, green, or light)
6. Include automated pixel checks that catch problems before the agent moves on
7. Have clear fallback paths when generation or cleanup produces subpar results

## Any areas that are off-limits for changes?
- Do not change JS code template structure (BootScene/CombatScene wiring patterns)
- Do not change naming conventions (file paths, texture keys, animation keys)
- Frame sizes stay at 512x512
- Animation frame rates stay at 20fps idle / 24fps attack
- The v1 improvements (facing direction, attack prompts, motion arcs) must be preserved

## Additional context
- `process-spritesheet.mjs` has been upgraded with:
  - HSV-based chroma keying (replaces old RGB `isGreen()` heuristic)
  - Green spill suppression (clamps green channel on edge pixels)
  - Alpha matting (soft edges near transparency boundary)
  - Content-aware grid detection (finds frame boundaries via transparent gaps)
  - CLI flags: `--hueLo`, `--hueHi`, `--satMin`, `--valMin`, `--spillPasses`, `--matteRadius`, `--noAutoGrid`
- The game is Demon Slayer (Vince), a Phaser 3 roguelike browser game
- Existing problem goons: shade (dark), plant (green), spider (thin limbs), broodmother (direction flip)
- The skill is used by Cursor AI agents, so instructions must be unambiguous
