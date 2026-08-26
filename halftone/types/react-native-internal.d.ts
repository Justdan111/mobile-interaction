/**
 * `react-native/Libraries/Utilities/useColorScheme` is a deep import into React
 * Native's internals, which ship no type declarations. The theme tests mock
 * exactly this path — it is the module `react-native`'s own `useColorScheme`
 * re-exports, and mocking the public name instead would replace every other
 * React Native export in those suites.
 *
 * Declaring it here keeps `tsc --noEmit` at zero, so a real type error is
 * visible the moment it appears instead of hiding among known noise.
 */
declare module 'react-native/Libraries/Utilities/useColorScheme' {
  import type { ColorSchemeName } from 'react-native';
  const useColorScheme: () => ColorSchemeName;
  export default useColorScheme;
}
