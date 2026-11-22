import React from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Avatar } from '../../components/feed/Avatar';
import { Header } from '../../components/ui/Header';
import { Media } from '../../components/ui/Media';
import { Press } from '../../components/ui/Press';
import { Screen } from '../../components/ui/Screen';
import { ME } from '../../data/people';
import { POSTS } from '../../data/posts';
import { usePrefs } from '../../lib/prefs';
import { INTERESTS } from '../../data/topics';
import { C } from '../../theme/colors';

/** No design exists for Profile; the interests shown are the onboarding picks. */
export default function Profile() {
  const { width } = useWindowDimensions();
  const { interests } = usePrefs();
  const picked = INTERESTS.flat().filter((t) => interests.has(t.id));
  const grid = POSTS.filter((p) => p.kind === 'photo').slice(0, 6);
  const cell = (width - 32 - 8) / 3;

  return (
    <Screen>
      <Header unread={false} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Avatar source={ME.avatar} size={96} />
          <Text className="font-bold text-ink" style={{ fontSize: 22, marginTop: 12 }}>{ME.name}</Text>
          <Text className="font-body text-muted" style={{ fontSize: 14, marginTop: 2 }}>{ME.handle}</Text>
        </View>
        <View className="flex-row justify-center" style={{ gap: 36, marginTop: 20 }}>
          {[['248', 'Posts'], ['12.4k', 'Followers'], ['318', 'Following']].map(([n, l]) => (
            <View key={l} style={{ alignItems: 'center' }}>
              <Text className="font-bold text-ink" style={{ fontSize: 18 }}>{n}</Text>
              <Text className="font-body text-muted" style={{ fontSize: 13 }}>{l}</Text>
            </View>
          ))}
        </View>
        <View className="flex-row flex-wrap justify-center" style={{ gap: 8, marginTop: 20 }}>
          {picked.map((t) => (
            <View key={t.id} style={{ backgroundColor: C.mist, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 }}>
              <Text className="font-medium" style={{ color: C.blue, fontSize: 13.5 }}>{t.label}</Text>
            </View>
          ))}
        </View>
        <View className="flex-row flex-wrap" style={{ gap: 4, marginTop: 24 }}>
          {grid.map((p) => (p.kind === 'photo' ? <Media key={p.id} slug={p.photo} style={{ width: cell, height: cell * 1.25, borderRadius: 10 }} /> : null))}
        </View>
        <Press onPress={() => router.replace('/')} style={{ alignSelf: 'center', marginTop: 24, borderWidth: 1, borderColor: C.line, borderRadius: 24, paddingHorizontal: 22, paddingVertical: 12 }}>
          <Text className="font-medium text-ink" style={{ fontSize: 14.5 }}>Replay onboarding</Text>
        </Press>
      </ScrollView>
    </Screen>
  );
}
