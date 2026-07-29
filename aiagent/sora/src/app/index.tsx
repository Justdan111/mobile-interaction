import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  SlideInDown,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/gradient-background";
import { IconButton } from "@/components/icon-button";
import { LogoMark } from "@/components/logo-mark";
import { PromptPanel } from "@/components/prompt-panel";
import { SuggestionCard } from "@/components/suggestion-card";

const SUGGESTIONS = [
  "Deploy autonomous agent",
  "Optimize gas for ZK-proofs",
  "Audit DeFi protocol",
  "Stress-test smart contracts",
];

// Entrance choreography: headline words land one by one, then the cards
// cascade in while the composer fades up with them.
const HEADLINE_LINES = [
  ["What", "are", "we"],
  ["building", "today?"],
];
const WORD_STAGGER = 140;
const WORD_DURATION = 420;
const WORD_COUNT = HEADLINE_LINES.flat().length;
// Index of each line's first word within the full headline.
const LINE_OFFSETS = HEADLINE_LINES.map((_, lineIndex) =>
  HEADLINE_LINES.slice(0, lineIndex).reduce(
    (count, line) => count + line.length,
    0,
  ),
);
const CARDS_BASE_DELAY = WORD_STAGGER * WORD_COUNT + 250;
const CARD_STAGGER = 150;

export default function HomeScreen() {
  const [prompt, setPrompt] = useState("");

  return (
    <View className="flex-1 bg-ember-night">
      <Animated.View
        className="flex-1"
        entering={SlideInDown.duration(1000).easing(Easing.out(Easing.cubic))}
      >
        <GradientBackground />
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {/* Header */}
            <View className="flex-row items-center gap-3 px-5 pt-2">
              <LogoMark size={46} />
              <View>
                <Text className="font-inter text-[15px] leading-[20px] text-content-muted">
                  Roobinium,
                </Text>
                <Text className="font-inter-medium text-[15px] leading-[20px] text-content-primary">
                  Welcome back
                </Text>
              </View>
              <View className="flex-1" />
              <IconButton accessibilityLabel="Notifications">
                <Feather name="bell" size={19} color="#F5EDE6" />
              </IconButton>
              <IconButton accessibilityLabel="Menu">
                <Feather name="list" size={19} color="#F5EDE6" />
              </IconButton>
            </View>

            <View className="flex-1" />

            {/* Headline: one word at a time */}
            <View
              className="px-6 pb-6"
              accessible
              accessibilityLabel="What are we building today?"
            >
              {HEADLINE_LINES.map((line, lineIndex) => (
                <View key={line.join(" ")} className="flex-row">
                  {line.map((word, indexInLine) => {
                    const delay =
                      (LINE_OFFSETS[lineIndex] + indexInLine) * WORD_STAGGER;
                    return (
                      <Animated.View
                        key={word}
                        entering={FadeInDown.duration(WORD_DURATION)
                          .delay(delay)
                          .easing(Easing.out(Easing.cubic))}
                      >
                        <Text className="font-inter-semibold text-[42px] leading-[47px] tracking-tight text-content-primary">
                          {indexInLine < line.length - 1 ? `${word} ` : word}
                        </Text>
                      </Animated.View>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Quick-prompt cards: cascade in after the headline */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 grow-0"
              contentContainerClassName="gap-3 px-5"
            >
              {SUGGESTIONS.map((label, index) => (
                <Animated.View
                  key={label}
                  entering={FadeInDown.duration(450)
                    .delay(CARDS_BASE_DELAY + index * CARD_STAGGER)
                    .easing(Easing.out(Easing.cubic))}
                >
                  <SuggestionCard label={label} onPress={setPrompt} />
                </Animated.View>
              ))}
            </ScrollView>

            {/* Composer: fades up together with the cards */}
            <Animated.View
              className="h-[36%]"
              entering={FadeIn.duration(600)
                .delay(CARDS_BASE_DELAY)
                .easing(Easing.out(Easing.quad))}
            >
              <PromptPanel
                value={prompt}
                onChangeText={setPrompt}
                model="Opus 4.8"
                onSubmit={() => router.push("/chat")}
                onPressAttach={() => {}}
                onPressModel={() => {}}
                onPressMic={() => router.push("/voice")}
              />
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
