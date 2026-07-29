import { View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, GUTTER } from '@/theme/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PromoCard } from '@/components/PromoCard';
import { Rise, SlideIn } from '@/components/motion';
import { promos } from '@/data/shipments';

/**
 * Entrance choreography: the header sweeps in from the right like Home's and
 * History's, then the offers rise from underneath one after another.
 */
const T = {
  header: 0,
  card: (i: number) => 110 + i * 85,
};

export default function Promos() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <SlideIn from="right" delay={T.header} distance={64}>
          <ScreenHeader title="Promos & Offers" />
        </SlideIn>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: GUTTER,
            paddingTop: 25,
            paddingBottom: 24,
            gap: 12,
          }}
        >
          {promos.map((p, i) => (
            <Rise key={p.id} delay={T.card(i)}>
              <PromoCard promo={p} />
            </Rise>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
