import { Redirect } from 'expo-router';

// Temporary: routes the splash straight to the tab bar so it's reachable.
// Task 8 replaces this with the real splash screen.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
