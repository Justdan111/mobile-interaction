import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text,  useWindowDimensions, View, } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedHeart } from '@/components/animated-heart';
import { TourCard } from '@/components/tour-card';
import { DESTINATIONS } from '@/data/destinations';
import { useFavorites } from '@/store/favorites';

// Staggered entrance for the sheet content.
const enterFrom = (order: number) =>
  FadeInDown.duration(550)
    .delay(120 + order * 90)
    .springify()
    .damping(18)
    .stiffness(170);

function CircleButton({
  icon,
  onPress,
}: {
  icon: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      className="h-12 w-12 items-center justify-center rounded-full bg-white"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      {icon}
    </Pressable>
  );
}

export default function DestinationScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();

  const destination = DESTINATIONS.find((d) => d.id === id) ?? DESTINATIONS[0];

  const { isFavorite, toggle } = useFavorites();
  const liked = isFavorite(destination.id);
  const [expanded, setExpanded] = useState(false);

  const heroHeight = height * 0.46;
  const tourCardWidth = width * 0.78;

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottom + 32 }}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Image
            source={{ uri: destination.image }}
            style={{ width: '100%', height: heroHeight }}
            contentFit="cover"
            transition={250}
          />
        </Animated.View>

        <View
          className="-mt-9 rounded-t-[36px] bg-white"
          style={{ paddingTop: 8, minHeight: heroHeight }}
        >
          <View className="mt-3 h-1.5 w-12 self-center rounded-full bg-neutral-200" />

          <Animated.View
            entering={enterFrom(0)}
            className="mt-6 flex-row items-start justify-between px-6"
          >
            <Text className="flex-1 pr-3 text-[30px] font-bold text-ink">
              {destination.name}
            </Text>
            <View className="mt-1.5 flex-row items-center gap-1.5 rounded-full border border-neutral-200 px-3.5 py-2">
              <Ionicons name="star-outline" size={14} color="#191919" />
              <Text className="text-[14px] font-semibold text-ink">
                {destination.rating.toFixed(1)}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={enterFrom(1)}
            className="mt-2 flex-row items-center justify-between px-6"
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-[18px]">{destination.flag}</Text>
              <Text className="text-[16px] text-ink">{destination.country}</Text>
            </View>
            <Text className="text-[15px] font-medium text-ink underline">
              {destination.reviews} reviews
            </Text>
          </Animated.View>

          <Animated.View entering={enterFrom(2)}>
            <Text
              className="mt-5 px-6 text-[16px] leading-[24px] text-[#4B5563]"
              numberOfLines={expanded ? undefined : 2}
            >
              {destination.description}
            </Text>
            <Pressable
              onPress={() => setExpanded((v) => !v)}
              hitSlop={6}
              className="px-6"
            >
              <Text className="mt-2 text-[16px] font-medium text-ink underline">
                {expanded ? 'Read less' : 'Read more'}
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={enterFrom(3)}
            className="mt-8 flex-row items-center justify-between px-6"
          >
            <Text className="text-[26px] font-bold text-ink">
              Upcoming tours
            </Text>
            <Text className="text-[15px] font-medium text-ink underline">
              See all
            </Text>
          </Animated.View>

          <Animated.View entering={enterFrom(4)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-5"
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
              snapToInterval={tourCardWidth + 16}
              decelerationRate="fast"
            >
              {destination.tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  width={tourCardWidth}
                  onPress={() => router.push(`/trip/${destination.id}`)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </ScrollView>

      <View
        className="absolute left-5 right-5 flex-row items-center justify-between"
        style={{ top: top + 4 }}
      >
        <CircleButton
          icon={<Feather name="chevron-left" size={22} color="#191919" />}
          onPress={() => router.back()}
        />
        <CircleButton
          icon={
            <AnimatedHeart active={liked} size={20} inactiveColor="#191919" />
          }
          onPress={() => toggle(destination.id)}
        />
      </View>
    </View>
  );
}
