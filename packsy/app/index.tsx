import React, { useEffect } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { art } from '../lib/art';
import { C } from '../theme/colors';
import { Press } from '../components/ui/Press';

/** Rings from `.design/comps/welcome.png`: two solid inner, three dashed outer. */
const SOLID = [150, 205];
const DASHED = [262, 322, 388];

function Rings({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const turn = useSharedValue(0);
  useEffect(() => {
    turn.value = withRepeat(withTiming(1, { duration: 90000, easing: Easing.linear }), -1, false);
  }, [turn]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 360}deg` }] }));
  const half = size / 2;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: cx - half, top: cy - half, width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {SOLID.map((r) => (
          <Circle key={r} cx={half} cy={half} r={r} stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={1} fill="none" />
        ))}
      </Svg>
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, spin]}>
        <Svg width={size} height={size}>
          {DASHED.map((r, i) => (
            <Circle
              key={r}
              cx={half}
              cy={half}
              r={r}
              stroke="#FFFFFF"
              strokeOpacity={0.24 - i * 0.04}
              strokeWidth={1.4}
              strokeDasharray={`${14 + i * 4} ${16 + i * 6}`}
              fill="none"
            />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const centreY = height * 0.43;
  const box = art['parcel-cube'];

  return (
    <View className="flex-1" style={{ backgroundColor: C.iris }}>
      <StatusBar style="light" />
      <Rings cx={width / 2} cy={centreY} size={900} />

      <Text
        className="font-semibold text-center"
        style={{ color: C.ink, fontSize: 21, marginTop: insets.top + 22 }}
      >
        Packsy
      </Text>

      <View style={{ position: 'absolute', left: 0, right: 0, top: centreY - 150, alignItems: 'center' }}>
        <Animated.Text
          entering={FadeInDown.duration(600).delay(150)}
          className="font-medium"
          style={{ color: C.ink, fontSize: 60, lineHeight: 72, letterSpacing: -0.5 }}
        >
          Delivery,
        </Animated.Text>

        <Animated.View entering={ZoomIn.springify().damping(14).delay(550)} style={{ marginVertical: -2 }}>
          <View
            style={{
              width: 172,
              height: 74,
              borderRadius: 37,
              backgroundColor: C.sun,
              overflow: 'hidden',
            }}
          >
            <Animated.View entering={FadeIn.duration(500).delay(850)} style={{ position: 'absolute', left: 12, top: 4 }}>
              <Image
                source={box.source}
                style={{ width: 76 * box.aspect, height: 76, transform: [{ rotate: '-6deg' }] }}
                contentFit="contain"
                accessibilityLabel="Cardboard parcel"
              />
            </Animated.View>
          </View>
          <Animated.View
            entering={ZoomIn.springify().damping(12).delay(1100)}
            style={{
              position: 'absolute',
              right: -10,
              top: -16,
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#FFFFFF',
              borderWidth: 4,
              borderColor: C.iris,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text className="font-semibold" style={{ color: C.night, fontSize: 14 }}>
              +4
            </Text>
          </Animated.View>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.duration(600).delay(400)}
          className="font-medium"
          style={{ color: C.ink, fontSize: 60, lineHeight: 74, letterSpacing: -0.5 }}
        >
          simplified
        </Animated.Text>

        <Animated.Text
          entering={FadeIn.duration(700).delay(1000)}
          className="font-body text-center"
          style={{ color: C.ink, fontSize: 17, lineHeight: 24, marginTop: 34, width: 270 }}
        >
          Everything you need to track your packages.
        </Animated.Text>
      </View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(1300)}
        style={{ position: 'absolute', left: 24, right: 24, bottom: insets.bottom + 34 }}
      >
        <Press
          onPress={() => router.replace('/home')}
          accessibilityRole="button"
          style={{ height: 58, borderRadius: 29, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text className="font-medium" style={{ color: C.night, fontSize: 16 }}>
            Get Started
          </Text>
        </Press>
      </Animated.View>
    </View>
  );
}
