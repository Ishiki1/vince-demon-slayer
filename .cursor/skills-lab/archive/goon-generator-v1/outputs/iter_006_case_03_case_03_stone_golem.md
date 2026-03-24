# Dry-run: iter_006 — case_03 — Stone Golem (goon-generator skill only)

**Iteration 6 change:** Added a **Frame Count Guidance** section **between Phase 3 and Phase 4**: timing table, **4–6 vs 10–12** trade-offs, and **heavy/massive** note to try **attack `frameRate` 20fps** (0.4s) in `ENEMY_ANIMATIONS` before regenerating with more frames — directly relevant to slam **weight** at default 24fps. **Iteration 5** content is otherwise unchanged.

Below is **Frame Count Guidance** as it appears in the skill (after Phase 3, before Phase 4), then **Creature-Specific Adaptations** applied to this dry-run, then **Phase 4** and **Phase 5** as in iter_005 (`<goon>` = Stone golem; idle: subtle rumble/crack pulse; attack: ground slam).

---

## Frame Count Guidance

Both idle and attack use 8 frames in a 4x2 grid. This is the sweet spot for image-generator quality vs animation smoothness:

| Animation | Frames | Grid | FPS | Duration | Notes |
|-----------|--------|------|-----|----------|-------|
| Idle | 8 | 4x2 | 20 | 0.4s loop | Subtle motion -- breathing, swaying. 0.4s is long enough for a natural breathing cycle. |
| Attack | 8 | 4x2 | 24 | 0.33s one-shot | Must cover wind-up → peak → recovery. 0.33s reads clearly for most attack speeds. |

**Trade-offs:**

- **Fewer frames (4-6):** Easier for the image generator to keep consistent between frames, but animation looks choppy. Only use if 8-frame sheets consistently fail quality checks.
- **More frames (10-12):** Smoother animation, but image generators struggle to maintain character consistency across that many frames in one sheet. Quality drops significantly past 8 frames.
- **Heavy/massive creatures** (golems, giants): 8 attack frames at 24fps may feel slightly fast for conveying weight. The slower recovery in frames 7-8 helps. If the attack still looks too fast in-game, consider reducing the attack `frameRate` to 20fps (0.4s) in the ENEMY_ANIMATIONS entry -- this is cheaper than regenerating with more frames.

**Application (this dry-run):** Stone golem matches **heavy/massive** — after wiring, if the **ground slam** reads rushed, **lower attack `frameRate` to 20** per skill instead of expanding past 8 frames (which the skill warns hurts consistency). **Frames 7–8** recovery is explicitly called out as helping weight even at 24fps.

---

## Creature-Specific Adaptations (applied to this dry-run)

| Creature trait | Risk | Mitigation (skill text) | Applied to Stone Golem |
|---|---|---|---|
| **Green/teal coloring** (goblins, slimes, plant creatures) | Green skin blends with #00FF00 background during cleanup | Lower cleanup threshold (24–28). After processing, use **visual inspection** for green halo instead of the automated green-pixel check. | **N/A** — stone and dust tones, not green skin. Standard threshold unless unusual moss highlights force a visual pass. |
| **Thin limbs or fine detail** (spiders, insects, skeletal creatures) | Thin legs/antennae get eaten by aggressive flood-fill or threshold | Lower cleanup threshold (24–28). After processing, **zoom into thin features** and confirm they survived; if limbs are lost, lower threshold further. | **Low** — thick plates; optional **zoom** on **crack lines** and thin dust strokes if the model over-thins them. |
| **Dark coloring near black** (stone golems, shadow creatures, dark metal) | Dark body blends with thick black outline | Prompt: **clearly visible thick black outline contrasting with the dark body.** Post-process: verify outline reads at display size. | **Primary** — charcoal stone risks **silhouette loss**. Reference + sheet prompts must demand **outline clearly separated from dark rock**; verify at **120×150** after clean. |
| **Held items** (staffs, weapons, shields, orbs) | Items disappear, swap hands, or drift between frames | Every frame description: **item + which hand**; closing line: *"The [item] must appear in every frame in the [left/right] hand."* | **N/A** — unarmed slam. |
| **Massive/unusual proportions** (golems, giants, dragons) | Clipping or unreadable silhouette at 120×150 | Reference prompt: **creature fits entirely in frame with no clipping**; consider small-display readability. | **Primary** — emphasize **full body inside frame**, **heavy readable silhouette at small size**, and **no clipped fists or crown** in reference and grid prompts. |
| **Melee/slam attacks** (no projectile) | Vertical slams vs generic “lunge left” | Describe slam as **leaning forward toward the LEFT while striking downward**. | **Primary** — replace generic “slam forward” ambiguity with **leaning forward toward the LEFT while striking downward** in wind-up through follow-through so vertical stomp still **biases left**. |
| **Spell/projectile attacks** | Projectile facing failures | Explicitly: **the [spell/bolt] travels from the creature toward the LEFT edge of the frame.** | **N/A** — no projectile; shockwave/debris should still **propagate left** (already in prior copy). |

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
Stone golem creature FACING LEFT (looking toward the left side of the image).
Bright solid green (#00FF00) background with NO grid lines, NO borders, NO separators
between frames. Pixel art style with visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - Stone golem in normal resting pose facing left, weight heavy on forward foot.
Frame 2 - Stone golem facing left, slight rise as runes flicker along seams.
Frame 3 - Stone golem facing left, peak of subtle chest/shoulder grind forward.
Frame 4 - Stone golem facing left, easing back from the forward pulse.

Row 2 (left to right):
Frame 5 - Stone golem facing left, continuing return toward neutral stance.
Frame 6 - Stone golem facing left, dust motes or crack pulse at feet.
Frame 7 - Stone golem facing left, transitioning back toward rest.
Frame 8 - Stone golem facing left, back to normal resting pose.

All frames must maintain the same cracked stone plates, rune seams, and heavy silhouette.
Every single frame the Stone golem faces LEFT.
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
A pixel art sprite sheet showing exactly 8 frames of a ground slam attack animation,
arranged in exactly 2 rows of 4 frames each (4 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Stone golem creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

CRITICAL DIRECTION RULE: The creature faces LEFT in ALL frames. The attack motion,
lunge, projectile, or strike goes TOWARD THE LEFT EDGE of the image. The creature
must NOT face right. The attack must NOT go toward the right side. Do NOT mirror
or flip any frame.

Row 1 (left to right):
Frame 1 - Stone golem in ready stance facing left, weight coiled, fists low.
Frame 2 - Stone golem facing left, early wind-up — knees bending, arms beginning to draw back.
Frame 3 - Stone golem facing left, full wind-up — arms at maximum rear swing, body loaded.
Frame 4 - Stone golem facing left, peak of attack — slam driving down while leaning
forward toward the LEFT, shockwave origin biased left. Attack reads LEFT, not right.

Row 2 (left to right):
Frame 5 - Stone golem facing left, impact/release — dust ring and cracks jump toward the left.
Frame 6 - Stone golem facing left, follow-through — debris and fracture lines continue propagating left.
Frame 7 - Stone golem facing left, recovery — rising from deepest crouch, mass settling.
Frame 8 - Stone golem facing left, returning to neutral heavy stance.

All frames must maintain the same cracked stone plates, rune seams, and heavy silhouette.
Every single frame the Stone golem faces LEFT. No frame may face right.

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
    "Attack Animation Quality": 71,
    "Facing Direction Enforcement": 70,
    "Green Cleanup Verification": 63,
    "Frame Count Adequacy": 68,
    "Phase Completeness": 75,
    "Prompt Adaptability": 65
  },
  "reasoning": {
    "Attack Animation Quality": "+1 vs iter_005: Frame Count Guidance ties default 8-frame attack timing to readable wind-up/peak/recovery and names recovery frames for weight — complements slam-left wording.",
    "Facing Direction Enforcement": "Unchanged vs iter_005.",
    "Green Cleanup Verification": "Unchanged vs iter_005.",
    "Frame Count Adequacy": "+18 vs iter_005: heavy-creature bullet gives a concrete **playback** lever (20fps attack) for mass without breaking the 8-frame template; table states why 8 is default.",
    "Phase Completeness": "Unchanged vs iter_005 at 75.",
    "Prompt Adaptability": "Unchanged vs iter_005; golem benefits most from the heavy/massive row in the new section."
  }
}
-->

**Weighted case score (AAQ 25%, FDE 20%, GCV 20%, FCA 15%, PC 10%, PA 10%):**  
71×0.25 + 70×0.20 + 63×0.20 + 68×0.15 + 75×0.10 + 65×0.10 = 17.75 + 14 + 12.6 + 10.2 + 7.5 + 6.5 = **68.55**
