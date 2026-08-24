import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const SCRIBBLE = 'M18 46C58 8 96 74 140 40c30-23 52 6 84-14';
const LENGTH = 320;

export function Wordmark({ size = 44, animate = true }: { size?: number; animate?: boolean }) {
  const { t } = useTheme();
  const progress = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (animate) progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [animate, progress]);

  const stroke = useAnimatedProps(() => ({
    strokeDashoffset: LENGTH * (1 - progress.value),
  }));

  return (
    <View className="items-center justify-center">
      <Svg width={size * 5.6} height={size * 2} viewBox="0 0 240 86" style={{ position: 'absolute' }}>
        <AnimatedPath
          d={SCRIBBLE}
          stroke={t.accentDeep}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={LENGTH}
          animatedProps={stroke}
        />
      </Svg>
      <Text className="font-display text-ink" style={{ fontSize: size, letterSpacing: 1 }}>
        Halftone
      </Text>
    </View>
  );
}
