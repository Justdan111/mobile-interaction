# Rally

## Demo

<!-- Drop an .mp4 here — drag it into GitHub's editor and paste the link. -->

A badminton gear shop with a drawer built by hand rather than dropped in. Open
it and the whole shop slides right, scales down, rounds its corners and casts a
shadow, with a second translucent sheet peeking out from behind it. One value
between 0 and 1 drives every one of those transforms, so the button press and
the drag gesture can never fall out of step with each other.

Underneath: a voucher carousel, a brand rail, and a product grid where
favourites, quantity and the cart all stay live for the session. Product cut-outs
in `data/images.ts` are generated — regenerate them rather than editing by hand.

Expo 57, expo-router, Reanimated, NativeWind, react-native-svg.

## Run

```bash
npm install
npx expo start
```
