require('react-native-gesture-handler/jestSetup');

jest.mock('expo-glass-effect', () => ({
  GlassView: require('react-native').View,
  GlassContainer: require('react-native').View,
  isLiquidGlassAvailable: () => false,
  isGlassEffectAPIAvailable: () => false,
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
