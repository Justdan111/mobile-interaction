import React from 'react';
import { Text, View } from 'react-native';
import { VoiceNote } from './VoiceNote';
import { formatClock } from '../../lib/format';
import { useTheme } from '../../lib/theme';
import {
  ACTION_FOREGROUND_COLOR,
  MESSAGE_ON_ACCENT_MUTED_COLOR,
  VOICE_NOTE_SURFACE_COLOR,
} from '../../lib/tokens';
import type { Message } from '../../data/types';

export function MessageBubble({
  message,
  isOwn,
  senderName,
  showSender,
}: {
  message: Message;
  isOwn: boolean;
  senderName: string;
  showSender: boolean;
}) {
  const { t } = useTheme();

  return (
    <View
      className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${isOwn ? 'self-end' : 'self-start bg-card'}`}
      style={isOwn ? { backgroundColor: t.accent } : undefined}
    >
      {showSender ? (
        <Text
          className={`mb-0.5 text-[13px] font-semibold ${isOwn ? '' : 'text-muted'}`}
          style={isOwn ? { color: ACTION_FOREGROUND_COLOR } : undefined}
        >
          {isOwn ? 'You' : senderName}
        </Text>
      ) : null}

      {message.voice ? (
        <VoiceNote
          voice={message.voice}
          tint={isOwn ? VOICE_NOTE_SURFACE_COLOR : t.accent}
          iconColor={isOwn ? t.accent : ACTION_FOREGROUND_COLOR}
          barColor={isOwn ? ACTION_FOREGROUND_COLOR : t.muted}
          durationColor={isOwn ? MESSAGE_ON_ACCENT_MUTED_COLOR : t.muted}
        />
      ) : (
        <Text className="text-[15px] leading-[21px]" style={{ color: isOwn ? ACTION_FOREGROUND_COLOR : t.ink }}>
          {message.body}
        </Text>
      )}

      <Text
        className="mt-1 self-end text-[11px]"
        style={{ color: isOwn ? MESSAGE_ON_ACCENT_MUTED_COLOR : t.muted }}
      >
        {formatClock(message.at)}
      </Text>
    </View>
  );
}
