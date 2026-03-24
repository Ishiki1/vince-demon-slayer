# Dry-run: iter_005 — case_03 — Stone Golem (goon-generator skill only)

**Iteration 5 change:** Added a **Creature-Specific Adaptations** subsection under Phase 2 (between Phase 2 and Phase 3): a seven-row table covering **green/teal cleanup**, **thin limbs / fine detail**, **dark near-black silhouettes**, **held items**, **massive or unusual proportions**, **melee/slam facing language**, and **spell/projectile leftward paths**. Iteration 4 content — attack **8 frames (4×2)**, **~0.33s at 24fps** rationale, facing-direction gates, anti-patterns, and frame-index checks — is otherwise unchanged.

Below is how **Creature-Specific Adaptations** appear **applied to this dry-run**, followed by **Phase 4** and **Phase 5** as in iter_004 (`<goon>` = Stone golem; idle: subtle rumble/crack pulse; attack: ground slam).

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
| **Spell/projectile attacks** | Projectile facing failures | Explicitly: **the [spell/bolt] travels from the creature toward the LEFT edge of the frame.** | **N/A** — no projectile; shockwave/debris should still **propagate left** (already in iter_4 copy). |

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
    "Attack Animation Quality": 70,
    "Facing Direction Enforcement": 70,
    "Green Cleanup Verification": 63,
    "Frame Count Adequacy": 50,
    "Phase Completeness": 75,
    "Prompt Adaptability": 65
  },
  "reasoning": {
    "Attack Animation Quality": "+2 vs iter_4: slam row plus explicit “leaning forward toward the LEFT while striking downward” in peak framing tightens heavy melee readability.",
    "Facing Direction Enforcement": "Unchanged vs iter_4; same checklist — adaptations reduce wrong-way slams indirectly, not new gate steps.",
    "Green Cleanup Verification": "+3 vs iter_4: dark-body / outline-contrast row targets charcoal stone silhouette loss at clean + display size.",
    "Frame Count Adequacy": "Unchanged vs iter_4.",
    "Phase Completeness": "Score unchanged vs iter_4 at 75; Phase 2 adds adaptations; still no alternate phase variants for non-lunge archetypes.",
    "Prompt Adaptability": "+30 vs iter_4: dark outline, massive-in-frame, and slam-left wording directly address prior golem pain points."
  }
}
-->

**Weighted case score (AAQ 25%, FDE 20%, GCV 20%, FCA 15%, PC 10%, PA 10%):**  
70×0.25 + 70×0.20 + 63×0.20 + 50×0.15 + 75×0.10 + 65×0.10 = 17.5 + 14 + 12.6 + 7.5 + 7.5 + 6.5 = **65.60**
