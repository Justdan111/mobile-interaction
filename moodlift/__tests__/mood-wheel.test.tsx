import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react-native';
import { MoodWheel } from '../components/mood/MoodWheel';
import { MoodProvider, useMood } from '../lib/mood-context';
import { MOODS, type MoodId } from '../data/moods';

describe('MoodWheel', () => {
  const setup = async (preview: MoodId = 'calm', selected: MoodId | null = null) => {
    const onSelect = jest.fn();
    await render(
      <MoodWheel
        preview={preview}
        selected={selected}
        onSelect={onSelect}
        ink="#FFFFFF"
        mutedInk="#888888"
        trackWidth={360}
      />
    );
    return onSelect;
  };

  it('offers every mood', async () => {
    await setup();
    for (const m of MOODS) expect(screen.getByLabelText(m.label)).toBeTruthy();
  });

  // The ring means "this is your choice", not "this is what you're looking at".
  it('marks nothing selected while you are only browsing', async () => {
    await setup('calm', null);
    const selected = MOODS.filter(
      (m) => screen.getByLabelText(m.label).props.accessibilityState?.selected
    );
    expect(selected).toHaveLength(0);
  });

  it('marks only the chosen mood selected', async () => {
    await setup('calm', 'calm');
    const selected = MOODS.filter(
      (m) => screen.getByLabelText(m.label).props.accessibilityState?.selected
    );
    expect(selected.map((m) => m.id)).toEqual(['calm']);
  });

  it('selects the centred label when it is tapped', async () => {
    const onSelect = await setup('calm');
    await fireEvent.press(screen.getByLabelText('Calm'));
    expect(onSelect).toHaveBeenCalledWith('calm');
  });

  // Tapping a label you can barely see at the edge of the card would be an
  // accident, not a choice.
  it('ignores taps on labels that are not centred', async () => {
    const onSelect = await setup('calm');
    await fireEvent.press(screen.getByLabelText('Energized'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('marks the off-centre labels disabled', async () => {
    await setup('calm');
    expect(screen.getByLabelText('Energized').props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByLabelText('Calm').props.accessibilityState?.disabled).toBe(false);
  });
});

describe('useMood', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MoodProvider>{children}</MoodProvider>
  );

  it('starts with no mood chosen', async () => {
    const { result } = await renderHook(() => useMood(), { wrapper });
    expect(result.current.moodId).toBeNull();
    expect(result.current.mood).toBeNull();
  });

  it('resolves the full mood once one is set', async () => {
    const { result } = await renderHook(() => useMood(), { wrapper });
    await act(async () => result.current.setMood('energized'));
    expect(result.current.moodId).toBe('energized');
    expect(result.current.mood?.label).toBe('Energized');
    expect(result.current.mood?.surface).toBe('#8B4A9C');
  });

  it('clears back to the no-mood state', async () => {
    const { result } = await renderHook(() => useMood(), { wrapper });
    await act(async () => result.current.setMood('calm'));
    await act(async () => result.current.clearMood());
    expect(result.current.moodId).toBeNull();
  });
});
