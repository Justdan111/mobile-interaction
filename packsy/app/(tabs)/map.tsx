import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CityMap, PIN_COLOUR, type CityMapHandle } from '../../components/map/CityMap';
import { Chip } from '../../components/ui/Chip';
import { CircleButton } from '../../components/ui/CircleButton';
import { TitleHeader } from '../../components/ui/Header';
import { Icon } from '../../components/ui/icons';
import { GUTTER, TAB_BAR_CLEARANCE } from '../../components/ui/Screen';
import { PLACES, type Place, type PlaceKind } from '../../lib/places';
import { C } from '../../theme/colors';

const FILTERS: { key: PlaceKind | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pickup', label: 'Pickup points' },
  { key: 'locker', label: 'Lockers' },
  { key: 'transit', label: 'In Transit' },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const map = useRef<CityMapHandle>(null);
  const [filter, setFilter] = useState<PlaceKind | 'all'>('all');
  const [selected, setSelected] = useState<string>('l-1025');
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState('');

  const places = useMemo(() => PLACES.filter((p) => filter === 'all' || p.kind === filter), [filter]);
  const current = PLACES.find((p) => p.id === selected);

  const select = (p: Place) => {
    setSelected(p.id);
    setOpened(true);
  };

  const search = () => {
    const q = query.trim().toLowerCase();
    const hit = q && PLACES.find((p) => `${p.name} ${p.address}`.toLowerCase().includes(q));
    if (hit) {
      setFilter('all');
      select(hit);
      map.current?.focus(hit);
    }
  };

  return (
    <View className="flex-1 bg-page">
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: GUTTER }}>
        <TitleHeader title="Map" />
        <View className="flex-row items-center rounded-full bg-card" style={{ height: 56, paddingHorizontal: 18, gap: 10 }}>
          <Icon name="search" color={C.ink} surface={C.card} size={22} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
            placeholder="Search address or pickup point"
            placeholderTextColor="#8A8A8A"
            className="flex-1 font-body text-ink"
            style={{ fontSize: 15.5 }}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginTop: 22, marginBottom: 14 }}
        contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8 }}
      >
        {FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} active={f.key === filter} onPress={() => setFilter(f.key)} height={40} />
        ))}
      </ScrollView>

      <View className="flex-1">
        <CityMap ref={map} places={places} selectedId={selected} onSelect={select} />

        <View style={{ position: 'absolute', right: 16, bottom: TAB_BAR_CLEARANCE + insets.bottom + 6, gap: 12 }}>
          <CircleButton icon="plus" label="Zoom in" size={58} variant="solid" fill="rgba(40,40,40,0.92)" glyph={C.ink} onPress={() => map.current?.zoomBy(1.35)} />
          <CircleButton icon="minus" label="Zoom out" size={58} variant="solid" fill="rgba(40,40,40,0.92)" glyph={C.ink} onPress={() => map.current?.zoomBy(1 / 1.35)} />
        </View>

        {opened && current ? (
          <Animated.View
            key={current.id}
            entering={FadeInDown.duration(260)}
            exiting={FadeOutDown.duration(180)}
            className="absolute flex-row items-center rounded-3xl bg-card"
            style={{ left: 16, right: 90, bottom: TAB_BAR_CLEARANCE + insets.bottom + 6, padding: 14, gap: 12 }}
          >
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: PIN_COLOUR[current.kind] }} />
            <View className="flex-1">
              <Text className="font-medium text-ink" style={{ fontSize: 14.5 }} numberOfLines={1}>
                {current.name}
              </Text>
              <Text className="font-body text-muted" style={{ fontSize: 12.5 }} numberOfLines={1}>
                {current.address}
              </Text>
            </View>
            <Pressable onPress={() => setOpened(false)} hitSlop={10} accessibilityLabel="Close">
              <View style={{ transform: [{ rotate: '45deg' }] }}>
                <Icon name="plus" color={C.muted} surface={C.card} size={20} />
              </View>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}
