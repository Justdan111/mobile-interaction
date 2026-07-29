import { View, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { font } from '@/theme/type';
import type { Shipment } from '@/data/shipments';
import { BoxArt } from './art/BoxArt';
import { StatusPill } from './StatusPill';
import { ProgressTrack } from './ProgressTrack';
import { PressableScale } from './motion';

export function ShipmentCard({
  shipment,
  delay = 0,
  onPress,
}: {
  shipment: Shipment;
  delay?: number;
  onPress?: () => void;
}) {
  const delivered = shipment.status === 'Delivered';
  const canceled = shipment.status === 'Canceled';

  return (
    <PressableScale
      onPress={onPress}
      to={0.985}
      style={{
        borderRadius: 22,
        backgroundColor: colors.card,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
        overflow: 'hidden',
      }}
    >
      {/* parcel */}
      <View style={{ position: 'absolute', right: 15, top: 12 }}>
        <BoxArt width={102} height={118} />
      </View>

      <StatusPill status={shipment.status} />

      <Text
        style={{
          marginTop: 14,
          fontSize: 19,
          lineHeight: 23,
          fontFamily: font.semibold,
          color: colors.ink,
          letterSpacing: -0.3,
        }}
      >
        {shipment.code}
      </Text>

      <Text
        style={{ marginTop: 16, fontSize: 12.5, lineHeight: 16, fontFamily: font.regular, color: colors.muted }}
      >
        Delivery date
      </Text>
      <Text
        style={{
          marginTop: 3,
          fontSize: 17.5,
          lineHeight: 22,
          fontFamily: font.semibold,
          color: colors.ink,
          letterSpacing: -0.2,
        }}
      >
        {shipment.date}
      </Text>

      <View style={{ marginTop: 8 }}>
        <ProgressTrack
          progress={shipment.progress}
          tone={canceled ? 'muted' : delivered ? 'brand' : 'amber'}
          icon={canceled ? 'close-thick' : delivered ? 'check-bold' : 'ferry'}
          sailing={!delivered && !canceled}
          delay={delay}
        />
      </View>
    </PressableScale>
  );
}
