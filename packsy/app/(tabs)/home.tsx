import React, { useCallback, useState } from 'react';
import { Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ParcelStack } from '../../components/home/ParcelStack';
import { Barcode } from '../../components/ui/Barcode';
import { TitleHeader } from '../../components/ui/Header';
import { Icon, type IconName } from '../../components/ui/icons';
import { GUTTER, Screen } from '../../components/ui/Screen';
import { activeParcels, parcelById, type Parcel } from '../../lib/packages';
import { C } from '../../theme/colors';
import { Press } from '../../components/ui/Press';

const ACTIVE = activeParcels();

function ActionTile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label.replace('\n', ' ')}
      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 24, backgroundColor: C.card, height: 80, paddingHorizontal: 15, gap: 15 }}
    >
      <View className="items-center justify-center bg-raised" style={{ width: 46, height: 46, borderRadius: 15 }}>
        <Icon name={icon} color={C.ink} surface={C.raised} size={22} />
      </View>
      <Text className="font-medium text-ink" style={{ fontSize: 15.5, lineHeight: 19 }}>
        {label}
      </Text>
    </Press>
  );
}

export default function Home() {
  const { width } = useWindowDimensions();
  const inner = width - GUTTER * 2;
  const [front, setFront] = useState<Parcel>(ACTIVE[0]);
  const [query, setQuery] = useState('');
  const onFrontChange = useCallback((p: Parcel) => setFront(p), []);

  const track = () => {
    const hit = parcelById(query.trim().toUpperCase().replace(/^#/, ''));
    router.push(hit ? `/package/${hit.id}` : '/packages');
  };

  return (
    <Screen>
      <TitleHeader title="Home" />

      <View className="flex-row items-center rounded-full bg-ink" style={{ height: 58, paddingLeft: 22, paddingRight: 6 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={track}
          placeholder="Track a package"
          placeholderTextColor={C.night}
          autoCapitalize="characters"
          returnKeyType="search"
          className="flex-1 font-body"
          style={{ color: C.night, fontSize: 16 }}
        />
        <Pressable
          onPress={track}
          accessibilityRole="button"
          accessibilityLabel="Scan a label"
          className="items-center justify-center bg-bar"
          style={{ width: 46, height: 46, borderRadius: 23 }}
        >
          <Icon name="scan" color={C.ink} surface={C.bar} size={22} />
        </Pressable>
      </View>

      <View className="flex-row" style={{ gap: 12, marginTop: 14 }}>
        <ActionTile icon="dolly" label={'Create\nShipment'} onPress={() => router.push('/shipment/new')} />
        <ActionTile icon="pin-home" label={'Pickup\nLocations'} onPress={() => router.push('/map')} />
      </View>

      <View className="flex-row items-center justify-between" style={{ marginTop: 34, marginBottom: 16 }}>
        <Text className="font-medium text-ink" style={{ fontSize: 17.5 }}>
          Active Packages <Text className="font-body">{`  (${ACTIVE.length})`}</Text>
        </Text>
        <Pressable onPress={() => router.push('/packages')} accessibilityRole="button" hitSlop={8}>
          <Text className="font-semibold text-ink" style={{ fontSize: 15.5 }}>
            View All
          </Text>
        </Pressable>
      </View>

      <ParcelStack parcels={ACTIVE} width={inner} onFrontChange={onFrontChange} />

      {/* Keyed on the parcel, so a new code fades in when the stack cycles. */}
      <Animated.View key={front.id} entering={FadeIn.duration(260)} style={{ marginTop: 48, alignItems: 'center' }}>
        <Barcode value={front.id} width={inner} height={60} bar={C.ink} />
        <Text className="font-body text-ink" style={{ fontSize: 14.5, marginTop: 10 }}>
          Scan me at the post office
        </Text>
      </Animated.View>
    </Screen>
  );
}
