import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FoodPattern from "../components/FoodPattern";
import Wordmark from "../components/Wordmark";

const RED = "#E13B33";
const OUTLINE = "#A62A1D";

export default function Brand() {
  const insets = useSafeAreaInsets();
  const converge = useRef(new Animated.Value(0)).current; // pattern flies in
  const reveal = useRef(new Animated.Value(0)).current; // wordmark pops
  const hint = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(converge, {
        toValue: 1,
        duration: 1300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(reveal, {
        toValue: 1,
        friction: 6,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(hint, { toValue: 1, duration: 900, delay: 1600, useNativeDriver: true }),
        Animated.timing(hint, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [converge, reveal, hint]);

  return (
    <Pressable className="flex-1 bg-chompo-red" onPress={() => router.push("/menu")}>
      <FoodPattern tile={53} scale={1.52} color="#F5EDDF" detail={OUTLINE} opacity={1} progress={converge} />

      {/* The clearing — flat red seat so the wordmark reads in the middle */}
      <View className="flex-1 items-center justify-center">
        <View
          pointerEvents="none"
          className="absolute h-56 w-80 overflow-hidden"
          style={{ borderRadius: 130 }}
        >
          <LinearGradient
            colors={["rgba(225,59,51,0)", RED, RED, "rgba(225,59,51,0)"]}
            locations={[0, 0.28, 0.72, 1]}
            style={{ flex: 1 }}
          />
        </View>

        <Animated.View
          style={{
            opacity: reveal,
            transform: [{ scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }],
          }}
          className="items-center"
        >
          <Wordmark size={42} />
        </Animated.View>
      </View>

      {/* tap hint */}
      <Animated.View
        style={{ opacity: hint, paddingBottom: insets.bottom + 26, alignItems: "center", width: "100%" }}
      >
        <Text
          allowFontScaling={false}
          style={{ fontFamily: "Archivo_700Bold", letterSpacing: 2, textAlign: "center" }}
          className="text-chompo-cream/80 text-[11px]"
        >
          TAP TO OPEN MENU
        </Text>
      </Animated.View>
    </Pressable>
  );
}
