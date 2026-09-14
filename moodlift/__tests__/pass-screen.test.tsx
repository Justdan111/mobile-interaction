import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import PassScreen from '../app/(tabs)/pass';
import { PassTimer } from '../components/pass/PassTimer';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

const TEN_MIN = 10 * 60_000;

describe('PassTimer', () => {
  it('reads as active while there is time left', async () => {
    await render(
      <PassTimer
        expiresAt={Date.now() + TEN_MIN}
        totalMs={TEN_MIN}
        ink="#FFFFFF"
        mutedInk="#AAAAAA"
        surface="#222222"
      />
    );
    expect(screen.getByText('Qr-code active:')).toBeTruthy();
    expect(screen.queryByText('Qr-code expired')).toBeNull();
  });

  it('reads as expired once the time is gone', async () => {
    await render(
      <PassTimer
        expiresAt={Date.now() - 1000}
        totalMs={TEN_MIN}
        ink="#FFFFFF"
        mutedInk="#AAAAAA"
        surface="#222222"
      />
    );
    expect(screen.getByText('Qr-code expired')).toBeTruthy();
    expect(screen.getByText('00:00:00')).toBeTruthy();
  });

  it('tells its parent whether the pass is still valid', async () => {
    const onExpiredChange = jest.fn();
    await render(
      <PassTimer
        expiresAt={Date.now() - 1000}
        totalMs={TEN_MIN}
        ink="#FFFFFF"
        mutedInk="#AAAAAA"
        surface="#222222"
        onExpiredChange={onExpiredChange}
      />
    );
    expect(onExpiredChange).toHaveBeenCalledWith(true);
  });
});

describe('Gym pass', () => {
  it('shows the member and the entrance instruction while valid', async () => {
    await render(<PassScreen />);
    expect(screen.getByText('Andrew Cooper')).toBeTruthy();
    expect(screen.getByText('Scan at the entrance')).toBeTruthy();
  });

  // A dead pass that still looks live is worse than no pass — the member holds
  // it to the reader and has no idea why nothing happens. While the pass is
  // valid there must be no refresh affordance competing with it.
  it('offers no refresh while the pass is still valid', async () => {
    await render(<PassScreen />);
    expect(screen.queryByLabelText('Get a new code')).toBeNull();
  });

  it('shows a running countdown', async () => {
    await render(<PassScreen />);
    expect(screen.getByText(/^\d{2}:\d{2}:\d{2}$/)).toBeTruthy();
  });

  it('can be shared', async () => {
    await render(<PassScreen />);
    expect(screen.getByLabelText('Share pass')).toBeTruthy();
  });
});
