import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CloseChatPill } from "@/components/close-chat-pill";
import { GlowBackground } from "@/components/glow-background";
import { Orb } from "@/components/orb";

const TRANSCRIPT =
  "Deploy an autonomous AI agent to monitor liquidity pools. Make it a tactical trading bot.".split(
    " ",
  );
// One transcription "beat" per word: the word fades in muted on its beat
// and turns fully active over the following beat.
const WORD_STEP = 420;
const TRANSCRIPT_DELAY = 900;
const MUTED = "rgba(255, 240, 228, 0.45)";
const ACTIVE = "#FFF7F0";

function TranscriptWord({
  word,
  index,
  progress,
}: {
  word: string;
  index: number;
  progress: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [index, index + 0.5],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    color: interpolateColor(
      progress.value,
      [index + 0.8, index + 1.6],
      [MUTED, ACTIVE],
    ),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [index, index + 0.5],
          [8, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.Text
      style={[
        {
          fontFamily: "InterMedium",
          fontSize: 31,
          lineHeight: 38,
          letterSpacing: -0.5,
        },
        animatedStyle,
      ]}
    >
      {word}{" "}
    </Animated.Text>
  );
}

export default function VoiceScreen() {
  const spin = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false,
    );
    // +1.6 lets the last word finish its muted-to-active transition.
    const beats = TRANSCRIPT.length + 1.6;
    progress.value = withDelay(
      TRANSCRIPT_DELAY,
      withTiming(beats, { duration: beats * WORD_STEP, easing: Easing.linear }),
    );
  }, [spin, progress]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  return (
    <View className="flex-1 bg-[#060302]">
      <Animated.View
        className="flex-1"
        entering={SlideInDown.duration(560).easing(Easing.out(Easing.cubic))}
      >
        <GlowBackground bright />
        <SafeAreaView className="flex-1">
          <View className="pt-2">
            <CloseChatPill />
          </View>

          {/* Listening orb: the light side circles the sphere */}
          <View className="items-center pt-8">
            <Animated.View style={spinStyle}>
              <Orb size={250} glow />
            </Animated.View>
            <Text className="-mt-4 font-inter text-[13px] text-content-faint">
              Aira is listening....
            </Text>
          </View>

          <View className="flex-1" />

          {/* Live transcript: each word lands muted, then turns active */}
          <View
            className="flex-row flex-wrap justify-center px-6"
            accessible
            accessibilityLabel={TRANSCRIPT.join(" ")}
          >
            {TRANSCRIPT.map((word, index) => (
              <TranscriptWord
                key={`${word}-${index}`}
                word={word}
                index={index}
                progress={progress}
              />
            ))}
          </View>

          <View className="flex-1" />

          {/* Controls */}
          <View className="mb-6 flex-row items-center justify-center gap-14">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pause recording"
              className="h-11 w-11 items-center justify-center rounded-full border border-white/25 active:opacity-70"
            >
              <Feather
                name="pause"
                size={16}
                color="rgba(255, 240, 228, 0.8)"
              />
            </Pressable>

            <View className="h-[120px] w-[120px] items-center justify-center rounded-full border border-hairline bg-white/5">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Stop recording"
                onPress={() => router.replace("/chat")}
                className="active:opacity-85"
                style={{
                  borderRadius: 46,
                  shadowColor: "#FF6B00",
                  shadowOpacity: 0.6,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 12,
                }}
              >
                <LinearGradient
                  colors={["#FF9330", "#E85300"]}
                  start={{ x: 0.3, y: 0 }}
                  end={{ x: 0.7, y: 1 }}
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 46,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="mic" size={30} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send transcript"
              onPress={() => router.replace("/chat")}
              className="h-11 w-11 items-center justify-center active:opacity-70"
            >
              <Feather name="send" size={22} color="rgba(255, 240, 228, 0.8)" />
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
