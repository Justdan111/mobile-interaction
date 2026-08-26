import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Segmented } from '../../components/ui/Segmented';
import { ProposalCard } from '../../components/proposals/ProposalCard';
import { proposals as source } from '../../data/proposals';
import { projects } from '../../data/projects';
import type { ProposalStatus } from '../../data/types';
import { useTabBarScroll } from '../../components/tabs/TabBarChrome';

const SEGMENTS = [
  { key: 'incoming', label: 'Incoming' },
  { key: 'outgoing', label: 'Sent' },
];

export default function Proposals() {
  // Feeds this screen's scroll position to the floating tab bar, which
  // shrinks to icons on the way down and expands again on the way up.
  const tabBarScroll = useTabBarScroll();
  const router = useRouter();
  const [segment, setSegment] = useState<'incoming' | 'outgoing'>('incoming');
  const [statuses, setStatuses] = useState<Record<string, ProposalStatus>>(
    () => Object.fromEntries(source.map((p) => [p.id, p.status]))
  );

  const visible = source.filter((p) => p.direction === segment);
  const titleFor = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.title ?? 'Untitled project';

  const decide = (id: string, status: ProposalStatus) =>
    setStatuses((prev) => ({ ...prev, [id]: status }));

  return (
    <SafeAreaView className="flex-1 bg-page" edges={['top']}>
      <ScreenHeader title="Proposals" />
      <View className="px-4 pb-3">
        <Segmented
          options={SEGMENTS}
          value={segment}
          onChange={(k) => setSegment(k as 'incoming' | 'outgoing')}
        />
      </View>

      <ScrollView
        {...tabBarScroll}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {visible.map((p) => (
          <ProposalCard
            key={p.id}
            proposal={p}
            projectTitle={titleFor(p.projectId)}
            status={statuses[p.id]}
            onAccept={() => decide(p.id, 'accepted')}
            onDecline={() => decide(p.id, 'declined')}
            onPress={() => router.push(`/chat/${p.threadId}`)}
          />
        ))}

        {visible.length === 0 ? (
          <Text className="text-muted py-12 text-center text-[15px]">
            {segment === 'incoming' ? 'No proposals waiting on you.' : 'You have not sent any proposals yet.'}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
