# Halftone

## Demo

<!-- Drop an .mp4 here — drag it into GitHub's editor and paste the link. -->

A creative marketplace where the tab bar gets out of your way. Scroll down and
the floating glass pill collapses to icons; scroll back up and it opens again.
The shrink is two moves pretending to be one — the focused chip drops its label
while the bar simultaneously pulls inward from both sides, so it reads as a
single gesture instead of text disappearing from a bar that stayed put. A 6pt
dead zone keeps a resting finger from strobing it between sizes.

Nothing in the app is photographed. Every avatar, team tile and art card is a
halftone field generated from a seed at runtime, and the onboarding art turns
one slowly enough that the dots creep rather than spin. Swipe a chat to mute it
and the icon shakes, the phone taps back, and the row holds open long enough to
watch the icon settle before it closes itself.

Expo 57, expo-router, Reanimated, NativeWind, react-native-svg, Liquid Glass via
expo-glass-effect (with a blurred fallback).

## Run

```bash
npm install
npx expo start
```
