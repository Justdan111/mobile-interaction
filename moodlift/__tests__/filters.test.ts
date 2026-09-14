import { applyFilters, FILTERS, type FilterId } from '../lib/filters';
import { WORKOUTS } from '../data/workouts';

const all = (query = '', filter: FilterId = 'all') =>
  applyFilters(WORKOUTS, { query, filter });

describe('FILTERS', () => {
  it('offers the chips from the comps, in order', () => {
    expect(FILTERS.map((f) => f.label)).toEqual([
      'All workout',
      'Today',
      'Low intensity',
      'Solo-friendly',
    ]);
  });
});

describe('applyFilters', () => {
  it('is the identity set with no query and no filter', () => {
    expect(all()).toHaveLength(WORKOUTS.length);
  });

  // The comp's placeholder reads "Search name or training", so the category is
  // searchable too — "yoga" finds every yoga session, not only the ones with
  // the word in their title.
  it('matches title, coach or category, case-insensitively', () => {
    const out = all('YOGA');
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((w) => /yoga/i.test(`${w.title} ${w.coach} ${w.category}`))).toBe(true);
  });

  it('finds a session by category alone', () => {
    const out = all('swim');
    expect(out.map((w) => w.category)).toContain('swim');
  });

  it('matches a coach by name', () => {
    expect(all('Anna Sedon').every((w) => w.coach === 'Anna Sedon')).toBe(true);
    expect(all('Anna Sedon').length).toBeGreaterThan(0);
  });

  it('ignores surrounding whitespace', () => {
    expect(all('  yoga  ')).toEqual(all('yoga'));
  });

  it('returns empty rather than throwing when nothing matches', () => {
    expect(all('zzzzzz')).toEqual([]);
  });

  it('low-intensity returns only low intensity', () => {
    const out = all('', 'low-intensity');
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((w) => w.intensity === 'low')).toBe(true);
  });

  it('solo-friendly returns only solo sessions', () => {
    const out = all('', 'solo');
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((w) => w.solo)).toBe(true);
  });

  it('today returns only sessions starting today', () => {
    const todayKey = new Date().toDateString();
    const out = all('', 'today');
    expect(out.every((w) => new Date(w.startsAt).toDateString() === todayKey)).toBe(true);
  });

  it('combines a query with a filter rather than choosing one', () => {
    const out = applyFilters(WORKOUTS, { query: 'yoga', filter: 'low-intensity' });
    expect(out.length).toBeGreaterThan(0);
    expect(
      out.every((w) => w.intensity === 'low' && /yoga/i.test(`${w.title} ${w.category}`))
    ).toBe(true);
  });

  it('preserves the order it was given', () => {
    const reversed = [...WORKOUTS].reverse();
    expect(applyFilters(reversed, { query: '', filter: 'all' }).map((w) => w.id)).toEqual(
      reversed.map((w) => w.id)
    );
  });

  it('does not mutate its input', () => {
    const before = WORKOUTS.map((w) => w.id);
    applyFilters(WORKOUTS, { query: 'yoga', filter: 'solo' });
    expect(WORKOUTS.map((w) => w.id)).toEqual(before);
  });
});
