import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { formatDate } from '../../lib/format';
import { arrivalAt, shippedAt, stage, status, type Parcel } from '../../lib/packages';
import { C } from '../../theme/colors';
import { CarrierMark } from '../ui/CarrierMark';
import { Icon } from '../ui/icons';
import { RouteTrack } from '../ui/RouteTrack';
import { StatusPill } from '../ui/StatusPill';
import { Press } from '../ui/Press';

/** Carrier, number with copy, contents, and the status pill. Shared by the
 *  Packages list and the top of the detail screen. */
export function ParcelSummary({ parcel }: { parcel: Parcel }) {
  const copy = () => {
    Clipboard.setStringAsync(parcel.id).catch(() => {});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };
  return (
    <View className="flex-row items-center">
      <CarrierMark carrier={parcel.carrier} size={48} />
      <View className="flex-1" style={{ marginLeft: 14 }}>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Text className="font-semibold text-ink" style={{ fontSize: 17, letterSpacing: 0.3 }}>
            {parcel.id}
          </Text>
          <Pressable onPress={copy} accessibilityRole="button" accessibilityLabel={`Copy ${parcel.id}`} hitSlop={10}>
            <Icon name="copy" color="#9A9A9A" surface={C.card} size={17} />
          </Pressable>
        </View>
        <Text className="font-body" style={{ color: '#C9C9C9', fontSize: 13.5, marginTop: 1 }}>
          {parcel.contents}
        </Text>
      </View>
      <StatusPill status={status(parcel)} variant="filled" ink={status(parcel) === 'received' ? '#1B3320' : C.night} surface={C.card} />
    </View>
  );
}

export function ParcelCard({ parcel, onPress }: { parcel: Parcel; onPress: () => void }) {
  const arrived = stage(parcel) === 2;
  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Package ${parcel.id}`}
      style={{ borderRadius: 24, backgroundColor: C.card, padding: 17 }}
      pressedStyle={{ opacity: 0.85 }}
    >
      <ParcelSummary parcel={parcel} />

      <View className="flex-row justify-between" style={{ marginTop: 22, marginBottom: 9 }}>
        <Text className="font-medium text-ink" style={{ fontSize: 15.5 }}>
          {parcel.origin.city}
        </Text>
        <Text className="font-medium text-ink" style={{ fontSize: 15.5 }}>
          {parcel.destination.city}
        </Text>
      </View>
      <RouteTrack stage={stage(parcel)} surface={C.card} />

      <View className="flex-row justify-between" style={{ marginTop: 14 }}>
        <View>
          <Text className="font-body text-ink" style={{ fontSize: 15 }}>
            {formatDate(shippedAt(parcel))}
          </Text>
          <Text className="font-body text-muted" style={{ fontSize: 13 }}>
            Shipped
          </Text>
        </View>
        <View className="items-end">
          <Text className="font-body text-ink" style={{ fontSize: 15 }}>
            {formatDate(arrivalAt(parcel))}
          </Text>
          <Text className="font-body text-muted" style={{ fontSize: 13 }}>
            {arrived ? 'Delivered' : 'Est. Arrival'}
          </Text>
        </View>
      </View>
    </Press>
  );
}
