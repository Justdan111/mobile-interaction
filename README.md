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
| [moodlift](moodlift) | Mood-first fitness app. You say how you feel on a six-step wheel and the whole app reshapes around it — colour, mascot, copy and which workouts surface. Six hand-drawn SVG characters, one per mood, and a gym pass whose QR is a real encoding rather than a decorative grid |
| [widget](widget) | Host app for iOS widgets and Live Activities — SwiftUI rendered from `@expo/ui`, no Swift in the repo. A delivery activity that runs itself: the system ticks the ETA down on the Lock Screen and in the Dynamic Island with the app force-quit |
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
npm start
```

Then press `i` for the iOS simulator, `a` for Android, or scan the QR code with
Expo Go.

Use `npm start` rather than `npx expo start` — a project may pin its own Metro
port, and Expo Go caches projects by port, so two apps sharing one will serve
each other's assets.

Two exceptions to the above: **widget** builds iOS widgets and Live Activities,
so it needs a development build rather than Expo Go (`npx expo run:ios`, or an
EAS simulator build). **moodlift** runs its tests with `npx jest -w 3`.



## Elsewhere

I post these as I build them — https://x.com/dan_code.

If something here is useful to you, a star is appreciated. Thank you.