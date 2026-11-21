import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { C } from '../../theme/colors';
import { Icon } from '../ui/icons';
import { Press } from '../ui/Press';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 76;
const STROKE = 2.5;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/** A black next button inside a ring that shows how far through onboarding you are. */
export function RingButton({ progress, onPress }: { progress: number; onPress: () => void }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [p, progress]);
  const arc = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - p.value) }));

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={C.line} strokeWidth={STROKE} fill="none" />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={C.black}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRC} ${CIRC}`}
          animatedProps={arc}
        />
      </Svg>
      <Press
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Next"
        style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: C.black, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name="chevron-right" color={C.white} size={22} strokeWidth={2} />
      </Press>
    </View>
  );
}
