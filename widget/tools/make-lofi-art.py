"""
Builds the artwork for LofiPlayerActivity into assets/widgets/.

Two kinds of art, made two ways:

* Stickers (LO-FI, smiley, headphones) are illustrations nobody can redraw from SF
  Symbols, so they are cut straight out of the comp in docs/screenshots/widget-3/ with
  rembg. Each one is a row in STICKERS; adding a sticker is adding a row, and every row
  goes through the same cut -> tidy -> trim -> upscale pass.
* The tape reel and the vinyl it sits on are geometric, and the comp only shows them half
  hidden behind stickers and a translucent shell. They are drawn here instead, at 4x and
  downsampled, using the comp's colours. The hub is a separate file from the vinyl so the
  widget can turn the hub while the grooves (which look the same at any angle) stay put.

Run from widget/:

    PYTHONPATH=../rally/.venv/lib/python3.14/site-packages python3.14 tools/make-lofi-art.py

rembg needs ~/.u2net/u2net.onnx, which it downloads on first use.
"""

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
COMPS = ROOT / "docs" / "screenshots" / "widget-3"
OUT = ROOT / "assets" / "widgets"

# name -> (comp, crop box in comp pixels, hole seeds). Boxes are loose on purpose: rembg
# finds the edge, and the result is trimmed to its alpha afterwards.
#
# A hole seed is a point, in crop pixels, inside a die-cut opening — the gap under the
# headband, where the comp shows the vinyl through the sticker. rembg keeps whatever is
# enclosed by the subject, so each opening is flood-filled out up to the sticker's cream
# outline.
STICKERS = {
    "lofi-sticker": ("ref-03-expanded.png", (128, 160, 290, 298), []),
    "smiley-sticker": ("ref-03-expanded.png", (486, 204, 616, 334), []),
    "headphones-sticker": ("ref-03-expanded.png", (800, 180, 946, 336), [(75, 50)]),
}

# Anything at least this bright is the sticker's cream outline, which bounds a hole fill.
OUTLINE_LUMA = 185

# Stickers are drawn at most ~60pt wide; 3x that is plenty for any screen.
STICKER_MAX_PX = 180

ORANGE = (240, 172, 64)


def cut_sticker(session, comp: str, box: tuple[int, int, int, int], holes) -> Image.Image:
    src = Image.open(COMPS / comp).convert("RGB").crop(box)
    cut = remove(src, session=session, post_process_mask=True)
    alpha = np.asarray(cut.getchannel("A")).astype(np.float32)
    luma = np.asarray(src.convert("L"))
    for seed in holes:
        alpha[flood(luma < OUTLINE_LUMA, seed)] = 0
    # Stickers are die-cut: a hard outline, no soft shadow. Snap the matte so the vinyl
    # and shell behind them in the comp do not survive as a grey halo.
    alpha = np.clip((alpha - 60) * (255 / 140), 0, 255).astype(np.uint8)
    # Keep only the largest blob, which drops crumbs of reel or groove rembg kept.
    alpha = largest_component(alpha)
    cut.putalpha(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6)))
    cut = cut.crop(cut.getchannel("A").getbbox())
    scale = STICKER_MAX_PX / max(cut.size)
    if scale > 1:
        cut = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.LANCZOS)
    return cut


def flood(passable: np.ndarray, seed: tuple[int, int]) -> np.ndarray:
    """Pixels reachable from `seed` (x, y) through `passable`, 4-connected."""
    h, w = passable.shape
    filled = np.zeros_like(passable)
    x0, y0 = seed
    stack = [(y0, x0)]
    while stack:
        y, x = stack.pop()
        if 0 <= y < h and 0 <= x < w and passable[y, x] and not filled[y, x]:
            filled[y, x] = True
            stack.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    # Take the anti-aliased fringe against the outline too.
    grown = Image.fromarray((filled * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
    return np.asarray(grown) > 0


def largest_component(alpha: np.ndarray) -> np.ndarray:
    solid = alpha > 128
    labels = np.zeros(solid.shape, dtype=np.int32)
    sizes = [0]
    current = 0
    h, w = solid.shape
    for y in range(h):
        for x in range(w):
            if solid[y, x] and labels[y, x] == 0:
                current += 1
                stack = [(y, x)]
                labels[y, x] = current
                count = 0
                while stack:
                    cy, cx = stack.pop()
                    count += 1
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < h and 0 <= nx < w and solid[ny, nx] and labels[ny, nx] == 0:
                            labels[ny, nx] = current
                            stack.append((ny, nx))
                sizes.append(count)
    if current == 0:
        return alpha
    keep = int(np.argmax(sizes))
    # Grow the kept blob by a couple of pixels so its soft edge is not shaved off.
    mask = Image.fromarray(((labels == keep) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    return np.minimum(alpha, np.asarray(mask))


def draw_hub(size: int) -> Image.Image:
    """The cassette spool hub: pale disc, dark rim, ten teeth, dark bore, orange tick."""
    s = size * 4
    c = s / 2
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    def ring(r, fill):
        d.ellipse((c - r, c - r, c + r, c + r), fill=fill)

    ring(c, (28, 28, 30, 255))  # dark rim
    # Pale face with a soft top-left light, as the comp shades it.
    face_r = c * 0.9
    face = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float32)
    shade = 236 - 40 * np.clip(((xx - c * 0.6) + (yy - c * 0.6)) / (2.2 * c), 0, 1)
    face_px = np.dstack([shade, shade, shade + 2, np.full_like(shade, 255)]).clip(0, 255)
    face = Image.fromarray(face_px.astype(np.uint8), "RGBA")
    face_mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(face_mask).ellipse((c - face_r, c - face_r, c + face_r, c + face_r), fill=255)
    img.paste(face, (0, 0), face_mask)

    teeth = 10
    for i in range(teeth):
        a = 2 * math.pi * i / teeth
        # Outer dash: a short arc segment near the rim.
        r1, r2 = face_r * 0.74, face_r * 0.9
        span = math.pi / teeth * 0.55
        outer = [(c + r * math.cos(a + t), c + r * math.sin(a + t))
                 for r, t in ((r1, -span), (r2, -span), (r2, span), (r1, span))]
        d.polygon(outer, fill=(24, 24, 26, 255))
        # Inner tooth: a wedge from the bore outwards, offset half a step.
        b = a + math.pi / teeth
        r3, r4 = face_r * 0.42, face_r * 0.66
        w = math.pi / teeth * 0.42
        inner = [(c + r * math.cos(b + t), c + r * math.sin(b + t))
                 for r, t in ((r3, -w), (r4, -w * 0.8), (r4, w * 0.8), (r3, w))]
        d.polygon(inner, fill=(46, 46, 48, 255))

    # Orange tick on the rim, the comp's one accent on the reel.
    d.arc((c - face_r * 0.98, c - face_r * 0.98, c + face_r * 0.98, c + face_r * 0.98),
          start=-70, end=-40, fill=ORANGE + (255,), width=round(face_r * 0.09))

    ring(face_r * 0.44, (22, 22, 24, 255))  # bore
    ring(face_r * 0.36, (34, 34, 36, 255))  # bore bevel
    return img.resize((size, size), Image.LANCZOS)


def draw_vinyl(size: int, rim: bool) -> Image.Image:
    """
    Black disc with fine grooves and a broad sheen, hole left clear for the hub. `rim`
    adds the pale outer ring the compact pill draws around its disc.
    """
    s = size * 4
    c = s / 2
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float32)
    r = np.hypot(xx - c, yy - c)
    theta = np.arctan2(yy - c, xx - c)
    outer = c * (0.88 if rim else 1.0)

    base = np.full(r.shape, 20.0)
    # Grooves: thin pale lines on black, as the comp draws them, fading toward the label.
    ripple = 0.5 + 0.5 * np.sin(r / (s / 150) * 2 * math.pi)
    base += 34 * ripple**6 * np.clip((r - c * 0.45) / (c * 0.2), 0, 1)
    # Sheen: two opposed lobes, as light catches a record.
    base += 26 * np.clip(np.cos(2 * (theta + math.pi / 2)), 0, 1) ** 3 * (r / outer)
    rgb = np.dstack([base, base, base + 1]).clip(0, 255)

    alpha = np.where(r <= outer, 255, 0).astype(np.float32)
    alpha[r < c * 0.34] = 0  # hole for the hub
    if rim:
        band = (r > outer) & (r <= c * 0.985)
        rgb[band] = (206, 206, 208)
        alpha[band] = 255
        # Hairline shadow inside the rim.
        inner = (r > outer - s * 0.012) & (r <= outer)
        rgb[inner] = (10, 10, 10)
    img = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), "RGBA")
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    session = new_session("u2net")
    for name, (comp, box, holes) in STICKERS.items():
        cut_sticker(session, comp, box, holes).save(OUT / f"{name}.png")
        print(f"wrote {name}.png")
    draw_hub(192).save(OUT / "reel-hub.png")
    draw_vinyl(288, rim=False).save(OUT / "vinyl.png")
    draw_vinyl(144, rim=True).save(OUT / "vinyl-rim.png")
    print("wrote reel-hub.png, vinyl.png, vinyl-rim.png")


if __name__ == "__main__":
    main()
