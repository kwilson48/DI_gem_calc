# PWA Implementation Guide
## Step-by-Step Guide to Building the Offline-First Gem Calculator

## Phase 1: Project Setup (Day 1-2)

### Step 1: Initialize Project

```bash
# Create new Vite + React + TypeScript project
npm create vite@latest di-gem-calc-pwa -- --template react-ts

cd di-gem-calc-pwa

# Install core dependencies
npm install

# Install UI dependencies
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react framer-motion
npm install clsx tailwind-merge

# Install state management
npm install zustand

# Install IndexedDB wrapper
npm install dexie

# Install Web Worker utilities
npm install comlink

# Install PWA plugin
npm install -D vite-plugin-pwa workbox-window

# Install development dependencies
npm install -D @types/node
npm install -D vitest @vitest/ui
npm install -D @playwright/test

# Initialize Tailwind
npx tailwindcss init -p
```

### Step 2: Configure Tailwind CSS

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b6b',
        secondary: '#ff9f40',
        accent: '#4ecdc4',
        purple: '#bb86fc',
        gold: '#ffd700',
        silver: '#c0c0c0',
        strife: '#ff4444',
        legendary: '#ff9f40',
        general: '#60a5fa',
        efficiency: '#34d399',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        'gradient-section': 'linear-gradient(145deg, #2a2a2a, #333333)',
      }
    },
  },
  plugins: [],
}
```

**src/styles/globals.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-gradient: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  --section-bg: linear-gradient(145deg, #2a2a2a, #333333);
  --scaling-bg: linear-gradient(145deg, #2d2a3a, #363344);
  --bucket-bg: linear-gradient(145deg, #2a3a2d, #334436);
}

body {
  margin: 0;
  padding: 0;
  background: var(--bg-gradient);
  color: #e0e0e0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
}

@layer components {
  .section-card {
    @apply bg-gradient-section p-6 rounded-xl border border-gray-700 shadow-lg;
  }

  .btn-primary {
    @apply bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors;
  }

  .btn-secondary {
    @apply bg-secondary hover:bg-secondary/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors;
  }

  .input-field {
    @apply bg-gray-800 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary;
  }
}
```

### Step 3: Configure Vite for PWA

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Diablo Immortal Gem Calculator',
        short_name: 'DI Gem Calc',
        description: 'Offline-capable gem calculator for Diablo Immortal with advanced build optimization',
        theme_color: '#ff6b6b',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['games', 'utilities']
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  worker: {
    format: 'es'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Step 4: Set Up Project Structure

```bash
mkdir -p src/{components,workers,stores,db,hooks,types,utils,styles}
mkdir -p src/components/{Calculator,BuildManagement,Settings,Shared}
mkdir -p src/workers/{services,models,utils}
mkdir -p public/icons

# Create placeholder files
touch src/workers/calculator.worker.ts
touch src/db/db.ts
touch src/types/gems.ts
touch src/types/builds.ts
```

## Phase 2: Data Layer (Day 3)

### Step 1: Define TypeScript Types

**src/types/gems.ts**:
```typescript
export interface Gem {
  id: string;
  name: string;
  rank: number;
  baseDamage: number;
  critDamage?: number;
  type: 'legendary' | 'general' | 'efficiency';
  bucketMultiplier?: number;
  scalingMultiplier?: number;
  specialEffect?: {
    type: string;
    value: number;
    description: string;
  };
}

export const GEM_IDS = {
  SEEPING_BILE: 'seeping_bile',
  BOTTLED_HOPE: 'bottled_hope',
  PHOENIX_ASHES: 'phoenix_ashes',
  FROZEN_HEART: 'frozen_heart',
  BLOODY_REACH: 'bloody_reach',
  HOWLERS_CALL: 'howlers_call',
  ECHOING_SHADE: 'echoing_shade',
  CUTTHROATS_GRIN: 'cutthroats_grin',
  BERSERKERS_EYE: 'berserkers_eye',
  CHIP_OF_STONED_FLESH: 'chip_of_stoned_flesh',
  // ... all 22 gems
} as const;

export type GemId = typeof GEM_IDS[keyof typeof GEM_IDS];
```

**src/types/builds.ts**:
```typescript
export interface CharacterStats {
  baseDamage: number;
  critChance: number;
  critDamage: number;
  attackSpeed: number;
}

export interface DPSScaling {
  bucketMultiplier: number;
  scalingMultiplier: number;
  effectivenessMultiplier: number;
}

export interface HitFrequency {
  hitsPerSecond: number;
  skillDuration: number;
}

export interface BuildOptions {
  useStrife: boolean;
  useFatedTrail: boolean;
  considerBuckets: boolean;
  considerScaling: boolean;
}

export interface Build {
  id: string;
  name: string;
  description?: string;
  selectedGems: GemId[];
  characterStats: CharacterStats;
  dpsScaling: DPSScaling;
  hitFrequency: HitFrequency;
  buildOptions: BuildOptions;
  calculatedDPS?: CalculationResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalculationResult {
  totalDPS: number;
  baseDPS: number;
  breakdown: {
    gemContributions: Record<GemId, number>;
    bucketBonus: number;
    scalingBonus: number;
    strifeBonus?: number;
  };
  metadata: {
    calculatedAt: Date;
    calculationTime: number;
  };
}

export const DEFAULT_CHARACTER_STATS: CharacterStats = {
  baseDamage: 1000,
  critChance: 0,
  critDamage: 0,
  attackSpeed: 1.0
};

export const DEFAULT_DPS_SCALING: DPSScaling = {
  bucketMultiplier: 1.0,
  scalingMultiplier: 1.0,
  effectivenessMultiplier: 1.0
};

export const DEFAULT_HIT_FREQUENCY: HitFrequency = {
  hitsPerSecond: 1.0,
  skillDuration: 1.0
};

export const DEFAULT_BUILD_OPTIONS: BuildOptions = {
  useStrife: false,
  useFatedTrail: false,
  considerBuckets: true,
  considerScaling: true
};
```

### Step 2: Set Up IndexedDB

**src/db/db.ts**:
```typescript
import Dexie, { Table } from 'dexie';
import { Build } from '../types/builds';

export interface Setting {
  key: string;
  value: any;
}

export interface CachedCalculation {
  hash: string;
  result: any;
  timestamp: Date;
}

export interface CalculationHistory {
  id: string;
  build: Partial<Build>;
  result: any;
  timestamp: Date;
}

export class GemCalcDB extends Dexie {
  builds!: Table<Build, string>;
  settings!: Table<Setting, string>;
  calculationCache!: Table<CachedCalculation, string>;
  history!: Table<CalculationHistory, string>;

  constructor() {
    super('GemCalculatorDB');

    this.version(1).stores({
      builds: 'id, name, createdAt, updatedAt',
      settings: 'key',
      calculationCache: 'hash, timestamp',
      history: 'id, timestamp'
    });
  }

  // Helper methods
  async saveBuild(build: Build): Promise<string> {
    const now = new Date();
    const buildToSave = {
      ...build,
      updatedAt: now,
      createdAt: build.createdAt || now
    };
    await this.builds.put(buildToSave);
    return build.id;
  }

  async loadBuild(id: string): Promise<Build | undefined> {
    return await this.builds.get(id);
  }

  async getAllBuilds(): Promise<Build[]> {
    return await this.builds.orderBy('updatedAt').reverse().toArray();
  }

  async deleteBuild(id: string): Promise<void> {
    await this.builds.delete(id);
  }

  async getCachedCalculation(hash: string): Promise<CachedCalculation | undefined> {
    const cached = await this.calculationCache.get(hash);

    // Check if cache is expired (24 hours)
    if (cached) {
      const ageInHours = (Date.now() - cached.timestamp.getTime()) / (1000 * 60 * 60);
      if (ageInHours > 24) {
        await this.calculationCache.delete(hash);
        return undefined;
      }
    }

    return cached;
  }

  async setCachedCalculation(hash: string, result: any): Promise<void> {
    await this.calculationCache.put({
      hash,
      result,
      timestamp: new Date()
    });
  }
}

// Export singleton instance
export const db = new GemCalcDB();
```

## Phase 3: Backend Layer - Web Worker (Day 4-5)

### Step 1: Create Gem Data

**src/workers/utils/gemData.ts**:
```typescript
import { Gem, GEM_IDS } from '../../types/gems';

export const GEMS: Record<string, Gem> = {
  [GEM_IDS.SEEPING_BILE]: {
    id: GEM_IDS.SEEPING_BILE,
    name: 'Seeping Bile',
    rank: 10,
    baseDamage: 32,
    type: 'legendary',
    bucketMultiplier: 1.16,
    specialEffect: {
      type: 'poison_pool',
      value: 20,
      description: 'Leaves poison pools dealing 20% base damage'
    }
  },
  [GEM_IDS.BOTTLED_HOPE]: {
    id: GEM_IDS.BOTTLED_HOPE,
    name: 'Bottled Hope',
    rank: 10,
    baseDamage: 0,
    type: 'legendary',
    bucketMultiplier: 1.16,
    scalingMultiplier: 1.01,
    specialEffect: {
      type: 'movement_buff',
      value: 8,
      description: 'Increases damage by 8% for 8 seconds after moving'
    }
  },
  // Add all 22 gems here...
  // This data will be extracted from the HTML file
};

export function getGem(gemId: string): Gem | undefined {
  return GEMS[gemId];
}

export function getAllGems(): Gem[] {
  return Object.values(GEMS);
}

export function getGemsByType(type: Gem['type']): Gem[] {
  return Object.values(GEMS).filter(gem => gem.type === type);
}
```

### Step 2: Create Calculation Engine

**src/workers/services/CalculationEngine.ts**:
```typescript
import { Build, CalculationResult, CharacterStats } from '../../types/builds';
import { GemId } from '../../types/gems';
import { getGem } from '../utils/gemData';

export class CalculationEngine {
  static calculate(build: Build): CalculationResult {
    const startTime = performance.now();

    // 1. Calculate base DPS
    const baseDPS = this.calculateBaseDPS(build.characterStats, build.hitFrequency);

    // 2. Calculate gem contributions
    const gemContributions = this.calculateGemContributions(
      build.selectedGems,
      build.characterStats,
      build.hitFrequency
    );

    // 3. Calculate bucket bonus
    const bucketBonus = build.buildOptions.considerBuckets
      ? this.calculateBucketBonus(build.selectedGems, build.dpsScaling)
      : 1.0;

    // 4. Calculate scaling bonus
    const scalingBonus = build.buildOptions.considerScaling
      ? this.calculateScalingBonus(build.selectedGems, build.dpsScaling)
      : 1.0;

    // 5. Calculate Strife bonus if enabled
    const strifeBonus = build.buildOptions.useStrife
      ? this.calculateStrifeBonus(build.selectedGems)
      : undefined;

    // 6. Calculate total DPS
    const gemDPS = Object.values(gemContributions).reduce((sum, val) => sum + val, 0);
    let totalDPS = (baseDPS + gemDPS) * bucketBonus * scalingBonus;

    if (strifeBonus) {
      totalDPS *= strifeBonus;
    }

    const endTime = performance.now();

    return {
      totalDPS: Math.round(totalDPS * 100) / 100,
      baseDPS: Math.round(baseDPS * 100) / 100,
      breakdown: {
        gemContributions,
        bucketBonus: Math.round(bucketBonus * 100) / 100,
        scalingBonus: Math.round(scalingBonus * 100) / 100,
        strifeBonus: strifeBonus ? Math.round(strifeBonus * 100) / 100 : undefined
      },
      metadata: {
        calculatedAt: new Date(),
        calculationTime: Math.round(endTime - startTime)
      }
    };
  }

  private static calculateBaseDPS(
    stats: CharacterStats,
    frequency: { hitsPerSecond: number }
  ): number {
    const avgDamage = stats.baseDamage * (1 + stats.critChance * stats.critDamage);
    return avgDamage * frequency.hitsPerSecond;
  }

  private static calculateGemContributions(
    gemIds: GemId[],
    stats: CharacterStats,
    frequency: { hitsPerSecond: number }
  ): Record<GemId, number> {
    const contributions: Record<string, number> = {};

    for (const gemId of gemIds) {
      const gem = getGem(gemId);
      if (!gem) continue;

      // Base gem damage
      let gemDPS = gem.baseDamage * frequency.hitsPerSecond;

      // Add crit damage if gem has it
      if (gem.critDamage) {
        gemDPS += gem.critDamage * stats.critChance * frequency.hitsPerSecond;
      }

      // Add special effects
      if (gem.specialEffect) {
        const effectDPS = this.calculateSpecialEffect(
          gem.specialEffect,
          stats,
          frequency
        );
        gemDPS += effectDPS;
      }

      contributions[gemId] = gemDPS;
    }

    return contributions;
  }

  private static calculateSpecialEffect(
    effect: { type: string; value: number },
    stats: CharacterStats,
    frequency: { hitsPerSecond: number }
  ): number {
    // Implement special effect calculations based on type
    switch (effect.type) {
      case 'poison_pool':
        return stats.baseDamage * (effect.value / 100) * frequency.hitsPerSecond;
      case 'movement_buff':
        return stats.baseDamage * (effect.value / 100);
      default:
        return 0;
    }
  }

  private static calculateBucketBonus(
    gemIds: GemId[],
    scaling: { bucketMultiplier: number }
  ): number {
    let bucketBonus = 1.0;

    for (const gemId of gemIds) {
      const gem = getGem(gemId);
      if (gem?.bucketMultiplier) {
        bucketBonus *= gem.bucketMultiplier;
      }
    }

    return bucketBonus * scaling.bucketMultiplier;
  }

  private static calculateScalingBonus(
    gemIds: GemId[],
    scaling: { scalingMultiplier: number }
  ): number {
    let scalingBonus = 1.0;

    for (const gemId of gemIds) {
      const gem = getGem(gemId);
      if (gem?.scalingMultiplier) {
        scalingBonus *= gem.scalingMultiplier;
      }
    }

    return scalingBonus * scaling.scalingMultiplier;
  }

  private static calculateStrifeBonus(gemIds: GemId[]): number {
    // Implement Strife calculation logic
    const strifeGem = gemIds.find(id => id.includes('strife'));
    if (strifeGem) {
      return 1.1; // 10% bonus example
    }
    return 1.0;
  }
}
```

### Step 3: Create Web Worker with Comlink

**src/workers/calculator.worker.ts**:
```typescript
import { expose } from 'comlink';
import { Build, CalculationResult } from '../types/builds';
import { db } from '../db/db';
import { CalculationEngine } from './services/CalculationEngine';
import { createHash } from 'crypto';

// Create hash for caching
function hashBuild(build: Partial<Build>): string {
  const str = JSON.stringify({
    selectedGems: build.selectedGems,
    characterStats: build.characterStats,
    dpsScaling: build.dpsScaling,
    hitFrequency: build.hitFrequency,
    buildOptions: build.buildOptions
  });

  // Simple hash function (use crypto in production)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

const CalculatorAPI = {
  /**
   * Calculate DPS for a build
   */
  async calculate(build: Partial<Build>): Promise<CalculationResult> {
    try {
      // Check cache first
      const cacheKey = hashBuild(build);
      const cached = await db.getCachedCalculation(cacheKey);

      if (cached) {
        console.log('Cache hit for calculation');
        return cached.result;
      }

      // Perform calculation
      const result = CalculationEngine.calculate(build as Build);

      // Cache result
      await db.setCachedCalculation(cacheKey, result);

      // Save to history
      await db.history.add({
        id: crypto.randomUUID(),
        build,
        result,
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      console.error('Calculation error:', error);
      throw new Error('Failed to calculate DPS');
    }
  },

  /**
   * Save a build
   */
  async saveBuild(build: Build): Promise<string> {
    try {
      return await db.saveBuild(build);
    } catch (error) {
      console.error('Save build error:', error);
      throw new Error('Failed to save build');
    }
  },

  /**
   * Load a build by ID
   */
  async loadBuild(id: string): Promise<Build | undefined> {
    try {
      return await db.loadBuild(id);
    } catch (error) {
      console.error('Load build error:', error);
      throw new Error('Failed to load build');
    }
  },

  /**
   * Get all builds
   */
  async getAllBuilds(): Promise<Build[]> {
    try {
      return await db.getAllBuilds();
    } catch (error) {
      console.error('Get all builds error:', error);
      throw new Error('Failed to load builds');
    }
  },

  /**
   * Delete a build
   */
  async deleteBuild(id: string): Promise<void> {
    try {
      await db.deleteBuild(id);
    } catch (error) {
      console.error('Delete build error:', error);
      throw new Error('Failed to delete build');
    }
  },

  /**
   * Get calculation history
   */
  async getHistory(limit: number = 10): Promise<any[]> {
    try {
      return await db.history
        .orderBy('timestamp')
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Get history error:', error);
      throw new Error('Failed to load history');
    }
  }
};

// Expose API to main thread
expose(CalculatorAPI);

export type CalculatorWorkerAPI = typeof CalculatorAPI;
```

## Phase 4: Frontend Layer (Day 6-8)

### Step 1: Create State Management

**src/stores/calculatorStore.ts**:
```typescript
import { create } from 'zustand';
import { Build, CalculationResult, DEFAULT_CHARACTER_STATS, DEFAULT_DPS_SCALING, DEFAULT_HIT_FREQUENCY, DEFAULT_BUILD_OPTIONS } from '../types/builds';
import { GemId } from '../types/gems';
import { getWorkerAPI } from '../utils/workerFactory';

interface CalculatorState {
  // Build data
  selectedGems: Set<GemId>;
  characterStats: typeof DEFAULT_CHARACTER_STATS;
  dpsScaling: typeof DEFAULT_DPS_SCALING;
  hitFrequency: typeof DEFAULT_HIT_FREQUENCY;
  buildOptions: typeof DEFAULT_BUILD_OPTIONS;

  // Results
  calculationResult: CalculationResult | null;
  isCalculating: boolean;
  error: string | null;

  // Actions
  toggleGem: (gemId: GemId) => void;
  setCharacterStats: (stats: Partial<typeof DEFAULT_CHARACTER_STATS>) => void;
  setDPSScaling: (scaling: Partial<typeof DEFAULT_DPS_SCALING>) => void;
  setHitFrequency: (frequency: Partial<typeof DEFAULT_HIT_FREQUENCY>) => void;
  setBuildOptions: (options: Partial<typeof DEFAULT_BUILD_OPTIONS>) => void;
  calculate: () => Promise<void>;
  reset: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  selectedGems: new Set(),
  characterStats: DEFAULT_CHARACTER_STATS,
  dpsScaling: DEFAULT_DPS_SCALING,
  hitFrequency: DEFAULT_HIT_FREQUENCY,
  buildOptions: DEFAULT_BUILD_OPTIONS,
  calculationResult: null,
  isCalculating: false,
  error: null,

  toggleGem: (gemId) => {
    set((state) => {
      const newSet = new Set(state.selectedGems);
      if (newSet.has(gemId)) {
        newSet.delete(gemId);
      } else {
        newSet.add(gemId);
      }
      return { selectedGems: newSet };
    });
  },

  setCharacterStats: (stats) => {
    set((state) => ({
      characterStats: { ...state.characterStats, ...stats }
    }));
  },

  setDPSScaling: (scaling) => {
    set((state) => ({
      dpsScaling: { ...state.dpsScaling, ...scaling }
    }));
  },

  setHitFrequency: (frequency) => {
    set((state) => ({
      hitFrequency: { ...state.hitFrequency, ...frequency }
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
        characterStats: state.characterStats,
        dpsScaling: state.dpsScaling,
        hitFrequency: state.hitFrequency,
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
      characterStats: DEFAULT_CHARACTER_STATS,
      dpsScaling: DEFAULT_DPS_SCALING,
      hitFrequency: DEFAULT_HIT_FREQUENCY,
      buildOptions: DEFAULT_BUILD_OPTIONS,
      calculationResult: null,
      error: null
    });
  }
}));
```

### Step 2: Create Worker Factory

**src/utils/workerFactory.ts**:
```typescript
import { wrap, Remote } from 'comlink';
import type { CalculatorWorkerAPI } from '../workers/calculator.worker';

let workerAPI: Remote<CalculatorWorkerAPI> | null = null;

export async function getWorkerAPI(): Promise<Remote<CalculatorWorkerAPI>> {
  if (!workerAPI) {
    const worker = new Worker(
      new URL('../workers/calculator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerAPI = wrap<CalculatorWorkerAPI>(worker);
  }

  return workerAPI;
}
```

### Step 3: Create React Components

**src/components/Calculator/GemSelector.tsx**:
```typescript
import { GemId } from '../../types/gems';
import { getAllGems } from '../../workers/utils/gemData';

interface GemSelectorProps {
  selectedGems: Set<GemId>;
  onToggle: (gemId: GemId) => void;
}

export function GemSelector({ selectedGems, onToggle }: GemSelectorProps) {
  const gems = getAllGems();

  return (
    <div className="section-card">
      <h2 className="text-2xl font-bold text-primary mb-4">Select Gems</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {gems.map((gem) => (
          <button
            key={gem.id}
            onClick={() => onToggle(gem.id as GemId)}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${selectedGems.has(gem.id as GemId)
                ? 'border-primary bg-primary/20 shadow-lg'
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }
            `}
            data-testid={`gem-${gem.id}`}
          >
            <div className="text-sm font-semibold">{gem.name}</div>
            <div className="text-xs text-gray-400 mt-1">Rank {gem.rank}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**src/components/Calculator/ResultsDisplay.tsx**:
```typescript
import { CalculationResult } from '../../types/builds';

interface ResultsDisplayProps {
  result: CalculationResult | null;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  if (!result) {
    return (
      <div className="section-card text-center text-gray-500">
        <p>Select gems and click Calculate to see DPS results</p>
      </div>
    );
  }

  return (
    <div className="section-card">
      <h2 className="text-2xl font-bold text-accent mb-4">Results</h2>

      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-lg mb-4">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-1">Total DPS</div>
          <div className="text-5xl font-bold text-primary" data-testid="total-dps">
            {result.totalDPS.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">Base DPS</div>
          <div className="text-xl font-semibold">{result.baseDPS.toLocaleString()}</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">Bucket Bonus</div>
          <div className="text-xl font-semibold">{result.breakdown.bucketBonus}x</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">Scaling Bonus</div>
          <div className="text-xl font-semibold">{result.breakdown.scalingBonus}x</div>
        </div>

        {result.breakdown.strifeBonus && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Strife Bonus</div>
            <div className="text-xl font-semibold">{result.breakdown.strifeBonus}x</div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        Calculated in {result.metadata.calculationTime}ms
      </div>
    </div>
  );
}
```

**src/components/Calculator/Calculator.tsx**:
```typescript
import { useCalculatorStore } from '../../stores/calculatorStore';
import { GemSelector } from './GemSelector';
import { CharacterStats } from './CharacterStats';
import { ResultsDisplay } from './ResultsDisplay';

export function Calculator() {
  const {
    selectedGems,
    toggleGem,
    calculate,
    calculationResult,
    isCalculating,
    error,
    reset
  } = useCalculatorStore();

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Gem Calculator v8.0
        </h1>
        <p className="text-gray-400">PWA Edition - Works Offline</p>
      </header>

      <GemSelector selectedGems={selectedGems} onToggle={toggleGem} />

      <CharacterStats />

      <div className="flex gap-4 justify-center">
        <button
          onClick={calculate}
          disabled={isCalculating || selectedGems.size === 0}
          className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="calculate-button"
        >
          {isCalculating ? 'Calculating...' : 'Calculate DPS'}
        </button>

        <button
          onClick={reset}
          className="btn-secondary px-8 py-3 text-lg"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="section-card bg-red-900/20 border-red-500">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <ResultsDisplay result={calculationResult} />
    </div>
  );
}
```

## Phase 5: PWA Features (Day 9)

### Create PWA Update Component

**src/components/Shared/PWAUpdatePrompt.tsx**:
```typescript
import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border-2 border-primary p-4 rounded-lg shadow-2xl max-w-sm z-50">
      <h3 className="font-bold text-primary mb-2">Update Available</h3>
      <p className="text-sm text-gray-300 mb-4">
        A new version is available. Refresh to update.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="btn-primary flex-1"
        >
          Update
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="btn-secondary flex-1"
        >
          Later
        </button>
      </div>
    </div>
  );
}
```

### Main App

**src/App.tsx**:
```typescript
import { Calculator } from './components/Calculator/Calculator';
import { PWAUpdatePrompt } from './components/Shared/PWAUpdatePrompt';
import './styles/globals.css';

function App() {
  return (
    <>
      <Calculator />
      <PWAUpdatePrompt />
    </>
  );
}

export default App;
```

## Phase 6: Testing & Deployment

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Test on Mobile

1. Find your local IP: `ifconfig` or `ipconfig`
2. Access on mobile: `http://YOUR_IP:5173`
3. Or use ngrok: `npx ngrok http 5173`

### Deploy to GitHub Pages

```bash
# Build
npm run build

# Deploy (using gh-pages)
npm install -D gh-pages
npx gh-pages -d dist
```

## Next Steps

This implementation provides:
- ✅ Offline-first PWA
- ✅ Backend logic in Web Workers
- ✅ Frontend React components
- ✅ IndexedDB persistence
- ✅ Service Worker caching
- ✅ Installable on mobile

Continue development by:
1. Extracting actual gem data from HTML
2. Implementing all calculation logic
3. Adding build management features
4. Creating optimal finder
5. Adding tests
6. Deploying to production
