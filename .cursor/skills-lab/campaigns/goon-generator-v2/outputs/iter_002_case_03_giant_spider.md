# Iteration 2 Dry-Run: Case 03 -- Giant Spider (Cavern Stalker)

## Test Case Summary
- **Creature:** Cavern Stalker (`stalker`) -- large dark spider, eight thin legs, bulbous abdomen, red eyes, dark brown/black coloring
- **Primary challenges:** Thin leg preservation during cleanup, animation consistency for 8 legs across 12 frames, small creature on large canvas
- **Attack type:** Melee lunge (pouncing bite toward left)

## Iteration 2 Changes Relevant to This Case

Building on iteration 1's thin-limb cleanup flags and frame integrity checks, iteration 2 adds:

1. **Animation consistency verification section** with silhouette check, feature count check, and facing check. The feature count check is the most impactful for the spider: "For multi-limbed creatures (spiders, insects), count visible limbs in frames 0, 4, and 8. If limb count varies (e.g. 8 legs in frame 0 but 5 in frame 8), the sheet has consistency degradation."
2. **Creature-specific consistency tips table** -- The "Multi-limbed" row applies directly: "Add: 'The creature has exactly [N] legs visible in EVERY frame. Do not add or remove legs.'" This is the spider-specific prompt guidance that was missing in iteration 1.
3. **Consistency degradation fallback** -- Three-step escalation: (1) regenerate with stronger reference-locking, (2) reduce to 8 frames (4x2), (3) reduce to 6 frames (3x2).
4. **Combined-trait adaptation: "dark + thin"** -- The spider has dark brown/black coloring AND thin legs. The skill now provides: `--spillPasses 2 --matteRadius 1` as a compromise. This is directly applicable.

## Dry-Run Execution Plan

### Phase 1: Read Project Context
Standard doc reads. No issues.

### Phase 2: Define the Goon
The agent defines goonType `stalker`, display name "Cavern Stalker", stats, skill (`stalker-venom-skill` using `poisonHero` effect), spawn weight.

**Creature-specific adaptation lookup:** The agent consults the adaptations table and identifies:
- **"Thin limbs or fine detail"**: `--spillPasses 1 --matteRadius 1`, with `--spillPasses 0 --matteRadius 0` fallback.
- **"Dark coloring near black"** (dark brown/black body): `--spillPasses 3`.
- **NEW -- "Combined: dark + thin"**: `--spillPasses 2 --matteRadius 1` as a compromise. "If green fringe remains on the body, manually inspect thin limbs after each spill pass increase. Prefer `--spillPasses 2` over `3` to protect limbs."

**Major improvement over iter 1:** In iteration 1, the evaluator identified the same dark-vs-thin tension as with the wraith: "The green residue check says 'Re-run with --spillPasses 3' but the thin-limb strategy says --spillPasses 1. If green fringe remains between thin legs after spillPasses 1, the agent faces a trade-off." Now the combined adaptation resolves this with an explicit compromise value and a clear decision heuristic that prioritizes leg preservation.

**Consistency tips lookup:** The agent consults the new creature-specific consistency tips table:
- **"Multi-limbed"**: "Add: 'The creature has exactly [N] legs visible in EVERY frame. Do not add or remove legs.'"

**Critical improvement over iter 1:** This was the single biggest gap identified in iteration 1. The evaluator noted: "The skill still lacks spider-specific guidance: no 'verify 8 legs in every frame' instruction, no 'compare leg count between frame 1 and frame 8' check, no 'explicitly mention leg count in every frame description' prompt guidance." All three of these gaps are now addressed:
1. The multi-limbed consistency tip tells the agent to add "exactly 8 legs visible in EVERY frame" to the prompt.
2. The feature count check in the consistency verification says to count limbs in frames 0, 4, and 8.
3. The prompt addition explicitly mentions leg count in the generation instructions.

### Phase 3: Generate Static Reference Image
The agent uses the prompt template. The spider is dark brown/black (not green), so green background is correct. The prompt includes:
- "thick black outline"
- "strong readable silhouette that works at small display sizes like 120x150 pixels"
- "the creature fits entirely within the frame with no clipping" (massive proportions adaptation)
- Spider-specific: "eight clearly visible thin legs, bulbous abdomen, red eyes"

Cleanup: standard `asset:clean` with `--threshold 32`. Adequate for the reference image.

### Phase 4: Generate Idle Sprite Sheet
The agent uses the idle prompt template with spider-specific motion: "subtle leg movement, body swaying, abdomen pulsing."

**Consistency anchor:** "Maintain EXACT proportions, colors, and features from the reference image in every frame." Preserved from iter 1.

**NEW -- Multi-limbed consistency tip injected into prompt:** "The creature has exactly 8 legs visible in EVERY frame. Do not add or remove legs."

**Critical improvement over iter 1:** This is the most impactful change for the spider test case. The explicit leg count instruction directly addresses the core failure mode: "Spider legs degrade across frames (frames 7-12 have disconnected stubs)." By telling the AI generator "exactly 8 legs in EVERY frame," the agent constrains the generator to maintain leg count consistency. While AI generators may still struggle with this, the explicit instruction significantly increases the probability of consistent results.

The idle motion description now includes: "all 8 legs visible in every frame, subtle leg shifting and body swaying."

**Facing direction gate:** Works well for spiders. Asymmetric body makes direction easy to verify.

### Phase 5: Generate Attack Sprite Sheet
The agent uses the "Melee lunge (biting, clawing, pouncing)" motion arc for a pouncing bite.

**NEW -- Multi-limbed consistency tip also applied to attack prompt:** "The creature has exactly 8 legs visible in EVERY frame. Do not add or remove legs." This is critical for the attack animation where legs are most likely to degrade during the pounce sequence (legs extending, body stretching, legs retracting).

All v1 direction enforcement preserved (negative prompts, anti-patterns, per-frame facing).

### Phase 6: Process Sprite Sheets
The agent runs:
```
node scripts/process-spritesheet.mjs <raw-idle> assets/goons/stalker_idle_512x512_sheet.png 4 3 --spillPasses 2 --matteRadius 1
node scripts/process-spritesheet.mjs <raw-attack> assets/goons/stalker_attack_512x512_sheet.png 4 3 --spillPasses 2 --matteRadius 1
```

**Improvement over iter 1:** In iteration 1, the agent would use `--spillPasses 1 --matteRadius 1` (from the thin-limb row). Now the combined "dark + thin" adaptation provides `--spillPasses 2 --matteRadius 1` -- one extra spill pass to handle the dark body's green fringe while still keeping conservative matting for thin legs. This is a better balance than either extreme.

**Escalation path:** If green fringe remains on the dark body:
1. Try `--spillPasses 3 --matteRadius 1` (increase spill passes, keep conservative matting)
2. Inspect thin legs after processing -- if legs survived, keep; if damaged, revert to `--spillPasses 2`
3. The skill says "Prefer `--spillPasses 2` over `3` to protect limbs" -- clear decision heuristic

**Improvement over iter 1:** Iteration 1 identified the tension between green fringe removal and leg preservation but didn't resolve it: "if you have BOTH green fringe AND thin limbs, accept slight fringe to preserve legs." Now the skill explicitly states this trade-off and provides the compromise value.

**Frame integrity check:** Per-frame opaque pixel count with 30k threshold. For the spider, some pounce frames may have lower counts (legs extended, body stretched), but should exceed 30k if the body is intact.

**Green residue check:** The spider is dark, so green fringe is a real risk between thin legs. The check detects bright green pixels. The remediation path now starts from `--spillPasses 2` (the compromise), and the agent knows to inspect legs before escalating further.

**NEW -- Animation consistency verification:** After processing, the agent runs:
1. **Silhouette check:** Compare frame 0 and last frame -- the spider's overall shape (body width, leg span) should be similar.
2. **Feature count check:** "For multi-limbed creatures (spiders, insects), count visible limbs in frames 0, 4, and 8. If limb count varies (e.g. 8 legs in frame 0 but 5 in frame 8), the sheet has consistency degradation."
3. **Facing check:** Confirm left-facing in frames 0, 4, 8, and last frame.

**Critical improvement over iter 1:** The feature count check is the most valuable new check for the spider. In iteration 1, the evaluator noted: "no 'compare leg count between frame 1 and frame 8' check." Now the skill explicitly says to count limbs in frames 0, 4, and 8 and flag degradation. This catches the exact failure mode described in the test case: "frames 7-12 have disconnected stubs."

**NEW -- Consistency degradation fallback:** If leg count degrades across frames:
1. First try: regenerate with stronger reference-locking + multi-limbed tip: "Maintain EXACT proportions, limb count, and features from the reference image in EVERY frame."
2. Second try: reduce to 8 frames (4x2). For the spider, 8 frames significantly reduces the opportunity for leg degradation. 8 frames at 20fps = 0.4s idle, 8 frames at 24fps = 0.33s attack.
3. Third try: reduce to 6 frames (3x2) as last resort.

**Improvement over iter 1:** Iteration 1 mentioned the 8-frame fallback but didn't provide a structured escalation or the 6-frame last resort. The three-step escalation is particularly valuable for multi-limbed creatures where consistency degrades predictably with frame count.

### Phase 7: Wire into Codebase
Standard code wiring. Templates unchanged and correct.

### Phase 8: Update Docs and Validate
Standard. Checklist includes animation consistency verification items.

## Rubric Evaluation

### Green Cleanup Quality
The combined "dark + thin" adaptation provides `--spillPasses 2 --matteRadius 1` as a compromise for the spider's dark body and thin legs. This is a better starting point than iteration 1's `--spillPasses 1` (which might leave fringe on the dark body) or `--spillPasses 3` (which might eat thin legs). The escalation path is clear and the decision heuristic ("prefer spillPasses 2 over 3 to protect limbs") resolves the tension. The green residue check and remediation paths are preserved. The spider's green cleanup is now well-covered with a balanced approach.

### Frame Integrity
Same solid coverage as iteration 1: content-aware grid detection, 30k threshold, troubleshooting tree. The combined "dark + thin" adaptation's `--matteRadius 1` provides conservative edge treatment that helps preserve frame boundaries. No new frame-integrity-specific improvements, but the existing coverage is adequate for the spider.

### Animation Consistency
This is the dimension with the most dramatic improvement for the spider in iteration 2. Three features directly address the spider's core consistency challenge:
1. The "multi-limbed" consistency tip adds "exactly 8 legs visible in EVERY frame" to the prompt -- the single most impactful change for this test case.
2. The feature count check explicitly says to count limbs in frames 0, 4, and 8 -- directly catching the "legs degrade to stubs" failure mode.
3. The three-step degradation fallback provides structured escalation, with frame count reduction being particularly effective for multi-limbed creatures.

In iteration 1, the evaluator gave Animation Consistency a 55 and noted: "no spider-specific multi-limbed guidance (verify 8 legs, mention leg count in prompts)." All three of these gaps are now closed. This is the largest single-dimension improvement across all test cases.

### Creature-Specific Adaptation
The spider is now covered by three specific adaptations:
1. Thin-limbed: `--spillPasses 1 --matteRadius 1` (base)
2. Dark + thin combined: `--spillPasses 2 --matteRadius 1` (compromise)
3. Multi-limbed consistency tip: "exactly 8 legs in EVERY frame" (prompt)

In iteration 1, the evaluator noted: "no multi-limbed prompt guidance or leg-count verification step." Both are now provided. The spider is one of the most improved creature types in iteration 2.

### Pipeline Robustness
The troubleshooting tree is preserved. The new consistency degradation fallback adds structured escalation for leg degradation. The combined "dark + thin" adaptation reduces flag selection ambiguity. The feature count check provides an automated detection mechanism for the spider's primary failure mode. The pipeline now handles the spider's failure modes (thin legs eaten, leg degradation across frames, green fringe on dark body) with specific, non-contradictory remediation paths and a clear escalation order.

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 72,
    "Frame Integrity": 70,
    "Animation Consistency": 75,
    "Creature-Specific Adaptation": 78,
    "Pipeline Robustness": 74
  },
  "reasoning": {
    "Green Cleanup Quality": "Combined dark+thin adaptation provides balanced --spillPasses 2 --matteRadius 1 compromise; clear escalation path with leg-preservation heuristic; resolves the iter 1 tension between fringe removal and leg preservation.",
    "Frame Integrity": "Same solid coverage as iter 1 -- 30k threshold, content-aware grid detection, troubleshooting tree; conservative matteRadius from combined adaptation helps preserve frame boundaries.",
    "Animation Consistency": "Multi-limbed consistency tip adds explicit 8-leg-count instruction to prompts; feature count check catches leg degradation in frames 0/4/8; 3-step degradation fallback with frame reduction; closes all three spider-specific gaps identified in iter 1.",
    "Creature-Specific Adaptation": "Three specific adaptations cover the spider: thin-limbed flags, dark+thin compromise, and multi-limbed consistency tip with leg-count verification; all gaps from iter 1 (no multi-limbed prompt guidance, no leg-count check) are now closed.",
    "Pipeline Robustness": "Preserved troubleshooting tree plus consistency degradation fallback; feature count check provides automated leg-degradation detection; combined-trait adaptation reduces flag ambiguity; clear escalation order for all spider failure modes."
  }
}
-->
