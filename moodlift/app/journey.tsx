import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Icon } from '../components/ui/icons';
import { Ring } from '../components/ui/Ring';
import { StepsChart } from '../components/journey/StepsChart';
import { WorkoutChart } from '../components/journey/WorkoutChart';
import { GoalRow } from '../components/journey/GoalRow';
import { metricsFor, todayKey, weekEnding } from '../lib/activity';
import { formatDayHeading, formatDuration, formatSteps } from '../lib/format';
import { GOALS } from '../data/goals';

const ACCENT = '#E8724C';
const SAGE = '#5F7359';
const TRACK = '#2A2A2C';
const MUTED = '#8E8E93';

type Tab = 'activity' | 'progress';

function Segmented({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  const options: { id: Tab; label: string; icon: 'clock' | 'intensity' }[] = [
    { id: 'activity', label: 'Activity', icon: 'clock' },
    { id: 'progress', label: 'Progress', icon: 'intensity' },
  ];

  return (
    <View className="mb-4 flex-row rounded-2xl bg-card p-1.5">
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            accessibilityState={{ selected }}
            className="flex-1 flex-row items-center justify-center rounded-xl py-3"
            style={{ backgroundColor: selected ? SAGE : 'transparent' }}
          >
            <Icon name={o.icon} color={selected ? '#FFFFFF' : MUTED} size={17} />
            <Text
              className="ml-2 font-display text-[16px]"
              style={{ color: selected ? '#FFFFFF' : MUTED }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<Tab>('activity');

  const date = todayKey();
  const metrics = useMemo(() => metricsFor(date), [date]);
  const week = useMemo(() => weekEnding(date), [date]);

  const contentWidth = width - 32;
  const halfCard = (contentWidth - 10) / 2;

  const weekSteps = week.reduce((total, d) => total + d.steps, 0);
  const weekMinutes = week.reduce((total, d) => total + d.activeMinutes, 0);
  const bestDay = week.reduce((best, d) => (d.steps > best.steps ? d : best), week[0]);

  return (
    <View className="flex-1 bg-page">
      <View className="px-4" style={{ paddingTop: insets.top + 6 }}>
        <View className="h-11 flex-row items-center justify-center">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            className="absolute left-0 h-10 w-10 items-center justify-center rounded-full bg-card"
          >
            <Icon name="chevron-left" color="#FFFFFF" size={20} />
          </Pressable>

          <Text className="font-display text-[18px] text-ink">My fitness journey</Text>

          <Pressable
            onPress={() =>
              Share.share({
                message: `${formatSteps(metrics.steps)} steps and ${formatDuration(
                  metrics.activeMinutes
                )} of activity today on Moodlift.`,
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Share your journey"
            hitSlop={10}
            className="absolute right-0 h-10 w-10 items-center justify-center rounded-full bg-card"
          >
            <Icon name="share" color="#FFFFFF" size={18} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 32 }}
      >
        <Segmented value={tab} onChange={setTab} />

        <View className="mb-3 flex-row items-center rounded-2xl bg-card px-4 py-3.5">
          <Icon name="calendar" color={MUTED} size={17} />
          <Text className="ml-2.5 font-body text-[14px] text-ink">
            {formatDayHeading(date)}
          </Text>
        </View>

        {tab === 'activity' ? (
          <>
            <View className="mb-2.5 rounded-3xl bg-card px-4 pb-4 pt-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-display text-[17px] text-ink">
                  Steps: <Text className="font-semibold">{formatSteps(metrics.steps)}</Text>
                </Text>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-chip">
                  <Icon name="steps" color="#FFFFFF" size={17} />
                </View>
              </View>
              <StepsChart
                metrics={metrics}
                litColor={ACCENT}
                dimColor={TRACK}
                lineColor="#4A4A4C"
                axisColor={MUTED}
                width={contentWidth - 32}
              />
            </View>

            <View className="mb-5 flex-row">
              <View className="mr-2.5 rounded-3xl bg-card p-4" style={{ width: halfCard }}>
                <View className="mb-1 flex-row items-center justify-between">
                  <Text className="font-display text-[16px] text-ink">Calories</Text>
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-chip">
                    <Icon name="flame" color="#FFFFFF" size={15} />
                  </View>
                </View>
                <View className="items-center py-2">
                  <Ring
                    ratio={metrics.calories / 600}
                    size={halfCard - 56}
                    strokeWidth={7}
                    track={TRACK}
                    fill={ACCENT}
                  />
                  <View className="absolute inset-0 items-center justify-center">
                    <Text className="font-semibold text-[20px] text-ink">{metrics.calories}</Text>
                    <Text className="font-body text-[12px] text-muted">kcal</Text>
                  </View>
                </View>
              </View>

              <View className="rounded-3xl bg-card p-4" style={{ width: halfCard }}>
                <View className="mb-1 flex-row items-center justify-between">
                  <Text className="font-display text-[16px] text-ink">Workout</Text>
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-chip">
                    <Icon name="dumbbell" color="#FFFFFF" size={15} />
                  </View>
                </View>
                <Text className="mb-2 font-semibold text-[15px] text-ink">
                  {formatDuration(metrics.activeMinutes)}
                </Text>
                <WorkoutChart metrics={metrics} color="#A8442A" width={halfCard - 32} />
              </View>
            </View>
          </>
        ) : (
          <View className="mb-5 rounded-3xl bg-card px-4 py-5">
            <Text className="mb-4 font-display text-[18px] text-ink">This week</Text>

            {[
              ['Steps', formatSteps(weekSteps)],
              ['Active time', formatDuration(weekMinutes)],
              ['Best day', `${formatSteps(bestDay.steps)} steps`],
              ['Daily average', formatSteps(Math.round(weekSteps / week.length))],
            ].map(([label, value]) => (
              <View
                key={label}
                className="flex-row items-center justify-between border-b border-[#232325] py-3 last:border-b-0"
              >
                <Text className="font-body text-[14px] text-muted">{label}</Text>
                <Text className="font-semibold text-[15px] text-ink">{value}</Text>
              </View>
            ))}

            <View className="mt-4 flex-row items-end justify-between" style={{ height: 90 }}>
              {week.map((d) => {
                const ratio = d.steps / Math.max(...week.map((x) => x.steps));
                return (
                  <View key={d.date} className="flex-1 items-center">
                    <View
                      className="w-5 rounded-full"
                      style={{
                        height: Math.max(6, ratio * 76),
                        backgroundColor: d.date === date ? ACCENT : TRACK,
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-display text-[20px] text-ink">My goals</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add goals"
            hitSlop={8}
            className="flex-row items-center"
          >
            <Icon name="plus" color="#FFFFFF" size={16} />
            <Text className="ml-1 font-display text-[14px] text-ink">Add goals</Text>
          </Pressable>
        </View>

        {GOALS.map((g) => (
          <GoalRow key={g.id} goal={g} date={date} />
        ))}
      </ScrollView>
    </View>
  );
}
