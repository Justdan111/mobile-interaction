import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Wordmark } from '../components/ui/Wordmark';
import { ONBOARDING_KEY } from '../lib/storage';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      // Every exit from this read — a valid flag, nothing stored, or the
      // read itself rejecting (storage unavailable, corrupt native state) —
      // must still route somewhere, or the splash hangs forever. Mirrors the
      // same discipline in lib/theme.tsx's persisted-preference read.
      let seen: string | null = null;
      try {
        seen = await AsyncStorage.getItem(ONBOARDING_KEY);
      } catch {
        // Read failed — fall through to onboarding. Showing onboarding
        // again is a far better failure than a frozen splash.
      }
      if (!cancelled) router.replace(seen === 'true' ? '/(tabs)' : '/onboarding');
    }, 1400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-page">
      <Animated.View entering={FadeIn.duration(400)}>
        <Wordmark size={46} />
      </Animated.View>
    </View>
  );
}
