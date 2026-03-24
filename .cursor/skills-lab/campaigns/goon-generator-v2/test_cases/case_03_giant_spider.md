# Test Case 03: Giant Spider

## Creature Profile
- **Name:** Cavern Stalker
- **goonType:** `stalker`
- **Body:** Large dark spider with eight thin legs, bulbous abdomen, red eyes, dark brown/black coloring
- **Challenge:** Eight thin legs are the most fragile features in the cleanup pipeline. Aggressive flood fill or high thresholds will eat the legs.
- **Attack type:** Melee lunge (pouncing bite toward the left)

## What this tests
1. **Thin limb preservation** -- spider legs are 1-3 pixels wide in many frames. The skill must guide the agent to use conservative cleanup parameters and verify legs survived processing.
2. **Animation consistency for multi-limbed creatures** -- AI generators struggle to maintain 8 legs consistently across 12 frames. Later frames often degrade to stubs or blobs. The skill must address this with reference-locking prompts and consistency checks.
3. **Small creature on large canvas** -- spiders are often generated small relative to the canvas, leaving large green areas. The centering step must handle this correctly.

## Expected behavior
- Reference image: spider with all 8 legs clearly visible, facing left, on green background
- After cleanup: all legs intact with black outline visible, no green fringe
- Idle animation: subtle leg movement, body proportions consistent across all frames
- Attack animation: pouncing lunge toward left, legs maintain structure throughout

## Failure modes to watch for
- Legs eaten by cleanup (disconnected stubs or missing legs)
- Legs degrading across frames (good in frame 1, stubs by frame 8)
- Spider too small in frame after centering (lost detail at display size)
- Green fringe between thin legs where background wasn't fully removed
