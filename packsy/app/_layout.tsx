import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { ThemeProvider, useColors } from '../theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

/** Inside the provider, so the navigator and status bar follow the theme. */
function Shell() {
  const C = useColors();
  return (
    <>
      <StatusBar style={C.statusBar} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.page } }}>
        <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: C.iris } }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  // A failed font load still has to release the splash, or the app hangs on it.
  const ready = loaded || !!error;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Shell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
