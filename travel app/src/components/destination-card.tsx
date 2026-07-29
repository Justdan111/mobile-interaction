import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { AnimatedHeart } from '@/components/animated-heart';
import type { Destination } from '@/data/destinations';
import { useFavorites } from '@/store/favorites';

type Props = {
  destination: Destination;
  width: number;
  height: number;
  onPress?: () => void;
};

export function DestinationCard({ destination, width, height, onPress }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const liked = isFavorite(destination.id);

  return (
    <View
      style={{ width, height }}
      className="overflow-hidden rounded-[36px] bg-neutral-300"
    >
      <Image
        source={{ uri: destination.image }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={250}
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.55,
        }}
      />

      <Pressable
        onPress={() => toggle(destination.id)}
        className="absolute right-5 top-5 h-12 w-12 items-center justify-center overflow-hidden rounded-full"
        hitSlop={8}
      >
        <BlurView
          intensity={30}
          tint="light"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.35)',
          }}
        />
        <AnimatedHeart active={liked} size={22} />
      </Pressable>

      <View className="absolute bottom-0 w-full">
        <View className="px-7">
          <Text className="text-[15px] font-medium text-white/90">
            {destination.country}
          </Text>
          <Text className="mt-0.5 text-[30px] font-bold text-white">
            {destination.name}
          </Text>

          <View className="mt-2.5 flex-row items-center">
            <View className="flex-row items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5">
              <Ionicons name="star-outline" size={13} color="#191919" />
              <Text className="text-[13px] font-semibold text-ink">
                {destination.rating.toFixed(1)}
              </Text>
            </View>
            <Text className="ml-3 text-[14px] text-white/90">
              {destination.reviews} reviews
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onPress}
          className="mx-4 mb-4 mt-5 h-[60px] overflow-hidden rounded-full"
        >
          <BlurView
            intensity={25}
            tint="dark"
            style={{
              flex: 1,
              backgroundColor: 'rgba(20,20,20,0.35)',
              justifyContent: 'center',
            }}
          >
            <Text className="text-center text-[16px] font-medium text-white">
              See more
            </Text>
            <View className="absolute right-1.5 top-1.5 h-12 w-12 items-center justify-center rounded-full bg-white">
              <Feather name="chevron-right" size={22} color="#191919" />
            </View>
          </BlurView>
        </Pressable>
      </View>
    </View>
  );
}
