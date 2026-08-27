import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming,
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

/**
 * The confirmation an action gives when it is pressed.
 *
 * The row used to slide shut the instant the action fired, which meant the
 * only evidence anything had happened was a state change with nothing on
 * screen to show for it. Now the icon shakes, the phone taps back, and the row
 * holds open long enough to see the icon settle into its new state before it
 * closes itself.
 */

/** How far the icon swings, and how long each swing takes. */
const SHAKE_DEGREES = 11;
const SHAKE_STEP_MS = 55;

/**
 * The action's own effect is deferred by a beat so the shake starts first and
 * the icon changes underneath it. The icon is driven by the caller's state, so
 * delaying the state change IS delaying the swap — there is no second copy of
 * it here to fall out of step.
 */
const EFFECT_DELAY_MS = 180;

/** Long enough to read the settled icon, short enough not to feel stuck. */
const CLOSE_DELAY_MS = 600;

function ActionButton({ action, onDone }: { action: SwipeAction; onDone: () => void }) {
  const shake = useSharedValue(0);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${shake.value}deg` }] }));

  const press = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    shake.value = withSequence(
      withTiming(-SHAKE_DEGREES, { duration: SHAKE_STEP_MS }),
      withTiming(SHAKE_DEGREES, { duration: SHAKE_STEP_MS }),
      withTiming(-SHAKE_DEGREES * 0.6, { duration: SHAKE_STEP_MS }),
      withTiming(SHAKE_DEGREES * 0.6, { duration: SHAKE_STEP_MS }),
      withTiming(0, { duration: SHAKE_STEP_MS })
    );
    timers.current.push(setTimeout(action.onPress, EFFECT_DELAY_MS));
    timers.current.push(setTimeout(onDone, CLOSE_DELAY_MS));
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.a11yLabel}
      onPress={press}
      style={{ width: ACTION_WIDTH, backgroundColor: action.color }}
      className="items-center justify-center gap-1.5"
    >
      <Animated.View style={spin}>
        <Icon name={action.icon} size={24} color={ACTION_FOREGROUND_COLOR} />
      </Animated.View>
      <Text style={{ color: ACTION_FOREGROUND_COLOR, fontFamily: 'Inter_500Medium', fontSize: 13 }}>
        {action.label}
      </Text>
    </Pressable>
  );
}

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
          <ActionButton key={a.key} action={a} onDone={close} />
        ))}
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={slide}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
