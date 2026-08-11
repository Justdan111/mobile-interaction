import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AccountIcon,
  CartIcon,
  CloseIcon,
  HeartIcon,
  HomeIcon,
  MessageIcon,
  SettingIcon,
  SignOutIcon,
} from '@/components/icons';
import { DrawerItem } from '@/components/drawer/DrawerItem';
import { IconButton } from '@/components/ui/IconButton';
import { useStore } from '@/state/store';
import { colors } from '@/theme/colors';

const IDLE = colors.drawerIdle;

export function DrawerPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cartCount, reset } = useStore();

  function go(path: string) {
    onClose();
    router.push(path);
  }

  return (
    <View
      className="flex-1 px-8"
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-row items-center gap-4">
        {/* No avatar photograph ships with the app, so a monogram stands in —
            a broken image well would read worse than a deliberate initial. */}
        <View className="h-14 w-14 items-center justify-center rounded-full bg-ember/90">
          <Text className="font-nunito-extrabold text-[20px] text-surface">DM</Text>
        </View>
        <View className="flex-1">
          <Text className="font-nunito-extrabold text-[22px] text-surface">
            Dylan Meringue
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-ember" />
            <Text className="font-nunito text-[14px]" style={{ color: IDLE }}>
              Active status
            </Text>
          </View>
        </View>
        <IconButton onPress={onClose} accessibilityLabel="Close menu">
          <CloseIcon />
        </IconButton>
      </View>

      <View className="flex-1 justify-center">
        <DrawerItem
          icon={<HomeIcon color={colors.surface} />}
          label="Home"
          active
          onPress={onClose}
        />
        <DrawerItem
          icon={<CartIcon color={IDLE} />}
          label="Cart"
          badge={cartCount || undefined}
          onPress={() => go('/cart')}
        />
        <DrawerItem
          icon={<HeartIcon size={24} color={IDLE} strokeWidth={1.9} />}
          label="Favourites"
          onPress={() => go('/favourites')}
        />
        <DrawerItem
          icon={<MessageIcon color={IDLE} />}
          label="Message"
          onPress={() => go('/message')}
        />
        <DrawerItem
          icon={<AccountIcon color={IDLE} />}
          label="Account"
          onPress={() => go('/account')}
        />
        <DrawerItem
          icon={<SettingIcon color={IDLE} />}
          label="Setting"
          onPress={() => go('/setting')}
        />
      </View>

      <DrawerItem
        icon={<SignOutIcon color={colors.surface} />}
        label="Sign Out"
        active
        onPress={() => {
          reset();
          onClose();
        }}
      />
    </View>
  );
}
