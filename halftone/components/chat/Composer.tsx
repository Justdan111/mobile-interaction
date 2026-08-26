import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Icon } from '../ui/icons';
import { useTheme } from '../../lib/theme';

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const { t } = useTheme();
  const [text, setText] = useState('');

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View className="flex-row items-center gap-3 border-t border-hairline bg-page px-4 py-3">
      <Pressable accessibilityRole="button" accessibilityLabel="Attach a file" hitSlop={8}>
        <Icon name="clip" size={23} color={t.muted} />
      </Pressable>
      <View className="flex-1 rounded-2xl bg-chip px-4 py-3">
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
          returnKeyType="send"
          placeholder="Type a message..."
          placeholderTextColor={t.muted}
          accessibilityLabel="Message"
          style={{ color: t.ink, fontFamily: 'Inter_400Regular', fontSize: 15, padding: 0 }}
        />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Record a voice message" hitSlop={8} onPress={send}>
        <Icon name="mic" size={23} color={t.muted} />
      </Pressable>
    </View>
  );
}
