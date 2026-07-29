import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedHeart } from '@/components/animated-heart';
import { DESTINATIONS } from '@/data/destinations';
import { useFavorites } from '@/store/favorites';

function EmptyState() {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="mt-24 items-center px-10"
    >
      <View className="h-20 w-20 items-center justify-center rounded-full bg-white">
        <Ionicons name="heart-outline" size={34} color="#C4C4C4" />
      </View>
      <Text className="mt-5 text-[19px] font-semibold text-ink">
        No favorites yet
      </Text>
      <Text className="mt-2 text-center text-[15px] leading-[22px] text-muted">
        Tap the heart on any destination and it will show up here for quick
        access.
      </Text>
    </Animated.View>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { ids, toggle } = useFavorites();

  const favorites = ids
    .map((id) => DESTINATIONS.find((d) => d.id === id))
    .filter((d): d is (typeof DESTINATIONS)[number] => Boolean(d));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <View className="px-6 pt-3">
        <Text className="text-[28px] font-bold text-ink">Favorites</Text>
        <Text className="mt-1 text-[15px] text-muted">
          {favorites.length > 0
            ? `${favorites.length} ${
                favorites.length === 1 ? 'place' : 'places'
              } saved`
            : 'Places you love, saved in one spot'}
        </Text>
      </View>

      {favorites.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 130 }}
        >
          {favorites.map((destination, index) => (
            <Animated.View
              key={destination.id}
              entering={FadeInDown.duration(450)
                .delay(index * 70)
                .springify()
                .damping(18)
                .stiffness(180)}
              exiting={FadeIn.duration(250)}
              layout={LinearTransition.springify().damping(20).stiffness(180)}
              className="mb-4"
            >
              <Pressable
                onPress={() => router.push(`/destination/${destination.id}`)}
                className="overflow-hidden rounded-[28px] bg-white"
              >
                <View className="relative">
                  <Image
                    source={{ uri: destination.image }}
                    style={{ width: '100%', height: 180 }}
                    contentFit="cover"
                    transition={250}
                  />
                  <Pressable
                    onPress={() => toggle(destination.id)}
                    hitSlop={8}
                    className="absolute right-4 top-4 h-11 w-11 items-center justify-center rounded-full bg-white"
                  >
                    <AnimatedHeart active size={20} />
                  </Pressable>
                </View>

                <View className="flex-row items-center justify-between px-5 py-4">
                  <View className="flex-1 pr-3">
                    <Text className="text-[19px] font-semibold text-ink">
                      {destination.name}
                    </Text>
                    <View className="mt-1 flex-row items-center gap-2">
                      <Text className="text-[15px]">{destination.flag}</Text>
                      <Text className="text-[14px] text-muted">
                        {destination.country}
                      </Text>
                      <Text className="text-muted"> · </Text>
                      <Ionicons name="star-outline" size={13} color="#191919" />
                      <Text className="text-[14px] font-medium text-ink">
                        {destination.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-[#161616]">
                    <Feather name="arrow-right" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
