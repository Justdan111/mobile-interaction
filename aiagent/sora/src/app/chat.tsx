import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInLeft,
  FadeInRight,
  SlideInDown,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatBubble, type ChatMessage } from "@/components/chat-bubble";
import { CloseChatPill } from "@/components/close-chat-pill";
import { GlowBackground } from "@/components/glow-background";

const MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    text: "Deploy an autonomous AI agent to monitor liquidity pools",
  },
  {
    id: "2",
    role: "ai",
    text: "Deployed AlphaRaptor.sh to your agent network. The automation loop is active. Need to configure risk mitigation parameters?",
  },
  {
    id: "3",
    role: "user",
    text: "Show me the active core parameters.",
  },
  {
    id: "4",
    role: "ai",
    text: "Core agent parameters initialized.",
  },
];

// Bubbles start arriving once the screen has slid into place.
const MESSAGE_BASE_DELAY = 550;
const MESSAGE_STAGGER = 260;

export default function ChatScreen() {
  const [draft, setDraft] = useState("");

  return (
    <View className="flex-1 bg-[#060302]">
      <Animated.View
        className="flex-1"
        entering={SlideInDown.duration(560).easing(Easing.out(Easing.cubic))}
      >
        <GlowBackground />
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="pt-2">
              <CloseChatPill />
            </View>

            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-7 px-4 pb-4 pt-8"
              showsVerticalScrollIndicator={false}
            >
              {MESSAGES.map((message, index) => (
                <Animated.View
                  key={message.id}
                  entering={(message.role === "user" ? FadeInRight : FadeInLeft)
                    .duration(480)
                    .delay(MESSAGE_BASE_DELAY + index * MESSAGE_STAGGER)
                    .easing(Easing.out(Easing.cubic))}
                >
                  <ChatBubble message={message} />
                </Animated.View>
              ))}
              <Animated.Text
                entering={FadeIn.duration(450).delay(
                  MESSAGE_BASE_DELAY + MESSAGES.length * MESSAGE_STAGGER + 150,
                )}
                className="pl-[50px] font-inter text-[13px] text-content-faint"
              >
                Aira is working....
              </Animated.Text>
            </ScrollView>

            {/* Input bar */}
            <View className="mx-3 mb-2 h-[62px] flex-row items-center rounded-full border border-hairline bg-[#1A100AB3] pl-5 pr-4">
              <Feather
                name="paperclip"
                size={19}
                color="rgba(255, 240, 228, 0.7)"
              />
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Ask AI a question"
                placeholderTextColor="rgba(255, 236, 224, 0.5)"
                keyboardAppearance="dark"
                selectionColor="#FF6B00"
                className="ml-3 flex-1 font-inter text-[17px] text-content-primary"
                accessibilityLabel="Ask AI a question"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dictate with your voice"
                onPress={() => router.push("/voice")}
                className="h-10 w-10 items-center justify-center active:opacity-70"
              >
                <Feather name="mic" size={20} color="#F5EDE6" />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
