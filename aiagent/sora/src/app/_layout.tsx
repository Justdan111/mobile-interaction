import '../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { cssInterop } from 'nativewind';
import { useEffect } from 'react';
import Animated from 'react-native-reanimated';

// NativeWind only auto-wires className on core components; register the
// Reanimated primitives we style with Tailwind classes.
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hide();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          // The screens slide themselves in from the bottom; keep the
          // native stack transition to a plain fade so both don't fight.
          animation: 'fade',
          contentStyle: { backgroundColor: '#170B05' },
        }}
      />
    </>
  );
}
