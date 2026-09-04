# Delivery Tracking — measured design spec

Everything here is measured off the three comps in `docs/screenshots/`, not eyeballed.
Re-derive with the scripts in the commit history if a comp changes.

## Scale

| Comp | What it shows | Measured |
| --- | --- | --- |
| `ref-01.png` | Dynamic Island, collapsed, no ETA yet | pill 138 x 37pt, detached 34pt circle |
| `ref-02.png` | Dynamic Island, collapsed, with ETA | pill 241 x 37pt |
| `ref-03.png` | Dynamic Island, **expanded** (the camera cut-out is drawn in) | card 361 x 295pt |

`ref-03` is the expanded island, not the Lock Screen — the camera dot at the top gives it
away, and the top row is split around it exactly like `expandedLeading` / `expandedTrailing`.

## The one thing that cannot be reproduced

The card is **295pt tall at 361pt wide**. Every Live Activity presentation caps out around
**160pt**, and SwiftUI clips rather than scales. The comp is ~1.9x too tall.

About 132pt of those 295 are whitespace, so the compression comes out of the gaps first
and the type second. Colours, glyph weights, alignment and hierarchy are reproduced exactly.

## Colours (sampled, p90 == max, so these are the true values)

| Token | Value | Used by |
| --- | --- | --- |
| surface | `#000000` | card |
| badgeCircle | `#25272D` | truck badge |
| actionCircle | `#2D2D2F` | call / message buttons |
| primary | `#F1F1F1` | `RJ 4567`, `32 Min` |
| driverName | `#C8C8C8` | `Ajinder Batra` |
| secondary | `#63676C` | `Volvo max s23`, `5.2 km` |
| driverId | `#4E5457` | `ID - JSQRW01202` |
| address | `#5C5C5C` | both addresses |
| label | `#2A2C2E` | `From`, `To` — deliberately very low contrast |
| accent | `#FCEE58` | origin dot |
| rail | `#636A71` | route rule, 2.1pt wide |

Earlier builds used `#8E8E93` / `#9E9EA3` / `#6E6E73` throughout, which is why the card read
as far brighter and flatter than the comp.

## Glyphs — all outline, none filled

| Element | Symbol |
| --- | --- |
| truck badge (`ref-03`) | `box.truck` |
| truck in the pill (`ref-02`) | `box.truck.fill` |
| call | `phone.connection` |
| message | `ellipsis.bubble` |
| clock in the pill | `clock` |

## `ref-03` geometry, in card points (card = 361 x 295)

| Element | x | y | size |
| --- | --- | --- | --- |
| badge circle | 2.8 .. 58.6 | 1.8 .. 58.6 | 54pt circle |
| truck glyph | 20.6 .. 48.1 | 24.7 .. 43.7 | 27.8 x 19.3 |
| `RJ 4567` | 72.0 .. 129.1 | cap 11.6 | ~16pt bold |
| `Volvo max s23` | 71.0 .. 161.2 | cap 9.8 | ~13.5pt |
| `32 Min` | 293.1 .. 339.1 | cap 11.6 | ~16pt bold |
| `5.2 km` | 299.0 .. 339.1 | cap 9.8 | ~13.5pt |
| `From` | 53.0 .. 83.8 | 77.7 .. 87.2 | ~13.5pt |
| origin dot | 29.3 .. 38.8 | 91.5 .. 101.6 | 10pt circle |
| `234, P Florida Park` | 52.7 .. 183.6 | 98.0 .. 110.3 | ~15.5pt |
| rail rule | 33.2 .. 35.0 | 101 .. 153 | 2.1pt wide |
| `To` | 52.2 .. 66.1 | 146.3 .. 155.8 | ~13.5pt |
| `21, SG Street way` | 52.5 .. 178.4 | 166.4 .. 180.5 | ~15.5pt |
| call circle | 28.3 .. 63.5 | 230.6 .. 265.9 | 35.5pt circle |
| message circle | 90.8 .. 127.3 | 230.1 .. 266.6 | 36.5pt circle |
| `Ajinder Batra` | 173.6 .. 278.2 | 229.4 .. 244.0 | ~16pt bold |
| `ID - JSQRW01202` | 182.3 .. 277.9 | 253.5 .. 261.8 | ~11.8pt |
| avatar | 293.9 .. 328.9 | 230.6 .. 265.9 | 35pt circle |

The rail's origin dot sits level with the **address**, not with the `From` label, and the
rule stops beside `To`. There is no second dot and no vehicle on the rail.

## `ref-02` geometry, in pill points (pill = 241 x 37)

| Element | x | size |
| --- | --- | --- |
| grey capsule | 5.3 .. 124.8 | 119.5 x 28.5pt, vertically centred |
| truck glyph | 99.6 .. 118.2 | 18.6 x 13.3pt, ~6.6pt from the capsule's right edge |
| `32 Min` | 171.4 .. 203.1 | ~13pt semibold |
| clock circle | 213.2 .. 231.3 | 18pt circle, 7.6pt glyph |

The truck sits at the **right end** of the capsule. Read as a progress track, that is the
arrived state — which is how it is built: the capsule is the track and the truck rides it.
