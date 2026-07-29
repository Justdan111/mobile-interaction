import { router } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContinueRing } from '@/components/continue-ring';
import { DriveInCar } from '@/components/drive-in-car';
import { DotGridButton } from '@/components/icon-buttons';
import { RidgeBackdrop } from '@/components/ridge-backdrop';

type HeadlineLineProps = {
  children: string;
  delay: number;
  color: 'text-pulse' | 'text-bone';
  width: number;
  align: 'flex-start' | 'flex-end';
  indent: number;
};

// Michroma uppercase advance is ~1.09em per character, so a line's font
// size can be derived from the horizontal space it should fill.
const MICHROMA_ADVANCE = 1.09;

function HeadlineLine({ children, delay, color, width, align, indent }: HeadlineLineProps) {
  const { width: screenWidth } = useWindowDimensions();
  const fontSize = (screenWidth * width - indent) / (children.length * MICHROMA_ADVANCE);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600)}
      style={{ width: `${width * 100}%`, alignSelf: align, paddingLeft: indent, marginTop: -6 }}>
      <Text
        numberOfLines={1}
        className={`font-display ${color}`}
        style={{ fontSize, lineHeight: fontSize * 1.12 }}>
        {children}
      </Text>
    </Animated.View>
  );
}

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const openCollection = () => router.push('/collection');

  return (
    <View
      className="flex-1 bg-ink"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}>
      <RidgeBackdrop />

      {/* Wordmark + menu */}
      <View className="flex-row items-center justify-between px-6">
        <Text className="font-display text-sm tracking-[6px] text-bone">CARSPROJ.</Text>
        <DotGridButton onPress={openCollection} />
      </View>

      {/* Hero — Ferrari 512S Modulo drives in from the left */}
      <View style={{ marginTop: 28, height: '24%' }}>
        <DriveInCar
          source={require('@/assets/images/cars/modulo-side.png')}
          delay={250}
          containerStyle={{ flex: 1, justifyContent: 'center', paddingHorizontal: 12 }}
          imageStyle={{ width: '100%', height: '100%' }}
        />
      </View>

      {/* Headline */}
      <View className="mt-6 flex-1 justify-center">
        <HeadlineLine delay={100} color="text-pulse" width={0.7} align="flex-start" indent={20}>
          RACE
        </HeadlineLine>
        <HeadlineLine delay={250} color="text-bone" width={0.72} align="flex-end" indent={0}>
          CARS
        </HeadlineLine>
        <HeadlineLine delay={400} color="text-bone" width={0.86} align="flex-start" indent={32}>
          PRJCT
        </HeadlineLine>
      </View>

      {/* Skip / Continue */}
      <View className="flex-row items-center justify-between pl-6 pr-4">
        <Pressable onPress={openCollection} hitSlop={16} className="active:opacity-70">
          <Text className="font-grotesk text-base text-smoke">Skip</Text>
        </Pressable>
        <ContinueRing onPress={openCollection} />
      </View>
    </View>
  );
}
