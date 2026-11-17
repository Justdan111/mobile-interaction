import { activeParcels, arrivalAt, inFolder, parcelById, PARCELS, shippedAt, stage, status, timeline } from '../lib/packages';
import { PLACES } from '../lib/places';

const get = (id: string) => parcelById(id)!;

describe('parcel derivations', () => {
  it('reads status and track stage off the event list', () => {
    expect(status(get('F523HI487'))).toBe('in-transit');
    expect(stage(get('F523HI487'))).toBe(1);
    expect(status(get('B6H52NK903'))).toBe('received');
    expect(stage(get('B6H52NK903'))).toBe(2);
    expect(stage(get('DHL123456789'))).toBe(0);
  });

  it('shows the same dates for F523HI487 on every screen', () => {
    const p = get('F523HI487');
    expect(shippedAt(p)).toBe('2026-03-28');
    expect(arrivalAt(p)).toBe('2026-03-30');
  });

  it('uses the delivery date, not the ETA, once delivered', () => {
    expect(arrivalAt(get('B6H52NK903'))).toBe('2026-03-21');
  });

  it('builds the Route card with the latest step current and the service window as its caption', () => {
    const rows = timeline(get('F523HI487'));
    expect(rows.map((r) => r.title)).toEqual([
      'Tracking Order Created',
      'Preparing For Shipment',
      'Arrived To Sorting Facility',
      'Transferred To Delivery',
    ]);
    expect(rows[0].caption).toBe('Mar 28, 2026, 2:11 PM');
    expect(rows[3]).toMatchObject({ current: true, caption: '3-5 days' });
  });

  it('stacks three active parcels in the designed colour order', () => {
    expect(activeParcels().map((p) => p.tone)).toEqual(['sun', 'iris', 'coral']);
    expect(inFolder('all')).toHaveLength(PARCELS.length);
  });

  it('sends every parcel to a pickup point that exists on the map', () => {
    const ids = new Set(PLACES.map((p) => p.id));
    PARCELS.forEach((p) => expect(ids.has(p.pickupId)).toBe(true));
  });

  it('ships B6H52NK903 within Nigeria, to a locker that is not drawn on the Paris map', () => {
    const p = get('B6H52NK903');
    expect(p.origin).toEqual({ city: 'Lagos', country: 'Nigeria' });
    expect(p.destination).toEqual({ city: 'Abuja', country: 'Nigeria' });
    expect(PLACES.find((x) => x.id === p.pickupId)?.city).toBe('Abuja');
  });

  it('keeps events in chronological order', () => {
    PARCELS.forEach((p) => {
      const at = p.events.map((e) => e.at);
      expect([...at].sort()).toEqual(at);
    });
  });
});
