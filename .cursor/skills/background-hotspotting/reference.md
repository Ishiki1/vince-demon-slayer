# Background Hotspotting Reference

## Manifest Shape
Preferred manifest structure:

```json
{
  "canvas": { "width": 800, "height": 600 },
  "background": {
    "path": "overworld-bg-800x600-hotspots.png",
    "sourceWidth": 900,
    "sourceHeight": 600,
    "fit": "stretch-to-runtime"
  },
  "townOverlay": {
    "path": "town-overworld.png",
    "textureKey": "town-overworld",
    "hotspotMode": "sprite-bounds",
    "spriteRect": { "x": 18, "y": 456, "width": 120, "height": 120 },
    "hotspot": { "x": 18, "y": 456, "width": 120, "height": 120 }
  },
  "hotspots": [
    {
      "id": "level1",
      "textureKey": "level6-overworld",
      "bgReference": "level1-bg.png",
      "x": 468,
      "y": 440,
      "width": 190,
      "height": 158,
      "centerX": 563,
      "centerY": 519
    }
  ]
}
```

## Artifact Naming
Use consistent artifact names so the proof trail is readable:

- Normalized background: `<base>-runtime-<width>x<height>.svg`
- Matcher config: `<base>-matcher-config.json`
- Matcher output: `<base>-skill-pass-suggestions.json`
- Skill-pass manifest: `<base>-skill-pass.json`
- Full proof: `<base>-skill-pass-approval.svg`
- Minimal proof: `<base>-skill-pass-approval-minimal.svg`

For the current overworld example, `base` is `overworld-hotspots-800x600`.

## Matcher Guidance
`scripts/suggest_overworld_matches.mjs` is best used for:
- confirming destination identity
- getting first-pass anchor rectangles
- reducing search time on ambiguous structures

Do not use matcher output as final hotspot bounds without a silhouette review.

## Runtime Default
- Hotspots should be invisible in runtime by default.
- Tooltip and click behavior should remain active even when the hotspot rectangle is not visibly drawn.
- Only add visible hover affordances, such as outlines, glow marks, orbiting sprites, or particles, when the user explicitly asks for them.

## Typical Failure Modes
- Filename says `800x600`, actual raster is `900x600`.
- Bright or high-contrast inner details pull the box inward.
- Decorative scenery gets mistaken for a wired destination.
- Large labels hide the exact top or side edges of a structure.
- `centerX` and `centerY` were hand-rounded instead of derived consistently from the stored rectangle.

## Exit Criteria
- Measured dimensions match the documented source dimensions.
- Proof coordinates match Phaser runtime behavior.
- All hotspots validate cleanly.
- Ambiguous boxes were checked against the outer painted silhouette.
- Approval proofs are ready before any scene rewiring.
- Runtime hotspots remain invisible unless a visible hover layer was explicitly requested and approved.
