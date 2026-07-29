import * as React from "react";
import { Animated, View, useWindowDimensions } from "react-native";
import { FOOD_ICONS } from "./FoodIcons";

type Props = {
  tile?: number;
  color?: string;
  detail?: string;
  opacity?: number;
  /** Icon size as a multiple of the tile. >1 lets neighbours overlap. */
  scale?: number;
  /**
   * 0 → 1 driver for the "converge from all sides" intro. When supplied,
   * every tile flies in from the screen edge toward its resting spot, outer
   * tiles leading so the wave collapses inward. Omit for a static field.
   */
  progress?: Animated.Value;
};

// Deterministic pseudo-random in [0,1) — keeps the scatter stable across
// renders (no Math.random) while looking hand-strewn.
function rand(a: number, b: number, seed: number) {
  const x = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function FoodPattern({
  tile = 64,
  color = "#F5EDDF",
  detail = "#E13B33",
  opacity = 1,
  scale = 1.15,
  progress,
}: Props) {
  const { width, height } = useWindowDimensions();

  const cols = Math.ceil(width / tile) + 3;
  const rows = Math.ceil(height / tile) + 3;
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.hypot(cx, cy) || 1;

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : tile / 2; // brick stagger
    for (let c = 0; c < cols; c++) {
      // Scatter which icon, its angle, and a jitter so it never reads as a grid.
      const idx = Math.floor(rand(r, c, 1) * FOOD_ICONS.length) % FOOD_ICONS.length;
      const Icon = FOOD_ICONS[idx];
      const rot = -28 + rand(r, c, 2) * 56;
      const jx = (rand(r, c, 3) - 0.5) * tile * 0.34;
      const jy = (rand(r, c, 4) - 0.5) * tile * 0.34;
      const left = c * tile - tile / 2 + offset + jx;
      const top = r * tile - tile / 2 + jy;

      let animStyle: any = { transform: [{ rotate: `${rot}deg` }] };

      if (progress) {
        const dx = left + tile / 2 - cx;
        const dy = top + tile / 2 - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const nd = dist / maxDist; // 0 centre … 1 corner
        const ux = dx / dist;
        const uy = dy / dist;
        // Start pushed out toward the edge, then fly inward to rest.
        const startTx = ux * (width * 0.6);
        const startTy = uy * (height * 0.6);
        // Outer tiles lead (delay 0); centre tiles trail (delay ~0.5).
        const delay = (1 - nd) * 0.5;
        const range = { inputRange: [delay, 1], extrapolate: "clamp" as const };

        animStyle = {
          opacity: progress.interpolate({
            inputRange: [delay, Math.min(delay + 0.18, 1)],
            outputRange: [0, 1],
            extrapolate: "clamp",
          }),
          transform: [
            { translateX: progress.interpolate({ ...range, outputRange: [startTx, 0] }) },
            { translateY: progress.interpolate({ ...range, outputRange: [startTy, 0] }) },
            { scale: progress.interpolate({ ...range, outputRange: [0.7, 1] }) },
            { rotate: `${rot}deg` },
          ],
        };
      }

      cells.push(
        <Animated.View
          key={`${r}-${c}`}
          style={[
            {
              position: "absolute",
              left,
              top,
              width: tile,
              height: tile,
              alignItems: "center",
              justifyContent: "center",
            },
            animStyle,
          ]}
        >
          <Icon size={tile * scale} color={color} detail={detail} opacity={opacity} />
        </Animated.View>
      );
    }
  }

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      {cells}
    </View>
  );
}
