/**
 * Static sample data. Every number here is read off the three comps — the app
 * is a faithful rebuild of those screens, not a live CGM client. The chart
 * series were sampled straight from the mock artwork, which is why they carry
 * three decimals rather than round numbers.
 */

export const today = {
  label: 'MON. OCT 20',
  current: 72,
  unit: 'mg/dL',
  /** Up, down or flat — drives the trend triangle on the dashboard. */
  trend: 'up' as 'up' | 'down' | 'flat',
};

/**
 * The dashboard trace, normalised 0..1 against the plotted band: 51 samples
 * spanning 10:00 to now.
 */
export const trace = [
  0.278, 0.361, 0.426, 0.444, 0.686, 0.731, 0.741, 0.834, 0.926, 0.935, 0.87,
  0.657, 0.482, 0.444, 0.454, 0.491, 0.547, 0.592, 0.611, 0.592, 0.574, 0.537,
  0.5, 0.454, 0.408, 0.37, 0.361, 0.399, 0.482, 0.565, 0.639, 0.686, 0.722,
  0.76, 0.778, 0.787, 0.769, 0.741, 0.676, 0.602, 0.556, 0.602, 0.676, 0.75,
  0.834, 0.926, 0.982, 0.982, 0.972, 0.815, 0.666,
];

export const traceAxis = ['10', '12', '14', 'now'];

export const summary = [
  { label: 'Average', value: '93', unit: 'mg/dL' },
  { label: 'HbA1c', value: '7.1', unit: '%' },
  { label: 'CV', value: '36', unit: '%' },
];

/** The three range cards on the Events screen. Bars are fractions of the card. */
export const events = [
  {
    label: 'Time in target',
    value: '50',
    unit: '%',
    tone: 'violet' as const,
    bars: [0.478, 0.462, 0.488, 0.488, 0.453, 0.41],
  },
  {
    label: 'Above range',
    value: '30',
    unit: '%',
    tone: 'clay' as const,
    bars: [0.39, 0.543, 0.695, 0.661, 0.771, 0.508],
  },
  {
    label: 'Below range',
    value: '20',
    unit: '%',
    tone: 'amber' as const,
    bars: [0.353, 0.215, 0.267, 0.31, 0.5, 0.241],
  },
];

/** Thirteen days of time-in-range, plus the ticks under them. */
export const fortnight = [
  0.68, 0.504, 1.0, 0.736, 0.552, 0.736, 0.52, 0.684, 0.468, 0.488, 0.52, 0.648,
  0.456,
];

export const fortnightAxis = ['1', '07', '14', '21', '28', '4', '11'];

/** Where the dotted reference line sits inside the fortnight chart. */
export const fortnightMedian = 0.53;

export const fortnightHeadline = {
  value: '50',
  unit: '%',
  badge: 'Good',
};
