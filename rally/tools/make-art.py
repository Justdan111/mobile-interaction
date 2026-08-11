"""Cut every product photograph out of its background and write the manifest
the app imports.

Runs over `assets/img/*.jpg` automatically — drop a new photo in, re-run, done.

Why a matting model rather than colour keying:

    The first version of this script sampled a median backdrop colour from the
    frame's border and keyed on distance from it. That works beautifully on a
    seamless studio backdrop and fails completely on anything else, which was
    measured, not guessed: a racket against a cloudy sky kept the clouds as
    blue blobs, a pink painted wall left magenta smears, and a court's white
    line survived as a grey band straight through the subject. A gradient has
    no single backdrop colour, so half the background reads as foreground.

    Free badminton photography is overwhelmingly shot on skies, courts and
    painted walls, so "pick photos with a plain backdrop" would have meant
    picking on backdrop luck rather than on whether the product looks right.
    U2Net segments the subject itself and does not care what is behind it.

    This is a build-time tool. The model runs here and only the resulting PNGs
    ship, so nothing is added to the app bundle.

Usage:
    python3 -m venv .venv && .venv/bin/pip install numpy pillow "rembg[cpu]"
    .venv/bin/python tools/make-art.py

The first run downloads the U2Net weights (~180 MB) into ~/.u2net.

Stop the Metro dev server first: it watches `assets/` and will read a PNG
mid-write, then cache `Error: Empty file` against it until restarted.
"""

import glob
import os

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "img")
CUT = os.path.join(SRC, "cut")
MANIFEST = os.path.join(ROOT, "data", "images.ts")

# The page ground the cut-outs land on. Edge pixels are graded toward this, so
# a product shot against a dark backdrop doesn't leave a soot-coloured rim on
# #F1F1F1 where its alpha falls off.
GROUND = np.array([0xF1, 0xF1, 0xF1], np.float32)

WIDTH = 1000

# One session reused across every photo — constructing it loads the weights,
# which is far and away the slowest part of a run.
SESSION = new_session("u2net")


def matte(im):
    """Return the subject's alpha channel, 0..1, from the matting model."""
    cut = remove(im, session=SESSION, post_process_mask=True)
    return np.asarray(cut.convert("RGBA").getchannel("A"), np.float32) / 255.0


def drop_islands(alpha, min_fraction=0.02):
    """Delete specks the model kept that aren't part of the main subject.

    U2Net occasionally holds on to a stray highlight or a bit of court
    marking. Anything whose bounding area is under `min_fraction` of the
    largest region's is noise; a racket's frame and its handle are always
    joined, so nothing load-bearing gets dropped.

    Uses a coarse flood fill on a downsampled mask — exact connected
    components would need scipy, which is a heavy dependency for a cleanup
    pass this crude.
    """
    h, w = alpha.shape
    small = np.asarray(
        Image.fromarray((alpha * 255).astype(np.uint8)).resize((160, 160), Image.BILINEAR),
        np.float32,
    ) / 255.0
    solid = small > 0.5
    seen = np.zeros_like(solid, bool)
    regions = []

    for sy in range(160):
        for sx in range(160):
            if not solid[sy, sx] or seen[sy, sx]:
                continue
            stack, cells = [(sy, sx)], []
            seen[sy, sx] = True
            while stack:
                y, x = stack.pop()
                cells.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < 160 and 0 <= nx < 160 and solid[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            regions.append(cells)

    if len(regions) < 2:
        return alpha

    biggest = max(len(r) for r in regions)
    keep = np.zeros_like(solid, bool)
    for cells in regions:
        if len(cells) >= biggest * min_fraction:
            for y, x in cells:
                keep[y, x] = True

    mask = np.asarray(
        Image.fromarray((keep * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR),
        np.float32,
    ) / 255.0
    return alpha * (mask > 0.35)


def smoothstep(a, b, x):
    t = np.clip((x - a) / max(b - a, 1e-6), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def clear_string_bed(alpha, px, lo=0.05, hi=0.14):
    """Punch the backdrop back out of the gaps inside a racket's frame.

    The matting model returns a silhouette, and a racket's silhouette encloses
    its string bed — so whatever was behind the racket comes along inside it. A
    racket shot on a pink wall mattes out as a pink oval; on a court, a green
    one. Neither is a cut-out.

    So the two techniques are combined where each is strong: the model decides
    the outline, and a colour key decides what inside that outline is really
    backdrop. The backdrop colour is sampled from pixels the model already
    rejected, which is a far more reliable sample than the frame's border —
    that was the original keying approach's weak point.

    A pixel survives only if the model calls it subject AND it does not match
    the backdrop. The frame, grip and strings differ from the backdrop, so they
    stay; the gaps between strings do not, so they go.
    """
    outside = alpha < 0.1
    if outside.sum() < 64:
        return alpha  # Subject fills the frame; no backdrop to sample.

    backdrop = np.median(px[outside], axis=0)
    dist = np.sqrt(((px - backdrop) ** 2).sum(axis=2) / 3.0)
    keep = smoothstep(lo, hi, dist)

    # Cast shadows survive the test above — they sit far enough from the
    # backdrop's colour to read as subject — and the model hands them over
    # attached to the product, so a racket arrives trailing a grey blob.
    #
    # A shadow is the backdrop scaled darker: every channel drops by roughly
    # the same factor. So divide by the backdrop and look at the spread of the
    # per-channel ratios. Uniform spread and a ratio at or below 1 means
    # shading, not pigment. A genuinely coloured object skews the channels
    # unevenly, and a pale object on a dark ground scales up rather than down,
    # so neither is caught — which is what keeps a white shuttlecock on a
    # charcoal backdrop intact.
    ratio = px / np.maximum(backdrop, 1e-3)
    spread = ratio.max(axis=2) - ratio.min(axis=2)
    level = ratio.mean(axis=2)
    shadow = (1.0 - smoothstep(0.10, 0.30, spread)) * (1.0 - smoothstep(0.94, 1.06, level))

    # The ratio test alone cannot tell a dark neutral object from a shadow —
    # a charcoal racket against a bright sky scales every channel down by the
    # same factor, exactly like shading, and the first version of this erased
    # one down to a ghost.
    #
    # Texture separates them. A cast shadow is a smooth gradient; a racket is
    # nothing but edges — frame, strings, grip. So only trust the shadow verdict
    # where the neighbourhood is flat.
    grey = px.mean(axis=2)
    blurred = np.asarray(
        Image.fromarray((grey * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.0)),
        np.float32,
    ) / 255.0
    detail = np.abs(grey - blurred)
    detail = np.asarray(
        Image.fromarray((np.clip(detail * 8, 0, 1) * 255).astype(np.uint8)).filter(
            ImageFilter.MaxFilter(7)
        ),
        np.float32,
    ) / 255.0
    shadow *= 1.0 - smoothstep(0.05, 0.22, detail)

    # The detail gate is too generous for one case: the shadow *of a string
    # bed* is itself a lattice, so it carries plenty of local detail and the
    # gate waves it through. A racket on a pink wall kept a pink squiggle.
    #
    # Hue settles it. A shadow is the backdrop minus light, so it holds the
    # backdrop's chromaticity exactly; the product almost never does. Compare
    # chromaticity — colour with brightness divided out — and let a match
    # override the detail gate. A charcoal racket on blue sky is neutral where
    # the sky is blue, so it stays.
    def chroma(v):
        return v / np.maximum(v.sum(axis=-1, keepdims=True), 1e-3)

    chroma_dist = np.sqrt(((chroma(px) - chroma(backdrop[None, None, :])) ** 2).sum(axis=2))
    same_hue = 1.0 - smoothstep(0.012, 0.05, chroma_dist)
    darker = 1.0 - smoothstep(0.94, 1.06, level)
    shadow = np.maximum(shadow, same_hue * darker)

    return alpha * keep * (1.0 - shadow)


def cutout(src, dst, feather=0.0016, settle=0.9):
    """Matte one photograph onto the ground and write a transparent PNG."""
    im = Image.open(src).convert("RGB")
    scale = WIDTH / im.width
    im = im.resize((WIDTH, max(1, round(im.height * scale))), Image.LANCZOS)
    w, h = im.size

    px = np.asarray(im, np.float32) / 255.0
    a = drop_islands(matte(im))
    a = clear_string_bed(a, px)

    # A hair of blur only. The model's edge is already tight, and over-feathering
    # a racket's frame thins it into a ghost.
    a = np.asarray(
        Image.fromarray((a * 255).astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(w * feather)
        ),
        np.float32,
    ) / 255.0

    # Grade toward the ground as alpha drops, so the semi-transparent edge
    # pixels — which still carry the old backdrop's colour — don't rim the
    # product in it.
    rgb = np.asarray(im, np.float32)
    mix = (1.0 - a[..., None]) * settle
    rgb = rgb * (1.0 - mix) + GROUND * mix

    out = Image.fromarray(
        np.dstack([rgb.astype(np.uint8), (a * 255).astype(np.uint8)]), "RGBA"
    )

    # Trim the fully transparent margin: screens stretch these into a fixed
    # box, so dead space around the product silently shrinks it.
    box = out.getchannel("A").point(lambda v: 255 if v > 4 else 0).getbbox()
    if box:
        out = out.crop(box)
    out.save(dst, optimize=True)
    return out.size


def main():
    os.makedirs(CUT, exist_ok=True)
    # `data/` may not exist on a fresh checkout — the manifest is the first
    # thing to land in it.
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    slugs = []

    for src in sorted(glob.glob(os.path.join(SRC, "*.jpg"))):
        slug = os.path.splitext(os.path.basename(src))[0]
        dst = os.path.join(CUT, f"{slug}.png")
        size = cutout(src, dst)
        print(f"cut   {slug:16s} -> {size[0]}x{size[1]}")
        slugs.append(slug)

    # The manifest is generated because React Native's `require` must be a
    # static literal — a new photo would otherwise need a hand-written import
    # before the app could see it.
    lines = [
        "// GENERATED by tools/make-art.py — do not edit by hand.",
        "// Re-run: .venv/bin/python tools/make-art.py",
        "",
        "export const images = {",
    ]
    lines += [f"  '{s}': require('../assets/img/cut/{s}.png')," for s in slugs]
    lines += [
        "} as const;",
        "",
        "export type ImageKey = keyof typeof images;",
        "",
    ]
    with open(MANIFEST, "w") as f:
        f.write("\n".join(lines))
    print(f"wrote {os.path.relpath(MANIFEST, ROOT)} with {len(slugs)} entries")


if __name__ == "__main__":
    main()
