import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import type { TabTriggerSlotProps } from 'expo-router/ui';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { font } from '@/theme/type';
import type { TabIconProps } from './art/TabIcons';

const AnimatedText = Animated.createAnimatedComponent(Text);

export type TabButtonProps = TabTriggerSlotProps & {
  icon: (p: TabIconProps) => React.JSX.Element;
  label: string;
};

/**
 * One item in the bottom bar. Becoming active springs the mark up a couple of
 * points and crossfades it from the muted outline to the solid dark version.
 */
export function TabButton({ icon: Icon, label, isFocused, ...props }: TabButtonProps) {
  const reduceMotion = useReducedMotion();
  const active = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    const to = Number(Boolean(isFocused));
    active.value = reduceMotion ? to : withSpring(to, { damping: 16, stiffness: 220, mass: 0.6 });
  }, [isFocused, reduceMotion, active]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * active.value }, { scale: 1 + 0.06 * active.value }],
  }));
  const activeIconStyle = useAnimatedStyle(() => ({ opacity: active.value }));
  const idleIconStyle = useAnimatedStyle(() => ({ opacity: 1 - active.value }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.min(1, Math.max(0, active.value)),
      [0, 1],
      [colors.tabInactive, colors.ink]
    ),
    transform: [{ translateY: -2 * active.value }],
  }));

  return (
    <Pressable
      {...props}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}
      hitSlop={10}
    >
      <Animated.View style={[{ width: 25, height: 25 }, iconStyle]}>
        <Animated.View style={[{ position: 'absolute' }, idleIconStyle]}>
          <Icon color={colors.tabInactive} size={25} />
        </Animated.View>
        <Animated.View style={[{ position: 'absolute' }, activeIconStyle]}>
          <Icon color={colors.tabActive} size={25} focused />
        </Animated.View>
      </Animated.View>

      <AnimatedText
        style={[
          {
            marginTop: 5,
            fontSize: 12.5,
            fontFamily: isFocused ? font.bold : font.regular,
            letterSpacing: -0.1,
          },
          labelStyle,
        ]}
      >
        {label}
      </AnimatedText>
    </Pressable>
  );
}
