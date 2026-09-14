import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Header } from '../../components/home/Header';
import { PromoCard } from '../../components/home/PromoCard';
import { WorkoutCard } from '../../components/home/WorkoutCard';
import { CategoryRail } from '../../components/home/CategoryRail';
import { ProgressRow } from '../../components/home/ProgressRow';
import { useMood } from '../../lib/mood-context';
import { matchWorkouts } from '../../lib/mood-match';
import { metricsFor, todayKey } from '../../lib/activity';
import { WORKOUTS } from '../../data/workouts';

const USER_NAME = 'George Davidson';
const STREAK = 21;
const RAIL_LENGTH = 6;

export default function HomeScreen() {
  const { moodId } = useMood();
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const today = todayKey();
  const metrics = useMemo(() => metricsFor(today), [today]);
  const recommended = useMemo(
    () => matchWorkouts(WORKOUTS, moodId).slice(0, RAIL_LENGTH),
    [moodId]
  );

  const toggleSave = (id: string) => setSaved((s) => ({ ...s, [id]: !s[id] }));

  return (
    <Screen>
      <Header name={USER_NAME} streak={STREAK} />

      {moodId === null ? (
        <PromoCard onPress={() => router.push('/mood')} />
      ) : (
        <View className="mb-7">
          <SectionHeader
            title="Fits your mood today"
            actionLabel="Change my mood"
            onAction={() => router.push('/mood')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-4"
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {recommended.map((w) => (
              <WorkoutCard
                key={w.id}
                workout={w}
                saved={Boolean(saved[w.id])}
                onPress={() => router.push(`/workout/${w.id}`)}
                onToggleSave={() => toggleSave(w.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View className="mb-7">
        <SectionHeader
          title="Categories"
          actionLabel="See all"
          onAction={() => router.push('/workouts')}
        />
        <CategoryRail onSelect={() => router.push('/workouts')} />
      </View>

      <View>
        <SectionHeader
          title="Your progress"
          actionLabel="See activity"
          onAction={() => router.push('/journey')}
        />
        <ProgressRow metrics={metrics} />
      </View>
    </Screen>
  );
}
