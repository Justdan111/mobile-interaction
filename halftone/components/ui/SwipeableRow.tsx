import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS, useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Icon, type IconName } from './icons';
import { ACTION_FOREGROUND_COLOR } from '../../lib/tokens';

export type SwipeAction = {
  key: string;
  label: string;
  /** Accessible name; the visible label stays short like the comps. */
  a11yLabel: string;
  icon: IconName;
  color: string;
  onPress: () => void;
};

const ACTION_WIDTH = 84;

export function SwipeableRow({
  actions,
  children,
}: {
  actions: SwipeAction[];
  children: React.ReactNode;
}) {
  const open = actions.length * ACTION_WIDTH;
  const x = useSharedValue(0);
  const start = useSharedValue(0);

  const close = () => {
    x.value = withSpring(0, { damping: 22, stiffness: 240 });
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-14, 14])
    .failOffsetY([-10, 10])
    .onBegin(() => {
      start.value = x.value;
    })
    .onUpdate((e) => {
      const next = start.value + e.translationX;
      x.value = Math.min(0, Math.max(-open - 24, next));
    })
    .onEnd((e) => {
      const shouldOpen = x.value < -open / 2 || e.velocityX < -650;
      if (shouldOpen) {
        x.value = withSpring(-open, { damping: 22, stiffness: 240 });
        runOnJS(Haptics.selectionAsync)();
      } else {
        x.value = withSpring(0, { damping: 22, stiffness: 240 });
      }
    });

  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View className="mb-2.5 overflow-hidden rounded-3xl">
      <View className="absolute bottom-0 right-0 top-0 flex-row">
        {actions.map((a) => (
          <Pressable
            key={a.key}
            accessibilityRole="button"
            accessibilityLabel={a.a11yLabel}
            onPress={() => {
              a.onPress();
              close();
            }}
            style={{ width: ACTION_WIDTH, backgroundColor: a.color }}
            className="items-center justify-center gap-1.5"
          >
            <Icon name={a.icon} size={24} color={ACTION_FOREGROUND_COLOR} />
            <Text style={{ color: ACTION_FOREGROUND_COLOR, fontFamily: 'Inter_500Medium', fontSize: 13 }}>
              {a.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={slide}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
