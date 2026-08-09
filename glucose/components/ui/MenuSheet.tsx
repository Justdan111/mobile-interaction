import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sheet, SheetRow } from '@/components/ui/Sheet';
import { CheckIcon } from '@/components/icons';
import { useAppState } from '@/state/app-state';
import { formatTarget, type Target, type Unit } from '@/lib/glucose';

const UNITS: Unit[] = ['mg/dL', 'mmol/L'];

/** Named bands rather than a slider — these are the presets clinics hand out. */
const TARGETS: { name: string; target: Target; note: string }[] = [
  { name: 'Tight', target: { low: 70, high: 140 }, note: 'Post-meal control' },
  { name: 'Standard', target: { low: 70, high: 180 }, note: 'Consensus target' },
  { name: 'Relaxed', target: { low: 80, high: 200 }, note: 'Hypo-aware' },
];

export function MenuSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { unit, setUnit, target, setTarget, loggedReadings, resetToday } =
    useAppState();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Settings."
      subtitle="Units and target band apply across every screen."
    >
      <Text className="mb-2.5 font-inter text-[11px] uppercase tracking-[1.2px] text-smoke">
        Units
      </Text>
      {UNITS.map((u) => (
        <SheetRow
          key={u}
          label={u}
          detail={u === 'mg/dL' ? 'US standard' : 'UK, EU and AU standard'}
          selected={unit === u}
          onPress={() => {
            Haptics.selectionAsync();
            setUnit(u);
          }}
          accessory={unit === u ? <CheckIcon /> : null}
        />
      ))}

      <Text className="mb-2.5 mt-4 font-inter text-[11px] uppercase tracking-[1.2px] text-smoke">
        Target range
      </Text>
      {TARGETS.map(({ name, target: t, note }) => {
        const selected = t.low === target.low && t.high === target.high;
        return (
          <SheetRow
            key={name}
            label={`${name} · ${formatTarget(t, unit)}`}
            detail={note}
            selected={selected}
            onPress={() => {
              Haptics.selectionAsync();
              setTarget(t);
            }}
            accessory={selected ? <CheckIcon /> : null}
          />
        );
      })}

      {loggedReadings.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            resetToday();
            onClose();
          }}
          className="mt-3 h-[52px] items-center justify-center rounded-full border border-button-edge bg-button active:opacity-70"
        >
          <Text className="font-inter-medium text-[14px] text-chalk">
            Clear {loggedReadings.length} logged reading
            {loggedReadings.length === 1 ? '' : 's'}
          </Text>
        </Pressable>
      ) : null}

      <View className="h-1" />
    </Sheet>
  );
}
