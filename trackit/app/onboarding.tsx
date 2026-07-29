import { useEffect, type ReactNode } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';

const containerImg = require('@/assets/images/onboarding-container.png');

// Smooth, gentle deceleration (expo-like ease-out) shared across the intro.
const SMOOTH = Easing.bezier(0.16, 1, 0.3, 1);

/** Fades + slides its children up from below, after an optional stagger delay. */
function RiseIn({
  delay,
  reduceMotion,
  children,
}: {
  delay: number;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const y = useSharedValue(reduceMotion ? 0 : 30);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    y.value = withDelay(delay, withTiming(0, { duration: 820, easing: SMOOTH }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 760, easing: Easing.out(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function Onboarding() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  // Container drops in from the top (up -> down), starting at the same time as the text.
  const dropY = useSharedValue(reduceMotion ? 0 : -220);
  const dropOpacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    dropOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
    dropY.value = withTiming(0, { duration: 1350, easing: SMOOTH });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dropStyle = useAnimatedStyle(() => ({
    opacity: dropOpacity.value,
    transform: [{ translateY: dropY.value }],
  }));

  return (
    <View className="flex-1 bg-[#0E1A14]">
      <StatusBar style="light" />

      {/* Hero */}
      <View style={{ height: '56%' }}>
        <LinearGradient
          colors={['#1E3B2A', '#132018', '#0E1A14']}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={{ flex: 1 }}
        >
          <Animated.View
            style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, dropStyle]}
          >
            <Image
              source={containerImg}
              resizeMode="cover"
              style={{
                width: '116%',
                height: '100%',
                marginLeft: '-20%',
                transform: [{ scaleX: -1 }],
              }}
            />
          </Animated.View>

          {/* fade the image base into the dark background */}
          <LinearGradient
            colors={['transparent', 'rgba(14,26,20,0)', '#0E1A14']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%' }}
          />
        </LinearGradient>
      </View>

      {/* Content */}
      <SafeAreaView edges={['bottom']} className="flex-1 justify-end px-6 pb-3">
        <RiseIn delay={0} reduceMotion={reduceMotion}>
          <View className="mb-5 flex-row items-center self-start rounded-full border border-white/15 bg-white/10 px-4 py-2">
            <MaterialCommunityIcons name="cube-outline" size={16} color={colors.brand} />
            <Text className="ml-2 text-sm font-dm-medium text-white">Simplify your logistics</Text>
          </View>
        </RiseIn>

        <RiseIn delay={190} reduceMotion={reduceMotion}>
          <Text className="text-[40px] font-dm-bold leading-[46px] text-white">
            Streamline your{'\n'}
            <Text className="text-brand-500 font-dm-bold">shipment</Text> process
          </Text>
        </RiseIn>

        <RiseIn delay={380} reduceMotion={reduceMotion}>
          <Text className="mt-4 text-base leading-6 text-white/60 font-dm">
            Manage your cargo with advanced tracking and reliable delivery all in one platform.
          </Text>
        </RiseIn>

        <RiseIn delay={570} reduceMotion={reduceMotion}>
          <Pressable
            onPress={() => router.replace('/home')}
            className="mt-7 items-center rounded-full bg-white py-5"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Text className="text-base font-dm-bold text-brand-600">Continue</Text>
          </Pressable>
        </RiseIn>
      </SafeAreaView>
    </View>
  );
}
