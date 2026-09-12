#!/usr/bin/env python3
"""Run with Python 3 + Pillow 12.3.0 on macOS to correct only the bottom caption.

The Apple SD Gothic Neo ExtraBold face supplies local Korean glyphs. Background
hidden by old ink is interpolated from adjacent source pixels, not repainted.
Uncovered pixels, including the faint tooth, remain untouched.
"""

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/images/board/carousel/carousel-time.jpg"
OUTPUT = SOURCE.with_name("carousel-time-current.png")
SOURCE_SHA256 = "94018280efd9044951f649bebbe1e3cce4446955d82b6c4a871ef8458dda7b20"
FONT = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
# Exclusive right/bottom edges; the upper panel ends at y=794.
CAPTION = (16, 880, 1056, 1052)
BLACK = (7, 10, 15)
BLUE = (0, 155, 232)
PARTS = [("화·금, 목(교정) ", BLACK), ("야간진료", BLUE), (" 20:30", BLACK)]


def main():
    source_bytes = SOURCE.read_bytes()
    assert hashlib.sha256(source_bytes).hexdigest() == SOURCE_SHA256
    original = Image.open(SOURCE).convert("RGB")
    assert original.size == (1080, 1080)
    patch = original.crop(CAPTION)
    width, height = patch.size
    ink = Image.new("L", patch.size)
    # Separate dark/cyan lettering from the near-white background; include
    # antialiasing and JPEG fringes with a four-pixel dilation.
    ink.putdata([
        255 if max(p) < 190 or max(p) - min(p) > 65 else 0
        for p in patch.get_flattened_data()
    ])
    mask = ink.filter(ImageFilter.MaxFilter(9)).load()
    pixels = patch.load()
    for y in range(height):
        x = 0
        while x < width:
            if mask[x, y] == 0:
                x += 1
                continue
            start = x
            while x < width and mask[x, y] != 0:
                x += 1
            assert start > 0 and x < width, "Caption ink touches crop boundary"
            left, right = pixels[start - 1, y], pixels[x, y]
            for position in range(start, x):
                fraction = (position - start + 1) / (x - start + 1)
                pixels[position, y] = tuple(
                    round(a + (b - a) * fraction) for a, b in zip(left, right)
                )

    # Supersample, then fit the longer line to the original condensed placement.
    scale = 3
    font = ImageFont.truetype(FONT, 170 * scale, index=14)
    assert font.getname() == ("Apple SD Gothic Neo", "ExtraBold")
    text = Image.new("RGBA", (2400 * scale, 220 * scale))
    draw = ImageDraw.Draw(text)
    cursor = 0.0
    for content, color in PARTS:
        draw.text((cursor, 0), content, font=font, fill=(*color, 255))
        cursor += draw.textlength(content, font=font)
    bounds = text.getbbox()
    assert bounds is not None
    text = text.crop(bounds).resize((1024, 140), Image.Resampling.LANCZOS)
    patch.paste(text, (12, 12), text)
    corrected = original.copy()
    corrected.paste(patch, CAPTION[:2])
    corrected.save(OUTPUT, format="PNG", optimize=True)

    # Verify the saved PNG against the decoded JPEG, not a re-encoded JPEG.
    saved = Image.open(OUTPUT).convert("RGB")
    assert saved.size == original.size
    difference = ImageChops.difference(original, saved)
    changed = difference.getbbox()
    assert changed is not None
    assert CAPTION[0] <= changed[0] < changed[2] <= CAPTION[2]
    assert CAPTION[1] <= changed[1] < changed[3] <= CAPTION[3]
    outside = difference.copy()
    ImageDraw.Draw(outside).rectangle(
        (CAPTION[0], CAPTION[1], CAPTION[2] - 1, CAPTION[3] - 1), fill=0
    )
    assert outside.getbbox() is None, "Pixels changed outside the caption"
    assert SOURCE.read_bytes() == source_bytes, "Original source was modified"
    print(json.dumps({
        "output": str(OUTPUT.relative_to(ROOT)),
        "dimensions": saved.size,
        "bytes": OUTPUT.stat().st_size,
        "changed_rectangle_exclusive": changed,
        "changed_pixels": sum(p != (0, 0, 0) for p in difference.get_flattened_data()),
        "outside_caption_changed_pixels": 0,
        "original_sha256": SOURCE_SHA256,
        "output_sha256": hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
    }, indent=2))


if __name__ == "__main__":
    main()
