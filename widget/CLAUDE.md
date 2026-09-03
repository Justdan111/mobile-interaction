# Widget Lab — notes for Claude

An Expo app hosting iOS widgets and Live Activities via `expo-widgets`. Read
`widgets/README.md` before touching anything under `widgets/`.

## The constraint that governs this project

A layout function marked `'widget'` is **serialised to a string by
`babel-preset-expo` and re-evaluated inside the widget extension**, in a runtime
with no module system. Only `@expo/ui/swift-ui` exports, `@expo/ui/swift-ui/modifiers`
exports, a React/JSX shim, and the function's own body exist there.

Importing a shared constant, theme, or helper into a widget body type checks, then
renders a red box on device. Colour tokens are therefore declared *inside* each
layout function on purpose — do not "clean that up" by hoisting them to a shared
module.

## The second constraint: `'use no memo'`

`experiments.reactCompiler` is on. Expo opts the `'widget'` function out of the React
Compiler, but **not** components declared inside it. A compiled nested component calls
a `_c` memo-cache helper that the widget runtime does not inject — red box, no build
error. Every nested component in a widget body therefore opens with `'use no memo'`
and a block body. Do not remove those directives.

`npm run check:widgets` catches both constraints statically — it runs the real
`babel-preset-expo` with Metro's caller flags, extracts the serialised layout, and
fails on any identifier the extension will not have. Run it after editing anything in
`widgets/`.

## Live Activities vs. home screen widgets

- Live Activities register at runtime through `createLiveActivity` and must **not**
  be added to the `widgets` array in `app.json`. The plugin generates one Swift
  `Widget` struct per array entry; a Live Activity there compiles to a broken
  home screen widget with an empty `supportedFamilies`.
- Home screen widgets **do** need an array entry whose `name` exactly matches the
  `createWidget` string, and which is a valid Swift identifier.
- Every Live Activity is served by the single `WidgetLiveActivity` struct the
  plugin always appends to the widget bundle.

## Builds

EAS only — `eas build --profile development --platform ios` (simulator build).
`ios/` and `android/` are gitignored; EAS prebuilds them server-side. If you run
`npx expo prebuild` locally to inspect generated Swift, delete the directories
afterwards.

Expo Go cannot run widgets or Live Activities.
