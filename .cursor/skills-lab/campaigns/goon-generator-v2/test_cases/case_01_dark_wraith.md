# Test Case 01: Dark Wraith (Shade-like)

## Creature Profile
- **Name:** Shadow Wraith
- **goonType:** `wraith`
- **Body:** Flowing dark robes and tendrils, deep black/purple coloring, wispy ethereal edges
- **Challenge:** Dark body makes green fringe extremely visible. Thin wispy tendrils are prone to cleanup damage.
- **Attack type:** Ranged spell (shadow bolt toward the left)

## What this tests
1. **Green fringe on dark edges** -- the #1 cleanup failure. Dark pixels next to green background create visible green halos after removal. The skill must guide the agent to use appropriate cleanup parameters (lower satMin, extra spill passes) and verify no green remains.
2. **Thin feature preservation** -- wispy tendrils and flowing robes have thin edges that aggressive cleanup can eat. The skill must balance green removal with feature preservation.
3. **Dark body vs black outline** -- the creature's body is nearly as dark as its outline. The skill must ensure the outline remains distinguishable.

## Expected behavior
- Reference image: dark wraith on bright green background, facing left, clean silhouette
- After cleanup: zero green fringe visible on any edge, tendrils intact, outline visible
- Idle animation: smooth ethereal floating/swaying, all frames consistent
- Attack animation: shadow bolt launching toward the left, all frames face left

## Failure modes to watch for
- Green halo around tendrils and robe edges (most common)
- Tendrils eaten by aggressive cleanup (too-high threshold)
- Body merging with outline (dark-on-dark)
- Inconsistent tendril shapes across frames
