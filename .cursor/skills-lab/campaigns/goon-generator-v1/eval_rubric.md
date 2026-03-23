# Evaluation Rubric -- Goon Generator v1

## Scoring Scale
- **0** = Completely absent or wrong
- **25** = Poor, major gaps
- **50** = Adequate but unremarkable
- **75** = Good, solid work
- **100** = Exceptional, best-in-class

## Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Attack Animation Quality | 25% | Does the skill produce clear, specific instructions for generating attack sprite sheets? Does the attack prompt template enforce left-facing direction in every frame description? Does it describe a complete motion arc (wind-up, peak, follow-through, recovery) with enough detail that an image generator would produce directionally correct, fluid animation? Are there explicit anti-patterns called out (e.g. "do NOT show the creature lunging right")? |
| Facing Direction Enforcement | 20% | Does the skill have sufficient verification gates that would catch wrong-facing frames BEFORE they get processed? Are there concrete inspection instructions (not just "visually inspect" but what specifically to look for)? Is there a clear regeneration trigger and maximum retry count? Does the attack prompt structurally make right-facing frames harder to produce? |
| Green Cleanup Verification | 20% | After cleanup/processing, does the skill instruct the agent to verify no green outline remains? Is there a concrete check (pixel sampling, visual inspection criteria, threshold adjustment guidance)? Is there a remediation path when green fringe persists (raise threshold, re-run, try different parameters)? |
| Frame Count Adequacy | 15% | Does the skill guide the agent toward enough frames for smooth animation? For idle: is the loop seamless at 20fps? For attack: is the one-shot readable and fluid at 24fps? Does the skill explain the trade-off between more frames and generation quality? Are the grid layout instructions clear and consistent with the requested frame count? |
| Phase Completeness | 10% | Does the dry-run cover all 8 phases with no skipped steps? Are all file touchpoints addressed (BootScene preload, ENEMY_ANIMATIONS, getEnemyAnimationSet, sprite creation chain, dungeon.js, enemySkills.js, spritework.md, changelog.md)? |
| Prompt Adaptability | 10% | Can the skill's prompts handle this specific creature type without ambiguity? Do prompts adapt descriptions to the creature's unique anatomy, coloring, and attack style? Are creature-specific edge cases addressed (thin limbs, earth tones near outline color, held items, spell effects)? |

## Judging Notes

- Dimension names in scores JSON must match exactly: `Attack Animation Quality`, `Facing Direction Enforcement`, `Green Cleanup Verification`, `Frame Count Adequacy`, `Phase Completeness`, `Prompt Adaptability`
- Attack Animation Quality and Facing Direction Enforcement together make up 45% of the score -- these are the primary improvement targets
- Green Cleanup Verification is the secondary target at 20%
- Frame Count Adequacy is exploratory -- reward experimentation and clear reasoning about trade-offs
- Phase Completeness and Prompt Adaptability are lower weight because they already work reasonably well
- Penalize regressions in Phase Completeness or code template correctness even though they are lower weight -- these must not degrade
