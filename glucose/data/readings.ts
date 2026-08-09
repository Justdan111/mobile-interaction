/**
 * Sample data for the three comps, reshaped into something the app can compute
 * against. Nothing here is a headline number: the figures the screens show
 * (72 mg/dL, 93 average, 7.1% HbA1c, 50/30/20) all fall out of these series via
 * `lib/glucose.ts`, so logging a reading moves them.
 *
 * Today's curve keeps the shape sampled from the comp artwork but is expressed
 * in mg/dL, solved so its mean is 93 and its final sample is 72 - the two
 * numbers the dashboard puts on screen.
 */

export type Reading = {
  /** Minutes past midnight, so the series needs no Date at module scope. */
  minute: number;
  mgdl: number;
};

export type DaySummary = {
  date: string;
  label: string;
  /** Fractions of the day spent in, above and below the target band. */
  tir: number;
  above: number;
  below: number;
  average: number;
};

/** Today's trace: 51 samples at 5-minute spacing, 10:00 through 14:10. */
const TODAY_MGDL = [
  57, 70, 80, 82, 122, 128, 129, 143, 158, 158, 147, 110, 79, 72, 73, 78, 86,
  93, 95, 91, 87, 80, 72, 64, 55, 48, 45, 50, 63, 76, 88, 95, 100, 105, 107,
  108, 104, 98, 86, 73, 64, 71, 82, 93, 106, 121, 129, 128, 126, 98, 72,
];

const FIRST_SAMPLE_MINUTE = 10 * 60;
const SAMPLE_SPACING = 5;

export const todayReadings: Reading[] = TODAY_MGDL.map((mgdl, i) => ({
  minute: FIRST_SAMPLE_MINUTE + i * SAMPLE_SPACING,
  mgdl,
}));

export const todayLabel = 'MON. OCT 20';

/**
 * The thirteen days *behind* today - today itself is computed from
 * `todayReadings` and appended at runtime. Solved so that once today folds in,
 * the fortnight aggregates to exactly 50% in target, 30% above and 20% below,
 * at a mean of 157 mg/dL, which is the 7.1% HbA1c the dashboard reports.
 *
 * Because today is live, logging readings moves all four of those figures.
 */
export const history: DaySummary[] = [
  { date: '2025-10-07', label: 'TUE 07 OCT', tir: 0.5239, above: 0.3229, below: 0.1532, average: 164 },
  { date: '2025-10-08', label: 'WED 08 OCT', tir: 0.3883, above: 0.3295, below: 0.2822, average: 158 },
  { date: '2025-10-09', label: 'THU 09 OCT', tir: 0.7704, above: 0.1397, below: 0.0899, average: 142 },
  { date: '2025-10-10', label: 'FRI 10 OCT', tir: 0.567, above: 0.2937, below: 0.1393, average: 162 },
  { date: '2025-10-11', label: 'SAT 11 OCT', tir: 0.4252, above: 0.3096, below: 0.2652, average: 156 },
  { date: '2025-10-12', label: 'SUN 12 OCT', tir: 0.567, above: 0.2634, below: 0.1696, average: 155 },
  { date: '2025-10-13', label: 'MON 13 OCT', tir: 0.4006, above: 0.4065, below: 0.1929, average: 175 },
  { date: '2025-10-14', label: 'TUE 14 OCT', tir: 0.5269, above: 0.2548, below: 0.2183, average: 151 },
  { date: '2025-10-15', label: 'WED 15 OCT', tir: 0.3605, above: 0.3891, below: 0.2504, average: 169 },
  { date: '2025-10-16', label: 'THU 16 OCT', tir: 0.3759, above: 0.4233, below: 0.2008, average: 177 },
  { date: '2025-10-17', label: 'FRI 17 OCT', tir: 0.4006, above: 0.3228, below: 0.2766, average: 157 },
  { date: '2025-10-18', label: 'SAT 18 OCT', tir: 0.4992, above: 0.3047, below: 0.1961, average: 160 },
  { date: '2025-10-19', label: 'SUN 19 OCT', tir: 0.3513, above: 0.44, below: 0.2087, average: 179 },
];

/** The band the app scores against. Adjustable from the menu. */
export const DEFAULT_TARGET = { low: 70, high: 180 };

/** What the events cards are keyed on - order matters, it is the card order. */
export const RANGE_BANDS = ['tir', 'above', 'below'] as const;
export type RangeBand = (typeof RANGE_BANDS)[number];
