import { Pressable, Text, View } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';

function Arrow({ color }: { color: string }) {
  return (
    <Svg width={22} height={12} viewBox="0 0 22 12">
      <Line x1={0} y1={6} x2={20} y2={6} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Polyline
        points="15,1 21,6 15,11"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const PULSE = '#2547F4';

export function DetailsButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Details">
      {({ pressed, hovered }) => {
        const active = pressed || Boolean(hovered);
        return (
          <View
            className="flex-row items-center rounded-full border py-2.5 pl-5 pr-4"
            style={{
              borderColor: PULSE,
              backgroundColor: active ? PULSE : 'transparent',
            }}>
            <Text
              className="mr-3 font-technoSemi text-[15px] hover:bg-[#2547F4]"
              style={{ letterSpacing: 2, color: active ? '#FFFFFF' : PULSE }}>
              DETAILS
            </Text>
            <Arrow color={active ? '#FFFFFF' : PULSE} />
          </View>
        );
      }}
    </Pressable>
  );
}
