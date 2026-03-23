# Dry-run: iter_002 — case_03 — Stone Golem (goon-generator skill only)

**Iteration 2 change:** Phase 5 (attack sprite sheet) adds **negative prompts** and **anti-pattern guidance**: end-of-prompt lines forbidding right-facing, rightward attack, and mirroring; a **CRITICAL DIRECTION RULE** block inside the attack template; Frame 3 text **“Attack goes LEFT, not right”**; closing line **“No frame may face right”**; and an **Attack direction anti-patterns to watch for** checklist after the prompt (body/head right, projectile right, frames 3–4 mirrored vs 1–2, wind-up leaning right). Phase 6 **green residue check** and all other phases are unchanged from iteration 1.

Below is **Phase 5** as it would appear in this dry-run (`<goon>` = `golem`; attack type example: ground slam — still a weaker fit for a lunge-left template).

---

## Phase 5: Generate attack sprite sheet

Generate a single image containing all attack animation frames in a grid.

**Prompt rules:**

- Reference the cleaned goon image via `reference_image_paths`.
- Request a 3×2 grid (6 frames).
- Say “NO divider lines or borders between frames”.
- Say “bright solid green (#00FF00) background”.
- **Every frame** must face left — repeat “facing left” in each frame description.
- Describe the attack sequence frame by frame: wind-up, action peak, recovery.
- Explicitly state the attack/lunge direction goes toward the LEFT edge.
- **Add negative prompts:** Include “The creature must NOT face right. The attack must NOT go toward the right side. Do NOT mirror or flip any frame.” at the end of the prompt.
- **Add anti-pattern warning** in the prompt: “CRITICAL: attack animations are prone to accidental right-facing. Double-check that every frame’s action goes LEFT.”

**Attack prompt template (filled for this dry-run):**

```
A pixel art sprite sheet showing exactly 6 frames of a ground slam attack animation,
arranged in exactly 2 rows of 3 frames each (3 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Stone golem creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

CRITICAL DIRECTION RULE: The creature faces LEFT in ALL frames. The attack motion,
lunge, projectile, or strike goes TOWARD THE LEFT EDGE of the image. The creature
must NOT face right. The attack must NOT go toward the right side. Do NOT mirror
or flip any frame.

Row 1 (left to right):
Frame 1 - Stone golem crouching low facing left, compressing body, preparing to attack.
Frame 2 - Stone golem facing left, both arms winding back, weight shifting for the slam.
Frame 3 - Stone golem facing left, impact peak — fists or shockwave directed toward the left;
body fully extended toward the left. Attack goes LEFT, not right.

Row 2 (left to right):
Frame 4 - Stone golem facing left, debris or crack follow-through propagating left.
Frame 5 - Stone golem facing left, rising from the crouch, recovering.
Frame 6 - Stone golem facing left, returning to normal crouching pose.

All frames must maintain the same cracked stone plates, rune seams, and heavy silhouette.
Every single frame the Stone golem faces LEFT. No frame may face right.

The creature must NOT face right. The attack must NOT go toward the right side.
Do NOT mirror or flip any frame.
CRITICAL: attack animations are prone to accidental right-facing. Double-check that
every frame's action goes LEFT.
```

**Before processing:** Visually inspect the generated attack sheet. This is the most common failure point — attack animations frequently flip direction. The lunge/strike in the peak frames MUST go toward the LEFT edge. If any frame faces right, regenerate immediately. Do not process a right-facing attack sheet.

**Attack direction anti-patterns to watch for:**

- The creature’s body or head turned to face the right edge
- A projectile, bolt, or lunge going toward the right side of the frame
- Frames 3–4 (peak/follow-through) mirrored compared to frames 1–2
- The creature “winding up” by leaning right (the wind-up should compress the body, not change facing)

<!-- SCORES
{
  "scores": {
    "Attack Animation Quality": 60,
    "Facing Direction Enforcement": 55,
    "Green Cleanup Verification": 60,
    "Frame Count Adequacy": 30,
    "Phase Completeness": 75,
    "Prompt Adaptability": 35
  },
  "reasoning": {
    "Attack Animation Quality": "Direction rules help, but slam-as-left-lunge remains semantically awkward; 6 frames still tight for weight and impact.",
    "Facing Direction Enforcement": "Same iter_2 checklist and negatives as other cases; no new golem-specific facing tests.",
    "Green Cleanup Verification": "Unchanged Phase 6; stone body has no green-skin bypass — same as iter_1 baseline for this case.",
    "Frame Count Adequacy": "Heavy slam benefits from more hold/recovery frames; fixed 6-frame grid unchanged.",
    "Phase Completeness": "Same phases as iter_1; minor note that template is melee-lunge biased vs stomp variants.",
    "Prompt Adaptability": "Operator must stretch 'lunge/projectile' language to shockwave-left; less natural than spider or caster."
  }
}
-->

Weighted case score: 60×0.25 + 55×0.20 + 60×0.20 + 30×0.15 + 75×0.10 + 35×0.10 = 15.0 + 11.0 + 12.0 + 4.5 + 7.5 + 3.5 = **53.50**
