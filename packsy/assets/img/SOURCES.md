# Parcel photography

Source photos for `tools/make-art.py`, which cuts each one out with U2Net
(rembg) into `assets/art/<slug>.png` and regenerates `lib/art.ts`. To add one,
put a row in `tools/photos.tsv`, run `tools/fetch-photos.sh`, then re-run
`make-art.py`. The comps' boxes carry a retailer's printed branding; these are
deliberately plain cardboard.

All free Unsplash License (not Unsplash+).

| File | Unsplash photo |
|---|---|
| `parcel-hero.jpg` | https://unsplash.com/photos/shallow-focus-photo-of-brown-cardboard-box (photo-1577705998148-6da4f3963bc8) |
| `parcel-cube.jpg` | https://unsplash.com/photos/a-brown-box-with-a-white-background (photo-1656543802898-41c8c46683a7) |
