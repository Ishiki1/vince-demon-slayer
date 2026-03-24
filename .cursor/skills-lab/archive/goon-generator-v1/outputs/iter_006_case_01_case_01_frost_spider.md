# Dry-run: iter_006 — case_01 — Frost Spider (goon-generator skill only)

**Iteration 6 change:** Added a **Frame Count Guidance** section **between Phase 3 and Phase 4**: a table for **idle** (8 frames, 4×2, 20fps, 0.4s loop) and **attack** (8 frames, 4×2, 24fps, 0.33s one-shot) with per-row reasoning; **trade-off** bullets for fewer frames (4–6) vs more (10–12); and **heavy/massive creatures** (golems, giants) — 8 attack frames at 24fps may feel fast, with guidance to try **attack `frameRate` 20fps** in `ENEMY_ANIMATIONS` instead of regenerating with more frames. **Iteration 5** — Creature-Specific Adaptations table, eight-frame templates, facing gates, and later phases — is otherwise unchanged.

Below is **Frame Count Guidance** as it appears in the skill (after Phase 3, before Phase 4), then **Creature-Specific Adaptations** applied to this dry-run, then **Phase 4** and **Phase 5** as in iter_005 (`<goon>` = Frost spider; idle: breathing/sway; attack: icy pounce).

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

**Application (this dry-run):** Frost spider is not in the heavy/massive category; default **8 @ 20fps idle** and **8 @ 24fps attack** apply. If leg consistency across eight idle frames is problematic, the skill now states when to consider **4–6** frames vs pushing past **8**.

---

## Creature-Specific Adaptations (applied to this dry-run)

| Creature trait | Risk | Mitigation (skill text) | Applied to Frost Spider |
|---|---|---|---|
| **Green/teal coloring** (goblins, slimes, plant creatures) | Green skin blends with #00FF00 background during cleanup | Lower cleanup threshold (24–28). After processing, use **visual inspection** for green halo instead of the automated green-pixel check. | **Low priority** — carapace is dark with pale frost, not green skin. Use default reference clean (`--threshold 32`) unless a green fringe appears; if it does, drop to 24–28 and rely on visual halo check, not the automated pixel tally. |
| **Thin limbs or fine detail** (spiders, insects, skeletal creatures) | Thin legs/antennae get eaten by aggressive flood-fill or threshold | Lower cleanup threshold (24–28). After processing, **zoom into thin features** and confirm they survived; if limbs are lost, lower threshold further. | **Primary** — eight legs and chelicerae are high-risk. Plan **threshold 24–28** on reference and sheets; after `asset:clean`, zoom-verify leg tips and fang lines before accepting output. |
| **Dark coloring near black** (stone golems, shadow creatures, dark metal) | Dark body blends with thick black outline | Prompt: **clearly visible thick black outline contrasting with the dark body.** Post-process: verify outline reads at **display size** (e.g. 120×150). | **Secondary** — dark carapace still needs a **readable outer silhouette**. Add outline-contrast language to the reference prompt; spot-check outline vs body at small scale after clean. |
| **Held items** (staffs, weapons, shields, orbs) | Items disappear, swap hands, or drift between frames | Every frame description: **item + which hand**; closing line: *"The [item] must appear in every frame in the [left/right] hand."* | **N/A** — no held item for this goon. |
| **Massive/unusual proportions** (golems, giants, dragons) | Clipping or unreadable silhouette at 120×150 | Reference prompt: **creature fits entirely in frame with no clipping**; consider small-display readability. | **N/A** — spider fits standard framing. |
| **Melee/slam attacks** (no projectile) | Vertical slams vs generic “lunge left” | Describe slam as **leaning forward toward the LEFT while striking downward**. | **Partial** — attack is an **icy pounce** (forward lunge). If any frame reads as **stomp/slam**, phrase it as **leaning forward toward the LEFT while striking downward** so vertical motion still biases left. |
| **Spell/projectile attacks** | Projectile facing failures | Explicitly: **the [spell/bolt] travels from the creature toward the LEFT edge of the frame.** | **Optional** — if a **frost burst** reads as a discrete projectile, add **path toward the LEFT edge** in those frames; otherwise the existing lunge-left language covers the pounce. |

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
Frost spider creature FACING LEFT (looking toward the left side of the image).
Bright solid green (#00FF00) background with NO grid lines, NO borders, NO separators
between frames. Pixel art style with visible pixels, thick black outlines.

Row 1 (left to right):
Frame 1 - Frost spider in normal resting pose facing left.
Frame 2 - Frost spider facing left, body slightly rising as legs flex.
Frame 3 - Frost spider facing left, peak of subtle sway / slight fang-gape.
Frame 4 - Frost spider facing left, beginning to settle back toward rest.

Row 2 (left to right):
Frame 5 - Frost spider facing left, continuing return toward neutral.
Frame 6 - Frost spider facing left, slight compression / frost mist pulse.
Frame 7 - Frost spider facing left, transitioning back toward rest.
Frame 8 - Frost spider facing left, back to normal resting pose.

All frames must maintain the same icy legs, dark carapace, and pale frost highlights.
Every single frame the Frost spider faces LEFT.
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
A pixel art sprite sheet showing exactly 8 frames of an icy pounce attack animation,
arranged in exactly 2 rows of 4 frames each (4 columns, 2 rows grid).
NO divider lines or borders between frames. Each frame shows the same dark-fantasy
Frost spider creature FACING LEFT. Bright solid green (#00FF00) background with
NO grid lines, NO borders, NO separators between frames. Pixel art style with
visible pixels, thick black outlines.

CRITICAL DIRECTION RULE: The creature faces LEFT in ALL frames. The attack motion,
lunge, projectile, or strike goes TOWARD THE LEFT EDGE of the image. The creature
must NOT face right. The attack must NOT go toward the right side. Do NOT mirror
or flip any frame.

Row 1 (left to right):
Frame 1 - Frost spider in ready stance facing left, legs planted, tensing before the pounce.
Frame 2 - Frost spider facing left, early wind-up — body lowering, legs beginning to coil.
Frame 3 - Frost spider facing left, full wind-up — maximum coil, frost gathering at the feet.
Frame 4 - Frost spider facing left, peak of attack — launch committed toward the left,
legs driving; body aimed at the left edge. Attack goes LEFT, not right.

Row 2 (left to right):
Frame 5 - Frost spider facing left, impact/release — leading legs extended, frost burst
toward the left as contact or apex of the leap reads.
Frame 6 - Frost spider facing left, follow-through — body stretched past the strike line,
frost trail continuing left.
Frame 7 - Frost spider facing left, recovery — gathering limbs, pulling mass back from the lunge.
Frame 8 - Frost spider facing left, returning to ready / low crouch stance.

All frames must maintain the same icy legs, dark carapace, and pale frost highlights.
Every single frame the Frost spider faces LEFT. No frame may face right.

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
    "Green Cleanup Verification": 68,
    "Frame Count Adequacy": 70,
    "Phase Completeness": 80,
    "Prompt Adaptability": 65
  },
  "reasoning": {
    "Attack Animation Quality": "Unchanged vs iter_005; eight-beat pounce template unchanged. Timing table in Frame Count Guidance reinforces idle/attack rationale.",
    "Facing Direction Enforcement": "Unchanged vs iter_005; same gates and anti-patterns.",
    "Green Cleanup Verification": "Unchanged vs iter_005; thin-limb and outline rows unchanged.",
    "Frame Count Adequacy": "+15 vs iter_005: explicit FPS/duration table, 4–6 vs 10–12 trade-offs, and recovery-frame note clarify when default 8-frame grid fits vs when to shorten or tune playback.",
    "Phase Completeness": "Unchanged vs iter_005 at 80; new subsection documents timing without adding a new pipeline phase.",
    "Prompt Adaptability": "Unchanged vs iter_005; frame-count advice is global, not spider-specific beyond optional fewer frames if consistency fails."
  }
}
-->

**Weighted case score (AAQ 25%, FDE 20%, GCV 20%, FCA 15%, PC 10%, PA 10%):**  
72×0.25 + 70×0.20 + 68×0.20 + 70×0.15 + 80×0.10 + 65×0.10 = 18 + 14 + 13.6 + 10.5 + 8 + 6.5 = **70.60**
