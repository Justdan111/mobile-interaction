import React, { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { TitleHeader } from '../../components/ui/Header';
import { Icon, type IconName } from '../../components/ui/icons';
import { Screen } from '../../components/ui/Screen';
import { C } from '../../theme/colors';

/** Settings, built from the other screens' parts. */
function Row({ icon, label, value, toggle }: { icon: IconName; label: string; value?: string; toggle?: [boolean, (v: boolean) => void] }) {
  return (
    <View className="flex-row items-center" style={{ paddingVertical: 12, gap: 14 }}>
      <View className="items-center justify-center bg-raised" style={{ width: 40, height: 40, borderRadius: 20 }}>
        <Icon name={icon} color={C.ink} surface={C.raised} size={20} />
      </View>
      <Text className="flex-1 font-body text-ink" style={{ fontSize: 15.5 }}>
        {label}
      </Text>
      {toggle ? (
        <Switch value={toggle[0]} onValueChange={toggle[1]} trackColor={{ true: C.go, false: C.raised }} thumbColor={C.ink} />
      ) : (
        <Text className="font-body text-muted" style={{ fontSize: 14.5 }}>
          {value}
        </Text>
      )}
    </View>
  );
}

export default function Settings() {
  const push = useState(true);
  const arrivals = useState(true);
  const digest = useState(false);
  return (
    <Screen>
      <TitleHeader title="Settings" />
      <View className="flex-row items-center rounded-3xl bg-sun" style={{ padding: 18, gap: 14 }}>
        <View className="items-center justify-center rounded-full bg-bar" style={{ width: 52, height: 52 }}>
          <Text className="font-semibold text-ink" style={{ fontSize: 18 }}>
            AM
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold" style={{ color: C.night, fontSize: 17 }}>
            Alex Morgan
          </Text>
          <Text className="font-body" style={{ color: 'rgba(17,17,17,0.6)', fontSize: 13.5 }}>
            Paris, France
          </Text>
        </View>
      </View>

      <Text className="font-medium text-ink" style={{ fontSize: 17, marginTop: 28, marginBottom: 4 }}>
        Notifications
      </Text>
      <View className="rounded-3xl bg-card" style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <Row icon="bell" label="Push notifications" toggle={push} />
        <Row icon="bus" label="Out for delivery alerts" toggle={arrivals} />
        <Row icon="note" label="Weekly digest" toggle={digest} />
      </View>

      <Text className="font-medium text-ink" style={{ fontSize: 17, marginTop: 28, marginBottom: 4 }}>
        Preferences
      </Text>
      <View className="rounded-3xl bg-card" style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <Row icon="pin-home" label="Default pickup point" value="Locker 1025" />
        <Row icon="box" label="Weight unit" value="kg" />
        <Row icon="dolly" label="Default carrier" value="DHL Express" />
      </View>

      <Pressable onPress={() => router.replace('/')} className="items-center justify-center rounded-full" style={{ height: 58, marginTop: 28, borderWidth: 1, borderColor: '#6A6A6A' }}>
        <Text className="font-medium text-ink" style={{ fontSize: 16 }}>
          Back to welcome
        </Text>
      </Pressable>
    </Screen>
  );
}
