import { Pressable, Text, View } from 'react-native';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-nunito-extrabold text-[22px] text-ink">{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text className="font-nunito text-[15px] text-muted">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
