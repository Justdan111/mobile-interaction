import React from 'react';
import { Text, View } from 'react-native';
import { VoiceNote } from './VoiceNote';
import { formatClock } from '../../lib/format';
import { useTheme } from '../../lib/theme';
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
          style={isOwn ? { color: '#FFFFFF' } : undefined}
        >
          {isOwn ? 'You' : senderName}
        </Text>
      ) : null}

      {message.voice ? (
        <VoiceNote
          voice={message.voice}
          tint={isOwn ? '#FFFFFF' : t.accent}
          iconColor={isOwn ? t.accent : '#FFFFFF'}
        />
      ) : (
        <Text className="text-[15px] leading-[21px]" style={{ color: isOwn ? '#FFFFFF' : t.ink }}>
          {message.body}
        </Text>
      )}

      <Text
        className="mt-1 self-end text-[11px]"
        style={{ color: isOwn ? 'rgba(255,255,255,0.75)' : t.muted }}
      >
        {formatClock(message.at)}
      </Text>
    </View>
  );
}
