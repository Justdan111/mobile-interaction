import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ThemeProvider, useTheme } from '../lib/theme';

SplashScreen.preventAutoHideAsync();

function Shell({ fontsReady }: { fontsReady: boolean }) {
  const { mode, hydrated } = useTheme();

  // Hold the splash until both fonts and the persisted theme preference are
  // ready, so the app never paints a frame in the wrong theme (or an
  // un-fonted one). Fonts alone isn't enough: theme hydration is a second,
  // independent async read that can still be pending once fonts resolve.
  useEffect(() => {
    if (fontsReady && hydrated) SplashScreen.hideAsync();
  }, [fontsReady, hydrated]);

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Anton_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const fontsReady = loaded || !!error;

  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Shell fontsReady={fontsReady} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
