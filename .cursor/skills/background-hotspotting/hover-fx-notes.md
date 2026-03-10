# Hover FX Notes

Use this note when a user explicitly wants hotspot hover visuals in addition to invisible click areas.

## Saved Methodology: Orbiting Follower
Phaser can visualize a hovered hotspot with a small sprite that orbits the hotspot bounds:

1. Build a `Phaser.Curves.Path` around the hotspot rectangle, usually with a little padding outside the box.
2. Spawn a `PathFollower` on pointerover.
3. Start a slow linear follow tween, usually around `2500ms` to `4000ms`.
4. Destroy the follower on pointerout and scene shutdown.

This works well for:
- firefly or light orbs
- bats or familiars
- small magical wisps

## Recommended Guardrails
- Keep the hotspot rectangle itself invisible even when the orbit effect is active.
- Keep the tooltip as the primary readable label.
- Use the orbit effect as secondary polish, not as the only indication of what the hotspot does.
- Prefer one follower per hovered hotspot, not many simultaneous followers.
- For locked nodes, either disable the orbit entirely or use a more muted version.

## Fallback
If the follower feels too busy, switch to one of these:
- tooltip only
- subtle corner glows
- a tiny pulsing spark at one corner
- a very light particle trail following an invisible anchor

## Current Repo Status
- The overworld currently uses invisible hotspots plus tooltips.
- The orbiting firefly behavior is intentionally not wired in runtime right now.
- `assets/ui/overworld-hover-firefly.svg` remains available as a prototype/reference asset if this idea is revived later.
