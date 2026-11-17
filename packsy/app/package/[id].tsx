import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Locker } from '../../components/detail/Locker';
import { ParcelSummary } from '../../components/packages/ParcelCard';
import { NavHeader } from '../../components/ui/Header';
import { Icon, type IconName } from '../../components/ui/icons';
import { Screen } from '../../components/ui/Screen';
import { formatDatePadded } from '../../lib/format';
import { CARRIER_NAMES, parcelById, status, timeline } from '../../lib/packages';
import { placeById } from '../../lib/places';
import { C } from '../../theme/colors';

const ACTIONS: { icon: IconName; label: string }[] = [
  { icon: 'history', label: 'Reschedule\nDelivery' },
  { icon: 'person', label: 'Change\nRecipient' },
  { icon: 'note', label: 'Delivery\nInstructions' },
];

function Card({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <Animated.View entering={FadeInDown.duration(420).delay(80 + index * 70)} className="rounded-3xl bg-card" style={{ padding: 18 }}>
      {children}
    </Animated.View>
  );
}

const DOT = 13;
/** The detail screen runs its cards closer to the screen edge than the tab screens. */
const DETAIL_GUTTER = 14;

export default function PackageDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parcel = parcelById(String(id));

  if (!parcel) {
    return (
      <Screen clearance={40}>
        <NavHeader title="Not found" />
        <Text className="font-body text-muted">No package with number {id}.</Text>
      </Screen>
    );
  }

  const rows = timeline(parcel);
  const delivered = status(parcel) === 'received';
  const place = placeById(parcel.pickupId);

  return (
    <Screen clearance={40} gutter={DETAIL_GUTTER}>
      <NavHeader title={`#${parcel.id}`} />

      {/* Bleeds past the gutter on the right, so the third tile reads as "more this way". */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -DETAIL_GUTTER }}
        contentContainerStyle={{ paddingHorizontal: DETAIL_GUTTER, gap: 12 }}
      >
        {ACTIONS.map((a) => (
          <Pressable
            key={a.label}
            accessibilityRole="button"
            accessibilityLabel={a.label.replace('\n', ' ')}
            className="flex-row items-center rounded-3xl bg-card"
            style={{ width: 158, height: 72, paddingHorizontal: 14, gap: 12 }}
          >
            <View className="items-center justify-center bg-raised" style={{ width: 40, height: 40, borderRadius: 20 }}>
              <Icon name={a.icon} color={C.ink} surface={C.raised} size={21} />
            </View>
            <Text className="font-medium text-ink" style={{ fontSize: 15, lineHeight: 19 }}>
              {a.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ gap: 10, marginTop: 14 }}>
        <Card index={0}>
          <ParcelSummary parcel={parcel} />
        </Card>

        <Card index={1}>
          <Text className="font-medium text-ink" style={{ fontSize: 17, marginBottom: 18 }}>
            Route
          </Text>
          {rows.map((r, i) => {
            const last = i === rows.length - 1;
            return (
              <View key={r.title} className="flex-row">
                <View style={{ width: 22, alignItems: 'center' }}>
                  {r.current ? (
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.go, alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
                      <View style={{ width: 11, height: 11, borderRadius: 5.5, backgroundColor: C.ink }} />
                    </View>
                  ) : (
                    <View style={{ width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: C.go, marginTop: 5 }} />
                  )}
                  {/* Solid green between reached events; dotted grey on to the ETA. */}
                  {!last ? (
                    <View style={{ flex: 1, width: 2, backgroundColor: C.go }} />
                  ) : !delivered ? (
                    <View style={{ flex: 1, alignItems: 'center', paddingTop: 3 }}>
                      {Array.from({ length: 6 }, (_, k) => (
                        <View key={k} style={{ width: 1.5, height: 3, marginBottom: 3, backgroundColor: C.node }} />
                      ))}
                    </View>
                  ) : null}
                </View>
                <View style={{ marginLeft: 14, paddingBottom: last ? 14 : 18 }}>
                  <Text className="font-body text-ink" style={{ fontSize: r.current ? 19 : 15.5 }}>
                    {r.title}
                  </Text>
                  <Text className="font-body text-muted" style={{ fontSize: 13.5, marginTop: 1 }}>
                    {r.caption}
                  </Text>
                </View>
              </View>
            );
          })}
          {!delivered ? (
            <View className="flex-row items-center">
              <View style={{ width: 22, alignItems: 'center' }}>
                <View style={{ width: 11, height: 11, borderRadius: 5.5, backgroundColor: C.node }} />
              </View>
              <Text className="font-body" style={{ color: C.muted, fontSize: 13.5, marginLeft: 14 }}>
                Expected delivery by {formatDatePadded(parcel.etaAt)}
              </Text>
            </View>
          ) : null}
        </Card>

        <Card index={2}>
          <View className="flex-row items-center justify-between">
            <Text className="font-medium text-ink" style={{ fontSize: 17 }}>
              Pickup Point
            </Text>
            <Pressable accessibilityRole="button" className="items-center justify-center rounded-full bg-ink" style={{ height: 46, paddingHorizontal: 20 }}>
              <Text className="font-medium" style={{ color: C.night, fontSize: 15 }}>
                Change
              </Text>
            </Pressable>
          </View>
          <View className="flex-row items-center" style={{ marginTop: 6, gap: 18 }}>
            <Locker size={60} />
            <View className="flex-1">
              <Text className="font-body text-ink" style={{ fontSize: 15.5 }}>
                {place.name}
              </Text>
              <Text className="font-body text-muted" style={{ fontSize: 13.5 }}>
                {place.address}
              </Text>
            </View>
          </View>
        </Card>

        <Card index={3}>
          <Text className="font-medium text-ink" style={{ fontSize: 17, marginBottom: 10 }}>
            Additional Information
          </Text>
          {[
            ['Carrier', CARRIER_NAMES[parcel.carrier]],
            ['Weight', `${parcel.weightKg} kg`],
            ['Dimensions', `${parcel.dimensionsCm.join(' × ')} cm`],
            ['From', `${parcel.origin.city}, ${parcel.origin.country}`],
            ['To', `${parcel.destination.city}, ${parcel.destination.country}`],
          ].map(([k, v]) => (
            <View key={k} className="flex-row justify-between" style={{ paddingVertical: 8 }}>
              <Text className="font-body text-muted" style={{ fontSize: 14.5 }}>
                {k}
              </Text>
              <Text className="font-body text-ink" style={{ fontSize: 14.5 }}>
                {v}
              </Text>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}
