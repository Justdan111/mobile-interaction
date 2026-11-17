require('react-native-gesture-handler/jestSetup');

// Metro normally sets NativeWind's `darkMode: 'class'` flag when compiling
// global.css; without it `setColorScheme` throws under Jest.
const { StyleSheet } = require('nativewind');
StyleSheet.registerCompiled({ flags: { darkMode: 'class' } });

jest.mock('expo-glass-effect', () => ({
  GlassView: require('react-native').View,
  GlassContainer: require('react-native').View,
  isLiquidGlassAvailable: () => false,
  isGlassEffectAPIAvailable: () => false,
}));

// No native layout pass under Jest to populate insets; use the package's mock.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Reanimated v4 loads native worklets at import time, which throws under Jest.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
