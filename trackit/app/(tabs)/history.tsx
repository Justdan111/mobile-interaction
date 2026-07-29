import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, GUTTER } from '@/theme/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FilterChips } from '@/components/FilterChips';
import { ShipmentCard } from '@/components/ShipmentCard';
import { Rise, SlideIn } from '@/components/motion';
import {
  HISTORY_FILTERS,
  filterHistory,
  historyShipments,
  type HistoryFilter,
} from '@/data/shipments';

/**
 * Entrance choreography, in order: the header sweeps in from the right like
 * Home's, the filter chips follow it one at a time, then the cards rise from
 * underneath with their progress rails filling in behind them.
 */
const T = {
  header: 0,
  chips: 90,
  card: (i: number) => 200 + i * 85,
  cardRail: (i: number) => 570 + i * 110,
};

export default function History() {
  const [filter, setFilter] = useState<HistoryFilter>('All');
  const items = filterHistory(historyShipments, filter);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <SlideIn from="right" delay={T.header} distance={64}>
          <ScreenHeader title="History" />
        </SlideIn>

        <View style={{ marginTop: 26 }}>
          <FilterChips
            options={HISTORY_FILTERS}
            value={filter}
            onChange={setFilter}
            delay={T.chips}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: GUTTER,
            paddingTop: 26,
            paddingBottom: 24,
            gap: 12,
          }}
        >
          {/* Re-keying on the filter remounts the cards, so the stagger
              replays on every filter change as well as on every visit. */}
          {items.map((s, i) => (
            <Rise key={`${filter}-${s.id}`} delay={T.card(i)}>
              <ShipmentCard shipment={s} delay={T.cardRail(i)} />
            </Rise>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
