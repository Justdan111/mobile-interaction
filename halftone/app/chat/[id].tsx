import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TeamTile } from '../../components/halftone/TeamTile';
import { Avatar } from '../../components/halftone/Avatar';
import { Icon } from '../../components/ui/icons';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { Composer } from '../../components/chat/Composer';
import { groupMessages } from '../../lib/grouping';
import { teams } from '../../data/teams';
import { messages as seed } from '../../data/messages';
import { people } from '../../data/people';
import { useTheme } from '../../lib/theme';
import type { Message } from '../../data/types';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTheme();
  const team = teams.find((x) => x.id === id);
  const [sent, setSent] = useState<Message[]>([]);

  const groups = useMemo(
    () => groupMessages([...seed.filter((m) => m.threadId === id), ...sent], people),
    [id, sent]
  );

  const send = (body: string) =>
    setSent((prev) => [
      ...prev,
      { id: `local-${prev.length}`, threadId: String(id), senderId: 'me', body, at: new Date().toISOString(), read: true },
    ]);

  const online = team ? team.members.filter((m) => m.online).length : 0;

  return (
    <SafeAreaView className="flex-1 bg-page" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-3 border-b border-hairline px-4 pb-3 pt-1">
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={() => router.back()}>
          <Icon name="chevronLeft" size={26} color={t.ink} />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-ink text-[17px] font-semibold">{team?.name ?? 'Chat'}</Text>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: t.success }} />
            <Text className="text-muted text-[12px]">Online: {online}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Team details"
          onPress={() => router.push(`/team/${id}`)}
        >
          <TeamTile teamId={String(id)} name={team?.name ?? ''} size={40} radius={12} />
        </Pressable>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {groups.map((g, gi) => (
            <View key={`${g.senderId}-${gi}`} className="gap-1.5">
              {g.messages.map((m, mi) => (
                <View key={m.id} className={`flex-row items-end gap-2 ${g.isOwn ? 'justify-end' : ''}`}>
                  {!g.isOwn ? (
                    <View style={{ width: 30 }}>
                      {mi === g.messages.length - 1 ? <Avatar name={g.senderName} size={30} /> : null}
                    </View>
                  ) : null}
                  <MessageBubble
                    message={m}
                    isOwn={g.isOwn}
                    senderName={g.senderName}
                    showSender={mi === 0}
                  />
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <Composer onSend={send} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
