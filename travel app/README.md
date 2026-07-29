# travel — TripGlide 🌍

A travel destination app built with [Expo](https://expo.dev), [expo-router](https://docs.expo.dev/router/introduction/), and [NativeWind](https://www.nativewind.dev) (Tailwind CSS for React Native), replicating the TripGlide home screen design.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

Then open it on an iOS simulator, Android emulator, or a device with [Expo Go](https://expo.dev/go).

## Features

- **Home screen** (`src/app/index.tsx`) — greeting header with avatar, search bar with filter button, region filter chips, and a snapping destination carousel with scale animation (Reanimated), blurred "See more" bar, ratings, and favorite hearts.
- **Custom floating tab bar** (`src/components/tab-bar.tsx`) — black pill navigation with an active-tab white circle, driven by expo-router's `Tabs` with a custom `tabBar`.
- **Styling** — NativeWind v4 (`tailwind.config.js`, `src/global.css`), theme colors `canvas`, `ink`, `muted`.

## Structure

```
src/
  app/            # expo-router routes (_layout defines the Tabs navigator)
  components/     # tab bar, destination carousel + card
  data/           # destination data (Unsplash imagery)
```
# travel-app
