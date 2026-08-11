# Asset credits

## Photography

All product photography is from [Unsplash](https://unsplash.com) under the
[Unsplash License](https://unsplash.com/license) — free to use commercially, no
attribution required. Listed here anyway.

Every photo is a plain (non-Unsplash+) one. Unsplash+ images carry a different
licence and are deliberately excluded — several strong candidates were dropped
for that reason alone.

| File | Subject | Unsplash photo |
| --- | --- | --- |
| `racket-kinetic.jpg` | Orange racket and two shuttlecocks | [VRqmHMYMq1c](https://unsplash.com/photos/VRqmHMYMq1c) |
| `racket-arc.jpg` | Blue racket and shuttlecocks, pink ground | [kXkMYP4yo04](https://unsplash.com/photos/kXkMYP4yo04) |
| `racket-blade.jpg` | Shuttlecock resting on a red racket | [imHF66HA3VY](https://unsplash.com/photos/imHF66HA3VY) |
| `racket-storm.jpg` | Dark racket and shuttlecock in flight | [n7O4b0aia0o](https://unsplash.com/photos/n7O4b0aia0o) |
| `racket-drift.jpg` | Racket head, low key | [VMDUkeIy9bQ](https://unsplash.com/photos/VMDUkeIy9bQ) |
| `racket-pair.jpg` | Shuttlecock on a strung racket | [H3DPSERMnpk](https://unsplash.com/photos/H3DPSERMnpk) |
| `shuttle-tube.jpg` | Three shuttlecocks | [tqpggZ3BDOk](https://unsplash.com/photos/tqpggZ3BDOk) |
| `shuttle-feather.jpg` | Single shuttlecock in flight | [9-2h-tto1EA](https://unsplash.com/photos/9-2h-tto1EA) |
| `court-action.jpg` | Racket and shuttlecocks on a court | [U1zY8Dr0v30](https://unsplash.com/photos/U1zY8Dr0v30) |

Photos were chosen so that no real manufacturer's wordmark is sharply legible
on any product. Several otherwise-good candidates were rejected on that basis —
a squash racket carrying "Baumgärtner"/"CHALLENGE", a racket bag with
"SIDESPIN" across it, and rackets with visible Li-Ning and Yonex marks.

## Marks and icons

All brand marks (Volara, Kestrel, Ardent, Sable) and UI icons are original work
in `components/icons.tsx`. The brands are invented; any resemblance to a real
racket manufacturer is not intended.

## Background removal

`tools/make-art.py` cuts the products out using [rembg](https://github.com/danielgatis/rembg)
(U2Net), MIT licensed. It runs at build time only — no model or library ships
in the app bundle, just the resulting PNGs.
