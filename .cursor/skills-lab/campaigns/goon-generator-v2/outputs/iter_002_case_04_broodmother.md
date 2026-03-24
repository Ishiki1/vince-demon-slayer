# Iteration 2 Dry-Run: Case 04 -- Broodmother (Broodmother Arachne)

## Test Case Summary
- **Creature:** Broodmother Arachne (`broodmother`) -- massive spider, egg sac, thick legs, multiple red eyes, dark purple/brown coloring
- **Primary challenges:** Direction consistency across all frames, large creature framing, green fringe on leg tips, boss-quality animation
- **Attack type:** Melee lunge (venomous bite toward left) + spawns spiderlings

## Iteration 2 Changes Relevant to This Case

Building on iteration 1's facing direction enforcement and cleanup flags, iteration 2 adds:

1. **Animation consistency verification section** with silhouette check, feature count check, and facing check. The facing check is redundant with the v1 facing gates but provides a post-processing safety net.
2. **Creature-specific consistency tips table** -- Two rows apply:
   - **"Multi-limbed"**: "The creature has exactly [N] legs visible in EVERY frame. Do not add or remove legs."
   - **"Large boss"**: "The v1 facing-direction gates already handle this. Additionally: 'The creature's egg sac / wings / distinctive features remain on the same side in every frame.'"
3. **Consistency degradation fallback** -- Three-step escalation: (1) regenerate with stronger reference-locking, (2) reduce to 8 frames, (3) reduce to 6 frames.
4. **Combined-trait adaptation: "dark + thin"** -- Applicable to the broodmother's dark purple/brown body and leg tips (though the broodmother's legs are thicker than a regular spider's).

## Dry-Run Execution Plan

### Phase 1: Read Project Context
Standard doc reads. No issues.

### Phase 2: Define the Goon
The agent defines goonType `broodmother`, display name "Broodmother Arachne", stats (high hpMult for boss), skill (`broodmother-venom-skill`), spawn weight (low for boss rarity).

**Creature-specific adaptation lookup:** The agent consults the adaptations table and identifies:
- **"Massive/unusual proportions"**: "the creature fits entirely within the frame with no clipping."
- **"Thin limbs or fine detail"** (leg tips): `--spillPasses 1 --matteRadius 1`.
- **"Dark coloring near black"** (dark purple/brown): `--spillPasses 3`.
- **"Melee/slam attacks"**: "Describe the attack as going toward the LEFT."
- **NEW -- "Combined: dark + thin"**: `--spillPasses 2 --matteRadius 1` as compromise.

**Assessment of combined-trait adaptation for broodmother:** The broodmother's legs are thicker than the regular spider's, so the dark-vs-thin tension is less acute. The combined adaptation's `--spillPasses 2 --matteRadius 1` is a reasonable starting point, but the agent could also justify `--spillPasses 3` since the broodmother's legs are thick enough to survive more aggressive cleanup. The skill's heuristic "prefer `--spillPasses 2` over `3` to protect limbs" provides guidance, though for the broodmother specifically, `--spillPasses 3` would likely be fine. This is a minor imprecision -- the combined adaptation is designed for truly thin limbs (spider, insect) and is slightly over-conservative for the broodmother's thick legs.

**Consistency tips lookup:** The agent consults the new creature-specific consistency tips table and finds TWO applicable rows:
- **"Multi-limbed"**: "The creature has exactly [N] legs visible in EVERY frame. Do not add or remove legs."
- **"Large boss"**: "The creature's egg sac / wings / distinctive features remain on the same side in every frame."

**Significant improvement over iter 1:** The "Large boss" consistency tip directly addresses the broodmother's primary failure mode (direction flip mid-animation) with a feature-anchoring approach. By specifying that the egg sac must remain on the same side in every frame, the tip provides an additional constraint beyond facing direction -- even if the AI generator subtly rotates the creature, the egg sac position serves as a secondary direction indicator. In iteration 1, the evaluator noted: "The egg sac is not specifically mentioned as a feature to verify across frames." This gap is now closed.

The multi-limbed tip adds "exactly [N] legs visible in EVERY frame" which addresses the secondary challenge of inconsistent leg count.

### Phase 3: Generate Static Reference Image
The agent uses the prompt template. The broodmother is dark purple/brown (not green), so green background is correct. The prompt includes:
- "the creature fits entirely within the frame with no clipping" (massive proportions)
- "facing left" (mentioned twice)
- "thick black outline"
- Broodmother-specific: "massive spider with egg sac on abdomen, thick legs, multiple red eyes"

Cleanup: standard `asset:clean` with `--threshold 32`. The broodmother's dark purple/brown body is far from green, so threshold-based cleanup is adequate.

### Phase 4: Generate Idle Sprite Sheet
The agent uses the idle prompt template with broodmother-specific motion: "menacing breathing, abdomen pulsing, legs shifting weight, egg sac subtly pulsing."

**Consistency anchor:** "Maintain EXACT proportions, colors, and features from the reference image in every frame." Preserved from iter 1.

**NEW -- Multi-limbed consistency tip injected:** "The creature has exactly [N] legs visible in EVERY frame. Do not add or remove legs." The agent substitutes the actual leg count (e.g., 8).

**NEW -- Large boss consistency tip injected:** "The creature's egg sac remains on the same side in every frame." This provides a spatial anchor that reinforces facing direction -- if the egg sac is always on the right side of the creature (as viewed), then the creature must be facing left.

**Improvement over iter 1:** The combination of multi-limbed and large boss tips provides two layers of consistency enforcement:
1. Structural: leg count stays constant
2. Spatial: egg sac position stays constant (implicitly enforcing direction)

These complement the v1 facing direction gate, which checks direction before processing. The consistency tips operate at the generation level (constraining the AI generator), while the facing gate operates at the verification level (catching failures after generation).

**Facing direction gate:** The v1 gate is well-designed for the broodmother. The egg sac is a strong asymmetric feature. The large boss tip reinforces this by making the egg sac position explicit in the prompt.

### Phase 5: Generate Attack Sprite Sheet
The agent uses the "Melee lunge (biting, clawing, pouncing)" motion arc for a venomous bite. All v1 direction enforcement preserved.

**NEW -- Both consistency tips applied to attack prompt.** The multi-limbed tip ensures leg count stays constant during the lunge. The large boss tip ensures the egg sac stays on the same side throughout the attack sequence. This is particularly valuable for the attack animation, which is the most common point of direction failure for the broodmother.

**Attack direction enforcement stack (v1 + v2):**
1. v1: "CRITICAL DIRECTION RULE" block in prompt
2. v1: Negative prompts ("must NOT face right")
3. v1: Anti-pattern warnings
4. v1: Per-frame facing-left enforcement
5. v1: 3-attempt facing gate with specific visual cues
6. v2: Large boss tip -- egg sac as spatial anchor
7. v2: Multi-limbed tip -- leg arrangement as structural anchor
8. v2: Post-processing consistency verification (silhouette + feature count + facing)

This is a comprehensive direction enforcement stack. The v2 additions provide both generation-time constraints (tips in the prompt) and post-processing verification (consistency checks).

### Phase 6: Process Sprite Sheets
The agent runs:
```
node scripts/process-spritesheet.mjs <raw-idle> assets/goons/broodmother_idle_512x512_sheet.png 4 3 --spillPasses 2 --matteRadius 1
node scripts/process-spritesheet.mjs <raw-attack> assets/goons/broodmother_attack_512x512_sheet.png 4 3 --spillPasses 2 --matteRadius 1
```

**Assessment:** The combined "dark + thin" adaptation provides `--spillPasses 2 --matteRadius 1`. For the broodmother specifically, `--spillPasses 3` might be more appropriate since the legs are thick enough to survive. However, `--spillPasses 2` is a safe starting point, and the escalation path (try spillPasses 3, inspect legs) handles the case where fringe remains. The slight over-conservatism is a minor issue -- it means the agent might need one extra iteration of the escalation path, but won't damage the creature.

**Frame integrity check:** The broodmother fills the frame, so pixel counts are high. The 30k threshold is easily met. Safety net only.

**Green residue check:** Dark purple/brown body means green fringe is a real risk on leg tips. The check detects bright green pixels. Remediation starts from `--spillPasses 2` and escalates to `--spillPasses 3`.

**NEW -- Animation consistency verification:** After processing:
1. **Silhouette check:** Compare frame 0 and last frame -- the broodmother's massive shape should be similar. The egg sac position is a strong anchor.
2. **Feature count check:** Count legs in frames 0, 4, and 8. Also verify egg sac is visible in all sampled frames.
3. **Facing check:** Confirm left-facing in frames 0, 4, 8, and last frame. Redundant with v1 gates but provides post-processing safety net.

**Improvement over iter 1:** The structured verification provides a formal check after processing, complementing the pre-processing facing gates. The feature count check catches leg degradation and egg sac disappearance. The silhouette check catches dramatic shape changes.

**NEW -- Consistency degradation fallback:** If direction flips or consistency degrades:
1. First try: regenerate with stronger reference-locking + both consistency tips.
2. Second try: reduce to 8 frames (4x2). For the broodmother, 8 frames at 24fps = 0.33s attack -- slightly fast for a massive creature but functional. The skill notes that heavy creatures can reduce attack frameRate to 20fps (0.4s) if needed.
3. Third try: reduce to 6 frames (3x2) as last resort.

**Improvement over iter 1:** The three-step escalation provides a structured fallback. The 6-frame last resort is new. For the broodmother, reducing frame count is effective because fewer frames means fewer opportunities for direction flips.

### Phase 7: Wire into Codebase
Standard code wiring. Templates unchanged and correct.

### Phase 8: Update Docs and Validate
Standard. Checklist includes animation consistency verification items.

## Rubric Evaluation

### Green Cleanup Quality
The combined "dark + thin" adaptation provides `--spillPasses 2 --matteRadius 1` as a starting point. For the broodmother's thick legs, this is slightly over-conservative (spillPasses 3 would likely be fine), but the escalation path handles this. The green residue check and remediation paths are preserved. Leg-tip fringe is the main risk, and the conservative matteRadius (1) helps preserve leg tips while the escalation to spillPasses 3 catches remaining fringe. Overall solid coverage with a minor imprecision in the starting flag values.

### Frame Integrity
Same solid coverage as iteration 1. The broodmother fills the frame, making extraction reliable. The 30k threshold, content-aware grid detection, and troubleshooting tree are all preserved. The "fits entirely within the frame" prompt guidance addresses clipping risk. No new frame-integrity-specific improvements needed for this creature.

### Animation Consistency
This is the dimension with the most improvement for the broodmother in iteration 2. The v1 facing direction enforcement was already strong (the broodmother's primary challenge). The v2 additions provide:
1. The "large boss" consistency tip anchors the egg sac position as a secondary direction indicator -- directly addressing the iter 1 gap where "egg sac is not specifically mentioned as a feature to verify across frames."
2. The "multi-limbed" tip ensures leg count consistency.
3. The structured consistency verification provides post-processing checks.
4. The three-step degradation fallback provides structured escalation.

The direction enforcement stack is now comprehensive: v1 provides generation-time constraints and pre-processing verification; v2 adds feature-anchoring constraints and post-processing verification. The broodmother's direction consistency is the best-covered aspect of any test case.

### Creature-Specific Adaptation
The broodmother is now covered by multiple specific adaptations:
1. Massive proportions: "fits entirely within frame"
2. Dark + thin combined: `--spillPasses 2 --matteRadius 1`
3. Multi-limbed: "exactly [N] legs in EVERY frame"
4. Large boss: "egg sac remains on same side in every frame"
5. Melee attack: "attack goes toward the LEFT"

In iteration 1, the evaluator noted: "no boss-specific quality guidance or egg-sac verification step." The large boss consistency tip closes the egg-sac gap. Boss-specific quality guidance (e.g., "ensure higher animation quality for bosses") is still absent, but the multi-layered consistency enforcement effectively raises quality by reducing the most common failure modes.

### Pipeline Robustness
The troubleshooting tree is preserved. The consistency degradation fallback adds structured escalation. The combined-trait adaptation reduces flag ambiguity. The multi-layered direction enforcement (v1 gates + v2 feature anchoring + v2 post-processing verification) provides defense in depth against the broodmother's primary failure mode. The pipeline is robust for all of the broodmother's failure modes.

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 70,
    "Frame Integrity": 72,
    "Animation Consistency": 82,
    "Creature-Specific Adaptation": 78,
    "Pipeline Robustness": 76
  },
  "reasoning": {
    "Green Cleanup Quality": "Combined dark+thin adaptation provides conservative starting point; slightly over-conservative for broodmother's thick legs but escalation path handles it; green residue check and remediation preserved.",
    "Frame Integrity": "Large creature fills frame making extraction reliable; 30k threshold and content-aware grid detection provide safety net; no new improvements needed for this creature type.",
    "Animation Consistency": "Large boss consistency tip anchors egg sac as secondary direction indicator, closing the iter 1 gap; multi-limbed tip ensures leg count; structured verification and 3-step fallback provide comprehensive direction enforcement stack.",
    "Creature-Specific Adaptation": "Five specific adaptations cover the broodmother: massive proportions, dark+thin flags, multi-limbed tip, large boss tip, melee attack guidance; egg-sac verification gap from iter 1 is closed.",
    "Pipeline Robustness": "Preserved troubleshooting tree plus consistency degradation fallback; multi-layered direction enforcement (v1 gates + v2 feature anchoring + v2 post-processing verification) provides defense in depth."
  }
}
-->
