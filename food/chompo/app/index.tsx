import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import WaveWordmark from "../components/WaveWordmark";

// High-res clean macro (Pexels #15623451). burger_full.jpg has "CHOMPO"
// baked in; burger_top.jpg is clean but low-res/soft.
const burger = require("../assets/img/burger_hero.jpg");

export default function Splash() {
  return (
    <Pressable className="flex-1 bg-chompo-ink" onPress={() => router.push("/brand")}>
      {/* Background is just the burger photo — bright and clear. */}
      <Image
        source={burger}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        contentFit="cover"
      />

      {/* center lockup — letters jump in like a wave */}
      <View className="flex-1 items-center justify-center">
        <WaveWordmark
          size={72}
          color="#FFFFFF"
          letterStyle={{
            textShadowColor: "rgba(0,0,0,0.4)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 6,
          }}
        />
      </View>
    </Pressable>
  );
}
