import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { MoodTabBar, TabItem, TABS } from '../components/tabs/MoodTabBar';

// RNTL 14's `render` is async — it awaits React 19's concurrent act queue.
// Forgetting the await yields a Promise with none of the query methods on it.
function renderBar(focusedIndex: number | null) {
  return render(
    <MoodTabBar>
      {TABS.map((t, i) => (
        <TabItem
          key={t.name}
          icon={t.icon}
          label={t.label}
          isFocused={i === focusedIndex}
          onPress={() => {}}
        />
      ))}
    </MoodTabBar>
  );
}

const selectedTabs = () =>
  screen.getAllByRole('button').filter((n) => n.props.accessibilityState?.selected === true);

describe('MoodTabBar', () => {
  it('exposes the five tabs from the comps, in order', () => {
    expect(TABS.map((t) => t.name)).toEqual([
      'index',
      'workouts',
      'pass',
      'calendar',
      'profile',
    ]);
  });

  it('renders one pressable per tab', async () => {
    await renderBar(0);
    expect(screen.getAllByRole('button')).toHaveLength(TABS.length);
  });

  it('marks exactly one tab selected', async () => {
    await renderBar(2);
    expect(selectedTabs()).toHaveLength(1);
  });

  it('marks none selected when nothing is focused', async () => {
    await renderBar(null);
    expect(selectedTabs()).toHaveLength(0);
  });

  it('labels every tab for screen readers', async () => {
    await renderBar(0);
    for (const t of TABS) expect(screen.getByLabelText(t.label)).toBeTruthy();
  });
});
