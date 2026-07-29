import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, TextInput, View } from 'react-native';

import { IconButton } from '@/components/icon-button';

type PromptPanelProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  model: string;
  onPressAttach: () => void;
  onPressModel: () => void;
  onPressMic: () => void;
};

/**
 * The large composer at the bottom of the home screen: multiline prompt
 * input with attachment, model selector, and voice controls.
 */
export function PromptPanel({
  value,
  onChangeText,
  onSubmit,
  model,
  onPressAttach,
  onPressModel,
  onPressMic,
}: PromptPanelProps) {
  return (
    <View className="mx-2 mb-2 flex-1 rounded-[30px] border border-hairline bg-surface-panel">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        blurOnSubmit
        returnKeyType="send"
        onSubmitEditing={onSubmit}
        placeholder="Ask AI a question or describe your idea"
        placeholderTextColor="rgba(255, 236, 224, 0.5)"
        keyboardAppearance="dark"
        selectionColor="#FF6B00"
        className="flex-1 px-5 pt-5 font-inter text-[17px] leading-[24px] text-content-primary"
        textAlignVertical="top"
        accessibilityLabel="Ask AI a question or describe your idea"
      />
      <View className="flex-row items-center gap-2.5 p-3">
        <IconButton size={52} onPress={onPressAttach} accessibilityLabel="Attach a file">
          <Feather name="paperclip" size={20} color="#F5EDE6" />
        </IconButton>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Model: ${model}`}
          onPress={onPressModel}
          className="h-[52px] flex-row items-center gap-1.5 rounded-full border border-hairline bg-surface-chip px-5 active:opacity-70">
          <Text className="font-inter-medium text-[15px] text-content-primary">{model}</Text>
          <Feather name="chevron-down" size={16} color="rgba(255, 240, 228, 0.7)" />
        </Pressable>
        <View className="flex-1" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dictate with your voice"
          onPress={onPressMic}
          className="active:opacity-85"
          style={{
            borderRadius: 28,
            shadowColor: '#FF6B00',
            shadowOpacity: 0.55,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 4 },
            elevation: 10,
          }}>
          <LinearGradient
            colors={['#FF9330', '#F25D00']}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Feather name="mic" size={22} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}
