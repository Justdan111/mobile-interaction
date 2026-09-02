# Widget Lab

A host app for iOS widgets and Live Activities built with `expo-widgets`, which
renders SwiftUI from `@expo/ui` components — no Swift in this repo, no custom
native code.

## What's here

**`DeliveryTrackingActivity`** — a Live Activity for a parcel in transit. A truck
badge, the vehicle plate and model, ETA and remaining distance across the top; a
From/To route with a yellow origin dot and a rule running down to the
destination; call and message actions beside the driver's name, reference ID and
photo along the bottom.

**It runs itself.** The trip is described by when it started and when it is due,
not by a minute count the app has to decrement, so SwiftUI ticks the ETA down
every second — on the Lock Screen, in the Dynamic Island, with the app suspended
or force-quit. The truck badge carries an indefinite SF Symbol pulse the system
also drives on its own. Start it and end it; nothing in between is required.

What the system cannot do is walk a dot along a path, so the route's position and
the remaining distance are pushed from the app while it is in the foreground.
That is what the **Auto-advance** button toggles — turn it off and the ETA keeps
counting regardless.

A trip runs for **ten seconds**, so a whole run can be watched start to finish:
the dot travels the rail from pickup to drop-off, the distance falls to zero and
the ETA lands on *Arrived*. `TRIP_MS` in `src/app/index.tsx` is the dial.

It supplies every presentation the system can ask for: the Lock Screen banner (the
full card), a cut-down `bannerSmall` for CarPlay and watchOS, the expanded Dynamic
Island split across leading/trailing/bottom, the collapsed pill (truck on one side,
ETA and a clock on the other), and the minimal glyph for when another activity
shares the island. When the system marks the content stale the ETA drops to the
secondary colour instead of continuing to read as live.

This is a Live Activity rather than a home screen widget because the reference
design is a Dynamic Island layout — `supportedFamilies` has no meaning here, and
compact/expanded presentations are not something a `systemSmall`/`Medium`/`Large`
widget can produce. Home screen widgets slot into the same project alongside it;
see `widgets/README.md`.

## Run

Widgets and Live Activities need a real development build. **Expo Go cannot run
them** — it has no widget extension to load them into.

```bash
npm install
eas build --profile development --platform ios
```

The `development` profile builds for the iOS **simulator**
(`distribution: internal`, `ios.simulator: true`, `developmentClient: true`).

The first build will offer to create an EAS project — pick the account you want it
under. Once it finishes:

```bash
# Install the build straight into a booted simulator.
eas build:run --platform ios --profile development

# Then start the dev server and press `i`.
npx expo start --dev-client
```

`eas build:run` downloads the artifact, unpacks the `.app` and installs it. To do
it by hand instead: download the `.tar.gz` from the build page, expand it, then
`xcrun simctl install booted <path>.app`.

### Trying it

Open the app, tap **Start trip**, then swipe up to the Home Screen. The activity
appears in the Dynamic Island — long-press it for the expanded layout — and on
the Lock Screen, and the ETA counts down on its own from there. **End trip**
dismisses it.

To prove it really is running without the app: start a trip, force-quit the app
from the app switcher, and watch the countdown keep going.

The card is sized to the Lock Screen's 160pt ceiling. Anything past that is cut
off rather than scaled down, so check `widgets/README.md` before adding rows.

Changing a layout only needs a JS reload. Adding a *home screen* widget changes the
native target and needs a fresh `eas build`.

## Checks

```bash
npm run typecheck      # tsc --noEmit
npm run check:widgets  # verifies widget layouts only reference what the extension provides
```

`check:widgets` guards a failure the type checker cannot see — see
`widgets/README.md` for what it catches and why it matters.

Expo 57, expo-router, expo-widgets, @expo/ui.
