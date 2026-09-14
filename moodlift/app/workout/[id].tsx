import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { WORKOUTS } from '../../data/workouts';
import { photoFor } from '../../data/photos';
import { getMood } from '../../data/moods';
import { formatRelativeSlot, INTENSITY_LABEL } from '../../lib/format';
import { Icon } from '../../components/ui/icons';
import { Tag } from '../../components/ui/Chip';

function CircleButton({
  icon,
  label,
  onPress,
  tint,
}: {
  icon: 'chevron-left' | 'heart';
  label: string;
  onPress: () => void;
  tint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className="h-11 w-11 items-center justify-center rounded-full bg-page/70"
    >
      <Icon name={icon} color="#FFFFFF" size={20} fill={tint ?? 'none'} />
    </Pressable>
  );
}

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = WORKOUTS.find((w) => w.id === id);
  const [saved, setSaved] = useState(false);

  if (!workout) {
    return (
      <View className="flex-1 items-center justify-center bg-page px-8">
        <Text className="text-center font-display text-[20px] text-ink">
          That workout isn&apos;t in the schedule
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mt-6 rounded-full bg-accent px-8 py-3.5"
        >
          <Text className="font-display text-[16px] text-ink">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const moods = workout.moods.map(getMood);

  return (
    <View className="flex-1 bg-page">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        <View>
          <Image
            source={photoFor(workout.photo)}
            style={{ width, height: width * 0.92 }}
            contentFit="cover"
            transition={200}
            accessibilityIgnoresInvertColors
          />
          <View
            className="absolute left-4 right-4 flex-row justify-between"
            style={{ top: insets.top + 6 }}
          >
            <CircleButton icon="chevron-left" label="Go back" onPress={() => router.back()} />
            <CircleButton
              icon="heart"
              label={saved ? 'Remove from saved' : 'Save workout'}
              tint={saved ? '#E8724C' : undefined}
              onPress={() => {
                Haptics.selectionAsync();
                setSaved((s) => !s);
              }}
            />
          </View>
        </View>

        <View className="-mt-7 rounded-t-[32px] bg-page px-4 pt-7">
          <Text className="font-display text-[28px] leading-[34px] text-ink">
            {workout.title}
          </Text>

          <View className="mt-3 flex-row items-center">
            <Icon name="calendar" color="#8E8E93" size={16} />
            <Text className="ml-2 font-body text-[14px] text-muted">
              {formatRelativeSlot(workout.startsAt, workout.durationMin)}
            </Text>
          </View>

          <View className="mt-2 flex-row items-center">
            <Icon name="intensity" color="#8E8E93" size={16} />
            <Text className="ml-2 font-body text-[14px] text-muted">
              {INTENSITY_LABEL[workout.intensity]}
            </Text>
            <Text className="mx-2.5 font-body text-[14px] text-muted">|</Text>
            <Icon name="person" color="#8E8E93" size={16} />
            <Text className="ml-2 font-body text-[14px] text-muted">{workout.coach}</Text>
          </View>

          <View className="mt-1 flex-row flex-wrap">
            {workout.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </View>

          {/* The reason this session surfaced — the mood link is the whole
              premise of the app, so the detail screen states it. */}
          <Text className="mb-3 mt-7 font-display text-[20px] text-ink">Suits you when</Text>
          <View className="flex-row flex-wrap">
            {moods.map((m) => (
              <View
                key={m.id}
                className="mb-2 mr-2 flex-row items-center rounded-full px-3.5 py-2"
                style={{ backgroundColor: m.surface }}
              >
                <Text className="font-medium text-[13px]" style={{ color: m.onSurface }}>
                  {m.label}
                </Text>
              </View>
            ))}
          </View>

          <Text className="mt-4 font-body text-[14px] leading-[21px] text-muted">
            {workout.durationMin} minutes with {workout.coach}.{' '}
            {workout.solo
              ? 'A solo session — go at your own pace.'
              : 'A group session — you train alongside others.'}
          </Text>
        </View>
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 bg-page px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Join this workout"
          className="items-center rounded-full bg-accent py-[18px] active:opacity-90"
        >
          <Text className="font-display text-[17px] text-ink">Join this workout</Text>
        </Pressable>
      </View>
    </View>
  );
}
