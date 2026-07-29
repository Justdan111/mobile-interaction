import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, GUTTER } from '@/theme/colors';
import { font } from '@/theme/type';
import { PressableScale } from './motion';

const SIZE = 42;

function BackArrow({ color }: { color: string }) {
  return (
    <Svg
      width={21}
      height={21}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M20 12H4.6" />
      <Path d="M11 5 4 12l7 7" />
    </Svg>
  );
}

/**
 * The circular back button + centred title shared by History, Promos, Live
 * tracking and the Shipping cost sheet. `tone="dark"` flips it for use over
 * the map.
 */
export function ScreenHeader({
  title,
  tone = 'light',
  onBack,
}: {
  title: string;
  tone?: 'light' | 'dark';
  onBack?: () => void;
}) {
  const router = useRouter();
  const dark = tone === 'dark';

  return (
    <View
      style={{
        height: SIZE,
        justifyContent: 'center',
        marginHorizontal: GUTTER,
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          fontSize: 20,
          lineHeight: 25,
          fontFamily: font.bold,
          letterSpacing: -0.35,
          color: dark ? colors.white : colors.ink,
        }}
      >
        {title}
      </Text>

      <PressableScale
        to={0.9}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')))}
        style={{
          position: 'absolute',
          left: 0,
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: dark ? colors.white : colors.bell,
        }}
      >
        <BackArrow color={colors.ink} />
      </PressableScale>
    </View>
  );
}
