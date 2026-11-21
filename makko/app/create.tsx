import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Avatar } from '../components/feed/Avatar';
import { Icon } from '../components/ui/icons';
import { Press } from '../components/ui/Press';
import { ME } from '../data/people';
import { C } from '../theme/colors';

/** The "+" composer: a text post, the same shape as the feed's text cards. */
export default function Create() {
  const [text, setText] = useState('');
  return (
    <View className="flex-1 bg-page" style={{ padding: 20 }}>
      <View className="flex-row items-center justify-between">
        <Press onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
          <Icon name="close" color={C.ink} size={26} />
        </Press>
        <Press onPress={() => router.back()} disabled={!text.trim()} accessibilityRole="button" style={{ backgroundColor: text.trim() ? C.black : C.faint, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text className="font-semibold" style={{ color: C.white, fontSize: 15 }}>Post</Text>
        </Press>
      </View>
      <View className="flex-row" style={{ gap: 12, marginTop: 24 }}>
        <Avatar source={ME.avatar} size={40} />
        <TextInput value={text} onChangeText={setText} placeholder="Share something with the world…" placeholderTextColor={C.muted} multiline autoFocus className="flex-1 font-body text-ink" style={{ fontSize: 17, lineHeight: 24, paddingTop: 8 }} />
      </View>
    </View>
  );
}
