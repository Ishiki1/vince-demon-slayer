# Campaign Brief -- Goon Generator v1

## What skill are we training?
`.cursor/skills/goon-generator/SKILL.md` + `.cursor/skills/goon-generator/reference.md` -- merged into a single `skill.md` for this campaign. The goon-generator handles the full pipeline from static reference art through idle and attack sprite sheet generation, green-background cleanup, 512x512 frame processing, Phaser preload/animation wiring, CombatScene sprite creation, dungeon data definitions, and doc updates.

## What's working well? (Protect these)
- Most of the skill works very well overall
- The 8-phase pipeline structure is solid and should not be reordered
- Code templates for BootScene, CombatScene, dungeon.js, enemySkills.js wiring are correct
- Naming conventions (file paths, texture keys, animation keys) are consistent
- The critical rule about facing-left is documented (though not followed well enough in practice for attack animations)
- Processing scripts (process-spritesheet.mjs, asset:clean) work correctly
- The final checklist is useful

## What specific weaknesses do you want to fix?
1. **Attack animation facing direction**: The most critical failure. Despite multiple warnings in the skill, agents still generate attack sprite sheets where frames face right instead of left. The attack animation is by far the hardest to get right. The skill needs stronger enforcement mechanisms -- not just more warnings, but structural changes to prompts and verification that make wrong-facing attacks harder to produce and easier to catch.
2. **Green outline after cleanup**: After running `asset:clean` or `process-spritesheet.mjs`, a visible green outline sometimes remains around the creature. The skill needs an explicit verification step that checks for residual green pixels and provides a remediation path (raise threshold, re-run cleanup, manual inspection).
3. **Too few frames**: The current skill calls for 8 idle frames (4x2) and 6 attack frames (3x2). This may be too few for smooth animation, especially for attack sequences where a 6-frame one-shot at 24fps is only 0.25 seconds. The training should experiment with different frame counts and grid layouts to find what produces better results.

## What does a perfect output look like?
A perfect goon generation run would:
1. Produce a reference image facing left with no green halo
2. Generate an idle sheet with enough frames for a smooth, natural breathing loop -- every frame facing left
3. Generate an attack sheet where EVERY SINGLE FRAME faces left, the attack motion flows toward the left edge, the sequence has enough frames to read clearly at 24fps, and the motion is fluid from wind-up through strike to recovery
4. After processing, have zero residual green pixels on any frame
5. Wire all 5 code insertion points correctly on the first attempt
6. Complete all doc updates

## Any areas that are off-limits for changes?
- Do not change JS code template structure (BootScene/CombatScene wiring patterns)
- Do not change naming conventions (file paths, texture keys, animation keys)
- Frame sizes stay at 512x512
- Animation frame rates stay at 20fps idle / 24fps attack

## Additional context
- The game is Demon Slayer (Vince), a Phaser 3 roguelike browser game
- Goons spawn on the right side of combat and face the hero on the left
- Existing goons: toad, mushroom, plant, shade, broodmother, reaper
- Attack animation is the #1 pain point -- it fails more often than everything else combined
- The skill is used by Cursor AI agents, so instructions must be unambiguous enough that an AI agent follows them correctly without human intervention
