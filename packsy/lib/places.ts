/**
 * Points on the map, in map-world units (see lib/streets.ts). The package
 * detail's pickup point reads from here too, so the locker a parcel is going
 * to is the same object the map draws.
 */
export type PlaceKind = 'pickup' | 'locker' | 'transit';

export type Place = {
  id: string;
  kind: PlaceKind;
  name: string;
  address: string;
  x: number;
  y: number;
  /** Only Paris is drawn on the Map tab; elsewhere a place exists for its parcel's detail screen. */
  city: 'Paris' | 'Abuja';
};

export const PLACES: readonly Place[] = [
  { id: 'p-oberkampf', kind: 'pickup', name: 'Relay Oberkampf', address: '42 Rue Oberkampf, 75011 Paris', x: 150, y: 200, city: 'Paris' },
  { id: 'l-1025', kind: 'locker', name: 'Parcel Locker 1025', address: '15 Rue de Rivoli, 75004 Paris', x: 360, y: 260, city: 'Paris' },
  { id: 'l-1031', kind: 'locker', name: 'Parcel Locker 1031', address: '8 Rue des Archives, 75004 Paris', x: 250, y: 470, city: 'Paris' },
  { id: 'l-1040', kind: 'locker', name: 'Parcel Locker 1040', address: '27 Rue de Turenne, 75003 Paris', x: 620, y: 500, city: 'Paris' },
  { id: 'p-bastille', kind: 'pickup', name: 'Relay Bastille', address: '3 Rue de la Roquette, 75011 Paris', x: 465, y: 730, city: 'Paris' },
  { id: 'p-marais', kind: 'pickup', name: 'Relay Marais', address: '61 Rue Vieille du Temple, 75003 Paris', x: 720, y: 880, city: 'Paris' },
  { id: 't-f523', kind: 'transit', name: 'F523HI487 · Courier', address: 'Out for delivery', x: 228, y: 820, city: 'Paris' },
  { id: 't-q4m7', kind: 'transit', name: 'Q4M71PA562 · Courier', address: 'Between depots', x: 640, y: 1040, city: 'Paris' },
  { id: 'l-abuja-07', kind: 'locker', name: 'Parcel Locker 07', address: '1061 Herbert Macaulay Way, Wuse, Abuja', x: 0, y: 0, city: 'Abuja' },
];

export function placeById(id: string): Place {
  const p = PLACES.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown place ${id}`);
  return p;
}
