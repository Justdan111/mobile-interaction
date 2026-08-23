module.exports = {
  preset: 'jest-expo',
  // react-native-worklets (a react-native-reanimated v4 dependency) ships a
  // native-only entry point that requires an actual native binding; under
  // Jest that binding doesn't exist. This resolver — shipped by the package
  // itself for exactly this case — strips the `.native` extension so worklets
  // resolves to its JS/web implementation instead of crashing at import time.
  resolver: 'react-native-worklets/jest/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/.*|native-base|react-native-svg|nativewind|react-native-css-interop)',
  ],
};
