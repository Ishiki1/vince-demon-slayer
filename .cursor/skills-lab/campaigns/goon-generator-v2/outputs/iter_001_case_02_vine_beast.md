# Iteration 1 Dry-Run: Case 02 -- Vine Beast (Thornvine Horror)

## Test Case Summary
- **Creature:** Thornvine Horror (`thornvine`) -- twisted green/olive vines, red thorns, glowing orange eyes, coiled serpentine shape
- **Primary challenges:** Green-on-green separation, frame integrity with complex irregular shapes, display-size readability
- **Attack type:** Melee lunge (vine whip toward left)

## Skill Changes Relevant to This Case
The updated skill now includes:
1. **Magenta (#FF00FF) background alternative** explicitly documented for green creatures, with a separate prompt template.
2. **Creature-specific adaptations table** updated: green/teal creatures now say "Use magenta (#FF00FF) background instead of green" as the primary strategy, with `--hueLo 270 --hueHi 330` for processing.
3. **Creature-specific cleanup parameters table** with two rows for green creatures: magenta bg (`--hueLo 270 --hueHi 330`) and green bg fallback (`--hueLo 100 --hueHi 140 --satMin 0.5`).
4. **Phase 3 background color decision** step added before writing the prompt.
5. **Phase 6 troubleshooting decision tree** includes "Green fringe on green creature" → "Regenerate on magenta background; process with `--hueLo 270 --hueHi 330`" and "Creature body partially erased" → "Narrow the range: `--hueLo 100 --hueHi 140 --satMin 0.5`".
6. **Checklist** includes "Chose correct background color (green default, magenta for green creatures)".

## Dry-Run Execution Plan

### Phase 1: Read Project Context
Standard doc reads. No issues.

### Phase 2: Define the Goon
The agent defines goonType `thornvine`, display name "Thornvine Horror", stats, skill (`thornvine-whip-skill` using `poisonHero` effect), spawn weight.

**Creature-specific adaptation lookup:** The agent consults the adaptations table and identifies:
- **"Green/teal coloring"**: The skill now says: "**Use magenta (#FF00FF) background instead of green.** In reference and sprite sheet prompts, replace 'green (#00FF00) background' with 'bright solid magenta (#FF00FF) background'. Process with `--hueLo 270 --hueHi 330` to target magenta."
- Also provides a fallback: "If magenta is not viable, use narrow green hue: `--hueLo 100 --hueHi 140 --satMin 0.5` to target only pure bright green."
- Additional instruction: "Visually inspect creature outline for halo after processing."

**Major improvement vs baseline:** The baseline had NO alternative background color strategy. The agent would have used green background for a green creature, leading to catastrophic cleanup failure. Now the agent has an explicit, actionable primary strategy (magenta background) and a fallback (narrow hue range on green background). This is the single biggest improvement for this test case.

### Phase 3: Generate Static Reference Image
The skill now has a **background color decision** step: "Before writing the prompt, decide the background color based on the creature's coloring." The two options are explicitly listed:
- Default: bright solid green (#00FF00)
- Green/teal/olive creatures: bright solid magenta (#FF00FF)

The agent identifies the Thornvine Horror as a green creature and selects magenta background.

The skill provides a **separate magenta prompt template**:
```
...perfectly centered composition on a bright solid magenta (#FF00FF) background...
```

This is a complete, copy-paste-ready template. The agent doesn't need to figure out what to change -- the magenta variant is fully written out.

Cleanup: `npm run asset:clean -- --input <raw> --output assets/goons/thornvine-reference.png --canvas 512 --padding 20 --threshold 32`

**Assessment:** The reference cleanup uses `asset:clean` (not `process-spritesheet.mjs`), so the HSV flags don't apply here. The threshold-based cleanup should work for magenta removal since magenta is far from the creature's olive/forest green in color space. The skill says "For magenta-background creatures, fringe is magenta-tinted and handled by the default cleanup." This is reasonable -- magenta fringe on a green creature is easily distinguishable and removable.

**Remaining gap:** The skill doesn't explicitly say what `asset:clean` flags to use for magenta background cleanup. The default `--threshold 32` targets green, not magenta. The agent might need to adjust, but the skill doesn't provide magenta-specific `asset:clean` guidance. However, this is a minor gap since `asset:clean` is for the single reference image (less critical than the sprite sheets), and the creature's green coloring is far from magenta in color space.

### Phase 4: Generate Idle Sprite Sheet
The agent uses the idle prompt template. The skill now explicitly says: "Say 'bright solid green (#00FF00) background' (or 'bright solid magenta (#FF00FF) background' for green creatures -- must match the background color used for the reference image)."

The agent would use "bright solid magenta (#FF00FF) background" in the idle prompt, matching the reference. The consistency anchor ("Maintain EXACT proportions, colors, and features from the reference image in every frame") is included.

For a vine creature, the idle motion would be "vines swaying, coiling, thorns pulsing." The prompt template handles this well.

**Frame integrity concern:** Vine creatures have complex, irregular shapes. The AI generator may produce frames where vines extend differently, making grid splitting challenging. The skill now documents content-aware grid detection as the primary approach, which should handle uneven frame spacing better than the old uniform grid.

**Facing direction gate:** Works for vine creatures. The coiled serpentine shape with eyes on one side makes direction verifiable.

### Phase 5: Generate Attack Sprite Sheet
The agent uses the "Melee lunge (biting, clawing, pouncing)" motion arc template for a vine whip attack. The template describes the lunge going toward the left edge. The agent would adapt it: "vine extending and whipping toward the LEFT edge."

The attack prompt also uses magenta background, matching the reference and idle sheet.

**Consistency anchor** included in the attack template.

### Phase 6: Process Sprite Sheets
The agent runs:
```
node scripts/process-spritesheet.mjs <raw-idle> assets/goons/thornvine_idle_512x512_sheet.png 4 3 --hueLo 270 --hueHi 330
node scripts/process-spritesheet.mjs <raw-attack> assets/goons/thornvine_attack_512x512_sheet.png 4 3 --hueLo 270 --hueHi 330
```

**Major improvement:** The creature-specific cleanup parameters table explicitly says:
- "Green creatures on magenta bg: `--hueLo 270 --hueHi 330` -- Targets magenta hue range instead of green"

This means the HSV chroma-key flood fill will target magenta (hue 270-330) instead of green (hue 60-170). The creature's olive/forest green coloring (hue ~80-140) is completely outside the magenta target range, so the creature body is preserved while the magenta background is removed.

**Assessment:** This is a fundamentally correct approach. The baseline would have destroyed the creature's body by targeting green. Now the pipeline targets magenta, which has zero overlap with the creature's coloring. The spill suppression pass will target magenta spill (not green spill), and the alpha matting will create smooth edges against the magenta boundary.

**Green residue check:** The skill's green pixel check (`g>200 && r<100 && b<100`) will detect bright green pixels. For a green creature on magenta background, the creature's olive/forest green pixels will NOT trigger this check (they have lower green values and higher red/blue than pure #00FF00). The check correctly says: "Special case -- green-skinned creatures: If the creature was generated on a magenta background, green pixel counts reflect the creature's real coloring and are correct."

**Frame integrity check (NEW):** The per-frame opaque pixel count with 30k threshold is valuable for vine creatures. Complex vine shapes may have lower pixel counts than bulky creatures, but should still exceed 30k if the frame extracted properly. The BROKEN labeling helps the agent identify failed frames quickly.

**Troubleshooting decision tree:** For the vine beast's likely issues:
- "Green fringe on green creature" → "Regenerate reference and sheets on magenta (#FF00FF) background; process with `--hueLo 270 --hueHi 330`" -- This is the primary strategy the agent already follows. If it somehow fails, the troubleshooting tree reinforces the correct approach.
- "Creature body partially erased" → "Narrow the range: `--hueLo 100 --hueHi 140 --satMin 0.5`" -- This is the fallback for if the agent used green background. With magenta background, body erasure shouldn't occur.
- "Frames are thin vertical/horizontal slices" → "Re-run with `--noAutoGrid` to force uniform grid, OR try different grid dimensions" -- Relevant for complex vine shapes.

### Phase 7: Wire into Codebase
Standard code wiring. Templates unchanged and correct.

### Phase 8: Update Docs and Validate
Standard. Checklist now includes "Chose correct background color" which the agent would check off for magenta.

## Rubric Evaluation

### Green Cleanup Quality
This is the dimension with the most dramatic improvement. The baseline scored 15 because the skill had NO viable path for green-on-green separation. Now the skill provides:
1. An explicit magenta background strategy with a separate prompt template
2. Specific `--hueLo 270 --hueHi 330` flags for processing magenta backgrounds
3. A fallback narrow-hue strategy for green backgrounds
4. A troubleshooting entry that reinforces the magenta approach
5. Correct handling of the green pixel check for green-skinned creatures on magenta backgrounds

The creature's green coloring is fully preserved because the cleanup targets magenta (hue 270-330), which has zero overlap with olive/forest green (hue 80-140). This is a fundamentally sound approach. The remaining minor gap is that `asset:clean` (Phase 3) doesn't have magenta-specific flag documentation, but this is a single reference image that can be visually inspected.

### Frame Integrity
The skill now documents content-aware grid detection as the primary approach, which handles uneven frame spacing better than uniform grid. The frame integrity check with per-frame opaque pixel counts and 30k threshold catches broken frames. The troubleshooting tree covers "thin vertical/horizontal slices" with `--noAutoGrid` as a fix. For vine creatures with complex shapes, the content-aware detection is particularly valuable. The remaining gap is that the skill doesn't provide vine-specific guidance on what to do when vine tendrils cross grid boundaries, but the auto-detection should handle most cases.

### Animation Consistency
The consistency anchor ("Maintain EXACT proportions, colors, and features") is a meaningful improvement for vine creatures, which have inherently variable shapes across AI-generated frames. The 8-frame fallback is documented. However, vine creatures are among the hardest to keep consistent -- each frame may have different vine configurations regardless of prompt instructions. The skill doesn't provide vine-specific consistency guidance (e.g., "simplify vine design to 3-4 main tendrils for better frame-to-frame consistency").

### Creature-Specific Adaptation
The adaptations table now provides a complete, actionable strategy for green creatures: magenta background + adjusted hue range. This is the correct approach and resolves the baseline's fundamental gap. The specific CLI flags (`--hueLo 270 --hueHi 330`) are provided, not just vague "adjust as needed" guidance. The fallback (narrow green hue range) is also documented. This is a strong improvement.

### Pipeline Robustness
The troubleshooting decision tree covers the vine beast's primary failure modes: green-on-green (magenta strategy), body erasure (narrow hue range), and broken frames (noAutoGrid). The remediation paths are specific and actionable. The "regenerate on magenta background" advice correctly identifies that the fix is to go back to Phase 3, not just adjust Phase 6 parameters. This is a significant improvement over the baseline, which had no remediation path for green-on-green failure.

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 78,
    "Frame Integrity": 68,
    "Animation Consistency": 58,
    "Creature-Specific Adaptation": 77,
    "Pipeline Robustness": 73
  },
  "reasoning": {
    "Green Cleanup Quality": "Magenta background strategy with --hueLo 270 --hueHi 330 fundamentally solves green-on-green separation; creature coloring fully preserved since magenta hue range has zero overlap with olive/forest green; minor gap in asset:clean magenta-specific flags.",
    "Frame Integrity": "Content-aware grid detection documented as primary approach, frame integrity check with 30k threshold catches broken frames, troubleshooting covers thin slices; vine-specific cross-boundary guidance still absent.",
    "Animation Consistency": "Consistency anchor added to prompts and 8-frame fallback documented; but vine creatures are inherently hard to keep consistent and no vine-specific simplification guidance is provided.",
    "Creature-Specific Adaptation": "Complete actionable strategy for green creatures: magenta background + specific CLI flags + fallback narrow hue range; resolves the baseline's fundamental gap with concrete parameters.",
    "Pipeline Robustness": "Troubleshooting tree covers green-on-green, body erasure, and broken frames with specific remediation paths; correctly identifies that green-on-green fix requires going back to Phase 3."
  }
}
-->
