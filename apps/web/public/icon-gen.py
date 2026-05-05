"""
Generate Quizelo PWA icons from the brand wordmark.

Design:
  - Dark surface background (#06080F → #0B0F1A vertical gradient)
  - Centered violet rounded square (matches `--color-violet`)
  - Bold white "Q" letter (Lato Black at ~60% of the inner square)
  - Small gold accent dot (top-right of the violet square) — nods
    to the gold "premium" tier badge used elsewhere in the UI

Outputs into the same directory:
  - icon-192.png            (Android home, manifest)
  - icon-512.png            (Android splash, manifest)
  - icon-512-maskable.png   (Android adaptive icons, ~80% safe area)
  - apple-touch-icon.png    (iOS home screen, 180×180)

Run:  python3 apps/web/public/icon-gen.py
"""
from __future__ import annotations

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Brand palette — keep in sync with tailwind.config.ts.
BG_TOP = (17, 22, 42, 255)       # surface-2 #11162A
BG_BOTTOM = (6, 8, 15, 255)      # surface-0 #06080F
VIOLET = (124, 92, 255, 255)     # violet-500 #7C5CFF
VIOLET_DEEP = (74, 51, 200, 255) # darker for the bottom-right shadow
GOLD = (255, 209, 102, 255)      # gold-400 #FFD166
WHITE = (245, 246, 252, 255)     # near-white for the "Q"

FONT_PATHS = [
    "/usr/share/fonts/truetype/lato/Lato-Black.ttf",
    "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf",
]


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for p in FONT_PATHS:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def vertical_gradient(size: int, top: tuple, bottom: tuple) -> Image.Image:
    """Linear gradient top→bottom, full alpha."""
    base = Image.new("RGBA", (size, size), bottom)
    grad = Image.new("L", (1, size))
    for y in range(size):
        t = y / max(1, size - 1)
        grad.putpixel((0, y), int(255 * (1 - t)))
    grad = grad.resize((size, size))
    overlay = Image.new("RGBA", (size, size), top)
    overlay.putalpha(grad)
    return Image.alpha_composite(base, overlay)


def rounded_square_mask(box_size: int, radius: int) -> Image.Image:
    """A square mask with rounded corners for the violet plate."""
    mask = Image.new("L", (box_size, box_size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, box_size - 1, box_size - 1), radius=radius, fill=255)
    return mask


def draw_icon(canvas_size: int, content_pct: float = 0.72) -> Image.Image:
    """Render one icon at the requested size. `content_pct` is the
    fraction of the canvas the violet plate occupies — drop it for
    maskable icons so the safe area sits well inside the canvas."""
    img = vertical_gradient(canvas_size, BG_TOP, BG_BOTTOM)

    plate_size = int(canvas_size * content_pct)
    radius = int(plate_size * 0.22)
    margin = (canvas_size - plate_size) // 2

    # Soft violet glow behind the plate.
    glow = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle(
        (margin, margin, margin + plate_size, margin + plate_size),
        radius=radius,
        fill=(124, 92, 255, 110),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(canvas_size // 16))
    img = Image.alpha_composite(img, glow)

    # Violet plate with a subtle diagonal sheen (top-left brighter).
    plate = Image.new("RGBA", (plate_size, plate_size), VIOLET)
    sheen = Image.new("L", (plate_size, plate_size), 0)
    sd = ImageDraw.Draw(sheen)
    for y in range(plate_size):
        t = y / max(1, plate_size - 1)
        sd.line([(0, y), (plate_size, y)], fill=int(255 * (1 - t) * 0.18))
    sheen_overlay = Image.new("RGBA", (plate_size, plate_size), (255, 255, 255, 0))
    sheen_overlay.putalpha(sheen)
    plate = Image.alpha_composite(plate, sheen_overlay)
    plate.putalpha(rounded_square_mask(plate_size, radius))

    img.alpha_composite(plate, (margin, margin))

    # Centered "Q" in white. The Q is sized so its tail still shows
    # at small renders; tested down to 32×32.
    font = load_font(int(plate_size * 0.62))
    label = "Q"
    bbox = font.getbbox(label)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    tx = (canvas_size - text_w) // 2 - bbox[0]
    # Optical centering — Q's tail biases the visual center slightly
    # below geometric center, so we lift it a touch.
    ty = (canvas_size - text_h) // 2 - bbox[1] - int(plate_size * 0.025)

    d = ImageDraw.Draw(img)
    d.text((tx, ty), label, font=font, fill=WHITE)

    # Gold accent dot — top-right corner of the plate.
    dot_r = int(plate_size * 0.045)
    dot_cx = margin + plate_size - int(plate_size * 0.18)
    dot_cy = margin + int(plate_size * 0.18)
    d.ellipse(
        (dot_cx - dot_r, dot_cy - dot_r, dot_cx + dot_r, dot_cy + dot_r),
        fill=GOLD,
    )

    return img


def write(name: str, img: Image.Image) -> None:
    path = os.path.join(OUT_DIR, name)
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path} ({img.size[0]}×{img.size[1]})")


def main() -> None:
    # Standard "any" icons.
    icon_512 = draw_icon(512, content_pct=0.72)
    icon_192 = icon_512.resize((192, 192), Image.LANCZOS)
    write("icon-512.png", icon_512)
    write("icon-192.png", icon_192)

    # Apple touch icon at 180×180. Same crop as standard.
    write("apple-touch-icon.png", icon_512.resize((180, 180), Image.LANCZOS))

    # Maskable: shrink the plate so Android's mask never crops the
    # mark. Spec calls for ~40% safe zone in the center; we use 60%
    # plate size which leaves the plate fully inside any common mask.
    write("icon-512-maskable.png", draw_icon(512, content_pct=0.60))


if __name__ == "__main__":
    main()
