import React from 'react';
import { Text, View } from 'react-native';
import { PEOPLE } from '../../data/people';
import { engagement, type TextPost } from '../../data/posts';
import { C } from '../../theme/colors';
import { Avatar } from './Avatar';

/** A text post: author, body, and an engagement line when there is any. */
export function TextCard({ post, height }: { post: TextPost; height?: number }) {
  const who = PEOPLE[post.author];
  const line = engagement(post);
  return (
    <View style={{ height, borderRadius: 24, backgroundColor: C.card, padding: 16 }}>
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <Avatar source={who.avatar} size={32} />
        <Text className="font-semibold text-ink" style={{ fontSize: 14.5 }}>
          {who.name}
        </Text>
      </View>
      <Text className="font-body text-ink" style={{ fontSize: 14, lineHeight: 21, marginTop: 12 }}>
        {post.text}
      </Text>
      {line ? (
        <Text className="font-body text-muted" style={{ fontSize: 13, marginTop: 'auto', paddingTop: 12 }}>
          {line}
        </Text>
      ) : null}
    </View>
  );
}
