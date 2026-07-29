import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AnimatedHeart } from '@/components/animated-heart';
import type { Tour } from '@/data/destinations';

type Props = {
  tour: Tour;
  width: number;
  onPress?: () => void;
};

export function TourCard({ tour, width, onPress }: Props) {
  const [liked, setLiked] = useState(false);

  return (
    <View
      style={{ width }}
      className="rounded-[28px] border border-neutral-100 bg-white p-3"
    >
      <View className="overflow-hidden rounded-[22px]">
        <Image
          source={{ uri: tour.image }}
          style={{ width: '100%', height: width * 0.62 }}
          contentFit="cover"
          transition={250}
        />
        <Pressable
          onPress={() => setLiked((v) => !v)}
          hitSlop={8}
          className="absolute right-3 top-3 h-11 w-11 items-center justify-center rounded-full bg-white"
        >
          <AnimatedHeart active={liked} size={20} inactiveColor="#191919" />
        </Pressable>
      </View>

      <View className="px-1.5 pt-4">
        <Text className="text-[20px] font-semibold text-ink">{tour.title}</Text>
        <Text className="mt-1.5 text-[14px] text-muted">
          {tour.days} days{'  '}•{'  '}from ${tour.priceFrom}/person
        </Text>

        <View className="mt-3.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="star-outline" size={15} color="#191919" />
            <Text className="text-[15px] font-semibold text-ink">
              {tour.rating.toFixed(1)}
            </Text>
            <Text className="ml-1 text-[15px] text-muted">
              {tour.reviews} reviews
            </Text>
          </View>

          <Pressable
            onPress={onPress}
            className="h-14 w-14 items-center justify-center rounded-full bg-[#161616]"
          >
            <Feather name="arrow-right" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
