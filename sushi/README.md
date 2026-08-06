# Sushi

A three-screen sushi ordering app built from the supplied design comps — washi
paper, sumi-e ink and vermilion.

Expo SDK 57 · expo-router · NativeWind 4 · TypeScript.

```bash
npm install
npm run ios      # or: npm run android
```

## Screens

| Route | Screen |
| --- | --- |
| `/` | Onboarding — vertical wordmark over the ink landscape, hero plate, `Explore Menu` |
| `/menu` | `Explore Our Menu` — category rail, featured card, dish rows |
| `/dish/[id]` | Dish detail — kana column, ink sweep, quantity stepper, add to cart |

## Layout

```
app/                 routes (expo-router)
components/          shared UI; components/art holds the SVG pieces
data/menu.ts         categories, dishes, price formatting
data/images.ts       GENERATED — photo + cut-out lookup
theme/               colours and type scale
tools/make-art.py    cuts every photo, regenerates the ink bitmaps
assets/img/          photography; assets/img/cut holds the cut-outs
```

## Adding a dish photograph

```bash
cp my-photo.jpg assets/img/spider-roll.jpg
.venv/bin/python tools/make-art.py          # stop Metro first
```

The script feathers the new photo onto the washi, writes
`assets/img/cut/spider-roll.png`, and regenerates `data/images.ts` so both the
photo and its cut-out are importable. Then reference it by filename:

```ts
{ id: 'spider-roll', name: 'Spider Roll', photo: 'spider-roll', /* … */ }
```

`photo` is typed against the manifest, so a name that has no photograph on disk
is a compile error rather than a blank card.

## Notes for whoever picks this up

**The palette is sampled, not invented.** `#E6DFD1` paper, `#A8502E`
vermilion, `#0B0C09` night and `#12100A` ink were read off the comps. Changing
one of them changes the identity of the app; they are centralised in
`theme/colors.ts` for that reason.

**No raw photograph ever touches the paper screens.** A square-edged photo on
the washi reads as something pasted onto the page. `auto_cutout()` fixes that
in three moves, and all three are load-bearing: a soft falloff placed on the
dish, a noise-roughened edge so it ends like a wash, and a colour grade towards
the paper as the alpha drops. Skip the last one and a dark photo fades through
grey and leaves a bruise on the cream — the fade has to lose its colour as well
as its opacity.

The falloff is *placed*, not centred. `subject_box()` finds the dish from two
cheap cues — distance from the backdrop colour sampled at the frame border, and
local detail, since food is textured and studio backdrops are not — and centres
the ellipse on that. A fixed centred ellipse crops the subject off any photo
that isn't perfectly composed, which is most of them. No model is involved, so
there is nothing to install and nothing to keep in sync.

Use `cutoutOf(dish)` on the paper screens and `photoOf(dish)` on the dark menu,
where the full-bleed photo is correct.

**The ink is rendered, not drawn.** The mountain, the enso, the brush strokes
and the paper grain are procedural bitmaps produced from value noise. An
earlier pass drew the ridges as SVG paths and they read as paper cut-outs no
matter how the curves were shaped — what makes a wash look like ink is its
texture and falloff, not its outline. Re-run the script after editing it:

```bash
python3 -m venv .venv && .venv/bin/pip install numpy pillow
.venv/bin/python tools/make-art.py
```

Stop the Metro dev server first. Metro watches `assets/` and will read a PNG
mid-write, cache `Error: Empty file` against it, and serve that until it is
restarted with `--clear`.

**Dish titles break where the menu breaks them.** `titleLines()` in
`data/menu.ts` puts three-word names on two lines after the first word —
"Salmon / Aburi Nigiri". Natural wrapping put the break wherever the measured
width happened to fall, which moved between devices.

**The Nigiri tab carries the comp's line-up.** The second comp shows Dragon
Roll and Spicy Tuna Roll under `Nigiri`, so `data/menu.ts` files them there to
reproduce that screen exactly. They are maki. Move their `category` to `'maki'`
if you would rather the filter were literal — nothing else depends on it.

**Reanimated and worklets are pinned exactly** (`4.5.0` / `0.10.0`). These are
compiled into the Expo Go binary; a patch ahead of what the installed client
ships segfaults in `JSIWorkletsModuleProxy` on launch with no JS error.

See `CREDITS.md` for asset licensing.
