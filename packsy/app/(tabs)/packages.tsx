import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { ParcelCard } from '../../components/packages/ParcelCard';
import { TitleHeader } from '../../components/ui/Header';
import { Icon } from '../../components/ui/icons';
import { Screen } from '../../components/ui/Screen';
import { CARRIER_NAMES, inFolder, type Folder } from '../../lib/packages';
import { useColors } from '../../theme/ThemeProvider';

const FOLDERS: { key: Folder | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'inbox', label: 'Inbox' },
  { key: 'sent', label: 'Sent' },
  { key: 'archive', label: 'Archive' },
];

export default function Packages() {
  const C = useColors();
  const [folder, setFolder] = useState<Folder | 'all'>('all');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inFolder(folder).filter(
      (p) =>
        !q ||
        [p.id, p.contents, p.origin.city, p.destination.city, CARRIER_NAMES[p.carrier]].some((s) =>
          s.toLowerCase().includes(q)
        )
    );
  }, [folder, query]);

  return (
    <Screen>
      <TitleHeader title="Packages" />

      <View className="flex-row items-center" style={{ gap: 12 }}>
        <View className="flex-1 flex-row items-center rounded-full bg-card" style={{ height: 54, paddingHorizontal: 18, gap: 10 }}>
          <Icon name="search" color={C.ink} surface={C.card} size={22} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search packages"
            placeholderTextColor={C.placeholder}
            className="flex-1 font-body text-ink"
            style={{ fontSize: 15.5 }}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter"
          className="items-center justify-center bg-ink"
          style={{ width: 54, height: 54, borderRadius: 27 }}
        >
          <Icon name="filter" color={C.onInk} surface={C.ink} size={20} />
        </Pressable>
      </View>

      <View className="flex-row" style={{ gap: 28, marginTop: 24, marginBottom: 16, paddingLeft: 4 }}>
        {FOLDERS.map((f) => {
          const on = f.key === folder;
          return (
            <Pressable key={f.key} onPress={() => setFolder(f.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text className={on ? 'font-semibold' : 'font-body'} style={{ color: on ? C.ink : C.dim, fontSize: 15.5 }}>
                {f.label}
              </Text>
              <View style={{ height: 2, marginTop: 6, borderRadius: 1, backgroundColor: on ? C.ink : 'transparent' }} />
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 12 }}>
        {list.map((p, i) => (
          <Animated.View key={`${folder}-${p.id}`} entering={FadeInDown.duration(380).delay(i * 60)} layout={LinearTransition}>
            <ParcelCard parcel={p} onPress={() => router.push(`/package/${p.id}`)} />
          </Animated.View>
        ))}
        {list.length === 0 ? (
          <Text className="font-body text-muted text-center" style={{ marginTop: 40, fontSize: 15 }}>
            No packages here yet.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
