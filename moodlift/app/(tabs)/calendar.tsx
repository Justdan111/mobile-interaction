import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../components/ui/Screen';
import { SearchBar } from '../../components/workouts/SearchBar';
import { WeekStrip } from '../../components/calendar/WeekStrip';
import { SessionRow } from '../../components/calendar/SessionRow';
import { weekStrip, isOnDay, dateKey } from '../../lib/week';
import { formatDayHeading } from '../../lib/format';
import { applyFilters } from '../../lib/filters';
import { WORKOUTS } from '../../data/workouts';

export default function CalendarScreen() {
  const days = useMemo(() => weekStrip(), []);
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const [query, setQuery] = useState('');
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  const sessions = useMemo(() => {
    const onDay = WORKOUTS.filter((w) => isOnDay(w.startsAt, selected));
    const matched = applyFilters(onDay, { query, filter: 'all' });
    return [...matched].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  }, [selected, query]);

  const toggleJoin = (id: string) => {
    Haptics.selectionAsync();
    setJoined((j) => ({ ...j, [id]: !j[id] }));
  };

  return (
    <Screen>
      <Text className="mb-5 font-display text-[26px] text-ink">Calendar</Text>

      <WeekStrip days={days} selected={selected} onSelect={setSelected} />

      <SearchBar value={query} onChange={setQuery} />

      <Text className="mb-3 mt-2 font-semibold text-[15px] text-ink">
        {formatDayHeading(selected)}
      </Text>

      {sessions.length === 0 ? (
        <View className="items-center rounded-3xl bg-card px-6 py-10">
          <Text className="text-center font-display text-[18px] text-ink">
            Nothing booked
          </Text>
          <Text className="mt-2 text-center font-body text-[14px] text-muted">
            {query
              ? 'No session on this day matches that search.'
              : 'A clear day. Pick another, or find something in Workouts.'}
          </Text>
        </View>
      ) : (
        sessions.map((w) => (
          <SessionRow
            key={w.id}
            workout={w}
            joined={Boolean(joined[w.id])}
            onPress={() => router.push(`/workout/${w.id}`)}
            onJoin={() => toggleJoin(w.id)}
          />
        ))
      )}
    </Screen>
  );
}
