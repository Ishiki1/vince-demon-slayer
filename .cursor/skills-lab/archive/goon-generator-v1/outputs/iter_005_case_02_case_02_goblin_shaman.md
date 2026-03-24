# Dry-run: iter_005 — case_02 — Goblin Shaman (goon-generator skill only)

**Iteration 5 change:** Added a **Creature-Specific Adaptations** subsection under Phase 2 (between Phase 2 and Phase 3): a seven-row table covering **green/teal cleanup**, **thin limbs / fine detail**, **dark near-black silhouettes**, **held items**, **massive or unusual proportions**, **melee/slam facing language**, and **spell/projectile leftward paths**. Iteration 4 content — attack **8 frames (4×2)**, **~0.33s at 24fps** rationale, facing-direction gates, anti-patterns, and frame-index checks — is otherwise unchanged.

Below is how **Creature-Specific Adaptations** appear **applied to this dry-run**, followed by **Phase 4** and **Phase 5** as in iter_004 (`<goon>` = Goblin shaman; idle: staff/breathing sway; attack: staff blast).

---

## Creature-Specific Adaptations (applied to this dry-run)

| Creature trait | Risk | Mitigation (skill text) | Applied to Goblin Shaman |
|---|---|---|---|
| **Green/teal coloring** (goblins, slimes, plant creatures) | Green skin blends with #00FF00 background during cleanup | Lower cleanup threshold (24–28). After processing, use **visual inspection** for green halo instead of the automated green-pixel check. | **Primary** — green skin risks **background merge**. Plan **threshold 24–28** on reference and sheets; after clean, **visually** judge halos (do not trust automated green-pixel count alone). |
| **Thin limbs or fine detail** (spiders, insects, skeletal creatures) | Thin legs/antennae get eaten by aggressive flood-fill or threshold | Lower cleanup threshold (24–28). After processing, **zoom into thin features** and confirm they survived; if limbs are lost, lower threshold further. | **Secondary** — long fingers, ears, and staff fingers are relatively fine. Same **24–28** band as green row; **zoom** ears/fingers/fetish strings after processing. |
| **Dark coloring near black** (stone golems, shadow creatures, dark metal) | Dark body blends with thick black outline | Prompt: **clearly visible thick black outline contrasting with the dark body.** Post-process: verify outline reads at display size. | **Low** — robes and skin are mid-to-bright; keep standard outline checks unless a shadowed limb disappears into the outline. |
| **Held items** (staffs, weapons, shields, orbs) | Items disappear, swap hands, or drift between frames | Every frame description: **item + which hand**; closing line: *"The [item] must appear in every frame in the [left/right] hand."* | **Primary** — **staff** must be named per frame (e.g. *left hand on staff shaft*) with closing enforcement: *"The carved staff must appear in every frame in the left hand"* (adjust hand to match art direction — here **left** matches facing-left shamans in prior dry-runs). |
| **Massive/unusual proportions** (golems, giants, dragons) | Clipping or unreadable silhouette at 120×150 | Reference prompt: **creature fits entirely in frame with no clipping**; consider small-display readability. | **N/A** — standard humanoid scale. |
| **Melee/slam attacks** (no projectile) | Vertical slams vs generic “lunge left” | Describe slam as **leaning forward toward the LEFT while striking downward**. | **N/A** — attack is a **staff blast** (ranged magic), not a slam. |
| **Spell/projectile attacks** | Projectile facing failures | Explicitly: **the [spell/bolt] travels from the creature toward the LEFT edge of the frame.** | **Primary** — add to attack prompt: **bolt or arc travels from the shaman toward the LEFT edge** in wind-up through follow-through frames (already partially present; adaptations table makes it mandatory planning). |

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
- Request a **4×2 grid (8 frames)**. At **24fps**, **8 frames ≈ 0.33s** — enough for wind-up, peak, and recovery to read clearly.
- Say "NO divider lines or borders between frames".
- Say "bright solid green (#00FF00) background".
- **Every frame** must face left -- repeat "facing left" in each frame description.
- Describe the attack sequence frame by frame using the eight-beat template (ready → early/full wind-up → peak → impact → follow-through → recovery → return).
- Explicitly state the attack/lunge direction goes toward the LEFT edge.
- **Add negative prompts:** Include "The creature must NOT face right. The attack must NOT go toward the right side. Do NOT mirror or flip any frame." at the end of the prompt.
- **Add anti-pattern warning** in the prompt: "CRITICAL: attack animations are prone to accidental right-facing. Double-check that every frame's action goes LEFT."

**Attack prompt template (filled for this dry-run):**

```
A pixel art sprite sheet showing exactly 8 frames of a staff blast attack animation,
arranged in exactly 2 rows of 4 frames each (4 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Goblin shaman creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

CRITICAL DIRECTION RULE: The creature faces LEFT in ALL frames. The attack motion,
lunge, projectile, or strike goes TOWARD THE LEFT EDGE of the image. The creature
must NOT face right. The attack must NOT go toward the right side. Do NOT mirror
or flip any frame.

Row 1 (left to right):
Frame 1 - Goblin shaman in ready stance facing left, staff forward, eyes on the hero.
Frame 2 - Goblin shaman facing left, early wind-up — staff tip lifting, shoulders rolling.
Frame 3 - Goblin shaman facing left, full wind-up — staff high or orbiting, energy pooling.
Frame 4 - Goblin shaman facing left, peak of attack — cast committed, bolt or wave
erupting toward the left. Attack goes LEFT, not right.

Row 2 (left to right):
Frame 5 - Goblin shaman facing left, impact/release — bolt fully launched, brightest
energy traveling left along the staff line.
Frame 6 - Goblin shaman facing left, follow-through — robes and fetishes whip as the
wave continues left past the body.
Frame 7 - Goblin shaman facing left, recovery — staff lowering, stance settling.
Frame 8 - Goblin shaman facing left, returning to neutral / ready crouch.

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
3. Peak and impact frames (**4–5**) are NOT mirrored compared to wind-up frames (**1–3**).
4. No frame shows the creature facing or attacking toward the right.

**Attack direction anti-patterns to reject immediately:**

- The creature's body or head turned to face the right edge
- A projectile, bolt, or lunge going toward the right side of the frame
- Frames **4–5** (peak / impact) mirrored compared to frames **1–3** (wind-up)
- The creature "winding up" by leaning right (the wind-up should compress the body, not change facing)

If ANY frame fails, regenerate the entire attack sheet. After 3 failed attempts, modify the prompt: emphasize facing direction even more heavily by adding "IMPORTANT: This creature attacks toward the LEFT margin. Every frame faces LEFT." and consider simplifying the attack motion description.

<!-- SCORES
{
  "scores": {
    "Attack Animation Quality": 72,
    "Facing Direction Enforcement": 70,
    "Green Cleanup Verification": 73,
    "Frame Count Adequacy": 55,
    "Phase Completeness": 80,
    "Prompt Adaptability": 65
  },
  "reasoning": {
    "Attack Animation Quality": "Unchanged vs iter_4; staff blast eight-beat arc unchanged.",
    "Facing Direction Enforcement": "Unchanged vs iter_4.",
    "Green Cleanup Verification": "+3 vs iter_4: explicit green/teal row mandates lower threshold and visual halo check for this skin tone.",
    "Frame Count Adequacy": "Unchanged vs iter_4.",
    "Phase Completeness": "Score unchanged vs iter_4 at 80; Phase 2 gains adaptations planning; phase inventory otherwise as iter_4.",
    "Prompt Adaptability": "+25 vs iter_4: green cleanup + held staff (per-frame + closing line) + projectile-left row directly match this goon."
  }
}
-->

**Weighted case score (AAQ 25%, FDE 20%, GCV 20%, FCA 15%, PC 10%, PA 10%):**  
72×0.25 + 70×0.20 + 73×0.20 + 55×0.15 + 80×0.10 + 65×0.10 = 18 + 14 + 14.6 + 8.25 + 8 + 6.5 = **69.35**
