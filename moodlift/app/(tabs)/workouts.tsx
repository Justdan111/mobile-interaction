import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { FilterChip } from '../../components/ui/Chip';
import { MoodPromptCard } from '../../components/workouts/MoodPromptCard';
import { SearchBar } from '../../components/workouts/SearchBar';
import { WorkoutRow } from '../../components/workouts/WorkoutRow';
import { useMood } from '../../lib/mood-context';
import { matchWorkouts } from '../../lib/mood-match';
import { applyFilters, FILTERS, type FilterId } from '../../lib/filters';
import { WORKOUTS } from '../../data/workouts';

export default function WorkoutsScreen() {
  const { moodId, mood } = useMood();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');

  // Rank by mood first, then narrow. Filtering first would be equivalent, but
  // ranking first keeps the mood ordering visible in the result.
  const results = useMemo(
    () => applyFilters(matchWorkouts(WORKOUTS, moodId), { query, filter }),
    [moodId, query, filter]
  );

  return (
    <Screen>
      <Text className="mb-5 font-display text-[26px] text-ink">Workouts</Text>

      <MoodPromptCard mood={mood} onPress={() => router.push('/mood')} />

      <Text className="mb-3 font-display text-[22px] text-ink">Browse workouts</Text>

      <SearchBar value={query} onChange={setQuery} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-4 mb-4"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {FILTERS.map((f) => (
          <FilterChip
            key={f.id}
            label={f.label}
            selected={filter === f.id}
            onPress={() => setFilter(f.id)}
          />
        ))}
      </ScrollView>

      {results.length === 0 ? (
        <View className="items-center rounded-3xl bg-card px-6 py-10">
          <Text className="text-center font-display text-[18px] text-ink">
            Nothing matches that
          </Text>
          <Text className="mt-2 text-center font-body text-[14px] text-muted">
            Try another name, coach or training type.
          </Text>
        </View>
      ) : (
        results.map((w) => (
          <WorkoutRow key={w.id} workout={w} onPress={() => router.push(`/workout/${w.id}`)} />
        ))
      )}
    </Screen>
  );
}
