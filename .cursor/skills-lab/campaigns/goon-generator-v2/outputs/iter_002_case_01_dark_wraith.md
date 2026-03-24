# Iteration 2 Dry-Run: Case 01 -- Dark Wraith (Shadow Wraith)

## Test Case Summary
- **Creature:** Shadow Wraith (`wraith`) -- dark robes, tendrils, deep black/purple, wispy edges
- **Primary challenges:** Green fringe on dark edges, thin tendril preservation, dark body vs black outline
- **Attack type:** Ranged spell (shadow bolt toward left)

## Iteration 2 Changes Relevant to This Case

Building on iteration 1's HSV cleanup flags and troubleshooting tree, iteration 2 adds:

1. **Combined-trait adaptation: "dark + thin"** -- The wraith's core tension (dark edges need `--spillPasses 3` but thin tendrils need `--spillPasses 1`) is now explicitly addressed with a compromise: `--spillPasses 2 --matteRadius 1`. The skill says: "If green fringe remains on the body, manually inspect thin limbs after each spill pass increase. Prefer `--spillPasses 2` over `3` to protect limbs."
2. **Animation consistency verification section** with three explicit checks: silhouette check (compare frame 0 and last frame shape), feature count check (count visible features in frames 0, 4, 8), and facing check (confirm left-facing in frames 0, 4, 8, last).
3. **Creature-specific consistency tips table** -- The "Wispy/ethereal" row applies directly: "The creature's wispy tendrils maintain the same general flow direction and count in every frame. Only subtle movement, not reshaping." This is added to the prompt.
4. **Consistency degradation fallback** -- Three-step escalation: (1) regenerate with stronger reference-locking, (2) reduce to 8 frames (4x2), (3) reduce to 6 frames (3x2) as last resort.

## Dry-Run Execution Plan

### Phase 1: Read Project Context
Standard doc reads. No issues.

### Phase 2: Define the Goon
The agent defines goonType `wraith`, display name "Shadow Wraith", stats, skill (`wraith-bolt-skill`), spawn weight.

**Creature-specific adaptation lookup:** The agent consults the adaptations table and now finds:
- **"Dark coloring near black"**: `--spillPasses 3`, thick outline prompt, verify no green fringe on dark edges.
- **"Thin limbs or fine detail"** (wispy tendrils): `--spillPasses 1 --matteRadius 1`.
- **NEW -- "Combined: dark + thin"**: The skill now explicitly resolves this conflict: "Use `--spillPasses 2 --matteRadius 1` as a compromise. If green fringe remains on the body, manually inspect thin limbs after each spill pass increase. Prefer `--spillPasses 2` over `3` to protect limbs."

**Major improvement over iter 1:** In iteration 1, the agent had to independently reason through the dark-vs-thin tension. The evaluator noted: "The skill does not explicitly address this conflict." Now the skill provides a specific compromise value (`--spillPasses 2 --matteRadius 1`) and a clear decision heuristic (prefer protecting limbs over aggressive fringe removal). This eliminates the ambiguity that was the primary remaining gap for this test case.

**Consistency tips lookup:** The agent also consults the new creature-specific consistency tips table and finds:
- **"Wispy/ethereal"**: "Add: 'The creature's wispy tendrils maintain the same general flow direction and count in every frame. Only subtle movement, not reshaping.'"

This provides wraith-specific prompt guidance that was absent in iteration 1.

### Phase 3: Generate Static Reference Image
The agent uses the prompt template. Dark wraith → green background (correct). The prompt includes:
- "clearly visible thick black outline that contrasts with the dark body" (from dark-creature adaptation)
- "facing left" (mentioned twice)
- "strong readable silhouette that works at small display sizes like 120x150 pixels"

Cleanup: standard `asset:clean` with `--threshold 32`. Same as iter 1 -- the reference cleanup is for a single image and works adequately.

### Phase 4: Generate Idle Sprite Sheet
The agent uses the idle prompt template. The consistency anchor ("Maintain EXACT proportions...") is preserved from iter 1.

**NEW -- Wispy/ethereal consistency tip injected into prompt:** The agent adds "The creature's wispy tendrils maintain the same general flow direction and count in every frame. Only subtle movement, not reshaping." This is a targeted instruction that addresses the specific failure mode where AI generators produce wildly different tendril shapes across frames.

**Improvement over iter 1:** Iteration 1 had only the generic consistency anchor. Now the agent has a wraith-specific instruction that constrains tendril variation to "subtle movement, not reshaping." This directly addresses the test case's "inconsistent tendril shapes across frames" failure mode.

The idle motion description: "ethereal floating/swaying, tendrils drifting subtly while maintaining their general flow direction."

**Facing direction gate:** Preserved from v1. Works well for wraiths.

### Phase 5: Generate Attack Sprite Sheet
The agent uses the "Ranged spell/projectile" motion arc for a shadow bolt. All v1 direction enforcement preserved (negative prompts, anti-patterns, per-frame facing).

**NEW -- Wispy/ethereal consistency tip also applied to attack prompt.** The tendrils should maintain their flow direction even during the casting animation. This prevents the common failure where tendrils reshape dramatically during the attack wind-up.

### Phase 6: Process Sprite Sheets
The agent runs:
```
node scripts/process-spritesheet.mjs <raw-idle> assets/goons/wraith_idle_512x512_sheet.png 4 3 --spillPasses 2 --matteRadius 1
node scripts/process-spritesheet.mjs <raw-attack> assets/goons/wraith_attack_512x512_sheet.png 4 3 --spillPasses 2 --matteRadius 1
```

**Major improvement over iter 1:** The agent no longer has to guess the flag values. The combined "dark + thin" adaptation explicitly says `--spillPasses 2 --matteRadius 1`. In iteration 1, the agent would have chosen either `--spillPasses 3` (dark) or `--spillPasses 1` (thin) and potentially gotten the wrong trade-off. Now the compromise is spelled out.

**Escalation path if green fringe remains:** The skill says "manually inspect thin limbs after each spill pass increase." So if `--spillPasses 2` leaves green fringe on the body:
1. Try `--spillPasses 3 --matteRadius 1` (increase spill passes but keep conservative matting)
2. After processing, inspect thin tendrils -- if they survived, keep; if damaged, revert to `--spillPasses 2` and accept slight fringe

This is a well-defined escalation that balances both concerns.

**Frame integrity check:** Per-frame opaque pixel count with 30k threshold. Preserved from iter 1.

**Green residue check:** Same as iter 1. Remediation path now starts from `--spillPasses 2` (the compromise) rather than the default `--spillPasses 2`, so the first escalation step is `--spillPasses 3`.

**Outline integrity check:** Preserved from iter 1. Verify black outline visible, thin features preserved.

**NEW -- Animation consistency verification:** After processing, the agent now runs three explicit checks:
1. **Silhouette check:** Compare frame 0 and last frame -- the wraith's overall shape (robe width, tendril extent) should be similar. This catches cases where the wraith shrinks or grows across the animation.
2. **Feature count check:** For the wraith, count visible tendrils in frames 0, 4, and 8. If tendril count varies significantly, the sheet has consistency degradation.
3. **Facing check (redundant but critical):** Confirm left-facing in frames 0, 4, 8, and last frame. Redundant with the Phase 4/5 gates but provides a safety net after processing.

**Improvement over iter 1:** Iteration 1 had a checklist item "Ran consistency check -- compared first and last frames for proportion/feature match" but no structured verification procedure. Now there are three specific checks with clear pass/fail criteria. The feature count check is particularly valuable for the wraith's tendrils.

**NEW -- Consistency degradation fallback:** If the consistency checks fail:
1. First try: regenerate with stronger reference-locking: "Maintain EXACT proportions, limb count, and features from the reference image in EVERY frame."
2. Second try: reduce to 8 frames (4x2 grid). For the wraith, 8 frames at 20fps = 0.4s idle loop, 8 frames at 24fps = 0.33s attack. Slightly choppier but functional.
3. Third try: reduce to 6 frames (3x2 grid) as last resort.

**Improvement over iter 1:** Iteration 1 mentioned the 8-frame fallback but didn't provide a structured escalation. Now there are three explicit steps, and the 6-frame last resort is new.

### Phase 7: Wire into Codebase
Standard code wiring. Templates unchanged and correct.

### Phase 8: Update Docs and Validate
Standard. Checklist now includes the animation consistency verification items.

## Rubric Evaluation

### Green Cleanup Quality
The combined "dark + thin" adaptation (`--spillPasses 2 --matteRadius 1`) directly resolves the primary remaining gap from iteration 1. The agent no longer has to independently reason through conflicting flag recommendations. The escalation path (try spillPasses 3 if fringe remains, inspect tendrils after each increase) is well-defined. The HSV pipeline documentation, green residue check, and remediation paths are all preserved. The only remaining gap is that the compromise may still leave slight green fringe on the darkest edges -- but the skill acknowledges this trade-off ("prefer `--spillPasses 2` over `3` to protect limbs") and provides an explicit escalation path.

### Frame Integrity
Same as iteration 1 for this test case. The frame integrity check with 30k threshold, content-aware grid detection, and troubleshooting tree are all preserved. The wraith is a moderate-risk case for frame integrity (not as risky as the vine beast). No new improvements specific to frame integrity in iter 2, but the existing coverage is solid.

### Animation Consistency
This is the dimension with the most improvement in iteration 2. Three new features directly address wraith consistency:
1. The wispy/ethereal consistency tip provides wraith-specific prompt guidance ("tendrils maintain same flow direction and count").
2. The structured consistency verification (silhouette, feature count, facing) provides post-processing checks.
3. The three-step degradation fallback (re-prompt → 8 frames → 6 frames) provides a clear escalation when consistency fails.

In iteration 1, the evaluator noted: "no wraith-specific guidance for maintaining wispy tendril shapes across frames." This gap is now closed by the wispy/ethereal consistency tip.

### Creature-Specific Adaptation
The combined "dark + thin" adaptation is the key improvement. The wraith's dual-trait nature (dark body + thin tendrils) was the primary unresolved tension in iteration 1. Now the skill provides a specific compromise (`--spillPasses 2 --matteRadius 1`) with a clear decision heuristic. The wispy/ethereal consistency tip adds prompt-level guidance specific to the wraith's tendril nature. Both improvements are concrete and actionable.

### Pipeline Robustness
The troubleshooting tree is preserved from iteration 1. The new consistency degradation fallback adds a structured escalation for animation consistency failures (re-prompt → 8 frames → 6 frames). The combined-trait adaptation reduces the chance of the agent making a wrong flag decision. The pipeline is more robust because there are fewer ambiguous decision points -- the agent has explicit guidance for the wraith's specific combination of traits.

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 80,
    "Frame Integrity": 74,
    "Animation Consistency": 78,
    "Creature-Specific Adaptation": 80,
    "Pipeline Robustness": 77
  },
  "reasoning": {
    "Green Cleanup Quality": "Combined dark+thin adaptation resolves the spillPasses conflict with explicit compromise (--spillPasses 2 --matteRadius 1) and escalation path; eliminates the primary remaining gap from iter 1.",
    "Frame Integrity": "Same solid coverage as iter 1 -- 30k threshold, content-aware grid detection, troubleshooting tree; no new frame-integrity-specific improvements but existing coverage is adequate for the wraith.",
    "Animation Consistency": "Three major improvements: wispy/ethereal consistency tip for tendril-specific prompt guidance, structured 3-check verification (silhouette/feature-count/facing), and 3-step degradation fallback; closes the iter 1 gap of no wraith-specific consistency guidance.",
    "Creature-Specific Adaptation": "Combined dark+thin adaptation provides explicit compromise flags and decision heuristic; wispy/ethereal consistency tip adds prompt-level guidance; both are concrete, actionable, and specific to the wraith's dual-trait nature.",
    "Pipeline Robustness": "Preserved troubleshooting tree plus new consistency degradation fallback (re-prompt → 8 frames → 6 frames); fewer ambiguous decision points due to combined-trait adaptation resolving flag conflicts."
  }
}
-->
