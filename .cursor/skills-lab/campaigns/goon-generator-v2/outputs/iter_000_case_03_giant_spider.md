# Baseline Dry-Run: Case 03 -- Giant Spider (Cavern Stalker)

## Test Case Summary
- **Creature:** Cavern Stalker (`stalker`) -- large dark spider, eight thin legs, bulbous abdomen, red eyes
- **Primary challenges:** Thin leg preservation during cleanup, animation consistency for 8 legs across 12 frames, small creature on large canvas
- **Attack type:** Melee lunge (pouncing bite toward left)

## Dry-Run Execution Plan

### Phase 1: Read Project Context
Standard doc reads. No issues.

### Phase 2: Define the Goon
The agent defines goonType `stalker`, display name "Cavern Stalker", stats, skill (e.g. `stalker-venom-skill` using `poisonHero` effect), spawn weight.

**Skill guidance for this creature type:**
- The adaptation table identifies "Thin limbs or fine detail" as applicable.
- Mitigation: "Use a lower cleanup threshold (24-28). After processing, zoom into thin features and confirm they survived. If limbs are lost, lower the threshold further."
- Also applicable: "Massive/unusual proportions" -- the skill says to emphasize "the creature fits entirely within the frame with no clipping" and consider display-size readability.

**Assessment:** The adaptation table provides reasonable prompt-level guidance for thin limbs. The threshold recommendation (24-28) is directionally correct -- lower thresholds preserve thin features. However, the skill doesn't mention the upgraded `--matteRadius` flag which provides soft edges that help preserve thin features, or `--spillPasses` which can clean green fringe between legs without eating the legs themselves.

### Phase 3: Generate Static Reference Image
The agent uses the prompt template with spider-specific description. The green background is appropriate here (spider is dark brown/black, not green). The prompt template's "thick black outline" and "strong readable silhouette" guidance is important for a spider.

Cleanup: `npm run asset:clean -- --input <raw> --output assets/goons/stalker-reference.png --canvas 512 --padding 20 --threshold 32`

The skill says to use threshold 24-28 for thin-limbed creatures. An attentive agent would follow this and use `--threshold 26`. This is reasonable guidance.

**Potential issue:** If the spider is generated small relative to the canvas (common with spiders), the `--padding 20` centering step should handle it. The skill doesn't specifically address what to do if the creature is too small after centering, but the "Massive/unusual proportions" entry mentions display-size readability.

### Phase 4: Generate Idle Sprite Sheet
The agent uses the idle prompt template with spider-specific motion: "subtle leg movement, body swaying, abdomen pulsing."

**Animation consistency concern:** AI generators notoriously struggle with 8 legs across 12 frames. The skill's prompt template includes per-frame descriptions and reference image locking, which helps. The "maintain the same [key visual traits]" closing line would include leg count and positioning.

However, the skill does NOT include specific guidance for multi-limbed creatures like:
- "Explicitly state 'eight legs visible in every frame' in the prompt"
- "Compare leg count between frame 1 and frames 7-12 after generation"
- "If legs degrade in later frames, consider reducing to 8 frames (4x2 grid)"

The general "reduce to 8 frames" fallback is mentioned in the Frame Count Guidance section but isn't triggered by a specific consistency check.

**Facing direction gate:** The 3-attempt gate works well for spiders. The asymmetric body (head vs abdomen) makes facing direction relatively easy to verify.

### Phase 5: Generate Attack Sprite Sheet
The agent would use the "Melee lunge (biting, clawing, pouncing)" motion arc template. This is a good match for a spider pounce. The template describes the lunge going toward the left edge, which is correct.

**Spider-specific concern:** During a pounce, legs extend and retract rapidly. The AI generator may produce inconsistent leg positions across the attack frames. The skill's attack prompt template doesn't include spider-specific guidance like "maintain all 8 legs throughout the pounce sequence."

The facing direction gate and anti-pattern checks are solid and would catch direction flips.

### Phase 6: Process Sprite Sheets
The agent runs `process-spritesheet.mjs` with `4 3` grid.

**Thin leg preservation:** The skill correctly advises a lower threshold (24-28). With the basic script invocation, the flood-fill green removal starts from border-connected green. For a spider, the green areas between thin legs are border-connected, so the flood-fill will reach deep into the spaces between legs. At threshold 24-28, the flood-fill should stop at the leg edges without eating into them.

**Gap:** The skill doesn't document `--spillPasses` which would clean green fringe between legs without damaging the legs themselves. It also doesn't document `--matteRadius` which provides soft edges that help thin features look clean at display size.

**Green residue check:** The skill's green pixel check would work for a dark spider. Any bright green between legs would be detected. The remediation ("re-run with higher threshold") is problematic for thin legs -- higher threshold means more leg damage. The skill's outline integrity check ("lower threshold if outline degraded") partially addresses this but creates the same threshold tension as the dark wraith case.

**Frame integrity check:** The opaque pixel count (>30k) is a reasonable check. For a spider with thin legs, some frames might have lower pixel counts than a bulkier creature, but should still exceed 30k if the body is intact. The 10k minimum threshold for "failed extraction" is appropriate.

### Phase 7: Wire into Codebase
Standard code wiring. No issues. The templates are complete.

### Phase 8: Update Docs and Validate
Standard. No issues.

## Rubric Evaluation

### Green Cleanup Quality
The spider is dark brown/black on green background, which is a moderate-difficulty cleanup case. The skill's threshold guidance (24-28 for thin limbs) is directionally correct. The green pixel check would catch residual fringe. However, the skill doesn't document the HSV-based flags that would provide better results (spillPasses for between-leg fringe, matteRadius for soft edges on thin legs). The remediation path ("raise threshold") conflicts with thin-limb preservation.

### Frame Integrity
The skill has adequate frame verification (opaque pixel count, frame count check). The 4x3 grid is explicitly specified. For a spider, the uniform grid should work reasonably well since the creature body is roughly centered in each frame. The skill doesn't mention content-aware grid detection, but it's less critical for spiders than for irregular vine shapes.

### Animation Consistency
This is the biggest weakness for the spider case. The skill has good general prompt templates but lacks multi-limbed creature-specific guidance. Eight legs across 12 frames is a known AI generation challenge. The skill doesn't instruct the agent to verify leg count consistency or provide specific prompts for multi-limbed creatures. The "reduce to 8 frames" fallback exists but isn't triggered by a specific check.

### Creature-Specific Adaptation
The adaptation table correctly identifies thin limbs and provides reasonable threshold guidance. The prompt-level mitigations (lower threshold, zoom into thin features) are helpful but incomplete. Missing: spillPasses/matteRadius flags, multi-limbed consistency prompts, specific leg-count verification step.

### Pipeline Robustness
The verification steps (green check, outline check, pixel count) cover the main failure modes. However, the threshold tension (green check says raise, outline check says lower) is unresolved for thin-limbed creatures. There's no decision tree for "thin legs lost" -> "try spillPasses instead of threshold adjustment."

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 45,
    "Frame Integrity": 55,
    "Animation Consistency": 45,
    "Creature-Specific Adaptation": 45,
    "Pipeline Robustness": 35
  },
  "reasoning": {
    "Green Cleanup Quality": "Threshold guidance (24-28) is directionally correct for thin legs but HSV flags (spillPasses, matteRadius) are undocumented; remediation path conflicts with limb preservation.",
    "Frame Integrity": "Adequate pixel count and frame count verification; uniform grid works reasonably for spiders; content-aware detection not mentioned but less critical here.",
    "Animation Consistency": "Good general prompt templates but no multi-limbed creature-specific guidance; 8-leg consistency across 12 frames is a known challenge with no specific mitigation.",
    "Creature-Specific Adaptation": "Adaptation table correctly identifies thin limbs with reasonable threshold advice, but missing spillPasses/matteRadius flags and multi-limbed consistency prompts.",
    "Pipeline Robustness": "Verification steps cover main failures but threshold tension (green vs outline) is unresolved; no decision tree for thin-limb-specific remediation."
  }
}
-->
