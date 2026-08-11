import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandMark, SwooshUnderline } from '@/components/icons';
import type { Voucher } from '@/data/vouchers';
import { colors } from '@/theme/colors';

export function VoucherCard({ voucher }: { voucher: Voucher }) {
  return (
    <LinearGradient
      colors={[colors.teal, colors.tealDeep]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      // `flex: 1` because the carousel wraps this in a fixed-aspect box — a
      // fixed height here would fight that and letterbox the gradient.
      style={{ flex: 1, borderRadius: 20, overflow: 'hidden' }}
    >
      {/* Layout lives on a plain View: NativeWind's className does not drive
          flex on LinearGradient, so centring set there is silently ignored and
          the copy pins to the top. */}
      <View className="flex-1 justify-center px-6">
        <View className="absolute right-6 top-6">
          <BrandMark brand={voucher.brand} size={44} color={colors.ember} cut={colors.teal} />
        </View>

        <Text className="font-nunito-extrabold text-[27px] leading-10 text-surface">
          {voucher.headline}
        </Text>

        <View className="flex-row items-end">
          {/* The swoosh hangs under `emphasis` only, so it sits in its own
              absolutely-positioned layer rather than pushing the tail down. */}
          <View>
            <Text className="font-nunito-extrabold text-[27px] leading-10 text-surface">
              {voucher.emphasis}
            </Text>
            <View className="absolute -bottom-0.5 left-0">
              <SwooshUnderline width={voucher.emphasis.length * 14} />
            </View>
          </View>
          <Text className="font-nunito-extrabold text-[27px] leading-10 text-surface">
            {` ${voucher.tail}`}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
