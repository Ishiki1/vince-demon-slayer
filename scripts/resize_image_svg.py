#!/usr/bin/env python3
"""
Create a self-contained SVG wrapper that displays an image at a target size.

This is a dependency-free fallback for proofing runtime coordinates on machines
without Pillow. It does not rewrite raster pixels; it creates an SVG that
normalizes the visible canvas to the requested size.

Usage:
  py -3 scripts/resize_image_svg.py --input assets/overworld/overworld-bg-800x600-hotspots.png --output assets/overworld/overworld-bg-800x600-normalized.svg --width 800 --height 600
"""

from __future__ import annotations

import argparse
import base64
import json
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Wrap an image in a target-sized SVG canvas.")
    parser.add_argument("--input", type=Path, required=True, help="Input image path.")
    parser.add_argument("--output", type=Path, required=True, help="Output SVG path.")
    parser.add_argument("--width", type=int, required=True, help="Target width.")
    parser.add_argument("--height", type=int, required=True, help="Target height.")
    parser.add_argument("--fit", choices=["stretch", "contain"], default="stretch", help="Sizing mode.")
    return parser.parse_args()


def encode_data_uri(path: Path) -> str:
    suffix = path.suffix.lower()
    mime = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml",
    }.get(suffix, "application/octet-stream")
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{data}"


def main() -> None:
    args = parse_args()
    width = max(1, int(args.width))
    height = max(1, int(args.height))
    preserve = "xMidYMid meet" if args.fit == "contain" else "none"
    href = encode_data_uri(args.input.resolve())

    svg = "\n".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
            f'<rect x="0" y="0" width="{width}" height="{height}" fill="#020617" />',
            f'<image href="{href}" x="0" y="0" width="{width}" height="{height}" preserveAspectRatio="{preserve}" />',
            "</svg>",
        ]
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(svg, encoding="utf-8")

    print(
        json.dumps(
            {
                "input": str(args.input),
                "output": str(args.output),
                "width": width,
                "height": height,
                "fit": args.fit,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
