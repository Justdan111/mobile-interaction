import React, { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GreetingHeader } from '../../components/home/GreetingHeader';
import { SearchBar } from '../../components/home/SearchBar';
import { ArtCardRow } from '../../components/home/ArtCardRow';
import { ProjectCard } from '../../components/home/ProjectCard';
import { projects as source } from '../../data/projects';
import { useTabBarScroll } from '../../components/tabs/TabBarChrome';

export default function Home() {
  // Feeds this screen's scroll position to the floating tab bar, which
  // shrinks to icons on the way down and expands again on the way up.
  const tabBarScroll = useTabBarScroll();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<Set<string>>(
    () => new Set(source.filter((p) => p.saved).map((p) => p.id))
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.employer.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [query]);

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <SafeAreaView className="flex-1 bg-page" edges={['top']}>
      {/* Pinned. The greeting, the search field and the art rail stay put while
          only the project list scrolls, so search is always in reach. They were
          the list's ListHeaderComponent and scrolled away with the cards. */}
      <View>
        <GreetingHeader />
        <SearchBar value={query} onChange={setQuery} />
        <View className="py-3">
          <ArtCardRow />
        </View>
      </View>

      <FlatList
        {...tabBarScroll}
        data={results}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        // The heading belongs to the list, not the pinned block: it labels the
        // cards and travels with them.
        ListHeaderComponent={
          <Text className="font-display text-ink px-5 pb-3 pt-2 text-[26px]">Projects</Text>
        }
        ListEmptyComponent={
          <Text className="text-muted px-5 py-10 text-center text-[15px]">
            No projects match that search.
          </Text>
        }
        renderItem={({ item }) => (
          <View className="px-4">
            <ProjectCard
              project={item}
              saved={saved.has(item.id)}
              onToggleSave={() => toggleSave(item.id)}
              onPress={() => router.push(`/project/${item.id}`)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
