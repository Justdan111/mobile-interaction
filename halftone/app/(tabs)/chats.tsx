import React, { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Segmented } from '../../components/ui/Segmented';
import { SwipeableRow, type SwipeAction } from '../../components/ui/SwipeableRow';
import { TeamRow } from '../../components/chats/TeamRow';
import { teams as sourceTeams } from '../../data/teams';
import { proposals } from '../../data/proposals';
import { messages } from '../../data/messages';
import { people as allPeople } from '../../data/people';
import { threadPreview } from '../../lib/derive';
import { useTheme } from '../../lib/theme';

const SEGMENTS = [
  { key: 'proposals', label: 'Proposals' },
  { key: 'teams', label: 'Teams' },
];

export default function Chats() {
  const router = useRouter();
  const { t } = useTheme();
  const [segment, setSegment] = useState('teams');
  const [muted, setMuted] = useState<Set<string>>(
    () => new Set(sourceTeams.filter((x) => x.muted).map((x) => x.id))
  );
  const [left, setLeft] = useState<Set<string>>(() => new Set());

  // `data/people.ts` is the single authoritative sender->name lookup; the
  // only thing this screen adds on top is the "You" display convention for
  // the current user's own messages in a preview chip, rather than showing
  // their full profile name back to themselves.
  const people = useMemo(() => ({ ...allPeople, me: 'You' }), []);

  const visibleTeams = sourceTeams.filter((x) => !left.has(x.id));

  const actionsFor = (id: string, name: string): SwipeAction[] => [
    {
      key: 'mute',
      label: muted.has(id) ? 'Off' : 'On',
      a11yLabel: muted.has(id) ? `Unmute ${name}` : `Mute ${name}`,
      icon: 'bell',
      color: t.info,
      onPress: () =>
        setMuted((prev) => {
          const next = new Set(prev);
          next.has(id) ? next.delete(id) : next.add(id);
          return next;
        }),
    },
    {
      key: 'exit',
      label: 'Exit',
      a11yLabel: `Leave ${name}`,
      icon: 'exit',
      color: t.danger,
      onPress: () => setLeft((prev) => new Set(prev).add(id)),
    },
  ];

  const rows =
    segment === 'teams'
      ? visibleTeams.map((team) => ({
          key: team.id,
          actions: actionsFor(team.id, team.name),
          id: team.id,
          name: team.name,
          subtitle: `${team.members.length} members`,
          preview: threadPreview(team.id, messages, people),
          onPress: () => router.push(`/chat/${team.id}`),
        }))
      : proposals.map((p) => ({
          key: p.id,
          actions: actionsFor(p.threadId, p.counterpartName),
          id: p.counterpartId,
          name: p.counterpartName,
          subtitle: p.role,
          preview: threadPreview(p.threadId, messages, people),
          onPress: () => router.push(`/chat/${p.threadId}`),
        }));

  return (
    <SafeAreaView className="flex-1 bg-page" edges={['top']}>
      <ScreenHeader title="Chats" />
      <View className="px-4 pb-3">
        <Segmented options={SEGMENTS} value={segment} onChange={setSegment} />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SwipeableRow actions={item.actions}>
            <TeamRow
              id={item.id}
              name={item.name}
              subtitle={item.subtitle}
              preview={item.preview}
              onPress={item.onPress}
            />
          </SwipeableRow>
        )}
        ListEmptyComponent={
          segment === 'teams' ? (
            <Text className="text-muted py-12 text-center text-[15px]">You have left every team.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
