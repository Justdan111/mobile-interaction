import React from 'react';
import { Text, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import {
  TabBarChromeProvider,
  useTabBarCollapsed,
  useTabBarScroll,
} from '../../components/tabs/TabBarChrome';

/**
 * Reanimated is mocked, so the bar's movement is not observable here. These
 * cover the wiring either side of it: a screen's scroll reaches the bar, and the
 * bar reports the state its label mounts from.
 */

/** Reports offsets on mount, the way a scrolling list would. */
function Scroller({ offsets }: { offsets: number[] }) {
  const { onScroll, scrollEventThrottle } = useTabBarScroll();
  React.useEffect(() => {
    for (const y of offsets) onScroll({ nativeEvent: { contentOffset: { y } } });
  }, [offsets, onScroll]);
  return <Text>throttle:{scrollEventThrottle}</Text>;
}

function Readout() {
  return <Text>collapsed:{String(useTabBarCollapsed())}</Text>;
}

const harness = (offsets: number[]) =>
  render(
    <TabBarChromeProvider>
      <View>
        <Scroller offsets={offsets} />
        <Readout />
      </View>
    </TabBarChromeProvider>
  );

describe('tab bar chrome wiring', () => {
  it('starts expanded', async () => {
    await harness([]);
    expect(screen.getByText('collapsed:false')).toBeTruthy();
  });

  it('collapses once a screen reports scrolling down', async () => {
    await harness([0, 80, 400]);
    expect(screen.getByText('collapsed:true')).toBeTruthy();
  });

  it('expands again when the screen reports scrolling back up', async () => {
    await harness([0, 400, 800, 300]);
    expect(screen.getByText('collapsed:false')).toBeTruthy();
  });

  it('stays expanded through a short scroll that never passes the threshold', async () => {
    await harness([0, 4, 10, 18]);
    expect(screen.getByText('collapsed:false')).toBeTruthy();
  });

  it('asks for frequent enough scroll events to animate against', async () => {
    await harness([]);
    expect(screen.getByText(/throttle:16/)).toBeTruthy();
  });
});

describe('tab bar chrome outside its provider', () => {
  // Outside the provider neither hook may throw, and the bar sits full size.
  it('reports not collapsed and swallows scroll events', async () => {
    await render(
      <View>
        <Scroller offsets={[0, 500, 900]} />
        <Readout />
      </View>
    );
    expect(screen.getByText('collapsed:false')).toBeTruthy();
  });
});
