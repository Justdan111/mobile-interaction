import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { TeamTile } from '../halftone/TeamTile';
import { Avatar } from '../halftone/Avatar';
import { Icon } from '../ui/icons';
import { formatClock } from '../../lib/format';
import { useTheme } from '../../lib/theme';
import type { ThreadPreview } from '../../data/types';

export function TeamRow({
  id,
  name,
  subtitle,
  preview,
  onPress,
}: {
  id: string;
  name: string;
  subtitle: string;
  preview: ThreadPreview | null;
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
                <Text style={{ color: '#FFF', fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                  {preview.unread}
                </Text>
              </View>
            ) : (
              <Icon name="check" size={15} color={t.info} strokeWidth={2.4} />
            )}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
