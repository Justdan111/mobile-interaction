import * as React from "react";
import { Text, TextProps } from "react-native";

type Props = {
  size?: number;
  color?: string;
  style?: TextProps["style"];
};

/**
 * The CHOMPO lockup — Anton, tall + condensed, with a touch of tracking so the
 * heavy caps breathe. Used on the splash and brand screens.
 */
export default function Wordmark({ size = 44, color = "#F5EDDF", style }: Props) {
  return (
    <Text
      allowFontScaling={false}
      style={[
        {
          fontFamily: "Anton",
          color,
          fontSize: size,
          // Anton's tall caps clip at tight line-heights — give them room.
          lineHeight: size * 1.32,
          letterSpacing: size * 0.02,
          includeFontPadding: false,
        },
        style,
      ]}
    >
      CHOMPO
    </Text>
  );
}
