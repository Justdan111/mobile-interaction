import { useEffect } from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

/** Per-glyph entrance, so a line can be written on one character at a time. */
export type VerticalTextEnter = {
  /** Before the first glyph moves. */
  delay?: number;
  /** Between one glyph and the next. */
  stagger?: number;
  /** How far out each glyph starts, in px. Negative comes from the left. */
  from?: number;
  duration?: number;
};

/**
 * One glyph of a vertical line. It owns its own progress so the line can
 * stagger — a shared value per index can't be hooked from inside a `.map`.
 */
function Glyph({
  glyph,
  style,
  animate,
  delay,
  distance,
  duration,
}: {
  glyph: string;
  style: StyleProp<TextStyle>;
  animate: boolean;
  delay: number;
  distance: number;
  duration: number;
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    if (reduced) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, [animate, delay, distance, duration, progress, reduced]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * distance }],
  }));

  return (
    <Animated.Text allowFontScaling={false} style={[style, animated]}>
      {glyph}
    </Animated.Text>
  );
}

/**
 * Japanese set top-to-bottom, as tategaki. React Native has no `writing-mode`,
 * so each glyph is laid out as its own line — which is also what lets the
 * generous per-character spacing be dialled in directly.
 *
 * Pass `enter` to have the glyphs arrive one by one instead of all at once.
 */
export function VerticalText({
  children,
  size = 15,
  color,
  spacing = 6,
  weight,
  style,
  textStyle,
  enter,
}: {
  children: string;
  size?: number;
  color: string;
  /** Gap between glyphs, on top of the line box. */
  spacing?: number;
  weight?: TextStyle['fontWeight'];
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  enter?: VerticalTextEnter;
}) {
  const glyphs = Array.from(children);

  const animate = enter !== undefined;
  const delay = enter?.delay ?? 0;
  const stagger = enter?.stagger ?? 90;
  const distance = enter?.from ?? -20;
  const duration = enter?.duration ?? 560;

  return (
    <View
      accessible
      accessibilityLabel={children}
      accessibilityRole="text"
      style={[{ alignItems: 'center' }, style]}
    >
      {glyphs.map((glyph, i) => (
        <Glyph
          key={`${glyph}-${i}`}
          glyph={glyph}
          animate={animate}
          delay={delay + i * stagger}
          distance={distance}
          duration={duration}
          style={[
            {
              fontSize: size,
              lineHeight: size * 1.06,
              color,
              fontWeight: weight,
              marginTop: i === 0 ? 0 : spacing,
              textAlign: 'center',
            },
            textStyle,
          ]}
        />
      ))}
    </View>
  );
}
