# Dry-run: iter_002 — case_01 — Frost Spider (goon-generator skill only)

**Iteration 2 change:** Phase 5 (attack sprite sheet) adds **negative prompts** and **anti-pattern guidance**: end-of-prompt lines forbidding right-facing, rightward attack, and mirroring; a **CRITICAL DIRECTION RULE** block inside the attack template; Frame 3 text **“Attack goes LEFT, not right”**; closing line **“No frame may face right”**; and an **Attack direction anti-patterns to watch for** checklist after the prompt (body/head right, projectile right, frames 3–4 mirrored vs 1–2, wind-up leaning right). Phase 6 **green residue check** and all other phases are unchanged from iteration 1.

Below is **Phase 5** as it would appear in this dry-run (`<goon>` = `spider`; attack type example: icy pounce).

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
A pixel art sprite sheet showing exactly 6 frames of an icy pounce attack animation,
arranged in exactly 2 rows of 3 frames each (3 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Frost spider creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

CRITICAL DIRECTION RULE: The creature faces LEFT in ALL frames. The attack motion,
lunge, projectile, or strike goes TOWARD THE LEFT EDGE of the image. The creature
must NOT face right. The attack must NOT go toward the right side. Do NOT mirror
or flip any frame.

Row 1 (left to right):
Frame 1 - Frost spider crouching low facing left, compressing body, preparing to attack.
Frame 2 - Frost spider facing left, legs coiling, frost gathering for the leap.
Frame 3 - Frost spider facing left, mid-pounce toward the hero, legs extended;
body fully extended toward the left. Attack goes LEFT, not right.

Row 2 (left to right):
Frame 4 - Frost spider facing left, landing follow-through, frost trail toward the left.
Frame 5 - Frost spider facing left, pulling back, recovering from the pounce.
Frame 6 - Frost spider facing left, returning to normal crouching pose.

All frames must maintain the same icy legs, dark carapace, and pale frost highlights.
Every single frame the Frost spider faces LEFT. No frame may face right.

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
    "Attack Animation Quality": 65,
    "Facing Direction Enforcement": 55,
    "Green Cleanup Verification": 65,
    "Frame Count Adequacy": 35,
    "Phase Completeness": 80,
    "Prompt Adaptability": 45
  },
  "reasoning": {
    "Attack Animation Quality": "Negative prompts, CRITICAL DIRECTION RULE, peak-frame LEFT cue, and anti-pattern checklist materially reduce right-facing drift; still 6 frames and no timing/spacing analysis for a spider pounce.",
    "Facing Direction Enforcement": "Structural negatives plus a concrete inspection checklist beat generic 'visually inspect' alone; still no retry cap or automated facing check.",
    "Green Cleanup Verification": "Unchanged from iter_1: Phase 6 green residue scan, thresholds, remediation, green-skin special case.",
    "Frame Count Adequacy": "Unchanged: fixed 3×2 attack grid; no extra frames or fps reasoning.",
    "Phase Completeness": "Unchanged: full pipeline; Phase 5 gains explicit direction and QA hooks.",
    "Prompt Adaptability": "Template improvements are general; spider-specific motion still filled in by the operator."
  }
}
-->

Weighted case score: 65×0.25 + 55×0.20 + 65×0.20 + 35×0.15 + 80×0.10 + 45×0.10 = 16.25 + 11.0 + 13.0 + 5.25 + 8.0 + 4.5 = **58.00**
