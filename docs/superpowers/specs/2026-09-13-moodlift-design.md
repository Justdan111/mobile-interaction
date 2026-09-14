# Moodlift — Design

A mood-first fitness app. You tell it how you feel; it reshapes itself around
that answer — card colour, copy, mascot, and which workouts surface.

Built from 13 reference comps in `moodlift/.design/comps/` (the Dribbble
"VibeMove" concept by Phenomenon Studio). The comps are the visual contract.

## Product

The mood is the app's primary axis. Every surface reads from one selected
mood, and there is no screen that ignores it:

- **Home** has two states. With no mood set, a sage promo card asks "Not sure
  *what* you want to *train* today?" and offers **Find my match**. With a mood
  set, that card is replaced by a **Fits your mood today** rail of matched
  workouts and a **Change my mood** link.
- **Mood picker** is a full-bleed coloured card whose hue *is* the mood. A
  horizontal wheel of labels scrolls under a hand-drawn ellipse that marks the
  selection; the mascot, blurb and card colour all change with it.
- **Workouts** carries a compact mood wheel at the top ("*How* do you *feel*
  today?"), then search, filter chips, and a list whose ordering follows the
  mood.

### Mood scale

Six steps. The comps show three card colours directly; the ramp fills in the
rest, landing on the brand coral at the high end.

| Mood | Colour | Mascot | Blurb |
|---|---|---|---|
| Low energy | `#4A4660` dim violet | Drooping blob, sitting | Running low. Gentle movement only. |
| Tense | `#8B4A3F` clay | Jagged blob, rigid arms | Wound tight. Something to release it. |
| Calm | `#5F7359` sage | Pink hexagon, eyes closed, arms folded | You feel relaxed and grounded. Looking for mindful movement. |
| Balanced | `#3D5A99` blue | Green clover in tree pose | You focused. A good moment for controlled, full-body training. |
| Energized | `#8B4A9C` purple | Yellow sun mid-run, peace sign | You feel active. Time for dynamic workouts and higher intensity. |
| High energy | `#E8724C` coral | Orange starburst mid-jump | Everything's firing. Go hard. |

Calm, Balanced and Energized blurbs are transcribed from the comps verbatim.
The other three are written to match their register.

## Visual system

Near-black canvas, one sage accent surface, coral for anything actionable.

| Token | Value | Used for |
|---|---|---|
| `page` | `#0E0E10` | App background |
| `card` | `#1B1B1D` | Cards, list rows |
| `chip` | `#2A2A2C` | Filter chips, inactive tabs |
| `ink` | `#FFFFFF` | Primary text |
| `muted` | `#8E8E93` | Secondary text, axis labels |
| `accent` | `#E8724C` | CTAs, active tab, rings, chart marks |
| `sage` | `#5F7359` | Promo card, QR card, session icon tiles |

Colours are CSS variables behind Tailwind tokens, following the pattern
already established in `halftone/global.css`.

**Type.** A serif display face with a true italic, and Inter for UI. The
italicised words — *what*, *train*, *feel right* — carry most of the app's
character and appear in almost every heading, so the italic must be a real
cut, not a synthesised slant. Family-and-weight are bound together in CSS
rather than declared as Tailwind `fontFamily` keys; expo-google-fonts
registers each weight as its own family, so `font-weight` alone selects
nothing on Android.

**Mascots** are SVG, drawn the way the comps draw them: a flat coloured head
shape, a two-stroke face, thin outlined arms, heavy black legs and shoes.
Every fill is a prop. No mascot hard-codes a colour — a foreground colour
baked into a component is the defect that has recurred repeatedly in this
repo.

## Architecture

```
moodlift/
  app/
    _layout.tsx           fonts, splash, MoodProvider
    (tabs)/
      _layout.tsx         headless tabs (expo-router/ui)
      index.tsx           Home
      workouts.tsx        Workouts
      pass.tsx            QR gym pass
      calendar.tsx        Calendar
      profile.tsx         Profile
    mood.tsx              Mood picker
    workout/[id].tsx      Workout detail
    journey.tsx           My fitness journey (Activity / Progress)
  components/
    ui/                   Card, Chip, Pill, Ring, SectionHeader, TabBar
    mascots/              one component per mood
    home/ workouts/ mood/ pass/ calendar/ journey/
  data/                   moods, workouts, sessions, activity
  lib/                    derived metrics, mood matching, formatting
  __tests__/
```

Journey and the mood picker are pushed routes, not tabs — both appear in the
comps with a back chevron.

**State.** A `MoodProvider` context holds the selected mood and derives the
recommendation set. In-memory for v1; mood does not survive a restart, which
is acceptable for a design-fidelity build and is the smallest thing to change
later.

**One derived dataset.** Steps, calories and active minutes are solved once
per day from a single series. The home stat cards, the dot-matrix steps
chart, the calories ring, the workout area chart and the "2,971 / 5,000
steps" goal ring all read from that series. No screen carries its own
hand-typed figure — inconsistent duplicated numbers is the trap that bit the
glucose app.

**QR pass** encodes a real matrix and draws it as SVG with rounded modules
and coral finder eyes, over the sage card, with a live countdown.

## Testing

jest-expo, run as `npx jest -w 3` — the default worker count oversubscribes
this machine's 8 cores and fails otherwise.

Tests cover logic that can fail silently, not pixels:

- derived activity metrics agree across every consumer
- mood → workout matching returns the right set and ordering for each mood
- countdown formatting, including rollover and expiry

Visual fidelity is verified by running the app on port 8095 and comparing
screenshots against `.design/comps/`.

## Delivery

Branch `moodlift`, one PR per screen so each is reviewable on its own.

| PR | Contents |
|---|---|
| 1 | Scaffold: Expo 57, NativeWind, fonts, tokens, tab bar |
| 2 | Mood system: data, six SVG mascots, picker screen |
| 3 | Home — both states |
| 4 | Workouts browse + detail |
| 5 | Calendar |
| 6 | QR pass |
| 7 | Journey + Profile |

Metro is pinned to port **8095**. Every app in this repo gets its own port;
sharing one makes Expo Go serve assets from the wrong project.

## Out of scope for v1

No auth, no backend, no persistence, no real health-data integration, no
social features. The workout catalogue is local fixture data.
