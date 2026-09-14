# Moodlift

A mood-first fitness app. The selected mood drives colour, copy, mascot and
workout ordering across every screen.

- **Spec:** `docs/superpowers/specs/2026-09-13-moodlift-design.md` (repo root)
- **Plan:** `docs/superpowers/plans/2026-09-14-moodlift.md` (repo root)
- **Comps:** `.design/comps/` — the visual contract. Each screen names the comp it matches.

## Expo has changed

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/
before writing any code. In particular, the root `Tabs` export from
`expo-router` is deprecated — this app uses the headless tabs from
`expo-router/ui`.

## Rules that came from real defects

- **Metro runs on port 8095.** Every npm script pins it. Expo Go caches
  project entries by port; sharing one makes it serve another app's assets.
- **Run tests as `npx jest -w 3`.** The default worker count oversubscribes
  this machine and fails passing tests.
- **No component hard-codes a foreground colour.** Text, icon and stroke
  colours are props. A colour baked in against an assumed surface is the bug
  that keeps coming back.
- **Every figure derives from `lib/activity.ts`.** Steps, calories, active
  minutes and goal progress are solved once per day from one series. Never
  type a number into a screen.
