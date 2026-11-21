import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { C } from '../../theme/colors';

/** A blue message bubble whose tail hooks out of its bottom-left corner. */
export function ChatBubble({ text, style, width }: { text: string; style?: StyleProp<ViewStyle>; width: number }) {
  return (
    <View style={[{ width }, style]}>
      <View style={{ backgroundColor: C.blue, borderRadius: 20, borderBottomLeftRadius: 6, paddingHorizontal: 16, paddingVertical: 11 }}>
        <Text className="font-medium" style={{ color: C.white, fontSize: 14.5, lineHeight: 21 }}>
          {text}
        </Text>
      </View>
      <Svg width={14} height={12} viewBox="0 0 14 12" style={{ position: 'absolute', left: -6, bottom: 0 }}>
        <Path d="M14 0v10c-3 0-9 .8-14 2 3.4-2.4 6-6.2 6-12z" fill={C.blue} />
      </Svg>
    </View>
  );
}

/** A white rounded square holding one emoji, with a soft lift off the page. */
export function EmojiBubble({
  emoji,
  style,
  tail,
}: {
  emoji: string;
  style?: StyleProp<ViewStyle>;
  /** Which bottom corner is pointed. */
  tail: 'left' | 'right';
}) {
  return (
    <View
      style={[
        {
          width: 48,
          height: 48,
          borderRadius: 16,
          borderBottomLeftRadius: tail === 'left' ? 4 : 16,
          borderBottomRightRadius: tail === 'right' ? 4 : 16,
          backgroundColor: C.white,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
    </View>
  );
}
