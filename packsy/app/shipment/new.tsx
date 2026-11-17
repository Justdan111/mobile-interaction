import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Field, FIELD_HEIGHT, Select } from '../../components/shipment/Fields';
import { Stepper } from '../../components/shipment/Stepper';
import { CarrierMark } from '../../components/ui/CarrierMark';
import { Chip } from '../../components/ui/Chip';
import { NavHeader } from '../../components/ui/Header';
import { Icon } from '../../components/ui/icons';
import { GUTTER } from '../../components/ui/Screen';
import { art } from '../../lib/art';
import { CARRIER_NAMES, type CarrierId } from '../../lib/packages';
import { C } from '../../theme/colors';

const STEPS = ['Add shipment', 'Package Details', 'Sender Address'] as const;
const CATEGORIES = ['Shopping', 'Documents', 'Gift'] as const;
const CARRIERS = (['dhl', 'fedex', 'amazon', 'meest'] as CarrierId[]).map((c) => ({ value: c, label: CARRIER_NAMES[c] }));
const UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' },
] as const;

function ParcelCard({ tracking }: { tracking: string }) {
  const box = art['parcel-hero'];
  const h = 230;
  return (
    <View className="bg-sun" style={{ height: 168, borderRadius: 30, overflow: 'hidden', padding: 18 }}>
      {/* The box overruns the card's top and right edges, as in the comp. */}
      <Image
        source={box.source}
        contentFit="contain"
        style={{ position: 'absolute', right: -30, top: -34, width: h * box.aspect, height: h, transform: [{ rotate: '-12deg' }] }}
      />
      <CarrierMark carrier="amazon" size={52} />
      <View style={{ position: 'absolute', left: 20, bottom: 26 }}>
        <Text className="font-body" style={{ color: 'rgba(17,17,17,0.55)', fontSize: 15 }}>
          Tracking number
        </Text>
        <Text className="font-semibold" style={{ color: C.night, fontSize: 19, letterSpacing: 0.4, marginTop: 2 }}>
          {tracking || '—'}
        </Text>
      </View>
    </View>
  );
}

export default function NewShipment() {
  const insets = useSafeAreaInsets();
  // Opens on Package Details: arriving from "Create Shipment" or "+", the
  // tracking number has already been captured, which is the comp's state.
  const [step, setStep] = useState(1);
  const [tracking, setTracking] = useState('DHL123456789');
  const [category, setCategory] = useState<string>('Shopping');
  const [carrier, setCarrier] = useState<CarrierId>('dhl');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');

  const back = () => (step > 0 ? setStep(step - 1) : router.back());
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : router.replace('/packages'));

  return (
    <KeyboardAvoidingView className="flex-1 bg-page" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: GUTTER, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <NavHeader title="New Shipment" onBack={back} />
        <View style={{ marginHorizontal: -8 }}>
          <Stepper steps={STEPS} current={step} />
        </View>

        <View style={{ marginTop: 38 }}>
          <ParcelCard tracking={tracking} />
        </View>

        <Animated.View key={step} entering={FadeInRight.duration(260)} exiting={FadeOutLeft.duration(160)} style={{ marginTop: 30, gap: 14 }}>
          {step === 0 ? (
            <>
              <Field value={tracking} onChangeText={(t) => setTracking(t.toUpperCase())} placeholder="Tracking number" autoCapitalize="characters" />
              <Select label="Carrier" value={carrier} options={CARRIERS} onChange={setCarrier} />
            </>
          ) : step === 1 ? (
            <>
              <View className="flex-row" style={{ gap: 8, marginBottom: 2 }}>
                {CATEGORIES.map((c) => (
                  <Chip key={c} label={c} active={c === category} onPress={() => setCategory(c)} />
                ))}
                <Chip label="More categories" active={false}>
                  <Icon name="more" color={C.ink} surface={C.card} size={20} />
                </Chip>
              </View>
              <Select label="Carrier" value={carrier} options={CARRIERS} onChange={setCarrier} />
              <Field value={name} onChangeText={setName} placeholder="Package Name (optional)" />
              <View className="flex-row" style={{ gap: 12 }}>
                <View className="flex-1">
                  <Field value={weight} onChangeText={setWeight} placeholder="Weight" keyboardType="decimal-pad" />
                </View>
                <View style={{ width: 132 }}>
                  <Select label="Unit" value={unit} options={UNITS} onChange={setUnit} />
                </View>
              </View>
            </>
          ) : (
            <>
              <Field placeholder="Full name" textContentType="name" />
              <Field placeholder="Street address" textContentType="streetAddressLine1" />
              <View className="flex-row" style={{ gap: 12 }}>
                <View className="flex-1">
                  <Field placeholder="City" textContentType="addressCity" />
                </View>
                <View style={{ width: 140 }}>
                  <Field placeholder="Postcode" textContentType="postalCode" />
                </View>
              </View>
              <Field placeholder="Phone (optional)" keyboardType="phone-pad" />
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Footer floats over a fade so fields scroll out beneath it, as the comp's soft edge shows. */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="absolute inset-x-0 bottom-0 flex-row"
        style={{ paddingHorizontal: GUTTER - 6, paddingBottom: insets.bottom + 8, paddingTop: 14, gap: 12, backgroundColor: 'rgba(28,28,28,0.94)' }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          className="flex-1 items-center justify-center rounded-full"
          style={{ height: FIELD_HEIGHT, borderWidth: 1, borderColor: '#6A6A6A' }}
        >
          <Text className="font-medium text-ink" style={{ fontSize: 17 }}>
            Save as draft
          </Text>
        </Pressable>
        <Pressable onPress={next} accessibilityRole="button" className="flex-1 items-center justify-center rounded-full bg-ink" style={{ height: FIELD_HEIGHT }}>
          <Text className="font-medium" style={{ color: C.night, fontSize: 17 }}>
            {step === STEPS.length - 1 ? 'Create' : 'Next'}
          </Text>
        </Pressable>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
