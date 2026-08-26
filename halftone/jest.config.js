module.exports = {
  preset: 'jest-expo',
  // react-native-worklets (a react-native-reanimated v4 dependency) ships a
  // native-only entry point that requires an actual native binding; under
  // Jest that binding doesn't exist. This resolver — shipped by the package
  // itself for exactly this case — strips the `.native` extension so worklets
  // resolves to its JS/web implementation instead of crashing at import time.
  resolver: 'react-native-worklets/jest/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Jest's 5s default is not a meaningful budget here: the slowest test in this
  // suite runs in about a second, but every suite boots a full jest-expo
  // environment, and under load — a Metro server and a simulator alongside the
  // run — React Testing Library's cleanup has occasionally crossed 5s and
  // failed a passing test. A 15s ceiling still catches a genuine hang while
  // leaving no room for a machine-load flake to be mistaken for a defect.
  testTimeout: 15000,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/.*|native-base|react-native-svg|nativewind|react-native-css-interop)',
  ],
};
