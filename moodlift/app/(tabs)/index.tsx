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

/**
 * Positions in the entrance cascade, top to bottom. Kept together so the order
 * of the animation is readable in one place rather than inferred from six
 * scattered numbers. The tab bar continues from 12 — see app/(tabs)/_layout.
 */
const CASCADE = {
  header: 0, //           0–4   avatar, greeting, name, bell, streak
  feature: 5, //          5     the promo card, or the mood rail's heading
  categoriesTitle: 6, //  6
  categoryTiles: 7, //    7–12  six tiles
  progressTitle: 13, //   13
  progressCards: 14, //   14–16 three dials
  //                      17–21 the tab bar, in app/(tabs)/_layout
} as const;

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
        <PromoCard index={CASCADE.feature} onPress={() => router.push('/mood')} />
      ) : (
        <View className="mb-7">
          <SectionHeader
            index={CASCADE.feature}
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
          index={CASCADE.categoriesTitle}
          title="Categories"
          actionLabel="See all"
          onAction={() => router.push('/workouts')}
        />
        <CategoryRail
          index={CASCADE.categoryTiles}
          onSelect={() => router.push('/workouts')}
        />
      </View>

      <View>
        <SectionHeader
          index={CASCADE.progressTitle}
          title="Your progress"
          actionLabel="See activity"
          onAction={() => router.push('/journey')}
        />
        <ProgressRow index={CASCADE.progressCards} metrics={metrics} />
      </View>
    </Screen>
  );
}
