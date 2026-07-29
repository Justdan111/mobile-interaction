import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

/**
 * The "✕ Close chat" pill centered at the top of the voice and chat
 * screens. Pops back to the previous screen, or home when the screen
 * was opened directly (e.g. via deep link).
 */
export function CloseChatPill() {
  const close = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close chat"
      onPress={close}
      className="h-11 flex-row items-center gap-2 self-center rounded-full bg-surface-chip px-5 active:opacity-70">
      <Feather name="x" size={16} color="#F5EDE6" />
      <Text className="font-inter-medium text-[15px] text-content-primary">Close chat</Text>
    </Pressable>
  );
}
