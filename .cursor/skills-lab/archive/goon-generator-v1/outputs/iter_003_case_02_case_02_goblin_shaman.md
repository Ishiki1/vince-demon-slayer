# Dry-run: iter_003 — case_02 — Goblin Shaman (goon-generator skill only)

**Iteration 3 change:** Phase 4 (idle) and Phase 5 (attack) each add a **facing direction gate (max 3 attempts)** with explicit inspection criteria and a **fallback prompt adjustment** after three failed generations. Idle: three visual cues (head/eyes left, asymmetric features on the left, no mirrored frames) plus regeneration rule and idle-specific extra line. Attack: four inspection criteria (head/eyes left, action toward left, peak vs wind-up not mirrored, no right-facing frames), preserved **Attack direction anti-patterns to reject immediately**, plus heavier direction emphasis and simplified motion after three failures.

Below is how **Phase 4** and **Phase 5** appear in this dry-run (`<goon>` = goblin shaman; idle: staff/breathing sway; attack: staff blast).

---

## Phase 4: Generate idle sprite sheet

Generate a single image containing all idle animation frames in a grid.

**Prompt rules:**

- Reference the cleaned goon image via `reference_image_paths`.
- Request a specific grid: "exactly 2 rows of 4 frames each (4 columns, 2 rows)".
- Say "NO divider lines or borders between frames".
- Say "bright solid green (#00FF00) background".
- All frames face left.
- Describe subtle idle motion: breathing, pulsing, throat-sac inflating, body swaying.

**Idle prompt template (filled for this dry-run):**

```
A pixel art sprite sheet showing exactly 8 frames of an idle breathing animation,
arranged in exactly 2 rows of 4 frames each (4 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Goblin shaman creature FACING LEFT (looking toward the left side of the image).
Bright solid green (#00FF00) background with NO grid lines, NO borders, NO separators
between frames. Pixel art style with visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - Goblin shaman in normal resting pose facing left, staff held steady.
Frame 2 - Goblin shaman facing left, slight lean, robes shifting with breath.
Frame 3 - Goblin shaman facing left, peak of subtle staff glow or shoulder rise.
Frame 4 - Goblin shaman facing left, easing back from the peak sway.

Row 2 (left to right):
Frame 5 - Goblin shaman facing left, continuing return toward neutral stance.
Frame 6 - Goblin shaman facing left, slight crouch pulse, fetishes jostling.
Frame 7 - Goblin shaman facing left, transitioning back toward rest.
Frame 8 - Goblin shaman facing left, back to normal resting pose.

All frames must maintain the same robes, staff, and green skin tones (interior green OK).
Every single frame the Goblin shaman faces LEFT.
```

**Before processing -- facing direction gate (max 3 attempts):**

Inspect the generated idle sheet before processing. Check every frame for these specific cues:

1. The creature's head/face/eyes point toward the **left** edge of the image.
2. Any asymmetric features (held items, dominant limb, mouth opening) are on the **left** side of the body as viewed.
3. No frame is a mirror image of the others.

If ANY frame faces right, regenerate the entire sheet. Do not process a sheet with even one right-facing frame. After 3 failed generation attempts, adjust the prompt: add "The creature is looking to the LEFT, toward the left margin of the image" as an additional line and try again.

---

## Phase 5: Generate attack sprite sheet

Generate a single image containing all attack animation frames in a grid.

**Prompt rules:**

- Reference the cleaned goon image via `reference_image_paths`.
- Request a 3x2 grid (6 frames).
- Say "NO divider lines or borders between frames".
- Say "bright solid green (#00FF00) background".
- **Every frame** must face left -- repeat "facing left" in each frame description.
- Describe the attack sequence frame by frame: wind-up, action peak, recovery.
- Explicitly state the attack/lunge direction goes toward the LEFT edge.
- **Add negative prompts:** Include "The creature must NOT face right. The attack must NOT go toward the right side. Do NOT mirror or flip any frame." at the end of the prompt.
- **Add anti-pattern warning** in the prompt: "CRITICAL: attack animations are prone to accidental right-facing. Double-check that every frame's action goes LEFT."

**Attack prompt template (filled for this dry-run):**

```
A pixel art sprite sheet showing exactly 6 frames of a staff blast attack animation,
arranged in exactly 2 rows of 3 frames each (3 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Goblin shaman creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

CRITICAL DIRECTION RULE: The creature faces LEFT in ALL frames. The attack motion,
lunge, projectile, or strike goes TOWARD THE LEFT EDGE of the image. The creature
must NOT face right. The attack must NOT go toward the right side. Do NOT mirror
or flip any frame.

Row 1 (left to right):
Frame 1 - Goblin shaman crouching low facing left, compressing body, preparing to attack.
Frame 2 - Goblin shaman facing left, staff raised, gathering energy for the cast.
Frame 3 - Goblin shaman facing left, peak cast — bolt or wave erupts toward the left;
body fully extended toward the left. Attack goes LEFT, not right.

Row 2 (left to right):
Frame 4 - Goblin shaman facing left, magical follow-through, energy traveling left.
Frame 5 - Goblin shaman facing left, staff lowering, recovering from the spell.
Frame 6 - Goblin shaman facing left, returning to normal crouching pose.

All frames must maintain the same robes, staff, and green skin tones (interior green OK).
Every single frame the Goblin shaman faces LEFT. No frame may face right.

The creature must NOT face right. The attack must NOT go toward the right side.
Do NOT mirror or flip any frame.
CRITICAL: attack animations are prone to accidental right-facing. Double-check that
every frame's action goes LEFT.
```

**Before processing -- facing direction gate (max 3 attempts):**

This is the most common failure point -- attack animations frequently flip direction. Inspect EVERY frame for:

1. The creature's head/face/eyes point toward the **left** edge.
2. The attack action (lunge, projectile, slam) goes toward the **left** edge.
3. Peak frames (3-4) are NOT mirrored compared to wind-up frames (1-2).
4. No frame shows the creature facing or attacking toward the right.

**Attack direction anti-patterns to reject immediately:**

- The creature's body or head turned to face the right edge
- A projectile, bolt, or lunge going toward the right side of the frame
- Frames 3-4 (peak/follow-through) mirrored compared to frames 1-2
- The creature "winding up" by leaning right (the wind-up should compress the body, not change facing)

If ANY frame fails, regenerate the entire attack sheet. After 3 failed attempts, modify the prompt: emphasize facing direction even more heavily by adding "IMPORTANT: This creature attacks toward the LEFT margin. Every frame faces LEFT." and consider simplifying the attack motion description.

<!-- SCORES
{
  "scores": {
    "Attack Animation Quality": 68,
    "Facing Direction Enforcement": 70,
    "Green Cleanup Verification": 70,
    "Frame Count Adequacy": 35,
    "Phase Completeness": 80,
    "Prompt Adaptability": 40
  },
  "reasoning": {
    "Attack Animation Quality": "+3 vs iter_2: same as spider — dual gates and retries reduce accepting bad sheets; cast still squeezed into 6 frames.",
    "Facing Direction Enforcement": "+15 vs iter_2: explicit idle + attack checklists and bounded retry/fallback; bolt-left is directly testable in criterion 2.",
    "Green Cleanup Verification": "Unchanged from iter_2; green-skinned goblin still uses Phase 6 halo inspection path.",
    "Frame Count Adequacy": "Unchanged.",
    "Phase Completeness": "Idle gate is new operational weight vs iter_2 (which only highlighted Phase 5).",
    "Prompt Adaptability": "Unchanged PA vs iter_2; green skin and asymmetry (staff hand) still need human judgment."
  }
}
-->

**Weighted case score (AAQ 25%, FDE 20%, GCV 20%, FCA 15%, PC 10%, PA 10%):**  
68×0.25 + 70×0.20 + 70×0.20 + 35×0.15 + 80×0.10 + 40×0.10 = 17 + 14 + 14 + 5.25 + 8 + 4 = **62.25**
