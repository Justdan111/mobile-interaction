import '../global.css';
import { useEffect } from 'react';
import { router, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { C } from '../theme/colors';
import { DEV_ROUTE } from '../dev-route';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  // A failed font load still has to release the splash, or the app hangs on it.
  const ready = loaded || !!error;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  useEffect(() => {
    if (__DEV__ && ready && DEV_ROUTE) {
      const t = setTimeout(() => router.replace(DEV_ROUTE as never), 50);
      return () => clearTimeout(t);
    }
  }, [ready]); // DEV_ROUTE edits re-run this via fast refresh

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.page } }}>
          <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: C.iris } }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
