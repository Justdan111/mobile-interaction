"""Turn every source photo in assets/img/ into what the app ships, and write
the manifest it imports.

Runs over `assets/img/*.jpg` with no per-photo settings:

- Slugs starting `intro-`, `topic-` or `sheet-` are subjects that sit on a
  coloured tile, so they are cut out with U2Net (rembg), edge-decontaminated
  so no backdrop colour rims them, trimmed to the subject, and written as
  transparent WebP to assets/art/ (a tenth the size of PNG with alpha).
- Everything else is a full-bleed photo: resized to 1200px on the long side
  and written as JPEG to assets/photos/.
- Each clip in assets/video/ gets a poster frame (needs ffmpeg) so a video
  tile shows its own first frame before playback starts.

The downloaded originals in assets/img/ are not committed;
tools/fetch-photos.sh fetches them from tools/photos.tsv.

Usage (Python 3.12 or 3.13; onnxruntime has no 3.14 wheels yet):
    python3.12 -m venv .venv && .venv/bin/pip install numpy pillow "rembg[cpu]"
    .venv/bin/python tools/make-art.py

Stop Metro first: it caches a half-written PNG as an empty file.
"""

import glob
import os
import subprocess

import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "img")
ART = os.path.join(ROOT, "assets", "art")
PHOTOS = os.path.join(ROOT, "assets", "photos")
VIDEO = os.path.join(ROOT, "assets", "video")
MANIFEST = os.path.join(ROOT, "lib", "media.ts")
CUTOUT_PREFIXES = ("intro-", "topic-", "sheet-")
CUT_WIDTH = 900
# Long-side cap for shipped cut-outs: tiles render near 150pt, so 560px is
# about 3x; the onboarding hero renders near 370pt.
CUT_MAX = {"intro-": 1000}
CUT_MAX_DEFAULT = 560
PHOTO_LONG_SIDE = 1200

_session = None


def matte(im):
    global _session
    from rembg import new_session, remove

    if _session is None:
        _session = new_session("u2net")
    cut = remove(im, session=_session, post_process_mask=True)
    return np.asarray(cut.convert("RGBA").getchannel("A"), np.float32) / 255.0


def keep_largest(alpha):
    """Keep only the region connected to the strongest pixel; drops specks."""
    solid = alpha > 0.5
    if not solid.any():
        return alpha
    h, w = solid.shape
    seen = np.zeros_like(solid)
    y0, x0 = np.unravel_index(np.argmax(alpha), alpha.shape)
    stack = [(y0, x0)]
    seen[y0, x0] = True
    while stack:
        y, x = stack.pop()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and solid[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                stack.append((ny, nx))
    grown = Image.fromarray((seen * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))
    return alpha * (np.asarray(grown, np.float32) / 255.0)


def decontaminate(rgb, alpha, radius):
    """Replace semi-transparent edge colour with the subject's own colour."""
    solid = (alpha > 0.95).astype(np.float32)
    blur = lambda a: np.asarray(
        Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius)),
        np.float32,
    )
    weight = blur(solid * 255) / 255.0
    inner = np.dstack([blur(rgb[..., c] * solid) for c in range(3)])
    inner = inner / np.maximum(weight[..., None], 1e-4)
    t = np.clip((0.95 - alpha) / 0.95, 0, 1)[..., None]
    return np.where((weight > 1e-3)[..., None], rgb * (1 - t) + inner * t, rgb)


def cutout(src, dst):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im = im.resize((CUT_WIDTH, round(im.height * CUT_WIDTH / im.width)), Image.LANCZOS)
    a = keep_largest(matte(im))
    a = np.asarray(
        Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)), np.float32
    ) / 255.0
    rgb = decontaminate(np.asarray(im, np.float32), a, radius=CUT_WIDTH * 0.01)
    out = Image.fromarray(
        np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), (a * 255).astype(np.uint8)]), "RGBA"
    )
    box = out.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    if box:
        out = out.crop(box)
    slug = os.path.splitext(os.path.basename(dst))[0]
    cap = next((v for k, v in CUT_MAX.items() if slug.startswith(k)), CUT_MAX_DEFAULT)
    out.thumbnail((cap, cap), Image.LANCZOS)
    out.save(dst, quality=88, method=6)
    return out.size


def photo(src, dst):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im.thumbnail((PHOTO_LONG_SIDE, PHOTO_LONG_SIDE), Image.LANCZOS)
    im.save(dst, quality=82, optimize=True, progressive=True)
    return im.size


def main():
    os.makedirs(ART, exist_ok=True)
    os.makedirs(PHOTOS, exist_ok=True)
    art, photos = [], []
    for src in sorted(glob.glob(os.path.join(SRC, "*.jpg"))):
        slug = os.path.splitext(os.path.basename(src))[0]
        if slug.startswith(CUTOUT_PREFIXES):
            w, h = cutout(src, os.path.join(ART, f"{slug}.webp"))
            art.append((slug, w, h))
            print(f"cut    {slug:22s} {w}x{h}")
        else:
            w, h = photo(src, os.path.join(PHOTOS, f"{slug}.jpg"))
            photos.append((slug, w, h))
            print(f"photo  {slug:22s} {w}x{h}")

    videos = []
    for clip in sorted(glob.glob(os.path.join(VIDEO, "*.mp4"))):
        slug = os.path.splitext(os.path.basename(clip))[0]
        poster = os.path.join(VIDEO, f"{slug}-poster.jpg")
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-ss", "0.4", "-i", clip, "-frames:v", "1", "-q:v", "4", poster],
            check=True,
        )
        w, h = Image.open(poster).size
        videos.append((slug, w, h))
        print(f"video  {slug:22s} {w}x{h}")

    # Generated because React Native's `require` must be a static literal.
    # Each entry carries its aspect ratio so layouts can size by one edge.
    def block(name, rows, folder, ext):
        lines = [f"export const {name} = {{"]
        lines += [
            f"  '{s}': {{ source: require('../assets/{folder}/{s}.{ext}'), aspect: {w / h:.4f} }},"
            for s, w, h in rows
        ]
        return lines + ["} as const;", ""]

    out = ["// GENERATED by tools/make-art.py — do not edit by hand.", ""]
    out += block("art", art, "art", "webp")
    out += block("photos", photos, "photos", "jpg")
    out += ["export const videos = {"]
    out += [
        f"  '{s}': {{ source: require('../assets/video/{s}.mp4'), poster: require('../assets/video/{s}-poster.jpg'), aspect: {w / h:.4f} }},"
        for s, w, h in videos
    ]
    out += ["} as const;", ""]
    out += [
        "export type ArtKey = keyof typeof art;",
        "export type PhotoKey = keyof typeof photos;",
        "export type VideoKey = keyof typeof videos;",
        "",
    ]
    with open(MANIFEST, "w") as f:
        f.write("\n".join(out))
    print(f"wrote lib/media.ts: {len(art)} cut-outs, {len(photos)} photos, {len(videos)} videos")


if __name__ == "__main__":
    main()
