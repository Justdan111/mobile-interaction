import { View, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { font } from '@/theme/type';
import type { ShipmentStatus } from '@/data/shipments';

const BG: Record<ShipmentStatus, string> = {
  'In Transit': colors.amber,
  Delivered: colors.brandPill,
  Pending: colors.mutedSoft,
  Canceled: colors.mutedSoft,
};

export function StatusPill({ status }: { status: ShipmentStatus }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        height: 27,
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderRadius: 999,
        backgroundColor: BG[status],
      }}
    >
      <Text
        style={{
          color: colors.white,
          fontSize: 13,
          fontFamily: font.semibold,
          letterSpacing: 0.1,
        }}
      >
        {status}
      </Text>
    </View>
  );
}
