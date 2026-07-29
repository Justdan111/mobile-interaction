import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { Orb } from '@/components/orb';

export type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  text: string;
};

/**
 * A single chat message: orange gradient bubble on the right for the
 * user, dark bubble with a small orb avatar on the left for the AI.
 */
export function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <View className="flex-row justify-end">
        <LinearGradient
          colors={['#F08A33', '#C85A12']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{
            maxWidth: '78%',
            borderRadius: 26,
            paddingHorizontal: 18,
            paddingVertical: 15,
          }}>
          <Text className="font-inter-medium text-[15px] leading-[21px] text-content-primary">
            {message.text}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="flex-row items-start gap-2.5 pr-8">
      <View className="-mt-1">
        <Orb size={28} />
      </View>
      <View className="shrink rounded-[24px] bg-[#181008] px-[18px] py-3.5">
        <Text className="font-inter-medium text-[15px] leading-[22px] text-content-primary">
          {message.text}
        </Text>
      </View>
    </View>
  );
}
