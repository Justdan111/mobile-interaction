import * as React from "react";
import { Animated, Easing, TextStyle, View } from "react-native";

type Props = {
  size?: number;
  color?: string;
  text?: string;
  /** Extra per-letter text style — e.g. a shadow for legibility on photos. */
  letterStyle?: TextStyle;
  /** Gap between letter reveals (ms). */
  stagger?: number;
  /** Hold before the wave starts (ms). */
  delay?: number;
};

/**
 * The CHOMPO lockup where every letter jumps up into place on a short
 * stagger — the whole word lands like a wave. Anton, tall + condensed.
 */
export default function WaveWordmark({
  size = 64,
  color = "#F5EDDF",
  text = "CHOMPO",
  letterStyle,
  stagger = 65,
  delay = 180,
}: Props) {
  const letters = React.useMemo(() => text.split(""), [text]);
  const vals = React.useRef(letters.map(() => new Animated.Value(0))).current;

  React.useEffect(() => {
    const jumps = vals.map((v) =>
      Animated.spring(v, {
        toValue: 1,
        friction: 5.5,
        tension: 140,
        useNativeDriver: true,
      })
    );
    Animated.sequence([Animated.delay(delay), Animated.stagger(stagger, jumps)]).start();
  }, [vals, stagger, delay]);

  return (
    <View style={{ flexDirection: "row" }}>
      {letters.map((ch, i) => (
        <Animated.Text
          key={`${ch}-${i}`}
          allowFontScaling={false}
          style={[
            {
              fontFamily: "Anton",
              color,
              fontSize: size,
              lineHeight: size * 1.2,
              marginHorizontal: size * 0.012,
              includeFontPadding: false,
              opacity: vals[i],
              transform: [
                { translateY: vals[i].interpolate({ inputRange: [0, 1], outputRange: [size * 0.7, 0] }) },
                { scale: vals[i].interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
              ],
            },
            letterStyle,
          ]}
        >
          {ch}
        </Animated.Text>
      ))}
    </View>
  );
}
