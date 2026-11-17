/**
 * The parcels, and everything derived from them. Screens never type a date,
 * a status or a progress stage: they ask this module, which reads them off
 * each parcel's event list. The comps disagree with themselves about
 * F523HI487's arrival (Mar 30 on Home and Packages, Apr 01 on its detail);
 * there is one `etaAt` here, so every screen agrees on Mar 30.
 */
import type { Tone } from '../theme/colors';
import { formatDateTime } from './format';

export type CarrierId = 'amazon' | 'fedex' | 'meest' | 'dhl';

export const CARRIER_NAMES: Record<CarrierId, string> = {
  amazon: 'Amazon',
  fedex: 'FedEx',
  meest: 'Meest',
  dhl: 'DHL Express',
};

export type Milestone = 'created' | 'preparing' | 'sorting' | 'transferred' | 'delivered';

export const MILESTONE_LABELS: Record<Milestone, string> = {
  created: 'Tracking Order Created',
  preparing: 'Preparing For Shipment',
  sorting: 'Arrived To Sorting Facility',
  transferred: 'Transferred To Delivery',
  delivered: 'Delivered',
};

export type Folder = 'inbox' | 'sent' | 'archive';

export type Parcel = {
  id: string;
  carrier: CarrierId;
  contents: string;
  origin: { city: string; country: string };
  destination: { city: string; country: string };
  etaAt: string;
  /** The carrier's delivery promise once it has the parcel. */
  serviceWindow: string;
  folder: Folder;
  /** Card colour in Home's stack; only inbox parcels have one. */
  tone: Tone | null;
  events: { kind: Milestone; at: string }[];
  pickupId: string;
  weightKg: number;
  dimensionsCm: [number, number, number];
};

export const PARCELS: readonly Parcel[] = [
  {
    id: 'F523HI487',
    carrier: 'amazon',
    contents: 'Books',
    origin: { city: 'Warsaw', country: 'Poland' },
    destination: { city: 'Paris', country: 'France' },
    etaAt: '2026-03-30',
    serviceWindow: '3-5 days',
    folder: 'inbox',
    tone: 'sun',
    events: [
      { kind: 'created', at: '2026-03-28T14:11' },
      { kind: 'preparing', at: '2026-03-28T17:23' },
      { kind: 'sorting', at: '2026-03-29T10:39' },
      { kind: 'transferred', at: '2026-03-29T16:02' },
    ],
    pickupId: 'l-1025',
    weightKg: 1.4,
    dimensionsCm: [30, 22, 12],
  },
  {
    id: 'Q4M71PA562',
    carrier: 'fedex',
    contents: 'Office Supplies',
    origin: { city: 'Istanbul', country: 'Türkiye' },
    destination: { city: 'Budapest', country: 'Hungary' },
    etaAt: '2026-04-01',
    serviceWindow: '2-4 days',
    folder: 'inbox',
    tone: 'iris',
    events: [
      { kind: 'created', at: '2026-03-24T09:40' },
      { kind: 'preparing', at: '2026-03-24T15:12' },
      { kind: 'sorting', at: '2026-03-26T08:05' },
      { kind: 'transferred', at: '2026-03-27T11:48' },
    ],
    pickupId: 'l-1040',
    weightKg: 3.2,
    dimensionsCm: [40, 30, 20],
  },
  {
    id: 'B6H52NK903',
    carrier: 'meest',
    contents: 'E-commerce Order',
    origin: { city: 'Lagos', country: 'Nigeria' },
    destination: { city: 'Abuja', country: 'Nigeria' },
    etaAt: '2026-03-22',
    serviceWindow: '2-3 days',
    folder: 'inbox',
    tone: 'coral',
    events: [
      { kind: 'created', at: '2026-03-18T11:02' },
      { kind: 'preparing', at: '2026-03-18T16:30' },
      { kind: 'sorting', at: '2026-03-19T07:15' },
      { kind: 'transferred', at: '2026-03-20T09:21' },
      { kind: 'delivered', at: '2026-03-21T13:44' },
    ],
    pickupId: 'l-abuja-07',
    weightKg: 0.8,
    dimensionsCm: [25, 18, 8],
  },
  {
    id: 'DHL123456789',
    carrier: 'dhl',
    contents: 'Gift',
    origin: { city: 'Paris', country: 'France' },
    destination: { city: 'Lisbon', country: 'Portugal' },
    etaAt: '2026-04-03',
    serviceWindow: '3-5 days',
    folder: 'sent',
    tone: null,
    events: [
      { kind: 'created', at: '2026-03-30T10:05' },
      { kind: 'preparing', at: '2026-03-30T18:40' },
    ],
    pickupId: 'p-oberkampf',
    weightKg: 2.1,
    dimensionsCm: [35, 25, 15],
  },
  {
    id: 'K8T04RW215',
    carrier: 'amazon',
    contents: 'Headphones',
    origin: { city: 'Milan', country: 'Italy' },
    destination: { city: 'Paris', country: 'France' },
    etaAt: '2026-02-14',
    serviceWindow: '2-4 days',
    folder: 'archive',
    tone: null,
    events: [
      { kind: 'created', at: '2026-02-10T12:00' },
      { kind: 'preparing', at: '2026-02-10T19:10' },
      { kind: 'sorting', at: '2026-02-11T06:55' },
      { kind: 'transferred', at: '2026-02-12T08:30' },
      { kind: 'delivered', at: '2026-02-13T15:20' },
    ],
    pickupId: 'l-1031',
    weightKg: 0.6,
    dimensionsCm: [20, 18, 10],
  },
];

export type Status = 'in-transit' | 'received' | 'processing';

export function status(p: Parcel): Status {
  const kinds = p.events.map((e) => e.kind);
  if (kinds.includes('delivered')) return 'received';
  if (kinds.includes('sorting') || kinds.includes('transferred')) return 'in-transit';
  return 'processing';
}

/**
 * Which of the three nodes on a card's route track is current:
 * 0 = at origin, 1 = on its way, 2 = arrived.
 */
export function stage(p: Parcel): 0 | 1 | 2 {
  const s = status(p);
  return s === 'received' ? 2 : s === 'in-transit' ? 1 : 0;
}

export function shippedAt(p: Parcel): string {
  return p.events[0].at.slice(0, 10);
}

/** The date shown under the destination: when it arrived, or when it will. */
export function arrivalAt(p: Parcel): string {
  const done = p.events.find((e) => e.kind === 'delivered');
  return done ? done.at.slice(0, 10) : p.etaAt;
}

export type TimelineRow = { title: string; caption: string; current: boolean };

/** The Route card on the detail screen. The latest event is the current one
 *  and carries the service promise in place of its timestamp. */
export function timeline(p: Parcel): TimelineRow[] {
  const last = p.events.length - 1;
  const delivered = status(p) === 'received';
  return p.events.map((e, i) => ({
    title: MILESTONE_LABELS[e.kind],
    caption: i === last && !delivered ? p.serviceWindow : formatDateTime(e.at),
    current: i === last,
  }));
}

export function parcelById(id: string): Parcel | undefined {
  return PARCELS.find((p) => p.id === id);
}

export function inFolder(folder: Folder | 'all'): Parcel[] {
  return PARCELS.filter((p) => folder === 'all' || p.folder === folder);
}

/** Home's stack: the inbox, in the order the comp stacks its colours. */
export function activeParcels(): Parcel[] {
  return PARCELS.filter((p) => p.folder === 'inbox');
}
