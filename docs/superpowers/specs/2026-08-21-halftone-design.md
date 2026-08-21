# Halftone — Design Spec

**Date:** 2026-08-21
**Status:** Approved, ready for implementation planning

## 1. What we're building

A creative-freelance marketplace crossed with a team workspace, built from nine
reference comps (stored in `.screenshots/newapp-comps/`, mirrored into
`halftone/.design/comps/`). The reference design is branded "Creaserch"; our app
is **Halftone**, named for the procedural dot-art that carries its visual
identity.

The app has five tabs — Search, Proposals, Chats, My Projects, Profile — plus a
splash, an onboarding carousel, and three drilldown screens (chat thread, team
detail, project detail).

Every screen ships in both light and dark mode. The comps are dark-only, so
light mode is designed here rather than derived.

## 2. Visual language

### Palette

Semantic tokens, defined once and swapped by mode. No screen references a raw
hex value.

| Token | Light | Dark |
|---|---|---|
| `page` | `#F4F3F0` | `#0A0A0A` |
| `card` | `#FFFFFF` | `#1C1C1E` |
| `ink` | `#0F0F12` | `#FFFFFF` |
| `muted` | `#6B6B72` | `#8E8E93` |
| `accent` | `#6C63E8` | `#7B77E8` |
| `accent-deep` | `#3B34C9` | `#3B34C9` |
| `chip` | `#ECEBF9` | `#2A2A33` |
| `hairline` | `#E3E1DC` | `#2C2C2E` |
| `danger` | `#E5483D` | `#E5483D` |
| `info` | `#0A84FF` | `#0A84FF` |
| `success` | `#34C759` | `#34C759` |

Light mode is a warm-paper inversion, not a clinical white. This preserves the
editorial print feel that the halftone art depends on — halftone is literally
ink on paper, so black-dots-on-cream is its native state and white-dots-on-black
is the inversion.

### Type

- **Display:** Anton — condensed, heavy, all the big headers ("Perfect Match!",
  "Projects", "Chats", "Profile", "Good morning!"). Closest free match to the
  Druk-style face in the comps.
- **Body/UI:** Inter — everything else.

Loaded via `@expo-google-fonts/anton` and `@expo-google-fonts/inter`, held
behind `expo-splash-screen` until ready.

### Signature element: procedural halftone

The dot-art in the comps is not shipped as image assets. It is a `<Halftone>`
component that samples a scalar field function over a grid and emits
`react-native-svg` `<Circle>` elements whose radius tracks field intensity.

- Deterministic: seeded, so a given variant renders identically every time.
- Theme-reactive: recolors between ink-on-paper and paper-on-ink for free.
- Zero assets, no network.

Four variants cover every appearance in the comps:

| Variant | Field | Used by |
|---|---|---|
| `sphere` | two-lobed radial gradient with a hollow core | onboarding slide 1 |
| `wave` | stacked sine bands, moiré interference | home card "Find your Inspiration" |
| `blob` | organic metaball cluster | home card "Find.Unite.Create." |
| `orbit` | sphere with an eclipsing crescent | home card "Find your Perfect Match" |

The same engine generates **avatars**: a per-person seed produces a distinct
halftone portrait-plate. This keeps the app offline-capable and on-brand, and
avoids shipping photographs of real people.

## 3. Navigation

```
app/_layout.tsx              root Stack, fonts, theme provider, splash gate
app/index.tsx                splash — wordmark + animated scribble
app/onboarding.tsx           3 slides, progress bar, Skip / Next
app/(tabs)/_layout.tsx       headless tabs + liquid-glass pill bar
  index                      Home / search feed
  proposals                  Proposals
  chats                      Proposals | Teams segmented list
  projects                   Active | Calendar segmented
  profile                    Profile
app/chat/[id].tsx            message thread
app/team/[id].tsx            Members | Files
app/project/[id].tsx         project detail
```

Root `Tabs` is deprecated in expo-router 57. The tab bar is built on the
headless `expo-router/ui` primitives (`Tabs`, `TabList`, `TabTrigger`,
`TabSlot`), which is what a fully custom bar needs anyway.

## 4. The tab bar (liquid glass)

A floating pill, inset from the bottom safe area. Five icons; the active tab
expands into a labelled chip.

Built with `expo-glass-effect`:

- The pill is a `GlassContainer`, so the bar and the active chip render as
  members of one glass system and **merge** as the chip slides between tabs —
  the defining liquid-glass behaviour, not just a blur.
- The active chip is a `GlassView` with `tintColor` set to `accent` and
  `isInteractive` enabled, so it responds to touch with the native specular
  highlight.
- The chip's position and width animate with reanimated; the label
  cross-fades in.

**Availability is not assumed.** `isLiquidGlassAvailable()` gates the glass
path. When it returns false (Android, iOS below 26, or Reduce Transparency),
the bar falls back to `expo-blur`'s `BlurView` with a hairline border and a
translucent token background. Both paths are laid out by the same component;
only the surface differs. This fallback is required, not optional — the comps'
own bar is an opaque pill and must remain a valid rendering.

## 5. Screens

### Splash (`index`)
Wordmark in Anton over `page`, with the hand-drawn accent scribble stroked on
via an animated SVG path. Routes to onboarding on first launch, tabs
thereafter (flag in AsyncStorage).

### Onboarding
Three slides. Each: display headline, two-line muted subhead, a large
`<Halftone>` piece, a segmented progress bar, and a full-width pill button.
"Skip" sits top-right. Swipe or button to advance; the last slide's button
reads "Get started".

### Home
Greeting header ("Good morning! ⚡", time-derived). Search field plus a filter
button. A horizontally-scrolling row of three halftone art cards. Then the
"Projects" feed: each card carries title, pay range, a chip row
(location / experience / commitment), a divider, and an employer row with logo,
name, and posted date. A heart toggles saved state.

### Proposals (envelope tab)
Formal applications the user has sent or received: status-tracked records
(Sent / Viewed / Accepted / Declined) using the same card grammar as the feed,
with accept and decline affordances on incoming ones.

This is deliberately distinct from the Proposals *segment* inside Chats — the
tab holds the application records, the Chats segment holds the one-to-one
conversations those applications opened. A proposal card links to its thread.

### Chats
Segmented Proposals | Teams. The Proposals segment lists one-to-one threads;
the Teams segment lists group threads. Team rows: square art tile, team name, member
count, last-sender chip, message preview, timestamp, and either read ticks or
an unread count badge.

Rows are swipeable — `SwipeableRow` reveals a blue mute toggle ("On"/"Off") and
a red "Exit", matching comp 6.

### Chat thread
Header shows team name and live online count, with the team tile on the right.
Message bubbles group by consecutive sender; own messages are `accent`-filled
and right-aligned, others `card`-filled and left-aligned with an avatar on the
group's last bubble. Voice notes render a play control and a static waveform
with duration. Composer has attach and mic affordances.

### Team detail
Large team tile, name, member count. Segmented Members | Files. Member rows
show role above name with a per-member chat button. A notification toggle and
a primary button sit at the bottom.

### My projects
Segmented Active | Calendar.

Calendar is hand-rolled — no date library beyond formatting. A month grid with
four cell states: today (neutral fill), task deadline (`accent` fill), project
deadline (`accent-deep` fill), and multi-day ranges rendered as a single joined
pill spanning the days. A legend explains the three dot colours. Below, agenda
cards show day/month in display type, tags, project name, task title, and a
chevron, with an `accent` bar down the left edge.

### Profile
An `accent`-tinted header card with photo, name, age, editable phone, and an
edit affordance. A status row, then a stats card with role, star rating, two
figures, and a "Go to Resume" button. Then a settings list: Saved projects,
Support, Password, Notification, and the **Dark Mode** switch — which drives
the real theme.

## 6. Theming implementation

`global.css` declares the light palette as CSS variables on `:root` and
redefines them under `.dark`. `tailwind.config.js` maps each variable to a
Tailwind colour name so `bg-card`, `text-ink`, `bg-accent` resolve correctly in
both modes with no `dark:` prefixes at call sites.

A `ThemeProvider` owns the mode. It defaults to the system scheme, is
overridden by the Profile switch, and persists the choice to AsyncStorage.
NativeWind's `useColorScheme().setColorScheme()` applies it.

Known trap: NativeWind `className` does not drive flex layout on
`LinearGradient` or other non-View native components. Layout goes on an inner
`View`.

## 7. Data

All data is mock, typed, and lives in `data/`:
`projects.ts`, `teams.ts`, `messages.ts`, `proposals.ts`, `profile.ts`.

**Single source of truth.** Calendar events and agenda cards are *derived* from
the projects and teams data by a pure function, never hand-written. Team member
counts derive from member arrays. Chat previews derive from the last message in
the thread. Nothing in the UI can contradict anything else, and editing one
project updates every surface that mentions it.

## 8. Testing

TDD applies to the parts with real logic:

- **Halftone field functions** — determinism under a fixed seed, expected dot
  counts for a given grid density, radius clamped to `[0, maxR]`, all four
  variants produce distinct output.
- **Calendar** — month grid layout (leading blanks, day count across month
  lengths and leap years), multi-day range detection and joining, cell state
  classification precedence.
- **Derivation** — agenda built from projects matches the source, chat previews
  match last messages, member counts match arrays.
- **Message grouping** — consecutive-sender grouping, avatar placement on the
  final bubble of a group.
- **Theme** — token resolution per mode, persistence round-trip.

Plus render smoke tests via `jest-expo` and
`@testing-library/react-native` for each screen.

Pixel fidelity is **not** unit-tested. It is verified by running the app on the
simulator and comparing screenshots against the comps in
`halftone/.design/comps/`.

## 9. Project setup

- Folder: `halftone/` at the workspace root.
- Slug and scheme: `halftone`.
- **Metro port: 8091**, pinned in the `start` script. One port per app — shared
  ports cause stale Expo Go entries to resolve assets against the wrong
  project and fail with ENOENT.
- Stack matches the house standard established in `rally/`: Expo SDK ~57.0,
  expo-router ~57.0, NativeWind ^4.2, React Native 0.86, react-native-svg,
  reanimated 4, react-native-gesture-handler, expo-image, expo-haptics.
- Added for this app: `expo-glass-effect`, `expo-blur`,
  `@react-native-async-storage/async-storage`,
  `@expo-google-fonts/anton`, `@expo-google-fonts/inter`.

## 10. Working agreements

These are binding for the whole project.

- **Branch:** all work happens on `halftone`, branched from `main`. Nothing is
  committed directly to `main`.
- **No AI attribution.** Commits and pull requests must never carry
  `Co-Authored-By: Claude`, "Generated with Claude Code", or any equivalent
  trailer, footer, or badge. This applies to commit messages, PR titles, PR
  bodies, and any file written into the repository.
- **Human review is required.** Every pull request is reviewed personally by
  the repository owner. No PR is merged, auto-merged, or self-approved without
  that review.

## 11. Out of scope

- Any backend, auth, or real networking.
- Real photography. Avatars and art are procedural.
- Push notifications. The toggles set local state only.
- Audio playback. Voice-note bubbles render their waveform and duration but do
  not play.
- Search and filter execute against the local mock set only.
