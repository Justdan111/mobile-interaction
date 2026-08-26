import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '../halftone/Avatar';
import { Chip } from '../ui/Chip';
import type { IconName } from '../ui/icons';
import { formatPostedDate } from '../../lib/format';
import { useTheme } from '../../lib/theme';
import { ACTION_FOREGROUND_COLOR } from '../../lib/tokens';
import type { Proposal, ProposalStatus } from '../../data/types';

/**
 * A clock on every non-accepted status told the user a declined proposal was
 * still pending — the icon contradicting the word beside it.
 */
export const STATUS_ICON: Record<ProposalStatus, IconName> = {
  sent: 'clock',
  viewed: 'clock',
  accepted: 'check',
  declined: 'close',
};

const STATUS_LABEL: Record<ProposalStatus, string> = {
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  declined: 'Declined',
};

export function ProposalCard({
  proposal,
  projectTitle,
  status,
  onAccept,
  onDecline,
  onPress,
}: {
  proposal: Proposal;
  projectTitle: string;
  status: ProposalStatus;
  onAccept: () => void;
  onDecline: () => void;
  onPress: () => void;
}) {
  const { t } = useTheme();
  const undecided = proposal.direction === 'incoming' && (status === 'sent' || status === 'viewed');

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Proposal for ${projectTitle}`}
      className="mb-3 rounded-3xl bg-card p-4 active:opacity-90"
    >
      <View className="flex-row items-center gap-3">
        <Avatar name={proposal.counterpartName} size={44} />
        <View className="flex-1">
          <Text className="text-ink text-[16px] font-semibold">{proposal.counterpartName}</Text>
          <Text className="text-muted text-[12px]">{proposal.role}</Text>
        </View>
        <Text className="text-ink text-[16px] font-bold">${proposal.rate}/hr</Text>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-muted text-[12px]">Proposal for</Text>
        {/* `at` is an ISODateTime; formatPostedDate parses a plain ISODate and
            would read NaN out of "12T09:30:00". */}
        <Text className="text-muted text-[12px]">{formatPostedDate(proposal.at.slice(0, 10))}</Text>
      </View>
      <Text className="text-ink text-[15px] font-semibold" numberOfLines={1}>{projectTitle}</Text>
      <Text className="text-muted mt-2 text-[14px] leading-[20px]" numberOfLines={2}>{proposal.note}</Text>

      <View className="mt-4">
        {undecided ? (
          <View className="flex-row gap-2.5">
            <Pressable
              accessibilityRole="button"
              onPress={onAccept}
              className="flex-1 items-center rounded-2xl py-3"
              style={{ backgroundColor: t.accent }}
            >
              <Text style={{ color: ACTION_FOREGROUND_COLOR, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
                Accept
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onDecline}
              className="flex-1 items-center rounded-2xl border border-hairline py-3"
            >
              <Text className="text-ink text-[15px] font-semibold">Decline</Text>
            </Pressable>
          </View>
        ) : (
          <Chip icon={STATUS_ICON[status]} label={STATUS_LABEL[status]} />
        )}
      </View>
    </Pressable>
  );
}
