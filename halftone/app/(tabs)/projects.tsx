import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Segmented } from '../../components/ui/Segmented';
import { ProjectCard } from '../../components/home/ProjectCard';
import { MonthGrid } from '../../components/calendar/MonthGrid';
import { Legend } from '../../components/calendar/Legend';
import { AgendaCard } from '../../components/calendar/AgendaCard';
import { Icon } from '../../components/ui/icons';
import { projects } from '../../data/projects';
import { marksFromProjects, agendaFromProjects } from '../../lib/derive';
import { formatMonthYear } from '../../lib/format';
import { todayIso, monthOf } from '../../lib/today';
import { useTheme } from '../../lib/theme';
import { useTabBarScroll } from '../../components/tabs/TabBarChrome';

const SEGMENTS = [
  { key: 'active', label: 'Active projects' },
  { key: 'calendar', label: 'Calendar' },
];

export default function Projects() {
  // Feeds this screen's scroll position to the floating tab bar, which
  // shrinks to icons on the way down and expands again on the way up.
  const tabBarScroll = useTabBarScroll();
  const router = useRouter();
  const { t } = useTheme();
  const [segment, setSegment] = useState('active');

  // Ruling R6 — the heart drives real local state here, exactly as on home.
  // An inert `onToggleSave` is a control that lies to the user.
  const [saved, setSaved] = useState<Set<string>>(
    () => new Set(projects.filter((p) => p.saved).map((p) => p.id))
  );

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Live calendar: opens on the real current month with the real date marked.
  // Captured once per mount so a re-render at midnight cannot shift the grid
  // out from under the user mid-interaction.
  const today = useMemo(() => todayIso(), []);
  const [cursor, setCursor] = useState(() => monthOf(today));

  const marks = useMemo(() => marksFromProjects(projects), []);
  const agenda = useMemo(() => agendaFromProjects(projects), []);

  const step = (delta: number) => {
    const next = cursor.month + delta;
    setCursor({
      year: cursor.year + Math.floor(next / 12),
      month: ((next % 12) + 12) % 12,
    });
  };

  const heading = formatMonthYear(cursor.year, cursor.month);

  return (
    <SafeAreaView className="flex-1 bg-page" edges={['top']}>
      <ScreenHeader title="My projects" />
      <View className="px-4 pb-3">
        <Segmented options={SEGMENTS} value={segment} onChange={setSegment} />
      </View>

      <ScrollView
        {...tabBarScroll}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {segment === 'active' ? (
          projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              saved={saved.has(p.id)}
              onToggleSave={() => toggleSave(p.id)}
              onPress={() => router.push(`/project/${p.id}`)}
            />
          ))
        ) : (
          <>
            <View className="flex-row items-center gap-2 py-3" accessibilityLabel={`Showing ${heading}`}>
              <Pressable accessibilityRole="button" accessibilityLabel="Previous month" hitSlop={10} onPress={() => step(-1)}>
                <Icon name="chevronLeft" size={22} color={t.muted} />
              </Pressable>
              <Text className="font-display text-ink text-[24px]">{heading}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Next month" hitSlop={10} onPress={() => step(1)}>
                <Icon name="chevronRight" size={22} color={t.ink} />
              </Pressable>
            </View>

            <MonthGrid year={cursor.year} month={cursor.month} marks={marks} todayIso={today} />
            <Legend />

            {agenda.map((item) => (
              <AgendaCard key={item.id} item={item} onPress={() => router.push(`/project/${item.projectId}`)} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
