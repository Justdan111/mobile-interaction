module.exports = {
  preset: 'jest-expo',
  // Resolves react-native-worklets to its JS implementation; the native entry
  // point needs a binding that doesn't exist under Jest.
  resolver: 'react-native-worklets/jest/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Under machine load, jest-expo boot plus RTL cleanup can exceed the 5s
  // default; 15s still catches a genuine hang.
  testTimeout: 15000,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/.*|native-base|react-native-svg|nativewind|react-native-css-interop)',
  ],
};
