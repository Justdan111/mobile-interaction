/**
 * Types for a deep React Native import the theme tests mock. Mocking the public
 * `useColorScheme` instead would replace every other React Native export.
 */
declare module 'react-native/Libraries/Utilities/useColorScheme' {
  import type { ColorSchemeName } from 'react-native';
  const useColorScheme: () => ColorSchemeName;
  export default useColorScheme;
}
