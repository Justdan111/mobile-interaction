import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  DEFAULT_TARGET,
  history as seedHistory,
  todayLabel,
  todayReadings as seedToday,
  type DaySummary,
  type Reading,
} from '@/data/readings';
import {
  aggregate,
  bandsOf,
  coefficientOfVariation,
  estimateHbA1c,
  mean,
  summariseToday,
  trendOf,
  type Target,
  type Trend,
  type Unit,
} from '@/lib/glucose';

/** Readings the user logged, so the edit sheet knows what it may remove. */
export type TrackedReading = Reading & { logged?: boolean };

export type GraphMode = 'overview' | 'prediction';
export type GraphRange = 7 | 14;

type AppState = {
  unit: Unit;
  target: Target;
  readings: TrackedReading[];
  graphMode: GraphMode;
  graphRange: GraphRange;
  selectedDay: number | null;

  current: number;
  trend: Trend;
  todayAverage: number;
  todayCv: number;
  hba1c: number;
  todayBands: { tir: number; above: number; below: number };
  /** Today folded in, trimmed to the selected range. */
  days: DaySummary[];
  fortnight: { tir: number; above: number; below: number; average: number };
  loggedReadings: TrackedReading[];

  setUnit: (unit: Unit) => void;
  setTarget: (target: Target) => void;
  addReading: (mgdl: number) => void;
  removeReading: (minute: number) => void;
  setGraphMode: (mode: GraphMode) => void;
  setGraphRange: (range: GraphRange) => void;
  selectDay: (index: number | null) => void;
  resetToday: () => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [unit, setUnit] = useState<Unit>('mg/dL');
  const [target, setTarget] = useState<Target>(DEFAULT_TARGET);
  const [readings, setReadings] = useState<TrackedReading[]>(seedToday);
  const [graphMode, setGraphMode] = useState<GraphMode>('overview');
  const [graphRange, setGraphRange] = useState<GraphRange>(14);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  /** New samples land one spacing after the last, keeping the axis honest. */
  const addReading = useCallback((mgdl: number) => {
    setReadings((prev) => {
      const last = prev[prev.length - 1];
      const spacing =
        prev.length > 1 ? last.minute - prev[prev.length - 2].minute : 5;
      return [
        ...prev,
        { minute: last.minute + spacing, mgdl: Math.round(mgdl), logged: true },
      ];
    });
  }, []);

  const removeReading = useCallback((minute: number) => {
    setReadings((prev) => prev.filter((r) => r.minute !== minute));
  }, []);

  const resetToday = useCallback(() => setReadings(seedToday), []);

  const value = useMemo<AppState>(() => {
    const values = readings.map((r) => r.mgdl);
    const todayBands = bandsOf(readings, target);
    const todaySummary = summariseToday(readings, target, todayLabel);

    // `history` is the past only; today is always the live row on the end.
    const days = [...seedHistory, todaySummary].slice(-graphRange);
    const fortnight = aggregate(days);

    return {
      unit,
      target,
      readings,
      graphMode,
      graphRange,
      selectedDay,

      current: values[values.length - 1] ?? 0,
      trend: trendOf(readings),
      todayAverage: mean(values),
      todayCv: coefficientOfVariation(values),
      hba1c: estimateHbA1c(fortnight.average),
      todayBands,
      days,
      fortnight,
      loggedReadings: readings.filter((r) => r.logged),

      setUnit,
      setTarget,
      addReading,
      removeReading,
      setGraphMode,
      setGraphRange,
      selectDay: setSelectedDay,
      resetToday,
    };
  }, [
    unit,
    target,
    readings,
    graphMode,
    graphRange,
    selectedDay,
    addReading,
    removeReading,
    resetToday,
  ]);

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
