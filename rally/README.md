# Rally

A badminton gear shop, built from three design comps in
`../.screenshots/2026-08-07-racket-shop/`. Expo SDK 57, expo-router, NativeWind 4.

Three screens: a home feed (search, voucher carousel, brand rail, product
grid), a hand-built animated drawer, and a product detail page. Favourites,
quantity and the cart are live for the session; there is no checkout.

## Running it

```bash
npm install
npm start          # Metro on port 8090
npm run ios        # or open the exp:// URL in Expo Go
```

**The port matters.** Sibling apps in this repo share Metro's default 8081, and
Expo Go caches projects keyed by dev-server URL — so a cached entry from one
app will request assets from whichever server currently holds the port,
surfacing as `ENOENT` on a path belonging to a different project. 8090 sits
outside the range Expo auto-increments into when 8081 is busy.

**Do not upgrade the pinned dependencies.** The local Expo Go build is patched
to a specific SDK 57 set; skew shows up as a silent bounce to the iOS home
screen at splash, with no JS error. Do not run `expo install --fix`.

## Adding a product photo

`data/images.ts` is generated — React Native's `require` must be a static
literal, so a new photo needs the manifest regenerated rather than a
hand-written import.

```bash
# 1. add a row to tools/photos.tsv:  slug <TAB> download-url <TAB> photo-page-url
tools/fetch-photos.sh

# 2. stop Metro first — it watches assets/ and will cache "Error: Empty file"
#    against a PNG it reads mid-write
python3 -m venv .venv && .venv/bin/pip install numpy pillow "rembg[cpu]"
.venv/bin/python tools/make-art.py

# 3. record the source in CREDITS.md
```

Photos must be free-licence Unsplash (not Unsplash+, which is a different
licence) and must not show a real manufacturer's wordmark — this app ships four
invented brands.

`tools/make-art.py` cuts each product out with a matting model rather than
colour keying, because keying was tried first and failed on anything but a
seamless backdrop. See the module docstring for what each correction pass is
there to fix.

## Icons

`tools/gen-icons.sh` draws the launcher icon, Android adaptive layers, splash
and favicon from one source mark, so they can't drift apart.

## Spec and plan

- `../docs/superpowers/specs/2026-08-07-rally-badminton-shop-design.md`
- `../docs/superpowers/plans/2026-08-07-rally-badminton-shop.md`
