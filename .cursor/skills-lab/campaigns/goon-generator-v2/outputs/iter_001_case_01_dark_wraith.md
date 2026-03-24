# Iteration 1 Dry-Run: Case 01 -- Dark Wraith (Shadow Wraith)

## Test Case Summary
- **Creature:** Shadow Wraith (`wraith`) -- dark robes, tendrils, deep black/purple, wispy edges
- **Primary challenges:** Green fringe on dark edges, thin tendril preservation, dark body vs black outline
- **Attack type:** Ranged spell (shadow bolt toward left)

## Skill Changes Relevant to This Case
The updated skill now includes:
1. **Creature-specific cleanup parameters table** with explicit `--spillPasses 3` recommendation for dark creatures.
2. **Cleanup flags reference table** documenting all `--hueLo/--hueHi/--satMin/--valMin/--spillPasses/--matteRadius/--noAutoGrid` flags.
3. **Phase 6 rewritten** to document the 3-pass pipeline (HSV chroma key, spill suppression, alpha matting).
4. **Troubleshooting decision tree** with "Green fringe on dark creature" as the first entry, pointing to `--spillPasses 3` or `--spillPasses 4`.
5. **Frame integrity check** with per-frame opaque pixel count and 30k threshold.
6. **Creature-specific adaptations table** updated with specific CLI flags for dark creatures.

## Dry-Run Execution Plan

### Phase 1: Read Project Context
The agent reads `cursor.md`, `GAME_DESIGN.md`, `spritework.md`, `src/config.js`. Standard phase, no issues.

### Phase 2: Define the Goon
The agent defines goonType `wraith`, display name "Shadow Wraith", stats, skill (`wraith-bolt-skill`), spawn weight. The data template is clear.

**Creature-specific adaptation lookup:** The agent consults the adaptations table and identifies two applicable traits:
- **"Dark coloring near black"**: Skill now says to request "clearly visible thick black outline that contrasts with the dark body" in the prompt, AND to process with `--spillPasses 3`. It also says to verify (1) no green fringe on any dark edge, (2) outline distinguishable from body at display size.
- **"Thin limbs or fine detail"** (for wispy tendrils): Skill now says to use `--spillPasses 1 --matteRadius 1` for conservative cleanup, and if limbs are still lost, try `--spillPasses 0 --matteRadius 0`.

**Tension identified:** The dark-creature recommendation says `--spillPasses 3` (aggressive), while the thin-limb recommendation says `--spillPasses 1` (conservative). The wraith has BOTH dark coloring AND thin tendrils. The skill does not explicitly address this conflict. An attentive agent would need to decide which to prioritize. The most reasonable approach is to start with `--spillPasses 2` (the default) and escalate based on the green residue check, but the skill doesn't state this explicitly.

**Assessment vs baseline:** This is a significant improvement. The baseline had no mention of spillPasses at all. Now the agent at least knows the flags exist and has directional guidance for each trait. The conflict between dark-creature and thin-limb recommendations is a remaining gap, but it's a nuanced edge case rather than a fundamental missing capability.

### Phase 3: Generate Static Reference Image
The agent uses the prompt template. The skill now has a **background color decision step** before writing the prompt:
- "Default (most creatures): Use bright solid green (#00FF00) background."
- "Green/teal/olive creatures: Use bright solid magenta (#FF00FF) background."

For a dark wraith (black/purple), the agent correctly selects green background. The prompt template enforces facing left, thick black outline, centered composition.

Cleanup: `npm run asset:clean -- --input <raw> --output assets/goons/wraith-reference.png --canvas 512 --padding 20 --threshold 32`

**Improvement vs baseline:** The skill now says "If green fringe survives on a green-background creature, raise --threshold to 36 or 40." This is still the same guidance for the reference image cleanup (which uses `asset:clean`, not `process-spritesheet.mjs`). The upgraded pipeline flags apply to Phase 6 processing, not to reference cleanup. For the reference image, the threshold-based approach is acceptable since it's a single static image that can be visually inspected and regenerated if needed.

### Phase 4: Generate Idle Sprite Sheet
The agent uses the idle prompt template. The updated skill now includes a **consistency anchor** line: "Maintain EXACT proportions, colors, and features from the reference image in every frame. Do not change the creature's size, shape, or detail level between frames."

For a wraith, the agent describes "ethereal floating/swaying, tendrils drifting" as idle motion. The perfect loop guidance (frame 12 = frame 1) is solid.

**Improvement vs baseline:** The consistency anchor is new and directly addresses the animation consistency dimension. For wispy tendrils, this explicit instruction helps the image generator maintain tendril shapes across frames.

**Facing direction gate:** Same solid 3-attempt gate as baseline. Works well for wraiths.

### Phase 5: Generate Attack Sprite Sheet
The agent uses the attack prompt template with the "Ranged spell/projectile" motion arc for a shadow bolt. The template includes negative prompts, anti-pattern warnings, and per-frame facing enforcement. All preserved from v1.

**Consistency anchor** also added to the attack prompt template, which is an improvement for maintaining tendril consistency during the attack animation.

### Phase 6: Process Sprite Sheets
The agent runs:
```
node scripts/process-spritesheet.mjs <raw-idle> assets/goons/wraith_idle_512x512_sheet.png 4 3
node scripts/process-spritesheet.mjs <raw-attack> assets/goons/wraith_attack_512x512_sheet.png 4 3
```

**Major improvement:** The skill now documents the full pipeline:
1. HSV chroma-key flood fill (much more accurate than old RGB heuristic for dark creatures)
2. Green spill suppression (clamps green channel on edge pixels)
3. Alpha matting (soft edges near transparency boundary)
4. Content-aware grid detection (finds frame boundaries via transparent gaps)

The **creature-specific cleanup parameters table** tells the agent:
- Dark creatures: `--spillPasses 3` -- "Extra spill pass catches green fringe that is highly visible on dark edges"

The **cleanup flags reference table** documents all flags with defaults and purposes.

An attentive agent following the skill would run:
```
node scripts/process-spritesheet.mjs <raw-idle> assets/goons/wraith_idle_512x512_sheet.png 4 3 --spillPasses 3
node scripts/process-spritesheet.mjs <raw-attack> assets/goons/wraith_attack_512x512_sheet.png 4 3 --spillPasses 3
```

**Remaining gap:** The agent might also consider `--matteRadius 1` for the thin tendrils (from the thin-limb row), but the skill doesn't explicitly say to combine flags from multiple rows. A sophisticated agent might try `--spillPasses 3 --matteRadius 1`, but this isn't spelled out.

**Frame integrity check (NEW):** The skill now includes a dedicated frame integrity check script that reports per-frame opaque pixel counts with OK/BROKEN status and a 30,000 pixel threshold. This is a significant improvement -- the baseline only had a basic pixel count verification without the explicit threshold and BROKEN labeling.

**Green residue check:** Same as baseline, but now the remediation path is improved:
- "If green residue is found (>50 pixels on a non-green creature): Re-run with `--spillPasses 3` (or 4 for stubborn fringe)."
- "If fringe persists on dark creatures, try `--spillPasses 4 --matteRadius 3`."

This is a major improvement over the baseline's "raise threshold" advice, which was actively harmful for dark creatures. The remediation now correctly targets spill suppression instead of threshold.

**Troubleshooting decision tree (NEW):** The skill now includes a 9-entry decision tree. For the wraith's likely issues:
- "Green fringe on dark creature" → "Re-run with `--spillPasses 3` or `--spillPasses 4`" ✓
- "Thin limbs eaten/missing" → "Re-run with `--spillPasses 0 --matteRadius 0`" ✓
- "Black outline merged with dark body" → "Regenerate reference with 'thick bright-colored outline' or 'dark gray outline instead of black'" ✓

All three of the wraith's primary failure modes have specific remediation paths. This resolves the baseline's contradictory threshold advice.

### Phase 7: Wire into Codebase
Standard code wiring. Templates unchanged and correct.

### Phase 8: Update Docs and Validate
Standard. The checklist now includes:
- "Ran frame integrity check -- every frame has >=30,000 opaque pixels, no broken/clipped frames" ✓
- "Ran consistency check -- compared first and last frames for proportion/feature match" ✓
- "Chose correct background color (green default, magenta for green creatures)" ✓

## Rubric Evaluation

### Green Cleanup Quality
The skill now documents the full HSV-based pipeline with all flags. The creature-specific cleanup table explicitly recommends `--spillPasses 3` for dark creatures. The green residue check remediation now correctly says to increase spillPasses (not threshold) for dark creatures. The troubleshooting tree has a specific entry for "green fringe on dark creature." This is a substantial improvement over the baseline, which had no HSV flag documentation and gave actively harmful "raise threshold" advice. The remaining gap is the tension between spillPasses 3 (dark) and spillPasses 1 (thin tendrils) when both apply, but this is a nuanced edge case.

### Frame Integrity
The skill now includes a dedicated frame integrity check with per-frame opaque pixel counts, 30k threshold, and OK/BROKEN labeling. Content-aware grid detection is documented as the primary approach. The troubleshooting tree covers "Frames are thin vertical/horizontal slices" with `--noAutoGrid` as a fix. For the wraith, frame integrity is less of a concern (the creature is roughly centered in each frame), but the verification is now comprehensive.

### Animation Consistency
The skill now includes a consistency anchor in both idle and attack prompt templates: "Maintain EXACT proportions, colors, and features from the reference image in every frame." The checklist includes a consistency check step. The 8-frame fallback is documented. For wispy tendrils, the consistency anchor helps but AI generators will still struggle with thin, flowing features across 12 frames. The skill doesn't provide wraith-specific consistency guidance (e.g., "if tendrils change shape across frames, simplify tendril design").

### Creature-Specific Adaptation
The adaptations table now includes specific CLI flags for each creature type. Dark creatures get `--spillPasses 3`, thin-limbed creatures get `--spillPasses 1 --matteRadius 1`. The prompt-level mitigations are preserved. The remaining gap is the conflict between dark-creature and thin-limb recommendations when both apply (as with the wraith), but both rows are now actionable with specific flags rather than vague threshold advice.

### Pipeline Robustness
The troubleshooting decision tree is the biggest improvement. It covers 9 failure modes with specific fixes. For the wraith, three relevant entries exist: green fringe on dark creature, thin limbs eaten, and black outline merged with dark body. The remediation paths are specific and non-contradictory (spillPasses for fringe, reduce spillPasses for limb damage, regenerate for outline issues). This resolves the baseline's contradictory threshold advice.

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 72,
    "Frame Integrity": 73,
    "Animation Consistency": 65,
    "Creature-Specific Adaptation": 68,
    "Pipeline Robustness": 72
  },
  "reasoning": {
    "Green Cleanup Quality": "HSV pipeline flags fully documented, creature-specific table recommends --spillPasses 3 for dark creatures, remediation path now correctly targets spill suppression instead of threshold; remaining gap is conflicting advice when dark + thin traits combine.",
    "Frame Integrity": "Dedicated frame integrity check with 30k threshold and BROKEN labeling, content-aware grid detection documented, troubleshooting covers broken frames; wraith is a moderate-risk case well-covered.",
    "Animation Consistency": "Consistency anchor added to prompt templates and checklist includes consistency check; 8-frame fallback documented; but no wraith-specific guidance for maintaining wispy tendril shapes across frames.",
    "Creature-Specific Adaptation": "Adaptations table now has specific CLI flags for dark creatures (--spillPasses 3) and thin-limbed creatures (--spillPasses 1 --matteRadius 1); remaining gap is unresolved conflict when both traits apply simultaneously.",
    "Pipeline Robustness": "Troubleshooting decision tree covers green fringe on dark creature, thin limbs eaten, and outline merged with body -- all three wraith failure modes have specific non-contradictory remediation paths."
  }
}
-->
