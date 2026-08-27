import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { TeamTile } from '../halftone/TeamTile';
import { Avatar } from '../halftone/Avatar';
import { Icon } from '../ui/icons';
import { formatClock } from '../../lib/format';
import { useTheme } from '../../lib/theme';
import { ACTION_FOREGROUND_COLOR } from '../../lib/tokens';
import type { ThreadPreview } from '../../data/types';

export function TeamRow({
  id,
  name,
  subtitle,
  preview,
  muted = false,
  onPress,
}: {
  id: string;
  name: string;
  subtitle: string;
  preview: ThreadPreview | null;
  /** Draws the struck-through bell, so a muted thread stays legible as muted
   *  once the swipe action that muted it has slid shut. */
  muted?: boolean;
  onPress: () => void;
}) {
  const { t } = useTheme();

  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 bg-card p-3.5 active:opacity-90">
      <TeamTile teamId={id} name={name} size={56} radius={16} />

      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-ink flex-1 text-[17px] font-semibold" numberOfLines={1}>
            {name}
          </Text>
          {muted ? (
            <View className="mr-1.5" accessibilityLabel={`${name} is muted`}>
              <Icon name="bellOff" size={15} color={t.muted} strokeWidth={1.9} />
            </View>
          ) : null}
          {preview ? <Text className="text-muted text-[12px]">{formatClock(preview.at)}</Text> : null}
        </View>

        <Text className="text-muted mt-0.5 text-[13px]">{subtitle}</Text>

        {preview ? (
          <View className="mt-2 flex-row items-center gap-2" accessibilityLabel={`message preview from ${preview.senderName}`}>
            <View className="flex-row items-center gap-1.5 rounded-full bg-chip py-1 pl-1 pr-2.5">
              <Avatar name={preview.senderName} size={18} />
              <Text className="text-ink text-[12px] font-medium">{preview.senderName}</Text>
            </View>
            <Text className="text-ink flex-1 text-[13px]" numberOfLines={1}>
              — {preview.text}
            </Text>
            {preview.unread > 0 ? (
              <View className="h-5 min-w-5 items-center justify-center rounded-full px-1.5" style={{ backgroundColor: t.info }}>
                <Text style={{ color: ACTION_FOREGROUND_COLOR, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                  {preview.unread}
                </Text>
              </View>
            ) : (
              <View accessibilityLabel="read tick">
                <Icon name="checkDouble" size={15} color={t.info} strokeWidth={2.4} />
              </View>
            )}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
