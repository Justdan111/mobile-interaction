export type ShipmentStatus = 'In Transit' | 'Delivered' | 'Pending' | 'Canceled';

export type Shipment = {
  id: string;
  code: string;
  status: ShipmentStatus;
  date: string; // delivery / deliverable date
  progress: number; // 0..1
  kind: 'container' | 'box';
};

// Featured shipment shown in the dark hero card on Home.
export const featuredShipment: Shipment = {
  id: 'ftp01',
  code: '#FTPO1-OTKA24C',
  status: 'In Transit',
  date: '09 Aug 2024',
  progress: 0.53,
  kind: 'container',
};

// The "Current Shipments" list.
export const shipments: Shipment[] = [
  {
    id: 'dpp01',
    code: '#DPPO1-OTKA560',
    status: 'In Transit',
    date: '09 Aug 2024',
    progress: 0.56,
    kind: 'box',
  },
  {
    id: 'dpp02',
    code: '#DPPO2-OTKA118',
    status: 'Delivered',
    date: '02 Aug 2024',
    progress: 1,
    kind: 'box',
  },
  {
    id: 'dpp03',
    code: '#DPPO3-OTKA904',
    status: 'Delivered',
    date: '28 Jul 2024',
    progress: 1,
    kind: 'box',
  },
];

/* ─────────────────────────────── History ───────────────────────────────── */

export type HistoryFilter = 'All' | 'In delivery' | 'Completed' | 'Canceled';

export const HISTORY_FILTERS: HistoryFilter[] = ['All', 'In delivery', 'Completed', 'Canceled'];

export const historyShipments: Shipment[] = [
  {
    id: 'h1',
    code: '#DPPO1-OTKA560',
    status: 'In Transit',
    date: '09 Aug 2024',
    progress: 0.56,
    kind: 'box',
  },
  { id: 'h2', code: '#QWSO1-OTKAU69', status: 'Delivered', date: '09 Aug 2024', progress: 1, kind: 'box' },
  { id: 'h3', code: '#QWSO1-OTKAU69', status: 'Delivered', date: '09 Aug 2024', progress: 1, kind: 'box' },
  { id: 'h4', code: '#DPPO2-OTKA118', status: 'Delivered', date: '02 Aug 2024', progress: 1, kind: 'box' },
  {
    id: 'h5',
    code: '#CNLO1-OTKA330',
    status: 'Canceled',
    date: '27 Jul 2024',
    progress: 0.2,
    kind: 'box',
  },
];

export function filterHistory(items: Shipment[], filter: HistoryFilter): Shipment[] {
  if (filter === 'All') return items;
  if (filter === 'In delivery') return items.filter((s) => s.status === 'In Transit');
  if (filter === 'Completed') return items.filter((s) => s.status === 'Delivered');
  return items.filter((s) => s.status === 'Canceled');
}

/* ─────────────────────────────── Promos ────────────────────────────────── */

export type Promo = {
  id: string;
  lead: string;
  amount: string;
  blurb: string;
  code: string;
  /** Card background, also used to tint the coupon code text. */
  color: string;
  art: 'ticket' | 'parcel';
};

export const promos: Promo[] = [
  {
    id: 'p1',
    lead: 'Up to',
    amount: '25% OFF',
    blurb: 'Package discount coupon',
    code: 'ST-V2586',
    color: '#ED6847',
    art: 'ticket',
  },
  {
    id: 'p2',
    lead: 'Get up to',
    amount: '40% OFF',
    blurb: 'Discount on first order',
    code: 'FO-404030',
    color: '#141C21',
    art: 'parcel',
  },
  {
    id: 'p3',
    lead: 'Up to',
    amount: '15% OFF',
    blurb: 'Package discount coupon',
    code: 'UP15-586',
    color: '#1C3167',
    art: 'ticket',
  },
  {
    id: 'p4',
    lead: 'Up to',
    amount: '5% OFF',
    blurb: 'Package discount coupon',
    code: 'UP5-E586',
    color: '#336A31',
    art: 'ticket',
  },
  {
    id: 'p5',
    lead: 'Get up to',
    amount: '30% OFF',
    blurb: 'Discount on bulk orders',
    code: 'BK-303030',
    color: '#141C21',
    art: 'parcel',
  },
];

/* ────────────────────────────── Live tracking ──────────────────────────── */

export type TrackingIcon = 'package' | 'truck' | 'ferry' | 'warehouse' | 'clipboard';

export type TrackingStep = {
  id: string;
  title: string;
  place: string;
  date: string;
  icon: TrackingIcon;
  done: boolean;
};

export const tracking = {
  code: '#FTPO1-OTKA24C',
  eta: 'August 12, 2024',
  waypoint: 'Andaman Sea,Thailand',
  steps: [
    {
      id: 't1',
      title: 'Delivery Attempted',
      place: 'Recipient address',
      date: 'Aug 08, 24',
      icon: 'package',
      done: true,
    },
    {
      id: 't2',
      title: 'Out for Delivery',
      place: 'Local delivery network',
      date: 'Aug 08, 24',
      icon: 'truck',
      done: true,
    },
    { id: 't3', title: 'In Transit', place: 'En route', date: 'Aug 09, 24', icon: 'ferry', done: true },
    {
      id: 't4',
      title: 'Dispatch of shipment',
      place: 'Fulfillment center',
      date: 'Aug 12, 24',
      icon: 'warehouse',
      done: false,
    },
    {
      id: 't5',
      title: 'Order Accepted',
      place: 'Order placed',
      date: 'Aug 12, 24',
      icon: 'clipboard',
      done: false,
    },
  ] as TrackingStep[],
};

/* ───────────────────────────── Shipping cost ───────────────────────────── */

export const shippingQuote = {
  pickup: 'Bukit Batok, Singapore',
  dropoff: 'Chittagong, Bangladesh',
  weightKg: '32',
  dimensions: '16×12×8',
  price: 886,
};

export type PackageShape = 'cube' | 'tall' | 'flat';
export const PACKAGE_SHAPES: PackageShape[] = ['cube', 'tall', 'flat'];

export type DeliveryPoint = 'To home' | 'Service point';
export const DELIVERY_POINTS: DeliveryPoint[] = ['To home', 'Service point'];
