require('react-native-gesture-handler/jestSetup');

// react-native-safe-area-context needs a <SafeAreaProvider> ancestor to resolve
// insets; under Jest there's no native layout pass to populate one. The package
// ships a simplified provider serving fixed metrics for exactly this case.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

// react-native-reanimated v4 pulls in the native `react-native-worklets` module
// at import time; that binding doesn't exist under Jest, so an unmocked import
// throws before any test using an animated component even runs. The package
// ships its own Jest mock — swap it in.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
