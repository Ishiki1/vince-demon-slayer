# Baseline Dry-Run: Case 04 -- Broodmother (Broodmother Arachne)

## Test Case Summary
- **Creature:** Broodmother Arachne (`broodmother`) -- massive spider, egg sac, thick legs, multiple red eyes, dark purple/brown
- **Primary challenges:** Direction consistency across all frames, large creature framing, green fringe on leg tips, boss-quality animation
- **Attack type:** Melee lunge (venomous bite toward left) + spawns spiderlings

## Dry-Run Execution Plan

### Phase 1: Read Project Context
Standard doc reads. No issues.

### Phase 2: Define the Goon
The agent defines goonType `broodmother`, display name "Broodmother Arachne", stats (likely high hpMult for a boss), skill (e.g. `broodmother-venom-skill`), spawn weight (low, since it is a boss).

**Skill guidance for this creature type:**
- The adaptation table identifies "Massive/unusual proportions" as applicable: "emphasize 'the creature fits entirely within the frame with no clipping.' Consider whether the silhouette is recognizable at small display size."
- Also applicable: "Thin limbs or fine detail" for leg tips, and "Melee/slam attacks" for the venomous bite.
- The melee attack guidance says: describe the attack as going toward the LEFT.

**Assessment:** The adaptation table provides reasonable coverage for the broodmother. The massive proportions guidance is important -- the broodmother fills the frame, so clipping is a real risk. The thin limbs guidance applies to leg tips. The facing direction enforcement is the skill's strongest area and directly addresses the broodmother's primary challenge.

### Phase 3: Generate Static Reference Image
The agent uses the prompt template with broodmother-specific description. The green background is appropriate (creature is dark purple/brown). The prompt would emphasize:
- "the creature fits entirely within the frame with no clipping"
- "facing left" (mentioned twice per template)
- Egg sac visible, all legs clear

Cleanup with `--threshold 28` (following thin-limb guidance for leg tips). The reference cleanup should work reasonably well for a dark creature on green background.

**Potential issue:** The broodmother is large, so the `--padding 20` centering might clip leg tips if the creature extends close to the edges. The skill doesn't provide specific padding guidance for large creatures.

### Phase 4: Generate Idle Sprite Sheet
The agent uses the idle prompt template with broodmother-specific motion: "menacing breathing, abdomen pulsing, legs shifting weight."

**Direction consistency -- the primary test:** The skill's facing direction gate is well-designed:
- 3-attempt maximum
- Specific visual cues to check (head/face/eyes point left, asymmetric features on left side)
- "If ANY frame faces right, regenerate the entire sheet"

For the broodmother, the egg sac is a strong asymmetric feature that makes direction easy to verify. The skill's gate should catch direction flips in the idle sheet.

**Animation consistency:** The broodmother has thick legs (unlike the spider's thin legs), so leg consistency across frames should be better. The skill's prompt template with per-frame descriptions and reference locking is adequate.

### Phase 5: Generate Attack Sprite Sheet
This is the critical phase for the broodmother. The skill's attack prompt template includes:
- "CRITICAL DIRECTION RULE" block
- Negative prompts: "The creature must NOT face right"
- Anti-pattern warnings
- Per-frame facing-left enforcement

The agent would use the "Melee lunge (biting, clawing, pouncing)" motion arc template for the venomous bite. The template describes the lunge going toward the left edge.

**Direction gate for attack:** The skill's attack-specific gate is thorough:
- Check every frame for head/face pointing left
- Check attack action goes toward left edge
- Check peak frames (5-7) are not mirrored vs wind-up frames (1-4)
- Specific anti-patterns to reject (body turned right, projectile going right, mirrored frames)

This is the skill's strongest area and directly addresses the broodmother's primary failure mode. The 3-attempt gate with escalating prompt modifications ("IMPORTANT: This creature attacks toward the LEFT margin") is well-designed.

**Assessment:** The facing direction enforcement is likely to catch most direction flips. The remaining risk is subtle direction changes (e.g., the body faces left but one leg extends right during the lunge), which the anti-pattern list partially addresses.

### Phase 6: Process Sprite Sheets
The agent runs `process-spritesheet.mjs` with `4 3` grid.

**Large creature framing:** The broodmother fills most of the frame. The 512x512 centering step should handle this, but if the creature extends to the edges of the generated image, the centering might clip leg tips or the egg sac. The skill doesn't provide specific guidance for large creatures during processing (e.g., "if creature fills >80% of the frame, reduce padding").

**Green fringe on leg tips:** The broodmother's thick legs have thin tips that touch the background. At threshold 28, the flood-fill should handle this, but the tips are the most vulnerable area. The skill's green residue check would catch remaining fringe.

**Gap:** Same as other cases -- the HSV-based flags (spillPasses, matteRadius) are undocumented. For leg tips specifically, spillPasses would clean green fringe without eating the tips.

**Frame integrity:** The broodmother's large body means each frame has high opaque pixel counts, so the >30k threshold is easily met. Frame extraction should be reliable with the uniform grid since the creature fills each cell.

### Phase 7: Wire into Codebase
Standard code wiring. The skill's templates are complete. The broodmother might need a special skill definition (spawning spiderlings), but the skill's enemySkills.js template handles custom effects.

### Phase 8: Update Docs and Validate
Standard. No issues.

## Rubric Evaluation

### Green Cleanup Quality
The broodmother is dark purple/brown on green background -- a moderate cleanup case. Leg tips are the main fringe risk. The skill's threshold guidance (24-28 for thin features) is reasonable. The green pixel check would catch residual fringe. However, the HSV-based flags are undocumented, and the remediation path has the same threshold tension as other cases. For the broodmother specifically, the cleanup is less problematic than for the dark wraith (the body is not as dark) but more problematic than for a light-colored creature.

### Frame Integrity
The broodmother fills the frame, so grid extraction is reliable. The opaque pixel count check is adequate. The main risk is clipping at frame edges, which the skill partially addresses with the "fits entirely within the frame" prompt guidance. Content-aware grid detection is less critical here since the creature fills each cell.

### Animation Consistency
The skill's facing direction enforcement is excellent and directly addresses the broodmother's primary challenge. The 3-attempt gate, negative prompts, anti-pattern list, and escalating prompt modifications are all well-designed. The broodmother's thick legs and large body make consistency easier than for thin-limbed creatures. The skill handles this case well.

### Creature-Specific Adaptation
The adaptation table covers massive proportions and thin limbs (for leg tips). The facing direction enforcement is the strongest adaptation. However, the skill doesn't provide broodmother-specific guidance like "for boss creatures, ensure animation quality is higher" or "for creatures with egg sacs, verify the egg sac is consistent across frames." The general adaptations are adequate but not creature-specific enough for a boss.

### Pipeline Robustness
The facing direction gate is the strongest robustness feature and directly addresses the broodmother's primary failure mode. The verification steps (green check, outline check, pixel count) are adequate. However, the same threshold tension and missing decision tree issues apply. For the broodmother specifically, the pipeline is more robust than for other cases because the primary challenge (direction) is well-addressed.

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 45,
    "Frame Integrity": 60,
    "Animation Consistency": 65,
    "Creature-Specific Adaptation": 50,
    "Pipeline Robustness": 45
  },
  "reasoning": {
    "Green Cleanup Quality": "Moderate cleanup case with leg-tip fringe risk; threshold guidance is reasonable but HSV flags undocumented; remediation path has same threshold tension.",
    "Frame Integrity": "Large creature fills frame making grid extraction reliable; pixel count check adequate; minor clipping risk at edges partially addressed by prompt guidance.",
    "Animation Consistency": "Facing direction enforcement is excellent with 3-attempt gate, negative prompts, and anti-patterns -- directly addresses the broodmother's primary failure mode.",
    "Creature-Specific Adaptation": "Adaptation table covers massive proportions and thin limbs; facing direction is strong; but no boss-specific quality guidance or egg-sac consistency checks.",
    "Pipeline Robustness": "Facing direction gate is strong robustness feature; verification steps adequate; but threshold tension and missing decision tree issues still apply."
  }
}
-->
