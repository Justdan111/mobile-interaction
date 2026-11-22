import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { Avatar } from '../../components/feed/Avatar';
import { Header } from '../../components/ui/Header';
import { Icon } from '../../components/ui/icons';
import { Media } from '../../components/ui/Media';
import { Screen } from '../../components/ui/Screen';
import { PEOPLE } from '../../data/people';
import { POSTS } from '../../data/posts';
import { FEED_TOPICS } from '../../data/topics';
import { photos } from '../../lib/media';
import { C, TINTS } from '../../theme/colors';

/** No design exists for Search; it reuses the feed's people, topics and photos. */
export default function Search() {
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const people = Object.values(PEOPLE).filter((p) => !query || p.name.toLowerCase().includes(query));
  const topics = FEED_TOPICS.filter((t) => !query || t.label.toLowerCase().includes(query));
  const shots = useMemo(() => POSTS.filter((p) => p.kind === 'photo'), []);
  const cell = (width - 32 - 8) / 3;

  return (
    <Screen>
      <Header />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center bg-card" style={{ height: 50, borderRadius: 25, paddingHorizontal: 16, gap: 10 }}>
          <Icon name="search" color={C.muted} size={22} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search people and topics" placeholderTextColor={C.muted} className="flex-1 font-body text-ink" style={{ fontSize: 15.5 }} />
        </View>

        <Text className="font-medium text-muted" style={{ fontSize: 13.5, letterSpacing: 0.6, marginTop: 24, marginBottom: 12 }}>PEOPLE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>
          {people.map((p) => (
            <View key={p.id} style={{ alignItems: 'center', gap: 6 }}>
              <Avatar source={p.avatar} size={64} />
              <Text className="font-medium text-ink" style={{ fontSize: 13.5 }}>{p.name}</Text>
            </View>
          ))}
        </ScrollView>

        <Text className="font-medium text-muted" style={{ fontSize: 13.5, letterSpacing: 0.6, marginTop: 24, marginBottom: 12 }}>TOPICS</Text>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {topics.map((t) => (
            <View key={t.id} className="flex-row items-center" style={{ gap: 8, backgroundColor: TINTS[t.tint], borderRadius: 18, paddingLeft: 4, paddingRight: 14, height: 36 }}>
              <Media slug={t.art} contentFit="contain" style={{ width: 28, height: 28 }} />
              <Text className="font-medium text-ink" style={{ fontSize: 13.5 }}>{t.label}</Text>
            </View>
          ))}
        </View>

        <Text className="font-medium text-muted" style={{ fontSize: 13.5, letterSpacing: 0.6, marginTop: 24, marginBottom: 12 }}>EXPLORE</Text>
        <View className="flex-row flex-wrap" style={{ gap: 4 }}>
          {shots.map((p) => (
            <Image key={p.id} source={p.kind === 'photo' ? photos[p.photo as keyof typeof photos]?.source : undefined} style={{ width: cell, height: cell * 1.25, borderRadius: 10 }} contentFit="cover" />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
