import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
import { font } from '@/theme/type';
import { Avatar } from './art/Avatar';
import { BellIcon } from './art/TabIcons';
import { PressableScale } from './motion';

const BELL = 48;

export function Header({
  name,
  location,
  onNotifications,
}: {
  name: string;
  location: string;
  onNotifications?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1.35, { duration: 620, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 620, easing: Easing.in(Easing.quad) }),
          withTiming(1, { duration: 1800 })
        ),
        -1,
        false
      )
    );
  }, [reduceMotion, pulse]);

  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Avatar size={52} />

      <View style={{ marginLeft: 14, flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 19,
            lineHeight: 23,
            fontFamily: font.bold,
            color: colors.ink,
            letterSpacing: -0.35,
          }}
        >
          {name}
        </Text>

        <View style={{ marginTop: 3, flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="map-pin" size={14} color={colors.muted} />
          <Text style={{ marginLeft: 5, fontSize: 14, fontFamily: font.regular, color: colors.muted }}>
            {location}
          </Text>
          <Feather
            name="chevron-down"
            size={16}
            color={colors.muted}
            style={{ marginLeft: 6, marginTop: 1 }}
          />
        </View>
      </View>

      <PressableScale
        onPress={onNotifications}
        to={0.9}
        style={{
          width: BELL,
          height: BELL,
          borderRadius: BELL / 2,
          backgroundColor: colors.bell,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BellIcon color={colors.ink} size={23} />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 12,
              right: 11.5,
              width: 9,
              height: 9,
              borderRadius: 4.5,
              backgroundColor: colors.alert,
            },
            dotStyle,
          ]}
        />
      </PressableScale>
    </View>
  );
}
