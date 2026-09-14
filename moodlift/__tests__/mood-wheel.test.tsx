import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react-native';
import { MoodWheel } from '../components/mood/MoodWheel';
import { MoodProvider, useMood } from '../lib/mood-context';
import { MOODS } from '../data/moods';

describe('MoodWheel', () => {
  const setup = async (value: Parameters<typeof MoodWheel>[0]['value'] = 'calm') => {
    const onChange = jest.fn();
    await render(
      <MoodWheel
        value={value}
        onChange={onChange}
        ink="#FFFFFF"
        mutedInk="#888888"
        trackWidth={360}
      />
    );
    return onChange;
  };

  it('offers every mood', async () => {
    await setup();
    for (const m of MOODS) expect(screen.getByLabelText(m.label)).toBeTruthy();
  });

  it('marks only the current mood selected', async () => {
    await setup('calm');
    const selected = MOODS.filter(
      (m) => screen.getByLabelText(m.label).props.accessibilityState?.selected
    );
    expect(selected.map((m) => m.id)).toEqual(['calm']);
  });

  it('reports a different mood when one is tapped', async () => {
    const onChange = await setup('calm');
    fireEvent.press(screen.getByLabelText('Energized'));
    expect(onChange).toHaveBeenCalledWith('energized');
  });

  it('stays quiet when the current mood is tapped again', async () => {
    const onChange = await setup('calm');
    fireEvent.press(screen.getByLabelText('Calm'));
    expect(onChange).not.toHaveBeenCalled();
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
