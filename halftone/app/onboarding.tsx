import React, { useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Halftone } from '../components/halftone/Halftone';
import { PillButton } from '../components/ui/PillButton';
import { useTheme } from '../lib/theme';
import type { FieldName } from '../components/halftone/fields';
import { ONBOARDING_KEY } from '../lib/storage';

export const SLIDES: Array<{ title: string; body: string; variant: FieldName; seed: string }> = [
  {
    title: 'Perfect Match!',
    body: 'Build your dream team, turn ideas into reality effortlessly',
    variant: 'sphere',
    seed: 'onboard-1',
  },
  {
    title: 'Find. Unite. Create.',
    body: 'Browse briefs from studios and agencies looking for your craft',
    variant: 'blob',
    seed: 'onboard-2',
  },
  {
    title: 'Ship together',
    body: 'Deadlines, files and your whole team in one shared thread',
    variant: 'orbit',
    seed: 'onboard-3',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { t } = useTheme();
  const [index, setIndex] = useState(0);
  const art = Math.min(Dimensions.get('window').width - 56, 360);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-page" edges={['top', 'bottom']}>
      <View className="flex-row justify-end px-6 pt-2">
        <Pressable accessibilityRole="button" onPress={finish} hitSlop={12}>
          <Text className="text-muted text-[16px] font-medium">Skip</Text>
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-7">
        <Animated.View key={slide.title} entering={FadeIn.duration(260)} exiting={FadeOut.duration(120)} className="items-center">
          <Text className="font-display text-ink text-center text-[38px]">{slide.title}</Text>
          <Text className="text-muted mt-3 text-center text-[15px] leading-[22px]">{slide.body}</Text>
          <View className="mt-10">
            <Halftone variant={slide.variant} size={art} seed={slide.seed} density={54} dotColor={t.accent} />
          </View>
        </Animated.View>
      </View>

      <View className="px-6 pb-4">
        <View className="mb-6 h-1.5 flex-row gap-2">
          {SLIDES.map((s, i) => (
            <View
              key={s.seed}
              className={`h-1.5 flex-1 rounded-full ${i <= index ? 'bg-accent' : 'bg-chip'}`}
            />
          ))}
        </View>
        <PillButton
          label={last ? 'Get started' : 'Next'}
          onPress={() => (last ? finish() : setIndex(index + 1))}
        />
      </View>
    </SafeAreaView>
  );
}
