import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Polyline } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DriveInCar } from '@/components/drive-in-car';
import { DotGridButton } from '@/components/icon-buttons';
import { CARS, getCar } from '@/data/cars';

export function generateStaticParams() {
  return CARS.map((car) => ({ id: car.id }));
}

function BackButton() {
  return (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      hitSlop={12}
      className="flex-row items-center active:opacity-60">
      <Svg width={18} height={18} viewBox="0 0 18 18">
        <Polyline
          points="11,3 5,9 11,15"
          fill="none"
          stroke="#14171C"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text className="ml-2 font-technoMed text-[18px] text-graphite">Back</Text>
    </Pressable>
  );
}

function Label({ children }: { children: string }) {
  return <Text className="font-grotesk text-[13px] leading-4 text-graphite/60">{children}</Text>;
}

function Value({ children }: { children: string }) {
  return (
    <Text className="font-technoSemi text-graphite" style={{ fontSize: 29, lineHeight: 32 }}>
      {children}
    </Text>
  );
}

export default function CarDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const car = getCar(id);

  if (!car) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <Text className="font-technoMed text-graphite">Car not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paper">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-6"
          style={{ paddingTop: insets.top + 14 }}>
          <Text className="font-display text-sm tracking-[6px] text-graphite">CARSPROJ.</Text>
          <DotGridButton />
        </View>

        {/* Back */}
        <View className="mt-6 px-6">
          <BackButton />
        </View>

        {/* Oversized decade title — intentionally overflows both edges */}
        <View className="mt-3 overflow-hidden">
          <Animated.Text
            entering={FadeIn.duration(500)}
            numberOfLines={1}
            className="text-center font-techno text-graphite"
            style={{ fontSize: 132, lineHeight: 140 }}>
            {car.decade}
          </Animated.Text>
        </View>

        {/* Hero image drives in from the left */}
        <View className="mt-2 px-4" style={{ height: 200 }}>
          <DriveInCar
            source={car.hero}
            delay={200}
            containerStyle={{ flex: 1 }}
            imageStyle={{ width: '100%', height: '100%' }}
          />
        </View>

        {/* Metadata grid */}
        <View className="mt-10 flex-row px-6">
          <View className="flex-1 pr-4">
            <Label>Artworks &amp; story by</Label>
            <View className="mt-3">
              {car.author.split('\n').map((line) => (
                <Value key={line}>{line.toUpperCase()}</Value>
              ))}
            </View>
          </View>
          <View className="flex-1">
            <Label>Car Model</Label>
            <View className="mt-3">
              {car.model.split(' ').length > 2 ? (
                <>
                  <Value>{car.model.split(' ').slice(0, 2).join(' ')}</Value>
                  <Value>{car.model.split(' ').slice(2).join(' ')}</Value>
                </>
              ) : (
                <Value>{car.model}</Value>
              )}
            </View>
          </View>
        </View>

        <View className="mt-10 flex-row px-6">
          <View className="flex-1 pr-4">
            <Value>{car.tire}</Value>
            <View className="mt-3">
              <Label>Size of tire</Label>
            </View>
          </View>
          <View className="flex-1">
            <Label>Model code /</Label>
            <Label>number</Label>
          </View>
        </View>

        {/* Secondary image + model code */}
        <View className="mt-10" style={{ height: 190 }}>
          <DriveInCar
            source={car.detail}
            delay={450}
            containerStyle={{ flex: 1, paddingHorizontal: 16 }}
            imageStyle={{ width: '100%', height: '100%' }}
          />
          <Text
            className="absolute bottom-1 left-6 font-technoSemi text-graphite"
            style={{ fontSize: 29 }}>
            {car.code}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
