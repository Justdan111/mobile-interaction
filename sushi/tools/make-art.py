"""Generate the composited art assets for the sushi app.

Two jobs:
  1. Cut EVERY dish photograph out of its background with a soft, subject-
     centred falloff and settle its colour onto the washi, so a photo dissolves
     into the paper instead of sitting on it as a rectangle. This runs over
     `assets/img/*.jpg` automatically — drop a new photo in, re-run, done.
  2. Synthesise the sumi-e furniture — paper grain and the dry-brush ink
     strokes — from value noise, which reads far more like real ink than any
     smooth vector path would.

Usage:
    python3 -m venv .venv && .venv/bin/pip install numpy pillow
    .venv/bin/python tools/make-art.py

Stop the Metro dev server first: it watches `assets/` and will read a PNG
mid-write, then cache `Error: Empty file` against it until restarted.
"""

import glob
import os

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img")
CUT = os.path.join(OUT, "cut")
MANIFEST = os.path.join(ROOT, "data", "images.ts")

# The washi the cut-outs land on. Edges are graded towards this, which is what
# stops a dark photograph leaving a grey bruise as it fades.
PAPER = np.array([0xE6, 0xDF, 0xD1], np.float32)

RNG = np.random.default_rng(7)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def value_noise(h, w, octaves=6, base=4, gain=0.55):
    """Fractal value noise in [0, 1]."""
    total = np.zeros((h, w), np.float32)
    amp, norm = 1.0, 0.0
    for o in range(octaves):
        res = base * 2**o
        grid = RNG.random((res + 1, res + 1)).astype(np.float32)
        layer = np.asarray(
            Image.fromarray((grid * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC),
            np.float32,
        ) / 255.0
        total += layer * amp
        norm += amp
        amp *= gain
    return total / norm


def elliptical_alpha(h, w, cx, cy, rx, ry, inner=0.45, rot=0.0):
    """Soft-edged ellipse mask, `inner`..1 of the radius is the falloff band."""
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (xs - cx * w) / (rx * w)
    ny = (ys - cy * h) / (ry * h)
    if rot:
        c, s = np.cos(rot), np.sin(rot)
        nx, ny = nx * c - ny * s, nx * s + ny * c
    d = np.sqrt(nx**2 + ny**2)
    return 1.0 - smoothstep(inner, 1.0, d)


def subject_box(im, probe=192):
    """Locate the food in a photo and return (cx, cy, rx, ry) in 0..1 units.

    No model involved. Two cheap cues agree on where a plated dish is:
    distance from the backdrop colour (sampled from the frame's border), and
    local detail — food is textured, studio backdrops are smooth. Their product
    is blurred into a saliency field, and the ellipse is that field's weighted
    centroid and spread.

    This exists so the falloff is centred on the dish rather than on the middle
    of the frame. A fixed centred ellipse crops the subject off any photo that
    isn't perfectly composed, which is most of them.
    """
    small = im.convert("RGB").resize((probe, probe), Image.BILINEAR)
    px = np.asarray(small, np.float32) / 255.0
    h = w = probe

    # Backdrop colour: median of a border band, which is nearly always backdrop.
    band = max(4, probe // 16)
    edge = np.concatenate(
        [
            px[:band].reshape(-1, 3),
            px[-band:].reshape(-1, 3),
            px[:, :band].reshape(-1, 3),
            px[:, -band:].reshape(-1, 3),
        ]
    )
    backdrop = np.median(edge, axis=0)

    dist = np.sqrt(((px - backdrop) ** 2).sum(axis=2) / 3.0)

    grey = px.mean(axis=2)
    blurred = np.asarray(
        Image.fromarray((grey * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.5)),
        np.float32,
    ) / 255.0
    detail = np.abs(grey - blurred)

    def norm(x):
        lo, hi = np.percentile(x, 2), np.percentile(x, 98)
        return np.clip((x - lo) / max(hi - lo, 1e-5), 0, 1)

    sal = 0.62 * norm(dist) + 0.38 * norm(detail)
    sal = np.asarray(
        Image.fromarray((sal * 255).astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(probe * 0.045)
        ),
        np.float32,
    ) / 255.0

    # Keep only the confident half, so the spread describes the dish and not a
    # gradient in the backdrop.
    sal = np.clip(sal - np.percentile(sal, 55), 0, None)
    total = sal.sum()
    if total < 1e-4:
        return 0.5, 0.5, 0.46, 0.46

    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    cx = float((sal * xs).sum() / total) / w
    cy = float((sal * ys).sum() / total) / h
    sx = float(np.sqrt((sal * (xs / w - cx) ** 2).sum() / total))
    sy = float(np.sqrt((sal * (ys / h - cy) ** 2).sum() / total))

    # 2.2 standard deviations covers the dish with room for its shadow. The
    # clamps stop a very flat or very peaked saliency field from producing a
    # mask that either swallows the frame or shrink-wraps one highlight.
    return (
        min(max(cx, 0.34), 0.66),
        min(max(cy, 0.34), 0.66),
        min(max(2.2 * sx, 0.34), 0.56),
        min(max(2.2 * sy, 0.34), 0.56),
    )


def auto_cutout(src, dst, width=1000, inner=0.52, ragged=0.12, settle=0.72):
    """Feather a photograph onto the washi and write a transparent PNG.

    Three things happen, and all three are needed before a photo stops reading
    as a pasted rectangle:

      * the falloff is an ellipse placed by `subject_box`, so the dish stays
        sharp and only its surroundings dissolve;
      * the edge is roughened with low-frequency noise, so it ends like a wash
        rather than on a perfect oval;
      * the colour is graded towards the paper as the alpha drops (`settle`).
        Without this a dark photo fades through grey and leaves a bruise on the
        cream — the fade has to lose its colour as well as its opacity.
    """
    im = Image.open(os.path.join(OUT, src)).convert("RGB")
    cx, cy, rx, ry = subject_box(im)

    scale = width / im.width
    im = im.resize((width, max(1, round(im.height * scale))), Image.LANCZOS)
    w, h = im.size

    a = elliptical_alpha(h, w, cx, cy, rx, ry, inner)
    if ragged:
        n = value_noise(h, w, octaves=4, base=3)
        a = np.clip(a * (1.0 - ragged + ragged * 2 * n), 0.0, 1.0)
    a = np.asarray(
        Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(w * 0.010)),
        np.float32,
    ) / 255.0

    rgb = np.asarray(im, np.float32)
    mix = (1.0 - a[..., None]) * settle
    rgb = rgb * (1.0 - mix) + PAPER * mix

    out = Image.fromarray(
        np.dstack([rgb.astype(np.uint8), (a * 255).astype(np.uint8)]), "RGBA"
    )
    # Trim fully transparent margin: screens stretch these to a fixed box, so
    # dead space around the ink silently shrinks the subject.
    box = out.getchannel("A").point(lambda v: 255 if v > 4 else 0).getbbox()
    if box:
        out = out.crop(box)
    out.save(dst, optimize=True)
    return out.size


def cut_every_photo():
    """Regenerate a cut-out for every dish photograph, and the module that
    hands both the photos and the cut-outs to the app.

    The manifest is generated because React Native's `require` has to be a
    static literal — a new photo would otherwise need a hand-written import
    before the app could see it. Drop in a .jpg, re-run, and it is wired up.
    """
    os.makedirs(CUT, exist_ok=True)
    names = sorted(
        os.path.splitext(os.path.basename(p))[0] for p in glob.glob(os.path.join(OUT, "*.jpg"))
    )
    if not names:
        print("no photographs in", OUT)
        return

    for name in names:
        size = auto_cutout(f"{name}.jpg", os.path.join(CUT, f"{name}.png"))
        print(f"  cut/{name}.png", size)

    lines = [
        "// GENERATED by tools/make-art.py — do not edit by hand.",
        "//",
        "// Every dish photograph, plus the feathered cut-out of it used as a",
        "// detail-screen hero. Re-run the script after adding a photograph.",
        "",
        "export const photos = {",
        *[f"  '{n}': require('../assets/img/{n}.jpg')," for n in names],
        "} as const;",
        "",
        "export const cutouts = {",
        *[f"  '{n}': require('../assets/img/cut/{n}.png')," for n in names],
        "} as const;",
        "",
        "export type PhotoKey = keyof typeof photos;",
        "",
    ]
    with open(MANIFEST, "w") as fh:
        fh.write("\n".join(lines))
    print(f"  {os.path.relpath(MANIFEST, ROOT)} ({len(names)} photographs)")


def paper_grain(name="paper-grain.png", size=600):
    """Warm speckle + fibre for the washi background. Black at low alpha."""
    speck = RNG.random((size, size)).astype(np.float32)
    speck = np.asarray(
        Image.fromarray((speck * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)),
        np.float32,
    ) / 255.0
    fibre = value_noise(size, size, octaves=5, base=6)
    a = np.clip((speck * 0.55 + fibre * 0.45 - 0.42) * 2.4, 0.0, 1.0) * 46
    rgb = np.zeros((size, size, 3), np.uint8)
    rgb[..., 0], rgb[..., 1], rgb[..., 2] = 92, 78, 58
    Image.fromarray(np.dstack([rgb, a.astype(np.uint8)]), "RGBA").save(
        os.path.join(OUT, name), optimize=True
    )
    print(name)


def stretched_noise(h, w, squash, base=3, octaves=5):
    """Value noise squashed along x, so its features run with the bristles."""
    n = value_noise(h, w, octaves=octaves, base=base)
    return np.asarray(
        Image.fromarray((n * 255).astype(np.uint8))
        .resize((max(6, int(w / squash)), h), Image.BICUBIC)
        .resize((w, h), Image.BICUBIC),
        np.float32,
    ) / 255.0


def brush_stroke(
    name, size, angle, thickness, tail=0.55, streaks=0.55, wobble_amp=0.68, colour=(20, 18, 16)
):
    """A single dry-brush sumi-e sweep, rendered as a transparent PNG.

    Built in stroke space (u along the stroke, v across it). The edge is not
    faded — it is *thresholded* against lengthwise noise, which is what makes
    it read as bristles catching on paper rather than as a blurred bar.
    """
    w, h = size
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    x = xs / w * 2 - 1
    y = ys / h * 2 - 1
    c, s = np.cos(angle), np.sin(angle)
    u = x * c + y * s  # along the stroke
    v = -x * s + y * c  # across it

    fine = stretched_noise(h, w, 30.0, base=6, octaves=5)  # individual bristles
    mid = stretched_noise(h, w, 9.0, base=3, octaves=4)  # ink load along the sweep
    wobble = stretched_noise(h, w, 5.0, base=6, octaves=4)  # torn edge

    # The loaded brush swells mid-sweep, lifts off at the ends, and its edge
    # wanders — no plateau, so the noise below can bite into it everywhere.
    half = thickness * (0.44 + 0.56 * np.clip(1.0 - (u * 0.78) ** 2, 0, 1) ** 0.4)
    half *= (1.0 - wobble_amp) + 2 * wobble_amp * wobble
    edge = np.clip(1.0 - np.abs(v) / np.maximum(half, 1e-3), 0, 1) ** 0.5
    ends = np.clip(1.0 - np.abs(u) / 0.99, 0, 1) ** 0.3

    # Density falls off along the stroke as the brush runs dry.
    dry = smoothstep(-0.35, 1.0, u) * tail
    ink = edge * ends * (1.0 - 0.62 * dry) * (0.70 + 0.55 * (mid - 0.5))

    # Cut the ink against bristle noise: where the paper wins, the stroke skips.
    # The transition is deliberately near-binary — a soft ramp here is what made
    # earlier passes look like a blurred bar instead of ink on paper.
    cut = 0.20 + streaks * (0.62 * fine + 0.30 * mid) + 0.55 * dry * (1.0 - fine)
    a = smoothstep(0.0, 0.012, ink - cut * 0.62)
    a = np.clip(a * (0.74 + 0.26 * mid), 0, 1)

    a = np.asarray(
        Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5)),
        np.float32,
    )
    rgb = np.zeros((h, w, 3), np.uint8)
    for i, ch in enumerate(colour):
        rgb[..., i] = ch
    img = Image.fromarray(np.dstack([rgb, a.astype(np.uint8)]), "RGBA")
    # Trim to the ink. Callers stretch these to fixed boxes, so any
    # transparent margin left in the file silently shrinks the stroke.
    box = img.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    if box:
        img = img.crop(box)
    img.save(os.path.join(OUT, name), optimize=True)
    print(name, img.size)


def ink_wash(name="ink-wash.png", size=(820, 820)):
    """The enso behind the onboarding wordmark: one turn of a loaded brush,
    thinning as it comes round and leaving the traditional gap."""
    w, h = size
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (xs / w) * 2 - 1
    ny = (ys / h) * 2 - 1
    r = np.sqrt(nx**2 + ny**2)
    theta = np.arctan2(ny, nx)  # -pi..pi

    n = value_noise(h, w, octaves=6, base=4)
    wobble = value_noise(h, w, octaves=3, base=3)

    # The stroke thins as the brush travels and lifts off near the opening.
    travel = (theta + np.pi) / (2 * np.pi)
    load = 0.55 + 0.45 * np.cos(travel * 2 * np.pi * 0.85)
    gap = smoothstep(0.02, 0.13, np.abs(theta - 2.2)) * smoothstep(0.02, 0.13, np.abs(theta + 4.08))

    radius = 0.74 + 0.05 * (wobble - 0.5)
    band = 1.0 - smoothstep(0.0, 0.16 * load, np.abs(r - radius))
    a = np.clip(band * gap * (0.45 + 0.85 * n) - 0.10, 0, 1)
    a = np.asarray(
        Image.fromarray((a * 190).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3.5)),
        np.float32,
    )
    rgb = np.zeros((h, w, 3), np.uint8)
    rgb[..., 0], rgb[..., 1], rgb[..., 2] = 52, 50, 47
    Image.fromarray(np.dstack([rgb, a.astype(np.uint8)]), "RGBA").save(
        os.path.join(OUT, name), optimize=True
    )
    print(name)


def mountain(name="ink-mountain.png", size=(1000, 760)):
    """A sumi-e ridge line: three receding layers of wash, each dark along its
    own ridge and fading downward, broken by bands of mist.

    Drawn procedurally rather than as vector paths — a filled SVG ridge reads
    as a paper cut-out no matter how the curve is shaped, because what makes it
    a mountain is the texture and the fade, not the outline.
    """
    w, h = size
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    y01 = ys / h

    layers = [
        # (peak x, peak height, base y, spread, ink, jag, falloff)
        (0.62, 0.62, 0.94, 0.44, 0.42, 0.16, 3.4),
        (0.87, 0.46, 0.96, 0.30, 0.30, 0.13, 4.2),
        (0.42, 0.36, 1.00, 0.38, 0.55, 0.10, 5.0),
    ]

    x01 = xs[0] / w
    out = np.zeros((h, w), np.float32)
    for i, (px, ph, base, spread, ink, jag, falloff) in enumerate(layers):
        # Ridge profile: a broad peak, then two octaves of roughening so the
        # skyline breaks into subsidiary crags instead of one clean bell.
        # (The profile is sampled from a *tall* noise field — asking for a
        # single-row field averages the grid away and hands back a flat line.)
        hump = np.exp(-(((x01 - px) / spread) ** 2) * 2.4) ** 0.7
        coarse = value_noise(16, w, octaves=5, base=5 + i * 2)[8]
        fine = value_noise(16, w, octaves=6, base=14 + i * 5)[8]
        ridge = base - ph * hump
        ridge += jag * hump * ((coarse - 0.5) * 1.15 + (fine - 0.5) * 0.55)
        ridge = np.tile(ridge, (h, 1))

        below = smoothstep(-0.003, 0.008, y01 - ridge)
        # Ink pools along the ridge and washes out down the slope; the vertical
        # streaking is what keeps the face from looking like flat grey fill.
        wash = np.exp(-(y01 - ridge) * falloff)
        grain = value_noise(h, w, octaves=6, base=4 + i)
        streak = stretched_noise(h, w, 0.14, base=7 + i, octaves=5)
        out += below * np.clip(wash, 0, 1) * (0.30 + 0.60 * grain + 0.45 * streak) * ink

    # Mist: two soft horizontal bands that lift the ink back off the paper.
    drift = value_noise(h, w, octaves=4, base=3)
    for centre, thick, strength in ((0.66, 0.055, 0.85), (0.80, 0.075, 0.7)):
        band = np.exp(-(((y01 - centre) / thick) ** 2))
        out *= 1.0 - strength * band * (0.45 + 0.55 * drift)

    # Fade the sheet's own edges out. Without this the mist bands terminate on
    # the bitmap boundary and the wash reads as a pasted rectangle.
    out *= (
        smoothstep(0.0, 0.16, x01)  # broadcasts across rows
        * smoothstep(0.0, 0.10, 1.0 - x01)
        * smoothstep(0.0, 0.12, 1.0 - y01)
    )

    a = np.clip(out, 0, 1) ** 0.9 * 255
    a = np.asarray(
        Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32
    )
    rgb = np.zeros((h, w, 3), np.uint8)
    rgb[..., 0], rgb[..., 1], rgb[..., 2] = 45, 44, 41
    Image.fromarray(np.dstack([rgb, a.astype(np.uint8)]), "RGBA").save(
        os.path.join(OUT, name), optimize=True
    )
    print(name, (w, h))


if __name__ == "__main__":
    print("photographs →")
    cut_every_photo()

    print("ink →")
    paper_grain()
    ink_wash()
    mountain()
    # The big diagonal sweep behind the detail-screen hero: dry and streaky,
    # so the paper shows through in tracks the way a lifting brush leaves it.
    brush_stroke("ink-brush-wide.png", (1000, 620), -0.30, 0.50, tail=0.78, streaks=0.86)
    # The near-solid slab the quantity stepper sits on — barely any wobble, or
    # it stops reading as a bar and starts reading as a puddle.
    brush_stroke("ink-brush-pill.png", (900, 200), 0.02, 0.96, tail=0.12, streaks=0.18,
                 wobble_amp=0.10)
    # The short terracotta rule under the dish name.
    brush_stroke("ink-underline.png", (600, 90), 0.0, 0.42, tail=0.46, streaks=0.60,
                 wobble_amp=0.5, colour=(178, 74, 47))
    # The vermilion stamp block behind the menu header's kana.
    brush_stroke("ink-stamp.png", (280, 760), 1.5708, 0.94, tail=0.08, streaks=0.20,
                 wobble_amp=0.2, colour=(172, 78, 44))
