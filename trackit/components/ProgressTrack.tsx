import { useEffect, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { useIsFocused } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';

type Props = {
  /** 0..1 */
  progress: number;
  tone: 'brand' | 'amber' | 'muted';
  /** Featured (dark) card vs shipment (light) card. */
  dark?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Rock the ferry gently while it's still on its way. */
  sailing?: boolean;
  delay?: number;
};

const KNOB = 28;
const RAIL = 6;

export function ProgressTrack({
  progress,
  tone,
  dark = false,
  icon = 'ferry',
  sailing = true,
  delay = 0,
}: Props) {
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const [width, setWidth] = useState(0);

  const target = Math.min(1, Math.max(0, progress));
  const p = useSharedValue(reduceMotion ? target : 0);
  const bob = useSharedValue(0);

  const fill =
    tone === 'brand' ? colors.brandTrack : tone === 'amber' ? colors.amberTrack : colors.mutedSoft;
  const fillFrom =
    tone === 'brand'
      ? 'rgba(78,190,104,0)'
      : tone === 'amber'
        ? 'rgba(242,174,63,0)'
        : 'rgba(138,144,152,0)';

  // Refills whenever the screen regains focus so it lands in step with the
  // card sliding back in.
  useEffect(() => {
    if (reduceMotion) {
      p.value = target;
      return;
    }
    if (!focused) {
      p.value = 0;
      return;
    }
    p.value = 0;
    p.value = withDelay(
      delay,
      withTiming(target, { duration: 1100, easing: Easing.bezier(0.22, 1, 0.36, 1) })
    );
  }, [focused, target, delay, reduceMotion, p]);

  // Rocks only while the screen is on stage, and only once the rail it rides
  // has finished filling.
  useEffect(() => {
    if (reduceMotion || !focused || !sailing) {
      bob.value = 0;
      return;
    }
    bob.value = withDelay(
      delay + 900,
      withRepeat(
        withSequence(
          withTiming(-1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, [focused, sailing, delay, reduceMotion, bob]);

  const fillStyle = useAnimatedStyle(() => ({ width: width * p.value }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: width * p.value - KNOB / 2 }],
  }));
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={{ height: KNOB, justifyContent: 'center' }} onLayout={onLayout}>
      {/* unfilled rail */}
      <View
        style={{
          height: RAIL,
          borderRadius: RAIL / 2,
          backgroundColor: dark ? colors.darkTrack : colors.white,
        }}
      />

      {/* filled portion — the gradient is laid out at the full rail width so it
          doesn't squash while the bar grows */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            height: RAIL,
            borderRadius: RAIL / 2,
            overflow: 'hidden',
          },
          fillStyle,
        ]}
      >
        <LinearGradient
          colors={[fillFrom, fill]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: Math.max(width, 1), height: RAIL }}
        />
      </Animated.View>

      {/* knob */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            width: KNOB,
            height: KNOB,
            borderRadius: KNOB / 2,
            backgroundColor:
              tone === 'brand' ? colors.brand : tone === 'amber' ? colors.amberTrack : colors.mutedSoft,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: tone === 'brand' ? '#3EDB77' : tone === 'amber' ? '#F2AE3F' : '#8A9098',
            shadowOpacity: dark ? 0.55 : 0.45,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            elevation: 4,
          },
          knobStyle,
        ]}
      >
        <Animated.View style={bobStyle}>
          <MaterialCommunityIcons name={icon} size={15} color={colors.white} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
