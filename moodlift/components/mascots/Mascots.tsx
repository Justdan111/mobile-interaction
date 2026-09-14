import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { blobPath, capsulePath, cloverPath, polygonPath, starPath } from './shapes';
import { EyeClosed, EyeDot, EyeTired, Foot, Thick, Thin } from './parts';

/**
 * Every mascot takes its body colour and its line colour from the caller.
 * Neither has a default: a mascot is drawn on whichever mood surface is
 * current, and a baked-in colour is the defect this repo keeps rediscovering.
 */
export type MascotProps = {
  size: number;
  /** The head's flat fill. */
  fill: string;
  /** Face, limbs and feet. Near-black in every comp, whatever the surface. */
  ink: string;
};

const VIEW_BOX = '0 0 200 240';

/**
 * These characters have no torso — the head *is* the body, and the limbs run
 * out from behind it. So every limb starts at a point INSIDE the head
 * silhouette and the head is painted last, hiding the join. Anchoring a limb
 * outside the outline is what makes it read as a detached wire.
 */
const SHOULDER_Y = 108;
const HIP_Y = 124;
const LIMB_R = 6.5;

function Frame({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <Svg width={size} height={size * (240 / 200)} viewBox={VIEW_BOX}>
      {children}
    </Svg>
  );
}

/** A two-segment tube limb: upper arm, forearm, and the elbow between them. */
function Arm({
  from,
  elbow,
  to,
  ink,
  r = LIMB_R,
}: {
  from: [number, number];
  elbow: [number, number];
  to: [number, number];
  ink: string;
  r?: number;
}) {
  return (
    <>
      <Thin d={capsulePath(from[0], from[1], elbow[0], elbow[1], r)} ink={ink} />
      <Thin d={capsulePath(elbow[0], elbow[1], to[0], to[1], r)} ink={ink} />
    </>
  );
}

/** Low energy — a sagging blob, shoulders down, arms hanging slack. */
export function LowEnergyMascot({ size, fill, ink }: MascotProps) {
  return (
    <Frame size={size}>
      <Arm from={[80, SHOULDER_Y]} elbow={[46, 134]} to={[40, 178]} ink={ink} />
      <Arm from={[120, SHOULDER_Y]} elbow={[154, 134]} to={[160, 178]} ink={ink} />
      {/* Weights bulge the lower half so the head reads as slumping. */}
      <Path
        d={blobPath([0.66, 0.78, 0.99, 1.18, 1.28, 1.18, 0.99, 0.78], 52, 100, 74)}
        fill={fill}
      />
      <EyeTired cx={84} cy={78} ink={ink} />
      <EyeTired cx={118} cy={78} ink={ink} />
      <Thin d="M91 104q9 -4 18 0" ink={ink} />
      <Thick d={`M90 ${HIP_Y}q-3 32 -4 54`} ink={ink} />
      <Thick d={`M110 ${HIP_Y}q3 32 4 54`} ink={ink} />
      <Foot d="M86 180h-14" ink={ink} />
      <Foot d="M114 180h14" ink={ink} />
    </Frame>
  );
}

/** Tense — a tight, jagged burst; arms clamped in, knees locked. */
export function TenseMascot({ size, fill, ink }: MascotProps) {
  return (
    <Frame size={size}>
      <Arm from={[80, SHOULDER_Y]} elbow={[44, 140]} to={[62, 174]} ink={ink} />
      <Arm from={[120, SHOULDER_Y]} elbow={[156, 140]} to={[138, 174]} ink={ink} />
      <Path d={starPath(11, 54, 41, 100, 76, -90, 0.1)} fill={fill} />
      <EyeDot cx={85} cy={74} ink={ink} r={4.5} />
      <EyeDot cx={117} cy={74} ink={ink} r={4.5} />
      {/* Angled brows and a flat mouth carry the whole expression. */}
      <Thin d="M75 60l15 7" ink={ink} />
      <Thin d="M127 60l-15 7" ink={ink} />
      <Thin d="M89 100h24" ink={ink} />
      <Thick d={`M90 ${HIP_Y}v56`} ink={ink} />
      <Thick d={`M110 ${HIP_Y}v56`} ink={ink} />
      <Foot d="M90 182h-15" ink={ink} />
      <Foot d="M110 182h15" ink={ink} />
    </Frame>
  );
}

/** Calm — the pink hexagon with closed eyes and folded arms, from the comps. */
export function CalmMascot({ size, fill, ink }: MascotProps) {
  return (
    <Frame size={size}>
      <Thick d={`M90 ${HIP_Y}v58`} ink={ink} />
      <Thick d={`M110 ${HIP_Y}v58`} ink={ink} />
      <Foot d="M90 184h-15" ink={ink} />
      <Foot d="M110 184h15" ink={ink} />
      <Path d={polygonPath(6, 54, 100, 76, -90)} fill={fill} />
      <EyeClosed cx={83} cy={74} ink={ink} />
      <EyeClosed cx={117} cy={74} ink={ink} />
      {/* The vertical nose stroke between the eyes, as in mood-calm.png. */}
      <Thin d="M100 62v20" ink={ink} />
      <Thin d="M93 96q7 7 14 0" ink={ink} />
      {/* Folded arms. Two crossing full-length tubes read as a knot at this
          size, so this is one band of forearms with the upper arms dropping
          into it from the shoulders — the silhouette the comp actually has. */}
      <Thin d={capsulePath(82, 112, 70, 132, 7)} ink={ink} />
      <Thin d={capsulePath(118, 112, 130, 132, 7)} ink={ink} />
      <Thin d={capsulePath(71, 140, 129, 140, 13)} ink={ink} />
    </Frame>
  );
}

/** Balanced — the clover in tree pose, palms together overhead, from the comps. */
export function BalancedMascot({ size, fill, ink }: MascotProps) {
  return (
    <Frame size={size}>
      {/* Tree pose: right leg planted, left folded against its inner thigh. */}
      <Thick d={`M106 ${HIP_Y}v80`} ink={ink} />
      <Thick d={`M96 ${HIP_Y}q-30 10 -30 30q0 12 12 10q16 -3 28 -22`} ink={ink} />
      <Foot d="M106 204h18" ink={ink} />
      {/* Arms sweep up and in, meeting above the head. */}
      <Arm from={[82, SHOULDER_Y]} elbow={[46, 68]} to={[76, 30]} ink={ink} />
      <Arm from={[118, SHOULDER_Y]} elbow={[154, 68]} to={[124, 30]} ink={ink} />
      <Thin d="M78 26q-3 -13 3 -19M88 24q-1 -13 5 -18M97 24q1 -13 7 -17" ink={ink} />
      <Thin d="M122 26q3 -13 -3 -19M112 24q1 -13 -5 -18M103 24q-1 -13 -7 -17" ink={ink} />
      <Path d={cloverPath(4, 32, 25, 100, 86)} fill={fill} />
      <EyeClosed cx={84} cy={84} ink={ink} />
      <EyeClosed cx={116} cy={84} ink={ink} />
      <Thin d="M100 72v20" ink={ink} />
      <Thin d="M94 106q6 6 12 0" ink={ink} />
    </Frame>
  );
}

/** Energized — the running sun throwing a peace sign, from the comps. */
export function EnergizedMascot({ size, fill, ink }: MascotProps) {
  return (
    <Frame size={size}>
      {/* Front leg drives forward, back leg extends behind. */}
      <Thick d={`M92 ${HIP_Y}q-34 14 -38 44q-2 14 8 18`} ink={ink} />
      <Thick d={`M112 ${HIP_Y}q28 18 30 44`} ink={ink} />
      <Foot d="M62 190q-10 6 -18 2" ink={ink} />
      <Foot d="M142 172q4 10 13 12" ink={ink} />
      {/* Left arm up in a peace sign, right arm trailing back. */}
      <Arm from={[82, SHOULDER_Y]} elbow={[38, 94]} to={[26, 50]} ink={ink} />
      <Thin d="M18 44q-6 -18 -1 -28M31 42q-2 -18 7 -26" ink={ink} />
      <Arm from={[120, SHOULDER_Y]} elbow={[162, 124]} to={[176, 160]} ink={ink} />
      <Thin d="M176 166q10 5 12 14q2 9 -6 10" ink={ink} />
      <Path d={starPath(12, 58, 33, 100, 76, -90)} fill={fill} />
      <EyeDot cx={84} cy={70} ink={ink} />
      <EyeDot cx={118} cy={70} ink={ink} />
      {/* A wide, confident smile. */}
      <Thin d="M80 92q20 20 40 0" ink={ink} />
    </Frame>
  );
}

/** High energy — a wilder burst, both arms up, caught at the top of a jump. */
export function HighEnergyMascot({ size, fill, ink }: MascotProps) {
  return (
    <Frame size={size}>
      {/* Both legs tucked under — the top of a jump, feet off the ground. */}
      <Thick d={`M90 ${HIP_Y}q-30 10 -32 34q-2 12 9 13`} ink={ink} />
      <Thick d={`M112 ${HIP_Y}q30 10 32 34q2 12 -9 13`} ink={ink} />
      <Foot d="M68 176q-11 5 -13 14" ink={ink} />
      <Foot d="M134 176q11 5 13 14" ink={ink} />
      <Arm from={[82, SHOULDER_Y]} elbow={[42, 84]} to={[30, 40]} ink={ink} />
      <Arm from={[118, SHOULDER_Y]} elbow={[158, 84]} to={[170, 40]} ink={ink} />
      <Thin d="M24 36q-5 -13 0 -20M35 34q-2 -13 5 -19" ink={ink} />
      <Thin d="M176 36q5 -13 0 -20M165 34q2 -13 -5 -19" ink={ink} />
      <Path d={starPath(16, 60, 29, 100, 76, -90, 0.13)} fill={fill} />
      <EyeDot cx={83} cy={68} ink={ink} />
      <EyeDot cx={117} cy={68} ink={ink} />
      {/* An open, shouting mouth rather than a smile line. */}
      <Path d="M85 88q15 -6 30 0q-4 22 -15 22q-11 0 -15 -22Z" fill={ink} />
    </Frame>
  );
}
