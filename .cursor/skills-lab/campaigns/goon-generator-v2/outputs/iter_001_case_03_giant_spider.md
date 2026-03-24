# Iteration 1 Dry-Run: Case 03 -- Giant Spider (Cavern Stalker)

## Test Case Summary
- **Creature:** Cavern Stalker (`stalker`) -- large dark spider, eight thin legs, bulbous abdomen, red eyes, dark brown/black coloring
- **Primary challenges:** Thin leg preservation during cleanup, animation consistency for 8 legs across 12 frames, small creature on large canvas
- **Attack type:** Melee lunge (pouncing bite toward left)

## Skill Changes Relevant to This Case
The updated skill now includes:
1. **Creature-specific cleanup parameters table** with explicit `--spillPasses 1 --matteRadius 1` for thin-limbed creatures, and `--spillPasses 0 --matteRadius 0` fallback for fragile features.
2. **Cleanup flags reference table** documenting all flags with defaults and purposes.
3. **Phase 6 rewritten** to document the 3-pass pipeline including alpha matting (soft edges help thin features).
4. **Frame integrity check** with per-frame opaque pixel count and 30k threshold.
5. **Troubleshooting decision tree** with "Thin limbs eaten/missing" → `--spillPasses 0 --matteRadius 0` and "Character proportions change across frames" → reduce to 8 frames.
6. **Consistency anchor** in prompt templates: "Maintain EXACT proportions, colors, and features from the reference image in every frame."

## Dry-Run Execution Plan

### Phase 1: Read Project Context
Standard doc reads. No issues.

### Phase 2: Define the Goon
The agent defines goonType `stalker`, display name "Cavern Stalker", stats, skill (`stalker-venom-skill` using `poisonHero` effect), spawn weight.

**Creature-specific adaptation lookup:** The agent consults the adaptations table and identifies:
- **"Thin limbs or fine detail"**: Skill now says: "Use conservative cleanup: `--spillPasses 1 --matteRadius 1`. After processing, zoom into thin features and confirm they survived with black outline intact. If limbs are lost, try `--spillPasses 0 --matteRadius 0` for zero edge erosion."
- **"Massive/unusual proportions"**: "Emphasize 'the creature fits entirely within the frame with no clipping.' Consider whether the silhouette is recognizable at small display size."

**Improvement vs baseline:** The baseline mentioned "lower cleanup threshold (24-28)" for thin limbs but didn't document the spillPasses or matteRadius flags. Now the agent has specific, actionable flags: `--spillPasses 1 --matteRadius 1` as the primary approach, with `--spillPasses 0 --matteRadius 0` as a fallback. This is a concrete improvement -- the agent knows exactly which flags to use and has a clear escalation path.

**Remaining gap:** The skill doesn't provide spider-specific guidance like "explicitly state '8 legs visible in every frame' in the prompt" or "compare leg count between frame 1 and frames 7-12." The multi-limbed consistency problem is addressed only by the general consistency anchor and the 8-frame fallback, not by spider-specific instructions.

### Phase 3: Generate Static Reference Image
The agent uses the prompt template. The spider is dark brown/black (not green), so the agent correctly selects green background. The prompt includes "thick black outline" and "strong readable silhouette that works at small display sizes like 120x150 pixels."

Cleanup: `npm run asset:clean -- --input <raw> --output assets/goons/stalker-reference.png --canvas 512 --padding 20 --threshold 32`

The adaptations table says to use conservative cleanup for thin limbs, but this applies to `process-spritesheet.mjs` (Phase 6), not `asset:clean` (Phase 3). For the reference image, the standard threshold is acceptable since it's a single image that can be visually inspected.

### Phase 4: Generate Idle Sprite Sheet
The agent uses the idle prompt template with spider-specific motion: "subtle leg movement, body swaying, abdomen pulsing."

**Consistency anchor (NEW):** "Maintain EXACT proportions, colors, and features from the reference image in every frame. Do not change the creature's size, shape, or detail level between frames."

This is a meaningful improvement for spiders. The explicit instruction to maintain exact proportions helps the image generator keep 8 legs consistent across frames. However, AI generators still fundamentally struggle with multi-limbed creatures, and the consistency anchor alone may not prevent leg degradation in later frames.

**Facing direction gate:** Works well for spiders. The asymmetric body (head vs abdomen) makes direction easy to verify.

**Perfect loop guidance:** Frame 12 = Frame 1 for seamless loop. For a spider, this means the leg positions in frame 12 must match frame 1. The skill's loop guidance is adequate.

### Phase 5: Generate Attack Sprite Sheet
The agent uses the "Melee lunge (biting, clawing, pouncing)" motion arc template for a pouncing bite. The template describes the lunge going toward the left edge, which is correct for a spider pounce.

**Consistency anchor** also in the attack template. The negative prompts and anti-pattern warnings are preserved from v1.

**Remaining gap:** The attack prompt doesn't include spider-specific guidance like "maintain all 8 legs throughout the pounce sequence" or "legs should extend and retract symmetrically during the pounce." The general consistency anchor partially addresses this but isn't specific enough for multi-limbed attack animations.

### Phase 6: Process Sprite Sheets
The agent runs:
```
node scripts/process-spritesheet.mjs <raw-idle> assets/goons/stalker_idle_512x512_sheet.png 4 3 --spillPasses 1 --matteRadius 1
node scripts/process-spritesheet.mjs <raw-attack> assets/goons/stalker_attack_512x512_sheet.png 4 3 --spillPasses 1 --matteRadius 1
```

**Improvement:** The creature-specific cleanup parameters table explicitly recommends `--spillPasses 1 --matteRadius 1` for thin-limbed creatures. The baseline had no flag documentation, so the agent would have used defaults (spillPasses 2, matteRadius 2), which are more aggressive and could eat thin legs.

With `--spillPasses 1`, only one pass of green spill suppression runs, reducing the risk of eating into thin legs. With `--matteRadius 1`, the alpha matting radius is smaller, creating less edge erosion on thin features.

**Fallback path:** If legs are still lost after processing, the skill says to try `--spillPasses 0 --matteRadius 0` for zero edge erosion. This may leave slight green fringe but preserves all features. The agent has a clear escalation path:
1. Try `--spillPasses 1 --matteRadius 1` (conservative)
2. If legs lost → try `--spillPasses 0 --matteRadius 0` (zero erosion)
3. Accept slight fringe as trade-off for leg preservation

**Green residue check:** The spider is dark brown/black, so the green pixel check works normally. Any bright green between legs would be detected. The remediation now says to increase spillPasses (not threshold), which is correct. However, for a spider where we deliberately used low spillPasses to preserve legs, increasing spillPasses conflicts with the thin-limb strategy.

**Tension identified:** The green residue check says "Re-run with `--spillPasses 3`" but the thin-limb strategy says `--spillPasses 1`. If green fringe remains between thin legs after spillPasses 1, the agent faces a trade-off: more fringe removal (spillPasses 3) vs leg preservation (spillPasses 1). The troubleshooting tree partially addresses this: "Thin limbs eaten/missing" → `--spillPasses 0 --matteRadius 0`. But it doesn't explicitly say "if you have BOTH green fringe AND thin limbs, accept slight fringe to preserve legs." An attentive agent would figure this out, but the skill doesn't spell it out.

**Frame integrity check (NEW):** Per-frame opaque pixel count with 30k threshold. For a spider, some frames during the pounce may have lower pixel counts (legs extended, body stretched), but should still exceed 30k if the body is intact. The check catches broken frames from grid detection failures.

**Troubleshooting decision tree:** For the spider's likely issues:
- "Thin limbs eaten/missing" → "Re-run with `--spillPasses 0 --matteRadius 0`" ✓
- "Character proportions change across frames" → "Reduce frame count to 8 (4x2 grid) as fallback; adjust frameRate to compensate" ✓
- "Green fringe on dark creature" → "Re-run with `--spillPasses 3` or `--spillPasses 4`" -- This conflicts with thin-limb preservation but is technically applicable since the spider is dark.

### Phase 7: Wire into Codebase
Standard code wiring. Templates unchanged and correct.

### Phase 8: Update Docs and Validate
Standard. Checklist includes frame integrity check, consistency check, and background color choice.

## Rubric Evaluation

### Green Cleanup Quality
The spider is dark brown/black on green background -- a moderate cleanup case. The skill now provides specific flags for thin-limbed creatures (`--spillPasses 1 --matteRadius 1`) which is a better approach than the baseline's threshold-only guidance. The green pixel check works correctly for dark spiders. The remediation path is improved (spillPasses instead of threshold). The remaining tension is the conflict between green fringe removal (needs more spillPasses) and leg preservation (needs fewer spillPasses) -- the skill doesn't explicitly address this trade-off, though the troubleshooting tree covers each failure mode individually.

### Frame Integrity
The frame integrity check with 30k threshold and BROKEN labeling is a solid improvement. Content-aware grid detection is documented. For a spider, the uniform grid should work reasonably well, but the auto-detection provides a safety net. The troubleshooting tree covers broken frames. The remaining gap is that the skill doesn't address what happens when a spider's extended legs cross grid boundaries during a pounce frame, but this is an edge case.

### Animation Consistency
The consistency anchor is a meaningful improvement for multi-limbed creatures. The 8-frame fallback is documented with a specific trigger in the troubleshooting tree ("Character proportions change across frames"). However, the skill still lacks spider-specific guidance: no "verify 8 legs in every frame" instruction, no "compare leg count between frame 1 and frame 8" check, no "explicitly mention leg count in every frame description" prompt guidance. The general consistency anchor helps but doesn't fully solve the multi-limbed consistency problem.

### Creature-Specific Adaptation
The adaptations table now provides specific CLI flags for thin-limbed creatures (`--spillPasses 1 --matteRadius 1`) with a clear fallback (`--spillPasses 0 --matteRadius 0`). This is a concrete improvement over the baseline's vague "threshold 24-28" advice. The prompt-level mitigations are preserved. The remaining gap is the lack of multi-limbed-specific prompt guidance and the unresolved tension between green fringe removal and leg preservation.

### Pipeline Robustness
The troubleshooting tree covers thin limbs eaten (spillPasses 0), proportion changes (reduce to 8 frames), and green fringe on dark creature (spillPasses 3). Each failure mode has a specific fix. The remaining gap is the unresolved conflict when both green fringe AND thin limbs are issues simultaneously -- the tree covers each individually but doesn't provide a combined strategy. An agent would need to reason through the trade-off independently.

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 63,
    "Frame Integrity": 68,
    "Animation Consistency": 55,
    "Creature-Specific Adaptation": 62,
    "Pipeline Robustness": 63
  },
  "reasoning": {
    "Green Cleanup Quality": "Specific --spillPasses 1 --matteRadius 1 flags for thin-limbed creatures are a concrete improvement over baseline threshold-only guidance; remaining tension between fringe removal and leg preservation is unresolved but each path is individually documented.",
    "Frame Integrity": "Frame integrity check with 30k threshold catches broken frames, content-aware grid detection documented, troubleshooting covers broken frames; spider pounce frames with extended legs are an edge case not specifically addressed.",
    "Animation Consistency": "Consistency anchor helps maintain proportions but no spider-specific multi-limbed guidance (verify 8 legs, mention leg count in prompts); 8-frame fallback documented but general, not spider-specific.",
    "Creature-Specific Adaptation": "Specific CLI flags for thin-limbed creatures with clear fallback path; concrete improvement over vague threshold advice; but no multi-limbed prompt guidance or leg-count verification step.",
    "Pipeline Robustness": "Troubleshooting tree covers thin limbs, proportion changes, and green fringe individually; combined green-fringe-plus-thin-limbs scenario not explicitly addressed but each path is actionable."
  }
}
-->
