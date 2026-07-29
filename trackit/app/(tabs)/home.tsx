import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, GUTTER } from '@/theme/colors';
import { font } from '@/theme/type';
import { Header } from '@/components/Header';
import { QuickAction } from '@/components/QuickAction';
import { FeaturedCard } from '@/components/FeaturedCard';
import { ShipmentCard } from '@/components/ShipmentCard';
import { Rise, SlideIn } from '@/components/motion';
import {
  CallCenterIcon,
  CheckReceiptIcon,
  OrderIcon,
  ShippingCostIcon,
} from '@/components/art/QuickIcons';
import { featuredShipment, shipments } from '@/data/shipments';

/**
 * Entrance choreography, in order: the header sweeps in from the right on its
 * own, the four quick actions follow it one at a time, then everything below
 * rises from underneath in sequence.
 */
const T = {
  header: 0,
  action: (i: number) => 110 + i * 70, // 110 → 320
  featured: 400,
  section: 470,
  card: (i: number) => 530 + i * 85, // 530 → 700
  featuredRail: 760,
  cardRail: (i: number) => 900 + i * 110,
};

export default function Home() {
  const router = useRouter();

  const actions = [
    { icon: <OrderIcon />, label: 'Order', onPress: undefined },
    {
      icon: <ShippingCostIcon />,
      label: 'Shipping Cost',
      onPress: () => router.push('/shipping-cost'),
    },
    { icon: <CallCenterIcon />, label: 'Call Center', onPress: undefined },
    { icon: <CheckReceiptIcon />, label: 'Check Receipt', onPress: undefined },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 28 }}
        >
          <SlideIn from="right" delay={T.header} distance={64}>
            <Header name="Esther Howard" location="Dhaka, Bangladesh" />
          </SlideIn>

          <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'space-between' }}>
            {actions.map((a, i) => (
              <SlideIn key={a.label} from="right" delay={T.action(i)} distance={76}>
                <QuickAction icon={a.icon} label={a.label} onPress={a.onPress} />
              </SlideIn>
            ))}
          </View>

          <Rise delay={T.featured} style={{ marginTop: 24 }}>
            <FeaturedCard
              shipment={featuredShipment}
              railDelay={T.featuredRail}
              onPress={() => router.push('/live-tracking')}
            />
          </Rise>

          <Rise delay={T.section} style={{ marginTop: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  lineHeight: 25,
                  fontFamily: font.bold,
                  color: colors.ink,
                  letterSpacing: -0.4,
                }}
              >
                Current Shipments
              </Text>
              <Text
                onPress={() => router.push('/history')}
                style={{ fontSize: 14.5, fontFamily: font.medium, color: colors.muted }}
              >
                See all
              </Text>
            </View>
          </Rise>

          <View style={{ marginTop: 20, gap: 16 }}>
            {shipments.map((s, i) => (
              <Rise key={s.id} delay={T.card(i)}>
                <ShipmentCard
                  shipment={s}
                  delay={T.cardRail(i)}
                  onPress={() => router.push('/live-tracking')}
                />
              </Rise>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
