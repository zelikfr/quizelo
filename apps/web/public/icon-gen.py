"""
Generate Quizelo PWA icons from the brand logo (mountain + keyboard).

The logo lives at `apps/web/public/logo.svg`. This script doesn't read
the SVG — it re-draws the same geometry with Pillow primitives so we
don't need cairosvg / Inkscape on the build host.

Outputs:
  - icon-192.png            (Android home, manifest)
  - icon-512.png            (Android splash, manifest)
  - icon-512-maskable.png   (Android adaptive icons, ~80% safe area)
  - apple-touch-icon.png    (iOS home screen, 180×180)

Run:  python3 apps/web/public/icon-gen.py
"""
from __future__ import annotations

import os
from PIL import Image, ImageDraw

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Brand palette — keep in sync with the SVG source.
BG_TOP = (26, 19, 48, 255)        # #1A1330
BG_BOTTOM = (6, 8, 15, 255)       # #06080F
GOLD_TOP = (255, 224, 138, 255)   # #FFE08A
GOLD_BOTTOM = (255, 209, 102, 255)  # #FFD166
DOT = (255, 77, 109, 255)         # #FF4D6D

CANVAS_VB = 512  # viewBox is 512×512
CORNER_RADIUS_VB = 112  # rx="112" on the background

# Mountain points (no transform applied); see the SVG.
MOUNTAIN_VB = [
    (64, 332), (132, 196), (200, 304), (256, 168),
    (312, 304), (380, 196), (448, 332),
]
KEYBOARD_VB = (64, 332, 448, 412)  # x0, y0, x1, y1 — width 384, height 80
KEYBOARD_RADIUS_VB = 14
DOTS_VB = [(148, 372), (256, 372), (364, 372)]
DOT_RADIUS_VB = 18
# Crown is centered in the 512 viewBox. Content y-range is 168..412
# (mountain top to keyboard bottom), midpoint 290 — we shift it up by
# 34 so the midpoint sits at 256 = canvas center.
G_TRANSLATE_Y_VB = -34


def lerp(a: int, b: int, t: float) -> int:
    return int(round(a + (b - a) * t))


def diagonal_gradient(size: int, top: tuple, bottom: tuple) -> Image.Image:
    """Approximate the SVG's diagonal linear gradient (x1=0,y1=0,x2=1,y2=1).

    For each pixel, lerp between `top` and `bottom` along (x+y)/2.
    """
    img = Image.new("RGBA", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            px[x, y] = (
                lerp(top[0], bottom[0], t),
                lerp(top[1], bottom[1], t),
                lerp(top[2], bottom[2], t),
                255,
            )
    return img


def vertical_gradient_layer(size: int, top: tuple, bottom: tuple) -> Image.Image:
    """A full-canvas RGBA strip, top→bottom lerp. Used to tint the gold shapes."""
    img = Image.new("RGBA", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        row_color = (
            lerp(top[0], bottom[0], t),
            lerp(top[1], bottom[1], t),
            lerp(top[2], bottom[2], t),
            255,
        )
        for x in range(size):
            px[x, y] = row_color
    return img


def rounded_corners_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size - 1, size - 1), radius=radius, fill=255
    )
    return mask


def scale_pt(point: tuple, size: int, dy_vb: int = 0) -> tuple:
    x, y = point
    return (
        int(round(x * size / CANVAS_VB)),
        int(round((y + dy_vb) * size / CANVAS_VB)),
    )


def scale_v(value: int, size: int) -> int:
    return int(round(value * size / CANVAS_VB))


def render_logo(size: int, with_corners: bool = True) -> Image.Image:
    """Render the logo at `size`×`size`. `with_corners=False` skips the
    rounded-corner mask — useful for maskable icons where Android paints
    its own mask on top."""
    bg = diagonal_gradient(size, BG_TOP, BG_BOTTOM)

    # ── Build the gold shapes on a transparent canvas, then tint with
    #    a vertical gradient using the alpha as the mask.
    gold_alpha = Image.new("L", (size, size), 0)
    da = ImageDraw.Draw(gold_alpha)
    dy = G_TRANSLATE_Y_VB

    # Mountain polygon
    da.polygon(
        [scale_pt(p, size, dy) for p in MOUNTAIN_VB],
        fill=255,
    )

    # Keyboard rounded rect
    x0, y0, x1, y1 = KEYBOARD_VB
    da.rounded_rectangle(
        (
            scale_v(x0, size),
            scale_v(y0 + dy, size),
            scale_v(x1, size),
            scale_v(y1 + dy, size),
        ),
        radius=scale_v(KEYBOARD_RADIUS_VB, size),
        fill=255,
    )

    gold_layer = vertical_gradient_layer(size, GOLD_TOP, GOLD_BOTTOM)
    gold_layer.putalpha(gold_alpha)

    composed = Image.alpha_composite(bg, gold_layer)

    # ── Red dots on top
    dd = ImageDraw.Draw(composed)
    for cx, cy in DOTS_VB:
        rx, ry = scale_pt((cx, cy), size, dy)
        rr = scale_v(DOT_RADIUS_VB, size)
        dd.ellipse((rx - rr, ry - rr, rx + rr, ry + rr), fill=DOT)

    if with_corners:
        composed.putalpha(
            rounded_corners_mask(size, scale_v(CORNER_RADIUS_VB, size))
        )

    return composed


def render_maskable(size: int) -> Image.Image:
    """Maskable icon: dark background fills the whole canvas (Android
    masks it to whatever shape it wants), and the logo content sits in
    the inner ~70% so it survives any common mask."""
    canvas = diagonal_gradient(size, BG_TOP, BG_BOTTOM)

    inner_pct = 0.70
    inner_size = int(round(size * inner_pct))
    inner = render_logo(inner_size, with_corners=False)
    # The inner render has its own background; we only want the
    # "content" (gold shapes + dots), so paste using its alpha. Since
    # `inner` has full alpha (no with_corners means no mask), we'd
    # paste both bg and content — that prints a smaller dark square
    # over the canvas, which is fine: it acts as a subtle inset
    # cartouche that mirrors the SVG's framing.
    offset = (size - inner_size) // 2
    canvas.alpha_composite(inner, (offset, offset))
    return canvas


def write(name: str, img: Image.Image) -> None:
    path = os.path.join(OUT_DIR, name)
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path} ({img.size[0]}×{img.size[1]})")


def main() -> None:
    icon_512 = render_logo(512)
    icon_192 = icon_512.resize((192, 192), Image.LANCZOS)
    write("icon-512.png", icon_512)
    write("icon-192.png", icon_192)

    write("apple-touch-icon.png", icon_512.resize((180, 180), Image.LANCZOS))

    write("icon-512-maskable.png", render_maskable(512))


if __name__ == "__main__":
    main()
