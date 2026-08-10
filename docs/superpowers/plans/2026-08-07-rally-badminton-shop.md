# Rally Badminton Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `rally/`, an Expo + NativeWind badminton gear shop matching the three comps in `.screenshots/2026-08-07-racket-shop/`, with working favourites, quantity and cart state behind them.

**Architecture:** A single expo-router stack under an `(shop)` group. The group layout is a hand-built drawer host: a teal panel is the base layer and the routed content sits above it in a Reanimated-transformed card driven by one shared progress value. All catalogue data is static TypeScript; product imagery is generated ahead of time by a Python cutout pipeline that emits a typed manifest, so `require` stays a static literal. Session state is one context + reducer at the root.

**Tech Stack:** Expo SDK 57, expo-router 57, React Native 0.86.2, NativeWind 4, Reanimated 4 + react-native-gesture-handler 2, react-native-svg, expo-image, Nunito via `@expo-google-fonts/nunito`. Python 3 + numpy + Pillow for the offline asset pipeline.

**Spec:** `docs/superpowers/specs/2026-08-07-rally-badminton-shop-design.md`

---

## Global Constraints

Every task's requirements implicitly include this section.

- **Working directory is `rally/`** at the repo root `/Users/danemmanuel/Documents/mobile interactions`. All relative paths in this plan are relative to `rally/` unless they start with `.screenshots/` or `docs/`.
- **Pin these versions exactly.** Expo Go on this machine is patched to a specific SDK 57 build; version skew presents as a silent bounce to the iOS home screen at splash, with no JS error. Do not run `expo install --fix`, do not upgrade, do not let `npm` resolve a newer major.

  | Package | Version |
  | --- | --- |
  | `expo` | `~57.0.11` |
  | `expo-router` | `~57.0.11` |
  | `expo-constants` | `~57.0.9` |
  | `expo-font` | `~57.0.1` |
  | `expo-haptics` | `~57.0.1` |
  | `expo-image` | `~57.0.2` |
  | `expo-linear-gradient` | `~57.0.1` |
  | `expo-linking` | `~57.0.5` |
  | `expo-splash-screen` | `~57.0.5` |
  | `expo-status-bar` | `~57.0.1` |
  | `react` / `react-dom` | `19.2.3` |
  | `react-native` | `0.86.2` |
  | `react-native-gesture-handler` | `~2.32.0` |
  | `react-native-reanimated` | `4.5.1` |
  | `react-native-worklets` | `0.10.1` |
  | `react-native-safe-area-context` | `~5.7.0` |
  | `react-native-screens` | `~4.26.0` |
  | `react-native-svg` | `15.15.4` |
  | `react-native-web` | `^0.21.2` |
  | `nativewind` | `^4.2.6` |
  | `babel-preset-expo` | `~57.0.0` |
  | `@expo-google-fonts/nunito` | `^0.4.1` |
  | `tailwindcss` (dev) | `^3.4.19` |
  | `typescript` (dev) | `~6.0.3` |
  | `@types/react` (dev) | `~19.2.2` |

- **Metro runs on port 8090.** `npm start` must resolve to `expo start --port 8090`. Expo Go caches recently-opened projects keyed by dev-server URL; siblings sharing 8081 make one app request assets from another app's server, surfacing as `ENOENT` on a path that belongs to a different project.
- **Expo 57 API surface must be checked against the versioned docs** at <https://docs.expo.dev/versions/v57.0.0/> before writing against it. Do not write router APIs from memory. The root `Tabs` export is deprecated — this app uses no tab navigator, but treat every other router import with the same suspicion.
- **Reanimated 4 needs no babel plugin.** `babel-preset-expo` handles worklets in SDK 57. Adding `react-native-reanimated/plugin` breaks the build.
- **Stop Metro before running `tools/make-art.py`.** Metro watches `assets/` and will read a PNG mid-write, then cache `Error: Empty file` against that path until the server restarts.
- **No real trademarks.** The comps show Li-Ning, Yonex, Wilson and Apacs. This app ships four invented brands — **Volara**, **Kestrel**, **Ardent**, **Sable** — and no product copy, asset name or identifier may reference a real racket manufacturer.
- **Palette**, sampled from the comps. `theme/colors.ts` and `tailwind.config.js` must agree; NativeWind classes cover most of the UI, and `colors.ts` covers what classes cannot reach (SVG fills, `LinearGradient` stops, status bar).

  | Name | Hex | Use |
  | --- | --- | --- |
  | `ground` | `#F1F1F1` | Page background |
  | `surface` | `#FFFFFF` | Cards, search field, chips, thumb rail |
  | `inset` | `#EAEAEA` | Image wells inside cards |
  | `teal` | `#2B5561` | Primary |
  | `tealDeep` | `#1E3D45` | Gradient end |
  | `tealTint` | `#E8EFF1` | Selected thumbnail fill |
  | `ember` | `#E8442C` | Badge dot, status dot, Volara mark |
  | `ink` | `#1A1A1A` | Headings, price pills |
  | `muted` | `#A0A0A0` | Placeholders, category, "See more" |
  | `dot` | `#D4D4D4` | Inactive page dots |
  | `star` | `#F5C518` | Rating star |

- **Radii:** 16 on cards, chips, search field, thumbnails; 20 on voucher banner and detail hero; 28 on the scaled content card behind the open drawer; fully round on heart buttons, stepper count and the Buy Now pill.
- **Fonts** register per weight, matching the `glucose` convention. The `nunito-` prefix keeps these clear of Tailwind's own font-weight utilities, which collide on `font-bold`:
  `font-nunito` → `Nunito_400Regular`, `font-nunito-semibold` → `Nunito_600SemiBold`, `font-nunito-bold` → `Nunito_700Bold`, `font-nunito-extrabold` → `Nunito_800ExtraBold`.
- **There is no test runner** and this plan does not add one. Every task's verification cycle is:
  1. `npx tsc --noEmit` from `rally/` — must be clean, zero errors.
  2. `npm start` — Metro must bundle with no red-box and no warnings about missing modules.
  3. Where the task changes something visible, capture a screenshot and compare against the relevant comp.

  Steps below name the exact command and the exact expected result each time.
- **Verifying interactive state:** synthetic taps do not work in this simulator setup. To verify a state-dependent visual, temporarily seed the reducer's initial state (a favourited product, a non-empty cart, thumbnail index 2), screenshot, then revert the seed before committing.
- **Commit after every task** with a conventional-commit subject. Never commit `node_modules/`, `.expo/`, or raw `assets/img/*.jpg` source photos larger than 2 MB.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `app/_layout.tsx` | Fonts, splash gate, `StoreProvider`, `GestureHandlerRootView`, root `Stack` |
| `app/(shop)/_layout.tsx` | Drawer host: teal panel base layer + Reanimated content card |
| `app/(shop)/index.tsx` | Home screen composition |
| `app/(shop)/product/[id].tsx` | Product detail composition |
| `app/(shop)/{cart,favourites,message,account,setting}.tsx` | Placeholder routes |
| `components/icons.tsx` | Every UI icon and brand mark, as SVG |
| `components/ui/Screen.tsx` | Safe-area page wrapper on `ground` |
| `components/ui/SectionHeader.tsx` | Section title + optional right-hand action |
| `components/ui/IconButton.tsx` | Circular/plain pressable with hit slop |
| `components/ui/PricePill.tsx` | Dark price chip |
| `components/ui/HeartButton.tsx` | White circular favourite toggle (presentational) |
| `components/ui/Stepper.tsx` | Quantity −/+ control |
| `components/ui/EmptyState.tsx` | Shared "nothing here yet" screen body |
| `components/home/SearchField.tsx` | Search input row |
| `components/home/VoucherCard.tsx` | One teal gradient voucher panel |
| `components/home/VoucherCarousel.tsx` | Paging list + page dots (the spec listed dots as their own file; they are four lines driven by this component's scroll index, so they stay here) |
| `components/home/CategoryRail.tsx` | Horizontal brand tiles |
| `components/home/ProductCard.tsx` | Grid cell |
| `components/home/ProductGrid.tsx` | Two-column layout of `ProductCard` |
| `components/drawer/DrawerHost.tsx` | Progress shared value, context, pan gesture, transforms |
| `components/drawer/DrawerPanel.tsx` | Teal panel contents |
| `components/drawer/DrawerItem.tsx` | One nav row with optional badge |
| `components/detail/HeroGallery.tsx` | Hero image well + thumbnail rail |
| `components/detail/MetaRow.tsx` | Rating · sold · stepper |
| `components/detail/PriceBar.tsx` | Total price + Buy Now |
| `data/brands.ts` | Four brands |
| `data/products.ts` | Catalogue |
| `data/vouchers.ts` | Four carousel panels |
| `data/images.ts` | **Generated** by `tools/make-art.py` — do not hand-edit |
| `state/store.tsx` | Context + reducer: favourites, cart |
| `theme/colors.ts` | Palette for non-className consumers |
| `tools/photos.tsv` | Source photo manifest (slug → Unsplash URL) |
| `tools/fetch-photos.sh` | Downloads from `photos.tsv` into `assets/img/` |
| `tools/make-art.py` | Backdrop-key cutout + `data/images.ts` emitter |
| `tools/gen-icons.sh` | App icon / splash / favicon generation |

---

## Task 1: Scaffold the app and prove the toolchain

Nothing renders until Expo, NativeWind, Nunito and the port pin all work together. This task ends with a blank teal-headed screen on the device, which is the smallest thing that proves all four.

**Files:**
- Create: `rally/package.json`, `rally/app.json`, `rally/babel.config.js`, `rally/metro.config.js`, `rally/tailwind.config.js`, `rally/global.css`, `rally/tsconfig.json`, `rally/nativewind-env.d.ts`, `rally/.gitignore`, `rally/AGENTS.md`, `rally/CLAUDE.md`, `rally/theme/colors.ts`, `rally/app/_layout.tsx`, `rally/app/(shop)/_layout.tsx`, `rally/app/(shop)/index.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `colors` (the object in `theme/colors.ts`, keys exactly as in Global Constraints); the `@/*` path alias resolving to `rally/*`; Metro on port 8090

- [ ] **Step 1: Create the project directory and `package.json`**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions"
mkdir -p rally/app/\(shop\)/product rally/components/ui rally/components/home \
         rally/components/drawer rally/components/detail rally/data \
         rally/state rally/theme rally/tools rally/assets/img
```

`rally/package.json`:

```json
{
  "name": "rally",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "dependencies": {
    "@expo-google-fonts/nunito": "^0.4.1",
    "babel-preset-expo": "~57.0.0",
    "expo": "~57.0.11",
    "expo-constants": "~57.0.9",
    "expo-font": "~57.0.1",
    "expo-haptics": "~57.0.1",
    "expo-image": "~57.0.2",
    "expo-linear-gradient": "~57.0.1",
    "expo-linking": "~57.0.5",
    "expo-router": "~57.0.11",
    "expo-splash-screen": "~57.0.5",
    "expo-status-bar": "~57.0.1",
    "nativewind": "^4.2.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.2",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-svg": "15.15.4",
    "react-native-web": "^0.21.2",
    "react-native-worklets": "0.10.1"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "tailwindcss": "^3.4.19",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start --port 8090",
    "android": "expo start --android --port 8090",
    "ios": "expo start --ios --port 8090",
    "web": "expo start --web --port 8090"
  },
  "private": true
}
```

- [ ] **Step 2: Write the build configuration**

`rally/.gitignore`:

```
node_modules/
.expo/
dist/
*.log
.DS_Store
```

`rally/babel.config.js` — note there is no Reanimated plugin; `babel-preset-expo` handles worklets in SDK 57 and adding the plugin breaks the build:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

`rally/metro.config.js`:

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

`rally/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`rally/tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", "nativewind-env.d.ts"]
}
```

`rally/nativewind-env.d.ts`:

```ts
/// <reference types="nativewind/types" />

declare module '*.css';
```

`rally/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Sampled from the comps. Keep in sync with theme/colors.ts.
        ground: '#F1F1F1',
        surface: '#FFFFFF',
        inset: '#EAEAEA',
        teal: { DEFAULT: '#2B5561', deep: '#1E3D45', tint: '#E8EFF1' },
        ember: '#E8442C',
        ink: '#1A1A1A',
        muted: '#A0A0A0',
        dot: '#D4D4D4',
        star: '#F5C518',
      },
      fontFamily: {
        // Nunito ships one family per weight, so each registers separately.
        // The `nunito-` prefix keeps these clear of Tailwind's font-weight
        // utilities, which would otherwise collide on `font-bold`.
        nunito: ['Nunito_400Regular'],
        'nunito-semibold': ['Nunito_600SemiBold'],
        'nunito-bold': ['Nunito_700Bold'],
        'nunito-extrabold': ['Nunito_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
```

`rally/app.json`:

```json
{
  "expo": {
    "name": "Rally",
    "slug": "rally",
    "scheme": "rally",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "backgroundColor": "#F1F1F1",
    "ios": { "supportsTablet": true },
    "android": { "predictiveBackGestureEnabled": false },
    "plugins": ["expo-router", "expo-font"]
  }
}
```

App icons and the splash plugin are deliberately absent here — Task 12 adds them once `tools/gen-icons.sh` exists. Expo falls back to a default icon until then, which is fine for dev.

`rally/AGENTS.md`:

```markdown
# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## This app

- Metro runs on port **8090** (`npm start`). Do not use 8081 or anything near it —
  sibling apps in this repo share it and Expo Go's cache is keyed by
  dev-server URL, so assets get served from the wrong project.
- Dependency versions are pinned to the SDK 57 set that the local Expo Go
  build is patched for. Skew shows up as a silent bounce to the home screen
  at splash, with no JS error. Do not upgrade or run `expo install --fix`.
- `data/images.ts` is generated by `tools/make-art.py`. Do not hand-edit it.
  Stop Metro before running the script — it watches `assets/` and will cache
  `Error: Empty file` against a PNG it reads mid-write.
```

`rally/CLAUDE.md`:

```markdown
@AGENTS.md
```

- [ ] **Step 3: Install dependencies**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npm install
```

Expected: completes with no `ERESOLVE` failure. If npm reports a peer conflict, resolve it by correcting a version to match the Global Constraints table — never by upgrading past it.

- [ ] **Step 4: Write the palette module**

`rally/theme/colors.ts`:

```ts
/**
 * The palette, in TS form, for the places NativeWind classes can't reach:
 * SVG fills and strokes, LinearGradient stops, status bar, navigation
 * background. Values are sampled from the comps in
 * `.screenshots/2026-08-07-racket-shop/`. Keep in sync with tailwind.config.js.
 */
export const colors = {
  ground: '#F1F1F1',
  surface: '#FFFFFF',
  inset: '#EAEAEA',

  // The banner and the drawer are the same teal, falling off toward `tealDeep`
  // down the panel — flat teal reads noticeably deader than the comps.
  teal: '#2B5561',
  tealDeep: '#1E3D45',
  tealTint: '#E8EFF1',

  ember: '#E8442C',
  ink: '#1A1A1A',
  muted: '#A0A0A0',
  dot: '#D4D4D4',
  star: '#F5C518',

  /** Inactive drawer rows. White at reduced opacity, not a mixed grey. */
  drawerIdle: 'rgba(255, 255, 255, 0.55)',
} as const;
```

- [ ] **Step 5: Write the root layout**

`rally/app/_layout.tsx`:

```tsx
import '../global.css';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  // Hold the splash rather than render a frame in the system font.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ground }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.ground },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 6: Write throwaway group layout and home stub**

These are replaced in Tasks 9 and 7. They exist now only so the toolchain has something to render.

`rally/app/(shop)/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function ShopLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ground },
      }}
    />
  );
}
```

`rally/app/(shop)/index.tsx`:

```tsx
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-ground">
      <StatusBar style="dark" />
      <Text className="font-nunito-extrabold text-3xl text-ink">Rally</Text>
      <Text className="mt-2 font-nunito text-base text-muted">
        Search your rackets
      </Text>
      <View className="mt-6 h-16 w-48 rounded-[20px] bg-teal" />
    </View>
  );
}
```

- [ ] **Step 7: Typecheck**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit
```

Expected: no output, exit 0. A `Cannot find module '@/theme/colors'` here means the `paths` alias in `tsconfig.json` is wrong.

- [ ] **Step 8: Boot Metro and confirm on device**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npm start
```

Expected: Metro prints `exp://<lan-ip>:8090`. Open that URL in Expo Go.

Expected on screen: `#F1F1F1` background, "Rally" in heavy rounded Nunito (not the system font — if the letterforms look like Helvetica, `useFonts` did not resolve), "Search your rackets" in grey below it, and a teal rounded rectangle. Screenshot it.

If the app bounces straight back to the Expo Go home screen with no error, that is SDK patch skew — read the newest `.ips` crash report in `~/Library/Logs/DiagnosticReports/` to confirm before changing anything.

- [ ] **Step 9: Commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions"
git add rally/
git commit -m "feat(rally): scaffold Expo 57 + NativeWind app on port 8090"
```

---

## Task 2: Icons and brand marks

Everything downstream imports from here, so it lands before any screen. All SVG, no icon font — the comps have specific stroke weights that a font cannot match.

**Files:**
- Create: `rally/components/icons.tsx`
- Create: `rally/app/(shop)/_sandbox.tsx` (temporary, deleted in Step 5)

**Interfaces:**
- Consumes: `colors` from Task 1
- Produces: `IconProps = { size?: number; color?: string; strokeWidth?: number }` and these components, all accepting `IconProps`:
  `MenuIcon`, `BellIcon`, `SearchIcon`, `HeartIcon`, `HeartFilledIcon`, `StarIcon`, `ChevronLeftIcon`, `ChevronUpIcon`, `MinusIcon`, `PlusIcon`, `CloseIcon`, `HomeIcon`, `CartIcon`, `MessageIcon`, `AccountIcon`, `SettingIcon`, `SignOutIcon`.
  Plus `SwooshUnderline({ width, color })` and `BrandMark({ brand, size, color, cut })` where `brand: BrandId = 'volara' | 'kestrel' | 'ardent' | 'sable'`. `cut` is the tile colour showing through the mark's negative space, defaulting to `colors.surface`; callers rendering a mark on a non-white tile must pass it.

- [ ] **Step 1: Write the icon module**

`rally/components/icons.tsx`:

```tsx
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export type BrandId = 'volara' | 'kestrel' | 'ardent' | 'sable';

/**
 * Every glyph is drawn in a 24x24 box and scaled by `size`, so stroke weights
 * stay visually consistent when icons sit next to each other at different
 * sizes. Outline icons take `strokeWidth`; solid ones ignore it.
 */
const BOX = 24;

function frame(size: number) {
  return { width: size, height: size, viewBox: `0 0 ${BOX} ${BOX}` };
}

export function MenuIcon({ size = 26, color = colors.ink, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M3 6.5h18M3 12h18M3 17.5h18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** The comp's bell carries an unread dot; `dot` colours it, `null` hides it. */
export function BellIcon({
  size = 26,
  color = colors.ink,
  strokeWidth = 2,
  dot = colors.ember,
}: IconProps & { dot?: string | null }) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M12 3.2a6 6 0 0 0-6 6v3.1L4.5 15.4a.8.8 0 0 0 .72 1.16h13.56a.8.8 0 0 0 .72-1.16L18 12.3V9.2a6 6 0 0 0-6-6Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9.7 19.2a2.5 2.5 0 0 0 4.6 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      {dot ? <Circle cx={17.6} cy={6.4} r={3.1} fill={dot} /> : null}
    </Svg>
  );
}

export function SearchIcon({ size = 22, color = colors.muted, strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Circle cx={10.6} cy={10.6} r={6.4} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="m15.4 15.4 4.3 4.3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const HEART =
  'M12 20.4S3.6 15.3 3.6 9.6a4.6 4.6 0 0 1 8.4-2.6 4.6 4.6 0 0 1 8.4 2.6c0 5.7-8.4 10.8-8.4 10.8Z';

export function HeartIcon({ size = 22, color = colors.ink, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path d={HEART} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function HeartFilledIcon({ size = 22, color = colors.ember }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path d={HEART} fill={color} />
    </Svg>
  );
}

export function StarIcon({ size = 16, color = colors.star }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="m12 3.1 2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 16.62l-5.3 2.79 1.01-5.9-4.29-4.18 5.93-.86L12 3.1Z"
        fill={color}
      />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 24, color = colors.teal, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M15 4.5 7.5 12l7.5 7.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronUpIcon({ size = 20, color = colors.muted, strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="m5 15 7-7 7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function MinusIcon({ size = 18, color = colors.surface, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path d="M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function PlusIcon({ size = 18, color = colors.surface, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CloseIcon({ size = 24, color = colors.surface, strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Solid — the drawer's active row uses the filled house in the comp. */
export function HomeIcon({ size = 24, color = colors.surface, strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M3.4 10.4 12 3.6l8.6 6.8v8.4a1.6 1.6 0 0 1-1.6 1.6h-3.6v-5.6h-6.8V20.4H5a1.6 1.6 0 0 1-1.6-1.6v-8.4Z"
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CartIcon({ size = 24, color = colors.surface, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M3 4.2h2.2l1.1 2m0 0 1.9 7.6h9.2l2.1-7.6H6.2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={9.4} cy={18.6} r={1.7} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Circle cx={16.6} cy={18.6} r={1.7} stroke={color} strokeWidth={strokeWidth} fill="none" />
    </Svg>
  );
}

export function MessageIcon({ size = 24, color = colors.surface, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M4 6.6a2.4 2.4 0 0 1 2.4-2.4h11.2A2.4 2.4 0 0 1 20 6.6v7.6a2.4 2.4 0 0 1-2.4 2.4H9.6L5.2 20v-3.4H6.4A2.4 2.4 0 0 1 4 14.2V6.6Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M8.4 9.2h7.2M8.4 12.4h4.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function AccountIcon({ size = 24, color = colors.surface, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Circle cx={12} cy={8} r={3.8} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M4.8 20.2c0-3.6 3.2-5.8 7.2-5.8s7.2 2.2 7.2 5.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function SettingIcon({ size = 24, color = colors.surface, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Circle cx={12} cy={12} r={3.2} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M12 2.8l1.5 2.1 2.5-.6 .6 2.5 2.1 1.5-1.2 2.3 1.2 2.3-2.1 1.5-.6 2.5-2.5-.6L12 21.2l-1.5-2.1-2.5.6-.6-2.5-2.1-1.5 1.2-2.3-1.2-2.3 2.1-1.5.6-2.5 2.5.6L12 2.8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function SignOutIcon({ size = 24, color = colors.surface, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M14.4 4.4H7.2A2.4 2.4 0 0 0 4.8 6.8v10.4a2.4 2.4 0 0 0 2.4 2.4h7.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M13.6 12h6.4m0 0-2.6-2.6M20 12l-2.6 2.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/**
 * The marker underline beneath "discount" in the voucher panel. Two strokes,
 * the second shorter and offset — a single clean curve reads as a rule rather
 * than something drawn by hand.
 */
export function SwooshUnderline({
  width = 150,
  color = colors.surface,
}: {
  width?: number;
  color?: string;
}) {
  const height = width * 0.13;
  return (
    <Svg width={width} height={height} viewBox="0 0 150 20">
      <Path
        d="M3 12.5C28 5.5 78 3 147 8"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M12 17.5C38 12.5 76 11 121 14.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.75}
        fill="none"
      />
    </Svg>
  );
}

/**
 * Brand marks for the four invented house brands. Each is a mark only — the
 * wordmark beside it is set in Nunito ExtraBold by `CategoryRail`, which is
 * how these would really be built and avoids fabricating letterform outlines.
 */
export function BrandMark({
  brand,
  size = 28,
  color = colors.ink,
}: {
  brand: BrandId;
  size?: number;
  color?: string;
}) {
  switch (brand) {
    case 'volara':
      // A swept quill — the hero brand's mark, always struck in ember.
      return (
        <Svg {...frame(size)}>
          <Path
            d="M2.6 15.8c5.4-6.2 11.6-9.4 18.8-9.9-1.4 5.6-6.2 9.6-13.4 11.2-2.2.5-4 .3-5.4-1.3Z"
            fill={color}
          />
          <Path d="M6.2 18.6c4.6-3.2 9.4-5.6 15.2-6.9" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'kestrel':
      // Two chevrons meeting — a bird seen head-on.
      return (
        <Svg {...frame(size)}>
          <Path d="M2 8.5 12 15 22 8.5" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M6 14.5 12 18.4l6-3.9" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'ardent':
      // A heavy apex, cut flat across the crossbar.
      return (
        <Svg {...frame(size)}>
          <Path d="M12 3.4 21.4 20.6h-4.6L12 11.2 7.2 20.6H2.6L12 3.4Z" fill={color} />
          <Path d="M7.6 15.4h8.8" stroke={colors.surface} strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      );
    case 'sable':
      // A compact S held in a rounded square.
      return (
        <Svg {...frame(size)}>
          <Rect x={2.4} y={2.4} width={19.2} height={19.2} rx={5.6} fill={color} />
          <Path
            d="M15.4 8.6c-1-1-2.2-1.4-3.6-1.4-2 0-3.4 1-3.4 2.4 0 3.2 7.2 1.6 7.2 5.4 0 1.8-1.8 3-4 3-1.6 0-3-.5-4-1.6"
            stroke={colors.surface}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      );
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit
```

Expected: clean. A `switch` that TypeScript says may return `undefined` means a `BrandId` case is missing — all four must be present with no `default`.

- [ ] **Step 3: Render every icon on a sandbox route**

`rally/app/(shop)/_sandbox.tsx` — a leading underscore keeps expo-router from routing it, so this is a scratch file rather than a real screen. Temporarily rename it to `sandbox.tsx` to view it, then rename back.

```tsx
import { ScrollView, View } from 'react-native';
import * as I from '@/components/icons';
import { colors } from '@/theme/colors';

export default function Sandbox() {
  return (
    <ScrollView contentContainerClassName="gap-6 p-6 pt-20" className="flex-1 bg-ground">
      <View className="flex-row flex-wrap gap-5">
        <I.MenuIcon />
        <I.BellIcon />
        <I.SearchIcon />
        <I.HeartIcon />
        <I.HeartFilledIcon />
        <I.StarIcon size={24} />
        <I.ChevronLeftIcon />
        <I.ChevronUpIcon />
      </View>
      <View className="flex-row flex-wrap gap-5 rounded-2xl bg-teal p-5">
        <I.MinusIcon size={24} />
        <I.PlusIcon size={24} />
        <I.CloseIcon />
        <I.HomeIcon />
        <I.CartIcon />
        <I.MessageIcon />
        <I.AccountIcon />
        <I.SettingIcon />
        <I.SignOutIcon />
      </View>
      <View className="rounded-2xl bg-teal p-5">
        <I.SwooshUnderline width={180} />
      </View>
      <View className="flex-row flex-wrap gap-6">
        <I.BrandMark brand="volara" size={36} color={colors.ember} />
        <I.BrandMark brand="kestrel" size={36} />
        <I.BrandMark brand="ardent" size={36} />
        <I.BrandMark brand="sable" size={36} />
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 4: Inspect on device**

Rename to `sandbox.tsx`, run `npm start`, open `rally/sandbox` in Expo Go, screenshot.

Expected: every glyph renders — no blank gaps, no clipped edges at the viewBox boundary. Stroke weights look even across the set. The swoosh reads as two hand-drawn marker strokes, not one clean rule. All four brand marks are legible at 36pt.

Compare the menu, bell and search glyphs against `.screenshots/2026-08-07-racket-shop/Screenshot 2026-08-07 at 09.51.06.png`; compare the drawer glyphs against `...09.51.34.png`. Adjust `strokeWidth` defaults if the comps read heavier or lighter.

- [ ] **Step 5: Remove the sandbox and commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally"
rm -f "app/(shop)/sandbox.tsx" "app/(shop)/_sandbox.tsx"
npx tsc --noEmit
cd .. && git add rally/ && git commit -m "feat(rally): SVG icon set and brand marks"
```

Expected: `tsc` clean after deletion.

---

## Task 3: UI primitives

Small presentational pieces shared by two or more screens. All of them are pure — none reads the store, so each can be dropped into any screen and reasoned about alone.

**Files:**
- Create: `rally/components/ui/Screen.tsx`, `SectionHeader.tsx`, `IconButton.tsx`, `PricePill.tsx`, `HeartButton.tsx`, `Stepper.tsx`, `EmptyState.tsx`

**Interfaces:**
- Consumes: icons from Task 2, `colors` from Task 1
- Produces:
  - `Screen({ children, className? })`
  - `SectionHeader({ title, actionLabel?, onAction? })`
  - `IconButton({ children, onPress, className?, accessibilityLabel })`
  - `PricePill({ price })` — `price: number`, renders `$120`
  - `HeartButton({ active, onPress, size? })` — presentational; caller owns state
  - `Stepper({ value, onChange, min? })` — `value: number`, `onChange: (next: number) => void`
  - `EmptyState({ title, message })`

- [ ] **Step 1: Write `Screen` and `SectionHeader`**

`rally/components/ui/Screen.tsx`:

```tsx
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * The page ground plus top inset. Bottom inset is deliberately not applied —
 * the detail screen's price bar needs to own it so the bar's fill runs into
 * the home indicator rather than stopping short of it.
 */
export function Screen({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={`flex-1 bg-ground ${className}`}
      style={{ paddingTop: insets.top }}
    >
      <StatusBar style="dark" />
      {children}
    </View>
  );
}
```

`rally/components/ui/SectionHeader.tsx`:

```tsx
import { Pressable, Text, View } from 'react-native';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-nunito-extrabold text-[22px] text-ink">{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text className="font-nunito text-[15px] text-muted">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
```

- [ ] **Step 2: Write `IconButton`, `PricePill` and `HeartButton`**

`rally/components/ui/IconButton.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

export function IconButton({
  children,
  onPress,
  className = '',
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
  /** For geometry a class can't carry — e.g. a circle sized by a prop. */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`items-center justify-center ${className}`}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
```

`rally/components/ui/PricePill.tsx`:

```tsx
import { Text, View } from 'react-native';

/** Whole dollars only — the comps show `$120`, never `$120.00`, on cards. */
export function PricePill({ price }: { price: number }) {
  return (
    <View className="rounded-[10px] bg-ink px-3 py-1.5">
      <Text className="font-nunito-bold text-[15px] text-surface">${price}</Text>
    </View>
  );
}
```

`rally/components/ui/HeartButton.tsx`:

```tsx
import { HeartFilledIcon, HeartIcon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';

/**
 * Presentational. The caller owns whether this product is favourited, which
 * keeps the button usable from the grid and the detail screen without either
 * of them reaching into the other's state.
 */
export function HeartButton({
  active,
  onPress,
  size = 34,
}: {
  active: boolean;
  onPress: () => void;
  size?: number;
}) {
  return (
    <IconButton
      onPress={onPress}
      accessibilityLabel={active ? 'Remove from favourites' : 'Add to favourites'}
      className="rounded-full bg-surface"
      // Circle geometry is a style rather than a class so one `size` prop
      // drives both the 34pt grid button and the 56pt detail button.
      style={{ width: size, height: size }}
    >
      {active ? (
        <HeartFilledIcon size={size * 0.55} />
      ) : (
        <HeartIcon size={size * 0.55} />
      )}
    </IconButton>
  );
}
```

`HeartButton` relies on `IconButton`'s `style` prop, which the version above
already accepts — `Stepper` in the next step needs it too.

- [ ] **Step 3: Write `Stepper` and `EmptyState`**

`rally/components/ui/Stepper.tsx`:

```tsx
import { Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MinusIcon, PlusIcon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';

export function Stepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
}) {
  const atMin = value <= min;

  function step(delta: number) {
    const next = Math.max(min, value + delta);
    if (next === value) return;
    Haptics.selectionAsync().catch(() => {});
    onChange(next);
  }

  return (
    <View className="flex-row items-center overflow-hidden rounded-[10px]">
      <IconButton
        onPress={() => step(-1)}
        accessibilityLabel="Decrease quantity"
        className="h-9 w-9 rounded-[10px] bg-teal"
        // Only override when there is something to override. Passing a
        // concrete `opacity: 1` here would sit last in IconButton's style
        // array and clobber its pressed-state 0.6, so the button would never
        // dim on press while the `+` beside it does.
        style={atMin ? { opacity: 0.4 } : undefined}
      >
        <MinusIcon />
      </IconButton>
      <Text className="w-10 text-center font-nunito-bold text-[17px] text-ink">
        {value}
      </Text>
      <IconButton
        onPress={() => step(1)}
        accessibilityLabel="Increase quantity"
        className="h-9 w-9 rounded-[10px] bg-teal"
      >
        <PlusIcon />
      </IconButton>
    </View>
  );
}
```

`rally/components/ui/EmptyState.tsx`:

```tsx
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeftIcon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';

/**
 * Shared body for the four drawer destinations that have no comp. They exist
 * so navigation never dead-ends, and they say so plainly rather than
 * pretending to be a designed screen.
 */
export function EmptyState({ title, message }: { title: string; message: string }) {
  const router = useRouter();
  return (
    <Screen>
      <View className="flex-row items-center px-5 py-3">
        <IconButton onPress={() => router.back()} accessibilityLabel="Go back">
          <ChevronLeftIcon />
        </IconButton>
        <Text className="flex-1 pr-6 text-center font-nunito-extrabold text-[20px] text-ink">
          {title}
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-10">
        <Text className="text-center font-nunito text-[15px] leading-6 text-muted">
          {message}
        </Text>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 4: Typecheck**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit
```

Expected: clean. If `HeartButton` errors on `style`, the `IconButton` edit in Step 2 was not applied.

- [ ] **Step 5: Commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions"
git add rally/ && git commit -m "feat(rally): shared UI primitives"
```

---

## Task 4: Photo pipeline

Product photography drives all three screens, and the pipeline has to keep working for photos added later — it is not a one-shot import.

The `sushi` app's cutout uses an elliptical falloff, which suits a plated dish. It is wrong here: a racket is long, thin and diagonal, and an ellipse would either crop the handle or swallow the frame. This pipeline keys on the backdrop colour instead, which is what actually separates a product shot from its studio background and preserves the racket's real silhouette.

**Files:**
- Create: `rally/tools/photos.tsv`, `rally/tools/fetch-photos.sh`, `rally/tools/make-art.py`, `rally/CREDITS.md`
- Generated: `rally/assets/img/*.jpg`, `rally/assets/img/cut/*.png`, `rally/data/images.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `data/images.ts` exporting `export const images = { '<slug>': require('...'), ... } as const;` and `export type ImageKey = keyof typeof images;`

- [ ] **Step 1: Source the photographs**

Do not invent Unsplash ids — fabricated ones 404. Find real ones now.

Search Unsplash for badminton product photography. Aim for **9 photos**: 5 rackets (varied colourways), 2 shuttlecock tubes or shuttles, 1 gear bag, 1 court/action shot for a voucher panel background.

Acceptance criteria per photo:
- A single product isolated on a plain, evenly lit background (white or light grey works best — the keying step needs backdrop and subject to differ clearly).
- At least 1200px on the long edge.
- Under the Unsplash License.

Record each as a row in `rally/tools/photos.tsv` — a tab-separated `slug`, `download URL`, `photo page URL`:

```
racket-kinetic	https://images.unsplash.com/photo-XXXXXXXXXXXXX?w=1600&q=80	https://unsplash.com/photos/XXXXXXXXXXXXX
```

Slugs to fill: `racket-kinetic`, `racket-arc`, `racket-blade`, `racket-storm`, `racket-drift`, `shuttle-tube`, `shuttle-feather`, `gear-bag`, `court-action`.

- [ ] **Step 2: Write the fetch script**

`rally/tools/fetch-photos.sh`:

```bash
#!/usr/bin/env bash
# Download every source photograph listed in tools/photos.tsv.
#
# Re-runnable: an already-downloaded file is skipped, so adding one row and
# re-running fetches only the new photo.
#
# Usage: tools/fetch-photos.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/img"
TSV="$ROOT/tools/photos.tsv"

mkdir -p "$OUT"

while IFS=$'\t' read -r slug url _page; do
  [ -z "${slug:-}" ] && continue
  case "$slug" in \#*) continue ;; esac

  dest="$OUT/$slug.jpg"
  if [ -f "$dest" ]; then
    echo "skip  $slug"
    continue
  fi

  echo "fetch $slug"
  curl -fsSL "$url" -o "$dest"

  # A 404 served as an HTML error page still exits 0 under some proxies, so
  # confirm we actually got a JPEG before letting it into the pipeline.
  if ! file "$dest" | grep -qi 'JPEG'; then
    echo "ERROR: $slug did not download as a JPEG" >&2
    rm -f "$dest"
    exit 1
  fi
done < "$TSV"

echo "done. $(ls -1 "$OUT"/*.jpg 2>/dev/null | wc -l | tr -d ' ') photos in assets/img/"
```

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally"
chmod +x tools/fetch-photos.sh && tools/fetch-photos.sh
```

Expected: every slug either `fetch`ed or `skip`ped, ending with `done. 9 photos in assets/img/`. Any `ERROR` line means that row's URL is wrong — fix the row, do not proceed.

- [ ] **Step 3: Write the cutout pipeline**

`rally/tools/make-art.py`:

```python
"""Cut every product photograph out of its studio background and write the
manifest the app imports.

Runs over `assets/img/*.jpg` automatically — drop a new photo in, re-run, done.

Why keying rather than the elliptical falloff the sushi app uses: a racket is
long, thin and usually diagonal in frame. An ellipse centred on the subject
either clips the handle or grows until it swallows the backdrop. Product shots
are lit against a plain ground, so distance from the sampled backdrop colour
separates subject from background far more faithfully, and keeps the real
silhouette — which is the whole point of the comps' cut-out look.

Usage:
    python3 -m venv .venv && .venv/bin/pip install numpy pillow
    .venv/bin/python tools/make-art.py

Stop the Metro dev server first: it watches `assets/` and will read a PNG
mid-write, then cache `Error: Empty file` against it until restarted.
"""

import glob
import os

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "img")
CUT = os.path.join(SRC, "cut")
MANIFEST = os.path.join(ROOT, "data", "images.ts")

# The page ground the cut-outs land on. Edge pixels are graded toward this, so
# a photo shot against pure white doesn't leave a bright halo on #F1F1F1.
GROUND = np.array([0xF1, 0xF1, 0xF1], np.float32)

WIDTH = 1000


def smoothstep(a, b, x):
    t = np.clip((x - a) / max(b - a, 1e-6), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def backdrop_colour(px):
    """Median of a border band, which is nearly always backdrop."""
    h, w, _ = px.shape
    band = max(4, min(h, w) // 20)
    edge = np.concatenate(
        [
            px[:band].reshape(-1, 3),
            px[-band:].reshape(-1, 3),
            px[:, :band].reshape(-1, 3),
            px[:, -band:].reshape(-1, 3),
        ]
    )
    return np.median(edge, axis=0)


def despeckle(alpha, radius=3):
    """Morphological open then close, to drop dust and fill pinholes.

    A racket's strings are a lattice of near-backdrop pixels, so keying alone
    leaves the head full of holes. Closing seals them; opening first removes
    the sensor noise that closing would otherwise inflate into blobs.
    """
    im = Image.fromarray((alpha * 255).astype(np.uint8))
    size = radius * 2 + 1
    im = im.filter(ImageFilter.MinFilter(size)).filter(ImageFilter.MaxFilter(size))
    im = im.filter(ImageFilter.MaxFilter(size)).filter(ImageFilter.MinFilter(size))
    return np.asarray(im, np.float32) / 255.0


def cutout(src, dst, feather=0.004, settle=0.85):
    """Key one photograph onto the ground and write a transparent PNG."""
    im = Image.open(src).convert("RGB")
    scale = WIDTH / im.width
    im = im.resize((WIDTH, max(1, round(im.height * scale))), Image.LANCZOS)
    w, h = im.size

    px = np.asarray(im, np.float32) / 255.0
    back = backdrop_colour(px)

    # Distance from the backdrop, normalised against its own spread so the
    # thresholds hold whether the ground is white, grey or faintly tinted.
    dist = np.sqrt(((px - back) ** 2).sum(axis=2) / 3.0)
    lo, hi = np.percentile(dist, 55), np.percentile(dist, 88)
    a = smoothstep(lo, max(hi, lo + 1e-3), dist)

    a = despeckle(a)
    a = np.asarray(
        Image.fromarray((a * 255).astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(w * feather)
        ),
        np.float32,
    ) / 255.0

    # Grade toward the ground as alpha drops. Without this, a white-backdrop
    # photo fades through white and rims the product in a bright halo.
    rgb = np.asarray(im, np.float32)
    mix = (1.0 - a[..., None]) * settle
    rgb = rgb * (1.0 - mix) + GROUND * mix

    out = Image.fromarray(
        np.dstack([rgb.astype(np.uint8), (a * 255).astype(np.uint8)]), "RGBA"
    )

    # Trim the fully transparent margin: screens stretch these into a fixed
    # box, so dead space around the product silently shrinks it.
    box = out.getchannel("A").point(lambda v: 255 if v > 4 else 0).getbbox()
    if box:
        out = out.crop(box)
    out.save(dst, optimize=True)
    return out.size


def main():
    os.makedirs(CUT, exist_ok=True)
    slugs = []

    for src in sorted(glob.glob(os.path.join(SRC, "*.jpg"))):
        slug = os.path.splitext(os.path.basename(src))[0]
        dst = os.path.join(CUT, f"{slug}.png")
        size = cutout(src, dst)
        print(f"cut   {slug:16s} -> {size[0]}x{size[1]}")
        slugs.append(slug)

    # The manifest is generated because React Native's `require` must be a
    # static literal — a new photo would otherwise need a hand-written import
    # before the app could see it.
    lines = [
        "// GENERATED by tools/make-art.py — do not edit by hand.",
        "// Re-run: .venv/bin/python tools/make-art.py",
        "",
        "export const images = {",
    ]
    lines += [f"  '{s}': require('../assets/img/cut/{s}.png')," for s in slugs]
    lines += [
        "} as const;",
        "",
        "export type ImageKey = keyof typeof images;",
        "",
    ]
    with open(MANIFEST, "w") as f:
        f.write("\n".join(lines))
    print(f"wrote {os.path.relpath(MANIFEST, ROOT)} with {len(slugs)} entries")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the pipeline**

Stop Metro first.

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally"
python3 -m venv .venv && .venv/bin/pip install --quiet numpy pillow
.venv/bin/python tools/make-art.py
```

Expected: one `cut` line per photo, then `wrote data/images.ts with 9 entries`.

Open two or three files in `assets/img/cut/` and check them: the product's silhouette is intact (handle not clipped, racket head not eaten), the background is transparent, and there is no bright rim. If a photo keys badly, the backdrop was too close to the product — replace that row in `photos.tsv` rather than tuning thresholds for one image.

Add `rally/.venv/` to `rally/.gitignore`.

- [ ] **Step 5: Write `CREDITS.md`**

`rally/CREDITS.md`:

```markdown
# Asset credits

## Photography

All product photography is from [Unsplash](https://unsplash.com) under the
[Unsplash License](https://unsplash.com/license) — free to use commercially, no
attribution required. Listed here anyway.

| File | Unsplash photo |
| --- | --- |

## Marks and icons

All brand marks (Volara, Kestrel, Ardent, Sable) and UI icons are original work
in `components/icons.tsx`. The brands are invented; any resemblance to a real
racket manufacturer is not intended.
```

Fill one table row per entry in `tools/photos.tsv`, linking the photo page URL
from column 3.

- [ ] **Step 6: Typecheck and commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit
cd .. && git add rally/ && git commit -m "feat(rally): photo cutout pipeline and image manifest"
```

Expected: `tsc` clean — `data/images.ts` must typecheck as generated, with no manual fixups.

---

## Task 5: Catalogue data

**Files:**
- Create: `rally/data/brands.ts`, `rally/data/products.ts`, `rally/data/vouchers.ts`

**Interfaces:**
- Consumes: `ImageKey` from `data/images.ts` (Task 4), `BrandId` from `components/icons.tsx` (Task 2)
- Produces:
  - `Brand = { id: BrandId; name: string }` and `brands: Brand[]`
  - `Product = { id: string; name: string; brand: BrandId; category: string; price: number; rating: number; sold: string; description: string; images: ImageKey[] }` and `products: Product[]`, plus `productById(id: string): Product | undefined`
  - `Voucher = { id: string; headline: string; emphasis: string; tail: string; brand: BrandId }` and `vouchers: Voucher[]`

- [ ] **Step 1: Write `brands.ts`**

```ts
import type { BrandId } from '@/components/icons';

export type Brand = {
  id: BrandId;
  name: string;
};

/**
 * Four invented house brands. The comps show real manufacturers' marks; these
 * stand in for them so the category rail keeps its logo-tile texture without
 * borrowing anyone's trademarks.
 */
export const brands: Brand[] = [
  { id: 'volara', name: 'VOLARA' },
  { id: 'kestrel', name: 'KESTREL' },
  { id: 'ardent', name: 'Ardent' },
  { id: 'sable', name: 'sable' },
];
```

- [ ] **Step 2: Write `products.ts`**

Image keys must match slugs produced in Task 4. Each product lists three, because the detail screen's thumbnail rail shows exactly three.

```ts
import type { BrandId } from '@/components/icons';
import type { ImageKey } from '@/data/images';

export type Product = {
  id: string;
  name: string;
  brand: BrandId;
  category: string;
  price: number;
  rating: number;
  /** Pre-formatted, e.g. "23K" — the comp shows an abbreviated count. */
  sold: string;
  description: string;
  /** Exactly three: the detail screen's thumbnail rail shows three. */
  images: ImageKey[];
};

export const products: Product[] = [
  {
    id: 'kinetic-17-le',
    name: 'Volara Kinetic 17 Limited Edition',
    brand: 'volara',
    category: 'Racket',
    price: 120,
    rating: 4.5,
    sold: '23K',
    description:
      'This racket has a light weight of 78 grams so it is very easy to swing, made of Grade Carbon Fiber with Dynamic-Optimum Frame technology.',
    images: ['racket-kinetic', 'racket-arc', 'racket-blade'],
  },
  {
    id: 'a90-state',
    name: 'Volara A+ 90 State',
    brand: 'volara',
    category: 'Shuttlecock',
    price: 80,
    rating: 4.7,
    sold: '18K',
    description:
      'Tournament-grade goose feather shuttles with a cork base, tube of twelve. Consistent flight at speed 77, tested to national standard.',
    images: ['shuttle-tube', 'shuttle-feather', 'racket-storm'],
  },
  {
    id: 'arc-sabre',
    name: 'Kestrel Arc Sabre 900',
    brand: 'kestrel',
    category: 'Racket',
    price: 165,
    rating: 4.8,
    sold: '9.4K',
    description:
      'A head-heavy frame built for the back court. Stiff shaft, 4U balance, strung at 26lb on the factory rig for immediate play.',
    images: ['racket-arc', 'racket-blade', 'racket-kinetic'],
  },
  {
    id: 'blade-x2',
    name: 'Ardent Blade X2',
    brand: 'ardent',
    category: 'Racket',
    price: 98,
    rating: 4.3,
    sold: '12K',
    description:
      'An even-balance all-rounder for club play. Forgiving through the sweet spot and quick enough at the net to hold its own in doubles.',
    images: ['racket-blade', 'racket-storm', 'racket-drift'],
  },
  {
    id: 'storm-lite',
    name: 'Sable Storm Lite 4U',
    brand: 'sable',
    category: 'Racket',
    price: 74,
    rating: 4.1,
    sold: '31K',
    description:
      'The lightest frame in the range at 72 grams, aimed at players moving up from a starter racket. Flexible shaft, generous string bed.',
    images: ['racket-storm', 'racket-drift', 'racket-arc'],
  },
  {
    id: 'drift-tour',
    name: 'Kestrel Drift Tour Bag',
    brand: 'kestrel',
    category: 'Gear Bag',
    price: 56,
    rating: 4.6,
    sold: '7.8K',
    description:
      'Six-racket thermal compartment with a vented shoe pocket and padded shoulder straps. Water-resistant shell, taped seams.',
    images: ['gear-bag', 'racket-drift', 'court-action'],
  },
];

export function productById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
```

- [ ] **Step 3: Write `vouchers.ts`**

The headline breaks across two lines with the swoosh under one word, so the copy is split into the parts the card lays out rather than one string.

```ts
import type { BrandId } from '@/components/icons';

export type Voucher = {
  id: string;
  /** First line, e.g. "Get voucher". */
  headline: string;
  /** The swoosh-underlined word opening the second line, e.g. "discount". */
  emphasis: string;
  /** Remainder of the second line, e.g. "up to 50%". */
  tail: string;
  brand: BrandId;
};

export const vouchers: Voucher[] = [
  { id: 'v1', headline: 'Get voucher', emphasis: 'discount', tail: 'up to 50%', brand: 'volara' },
  { id: 'v2', headline: 'Free stringing', emphasis: 'on every', tail: 'frame this week', brand: 'kestrel' },
  { id: 'v3', headline: 'Bundle a tube', emphasis: 'and save', tail: 'a further 15%', brand: 'ardent' },
  { id: 'v4', headline: 'New season', emphasis: 'gear bags', tail: 'now landed', brand: 'sable' },
];
```

- [ ] **Step 4: Typecheck and commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit
```

Expected: clean. An error on an `images` entry means a slug does not exist in the generated manifest — fix the product, not `data/images.ts`.

```bash
cd .. && git add rally/ && git commit -m "feat(rally): catalogue, brand and voucher data"
```

---

## Task 6: Session store

**Files:**
- Create: `rally/state/store.tsx`
- Modify: `rally/app/_layout.tsx` (wrap the `Stack` in `StoreProvider`)

**Interfaces:**
- Consumes: nothing
- Produces: `StoreProvider({ children })` and `useStore()` returning
  `{ favourites: Set<string>; cart: CartLine[]; cartCount: number; isFavourite(id: string): boolean; toggleFavourite(id: string): void; addToCart(id: string, qty: number): void; reset(): void }`
  where `CartLine = { id: string; qty: number }`

- [ ] **Step 1: Write the store**

`rally/state/store.tsx`:

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

export type CartLine = { id: string; qty: number };

type State = {
  favourites: Set<string>;
  cart: CartLine[];
};

type Action =
  | { type: 'toggleFavourite'; id: string }
  | { type: 'addToCart'; id: string; qty: number }
  | { type: 'reset' };

const initial: State = { favourites: new Set(), cart: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggleFavourite': {
      // A fresh Set each time — mutating in place would keep the same
      // reference and React would skip the re-render.
      const favourites = new Set(state.favourites);
      if (favourites.has(action.id)) favourites.delete(action.id);
      else favourites.add(action.id);
      return { ...state, favourites };
    }
    case 'addToCart': {
      const existing = state.cart.find((line) => line.id === action.id);
      const cart = existing
        ? state.cart.map((line) =>
            line.id === action.id ? { ...line, qty: line.qty + action.qty } : line,
          )
        : [...state.cart, { id: action.id, qty: action.qty }];
      return { ...state, cart };
    }
    case 'reset':
      return { favourites: new Set(), cart: [] };
  }
}

type Store = {
  favourites: Set<string>;
  cart: CartLine[];
  cartCount: number;
  isFavourite: (id: string) => boolean;
  toggleFavourite: (id: string) => void;
  addToCart: (id: string, qty: number) => void;
  reset: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const isFavourite = useCallback(
    (id: string) => state.favourites.has(id),
    [state.favourites],
  );

  const value = useMemo<Store>(
    () => ({
      favourites: state.favourites,
      cart: state.cart,
      cartCount: state.cart.reduce((sum, line) => sum + line.qty, 0),
      isFavourite,
      toggleFavourite: (id) => dispatch({ type: 'toggleFavourite', id }),
      addToCart: (id, qty) => dispatch({ type: 'addToCart', id, qty }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state.favourites, state.cart, isFavourite],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}
```

- [ ] **Step 2: Wire the provider into the root layout**

In `rally/app/_layout.tsx`, add `import { StoreProvider } from '@/state/store';` and wrap the `Stack`:

```tsx
<SafeAreaProvider>
  <StoreProvider>
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ground },
      }}
    />
  </StoreProvider>
</SafeAreaProvider>
```

- [ ] **Step 3: Typecheck and commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit
cd .. && git add rally/ && git commit -m "feat(rally): favourites and cart session store"
```

Expected: clean.

---

## Task 7: Home — header, search, voucher carousel

Half of Home. The grid arrives in Task 8; this task ends with a screen whose top half already matches the comp.

**Files:**
- Create: `rally/components/home/SearchField.tsx`, `rally/components/home/VoucherCard.tsx`, `rally/components/home/VoucherCarousel.tsx`
- Modify: `rally/app/(shop)/index.tsx` (replace the Task 1 stub)

**Interfaces:**
- Consumes: `vouchers` (Task 5), icons (Task 2), `Screen`, `IconButton` (Task 3)
- Produces:
  - `SearchField({ value, onChangeText })`
  - `VoucherCard({ voucher, width })`
  - `VoucherCarousel()` — self-contained, reads `vouchers` itself

- [ ] **Step 1: Write `SearchField`**

`rally/components/home/SearchField.tsx`:

```tsx
import { TextInput, View } from 'react-native';
import { SearchIcon } from '@/components/icons';
import { colors } from '@/theme/colors';

/**
 * Holds text and nothing more — filtering is out of scope, and a search box
 * that silently does nothing is better than one that half-works.
 */
export function SearchField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (next: string) => void;
}) {
  return (
    <View className="h-14 flex-row items-center rounded-2xl bg-surface px-4">
      <SearchIcon size={22} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search your rackets"
        placeholderTextColor={colors.muted}
        className="ml-3 flex-1 font-nunito text-[16px] text-ink"
        returnKeyType="search"
      />
    </View>
  );
}
```

- [ ] **Step 2: Write `VoucherCard`**

`rally/components/home/VoucherCard.tsx`:

```tsx
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandMark, SwooshUnderline } from '@/components/icons';
import type { Voucher } from '@/data/vouchers';
import { colors } from '@/theme/colors';

export function VoucherCard({ voucher, width }: { voucher: Voucher; width: number }) {
  return (
    <LinearGradient
      colors={[colors.teal, colors.tealDeep]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      // `flex: 1` because the carousel wraps this in a fixed-aspect box —
      // a fixed height here would fight that and letterbox the gradient.
      style={{ width, borderRadius: 20, flex: 1 }}
      className="overflow-hidden px-6 py-7"
    >
      <View className="absolute right-6 top-6">
        <BrandMark brand={voucher.brand} size={42} color={colors.ember} />
      </View>

      <View className="flex-1 justify-center">
        <Text className="font-nunito-extrabold text-[26px] leading-9 text-surface">
          {voucher.headline}
        </Text>
        <View className="flex-row items-baseline">
          {/* The swoosh hangs under `emphasis` only, so it sits in its own
              zero-height layer rather than pushing the tail line down. */}
          <View>
            <Text className="font-nunito-extrabold text-[26px] leading-9 text-surface">
              {voucher.emphasis}
            </Text>
            <View className="absolute -bottom-2 left-0">
              <SwooshUnderline width={voucher.emphasis.length * 13} />
            </View>
          </View>
          <Text className="font-nunito-extrabold text-[26px] leading-9 text-surface">
            {' '}
            {voucher.tail}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
```

- [ ] **Step 3: Write `VoucherCarousel`**

`rally/components/home/VoucherCarousel.tsx`:

```tsx
import { useState } from 'react';
import {
  FlatList,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { VoucherCard } from '@/components/home/VoucherCard';
import { vouchers } from '@/data/vouchers';

const PAGE_PADDING = 20;

export function VoucherCarousel() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const cardWidth = width - PAGE_PADDING * 2;

  function onMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  return (
    <View>
      <FlatList
        data={vouchers}
        keyExtractor={(v) => v.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        // Each row is a full screen width with the card inset inside it, so
        // `pagingEnabled` lands cleanly without snap offsets to maintain.
        renderItem={({ item }) => (
          <View style={{ width }} className="px-5">
            <View style={{ aspectRatio: 2.05 }}>
              <VoucherCard voucher={item} width={cardWidth} />
            </View>
          </View>
        )}
      />

      <View className="mt-4 flex-row items-center justify-center gap-2">
        {vouchers.map((v, i) => (
          <View
            key={v.id}
            className={
              i === index ? 'h-2 w-2 rounded-full bg-teal' : 'h-2 w-2 rounded-full bg-dot'
            }
          />
        ))}
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Rewrite Home**

`rally/app/(shop)/index.tsx`:

```tsx
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BellIcon, MenuIcon } from '@/components/icons';
import { SearchField } from '@/components/home/SearchField';
import { VoucherCarousel } from '@/components/home/VoucherCarousel';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';

export default function Home() {
  const [query, setQuery] = useState('');

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <View className="flex-row items-center justify-between px-5 pb-6 pt-4">
          {/* Wired to the drawer in Task 9. */}
          <IconButton onPress={() => {}} accessibilityLabel="Open menu">
            <MenuIcon />
          </IconButton>
          <IconButton onPress={() => {}} accessibilityLabel="Notifications">
            <BellIcon />
          </IconButton>
        </View>

        <View className="px-5">
          <SearchField value={query} onChangeText={setQuery} />
        </View>

        <View className="mt-6">
          <VoucherCarousel />
        </View>
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 5: Typecheck, run, compare**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit && npm start
```

Expected: clean typecheck, Metro bundles. Open in Expo Go and screenshot.

Compare the top half against `.screenshots/2026-08-07-racket-shop/Screenshot 2026-08-07 at 09.51.06.png`. Check specifically: header icon sizes and their distance from the top; search field height and corner radius; banner aspect ratio and radius; headline size, weight and line spacing; the swoosh sitting under `discount` without colliding with the descender; four dots with only the first teal. Swipe the carousel — the active dot must follow.

- [ ] **Step 6: Commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions"
git add rally/ && git commit -m "feat(rally): home header, search and voucher carousel"
```

---

## Task 8: Home — categories and product grid

**Files:**
- Create: `rally/components/home/CategoryRail.tsx`, `rally/components/home/ProductCard.tsx`, `rally/components/home/ProductGrid.tsx`
- Modify: `rally/app/(shop)/index.tsx`

**Interfaces:**
- Consumes: `brands`, `products` (Task 5), `images` (Task 4), `BrandMark` (Task 2), `SectionHeader`, `PricePill`, `HeartButton` (Task 3), `useStore` (Task 6)
- Produces:
  - `CategoryRail({ selected, onSelect })` — `selected: BrandId`, `onSelect: (id: BrandId) => void`. Must pass `BrandMark`'s `cut` prop (added in Task 2): the teal tile needs `cut={colors.teal}`, or Ardent's crossbar and Sable's letterform render white-on-white and vanish.
  - `ProductCard({ product })` — reads the store itself for favourite state, navigates on press
  - `ProductGrid({ products })`

- [ ] **Step 1: Write `CategoryRail`**

`rally/components/home/CategoryRail.tsx`:

```tsx
import { Pressable, ScrollView, Text } from 'react-native';
import { BrandMark, type BrandId } from '@/components/icons';
import { brands } from '@/data/brands';
import { colors } from '@/theme/colors';

/**
 * Selection is a visual affordance only — it reorders nothing. The comp shows
 * one tile filled teal, so the state exists to reproduce that.
 */
export function CategoryRail({
  selected,
  onSelect,
}: {
  selected: BrandId;
  onSelect: (id: BrandId) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Bleeds to the right edge so the next tile is partly visible.
      contentContainerClassName="gap-3 pl-5 pr-5"
    >
      {brands.map((brand) => {
        const active = brand.id === selected;
        const ink = active ? colors.surface : colors.ink;
        return (
          <Pressable
            key={brand.id}
            onPress={() => onSelect(brand.id)}
            accessibilityRole="button"
            accessibilityLabel={brand.name}
            className={`h-[88px] w-[118px] items-center justify-center gap-1.5 rounded-2xl ${
              active ? 'bg-teal' : 'bg-surface'
            }`}
          >
            <BrandMark
              brand={brand.id}
              size={26}
              color={brand.id === 'volara' && !active ? colors.ember : ink}
              // `cut` is the tile colour showing through the negative space in
              // Ardent's crossbar and Sable's letterform. Omit it on the teal
              // tile and both details render white-on-white and disappear.
              cut={active ? colors.teal : colors.surface}
            />
            <Text
              className="font-nunito-extrabold text-[13px]"
              style={{ color: ink, letterSpacing: 0.5 }}
            >
              {brand.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
```

- [ ] **Step 2: Write `ProductCard`**

`rally/components/home/ProductCard.tsx`:

```tsx
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { images } from '@/data/images';
import type { Product } from '@/data/products';
import { HeartButton } from '@/components/ui/HeartButton';
import { PricePill } from '@/components/ui/PricePill';
import { useStore } from '@/state/store';

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { isFavourite, toggleFavourite } = useStore();

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      className="flex-1 overflow-hidden rounded-2xl bg-surface"
    >
      <View className="aspect-square bg-inset">
        <Image
          source={images[product.images[0]]}
          contentFit="contain"
          style={{ flex: 1, margin: 12 }}
          // A failed decode leaves the inset well visible rather than
          // collapsing the card's height.
          transition={150}
        />
        <View className="absolute right-3 top-3">
          <PricePill price={product.price} />
        </View>
        <View className="absolute bottom-3 right-3">
          <HeartButton
            active={isFavourite(product.id)}
            onPress={() => toggleFavourite(product.id)}
            size={34}
          />
        </View>
      </View>

      <View className="gap-1 px-3.5 py-3">
        <Text numberOfLines={1} className="font-nunito-bold text-[15px] text-ink">
          {product.name}
        </Text>
        <Text className="font-nunito text-[13px] text-muted">{product.category}</Text>
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 3: Write `ProductGrid`**

`rally/components/home/ProductGrid.tsx`:

```tsx
import { View } from 'react-native';
import { ProductCard } from '@/components/home/ProductCard';
import type { Product } from '@/data/products';

/**
 * A plain wrapping row rather than a FlatList: the grid lives inside Home's
 * ScrollView, and nesting a vertical FlatList in a vertical ScrollView
 * disables virtualisation anyway while adding a warning.
 */
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <View className="flex-row flex-wrap gap-3 px-5">
      {products.map((product) => (
        <View key={product.id} className="w-[47.5%] grow">
          <ProductCard product={product} />
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 4: Compose into Home**

Add to `rally/app/(shop)/index.tsx` — new imports and the two sections below the carousel:

```tsx
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BellIcon, MenuIcon, type BrandId } from '@/components/icons';
import { CategoryRail } from '@/components/home/CategoryRail';
import { ProductGrid } from '@/components/home/ProductGrid';
import { SearchField } from '@/components/home/SearchField';
import { VoucherCarousel } from '@/components/home/VoucherCarousel';
import { products } from '@/data/products';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function Home() {
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState<BrandId>('volara');

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <View className="flex-row items-center justify-between px-5 pb-6 pt-4">
          <IconButton onPress={() => {}} accessibilityLabel="Open menu">
            <MenuIcon />
          </IconButton>
          <IconButton onPress={() => {}} accessibilityLabel="Notifications">
            <BellIcon />
          </IconButton>
        </View>

        <View className="px-5">
          <SearchField value={query} onChangeText={setQuery} />
        </View>

        <View className="mt-6">
          <VoucherCarousel />
        </View>

        <View className="mt-7 px-5">
          <SectionHeader title="Categories" />
        </View>
        <View className="mt-4">
          <CategoryRail selected={brand} onSelect={setBrand} />
        </View>

        <View className="mt-7 px-5">
          <SectionHeader title="Popular Product" actionLabel="See more" />
        </View>
        <View className="mt-4">
          <ProductGrid products={products} />
        </View>
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 5: Typecheck, run, compare**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit && npm start
```

Expected: clean, bundles, and Home now scrolls through all four sections.

Compare against `Screenshot 2026-08-07 at 09.51.06.png`. Check: the Volara tile is teal with a white mark while the other three are white; the rail bleeds off the right edge; grid cards are square-ish with the product contained, not cropped; price pill and heart sit at the correct corners; product names are one line and truncate rather than wrap.

Tap a heart — it fills ember and stays filled while scrolling. Tap a card — it navigates to `/product/<id>`, which is still a 404 until Task 10; confirm the URL is right, then go back.

- [ ] **Step 6: Commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions"
git add rally/ && git commit -m "feat(rally): category rail and popular product grid"
```

---

## Task 9: The drawer

Built by hand rather than with a stock drawer navigator, because the comped effect is specific: the content card translates, scales, rounds and gains a shadow, and a translucent sheet peeks out behind it. A stock drawer produces none of that.

**Files:**
- Create: `rally/components/drawer/DrawerItem.tsx`, `rally/components/drawer/DrawerPanel.tsx`, `rally/components/drawer/DrawerHost.tsx`
- Modify: `rally/app/(shop)/_layout.tsx`, `rally/app/(shop)/index.tsx` (wire the hamburger)

**Interfaces:**
- Consumes: icons (Task 2), `useStore` (Task 6), `colors` (Task 1)
- Produces:
  - `DrawerHost({ children })` — provides context and renders the panel plus the transformed content card
  - `useDrawer()` returning `{ open(): void; close(): void }`
  - `DrawerItem({ icon, label, active?, badge?, onPress })`
  - `DrawerPanel({ onClose })`

- [ ] **Step 1: Write `DrawerItem`**

`rally/components/drawer/DrawerItem.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

export function DrawerItem({
  icon,
  label,
  active = false,
  badge,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center gap-5 py-3.5"
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      {icon}
      <Text
        className="font-nunito-semibold text-[20px]"
        style={{ color: active ? colors.surface : colors.drawerIdle }}
      >
        {label}
      </Text>
      {badge ? (
        <View className="h-6 min-w-6 items-center justify-center rounded-full bg-ember px-1.5">
          <Text className="font-nunito-bold text-[12px] text-surface">{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
```

- [ ] **Step 2: Write `DrawerPanel`**

`rally/components/drawer/DrawerPanel.tsx`:

```tsx
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AccountIcon,
  CartIcon,
  CloseIcon,
  HeartIcon,
  HomeIcon,
  MessageIcon,
  SettingIcon,
  SignOutIcon,
} from '@/components/icons';
import { DrawerItem } from '@/components/drawer/DrawerItem';
import { IconButton } from '@/components/ui/IconButton';
import { useStore } from '@/state/store';
import { colors } from '@/theme/colors';

const IDLE = colors.drawerIdle;

export function DrawerPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cartCount, reset } = useStore();

  function go(path: string) {
    onClose();
    router.push(path);
  }

  return (
    <View
      className="flex-1 px-8"
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-row items-center gap-4">
        {/* No avatar photograph ships with the app, so the monogram stands in
            — a broken image well would read worse than a deliberate initial. */}
        <View className="h-14 w-14 items-center justify-center rounded-full bg-ember/90">
          <Text className="font-nunito-extrabold text-[20px] text-surface">DM</Text>
        </View>
        <View className="flex-1">
          <Text className="font-nunito-extrabold text-[22px] text-surface">
            Dylan Meringue
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-ember" />
            <Text className="font-nunito text-[14px]" style={{ color: IDLE }}>
              Active status
            </Text>
          </View>
        </View>
        <IconButton onPress={onClose} accessibilityLabel="Close menu">
          <CloseIcon />
        </IconButton>
      </View>

      <View className="flex-1 justify-center">
        <DrawerItem
          icon={<HomeIcon color={colors.surface} />}
          label="Home"
          active
          onPress={onClose}
        />
        <DrawerItem
          icon={<CartIcon color={IDLE} />}
          label="Cart"
          badge={cartCount || undefined}
          onPress={() => go('/cart')}
        />
        <DrawerItem
          icon={<HeartIcon size={24} color={IDLE} strokeWidth={1.9} />}
          label="Favourites"
          onPress={() => go('/favourites')}
        />
        <DrawerItem
          icon={<MessageIcon color={IDLE} />}
          label="Message"
          onPress={() => go('/message')}
        />
        <DrawerItem
          icon={<AccountIcon color={IDLE} />}
          label="Account"
          onPress={() => go('/account')}
        />
        <DrawerItem
          icon={<SettingIcon color={IDLE} />}
          label="Setting"
          onPress={() => go('/setting')}
        />
      </View>

      <DrawerItem
        icon={<SignOutIcon color={colors.surface} />}
        label="Sign Out"
        active
        onPress={() => {
          reset();
          onClose();
        }}
      />
    </View>
  );
}
```

- [ ] **Step 3: Write `DrawerHost`**

`rally/components/drawer/DrawerHost.tsx`:

```tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerPanel } from '@/components/drawer/DrawerPanel';
import { colors } from '@/theme/colors';

type DrawerApi = { open: () => void; close: () => void };

const DrawerContext = createContext<DrawerApi | null>(null);

export function useDrawer(): DrawerApi {
  const api = useContext(DrawerContext);
  if (!api) throw new Error('useDrawer must be used inside <DrawerHost>');
  return api;
}

const SPRING = { damping: 18, stiffness: 140, mass: 0.7 } as const;

/** How far right the content card slides, as a fraction of screen width. */
const SLIDE = 0.62;
const SCALE = 0.78;

export function DrawerHost({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  // One value in [0, 1] drives every transform, so the button spring and the
  // pan gesture cannot fall out of step with each other.
  const progress = useSharedValue(0);

  const api = useMemo<DrawerApi>(
    () => ({
      open: () => {
        progress.value = withSpring(1, SPRING);
      },
      close: () => {
        progress.value = withSpring(0, SPRING);
      },
    }),
    [progress],
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      progress.value = Math.min(1, Math.max(0, e.translationX / (width * SLIDE)));
    })
    .onEnd((e) => {
      const shouldOpen = progress.value > 0.5 || e.velocityX > 600;
      progress.value = withSpring(shouldOpen ? 1 : 0, SPRING);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * width * SLIDE },
      { scale: interpolate(progress.value, [0, 1], [1, SCALE]) },
    ],
    borderRadius: interpolate(progress.value, [0, 1], [0, 28]),
  }));

  // The pale sheet behind the card. It only exists once the drawer starts
  // opening, and trails the card slightly so an edge of it stays visible.
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35, 1], [0, 0, 0.22]),
    transform: [
      { translateX: progress.value * width * (SLIDE - 0.05) },
      { scale: interpolate(progress.value, [0, 1], [1, SCALE - 0.05]) },
    ],
  }));

  // While open, the card is inert and a tap anywhere on it closes the drawer.
  const blockerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    // `none` lets touches through to the screen when closed; `auto` swallows
    // them when open, which is what makes tap-to-close work.
    pointerEvents: progress.value > 0.5 ? 'auto' : 'none',
  }));

  return (
    <DrawerContext.Provider value={api}>
      <View className="flex-1" style={{ backgroundColor: colors.tealDeep }}>
        <LinearGradient
          colors={[colors.teal, colors.tealDeep]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <DrawerPanel onClose={api.close} />
        </LinearGradient>

        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              inset: 0,
              backgroundColor: colors.surface,
              borderRadius: 28,
            },
            sheetStyle,
          ]}
        />

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                flex: 1,
                overflow: 'hidden',
                backgroundColor: colors.ground,
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 24,
                shadowOffset: { width: -8, height: 0 },
              },
              cardStyle,
            ]}
          >
            {children}
            <Animated.View
              onTouchEnd={api.close}
              style={[{ position: 'absolute', inset: 0 }, blockerStyle]}
            />
          </Animated.View>
        </GestureDetector>
      </View>
    </DrawerContext.Provider>
  );
}
```

If `style={{ position: 'absolute', inset: 0 }}` is rejected by the RN style types, replace each occurrence with `{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }`.

- [ ] **Step 4: Host the drawer in the group layout**

`rally/app/(shop)/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import { DrawerHost } from '@/components/drawer/DrawerHost';
import { colors } from '@/theme/colors';

export default function ShopLayout() {
  return (
    <DrawerHost>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.ground },
        }}
      />
    </DrawerHost>
  );
}
```

- [ ] **Step 5: Wire the hamburger**

In `rally/app/(shop)/index.tsx`, add `import { useDrawer } from '@/components/drawer/DrawerHost';`, call `const drawer = useDrawer();` in the component, and change the menu button's handler to `onPress={drawer.open}`.

- [ ] **Step 6: Typecheck, run, compare**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit && npm start
```

Tap the hamburger, then screenshot with the drawer open and compare against `Screenshot 2026-08-07 at 09.51.34.png`.

Check: the content card slides to roughly the same position and scale; its corners are rounded and it casts a shadow to the left; a pale sheet edge is visible behind it; the profile row, six nav rows and Sign Out sit at the comped vertical positions; Home is full-white with a filled house while the other five are dimmer outlines.

Then: drag right from anywhere on Home — the drawer should track your finger and settle open or closed on release. Tap the content card while open — it closes. Tap a nav row — the drawer closes and the route changes (to a 404 until Task 11; confirm the URL, then go back).

- [ ] **Step 7: Commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions"
git add rally/ && git commit -m "feat(rally): hand-built animated drawer"
```

---

## Task 10: Product detail

**Files:**
- Create: `rally/components/detail/HeroGallery.tsx`, `rally/components/detail/MetaRow.tsx`, `rally/components/detail/PriceBar.tsx`, `rally/app/(shop)/product/[id].tsx`

**Interfaces:**
- Consumes: `productById` (Task 5), `images` (Task 4), icons (Task 2), `Stepper`, `HeartButton`, `EmptyState`, `Screen`, `IconButton` (Task 3), `useStore` (Task 6)
- Produces:
  - `HeroGallery({ imageKeys, index, onSelect })`
  - `MetaRow({ rating, sold, qty, onQtyChange })`
  - `PriceBar({ total, onBuy })`

- [ ] **Step 1: Write `HeroGallery`**

`rally/components/detail/HeroGallery.tsx`:

```tsx
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { ChevronUpIcon } from '@/components/icons';
import { images, type ImageKey } from '@/data/images';

export function HeroGallery({
  imageKeys,
  index,
  onSelect,
}: {
  imageKeys: ImageKey[];
  index: number;
  onSelect: (next: number) => void;
}) {
  return (
    <View className="mx-5 aspect-[1.02] overflow-hidden rounded-[20px] bg-inset">
      <Image
        source={images[imageKeys[index]]}
        contentFit="contain"
        style={{ flex: 1, margin: 18 }}
        transition={180}
      />

      {/* The rail floats over the hero's right edge, half off the card. */}
      <View className="absolute right-0 top-1/4 items-center rounded-2xl bg-surface p-2">
        {imageKeys.map((key, i) => (
          <Pressable
            key={key}
            onPress={() => onSelect(i)}
            accessibilityRole="button"
            accessibilityLabel={`View image ${i + 1}`}
            className={`m-1 h-[68px] w-[68px] items-center justify-center rounded-2xl ${
              i === index ? 'border-2 border-teal bg-teal-tint' : 'bg-surface'
            }`}
          >
            <Image
              source={images[key]}
              contentFit="contain"
              style={{ width: 48, height: 48 }}
            />
          </Pressable>
        ))}
        <View className="pb-1 pt-1">
          <ChevronUpIcon />
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Write `MetaRow` and `PriceBar`**

`rally/components/detail/MetaRow.tsx`:

```tsx
import { Text, View } from 'react-native';
import { StarIcon } from '@/components/icons';
import { Stepper } from '@/components/ui/Stepper';

export function MetaRow({
  rating,
  sold,
  qty,
  onQtyChange,
}: {
  rating: number;
  sold: string;
  qty: number;
  onQtyChange: (next: number) => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <Text className="font-nunito-bold text-[15px] text-ink">{rating}</Text>
        <StarIcon size={16} />
        <View className="mx-2 h-4 w-px bg-dot" />
        <Text className="font-nunito text-[15px] text-ink">{sold} sold</Text>
      </View>
      <Stepper value={qty} onChange={onQtyChange} />
    </View>
  );
}
```

`rally/components/detail/PriceBar.tsx`:

```tsx
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function PriceBar({ total, onBuy }: { total: number; onBuy: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-between bg-ground px-5 pt-3"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View>
        <Text className="font-nunito text-[14px] text-muted">Total Price</Text>
        <Text className="font-nunito-extrabold text-[26px] text-ink">
          $ {total.toFixed(2)}
        </Text>
      </View>
      <Pressable
        onPress={onBuy}
        accessibilityRole="button"
        accessibilityLabel="Buy now"
        className="rounded-2xl bg-teal px-10 py-4"
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <Text className="font-nunito-bold text-[18px] text-surface">Buy Now</Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 3: Write the detail screen**

`rally/app/(shop)/product/[id].tsx`:

```tsx
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ChevronLeftIcon } from '@/components/icons';
import { HeroGallery } from '@/components/detail/HeroGallery';
import { MetaRow } from '@/components/detail/MetaRow';
import { PriceBar } from '@/components/detail/PriceBar';
import { productById } from '@/data/products';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeartButton } from '@/components/ui/HeartButton';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { useStore } from '@/state/store';
import { colors } from '@/theme/colors';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isFavourite, toggleFavourite, addToCart } = useStore();
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);

  const product = productById(id);
  if (!product) {
    return (
      <EmptyState
        title="Not found"
        message="That product isn't in the catalogue. Head back and pick another."
      />
    );
  }

  return (
    <Screen>
      <View className="flex-row items-center px-5 py-2">
        <IconButton onPress={() => router.back()} accessibilityLabel="Go back">
          <ChevronLeftIcon />
        </IconButton>
        <Text className="flex-1 pr-6 text-center font-nunito-extrabold text-[20px] text-ink">
          Detail Product
        </Text>
      </View>

      <View className="mt-4">
        <HeroGallery
          imageKeys={product.images}
          index={imageIndex}
          onSelect={setImageIndex}
        />
      </View>

      <View className="mt-6 flex-1 px-5">
        <Text className="font-nunito-bold text-[15px] text-ink">{product.category}</Text>

        <View className="mt-1 flex-row items-center">
          <Text className="flex-1 font-nunito-extrabold text-[28px] leading-9 text-ink">
            {product.name}
          </Text>
          <HeartButton
            active={isFavourite(product.id)}
            onPress={() => toggleFavourite(product.id)}
            size={56}
          />
        </View>

        <View className="mt-4">
          <MetaRow
            rating={product.rating}
            sold={product.sold}
            qty={qty}
            onQtyChange={setQty}
          />
        </View>

        {/* The description dissolves rather than clipping — the fade is the
            design, so the text is fixed height with a scrim over its tail. */}
        <View className="mt-5 h-[86px] overflow-hidden">
          <Text className="font-nunito text-[15px] leading-[26px] text-muted">
            {product.description}
          </Text>
          <LinearGradient
            colors={['rgba(241,241,241,0)', colors.ground]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 46 }}
            pointerEvents="none"
          />
        </View>
      </View>

      <PriceBar
        total={product.price * qty}
        onBuy={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
            () => {},
          );
          addToCart(product.id, qty);
        }}
      />
    </Screen>
  );
}
```

- [ ] **Step 4: Typecheck**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit
```

Expected: clean. If `useLocalSearchParams<{ id: string }>` errors, check the expo-router 57 docs for the current generic signature rather than guessing.

- [ ] **Step 5: Run and compare**

```bash
npm start
```

Navigate Home → any product card. Screenshot and compare against `Screenshot 2026-08-07 at 09.51.45.png`.

Check: hero card radius and the product contained within it; the thumb rail floating over the right edge with the selected thumb ringed teal on a tinted fill; the chevron below the thumbs; title over two lines with the heart vertically centred beside it; rating, rule and sold count spaced as comped; the stepper's teal squares; the description fading out mid-sentence; the price bar's type sizes.

Then: tap thumbnail 2 — the hero swaps. Tap `+` twice — the total reads `$ 360.00` for the $120 racket. Tap the heart — it fills, and going back to Home shows that card's heart filled too. Tap Buy Now — a success haptic fires.

- [ ] **Step 6: Commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions"
git add rally/ && git commit -m "feat(rally): product detail screen"
```

---

## Task 11: Placeholder destinations and cart badge

**Files:**
- Create: `rally/app/(shop)/cart.tsx`, `favourites.tsx`, `message.tsx`, `account.tsx`, `setting.tsx`

**Interfaces:**
- Consumes: `EmptyState` (Task 3), `useStore` (Task 6), `products` (Task 5)
- Produces: five routes, so no drawer row dead-ends

- [ ] **Step 1: Write Cart and Favourites**

These two show their counts, which is how the store's effects become visible.

`rally/app/(shop)/cart.tsx`:

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/state/store';

export default function Cart() {
  const { cartCount } = useStore();
  return (
    <EmptyState
      title="Cart"
      message={
        cartCount
          ? `${cartCount} item${cartCount === 1 ? '' : 's'} waiting. Checkout isn't built yet.`
          : 'Your cart is empty. Add something from a product page.'
      }
    />
  );
}
```

`rally/app/(shop)/favourites.tsx`:

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/state/store';

export default function Favourites() {
  const { favourites } = useStore();
  const n = favourites.size;
  return (
    <EmptyState
      title="Favourites"
      message={
        n
          ? `${n} product${n === 1 ? '' : 's'} saved. A list view for these isn't built yet.`
          : 'Nothing saved yet. Tap the heart on any product to keep it here.'
      }
    />
  );
}
```

- [ ] **Step 2: Write the remaining three**

`rally/app/(shop)/message.tsx`:

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

export default function Message() {
  return <EmptyState title="Message" message="No messages. This screen isn't built yet." />;
}
```

`rally/app/(shop)/account.tsx`:

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

export default function Account() {
  return <EmptyState title="Account" message="There's no account system here yet." />;
}
```

`rally/app/(shop)/setting.tsx`:

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

export default function Setting() {
  return <EmptyState title="Setting" message="Nothing to configure yet." />;
}
```

- [ ] **Step 3: Typecheck, run, verify the loop**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx tsc --noEmit && npm start
```

Walk this sequence on device:
1. Home → product → `+` to quantity 3 → Buy Now.
2. Back → open drawer. **Expected:** the Cart row carries an ember badge reading `3`.
3. Tap Cart. **Expected:** "3 items waiting."
4. Back → open drawer → tap each of Favourites, Message, Account, Setting. **Expected:** each renders its titled placeholder with a working back button. None 404s.
5. Open drawer → Sign Out. **Expected:** drawer closes, and reopening it shows no cart badge.

Screenshot step 2 — the badge is the visible proof the store is wired end to end.

- [ ] **Step 4: Commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions"
git add rally/ && git commit -m "feat(rally): placeholder destinations and cart badge"
```

---

## Task 12: App icons and the comparison pass

**Files:**
- Create: `rally/tools/gen-icons.sh`, `rally/assets/images/*`, `rally/README.md`
- Modify: `rally/app.json`

**Interfaces:**
- Consumes: everything
- Produces: the finished app

- [ ] **Step 1: Write `tools/gen-icons.sh`**

Port the approach from `glucose/tools/gen-icons.sh` — read it first:

```bash
cat "/Users/danemmanuel/Documents/mobile interactions/glucose/tools/gen-icons.sh"
```

Adapt it to render a Volara-style ember mark on the `#F1F1F1` ground, emitting `assets/images/icon.png` (1024²), `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png`, `splash-icon.png` and `favicon.png`. Run it.

- [ ] **Step 2: Register icons in `app.json`**

Add to the `expo` block:

```json
"icon": "./assets/images/icon.png",
"android": {
  "predictiveBackGestureEnabled": false,
  "adaptiveIcon": {
    "backgroundColor": "#F1F1F1",
    "foregroundImage": "./assets/images/android-icon-foreground.png",
    "backgroundImage": "./assets/images/android-icon-background.png",
    "monochromeImage": "./assets/images/android-icon-monochrome.png"
  }
},
"web": { "favicon": "./assets/images/favicon.png" },
"plugins": [
  "expo-router",
  "expo-font",
  [
    "expo-splash-screen",
    {
      "backgroundColor": "#F1F1F1",
      "image": "./assets/images/splash-icon.png",
      "imageWidth": 180
    }
  ]
]
```

`expo-splash-screen` must also be a dependency — confirm it is in `package.json` at `~57.0.5`.

- [ ] **Step 3: Write `README.md`**

`rally/README.md`: what the app is, `npm start` runs on port 8090 and why, how to add a product photo (`tools/photos.tsv` → `fetch-photos.sh` → stop Metro → `make-art.py`), and a pointer to the spec at `docs/superpowers/specs/2026-08-07-rally-badminton-shop-design.md`.

- [ ] **Step 4: Full comparison pass**

Restart Metro with a cleared cache, since the icon files changed under `assets/`:

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally" && npx expo start --port 8090 --clear
```

Capture all three states and put each beside its comp:

| Capture | Comp |
| --- | --- |
| Home, scrolled to top | `Screenshot 2026-08-07 at 09.51.06.png` |
| Drawer open over Home | `Screenshot 2026-08-07 at 09.51.34.png` |
| Detail for `kinetic-17-le` | `Screenshot 2026-08-07 at 09.51.45.png` |

Work through each pair on: type size and weight, vertical rhythm and gaps, corner radii, colour, icon stroke weight, and where elements sit relative to the screen edges. Fix what differs and re-capture. Iterate until each pair reads as the same design.

- [ ] **Step 5: Verify interactive state visually**

Synthetic taps don't work here, so seed the state instead. Temporarily change `initial` in `state/store.tsx` to:

```ts
const initial: State = {
  favourites: new Set(['kinetic-17-le']),
  cart: [{ id: 'kinetic-17-le', qty: 3 }],
};
```

Screenshot Home (that card's heart filled ember) and the open drawer (Cart badge reading `3`). **Then revert `initial` to `{ favourites: new Set(), cart: [] }`** and confirm with `git diff state/store.tsx` that nothing remains.

- [ ] **Step 6: Final verification and commit**

```bash
cd "/Users/danemmanuel/Documents/mobile interactions/rally"
npx tsc --noEmit
git status --short
```

Expected: `tsc` silent with exit 0. `git status` shows no seeded store, no `.venv/`, no `node_modules/`, no `.expo/`.

```bash
cd "/Users/danemmanuel/Documents/mobile interactions"
git add rally/ && git commit -m "feat(rally): app icons, README and comp-matching pass"
```

---

## Verification Summary

The app is done when all of these hold:

- [ ] `npx tsc --noEmit` is silent from `rally/`.
- [ ] Metro bundles on port 8090 with no red-box and no missing-module warnings.
- [ ] All three screens read as the same design as their comps, side by side.
- [ ] Hearts toggle and agree between Home and the detail screen.
- [ ] The stepper drives the detail total; `$120 × 3` shows `$ 360.00`.
- [ ] Buy Now lights the drawer's Cart badge; Sign Out clears it.
- [ ] All six drawer rows navigate; none 404s.
- [ ] The drawer opens by tap and by pan, and closes by tap on the content card.
- [ ] `tools/make-art.py` regenerates `data/images.ts` from `assets/img/*.jpg` with no hand edits.
- [ ] No real racket manufacturer is named anywhere in the app.
