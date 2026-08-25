import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Segmented } from '../../components/ui/Segmented';
import { Toggle } from '../../components/ui/Toggle';
import { PillButton } from '../../components/ui/PillButton';
import { Icon } from '../../components/ui/icons';
import { Avatar } from '../../components/halftone/Avatar';
import { TeamTile } from '../../components/halftone/TeamTile';
import { teams } from '../../data/teams';
import type { Member } from '../../data/types';
import { useTheme } from '../../lib/theme';

const SEGMENTS = [
  { key: 'members', label: 'Members' },
  { key: 'files', label: 'Files' },
];

/**
 * The employer is a member row like any other, but the comp sets it apart from
 * the people with a group break. Keying on the role keeps that purely
 * data-driven: a team with no employer renders as one uninterrupted list.
 */
const EMPLOYER_ROLE = 'Employer';

// Member avatars are rounded squares here, matching the radius of the file
// rows on the other segment. The chat thread keeps Avatar's default circle.
const AVATAR_RADIUS = 12;

function MemberRow({
  member,
  divided,
  onMessage,
}: {
  member: Member;
  divided: boolean;
  onMessage: () => void;
}) {
  const { t } = useTheme();
  return (
    <View className={`flex-row items-center gap-3 py-3.5 ${divided ? 'border-t border-hairline' : ''}`}>
      <Avatar name={member.name} size={44} radius={AVATAR_RADIUS} />
      <View className="flex-1">
        <Text className="text-muted text-[12px]">{member.role}</Text>
        <Text className="text-ink text-[15px] font-semibold">{member.name}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Message ${member.name}`}
        hitSlop={8}
        onPress={onMessage}
      >
        <Icon name="chat" size={22} color={t.muted} />
      </Pressable>
    </View>
  );
}

export default function Team() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTheme();
  const team = teams.find((x) => x.id === id);
  const [segment, setSegment] = useState('members');
  // Seeded from the team's own mute flag — the same field the chats list's
  // swipe-to-mute action reads — then local state only, per the spec.
  const [notify, setNotify] = useState(!team?.muted);

  if (!team) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-page">
        <Text className="text-muted text-[15px]">That team no longer exists.</Text>
      </SafeAreaView>
    );
  }

  const employer = team.members.filter((m) => m.role === EMPLOYER_ROLE);
  const people = team.members.filter((m) => m.role !== EMPLOYER_ROLE);
  const openThread = () => router.push(`/chat/${team.id}`);

  return (
    <SafeAreaView className="flex-1 bg-page" edges={['top', 'bottom']}>
      <View className="flex-row px-4 pt-1">
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={() => router.back()}>
          <Icon name="chevronLeft" size={26} color={t.ink} />
        </Pressable>
      </View>

      <View className="items-center px-5 pb-4">
        <TeamTile teamId={team.id} name={team.name} size={92} radius={24} />
        <Text className="text-ink mt-3 text-[22px] font-bold">{team.name}</Text>
        <Text className="text-muted mt-0.5 text-[14px]">{team.members.length} members</Text>
      </View>

      <View className="px-4 pb-2">
        <Segmented options={SEGMENTS} value={segment} onChange={setSegment} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        {segment === 'members' ? (
          <>
            {employer.map((m, i) => (
              <MemberRow key={m.id} member={m} divided={i > 0} onMessage={openThread} />
            ))}
            <View className={employer.length > 0 ? 'border-t border-hairline pt-5' : ''}>
              {people.map((m, i) => (
                <MemberRow key={m.id} member={m} divided={i > 0} onMessage={openThread} />
              ))}
            </View>
          </>
        ) : (
          team.files.map((f, i) => (
            <View
              key={f.id}
              className={`flex-row items-center gap-3 py-3.5 ${i > 0 ? 'border-t border-hairline' : ''}`}
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-chip">
                <Text className="text-muted text-[11px] font-bold uppercase">{f.kind}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-ink text-[15px] font-semibold" numberOfLines={1}>{f.name}</Text>
                <Text className="text-muted text-[12px]">{f.size}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View className="border-t border-hairline px-5 pb-2 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-ink text-[17px]">Notification</Text>
          <Toggle value={notify} onChange={setNotify} tint={t.accent} />
        </View>
        <PillButton label="Next" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
