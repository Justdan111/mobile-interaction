import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { font } from '@/theme/type';
import type { Shipment } from '@/data/shipments';
import { ContainerArt } from './art/ContainerArt';
import { ProgressTrack } from './ProgressTrack';
import { PressableScale, useAmbient } from './motion';

const RADIUS = 26;
const PAD = 20;

/** Near-black card with soft green blooms and faint route wisps behind it. */
function Backdrop() {
  return (
    <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
      <Defs>
        <RadialGradient id="fBloomA" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#2E7A52" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#2E7A52" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="fBloomB" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#1F6B45" stopOpacity={0.45} />
          <Stop offset="1" stopColor="#1F6B45" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={colors.dark} />
      {/* bloom low-left, behind the status block */}
      <Ellipse cx="18%" cy="46%" rx="42%" ry="34%" fill="url(#fBloomB)" />
      {/* bloom bottom-right, under the container */}
      <Ellipse cx="92%" cy="88%" rx="46%" ry="40%" fill="url(#fBloomA)" />
      {/* faint route wisps */}
      <Path
        d="M-10 62 C 70 30, 130 96, 220 54 S 360 96, 420 46"
        stroke="#397A55"
        strokeWidth={1}
        opacity={0.11}
        fill="none"
      />
      <Path
        d="M-10 150 C 90 118, 150 190, 250 140 S 380 176, 430 128"
        stroke="#397A55"
        strokeWidth={1}
        opacity={0.08}
        fill="none"
      />
      <Path d="M52 -10 L120 230" stroke="#3E8A5E" strokeWidth={0.8} opacity={0.1} fill="none" />
    </Svg>
  );
}

export function FeaturedCard({
  shipment,
  railDelay = 520,
  onPress,
}: {
  shipment: Shipment;
  railDelay?: number;
  onPress?: () => void;
}) {
  const ambient = useAmbient();
  const float = useSharedValue(0);

  useEffect(() => {
    if (!ambient) {
      float.value = 0;
      return;
    }
    float.value = withRepeat(
      withSequence(
        withTiming(-3.5, { duration: 1900, easing: Easing.inOut(Easing.sin) }),
        withTiming(3.5, { duration: 1900, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [ambient, float]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));

  return (
    <PressableScale
      onPress={onPress}
      to={0.985}
      style={{
        borderRadius: RADIUS,
        overflow: 'hidden',
        paddingHorizontal: PAD,
        paddingTop: PAD,
        paddingBottom: 14,
        backgroundColor: colors.dark,
      }}
    >
      <Backdrop />

      {/* container art, clipped by the card's right edge */}
      <Animated.View style={[{ position: 'absolute', right: -20, top: 4 }, floatStyle]}>
        <ContainerArt width={170} height={160} />
      </Animated.View>

      <Text
        style={{
          fontSize: 19,
          lineHeight: 23,
          fontFamily: font.semibold,
          color: colors.white,
          letterSpacing: -0.3,
        }}
      >
        {shipment.code}
      </Text>

      <Text
        style={{ marginTop: 16, fontSize: 12, lineHeight: 15, fontFamily: font.regular, color: colors.darkMuted }}
      >
        Current status
      </Text>
      <Text
        style={{
          marginTop: 4,
          fontSize: 16.5,
          lineHeight: 20.5,
          fontFamily: font.semibold,
          color: colors.white,
        }}
      >
        {shipment.status === 'Delivered' ? 'Delivered' : 'In transit'}
      </Text>

      <Text
        style={{ marginTop: 14, fontSize: 12, lineHeight: 15, fontFamily: font.regular, color: colors.darkMuted }}
      >
        Deliverable date
      </Text>
      <Text
        style={{
          marginTop: 5,
          fontSize: 17.5,
          lineHeight: 22,
          fontFamily: font.semibold,
          color: colors.white,
          letterSpacing: -0.2,
        }}
      >
        {shipment.date}
      </Text>

      <View style={{ marginTop: 14 }}>
        <ProgressTrack progress={shipment.progress} tone="brand" dark delay={railDelay} />
      </View>
    </PressableScale>
  );
}
