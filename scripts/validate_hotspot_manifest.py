#!/usr/bin/env python3
"""
Validate a hotspot manifest before generating approval proofs or wiring runtime code.

Usage:
  py -3 scripts/validate_hotspot_manifest.py --manifest assets/overworld/overworld-hotspots-800x600.json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate hotspot manifest structure and bounds.")
    parser.add_argument("--manifest", type=Path, required=True, help="Path to hotspot manifest JSON.")
    return parser.parse_args()


def is_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def validate_rect(rect: dict, label: str, canvas_width: int, canvas_height: int, errors: list[str]) -> None:
    for key in ("x", "y", "width", "height"):
        require(key in rect, f"{label} missing `{key}`.", errors)
        if key in rect:
            require(is_number(rect[key]), f"{label}.{key} must be numeric.", errors)
    if any(key not in rect or not is_number(rect[key]) for key in ("x", "y", "width", "height")):
        return

    x = int(rect["x"])
    y = int(rect["y"])
    width = int(rect["width"])
    height = int(rect["height"])
    require(width > 0, f"{label}.width must be > 0.", errors)
    require(height > 0, f"{label}.height must be > 0.", errors)
    require(x >= 0, f"{label}.x must be >= 0.", errors)
    require(y >= 0, f"{label}.y must be >= 0.", errors)
    require(x + width <= canvas_width, f"{label} exceeds canvas width.", errors)
    require(y + height <= canvas_height, f"{label} exceeds canvas height.", errors)


def validate_hotspot(hotspot: dict, index: int, canvas_width: int, canvas_height: int, ids: set[str], errors: list[str]) -> None:
    label = f"hotspots[{index}]"
    require("id" in hotspot, f"{label} missing `id`.", errors)
    if "id" in hotspot:
        hotspot_id = hotspot["id"]
        require(isinstance(hotspot_id, str) and hotspot_id.strip(), f"{label}.id must be a non-empty string.", errors)
        if isinstance(hotspot_id, str) and hotspot_id.strip():
            require(hotspot_id not in ids, f"Duplicate hotspot id `{hotspot_id}`.", errors)
            ids.add(hotspot_id)

    validate_rect(hotspot, label, canvas_width, canvas_height, errors)

    for key in ("centerX", "centerY"):
        require(key in hotspot, f"{label} missing `{key}`.", errors)
        if key in hotspot:
            require(is_number(hotspot[key]), f"{label}.{key} must be numeric.", errors)

    if all(key in hotspot and is_number(hotspot[key]) for key in ("x", "y", "width", "height", "centerX", "centerY")):
        expected_center_x = int(int(hotspot["x"]) + int(hotspot["width"]) / 2)
        expected_center_y = int(int(hotspot["y"]) + int(hotspot["height"]) / 2)
        require(
            int(hotspot["centerX"]) == expected_center_x,
            f"{label}.centerX should equal {expected_center_x}.",
            errors,
        )
        require(
            int(hotspot["centerY"]) == expected_center_y,
            f"{label}.centerY should equal {expected_center_y}.",
            errors,
        )


def validate_overlay(name: str, overlay: dict, canvas_width: int, canvas_height: int, errors: list[str]) -> None:
    sprite = overlay.get("spriteRect")
    require(isinstance(sprite, dict), f"{name}.spriteRect must exist.", errors)
    if isinstance(sprite, dict):
        validate_rect(sprite, f"{name}.spriteRect", canvas_width, canvas_height, errors)

    hotspot = overlay.get("hotspot")
    require(isinstance(hotspot, dict), f"{name}.hotspot must exist.", errors)
    if isinstance(hotspot, dict):
        validate_rect(hotspot, f"{name}.hotspot", canvas_width, canvas_height, errors)

    if overlay.get("hotspotMode") == "sprite-bounds" and isinstance(sprite, dict) and isinstance(hotspot, dict):
        require(
            sprite == hotspot,
            f"{name}.hotspot must exactly match {name}.spriteRect when hotspotMode is `sprite-bounds`.",
            errors,
        )


def main() -> None:
    args = parse_args()
    data = json.loads(args.manifest.read_text(encoding="utf-8"))
    errors: list[str] = []

    canvas = data.get("canvas")
    require(isinstance(canvas, dict), "Manifest must contain a `canvas` object.", errors)
    if not isinstance(canvas, dict):
        canvas = {}

    require(is_number(canvas.get("width")), "canvas.width must be numeric.", errors)
    require(is_number(canvas.get("height")), "canvas.height must be numeric.", errors)
    canvas_width = int(canvas.get("width", 0) or 0)
    canvas_height = int(canvas.get("height", 0) or 0)
    require(canvas_width > 0, "canvas.width must be > 0.", errors)
    require(canvas_height > 0, "canvas.height must be > 0.", errors)

    background = data.get("background")
    require(isinstance(background, dict), "Manifest must contain a `background` object.", errors)
    if isinstance(background, dict):
        require(isinstance(background.get("path"), str) and background["path"], "background.path must be a non-empty string.", errors)
        if is_number(background.get("sourceWidth")):
            require(int(background["sourceWidth"]) > 0, "background.sourceWidth must be > 0.", errors)
        if is_number(background.get("sourceHeight")):
            require(int(background["sourceHeight"]) > 0, "background.sourceHeight must be > 0.", errors)

    overlays: list[tuple[str, dict]] = []
    if isinstance(data.get("townOverlay"), dict):
        overlays.append(("townOverlay", data["townOverlay"]))
    if isinstance(data.get("overlays"), list):
        for index, overlay in enumerate(data["overlays"]):
            if isinstance(overlay, dict):
                overlays.append((f"overlays[{index}]", overlay))
            else:
                errors.append(f"overlays[{index}] must be an object.")
    for name, overlay in overlays:
        validate_overlay(name, overlay, canvas_width, canvas_height, errors)

    hotspots = data.get("hotspots")
    require(isinstance(hotspots, list), "Manifest must contain a `hotspots` array.", errors)
    ids: set[str] = set()
    if isinstance(hotspots, list):
        for index, hotspot in enumerate(hotspots):
            if not isinstance(hotspot, dict):
                errors.append(f"hotspots[{index}] must be an object.")
                continue
            validate_hotspot(hotspot, index, canvas_width, canvas_height, ids, errors)

    if errors:
        print(json.dumps({"manifest": str(args.manifest), "ok": False, "errors": errors}, indent=2))
        raise SystemExit(1)

    print(
        json.dumps(
            {
                "manifest": str(args.manifest),
                "ok": True,
                "hotspotCount": len(hotspots) if isinstance(hotspots, list) else 0,
                "overlayCount": len(overlays),
                "canvas": {"width": canvas_width, "height": canvas_height},
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
