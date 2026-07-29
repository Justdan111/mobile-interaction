import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  active: boolean;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
};

// Heart icon that "pops" whenever it becomes active, like a like button.
export function AnimatedHeart({
  active,
  size = 22,
  activeColor = '#FF5A5F',
  inactiveColor = '#FFFFFF',
}: Props) {
  const scale = useSharedValue(1);
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current) {
      scale.value = withSequence(
        withSpring(1.4, { damping: 5, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 220 }),
      );
    }
    wasActive.current = active;
  }, [active, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons
        name={active ? 'heart' : 'heart-outline'}
        size={size}
        color={active ? activeColor : inactiveColor}
      />
    </Animated.View>
  );
}
