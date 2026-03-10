---
name: background-hotspotting
description: Runs the full background-hotspot workflow for Phaser scene art: measure real image size, normalize to runtime canvas, generate or review hotspot manifests, validate bounds, render grid proofs, and use sprite matching as a hint for ambiguous structures. Use when aligning clickable areas or level nodes to painted backgrounds, menu art, inventory layouts, or overworld maps.
---
# Background Hotspotting

## Quick Start
Use this skill when a background image drives interaction and the click areas must line up with the game's runtime canvas.

Project utilities:
- `scripts/measure_image_dimensions.mjs`
- `scripts/resize_image_svg.py`
- `scripts/validate_hotspot_manifest.py`
- `scripts/overworld_hotspot_proof.py`
- `scripts/suggest_overworld_matches.mjs`

Primary reference:
- [reference.md](reference.md)
- [hover-fx-notes.md](hover-fx-notes.md)

## Workflow
1. Measure the real image dimensions first. Do not trust the filename.
2. Record the runtime canvas and scaling mode the game actually uses.
3. If source size and runtime size differ, generate a normalized SVG proof wrapper.
4. Keep hotspots in a manifest JSON, never only in scene code.
5. Validate the manifest before rendering proofs.
6. Render both:
   - a full proof with detailed callouts
   - a minimal proof when labels would hide the art
7. If a destination is ambiguous, use sprite matching only as an anchor.
8. For ornate structures, fit the box to the painted outer silhouette, not the brightest interior detail.
9. Regenerate the proof after every adjustment and get approval before wiring scene code.
10. Treat hotspot centers as derived data. Recompute them from `x`, `y`, `width`, and `height` instead of hand-rounding.
11. Default runtime behavior should keep hotspots invisible. Use the manifest and proof tooling to define the clickable area, but do not draw the box in-game unless the user explicitly asks for a visible hover affordance.

## Default Commands
Measure:
```bash
node scripts/measure_image_dimensions.mjs --input assets/overworld/overworld-bg-800x600-hotspots.png
```

Normalize to runtime:
```bash
py -3 scripts/resize_image_svg.py --input assets/overworld/overworld-bg-800x600-hotspots.png --output assets/overworld/overworld-bg-800x600-hotspots-runtime-800x600.svg --width 800 --height 600 --fit stretch
```

Optional matcher hints:
```bash
node scripts/suggest_overworld_matches.mjs --config assets/overworld/overworld-hotspots-800x600-matcher-config.json --output assets/overworld/overworld-hotspots-800x600-skill-pass-suggestions.json
```

Validate manifest:
```bash
py -3 scripts/validate_hotspot_manifest.py --manifest assets/overworld/overworld-hotspots-800x600-skill-pass.json
```

Render full proof:
```bash
py -3 scripts/overworld_hotspot_proof.py --manifest assets/overworld/overworld-hotspots-800x600-skill-pass.json --output assets/overworld/overworld-hotspots-800x600-skill-pass-approval.svg
```

Render minimal proof:
```bash
py -3 scripts/overworld_hotspot_proof.py --manifest assets/overworld/overworld-hotspots-800x600-skill-pass.json --output assets/overworld/overworld-hotspots-800x600-skill-pass-approval-minimal.svg --label-mode minimal
```

## Decision Rules
- Normalize when the source raster size differs from runtime or when you need an explicit proof artifact that records runtime scaling.
- Skip matcher output as a final source of truth. It can false-positive on doors, glows, faces, or other high-contrast interior details.
- Use sprite-bound overlays when the visible sprite itself should be the clickable area, as with town.
- If a label hides the art enough that review becomes uncertain, regenerate the minimal proof before changing coordinates.
- Validate center coordinates with the manifest validator so rectangle bounds and crosshair positions never drift apart.
- In runtime, hotspot rectangles should usually be fully invisible and only expose tooltips/click behavior. Any hover visualization layer, such as outlines or orbiting sprites, should be opt-in polish rather than the default contract.

## Verification
- Image dimensions were measured explicitly.
- Runtime canvas width and height are recorded in the manifest.
- Background fit mode is recorded.
- Every hotspot has `x`, `y`, `width`, `height`, `centerX`, and `centerY`.
- Manifest validation passes.
- Proofs exist in both full and minimal review modes when needed.
- Runtime hotspot objects are invisible unless the user explicitly requested a visible hover effect.

## Supersedes
This skill supersedes the older split workflow in `re-size-image` and `pixel-grid`.
