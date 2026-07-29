import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Wordmark from "../components/Wordmark";

// Only Home has a screen so far; the rest are placed but inert until built.
const LINKS = [
  { label: "Home", href: "/" as const },
  { label: "Booking", href: null },
  { label: "Cart", href: null },
  { label: "Check Out", href: null },
  { label: "Delivery", href: null },
];

function CloseIcon({ size = 34, color = "#F5EDDF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 34 34">
      <Line x1="3" y1="8" x2="31" y2="26" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <Line x1="31" y1="8" x2="3" y2="26" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

export default function Menu() {
  const insets = useSafeAreaInsets();
  // Per word: reveal (scale/opacity up) + shake (settle wobble).
  const items = useRef(
    LINKS.map(() => ({ reveal: new Animated.Value(0), shake: new Animated.Value(0) }))
  ).current;

  useEffect(() => {
    Animated.parallel(
      items.map((it, i) =>
        Animated.sequence([
          Animated.delay(i * 170),
          Animated.parallel([
            Animated.spring(it.reveal, {
              toValue: 1,
              friction: 5,
              tension: 130,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(it.shake, { toValue: 1, duration: 45, useNativeDriver: true }),
              Animated.timing(it.shake, { toValue: -1, duration: 50, useNativeDriver: true }),
              Animated.timing(it.shake, { toValue: 0.55, duration: 45, useNativeDriver: true }),
              Animated.timing(it.shake, { toValue: -0.35, duration: 45, useNativeDriver: true }),
              Animated.timing(it.shake, { toValue: 0, duration: 45, useNativeDriver: true }),
            ]),
          ]),
        ])
      )
    ).start();
  }, [items]);

  return (
    <View className="flex-1 bg-chompo-red">
      {/* chrome — wordmark left, close right */}
      <View
        style={{ paddingTop: insets.top + 14 }}
        className="flex-row items-center justify-between px-6"
      >
        <Wordmark size={17} />
        <Pressable
          hitSlop={16}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        >
          <CloseIcon />
        </Pressable>
      </View>

      <View className="flex-1" />

      {/* nav stack, bottom-left */}
      <View style={{ paddingBottom: insets.bottom + 34 }} className="px-6 items-start">
        {LINKS.map((link, i) => (
          <Animated.View
            key={link.label}
            style={{
              opacity: items[i].reveal,
              transform: [
                { scale: items[i].reveal.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) },
                {
                  translateX: items[i].shake.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-8, 8],
                  }),
                },
              ],
            }}
          >
            <Pressable
              disabled={!link.href}
              onPress={() => link.href && router.dismissTo(link.href)}
              accessibilityRole="link"
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Archivo_900Black",
                  fontSize: 46,
                  lineHeight: 54,
                  letterSpacing: -1.5,
                }}
                className="text-chompo-cream"
              >
                {link.label}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
