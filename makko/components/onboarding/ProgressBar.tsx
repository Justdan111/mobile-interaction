import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { C } from '../../theme/colors';

const WIDTH = 92;

/** The short onboarding progress rail; fills from the previous step's value. */
export function ProgressBar({ from, to }: { from: number; to: number }) {
  const p = useSharedValue(from);
  useEffect(() => {
    p.value = withTiming(to, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [p, to]);
  const fill = useAnimatedStyle(() => ({ width: WIDTH * p.value }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(to * 100) }}
      style={{ width: WIDTH, height: 5, borderRadius: 3, backgroundColor: C.line, overflow: 'hidden', alignSelf: 'center' }}
    >
      <Animated.View style={[{ height: 5, borderRadius: 3, backgroundColor: C.brand }, fill]} />
    </View>
  );
}
