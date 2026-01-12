import type { GemId, CharacterStats } from './gems';

export interface Build {
  id: string;
  name: string;
  description?: string;
  selectedGems: GemId[];
  gemRanks: Partial<Record<GemId, number>>; // Gem ID -> Rank (1-10)
  characterStats: CharacterStats;
  buildOptions: BuildOptions;
  calculatedDPS?: CalculationResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuildOptions {
  useStrife: boolean;
  useFatedTrail: boolean;
}

export interface CalculationResult {
  totalDPS: number;
  baseDPS: number;
  breakdown: {
    gemContributions: Partial<Record<GemId, GemContribution>>;
    totalLegBonus: number;
    totalDirectDPS: number;
  };
  metadata: {
    calculatedAt: Date;
    calculationTime: number;
  };
}

export interface GemContribution {
  legBonus: number;
  directDPS: number;
  description: string;
}

export const DEFAULT_BUILD_OPTIONS: BuildOptions = {
  useStrife: false,
  useFatedTrail: false
};
