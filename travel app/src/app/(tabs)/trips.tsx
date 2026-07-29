import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TripsScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <Animated.View entering={FadeInDown.duration(500).springify().damping(18)}>
        <Text className="px-6 pt-3 text-[28px] font-bold text-ink">Trips</Text>
        <Text className="px-6 pt-1 text-[15px] text-muted">
          Your booked adventures
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(400).delay(150)}
        className="mt-24 items-center px-10"
      >
        <View className="h-20 w-20 items-center justify-center rounded-full bg-white">
          <Ionicons name="reader-outline" size={32} color="#C4C4C4" />
        </View>
        <Text className="mt-5 text-[19px] font-semibold text-ink">
          No trips booked yet
        </Text>
        <Text className="mt-2 text-center text-[15px] leading-[22px] text-muted">
          When you book a tour, it will appear here with your full itinerary.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
