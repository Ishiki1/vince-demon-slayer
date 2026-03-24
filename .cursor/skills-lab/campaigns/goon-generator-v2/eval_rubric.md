# Evaluation Rubric -- Goon Generator v2

## Scoring Scale
- **0** = Completely absent or wrong
- **25** = Poor, major gaps
- **50** = Adequate but unremarkable
- **75** = Good, solid work
- **100** = Exceptional, best-in-class

## Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Green Cleanup Quality | 25% | Does the skill produce sprites with zero visible green fringe after cleanup? Does it document the upgraded pipeline flags (HSV hue range, spill passes, matte radius)? Does it provide creature-specific cleanup parameter recommendations? Does it handle the green-on-green case (green creatures on green backgrounds) with an explicit alternative approach? Is there a post-cleanup pixel check that would catch residual green? |
| Frame Integrity | 25% | Are all frames complete and properly extracted with no clipped/split frames? Does the skill guide the agent to verify frame content after extraction (opaque pixel count per frame)? Does it mention content-aware grid detection as the primary approach? Does it provide fallback guidance when frames are broken (re-generate, adjust grid dimensions, manual inspection)? |
| Animation Consistency | 20% | Do frames maintain character proportions, features, and facing direction throughout the animation? Does the skill include reference-locking language in prompts? Does it instruct the agent to compare first/last frames for proportion consistency? Does it provide a fallback (reduce frame count) when consistency degrades? |
| Creature-Specific Adaptation | 15% | Does the skill correctly handle all four edge cases: dark creatures (green fringe on dark edges), green creatures (green-on-green separation), thin-limbed creatures (leg preservation), and large creatures (direction consistency)? Does it provide specific parameter recommendations for each type? |
| Pipeline Robustness | 15% | Does the skill include a troubleshooting decision tree? Does it provide specific remediation paths for common failures (green fringe, broken frames, inconsistent animation, wrong facing)? Does it clearly distinguish "regenerate" vs "adjust parameters" scenarios? |

## Judging Notes

- Dimension names in scores JSON must match exactly: `Green Cleanup Quality`, `Frame Integrity`, `Animation Consistency`, `Creature-Specific Adaptation`, `Pipeline Robustness`
- Green Cleanup Quality and Frame Integrity together make up 50% of the score -- these are the primary improvement targets
- Animation Consistency is the secondary target at 20%
- The v1 improvements (facing direction enforcement, attack prompts, motion arcs, outline integrity) must be preserved. Penalize regressions.
- Reward concrete, actionable instructions over vague guidance
- Reward specific parameter values and thresholds over "adjust as needed"
- Penalize instructions that would only work for one creature type but fail for others
