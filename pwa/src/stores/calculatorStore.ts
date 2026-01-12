import { create } from 'zustand';
import type { Build, CalculationResult } from '../types/builds';
import { DEFAULT_BUILD_OPTIONS } from '../types/builds';
import type { GemId, CharacterStats } from '../types/gems';
import { DEFAULT_CHARACTER_STATS } from '../types/gems';
import { getWorkerAPI } from '../utils/workerFactory';

interface CalculatorState {
  // Build data
  selectedGems: Set<GemId>;
  gemRanks: Partial<Record<GemId, number>>;
  characterStats: CharacterStats;
  buildOptions: typeof DEFAULT_BUILD_OPTIONS;

  // Results
  calculationResult: CalculationResult | null;
  isCalculating: boolean;
  error: string | null;

  // Actions
  toggleGem: (gemId: GemId) => void;
  setGemRank: (gemId: GemId, rank: number) => void;
  setCharacterStats: (stats: Partial<CharacterStats>) => void;
  setBuildOptions: (options: Partial<typeof DEFAULT_BUILD_OPTIONS>) => void;
  calculate: () => Promise<void>;
  reset: () => void;
  loadFromBuild: (build: Build) => void;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  selectedGems: new Set(),
  gemRanks: {},
  characterStats: DEFAULT_CHARACTER_STATS,
  buildOptions: DEFAULT_BUILD_OPTIONS,
  calculationResult: null,
  isCalculating: false,
  error: null,

  toggleGem: (gemId) => {
    set((state) => {
      const newSet = new Set(state.selectedGems);
      const newRanks = { ...state.gemRanks };

      if (newSet.has(gemId)) {
        newSet.delete(gemId);
        delete newRanks[gemId];
      } else {
        newSet.add(gemId);
        newRanks[gemId] = 10; // Default to rank 10
      }

      return { selectedGems: newSet, gemRanks: newRanks };
    });
  },

  setGemRank: (gemId, rank) => {
    set((state) => ({
      gemRanks: { ...state.gemRanks, [gemId]: rank }
    }));
  },

  setCharacterStats: (stats) => {
    set((state) => ({
      characterStats: { ...state.characterStats, ...stats }
    }));
  },

  setBuildOptions: (options) => {
    set((state) => ({
      buildOptions: { ...state.buildOptions, ...options }
    }));
  },

  calculate: async () => {
    set({ isCalculating: true, error: null });

    try {
      const state = get();
      const workerAPI = await getWorkerAPI();

      const result = await workerAPI.calculate({
        selectedGems: Array.from(state.selectedGems),
        gemRanks: state.gemRanks,
        characterStats: state.characterStats,
        buildOptions: state.buildOptions
      } as Build);

      set({ calculationResult: result, isCalculating: false });
    } catch (error: any) {
      set({ error: error.message, isCalculating: false });
    }
  },

  reset: () => {
    set({
      selectedGems: new Set(),
      gemRanks: {},
      characterStats: DEFAULT_CHARACTER_STATS,
      buildOptions: DEFAULT_BUILD_OPTIONS,
      calculationResult: null,
      error: null
    });
  },

  loadFromBuild: (build) => {
    set({
      selectedGems: new Set(build.selectedGems),
      gemRanks: build.gemRanks,
      characterStats: build.characterStats,
      buildOptions: build.buildOptions,
      calculationResult: build.calculatedDPS || null
    });
  }
}));
