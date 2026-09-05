# Foody order tracking — measured design spec

Measured off `docs/screenshots/widget-2/`, not eyeballed.

| Comp | Shows |
| --- | --- |
| `ref-01.png` | collapsed island — badge + `Foody`, `8 min` in mint |
| `ref-02.png` | same, plus a cyan ring hanging below the pill's centre |
| `ref-03.png` | expanded island, ~20% through the delivery |
| `ref-04.png` | expanded island, ~48% through |

`ref-03` and `ref-04` are the same layout at two moments: **the scooter rides the
progress bar**, sitting just behind the fill's leading edge as it advances.

The expanded island measures **371 x 174pt**, against a ~160pt ceiling — only about 8%
over, so unlike the delivery-tracking card this one nearly fits as drawn.

The cyan ring in `ref-02` sits outside the pill's bounds, centred under it. Nothing a
Live Activity can draw is allowed outside its presentation, so it is not reproduced.

## Colours (sampled)

| Token | Value | Used by |
| --- | --- | --- |
| surface | `#06161C` | card — a very dark teal, not black |
| chip | `#32373C` | badge and the two action buttons |
| track | `#323235` | unfilled part of the progress bar |
| mint | `#77FBDA` | bar fill, `7 min`, message glyph |
| cyan | `#69D6FB` | call glyph |
| primary | `#FFFFFF` | `Foody`, `25$`, `George K.` |
| secondary | `#B8C3CE` | `Pizza Napolitana`, `Will arrive in` |
| tertiary | `#C9D0DB` | `Cash` |

Note the two action glyphs are **different colours** — the call is cyan, the message mint.

## Geometry, in island points (371 x 174)

| Element | x | y | size |
| --- | --- | --- | --- |
| badge circle | 1.6 .. 45 | 21 .. 57 | ~44pt circle |
| `Foody` | 54.9 .. 84 | 26.8 .. 38.6 | cap 11.1 -> ~15pt bold |
| `Pizza Napolitana` | 54.9 .. 147 | 37.9 .. 53.6 | ~13pt |
| `25$` | ~325 .. 358 | 19.9 .. 36.6 | ~19pt bold |
| `Cash` | 318.4 .. 348.4 | 42.5 .. 51.0 | cap 8.8 -> ~12pt |
| scooter | 127.8 .. 166.4 | 67.3 .. 97.4 | 38.9 x 30.4 |
| progress bar | ~8 .. ~350 | 99.7 .. 106.9 | 342 x 7.5, capsule |
| bar fill (ref-04) | 8 .. 170.6 | | 47.5% |
| avatar | 1.0 .. 38 | 123.9 .. 160.5 | ~37pt circle |
| `George K.` | 59.8 .. 104 | 127.8 .. 139.2 | cap 11.8 -> ~16pt bold |
| `Will arrive in 7 min` | 60.8 .. ~200 | 144.5 .. 155.3 | ~15pt |
| call button | 269.0 .. 306.0 | 123.2 .. 159.8 | 37.3pt circle |
| message button | 313.1 .. 350.1 | 123.6 .. 160.2 | 37.3pt circle |

Vertical rhythm: 25.5 top row, gap 16, scooter, gap 2, bar, gap 17, driver row, 13 bottom.

## Substitutions

The comp's courier is a colour illustration and the avatar a photograph. Neither can be
drawn from SF Symbols, and putting real images in a widget needs them staged into the
shared app group — which needs `expo-file-system` and therefore a native rebuild. Until
then: `moped.fill` for the courier, `person.fill` for the avatar, and
`takeoutbag.and.cup.and.straw.fill` for the badge, which is close to the comp's
burger-and-drink mark. `courierAvatarUri` is already wired for the photo.

`7 min` is a string the app supplies rather than a live timer: SwiftUI's relative date
style renders "6 minutes, 59 seconds" and its timer style renders "6:59", neither of
which is what the comp draws.
