require('react-native-gesture-handler/jestSetup');

// react-native-safe-area-context needs a <SafeAreaProvider> ancestor to resolve
// insets; under Jest there's no native layout pass to populate one. The package
// ships a simplified provider serving fixed metrics for exactly this case.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

// Reanimated 4.7's own mock boots the native module and throws under
// jest-expo 58 — see test/reanimated-mock.js.
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
jest.mock('react-native-reanimated', () => require('./test/reanimated-mock'));
