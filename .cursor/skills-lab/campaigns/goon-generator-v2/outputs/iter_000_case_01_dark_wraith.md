# Baseline Dry-Run: Case 01 -- Dark Wraith (Shadow Wraith)

## Test Case Summary
- **Creature:** Shadow Wraith (`wraith`) -- dark robes, tendrils, deep black/purple, wispy edges
- **Primary challenges:** Green fringe on dark edges, thin tendril preservation, dark body vs black outline
- **Attack type:** Ranged spell (shadow bolt toward left)

## Dry-Run Execution Plan

### Phase 1: Read Project Context
The agent reads `cursor.md`, `GAME_DESIGN.md`, `spritework.md`, `src/config.js`. This phase is straightforward and well-documented in the skill. No issues expected.

### Phase 2: Define the Goon
The agent defines goonType `wraith`, display name "Shadow Wraith", stats, skill (e.g. `wraith-bolt-skill`), spawn weight. The skill's data template is clear and complete. The agent would also consult the **Creature-Specific Adaptations** table.

**Skill guidance for this creature type:**
- The table identifies "Dark coloring near black" and "Thin limbs or fine detail" as applicable.
- For dark coloring: skill says to request "clearly visible thick black outline that contrasts with the dark body" in the prompt, and verify outline is distinguishable after processing.
- For thin limbs: skill says to use a lower cleanup threshold (24-28) and zoom into thin features to confirm survival.

**Gap identified:** The skill does NOT mention the upgraded `process-spritesheet.mjs` flags (`--satMin`, `--spillPasses`, `--matteRadius`) that are specifically designed for dark creatures with green fringe. The agent would only know about the basic `--threshold` parameter and the old RGB-based cleanup. For a dark wraith, this is a critical gap -- the standard threshold-based cleanup is exactly what causes green fringe on dark edges.

### Phase 3: Generate Static Reference Image
The agent uses the prompt template with wraith-specific description. The template correctly enforces:
- Facing left (mentioned twice)
- Bright green (#00FF00) background
- Thick black outline
- Pixel art style

The agent then cleans with: `npm run asset:clean -- --input <raw> --output assets/goons/wraith-reference.png --canvas 512 --padding 20 --threshold 32`

**Problem:** The skill says "If green fringe survives, raise `--threshold` to 36 or 40." For a dark wraith, raising the threshold will eat INTO the dark tendrils (since dark pixels are closer to green in RGB space than bright pixels are). The correct approach for dark creatures is to use HSV-based keying with lower `--satMin` and extra `--spillPasses`, but the skill doesn't document these flags.

**Likely outcome:** The reference image will have either (a) green fringe if threshold stays at 32, or (b) damaged tendrils if threshold is raised to 40+. The agent has no guidance on the correct remediation path.

### Phase 4: Generate Idle Sprite Sheet
The skill's idle prompt template is well-structured with:
- Explicit 4x3 grid specification
- "NO divider lines" instruction
- Per-frame descriptions with facing-left enforcement
- Perfect loop guidance (frame 12 matches frame 1)
- Facing direction gate with max 3 attempts

For a wraith, the agent would describe "ethereal floating/swaying, tendrils drifting" as the idle motion. The prompt template handles this well.

**Facing direction gate:** The skill's 3-attempt gate with specific visual cues (head/face/eyes point left, asymmetric features on left side) is solid and would work for a wraith.

### Phase 5: Generate Attack Sprite Sheet
The skill's attack prompt template includes:
- Negative prompts against right-facing
- Anti-pattern warnings
- Motion arc examples (ranged spell/projectile template matches this creature)

For a shadow bolt, the agent would use the "Ranged spell/projectile" motion arc template, describing the bolt traveling toward the left edge. This is well-covered.

### Phase 6: Process Sprite Sheets
The agent runs:
```
node scripts/process-spritesheet.mjs <raw-idle> assets/goons/wraith_idle_512x512_sheet.png 4 3
node scripts/process-spritesheet.mjs <raw-attack> assets/goons/wraith_attack_512x512_sheet.png 4 3
```

**Critical gap:** The skill only documents the basic `<input> <output> <cols> <rows>` invocation. It does NOT document:
- `--hueLo` / `--hueHi` for HSV hue range (would allow targeting only bright green, not dark-adjacent greens)
- `--satMin` for minimum saturation (dark pixels have low saturation; lowering this catches green fringe on dark edges)
- `--valMin` for minimum value (controls brightness threshold for keying)
- `--spillPasses` for green spill suppression (removes green channel bleed on edge pixels)
- `--matteRadius` for alpha matting (softens edges near transparency boundary)
- `--noAutoGrid` for disabling content-aware grid detection

For a dark wraith, the agent would need `--satMin 0.15 --spillPasses 3 --matteRadius 2` (or similar) to properly clean green fringe from dark edges. Without this knowledge, the agent falls back to the basic threshold approach, which will fail.

**Green residue check:** The skill includes a post-processing green pixel check (`g>200 && r<100 && b<100`). This would detect bright green fringe. However, the remediation guidance says "re-run with higher threshold" or "re-run asset:clean with --threshold 40" -- both of which are wrong for dark creatures (higher threshold = more tendril damage).

**Outline integrity check:** The skill does mention checking that the black outline survived, and specifically calls out dark creatures as a risk. It says to "lower the cleanup --threshold (try 24 or 20)" if outline is degraded. This creates a contradiction: the green residue check says raise threshold, the outline check says lower it. The agent has no guidance on how to resolve this tension for dark creatures.

### Phase 7: Wire into Codebase
The code wiring templates are complete and correct. The agent would add:
- BootScene preload calls
- ENEMY_ANIMATIONS entries
- getEnemyAnimationSet branch
- Sprite creation chain branch
- Data definitions in dungeon.js and enemySkills.js

No issues expected here -- the templates are well-tested.

### Phase 8: Update Docs and Validate
The agent updates spritework.md, changelog.md, runs syntax checks. This phase is straightforward.

## Rubric Evaluation

### Green Cleanup Quality
The skill has a green residue check and mentions dark creatures as a risk case. However, it does NOT document the upgraded pipeline flags (HSV keying, spill passes, matte radius) that are specifically designed to solve green fringe on dark creatures. The remediation path ("raise threshold") is actively harmful for dark creatures. The agent would likely produce sprites with either green fringe or damaged tendrils, with no clear path to fix it.

### Frame Integrity
The skill guides the agent to verify frame counts and opaque pixels per frame (>30k threshold). It mentions the 4x3 grid explicitly. However, it does NOT mention content-aware grid detection (`--noAutoGrid` flag) as an option. For a wraith with flowing tendrils, the AI generator might produce uneven frame spacing, and the uniform grid splitter could cut through frames. The fallback guidance is limited to "check the grid dimensions."

### Animation Consistency
The skill has good prompt templates with per-frame descriptions and reference image locking. The idle loop guidance (frame 12 = frame 1) is solid. However, for wispy tendrils, consistency across 12 frames is a known challenge. The skill mentions reducing to 8 frames as a fallback but doesn't provide specific guidance on when to trigger this fallback (e.g., "if more than 3 frames have inconsistent tendril shapes, reduce to 8 frames").

### Creature-Specific Adaptation
The skill's adaptation table correctly identifies "dark coloring near black" and "thin limbs or fine detail" as applicable. It provides prompt-level mitigations (request visible outline, use lower threshold). However, the parameter recommendations are vague ("24-28 instead of 32") and don't cover the upgraded HSV-based pipeline flags that would actually solve the problem.

### Pipeline Robustness
The skill has verification steps (green pixel check, outline integrity check, opaque pixel count) but lacks a troubleshooting decision tree. When the green check fails, the remediation is "raise threshold" -- which conflicts with the outline check's "lower threshold" advice. There's no clear "if dark creature AND green fringe, then use --spillPasses" decision path.

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 30,
    "Frame Integrity": 50,
    "Animation Consistency": 60,
    "Creature-Specific Adaptation": 35,
    "Pipeline Robustness": 30
  },
  "reasoning": {
    "Green Cleanup Quality": "Skill has basic green pixel check but does not document HSV-based flags (satMin, spillPasses, matteRadius) critical for dark creatures, and the 'raise threshold' remediation is actively harmful.",
    "Frame Integrity": "Adequate frame count and opaque pixel verification exist, but no content-aware grid detection guidance or noAutoGrid flag documentation.",
    "Animation Consistency": "Good prompt templates with per-frame descriptions and loop guidance, but lacks specific consistency-check triggers for wispy/thin features.",
    "Creature-Specific Adaptation": "Adaptation table identifies dark coloring and thin limbs correctly, but parameter recommendations are vague and don't cover the upgraded pipeline flags.",
    "Pipeline Robustness": "Has verification steps but no troubleshooting decision tree; green check and outline check give contradictory remediation advice for dark creatures."
  }
}
-->
