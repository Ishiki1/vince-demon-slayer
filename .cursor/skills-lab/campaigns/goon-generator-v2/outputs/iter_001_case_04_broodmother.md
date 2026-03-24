# Iteration 1 Dry-Run: Case 04 -- Broodmother (Broodmother Arachne)

## Test Case Summary
- **Creature:** Broodmother Arachne (`broodmother`) -- massive spider, egg sac, thick legs, multiple red eyes, dark purple/brown coloring
- **Primary challenges:** Direction consistency across all frames, large creature framing, green fringe on leg tips, boss-quality animation
- **Attack type:** Melee lunge (venomous bite toward left) + spawns spiderlings

## Skill Changes Relevant to This Case
The updated skill now includes:
1. **Creature-specific cleanup parameters table** with `--spillPasses 3` for dark creatures (applicable to dark purple/brown body) and `--spillPasses 1 --matteRadius 1` for thin-limbed creatures (applicable to leg tips).
2. **Frame integrity check** with per-frame opaque pixel count and 30k threshold.
3. **Consistency anchor** in prompt templates: "Maintain EXACT proportions, colors, and features from the reference image in every frame."
4. **Troubleshooting decision tree** covering direction flips, green fringe, and proportion changes.
5. **Checklist** updated with frame integrity, consistency check, and background color choice items.

Note: The broodmother's primary challenge (direction consistency) was already well-addressed by v1 improvements (facing direction gates, negative prompts, anti-patterns). The v2 changes primarily improve cleanup quality, frame integrity, and pipeline robustness -- secondary concerns for this creature.

## Dry-Run Execution Plan

### Phase 1: Read Project Context
Standard doc reads. No issues.

### Phase 2: Define the Goon
The agent defines goonType `broodmother`, display name "Broodmother Arachne", stats (high hpMult for a boss), skill (`broodmother-venom-skill`), spawn weight (low for boss rarity).

**Creature-specific adaptation lookup:** The agent consults the adaptations table and identifies:
- **"Massive/unusual proportions"**: "Emphasize 'the creature fits entirely within the frame with no clipping.' Consider whether the silhouette is recognizable at small display size."
- **"Thin limbs or fine detail"** (for leg tips): `--spillPasses 1 --matteRadius 1` for conservative cleanup.
- **"Dark coloring near black"** (dark purple/brown): `--spillPasses 3` for extra green fringe removal.
- **"Melee/slam attacks"**: "Describe the attack as going toward the LEFT."

**Same tension as wraith:** The broodmother has both dark coloring (spillPasses 3) and thin features at leg tips (spillPasses 1). The skill doesn't explicitly resolve this conflict. However, the broodmother's legs are thicker than the spider's, so the agent might reasonably choose `--spillPasses 2` (the default) as a compromise, or `--spillPasses 3` since the legs are thick enough to survive. The skill doesn't guide this decision explicitly.

**Assessment:** The adaptations table provides good coverage of the broodmother's traits. The facing direction enforcement (v1) is the strongest area and directly addresses the primary challenge. The v2 improvements add cleanup flag guidance that helps with the secondary challenges (green fringe on leg tips, frame integrity).

### Phase 3: Generate Static Reference Image
The agent uses the prompt template. The broodmother is dark purple/brown (not green), so green background is correct. The prompt emphasizes:
- "the creature fits entirely within the frame with no clipping" (massive proportions)
- "facing left" (mentioned twice)
- "thick black outline"
- Egg sac visible, all legs clear

Cleanup: `npm run asset:clean -- --input <raw> --output assets/goons/broodmother-reference.png --canvas 512 --padding 20 --threshold 32`

The reference cleanup should work reasonably well. The broodmother's dark purple/brown body is far from green in color space, so threshold-based cleanup is adequate for the single reference image.

### Phase 4: Generate Idle Sprite Sheet
The agent uses the idle prompt template with broodmother-specific motion: "menacing breathing, abdomen pulsing, legs shifting weight, egg sac subtly pulsing."

**Consistency anchor (NEW):** "Maintain EXACT proportions, colors, and features from the reference image in every frame." For the broodmother, this helps maintain:
- Consistent leg count and positioning
- Egg sac shape and position
- Body proportions (massive frame)
- Red eye arrangement

**Direction consistency -- the primary test:** The skill's facing direction gate is well-designed (from v1):
- 3-attempt maximum
- Specific visual cues (head/face/eyes point left, asymmetric features on left side)
- "If ANY frame faces right, regenerate the entire sheet"

For the broodmother, the egg sac is a strong asymmetric feature that makes direction easy to verify. The consistency anchor reinforces this by requiring exact proportions in every frame, which implicitly includes facing direction.

**Perfect loop guidance:** Frame 12 = Frame 1. For a massive creature, the idle motion is subtle (breathing, pulsing), so the loop should be smooth.

### Phase 5: Generate Attack Sprite Sheet
This is the critical phase for direction consistency. The skill's attack prompt template (from v1) includes:
- "CRITICAL DIRECTION RULE" block
- Negative prompts: "The creature must NOT face right. The attack must NOT go toward the right side. Do NOT mirror or flip any frame."
- Anti-pattern warnings
- Per-frame facing-left enforcement

The agent uses the "Melee lunge (biting, clawing, pouncing)" motion arc template for the venomous bite. The template describes the lunge going toward the left edge.

**Consistency anchor (NEW):** Added to the attack template. For the broodmother, this reinforces:
- Consistent body proportions during the lunge
- Egg sac position maintained throughout
- Leg arrangement consistent across frames

**Direction gate for attack (from v1):** The attack-specific gate checks:
- Every frame for head/face pointing left
- Attack action goes toward left edge
- Peak frames (5-7) not mirrored vs wind-up frames (1-4)
- Specific anti-patterns to reject

**Assessment:** The facing direction enforcement is the skill's strongest area and was already well-addressed by v1. The v2 consistency anchor adds incremental value by reinforcing proportion consistency alongside direction consistency.

### Phase 6: Process Sprite Sheets
The agent runs processing. The flag decision is nuanced for the broodmother:
- Dark coloring → `--spillPasses 3`
- Thin leg tips → `--spillPasses 1 --matteRadius 1`
- The broodmother's legs are thicker than a regular spider's, so `--spillPasses 2` (default) or `--spillPasses 3` is likely appropriate.

A reasonable agent would run:
```
node scripts/process-spritesheet.mjs <raw-idle> assets/goons/broodmother_idle_512x512_sheet.png 4 3 --spillPasses 3
node scripts/process-spritesheet.mjs <raw-attack> assets/goons/broodmother_attack_512x512_sheet.png 4 3 --spillPasses 3
```

And then check if leg tips survived. If not, reduce to `--spillPasses 2`.

**Frame integrity check (NEW):** The broodmother fills the frame, so each frame has high opaque pixel counts. The 30k threshold is easily met. The check is more of a safety net than a critical gate for this creature.

**Green residue check:** The broodmother is dark purple/brown, so green fringe is a real risk, especially on leg tips. The check would detect bright green pixels. The remediation now correctly says to increase spillPasses (not threshold).

**Large creature framing concern:** The broodmother fills most of the frame. The content-aware grid detection (NEW in the pipeline documentation) should handle this well since the creature fills each grid cell. The 512x512 centering step should preserve the full creature since there's minimal empty space to center.

**Troubleshooting decision tree:** For the broodmother's likely issues:
- "Frames face different directions" → "Regenerate the entire sheet; do not process mixed-direction sheets" ✓ (primary concern)
- "Green fringe on dark creature" → "Re-run with `--spillPasses 3` or `--spillPasses 4`" ✓
- "Thin limbs eaten/missing" → "Re-run with `--spillPasses 0 --matteRadius 0`" ✓ (for leg tips)
- "Character proportions change across frames" → "Reduce frame count to 8 (4x2 grid)" ✓

### Phase 7: Wire into Codebase
Standard code wiring. Templates unchanged and correct. The broodmother might need a special skill definition (spawning spiderlings), which the skill's enemySkills.js template handles.

### Phase 8: Update Docs and Validate
Standard. Checklist includes frame integrity check, consistency check, and background color choice.

## Rubric Evaluation

### Green Cleanup Quality
The broodmother is dark purple/brown on green background -- a moderate cleanup case. The v2 skill now provides specific flags: `--spillPasses 3` for dark creatures. The green pixel check and remediation path are improved (spillPasses instead of threshold). Leg tips are the main fringe risk, and the skill provides both aggressive (spillPasses 3 for dark edges) and conservative (spillPasses 1 for thin features) options. The agent must decide which to prioritize, but both paths are documented. This is a solid improvement over the baseline, which had no flag documentation and gave conflicting threshold advice.

### Frame Integrity
The broodmother fills the frame, making grid extraction reliable. The frame integrity check with 30k threshold is a safety net. Content-aware grid detection is documented. The main risk (clipping at frame edges) is addressed by the "fits entirely within the frame" prompt guidance. This was already adequate in the baseline; the v2 improvements add the formal integrity check which provides verification confidence.

### Animation Consistency
The facing direction enforcement (v1) is excellent and directly addresses the broodmother's primary challenge. The v2 consistency anchor adds incremental value by reinforcing proportion consistency. The 3-attempt gate, negative prompts, and anti-pattern list are all preserved. For the broodmother, the v1 improvements were already the strongest area; v2 adds modest incremental improvement through the consistency anchor and the checklist consistency check item.

### Creature-Specific Adaptation
The adaptations table covers massive proportions, thin limbs (leg tips), dark coloring, and melee attacks. The specific CLI flags for dark creatures and thin-limbed creatures are documented. The facing direction enforcement is strong. The remaining gap is the unresolved tension between dark-creature and thin-limb flags, and the lack of boss-specific quality guidance (e.g., "for boss creatures, ensure animation quality is higher, consider reducing frame count if quality degrades"). The egg sac is not specifically mentioned as a feature to verify across frames.

### Pipeline Robustness
The troubleshooting tree covers the broodmother's failure modes: direction flips (regenerate), green fringe on dark creature (spillPasses 3), thin limbs eaten (spillPasses 0), and proportion changes (reduce to 8 frames). The facing direction gate (v1) is the strongest robustness feature. The v2 troubleshooting tree adds specific remediation paths for cleanup issues. The pipeline is robust for the broodmother's primary challenge (direction) and now has better coverage for secondary challenges (cleanup, frame integrity).

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 65,
    "Frame Integrity": 70,
    "Animation Consistency": 68,
    "Creature-Specific Adaptation": 63,
    "Pipeline Robustness": 68
  },
  "reasoning": {
    "Green Cleanup Quality": "Specific --spillPasses 3 for dark creatures and improved remediation path (spillPasses not threshold); leg-tip fringe risk addressed with both aggressive and conservative options; agent must resolve tension independently.",
    "Frame Integrity": "Large creature fills frame making extraction reliable; formal integrity check with 30k threshold adds verification confidence; content-aware grid detection documented as safety net.",
    "Animation Consistency": "V1 facing direction enforcement is excellent for broodmother's primary challenge; v2 consistency anchor adds incremental value; egg sac and leg consistency not specifically addressed but general anchor covers them implicitly.",
    "Creature-Specific Adaptation": "Adaptations table covers massive proportions, thin limbs, dark coloring, and melee attacks with specific CLI flags; no boss-specific quality guidance or egg-sac verification step; dark/thin flag tension unresolved.",
    "Pipeline Robustness": "Troubleshooting tree covers direction flips, green fringe, thin limbs, and proportion changes; facing direction gate (v1) is the strongest feature; v2 adds cleanup remediation paths for secondary challenges."
  }
}
-->
