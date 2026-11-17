import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import Packages from '../app/(tabs)/packages';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), canGoBack: () => true, replace: jest.fn() } }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(() => Promise.resolve()) }));

describe('Packages screen', () => {
  it('lists every parcel under All and filters by folder', async () => {
    await render(<Packages />);
    expect(screen.getByText('F523HI487')).toBeTruthy();
    expect(screen.getByText('B6H52NK903')).toBeTruthy();
    expect(screen.getAllByText('In Transit')).toHaveLength(2);

    await fireEvent.press(screen.getByText('Sent'));
    expect(screen.getByText('DHL123456789')).toBeTruthy();
    expect(screen.queryByText('F523HI487')).toBeNull();
  });

  it('searches by city', async () => {
    await render(<Packages />);
    await fireEvent.changeText(screen.getByPlaceholderText('Search packages'), 'budapest');
    expect(screen.getByText('Q4M71PA562')).toBeTruthy();
    expect(screen.queryByText('F523HI487')).toBeNull();
  });
});
