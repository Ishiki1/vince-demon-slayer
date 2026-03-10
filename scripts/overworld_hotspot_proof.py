#!/usr/bin/env python3
"""
Generate an approval-proof SVG for overworld hotspot placement.

This script is intentionally stdlib-only so it can run on a clean Windows box
through the `py` launcher without adding image-processing dependencies.

It reads a hotspot manifest JSON file, embeds the background art and optional
overlay sprites as base64 data URLs, and renders:
- an 800x600 proof canvas
- a pixel grid (10px minor, 50px medium, 100px major)
- labeled hotspot rectangles
- center crosshairs
- exact pixel coordinate callouts
- optional sprite-only overlay callouts (for cases like town where the sprite
  bounds themselves are the hotspot and no extra box should be drawn)

Usage:
  py -3 scripts/overworld_hotspot_proof.py
  py -3 scripts/overworld_hotspot_proof.py --manifest assets/overworld/overworld-hotspots-800x600.json --output assets/overworld/overworld-hotspots-800x600-approval.svg
"""

from __future__ import annotations

import argparse
import base64
import json
from html import escape
from pathlib import Path


DEFAULT_MANIFEST = Path("assets/overworld/overworld-hotspots-800x600.json")
DEFAULT_OUTPUT = Path("assets/overworld/overworld-hotspots-800x600-approval.svg")

GRID_MINOR = 10
GRID_MEDIUM = 50
GRID_MAJOR = 100

HOTSPOT_COLORS = [
    "#22c55e",
    "#0ea5e9",
    "#f97316",
    "#eab308",
    "#a855f7",
    "#ec4899",
    "#ef4444",
    "#10b981",
    "#14b8a6",
    "#3b82f6",
    "#f59e0b",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render overworld hotspot approval proof SVG.")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST, help="Path to hotspot manifest JSON.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Path to output SVG proof.")
    parser.add_argument(
        "--label-mode",
        choices=("full", "minimal"),
        default="full",
        help="Render detailed callout panels (`full`) or only compact corner labels (`minimal`).",
    )
    return parser.parse_args()


def encode_data_uri(path: Path) -> str:
    suffix = path.suffix.lower()
    mime = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml",
    }.get(suffix, "application/octet-stream")
    raw = path.read_bytes()
    encoded = base64.b64encode(raw).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def clamp(value: int, minimum: int, maximum: int) -> int:
    return max(minimum, min(value, maximum))


def rect_center(rect: dict) -> tuple[int, int]:
    return (
        int(rect["x"] + rect["width"] / 2),
        int(rect["y"] + rect["height"] / 2),
    )


def callout_position(rect: dict, canvas_width: int, canvas_height: int) -> tuple[int, int]:
    x = rect["x"]
    y = rect["y"] - 26
    if y < 8:
        y = rect["y"] + rect["height"] + 8
    x = clamp(x, 8, max(8, canvas_width - 260))
    y = clamp(y, 8, max(8, canvas_height - 34))
    return x, y


def render_grid(width: int, height: int) -> list[str]:
    parts: list[str] = []
    for x in range(0, width + 1, GRID_MINOR):
        if x % GRID_MAJOR == 0:
            color = "#fbbf24"
            opacity = "0.42"
            stroke_width = "1.6"
        elif x % GRID_MEDIUM == 0:
            color = "#e5e7eb"
            opacity = "0.24"
            stroke_width = "1.0"
        else:
            color = "#cbd5e1"
            opacity = "0.12"
            stroke_width = "0.7"
        parts.append(
            f'<line x1="{x}" y1="0" x2="{x}" y2="{height}" stroke="{color}" '
            f'stroke-opacity="{opacity}" stroke-width="{stroke_width}" />'
        )
    for y in range(0, height + 1, GRID_MINOR):
        if y % GRID_MAJOR == 0:
            color = "#fbbf24"
            opacity = "0.42"
            stroke_width = "1.6"
        elif y % GRID_MEDIUM == 0:
            color = "#e5e7eb"
            opacity = "0.24"
            stroke_width = "1.0"
        else:
            color = "#cbd5e1"
            opacity = "0.12"
            stroke_width = "0.7"
        parts.append(
            f'<line x1="0" y1="{y}" x2="{width}" y2="{y}" stroke="{color}" '
            f'stroke-opacity="{opacity}" stroke-width="{stroke_width}" />'
        )
    for x in range(0, width + 1, GRID_MAJOR):
        parts.append(
            f'<text x="{x + 3}" y="14" fill="#f8fafc" font-size="12" font-family="Arial">{x}</text>'
        )
    for y in range(GRID_MAJOR, height + 1, GRID_MAJOR):
        parts.append(
            f'<text x="4" y="{y - 4}" fill="#f8fafc" font-size="12" font-family="Arial">{y}</text>'
        )
    return parts


def render_hotspot(index: int, hotspot: dict, canvas_width: int, canvas_height: int, label_mode: str) -> list[str]:
    color = HOTSPOT_COLORS[index % len(HOTSPOT_COLORS)]
    x = int(hotspot["x"])
    y = int(hotspot["y"])
    width = int(hotspot["width"])
    height = int(hotspot["height"])
    center_x = int(hotspot.get("centerX", x + width / 2))
    center_y = int(hotspot.get("centerY", y + height / 2))
    label = escape(hotspot["id"])
    asset_key = escape(hotspot.get("textureKey", ""))

    parts = [
        f'<rect x="{x}" y="{y}" width="{width}" height="{height}" fill="{color}" fill-opacity="0.10" '
        f'stroke="{color}" stroke-width="2.4" />',
        f'<line x1="{center_x - 8}" y1="{center_y}" x2="{center_x + 8}" y2="{center_y}" '
        f'stroke="{color}" stroke-width="1.8" />',
        f'<line x1="{center_x}" y1="{center_y - 8}" x2="{center_x}" y2="{center_y + 8}" '
        f'stroke="{color}" stroke-width="1.8" />',
        f'<circle cx="{center_x}" cy="{center_y}" r="3.5" fill="{color}" />',
    ]
    if label_mode == "minimal":
        label_x = clamp(x + 4, 4, max(4, canvas_width - 84))
        label_y = y + 14 if y > 16 else y + height + 14
        parts.extend(
            [
                f'<rect x="{label_x - 3}" y="{label_y - 11}" width="78" height="16" fill="#020617" '
                f'fill-opacity="0.78" stroke="{color}" stroke-opacity="0.8" stroke-width="1" rx="3" ry="3" />',
                f'<text x="{label_x + 2}" y="{label_y}" fill="#f8fafc" font-size="11" font-family="Arial">'
                f"{label}</text>",
            ]
        )
        return parts

    callout_x, callout_y = callout_position(hotspot, canvas_width, canvas_height)
    bounds_text = f"{x},{y} {width}x{height}"
    note = escape(hotspot.get("note", ""))
    panel_width = 252
    panel_height = 34 if not note else 48
    parts.extend(
        [
            f'<rect x="{callout_x}" y="{callout_y}" width="{panel_width}" height="{panel_height}" '
            f'fill="#020617" fill-opacity="0.82" stroke="{color}" stroke-opacity="0.8" stroke-width="1.2" rx="4" ry="4" />',
            f'<text x="{callout_x + 8}" y="{callout_y + 14}" fill="#f8fafc" font-size="12" font-family="Arial">'
            f'{label} [{asset_key}] {bounds_text} center ({center_x},{center_y})</text>',
        ]
    )
    if note:
        parts.append(
            f'<text x="{callout_x + 8}" y="{callout_y + 29}" fill="#cbd5e1" font-size="11" font-family="Arial">{note}</text>'
        )
    return parts


def render_sprite_overlay_label(overlay: dict, canvas_width: int, canvas_height: int, label_mode: str) -> list[str]:
    sprite = overlay["spriteRect"]
    x = int(sprite["x"])
    y = int(sprite["y"])
    width = int(sprite["width"])
    height = int(sprite["height"])
    center_x = int(x + width / 2)
    center_y = int(y + height / 2)
    color = overlay.get("labelColor", "#22c55e")
    rect = {"x": x, "y": y, "width": width, "height": height}
    label = escape(overlay.get("label", overlay.get("textureKey", "overlay-sprite")))
    parts = [
        f'<line x1="{center_x - 8}" y1="{center_y}" x2="{center_x + 8}" y2="{center_y}" '
        f'stroke="{color}" stroke-width="1.8" />',
        f'<line x1="{center_x}" y1="{center_y - 8}" x2="{center_x}" y2="{center_y + 8}" '
        f'stroke="{color}" stroke-width="1.8" />',
        f'<circle cx="{center_x}" cy="{center_y}" r="3.5" fill="{color}" />',
    ]
    if label_mode == "minimal":
        label_x = clamp(x + 4, 4, max(4, canvas_width - 94))
        label_y = y + 14 if y > 16 else y + height + 14
        parts.extend(
            [
                f'<rect x="{label_x - 3}" y="{label_y - 11}" width="88" height="16" fill="#020617" '
                f'fill-opacity="0.78" stroke="{color}" stroke-opacity="0.8" stroke-width="1" rx="3" ry="3" />',
                f'<text x="{label_x + 2}" y="{label_y}" fill="#f8fafc" font-size="11" font-family="Arial">town</text>',
            ]
        )
        return parts

    callout_x, callout_y = callout_position(rect, canvas_width, canvas_height)
    panel_width = 282
    panel_height = 48
    note = escape(overlay.get("note", ""))
    bounds_text = f"{x},{y} {width}x{height}"
    parts.extend(
        [
            f'<rect x="{callout_x}" y="{callout_y}" width="{panel_width}" height="{panel_height}" '
            f'fill="#020617" fill-opacity="0.82" stroke="{color}" stroke-opacity="0.8" stroke-width="1.2" rx="4" ry="4" />',
            f'<text x="{callout_x + 8}" y="{callout_y + 14}" fill="#f8fafc" font-size="12" font-family="Arial">'
            f'{label} sprite/hotbox {bounds_text} center ({center_x},{center_y})</text>',
            f'<text x="{callout_x + 8}" y="{callout_y + 29}" fill="#cbd5e1" font-size="11" font-family="Arial">{note}</text>',
        ]
    )
    return parts


def render_proof(manifest_path: Path, output_path: Path, label_mode: str) -> None:
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    root = manifest_path.parent

    canvas = data["canvas"]
    width = int(canvas["width"])
    height = int(canvas["height"])

    background_path = (root / data["background"]["path"]).resolve()
    background_uri = encode_data_uri(background_path)

    parts: list[str] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        f'<rect x="0" y="0" width="{width}" height="{height}" fill="#020617" />',
        f'<image href="{background_uri}" x="0" y="0" width="{width}" height="{height}" preserveAspectRatio="none" />',
    ]

    town_overlay = data.get("townOverlay")
    if town_overlay:
        town_path = (root / town_overlay["path"]).resolve()
        town_uri = encode_data_uri(town_path)
        sprite = town_overlay["spriteRect"]
        parts.append(
            f'<image href="{town_uri}" x="{sprite["x"]}" y="{sprite["y"]}" '
            f'width="{sprite["width"]}" height="{sprite["height"]}" preserveAspectRatio="none" />'
        )

    parts.extend(render_grid(width, height))

    if town_overlay and town_overlay.get("hotspotMode") == "sprite-bounds":
        parts.extend(render_sprite_overlay_label(town_overlay, width, height, label_mode))

    for index, hotspot in enumerate(data["hotspots"]):
        parts.extend(render_hotspot(index, hotspot, width, height, label_mode))

    parts.append(
        '<rect x="0.5" y="0.5" width="799" height="599" fill="none" stroke="#f8fafc" stroke-opacity="0.7" stroke-width="1" />'
    )
    parts.append("</svg>")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(parts), encoding="utf-8")


def main() -> None:
    args = parse_args()
    render_proof(args.manifest.resolve(), args.output.resolve(), args.label_mode)
    print(
        json.dumps(
            {
                "manifest": str(args.manifest),
                "output": str(args.output),
                "labelMode": args.label_mode,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
