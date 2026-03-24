# Test Case 02: Vine Beast (Plant-like)

## Creature Profile
- **Name:** Thornvine Horror
- **goonType:** `thornvine`
- **Body:** Twisted mass of green/olive vines with red thorns, glowing orange eyes, coiled serpentine shape
- **Challenge:** The creature IS green. Standard green-background cleanup will destroy the creature's body.
- **Attack type:** Melee lunge (vine whip toward the left)

## What this tests
1. **Green-on-green separation** -- the creature's olive/forest green body must survive cleanup of the bright #00FF00 background. The skill must provide an explicit strategy: either use an alternative background color (magenta/blue) or use a very narrow hue range that only targets pure green.
2. **Frame integrity** -- vine creatures have complex, irregular shapes that AI generators struggle to keep consistent across frames. The skill must guide frame extraction and verify no frames are clipped/split.
3. **Complex silhouette at small display size** -- tangled vines may not read well at 120x150 pixels. The skill must consider display-size readability.

## Expected behavior
- Reference image: vine creature with olive/forest green coloring, clearly distinct from bright green background
- After cleanup: creature's green coloring preserved, background removed, no bright-green halo
- All frames intact with no clipped/split fragments
- Vine shapes consistent across animation frames

## Failure modes to watch for
- Creature body partially or fully erased by green removal (catastrophic)
- Bright green fringe where creature green meets background green
- Frames split into thin vertical/horizontal slices (grid detection failure)
- Vine shapes wildly different between frames (consistency failure)
