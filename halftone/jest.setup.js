require('react-native-gesture-handler/jestSetup');

// NativeWind's `darkMode: 'class'` flag is normally set when Metro compiles
// global.css. Jest never runs that pipeline, so without this the flag stays
// unset and `useColorScheme().setColorScheme` throws "Unable to manually set
// color scheme without using darkMode: class." This mirrors, for tests, the
// same darkMode: 'class' already declared in tailwind.config.js.
const { StyleSheet } = require('nativewind');
StyleSheet.registerCompiled({ flags: { darkMode: 'class' } });

jest.mock('expo-glass-effect', () => ({
  GlassView: require('react-native').View,
  GlassContainer: require('react-native').View,
  isLiquidGlassAvailable: () => false,
  isGlassEffectAPIAvailable: () => false,
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// react-native-reanimated v4 pulls in the native `react-native-worklets`
// module at import time; that native binding doesn't exist under Jest, so an
// unmocked import throws (`Cannot read properties of undefined (reading
// 'loadUnpackers')`) before any test using an animated component even runs.
// The package ships its own Jest mock for exactly this — swap it in.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
