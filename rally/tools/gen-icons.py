"""Draw the Rally icon set from one source mark.

The mark is Volara's swept quill — the same geometry as `BrandMark`'s `volara`
case in components/icons.tsx — struck in ember on the app's ground. Keeping it
generated means the launcher icon, the Android adaptive layers, the splash and
the favicon can never drift apart from each other.

Run via tools/gen-icons.sh.
"""

import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "images")

GROUND = (0xF1, 0xF1, 0xF1, 255)
TEAL = (0x2B, 0x55, 0x61, 255)
EMBER = (0xE8, 0x44, 0x2C, 255)

# The quill, as a closed polygon in a 24x24 box — the same silhouette the
# in-app BrandMark draws, sampled off its bezier so the two read as one mark.
QUILL = [
    (2.6, 15.8), (5.0, 13.0), (8.2, 10.4), (11.8, 8.4), (15.6, 7.0),
    (19.2, 6.2), (21.4, 5.9), (20.8, 9.0), (19.2, 11.6), (16.8, 13.8),
    (13.6, 15.6), (10.2, 16.8), (7.0, 17.4), (4.4, 17.2),
]
# The dry-brush stroke trailing under it.
TAIL = [(6.2, 18.6), (10.0, 16.7), (14.2, 15.0), (18.4, 13.6), (21.4, 12.7)]


def draw_mark(size, bg, ink, scale=0.62):
    """Render the mark centred on `bg`, occupying `scale` of the canvas."""
    ss = 4  # supersample, then downsample — Pillow has no antialiased polygon
    canvas = Image.new("RGBA", (size * ss, size * ss), bg)
    d = ImageDraw.Draw(canvas)

    box = size * ss * scale
    off = (size * ss - box) / 2

    def pt(p):
        return (off + p[0] / 24 * box, off + p[1] / 24 * box)

    d.polygon([pt(p) for p in QUILL], fill=ink)
    d.line([pt(p) for p in TAIL], fill=ink, width=max(1, int(box * 0.035)), joint="curve")

    return canvas.resize((size, size), Image.LANCZOS)


def save(im, name):
    im.save(os.path.join(OUT, name), optimize=True)
    print(f"wrote assets/images/{name}  {im.width}x{im.height}")


def main():
    os.makedirs(OUT, exist_ok=True)

    save(draw_mark(1024, GROUND, EMBER), "icon.png")
    save(draw_mark(1024, (0, 0, 0, 0), EMBER, scale=0.44), "android-icon-foreground.png")
    save(Image.new("RGBA", (1024, 1024), GROUND), "android-icon-background.png")
    # Monochrome themed icons are masked to their alpha, so the shape has to
    # carry the meaning — colour here is ignored by the launcher.
    save(draw_mark(1024, (0, 0, 0, 0), (0, 0, 0, 255), scale=0.44),
         "android-icon-monochrome.png")
    save(draw_mark(512, (0, 0, 0, 0), TEAL), "splash-icon.png")
    save(draw_mark(64, GROUND, EMBER), "favicon.png")


if __name__ == "__main__":
    main()
