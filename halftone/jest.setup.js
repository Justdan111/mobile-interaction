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
