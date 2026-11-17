# Packsy

Parcel tracking app built from seven Dribbble-style comps: onboarding, Home,
Packages, package detail, New Shipment and Map. Settings has no comp and is
assembled from the other screens' parts.

- **Comps:** `.design/comps/` — the visual contract. Screens are named after them.
- **Spec:** `docs/superpowers/specs/2026-11-17-packsy-design.md` (repo root)

## Expo has changed

SDK 58. Read https://docs.expo.dev/versions/v58.0.0/ before writing code. The
root `Tabs` export from `expo-router` is deprecated — the tab bar uses headless
tabs from `expo-router/ui`. Gesture Handler is v3: use the hook API
(`usePanGesture`, `usePinchGesture`, `useSimultaneousGestures`), callbacks are
`onBegin / onActivate / onUpdate / onDeactivate / onFinalize`.

## Rules that came from real defects

- **Metro runs on port 8097.** Every npm script pins it.
- **Never pass a function to `style` on a Pressable.** NativeWind's interop
  drops it and the control renders unstyled (Get Started lost its white pill).
  Use `components/ui/Press.tsx` for a pressed state.
- **No hard-coded foreground on a shared component.** Icons take `color` and
  `surface` (the colour their cut-outs are drawn in) with no defaults.
- **Every date, status and progress stage comes from `lib/packages.ts`.** The
  comps disagree with themselves about F523HI487's arrival (Mar 30 vs Apr 01);
  the data has one ETA and every screen agrees.
- **The barcode is real Code 128**, checked bar-for-bar against python-barcode
  in `__tests__/code128.test.ts`.
- **Photos go through `tools/make-art.py`**, never placed raw. Needs Python 3.12
  or 3.13 for onnxruntime.
- **Run tests as `npx jest -w 3 --no-watchman`.** Reanimated 4.7's own Jest
  mock throws under jest-expo 58, so `test/reanimated-mock.js` replaces it.

## Checking screens in the simulator

Expo Go 58 ignores the path in `exp://…/--/<route>` deep links. Set a route in
`dev-route.ts` (e.g. `'/map'`) and fast refresh takes the app there. Commit it
as `null`.
