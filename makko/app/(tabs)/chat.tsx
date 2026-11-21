import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Avatar } from '../../components/feed/Avatar';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';
import { PEOPLE } from '../../data/people';
import { C } from '../../theme/colors';

const THREADS = [
  { who: PEOPLE.mariane, last: 'That sunset photo is unreal 😍', at: '2m', unread: 2 },
  { who: PEOPLE.devon, last: 'Chapter two starts tomorrow ✨', at: '18m', unread: 0 },
  { who: PEOPLE.mark, last: 'Sending you the boat pics now', at: '1h', unread: 1 },
  { who: PEOPLE.courtney, last: 'Flowers market on Sunday?', at: 'Yesterday', unread: 0 },
];

/** No design exists for Messages; built from the feed's avatars and type. */
export default function Chat() {
  return (
    <Screen>
      <Header />
      <Text className="font-bold text-ink" style={{ fontSize: 26, paddingHorizontal: 20, marginBottom: 8 }}>Messages</Text>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        {THREADS.map((t) => (
          <View key={t.who.id} className="flex-row items-center" style={{ paddingVertical: 12, gap: 14 }}>
            <Avatar source={t.who.avatar} size={52} />
            <View className="flex-1">
              <Text className="font-semibold text-ink" style={{ fontSize: 16 }}>{t.who.name}</Text>
              <Text className="font-body text-muted" style={{ fontSize: 14, marginTop: 2 }} numberOfLines={1}>{t.last}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text className="font-body text-muted" style={{ fontSize: 12.5 }}>{t.at}</Text>
              {t.unread ? (
                <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                  <Text className="font-semibold" style={{ color: C.white, fontSize: 11.5 }}>{t.unread}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
