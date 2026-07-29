import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DetailsButton } from '@/components/details-button';
import { DriveInCar } from '@/components/drive-in-car';
import { CloseButton } from '@/components/icon-buttons';
import { CARS, type Car } from '@/data/cars';

function rowOpacity(index: number) {
  return index < 2 ? 1 : Math.max(0.3, 1 - (index - 1) * 0.45);
}

function DecadeRow({
  car,
  index,
  expanded,
  settled,
  onExpand,
  onSettled,
  onDetails,
}: {
  car: Car;
  index: number;
  expanded: boolean;
  settled: boolean;
  onExpand: () => void;
  onSettled: () => void;
  onDetails: () => void;
}) {
  return (
    <Animated.View layout={LinearTransition.duration(260)} style={{ opacity: rowOpacity(index) }}>
      <Pressable onPress={onExpand} className="active:opacity-70">
        <View className="flex-row">
          {/* Meta column */}
          <View className="w-[124px] pt-2 pr-3">
            <Text className="font-grotesk text-[11px] text-graphite/60">Artworks &amp; story by</Text>
            <Text className="mt-1 font-technoMed text-[15px] leading-[18px] text-graphite">
              {car.author}
            </Text>
          </View>

          {/* Decade + model column */}
          <View className="flex-1">
            <Text className="font-technoBold text-graphite" style={{ fontSize: 46, lineHeight: 50 }}>
              {car.decade}
            </Text>
            <Text className="mt-1 font-techno text-[17px] tracking-[1px] text-graphite">
              {car.model}
            </Text>
            {car.id === '1970s' ? (
              <Text className="font-techno text-[17px] tracking-[1px] text-graphite">
                {car.year}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View className="mt-3" style={{ height: 176 }}>
          <DriveInCar
            key={car.id}
            source={car.hero}
            delay={120}
            onSettled={onSettled}
            containerStyle={{ flex: 1 }}
            imageStyle={{ width: '100%', height: '100%' }}
          />
          {settled ? (
            <Animated.View entering={FadeIn.duration(260)} className="absolute right-1 top-0">
              <DetailsButton onPress={onDetails} />
            </Animated.View>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

export default function Collection() {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string>('1970s');
  const [settledId, setSettledId] = useState<string | null>(null);

  const handleExpand = (car: Car) => {
    if (car.id !== expandedId) {
      setSettledId(null);
      setExpandedId(car.id);
    }
  };

  const openDetails = (car: Car) => {
    router.push({ pathname: '/car/[id]', params: { id: car.id } });
  };

  return (
    <View className="flex-1 overflow-hidden rounded-t-[28px] bg-paper">
      <LinearGradient
        colors={['#F3F2EE', '#E7E7E6', '#B9BDC4', '#A7ADB6']}
        locations={[0, 0.45, 0.82, 1]}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-6"
        style={{ paddingTop: insets.top + 14 }}>
        <Text className="font-display text-sm tracking-[6px] text-graphite">CARSPROJ.</Text>
        <CloseButton onPress={() => router.back()} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: insets.bottom + 40 }}>
        {CARS.map((car, index) => (
          <View key={car.id} className="mb-9">
            <DecadeRow
              car={car}
              index={index}
              expanded={car.id === expandedId}
              settled={car.id === expandedId && settledId === car.id}
              onExpand={() => handleExpand(car)}
              onSettled={() => setSettledId(car.id)}
              onDetails={() => openDetails(car)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
