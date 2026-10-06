# LO-FI player — measured design spec

Measured off `docs/screenshots/widget-3/`.

| Comp | Shows | Built as |
| --- | --- | --- |
| `ref-01-compact.png` | pill: LO-FI sticker, rimmed vinyl disc | `compactLeading` / `compactTrailing`, disc also `minimal` |
| `ref-02-wide.png` | wide strip: sticker cluster, centred title, disc | `bannerSmall` (CarPlay / watchOS) — iOS has no island presentation this shape |
| `ref-03-expanded.png` | cassette deck: shell, reels, stickers, bar, controls | Lock Screen `banner`, and the expanded island |

ref-03 is one canvas of **371 x 199pt**, against a ~160pt ceiling. The shell (top 140pt)
is drawn into the height each presentation leaves, positions scaled by width and height
separately, art by height (with a floor in the island), text at legible fixed sizes.

## Colours (sampled)

| Token | Value | Used by |
| --- | --- | --- |
| surface | `#1F1F1F` | island / card |
| shell | `#5A5A5A` (top `#7C7C7C`, bottom `#4C4C4C`) | cassette shell |
| window | `#1E1E1E` | the reel window |
| track | `#323232` | progress groove |
| orange | `#F4B64B` | progress fill, repeat when on |
| button / ring | `#212121` / `#434343` | rewind, forward |
| well / edge / glyph | `#1A1A1A` / `#080808` / `#5A5A5A` | play-pause capsule |
| glyph | `#E5E5E5` | rewind, forward glyphs |

## Geometry, in shell points (371 x 140; island top = shell top - 3)

| Element | Centre | Size |
| --- | --- | --- |
| window | x 100–358, y 6–106 | 258 x 100 |
| left reel (faded, under shell) | (106, 69) | vinyl 96, hub 56 |
| right reel (in window) | (269, 69) | vinyl 124, hub 56 |
| smiley | (186, 60) | 48 |
| headphones | (321, 55) | 56 x 60 |
| LO-FI | (43, 43) | 60 x 51 |
| title / artist | left x 21, just above the bar | 15 bold / 13 |
| bar | x 48–317, y 125.5 | 5pt capsule |

Controls row: centre y 170 of the island, 40pt buttons, 88 x 40 well, 6pt between them;
repeat and AirPlay centred in the space either side.

## Artwork

`tools/make-lofi-art.py` cuts the three stickers out of ref-03 with rembg (each sticker is
one row of its table; die-cut openings are flood-filled out from a seed point) and draws
the reel hub and vinyl procedurally, since the comp only shows them half covered. The hub
is separate from the vinyl so only it turns.

## Behaviour

- Progress is a `ProgressView` over the track's date range, so it advances with the app
  suspended. Paused, it holds `position`.
- The hubs turn only while the app is in front and pushing `reelAngle` (12° per 300ms:
  the hub repeats every 36°, so larger steps strobe).
- Controls are `Button target=…`; presses reach the app via `addUserInteractionListener`
  and `src/lofi/useLofiPlayer.ts` applies them. AirPlay is decorative: a Live Activity
  cannot present the route picker.
