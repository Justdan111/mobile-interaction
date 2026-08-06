# assets

`images/` is the canonical location — it matches Expo's default template layout and
is what `app.json` references. Regenerate the whole set with:

```sh
bash tools/gen-icons.sh
```

The generator draws the mark (a glucose trace with a crest node) from the palette in
`theme/colors.ts`, so the icons stay in sync with the app.

## Why the same PNGs also sit at the root of `assets/`

Expo Go caches recently-opened projects **keyed by dev-server URL** (`exp://…:8081`)
and re-fetches each cached project's icon from that URL. Several apps in this repo
share the default port 8081, so a cached entry belonging to a *sibling* app will ask
whichever server currently holds the port for that sibling's icon path.

Metro answers those with `readdir(dirname(path))`. If the directory doesn't exist it
throws `ENOENT: scandir …`, which shows up in the Glucose terminal naming files
Glucose never referenced. Sibling paths in this repo are:

| Sibling      | Path it requests               |
| ------------ | ------------------------------ |
| `travel app` | `./assets/images/icon.png`     |
| `trackit`    | `./assets/icon.png`            |

Keeping a copy at both levels means both resolve to a real file, so the noise is gone
regardless of which app grabbed the port. Both copies come from `tools/gen-icons.sh`
— edit the generator, never a PNG by hand.

The alternative fix is to pin a distinct `--port` per app in each `package.json`.
