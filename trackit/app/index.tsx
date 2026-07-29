import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  Easing,
  interpolate,
  Extrapolation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { BoxMark } from '@/components/BoxMark';
import { MotionLines } from '@/components/MotionLines';
import { colors } from '@/theme/colors';
import { font } from '@/theme/type';

const BOX = 60;
const LINES_W = 28;
const MARK_W = LINES_W + BOX; // motion lines + box
const GAP_TEXT = 12;
const TEXT_LEFT = MARK_W + GAP_TEXT;
const FONT = 34;

// White "fume" puffs that burst from the box, drift out, shrink and vanish.
// Offsets are relative to the box centre; they fan up and to the left.
const PARTICLES = [
  { dx: -8, dy: -46, size: 15, delay: 0 },
  { dx: -24, dy: -33, size: 12, delay: 30 },
  { dx: 12, dy: -40, size: 10, delay: 70 },
  { dx: -38, dy: -18, size: 9, delay: 50 },
  { dx: 2, dy: -58, size: 8, delay: 120 },
  { dx: -46, dy: 4, size: 7, delay: 110 },
  { dx: 26, dy: -20, size: 6, delay: 150 },
];

function Particle({
  p,
  progress,
}: {
  p: (typeof PARTICLES)[number];
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const t = progress.value;
    return {
      opacity: interpolate(t, [0, 0.15, 1], [0, 0.9, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: p.dx * t },
        { translateY: p.dy * t },
        { scale: interpolate(t, [0, 0.25, 1], [0.3, 1, 0], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: p.size,
          height: p.size,
          borderRadius: p.size / 2,
          marginLeft: -p.size / 2,
          marginTop: -p.size / 2,
          backgroundColor: '#FFFFFF',
          pointerEvents: 'none',
        },
        style,
      ]}
    />
  );
}

export default function Splash() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [textWidth, setTextWidth] = useState(0);

  // Shared values driving the sequence.
  const boxScale = useSharedValue(reduceMotion ? 1 : 0);
  const boxOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const markX = useSharedValue(0);
  const linesOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const textOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const textScale = useSharedValue(reduceMotion ? 1 : 0.35);
  const burst = PARTICLES.map(() => useSharedValue(0));

  const centerShift = (GAP_TEXT + textWidth) / 2;

  // Kick off the animation once we know how wide the wordmark is.
  useEffect(() => {
    if (textWidth === 0) return;

    if (reduceMotion) {
      const t = setTimeout(() => router.replace('/onboarding'), 1200);
      return () => clearTimeout(t);
    }

    // 1) Box bounces in, centred on screen.
    markX.value = centerShift;
    boxOpacity.value = withTiming(1, { duration: 200 });
    boxScale.value = withSequence(
      withTiming(1.18, { duration: 320, easing: Easing.out(Easing.cubic) }),
      withSpring(1, { damping: 7, stiffness: 150, mass: 0.7 })
    );

    // 2) Fume particles burst outward, then shrink and vanish.
    burst.forEach((v, i) => {
      v.value = withDelay(
        480 + PARTICLES[i].delay,
        withTiming(1, { duration: 560, easing: Easing.out(Easing.quad) })
      );
    });

    // 3) Box slides to the left while the wordmark pulls out and grows in.
    markX.value = withDelay(900, withTiming(0, { duration: 680, easing: Easing.inOut(Easing.cubic) }));
    linesOpacity.value = withDelay(980, withTiming(1, { duration: 460 }));
    textOpacity.value = withDelay(1000, withTiming(1, { duration: 420 }));
    textScale.value = withDelay(
      1000,
      withTiming(1, { duration: 620, easing: Easing.out(Easing.back(1.4)) })
    );

    // 4) Hold, then advance to onboarding.
    const t = setTimeout(() => router.replace('/onboarding'), 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textWidth, reduceMotion]);

  const markStyle = useAnimatedStyle(() => ({ transform: [{ translateX: markX.value }] }));
  const boxStyle = useAnimatedStyle(() => ({
    opacity: boxOpacity.value,
    transform: [{ scale: boxScale.value }],
  }));
  const linesStyle = useAnimatedStyle(() => ({ opacity: linesOpacity.value }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.splash }}>
      <StatusBar style="light" />

      {/* Invisible measurer to size the wordmark before animating. */}
      {textWidth === 0 ? (
        <Animated.Text
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
          style={{
            position: 'absolute',
            opacity: 0,
            fontSize: FONT,
            fontFamily: font.bold,
            letterSpacing: -0.5,
          }}
        >
          trackit.
        </Animated.Text>
      ) : null}

      {textWidth > 0 ? (
        <View style={{ width: TEXT_LEFT + textWidth, height: BOX, justifyContent: 'center' }}>
          {/* Mark: motion lines + box (+ particle burst) */}
          <Animated.View
            style={[
              { position: 'absolute', left: 0, top: 0, width: MARK_W, height: BOX, flexDirection: 'row', alignItems: 'center' },
              markStyle,
            ]}
          >
            <Animated.View style={linesStyle}>
              <MotionLines width={LINES_W} />
            </Animated.View>
            <Animated.View style={boxStyle}>
              <BoxMark size={BOX} />
            </Animated.View>

            {/* particles originate at the box centre */}
            <View style={{ position: 'absolute', left: LINES_W + BOX / 2, top: BOX / 2, pointerEvents: 'none' }}>
              {PARTICLES.map((p, i) => (
                <Particle key={i} p={p} progress={burst[i]} />
              ))}
            </View>
          </Animated.View>

          {/* Wordmark */}
          <Animated.Text
            style={[
              {
                position: 'absolute',
                left: TEXT_LEFT,
                fontSize: FONT,
                fontFamily: font.bold,
                letterSpacing: -0.5,
                color: colors.wordmark,
                transformOrigin: 'left center',
              },
              textStyle,
            ]}
          >
            trackit.
          </Animated.Text>
        </View>
      ) : null}
    </View>
  );
}
