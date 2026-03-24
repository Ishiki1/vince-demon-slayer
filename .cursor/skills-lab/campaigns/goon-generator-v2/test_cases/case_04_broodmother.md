# Test Case 04: Broodmother (Large Spider Boss)

## Creature Profile
- **Name:** Broodmother Arachne
- **goonType:** `broodmother`
- **Body:** Massive spider with egg sac on abdomen, thick legs, multiple red eyes, dark purple/brown coloring
- **Challenge:** Large creature that fills the frame. Direction consistency is the primary issue -- some frames face left, others face right.
- **Attack type:** Melee lunge (venomous bite toward the left) + spawns spiderlings

## What this tests
1. **Direction consistency** -- the broodmother's idle and attack animations must face left in EVERY frame. The skill's facing-direction gates must catch any right-facing frames before processing.
2. **Large creature framing** -- the broodmother fills most of the frame. The centering step must not clip extremities (leg tips, egg sac).
3. **Green fringe on leg tips** -- thin leg tips touching the background edge are prone to green fringe, similar to the spider case but at larger scale.
4. **Boss-quality animation** -- as a boss, the broodmother needs smooth, intimidating animation. Frame quality must be high.

## Expected behavior
- Reference image: large spider boss facing left, egg sac visible, all legs clear
- After cleanup: no green fringe on any leg tip, egg sac intact, outline visible
- Idle animation: menacing breathing/swaying, ALL frames face left, no direction flip
- Attack animation: venomous lunge toward left, ALL frames face left, smooth motion arc

## Failure modes to watch for
- Direction flip mid-animation (some frames face right) -- most common broodmother issue
- Green fringe on thin leg tips
- Egg sac clipped by frame boundary
- Inconsistent leg count or positioning across frames
