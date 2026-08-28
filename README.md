# Mobile interactions

This is where I keep my React Native / Expo experiments — animations, transitions
and UI ideas I try out and share. Every folder is a standalone Expo app: its own
`package.json`, its own routes, its own design language. Nothing is shared
between them, so any one of them can be opened and run on its own.

Most of them start from a design comp and end at the interaction that comp
implies but can't show — the way a bar reacts to a scroll, the way a wordmark
lands, the way a card knows it has been picked up.

| Project | What it is |
| --- | --- |
| [halftone](halftone) | Creative marketplace and workspace. A floating glass tab bar that collapses to icons as you scroll down and reopens on the way up — and every avatar, tile and art card is generated at runtime by a halftone engine, so no photography ships with the app |
| [rally](rally) | Badminton gear shop — voucher carousel, brand rail, product grid, and a hand-built animated drawer |
| [sushi](sushi) | Three-screen ordering flow in washi paper, sumi-e ink and vermilion, down to a hand-cut ink sweep behind each dish |
| [glucose](glucose) | Glucose tracker with hand-drawn SVG charts — time-in-range grading and a prediction mode, every figure derived from one readings series |
| [trackit](trackit) | Parcel tracking — live tracking screen, shipping-cost calculator, and progress tracks that rock the ferry gently while it's still on its way |
| [travel app](travel%20app) | Destination cards you throw away with your thumb — a swipeable deck with depth, under a black pill tab bar |
| [aiagent/sora](aiagent/sora) | AI agent console. The headline lands word by word, then a voice screen transcribes one beat at a time around a breathing orb |
| [car/cars-proj](car/cars-proj) | Car showroom. An SVG loader whose line sweeps around a growing circle, then a car that drives in from off-screen and brakes to a stop |
| [food/chompo](food/chompo) | Burger brand splash whose wordmark letters jump into place like a wave |

## Running any of them

Every project runs the same way:

```bash
cd <project>
npm install
npx expo start
```

Then press `i` for the iOS simulator, `a` for Android, or scan the QR code with
Expo Go.



## Elsewhere

I post these as I build them — [x.com/YOUR_HANDLE](https://x.com/dan_code).

If something here is useful to you, a star is appreciated. Thank you.
