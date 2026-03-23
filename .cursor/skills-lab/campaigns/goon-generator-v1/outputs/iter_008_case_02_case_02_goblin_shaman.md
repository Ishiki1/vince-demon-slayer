# Dry-run: iter_008 — case_02 — Goblin Shaman (goon-generator skill only)

**Iteration 8 change:** **Idle** and **attack** prompt templates include a **compositional anchor**: *"The viewer sees the creature from a side-profile view showing its LEFT flank -- the creature's head points left and its tail/back faces right."* **Frame 1** of the idle list adds **LEFT flank visible to viewer**. This locks camera/viewpoint for consistent left-facing output. **Iteration 7** motion-arc examples and prior pipeline guidance are otherwise unchanged.

Below is **Frame Count Guidance**, then **Creature-Specific Adaptations** for this dry-run, then **Phase 4** and **Phase 5**. Phase 5 uses the **ranged spell/projectile** example for the staff blast (`<goon>` = Goblin shaman).

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

**Application (this dry-run):** Shaman is standard weight; default **8 @ 24fps** attack applies. Attack beats follow the **ranged spell/projectile** arc (staff blast).

---

## Creature-Specific Adaptations (applied to this dry-run)

| Creature trait | Risk | Mitigation (skill text) | Applied to Goblin Shaman |
|---|---|---|---|
| **Green/teal coloring** (goblins, slimes, plant creatures) | Green skin blends with #00FF00 background during cleanup | Lower cleanup threshold (24–28). After processing, use **visual inspection** for green halo instead of the automated green-pixel check. | **Primary** — green skin risks **background merge**. Plan **threshold 24–28** on reference and sheets; after clean, **visually** judge halos (do not trust automated green-pixel count alone). |
| **Thin limbs or fine detail** (spiders, insects, skeletal creatures) | Thin legs/antennae get eaten by aggressive flood-fill or threshold | Lower cleanup threshold (24–28). After processing, **zoom into thin features** and confirm they survived; if limbs are lost, lower threshold further. | **Secondary** — long fingers, ears, and staff details are relatively fine. Same **24–28** band; **zoom** ears/fingers/fetish strings after processing. |
| **Dark coloring near black** (stone golems, shadow creatures, dark metal) | Dark body blends with thick black outline | Prompt: **clearly visible thick black outline contrasting with the dark body.** Post-process: verify outline reads at display size. | **Low** — robes and skin are mid-to-bright; keep standard outline checks unless a shadowed limb disappears into the outline. |
| **Held items** (staffs, weapons, shields, orbs) | Items disappear, swap hands, or drift between frames | Every frame description: **item + which hand**; closing line: *"The [item] must appear in every frame in the [left/right] hand."* | **Primary** — **staff** named per frame with closing enforcement: *"The carved staff must appear in every frame in the left hand."* |
| **Massive/unusual proportions** (golems, giants, dragons) | Clipping or unreadable silhouette at 120×150 | Reference prompt: **creature fits entirely in frame with no clipping**; consider small-display readability. | **N/A** — standard humanoid scale. |
| **Melee/slam attacks** (no projectile) | Vertical slams vs generic “lunge left” | Describe slam as **leaning forward toward the LEFT while striking downward**. | **N/A** — staff blast is ranged. |
| **Spell/projectile attacks** | Projectile facing failures | Explicitly: **the [spell/bolt] travels from the creature toward the LEFT edge of the frame.** | **Primary** — **ranged example** embeds F4–F6 LEFT launch, flight, and caster recoil; pair with staff-in-left-hand every frame. |

---

## Phase 4: Generate idle sprite sheet

Generate a single image containing all idle animation frames in a grid.

**Prompt rules:**

- Reference the cleaned goon image via `reference_image_paths`.
- Request a specific grid: "exactly 2 rows of 4 frames each (4 columns, 2 rows)".
- Say "NO divider lines or borders between frames".
- Say "bright solid green (#00FF00) background".
- Include the **compositional anchor** and **Frame 1** **LEFT flank visible to viewer**.
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

The viewer sees the creature from a side-profile view showing its LEFT flank -- the
creature's head points left and its tail/back faces right.

Row 1 (left to right):
Frame 1 - Goblin shaman in normal resting pose facing left, staff held steady, LEFT flank visible to viewer.
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
- Include the **compositional anchor** in the attack prompt.
- **Every frame** must face left -- repeat "facing left" in each frame description.
- Describe the attack sequence using the eight-beat template and the **ranged spell/projectile** motion arc example.
- Explicitly state the attack/lunge direction goes toward the LEFT edge.
- **Add negative prompts:** Include "The creature must NOT face right. The attack must NOT go toward the right side. Do NOT mirror or flip any frame." at the end of the prompt.
- **Add anti-pattern warning** in the prompt: "CRITICAL: attack animations are prone to accidental right-facing. Double-check that every frame's action goes LEFT."

**Attack-type motion arc examples** (as in skill):

*Melee lunge (biting, clawing, pouncing):*
- F1: ready stance, body low. F2: legs coiling, body compressing toward left. F3: muscles tensed, jaws/claws drawn back. F4: explosive lunge toward LEFT, body stretched, jaws/claws at full extension. F5: impact moment, jaws clamping / claws raking. F6: recoil from hit, body bouncing back slightly. F7: pulling back, body curling. F8: settling to ready stance.

*Vertical slam (fist pound, ground strike, stomp):*
- F1: standing ready, facing left. F2: both arms/fists raising overhead. F3: arms at apex, body leaning forward-left. F4: slamming DOWN and toward LEFT, arms descending. F5: impact -- fists hitting ground, debris/shockwave spreading. F6: ground crack visible, body still low from slam. F7: slowly pushing back up, arms withdrawing. F8: returning to standing ready.

*Ranged spell/projectile (bolts, spit, thrown objects):*
- F1: caster in ready stance, staff/arm resting. F2: raising staff/arm, energy beginning to gather. F3: energy at peak, glowing bright at staff tip / hand / mouth. F4: release -- projectile launching TOWARD THE LEFT from the staff/hand/mouth. F5: projectile in flight toward LEFT edge, caster recoiling slightly. F6: follow-through, caster off-balance from release. F7: caster steadying, energy dissipating. F8: returning to ready stance.

**Attack prompt template (filled for this dry-run — staff blast following ranged arc):**

```
A pixel art sprite sheet showing exactly 8 frames of a staff blast attack animation,
arranged in exactly 2 rows of 4 frames each (4 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Goblin shaman creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

The viewer sees the creature from a side-profile view showing its LEFT flank -- the
creature's head points left and its tail/back faces right.

CRITICAL DIRECTION RULE: The creature faces LEFT in ALL frames. The attack motion,
lunge, projectile, or strike goes TOWARD THE LEFT EDGE of the image. The creature
must NOT face right. The attack must NOT go toward the right side. Do NOT mirror
or flip any frame.

Row 1 (left to right):
Frame 1 - Goblin shaman ready stance facing left, staff in left hand, tip low (ranged F1).
Frame 2 - Goblin shaman facing left, raising staff, green energy beginning to gather at tip (F2).
Frame 3 - Goblin shaman facing left, energy at peak, staff tip blazing, eyes locked left (F3).
Frame 4 - Goblin shaman facing left, release — bolt or arc launching TOWARD THE LEFT from the staff tip (F4).

Row 2 (left to right):
Frame 5 - Goblin shaman facing left, bolt in flight toward LEFT edge, shoulders snapping back slightly (F5).
Frame 6 - Goblin shaman facing left, follow-through, robes whipping, caster off-balance from release (F6).
Frame 7 - Goblin shaman facing left, steadying, glow fading along staff, feet replanting (F7).
Frame 8 - Goblin shaman facing left, returning to neutral ready stance, staff in left hand (F8).

All frames must maintain the same robes, staff, and green skin tones (interior green OK).
Every single frame the Goblin shaman faces LEFT. No frame may face right.
The carved staff must appear in every frame in the left hand.

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
    "Attack Animation Quality": 79,
    "Facing Direction Enforcement": 76,
    "Green Cleanup Verification": 73,
    "Frame Count Adequacy": 70,
    "Phase Completeness": 80,
    "Prompt Adaptability": 67
  },
  "reasoning": {
    "Attack Animation Quality": "+1 vs iter_007: viewport anchor aligns staff and bolt trajectory with a fixed side view so gather → release LEFT reads more consistently.",
    "Facing Direction Enforcement": "+6 vs iter_007: side-profile flank line is preventive composition, stacked with gates and negative prompts.",
    "Green Cleanup Verification": "Unchanged vs iter_007.",
    "Frame Count Adequacy": "Unchanged vs iter_007 at 70.",
    "Phase Completeness": "Unchanged vs iter_007 at 80.",
    "Prompt Adaptability": "Unchanged vs iter_007 at 67."
  }
}
-->

**Weighted case score (AAQ 25%, FDE 20%, GCV 20%, FCA 15%, PC 10%, PA 10%):**  
79×0.25 + 76×0.20 + 73×0.20 + 70×0.15 + 80×0.10 + 67×0.10 = 19.75 + 15.2 + 14.6 + 10.5 + 8 + 6.7 = **74.75**
