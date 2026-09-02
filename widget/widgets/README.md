# Widgets

One file per widget or Live Activity, re-exported from `index.ts`.

| File | Kind | Registered name | Config entry needed? |
| --- | --- | --- | --- |
| `DeliveryTrackingActivity.tsx` | Live Activity | `DeliveryTrackingActivity` | No |

## Adding the next one

1. Create `widgets/<Name>.tsx` exporting `createWidget('<Name>', …)` or
   `createLiveActivity('<Name>', …)` as its default export.
2. Re-export it from `widgets/index.ts`.
3. **Home screen widgets only:** append an entry to the `widgets` array in the
   `expo-widgets` plugin block in `app.json`. The `name` there must match the string
   passed to `createWidget` exactly — it becomes a Swift struct name, so it has to be a
   valid Swift identifier.
4. Rebuild. A new home screen widget changes the native target, so it needs a fresh
   `eas build`. Changing only the *layout* of an existing widget does not.

Live Activities do **not** get an entry in the `widgets` array. The config plugin
generates one Swift `Widget` struct per array entry, and a Live Activity would turn
into a bogus home screen widget (with an empty `supportedFamilies`, which fails to
compile). All Live Activities are served by the single `WidgetLiveActivity` struct that
the plugin always adds to the widget bundle; they are matched at runtime by the name
passed to `createLiveActivity`.

## The one rule that will bite you

The layout function is marked with the `'widget'` directive. `babel-preset-expo`
**serialises that function to a string** and the widget extension re-evaluates it in a
bare JS runtime, with no module system.

That runtime injects, as globals, everything exported from `@expo/ui/swift-ui` and
`@expo/ui/swift-ui/modifiers`, plus a small React/JSX shim. Nothing else exists.

So inside a `'widget'` function body:

- ✅ `@expo/ui` components and modifiers — `Text`, `HStack`, `font`, `padding`, …
- ✅ `props` and `environment`
- ✅ consts and components you declare **inside** the body
- ❌ anything imported from your own modules — a shared `theme.ts`, a helper, a
  constant. It compiles and type-checks, then is `undefined` at render time and you
  get a red box in the widget.

That is why the colour tokens in `DeliveryTrackingActivity.tsx` are declared inside the
function rather than pulled from a shared file. Shared design tokens have to be
duplicated per widget, or generated into each file — they cannot be imported.

## Making a widget move on its own

A widget or Live Activity only re-renders when the system decides to, or when the
app pushes an update — and the app is usually suspended. Do not build motion out
of repeated `update()` calls; iOS will throttle them and the thing freezes the
moment the app is killed.

Use the primitives the system animates for you instead. All of them take absolute
dates, so hand the widget *when something happens*, not *how long is left*:

| Want | Use |
| --- | --- |
| A ticking countdown or count-up | `<Text timerInterval={{ lower, upper }} countsDown />` |
| A relative or absolute time that stays fresh | `<Text date={d} dateStyle="relative" />` |
| A bar that fills over a known window | `<ProgressView timerInterval={{ lower, upper }} countsDown={false} />` |
| A continuously animating SF Symbol | `symbolEffect({ effect: 'pulse' }, { options: { repeat: 'continuous' } })` |

Two traps with `timerInterval`:

- If `lower > upper` SwiftUI silently skips the timer branch and falls back to the
  plain text — which is **empty** if you passed no children. Clamp the range.
  `DeliveryTrackingActivity` does this with `Math.max`.
- Pair it with the `monospacedDigit()` modifier, or the text jitters as the digits
  change width.

`symbolEffect` needs no trigger for indefinite effects — omit `isActive` and it
runs. Do not reach for `useNativeState` to drive one: hooks do not exist in the
widget runtime.

## Size budgets: overflow clips, it does not scale

Every presentation has a hard height, and SwiftUI does not shrink a layout to fit one.
It draws what it can and **silently cuts off the rest** — no warning, no build error.
The first cut of this card lost its whole driver row that way, and the destination
address with it.

| Presentation | Roughly |
| --- | --- |
| Lock Screen banner | 160pt tall |
| Dynamic Island expanded | ~160pt across all regions |
| Dynamic Island compact | ~45pt wide per side |

A comp drawn for a phone screen will not be anywhere near this. The reference for
`DeliveryTrackingActivity` is about 300pt tall at the same width — twice the budget. The
card keeps every element and the same hierarchy; what it gives up is the comp's
whitespace. Spend the air before you drop content, and only shrink type once the air
is gone.

Add up line heights (roughly `fontSize × 1.2`), stack heights, and padding before
building. It is much faster than a round trip through EAS.

## Truncation next to a `Spacer`, and why pinning is not a blanket fix

`HStack { block; Spacer(); block }` will happily truncate the text in those blocks to
`RJ…` while most of the row sits empty. Pin the text stacks with
`fixedSize({ horizontal: true })` — and `layoutPriority(1)` for good measure — so they
take their natural width and the `Spacer` absorbs the slack.

**Only pin where the row is genuinely wide.** A pinned stack refuses to shrink, so in a
narrow region it overflows and gets clipped by the presentation's edge rather than
truncating. Pinning the ETA everywhere pushed `Arrived` straight through the side of the
Dynamic Island, losing the final letter. `DeliveryTrackingActivity` pins only in the
Lock Screen card and lets the Dynamic Island variants shrink through
`minimumScaleFactor` instead.

## Moving something in the collapsed pill

`compactLeading` and `compactTrailing` are two separate regions with the camera between
them — nothing can span the gap, so travel has to happen inside one region. The truck
rides a short fixed-width track in the leading region: a travelled rule, the glyph, then
a remaining rule, the same split the Lock Screen rail uses. The width is hard-coded
because the region's own width is not knowable from the layout; keep it modest, since
the pill grows to fit its content but not without limit.

Worth knowing: `Text(timerInterval:)` refreshes its own text without re-evaluating the
layout, so anything positional only moves when the app pushes an update. That is why
the trip is short and the push cadence is high — over ten seconds at 300ms the truck
advances under a point per frame, which reads as travel rather than stepping.

## Budget the Dynamic Island against the camera, not the screen

The expanded presentation looks roomy and is not. The camera band and the system's own
padding take about 90pt of the ~160pt before any of your content is drawn, which leaves
roughly 60pt for `expandedBottom`. That is one band, not a stack of rows — this card
puts the route and the driver side by side there, and keeps the stacked version for the
Lock Screen.

Measure it from a screenshot rather than guessing: take the island's pixel height,
divide by its pixel width, and multiply by 371 (its width in points).

## The second rule: nested components need `'use no memo'`

This project has `experiments.reactCompiler` on. Expo registers `'widget'` as a React
Compiler opt-out directive, so the layout function itself is left alone — but that does
**not** extend to components declared inside it.

A nested component without an opt-out gets compiled into something that calls a `_c`
memo-cache helper, and `_c` is not one of the globals the widget runtime injects. The
result is a red box on device with no build-time warning.

So every component declared inside a `'widget'` function opens with:

```tsx
const VehicleIdentity = () => {
  'use no memo';
  return ( … );
};
```

Note this needs a block body — a directive cannot go in a concise arrow body.

`npm run check:widgets` catches a missing opt-out. It drives the real
`babel-preset-expo` with the same caller flags Metro uses, reads the serialised layout
back out, and fails on any identifier the extension will not have.
