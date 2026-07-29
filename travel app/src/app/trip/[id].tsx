import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedHeart } from '@/components/animated-heart';
import { DESTINATIONS, getTrip, type TripDay } from '@/data/destinations';
import { useFavorites } from '@/store/favorites';

const TRIP_TABS = ['Tour schedule', 'Accomodation', 'Booking details'];

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
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      {icon}
    </Pressable>
  );
}

function DayCard({
  day,
  expanded,
  onToggle,
}: {
  day: TripDay;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className={`rounded-3xl p-4 ${
        expanded ? 'bg-[#F4F3F1]' : 'border border-neutral-100 bg-white'
      }`}
    >
      <View className="flex-row items-center">
        <Image
          source={{ uri: day.image }}
          style={{ width: 92, height: 74, borderRadius: 18 }}
          contentFit="cover"
          transition={200}
        />
        <View className="ml-4 flex-1">
          <Text className="text-[14px] text-muted">Day {day.day}</Text>
          <Text className="mt-0.5 text-[17px] font-semibold leading-[22px] text-ink">
            {day.title}
          </Text>
        </View>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color="#191919"
        />
      </View>

      {expanded && (
        <View className="mt-4 px-1">
          <Text className="text-[15px] text-muted">Morning</Text>
          <Text className="mt-1 text-[17px] leading-6 text-ink">
            {day.morning}
          </Text>
          <Text className="mt-4 text-[15px] text-muted">Afternoon</Text>
          <Text className="mt-1 text-[17px] leading-6 text-ink">
            {day.afternoon}
          </Text>
          <Text className="mt-4 text-[15px] text-muted">Evening</Text>
          <Text className="mt-1 text-[17px] leading-6 text-ink">
            {day.evening}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function TripScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const destination =
    DESTINATIONS.find((d) => d.id === id) ?? DESTINATIONS[0];
  const trip = getTrip(destination);

  const { isFavorite, toggle } = useFavorites();
  const liked = isFavorite(destination.id);
  const [activeTab, setActiveTab] = useState(TRIP_TABS[0]);
  const [expandedDay, setExpandedDay] = useState(1);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <View className="flex-row items-center justify-between px-5 pt-2">
        <CircleButton
          icon={<Feather name="chevron-left" size={22} color="#191919" />}
          onPress={() => router.back()}
        />
        <View className="items-center">
          <Text className="text-[22px] font-bold text-ink">{trip.title}</Text>
          <Text className="mt-0.5 text-[14px] text-muted">{trip.dates}</Text>
        </View>
        <CircleButton
          icon={
            <AnimatedHeart active={liked} size={20} inactiveColor="#191919" />
          }
          onPress={() => toggle(destination.id)}
        />
      </View>

      <View className="mt-5 flex-1 overflow-hidden rounded-t-[36px] bg-white">
        <View className="mt-3 h-1.5 w-12 self-center rounded-full bg-neutral-200" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottom + 120 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-5"
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          >
            {TRIP_TABS.map((tab) => {
              const selected = tab === activeTab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`h-12 items-center justify-center rounded-full px-6 ${
                    selected ? 'bg-[#161616]' : 'bg-[#F4F3F1]'
                  }`}
                >
                  <Text
                    className={`text-[15px] ${
                      selected ? 'font-medium text-white' : 'text-[#6B7280]'
                    }`}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text className="mt-7 px-5 text-[22px] font-bold text-ink">
            {trip.heading}
          </Text>

          <View className="mt-5 gap-4 px-5">
            {trip.days.map((day, index) => (
              <Animated.View
                key={day.day}
                entering={FadeInDown.duration(500)
                  .delay(150 + index * 70)
                  .springify()
                  .damping(18)
                  .stiffness(170)}
              >
                <DayCard
                  day={day}
                  expanded={expandedDay === day.day}
                  onToggle={() =>
                    setExpandedDay((current) =>
                      current === day.day ? 0 : day.day,
                    )
                  }
                />
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </View>

      <Animated.View
        entering={FadeInUp.duration(600).delay(350).springify().damping(18).stiffness(160)}
        className="absolute left-5 right-5"
        style={{ bottom: Math.max(bottom, 20) }}
      >
        <Pressable className="h-[64px] items-center justify-center rounded-full bg-[#161616]">
          <Text className="text-[17px] font-semibold text-white">
            Book a tour
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
