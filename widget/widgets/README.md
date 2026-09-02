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
