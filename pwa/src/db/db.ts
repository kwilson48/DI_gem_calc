import Dexie, { type Table } from 'dexie';
import type { Build } from '../types/builds';

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

  async getSetting(key: string): Promise<any> {
    const setting = await this.settings.get(key);
    return setting?.value;
  }

  async setSetting(key: string, value: any): Promise<void> {
    await this.settings.put({ key, value });
  }
}

// Export singleton instance
export const db = new GemCalcDB();
