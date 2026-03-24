# Baseline Dry-Run: Case 02 -- Vine Beast (Thornvine Horror)

## Test Case Summary
- **Creature:** Thornvine Horror (`thornvine`) -- twisted green/olive vines, red thorns, glowing orange eyes
- **Primary challenges:** Green-on-green separation, frame integrity with complex irregular shapes, display-size readability
- **Attack type:** Melee lunge (vine whip toward left)

## Dry-Run Execution Plan

### Phase 1: Read Project Context
Standard doc reads. No issues.

### Phase 2: Define the Goon
The agent defines goonType `thornvine`, display name "Thornvine Horror", stats, skill (e.g. `thornvine-whip-skill` using `poisonHero` effect), spawn weight. The skill's data template is clear.

**Skill guidance for this creature type:**
- The adaptation table identifies "Green/teal coloring" as applicable.
- Mitigation: "Use a lower cleanup threshold (24-28 instead of 32). After processing, use visual inspection for green halo instead of the automated green-pixel check."

**Critical gap:** The skill does NOT provide an alternative background color strategy. The adaptation table says to use a lower threshold and visual inspection, but this is fundamentally insufficient. A green creature on a green background cannot be cleanly separated by threshold alone, regardless of how low the threshold is. The creature's olive/forest green body pixels will overlap with the bright #00FF00 background in RGB space, and any threshold that removes the background will also damage the creature.

The correct approach (documented in the campaign brief but NOT in the skill) is either:
1. Use a non-green background color (magenta #FF00FF or blue #0000FF) for green creatures
2. Use the HSV-based keying with a very narrow hue range (`--hueLo 115 --hueHi 125`) that targets only pure #00FF00 and not olive/forest greens

The skill mentions neither approach. The agent would follow the standard green background workflow and produce catastrophically damaged sprites.

### Phase 3: Generate Static Reference Image
The agent uses the standard prompt template, which hardcodes "bright solid green (#00FF00) background." For a green creature, this is the wrong background color.

**Problem:** The prompt template does not have a conditional for green creatures. The agent would generate a green vine creature on a green background. The `asset:clean` step would then either:
- Remove the background AND parts of the creature (if threshold is normal)
- Leave green background remnants (if threshold is very low)

There is no good outcome with the current skill guidance.

**Likely outcome:** The reference image cleanup will either destroy vine body parts or leave green background. The agent might notice the problem during visual inspection but has no documented alternative path.

### Phase 4: Generate Idle Sprite Sheet
Same problem as Phase 3 -- the idle sheet prompt template hardcodes "Bright solid green (#00FF00) background." All 12 frames of a green vine creature on green background.

The idle motion would be "vines swaying, coiling, thorns pulsing." The prompt template handles the motion description well, and the facing direction enforcement is solid.

**Frame integrity concern:** Vine creatures have complex, irregular shapes. The AI generator may produce frames where vines extend differently, making uniform grid splitting unreliable. The skill does not mention content-aware grid detection as an alternative.

### Phase 5: Generate Attack Sprite Sheet
The agent would use the "Melee lunge" motion arc template for a vine whip attack. The template is appropriate -- describing the vine extending toward the left edge.

Same green-on-green background problem applies. The attack prompt also hardcodes green background.

### Phase 6: Process Sprite Sheets
The agent runs the standard `process-spritesheet.mjs` command with `4 3` grid.

**Catastrophic failure point:** The flood-fill green removal will:
1. Start from border-connected green pixels
2. Flood into the creature's green body (since olive/forest green is close to #00FF00)
3. Either destroy the creature or leave massive green artifacts

The skill's green residue check would detect high green pixel counts, but the "Special case -- green-skinned creatures" guidance says to "visually inspect the processed frames instead." This is the correct instinct but comes too late -- the creature is already damaged by the flood-fill.

The skill does NOT guide the agent to:
- Use `--hueLo`/`--hueHi` to narrow the hue range
- Use a different background color in the first place
- Use `--noAutoGrid` for content-aware grid detection on irregular shapes

**Frame integrity:** For complex vine shapes, the uniform grid splitter may cut through frames that extend beyond their grid cell. The skill mentions checking opaque pixel counts (>30k) but doesn't provide guidance on what to do when vine tendrils cross grid boundaries.

### Phase 7: Wire into Codebase
Code wiring is standard and well-documented. No issues.

### Phase 8: Update Docs and Validate
Standard. No issues.

## Rubric Evaluation

### Green Cleanup Quality
This is the worst-case scenario for the current skill. A green creature on a green background is a known failure mode, and the skill provides no viable path to handle it. The adaptation table says "lower threshold and visually inspect" which is insufficient -- the fundamental problem is that flood-fill cannot distinguish creature green from background green. The upgraded pipeline flags (narrow hue range) and alternative background color strategy are both absent from the skill.

### Frame Integrity
The skill has basic frame count and opaque pixel verification. However, for irregular vine shapes, the uniform grid splitter is likely to produce broken frames. The skill does not mention content-aware grid detection or the `--noAutoGrid` flag. The fallback guidance ("check grid dimensions") is too vague for this creature type.

### Animation Consistency
The prompt templates are solid for motion description. The vine whip attack maps well to the melee lunge template. However, vine creatures have inherently inconsistent shapes across AI-generated frames -- each frame may have different vine configurations. The skill doesn't provide vine-specific consistency guidance beyond the general "reduce to 8 frames" fallback.

### Creature-Specific Adaptation
The adaptation table identifies "green/teal coloring" but the mitigation (lower threshold + visual inspection) is fundamentally inadequate. The skill does not provide the two viable solutions: alternative background color or narrow HSV hue range. This is the most critical gap for this creature type.

### Pipeline Robustness
When the green-on-green cleanup fails (which it will), the agent has no documented remediation path. The troubleshooting flow is: detect green pixels -> "re-run with higher threshold" (wrong) or "visually inspect for green creatures" (correct detection, no fix). There's no decision tree that says "if creature is green, go back to Phase 3 and use a different background color."

## Scores

<!-- SCORES
{
  "scores": {
    "Green Cleanup Quality": 15,
    "Frame Integrity": 40,
    "Animation Consistency": 55,
    "Creature-Specific Adaptation": 15,
    "Pipeline Robustness": 20
  },
  "reasoning": {
    "Green Cleanup Quality": "Skill provides no viable path for green-on-green separation; the hardcoded green background and threshold-only cleanup will catastrophically damage a green creature.",
    "Frame Integrity": "Basic pixel count verification exists but no content-aware grid detection guidance for irregular vine shapes that cross grid boundaries.",
    "Animation Consistency": "Prompt templates handle vine whip motion well, but no vine-specific consistency guidance for inherently variable shapes across frames.",
    "Creature-Specific Adaptation": "Adaptation table identifies green coloring but mitigation (lower threshold) is fundamentally inadequate; alternative background color and narrow HSV hue range are both absent.",
    "Pipeline Robustness": "No remediation path when green-on-green cleanup fails; no decision tree to redirect to alternative background color strategy."
  }
}
-->
