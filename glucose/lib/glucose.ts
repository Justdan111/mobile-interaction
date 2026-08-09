import type { DaySummary, Reading } from '@/data/readings';

export type Unit = 'mg/dL' | 'mmol/L';
export type Target = { low: number; high: number };
export type Trend = 'up' | 'down' | 'flat';

/** The molar mass conversion every CGM uses. Storage is always mg/dL. */
const MMOL_PER_MGDL = 1 / 18.0182;

export function toUnit(mgdl: number, unit: Unit): number {
  return unit === 'mg/dL' ? mgdl : mgdl * MMOL_PER_MGDL;
}

export function fromUnit(value: number, unit: Unit): number {
  return unit === 'mg/dL' ? value : value / MMOL_PER_MGDL;
}

/** mg/dL reads as a whole number; mmol/L needs one decimal to stay useful. */
export function formatValue(mgdl: number, unit: Unit): string {
  const v = toUnit(mgdl, unit);
  return unit === 'mg/dL' ? String(Math.round(v)) : v.toFixed(1);
}

export function formatTarget(target: Target, unit: Unit): string {
  return `${formatValue(target.low, unit)}–${formatValue(target.high, unit)} ${unit}`;
}

export function mean(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stdDev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

/** Coefficient of variation, the standard CGM stability measure. */
export function coefficientOfVariation(xs: number[]): number {
  const m = mean(xs);
  return m === 0 ? 0 : (stdDev(xs) / m) * 100;
}

/**
 * The ADAG relation between mean glucose and HbA1c. Clinically this wants ~90
 * days; the app has 14, so it is an estimate and the info sheet says so.
 */
export function estimateHbA1c(meanMgdl: number): number {
  return (meanMgdl + 46.7) / 28.7;
}

export function classify(mgdl: number, target: Target): 'low' | 'in' | 'high' {
  if (mgdl < target.low) return 'low';
  if (mgdl > target.high) return 'high';
  return 'in';
}

/**
 * Direction of travel from the tail of the trace. The threshold is per-sample
 * rather than per-minute so it holds whatever spacing the series uses.
 */
export function trendOf(readings: Reading[], samples = 4): Trend {
  if (readings.length < 2) return 'flat';
  const tail = readings.slice(-samples);
  const delta = tail[tail.length - 1].mgdl - tail[0].mgdl;
  if (delta > 4) return 'up';
  if (delta < -4) return 'down';
  return 'flat';
}

/** Split a day's readings into the three bands, as fractions of the day. */
export function bandsOf(readings: Reading[], target: Target) {
  if (!readings.length) return { tir: 0, above: 0, below: 0 };
  let inRange = 0;
  let above = 0;
  let below = 0;
  for (const r of readings) {
    const band = classify(r.mgdl, target);
    if (band === 'in') inRange++;
    else if (band === 'high') above++;
    else below++;
  }
  const n = readings.length;
  return { tir: inRange / n, above: above / n, below: below / n };
}

/**
 * Today folded into the same shape as a history row, so the fortnight series
 * can treat every day identically.
 */
export function summariseToday(
  readings: Reading[],
  target: Target,
  label: string,
): DaySummary {
  const values = readings.map((r) => r.mgdl);
  const { tir, above, below } = bandsOf(readings, target);
  return {
    date: 'today',
    label,
    tir,
    above,
    below,
    average: Math.round(mean(values)),
  };
}

/** Weighted across days so a partial day cannot skew the fortnight. */
export function aggregate(days: DaySummary[]) {
  if (!days.length) return { tir: 0, above: 0, below: 0, average: 0 };
  return {
    tir: mean(days.map((d) => d.tir)),
    above: mean(days.map((d) => d.above)),
    below: mean(days.map((d) => d.below)),
    average: mean(days.map((d) => d.average)),
  };
}

export function median(xs: number[]): number {
  if (!xs.length) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * A short forecast off the tail of the trace: recent slope, damped as it runs
 * out, and pulled gently back toward the middle of the target band. It is a
 * projection of the visible trend, not a clinical prediction - the UI labels it
 * as such.
 */
export function project(readings: Reading[], target: Target, steps = 12): Reading[] {
  if (readings.length < 3) return [];
  const tail = readings.slice(-6);
  const slope =
    (tail[tail.length - 1].mgdl - tail[0].mgdl) / Math.max(tail.length - 1, 1);
  const centre = (target.low + target.high) / 2;
  const last = readings[readings.length - 1];
  const spacing =
    readings.length > 1
      ? readings[readings.length - 1].minute - readings[readings.length - 2].minute
      : 5;

  const out: Reading[] = [];
  let value = last.mgdl;
  for (let i = 1; i <= steps; i++) {
    const damping = Math.exp(-i / 5);
    value = value + slope * damping + (centre - value) * 0.06;
    out.push({
      minute: last.minute + i * spacing,
      mgdl: Math.max(40, Math.round(value)),
    });
  }
  return out;
}

/** "14:10" from minutes past midnight. */
export function clockLabel(minute: number): string {
  const h = Math.floor(minute / 60) % 24;
  const m = Math.round(minute % 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}
