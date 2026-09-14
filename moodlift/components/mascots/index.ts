import type { MoodId } from '../../data/moods';
import {
  BalancedMascot,
  CalmMascot,
  EnergizedMascot,
  HighEnergyMascot,
  LowEnergyMascot,
  TenseMascot,
  type MascotProps,
} from './Mascots';

export type { MascotProps };

const MASCOTS: Record<MoodId, React.FC<MascotProps>> = {
  low: LowEnergyMascot,
  tense: TenseMascot,
  calm: CalmMascot,
  balanced: BalancedMascot,
  energized: EnergizedMascot,
  high: HighEnergyMascot,
};

export function MascotFor(id: MoodId): React.FC<MascotProps> {
  return MASCOTS[id];
}
