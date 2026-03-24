# Iteration 2 Dry-Run: Case 02 -- Vine Beast (Thornvine Horror)

## Test Case Summary
- **Creature:** Thornvine Horror (`thornvine`) -- twisted green/olive vines, red thorns, glowing orange eyes, coiled serpentine shape
- **Primary challenges:** Green-on-green separation, frame integrity with complex irregular shapes, display-size readability
- **Attack type:** Melee lunge (vine whip toward left)

## Iteration 2 Changes Relevant to This Case

Building on iteration 1's magenta background strategy and frame integrity checks, iteration 2 adds:

1. **Combined-trait adaptation: "green + thin"** -- Vine tendrils are both green AND thin. The skill now explicitly addresses this: "Use magenta background + `--hueLo 270 --hueHi 330 --spillPasses 1 --matteRadius 1`. Magenta removal is less aggressive on thin features than green removal." This combines the magenta background strategy with conservative cleanup for thin vine tendrils.
2. **Animation consistency verification section** with silhouette check, feature count check, and facing check.
3. **Creature-specific consistency tips table** -- The "Complex organic" row applies: "The creature's overall silhouette shape stays consistent. Only small movements within the existing shape, not structural changes." This is added to the prompt.
4. **Consistency degradation fallback** -- Three-step escalation: (1) regenerate with stronger reference-locking, (2) reduce to 8 frames, (3) reduce to 6 frames.

## Dry-Run Execution Plan

### Phase 1: Read Project Context
Standard doc reads. No issues.

### Phase 2: Define the Goon
The agent defines goonType `thornvine`, display name "Thornvine Horror", stats, skill (`thornvine-whip-skill` using `poisonHero` effect), spawn weight.

**Creature-specific adaptation lookup:** The agent consults the adaptations table and identifies:
- **"Green/teal coloring"**: Use magenta (#FF00FF) background. Process with `--hueLo 270 --hueHi 330`.
- **"Thin limbs or fine detail"** (vine tendrils): `--spillPasses 1 --matteRadius 1`.
- **NEW -- "Combined: green + thin"**: The skill now explicitly resolves this combination: "Use magenta background + `--hueLo 270 --hueHi 330 --spillPasses 1 --matteRadius 1`. Magenta removal is less aggressive on thin features than green removal."

**Improvement over iter 1:** In iteration 1, the agent would apply the magenta background strategy (from the green-creature row) and the default cleanup parameters. The thin-limb flags (`--spillPasses 1 --matteRadius 1`) were documented separately but the skill didn't explicitly say to combine them with the magenta hue targeting. Now the combined adaptation spells out the full flag set in one place. Additionally, the note that "magenta removal is less aggressive on thin features than green removal" provides useful context -- the agent understands WHY this combination works.

**Consistency tips lookup:** The agent consults the new creature-specific consistency tips table:
- **"Complex organic"**: "Add: 'The creature's overall silhouette shape stays consistent. Only small movements within the existing shape, not structural changes.'"

This provides vine-specific prompt guidance that was absent in iteration 1. The evaluator noted: "vine creatures are among the hardest to keep consistent -- each frame may have different vine configurations regardless of prompt instructions." The complex organic tip constrains shape variation to "small movements within the existing shape."

### Phase 3: Generate Static Reference Image
The agent uses the magenta prompt template (correctly identified from the green-creature adaptation). The prompt includes:
- "bright solid magenta (#FF00FF) background"
- "thick black outline"
- "strong readable silhouette that works at small display sizes like 120x150 pixels"
- Vine-specific appearance: twisted green/olive vines, red thorns, glowing orange eyes

Cleanup: `npm run asset:clean -- --input <raw> --output assets/goons/thornvine-reference.png --canvas 512 --padding 20 --threshold 32`

Same as iter 1 -- the reference cleanup uses `asset:clean` which handles magenta adequately since magenta is far from the creature's olive/forest green. The minor gap about magenta-specific `asset:clean` flags persists but remains low-risk for a single reference image.

### Phase 4: Generate Idle Sprite Sheet
The agent uses the idle prompt template with magenta background (matching reference).

**Consistency anchor:** "Maintain EXACT proportions, colors, and features from the reference image in every frame." Preserved from iter 1.

**NEW -- Complex organic consistency tip injected into prompt:** "The creature's overall silhouette shape stays consistent. Only small movements within the existing shape, not structural changes."

**Improvement over iter 1:** This tip directly addresses the vine beast's core consistency challenge. In iteration 1, the evaluator noted: "The skill doesn't provide vine-specific consistency guidance (e.g., 'simplify vine design to 3-4 main tendrils for better frame-to-frame consistency')." The complex organic tip doesn't go as far as suggesting simplification, but it constrains the AI generator to "small movements within the existing shape" rather than allowing structural reshaping between frames. This is a meaningful improvement.

Idle motion: "vines swaying subtly, thorns pulsing, body coiling slightly -- all movements within the existing shape, no structural changes."

**Facing direction gate:** Works for vine creatures. The coiled serpentine shape with eyes on one side makes direction verifiable.

### Phase 5: Generate Attack Sprite Sheet
The agent uses the "Melee lunge (biting, clawing, pouncing)" motion arc adapted for a vine whip: "vine extending and whipping toward the LEFT edge."

The attack prompt also uses magenta background and includes the complex organic consistency tip. The vine whip extension is described as a controlled motion that maintains the overall body shape while one or two tendrils extend toward the left.

All v1 direction enforcement preserved (negative prompts, anti-patterns, per-frame facing).

### Phase 6: Process Sprite Sheets
The agent runs:
```
node scripts/process-spritesheet.mjs <raw-idle> assets/goons/thornvine_idle_512x512_sheet.png 4 3 --hueLo 270 --hueHi 330 --spillPasses 1 --matteRadius 1
node scripts/process-spritesheet.mjs <raw-attack> assets/goons/thornvine_attack_512x512_sheet.png 4 3 --hueLo 270 --hueHi 330 --spillPasses 1 --matteRadius 1
```

**Improvement over iter 1:** In iteration 1, the agent would run `--hueLo 270 --hueHi 330` (from the green-creature row) but use default spillPasses (2) and matteRadius (2). Now the combined "green + thin" adaptation explicitly says to use `--spillPasses 1 --matteRadius 1` alongside the magenta hue targeting. This provides better protection for thin vine tendrils during magenta removal.

The note that "magenta removal is less aggressive on thin features than green removal" is also valuable context. Magenta (hue 270-330) is far from any natural creature coloring, so the HSV chroma-key is highly selective. Combined with conservative spill passes and matting, thin vine tendrils are well-protected.

**Green residue check:** The skill's green pixel check correctly handles green-skinned creatures on magenta backgrounds: "green pixel counts reflect the creature's real coloring and are correct." The agent won't false-alarm on the vine beast's natural green pixels.

**Frame integrity check:** Per-frame opaque pixel count with 30k threshold. Vine creatures with complex shapes may have variable pixel counts across frames (more vines extended = more pixels), but each frame should exceed 30k if properly extracted. The BROKEN labeling catches grid detection failures.

**NEW -- Animation consistency verification:** After processing, the agent runs:
1. **Silhouette check:** Compare frame 0 and last frame -- the vine beast's overall coiled shape should be similar in both. This catches cases where the vine mass reshapes dramatically.
2. **Feature count check:** Count major vine tendrils in frames 0, 4, and 8. If tendril count or arrangement varies wildly, the sheet has consistency degradation.
3. **Facing check:** Confirm left-facing in frames 0, 4, 8, and last frame.

**Improvement over iter 1:** Iteration 1 had no structured consistency verification for vine creatures. The evaluator noted this gap. Now the three-check procedure provides a clear pass/fail assessment. The feature count check is particularly valuable for vine creatures where the number and arrangement of tendrils can drift across frames.

**NEW -- Consistency degradation fallback:** If consistency checks fail:
1. First try: regenerate with stronger reference-locking + complex organic tip.
2. Second try: reduce to 8 frames (4x2). Fewer frames = less opportunity for vine shape drift.
3. Third try: reduce to 6 frames (3x2) as last resort.

For vine creatures, reducing frame count is particularly effective because the complex organic shape has more opportunity to drift with more frames. 8 frames at 20fps = 0.4s idle loop is still smooth enough for a vine swaying animation.

### Phase 7: Wire into Codebase
Standard code wiring. Templates unchanged and correct.

### Phase 8: Update Docs and Validate
Standard. Checklist includes animation consistency verification items.

## Rubric Evaluation

### Green Cleanup Quality
The magenta background strategy from iteration 1 remains the foundation and is fundamentally sound. The new combined "green + thin" adaptation adds conservative cleanup flags (`--spillPasses 1 --matteRadius 1`) alongside the magenta hue targeting, providing better protection for thin vine tendrils. The green pixel check correctly handles green-skinned creatures. The remaining minor gap (magenta-specific `asset:clean` flags for reference cleanup) persists but is low-risk. Overall, the green cleanup quality for the vine beast is strong -- the creature's green coloring is fully preserved because magenta targeting has zero overlap with olive/forest green hues.

### Frame Integrity
Same solid coverage as iteration 1: content-aware grid detection, frame integrity check with 30k threshold, troubleshooting tree covering broken frames. The combined "green + thin" adaptation's conservative cleanup parameters (`--spillPasses 1 --matteRadius 1`) also help frame integrity by reducing edge erosion that could affect frame boundaries. No new frame-integrity-specific improvements in iter 2, but the existing coverage plus the conservative cleanup parameters provide good protection.

### Animation Consistency
This is the dimension with the most improvement for the vine beast in iteration 2. Three new features address vine consistency:
1. The "complex organic" consistency tip constrains shape variation to "small movements within the existing shape."
2. The structured consistency verification (silhouette, feature count, facing) provides post-processing checks.
3. The three-step degradation fallback provides a clear escalation, and reducing frame count is particularly effective for complex organic shapes.

In iteration 1, the evaluator noted: "vine creatures are among the hardest to keep consistent and no vine-specific simplification guidance is provided." The complex organic tip partially addresses this by constraining variation. It doesn't go as far as suggesting design simplification (e.g., "limit to 3-4 main tendrils"), but it provides a meaningful constraint that AI generators can follow.

### Creature-Specific Adaptation
The combined "green + thin" adaptation is the key improvement. The vine beast's dual nature (green coloring + thin tendrils) is now explicitly addressed with a single combined flag set. The complex organic consistency tip adds prompt-level guidance. Both improvements are concrete and actionable. The magenta background strategy from iter 1 remains the foundation. The vine beast is now one of the best-covered creature types in the skill.

### Pipeline Robustness
The troubleshooting tree from iter 1 is preserved. The new consistency degradation fallback adds a structured escalation for animation consistency failures. The combined "green + thin" adaptation reduces ambiguity in flag selection. The pipeline handles the vine beast's primary failure modes (green-on-green, frame integrity, consistency) with specific, non-contradictory remediation paths.

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 82,
    "Frame Integrity": 72,
    "Animation Consistency": 70,
    "Creature-Specific Adaptation": 82,
    "Pipeline Robustness": 77
  },
  "reasoning": {
    "Green Cleanup Quality": "Magenta background strategy preserved; combined green+thin adaptation adds conservative spillPasses/matteRadius alongside magenta hue targeting for better thin-tendril protection; creature coloring fully preserved with zero hue overlap.",
    "Frame Integrity": "Content-aware grid detection, 30k threshold, troubleshooting tree all preserved; conservative cleanup parameters from green+thin adaptation reduce edge erosion risk; solid but no new frame-specific improvements.",
    "Animation Consistency": "Complex organic consistency tip constrains shape variation to small movements; structured 3-check verification catches drift; 3-step degradation fallback is particularly effective for complex organic shapes; partial but meaningful closure of the vine-specific consistency gap.",
    "Creature-Specific Adaptation": "Combined green+thin adaptation provides explicit flag set for dual-trait creatures; complex organic consistency tip adds prompt-level guidance; vine beast is now well-covered with concrete, actionable instructions.",
    "Pipeline Robustness": "Preserved troubleshooting tree plus consistency degradation fallback; combined-trait adaptation reduces flag selection ambiguity; pipeline handles green-on-green, frame integrity, and consistency with specific remediation paths."
  }
}
-->
