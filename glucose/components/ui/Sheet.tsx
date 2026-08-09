import { Modal, Pressable, Text, View, type ModalProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CloseIcon } from '@/components/icons';
import { colors } from '@/theme/colors';

/**
 * The app's one modal surface. It borrows the range card's gradient and lit top
 * hairline so a sheet reads as the same material as the cards behind it.
 */
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  ...rest
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
} & Omit<ModalProps, 'visible' | 'children'> & { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
      {...rest}
    >
      {/* The scrim is its own button so a tap anywhere outside dismisses. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        className="flex-1 bg-black/70"
      />

      <LinearGradient
        colors={[colors.cardTop, colors.cardMid, colors.cardEnd]}
        locations={[0, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden"
        style={{
          paddingBottom: Math.max(insets.bottom, 18),
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
      >
        <View className="absolute left-0 right-0 top-0 h-[1px] bg-card-edge" />

        <View className="flex-row items-start justify-between px-6 pt-6">
          <View className="flex-1 pr-4">
            <Text
              className="font-inter-bold text-[24px] leading-[28px] text-chalk"
              style={{ letterSpacing: -0.4 }}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-1.5 font-inter text-[13px] leading-[18px] text-mist">
                {subtitle}
              </Text>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={12}
            onPress={onClose}
            className="h-[34px] w-[34px] items-center justify-center rounded-full bg-menu active:opacity-70"
          >
            <CloseIcon />
          </Pressable>
        </View>

        <View className="px-6 pt-5">{children}</View>
      </LinearGradient>
    </Modal>
  );
}

/** A tappable row with an optional tick — the sheets' only list primitive. */
export function SheetRow({
  label,
  detail,
  selected,
  onPress,
  accessory,
}: {
  label: string;
  detail?: string;
  selected?: boolean;
  onPress?: () => void;
  accessory?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      disabled={!onPress}
      className={`mb-2 flex-row items-center justify-between rounded-2xl border px-4 py-3.5 ${
        selected
          ? 'border-chip-active bg-chip-active/40'
          : 'border-chip-edge bg-chip'
      } ${onPress ? 'active:opacity-70' : ''}`}
    >
      <View className="flex-1 pr-3">
        <Text className="font-inter-medium text-[15px] text-chalk">{label}</Text>
        {detail ? (
          <Text className="mt-0.5 font-inter text-[12px] leading-[16px] text-mist">
            {detail}
          </Text>
        ) : null}
      </View>
      {accessory}
    </Pressable>
  );
}
