import { expose } from 'comlink';
import type { Build, CalculationResult } from '../types/builds';
import { db } from '../db/db';
import { CalculationEngine } from './services/CalculationEngine';

/**
 * Calculator Worker API
 * This is the "backend" that runs in a separate thread
 * All business logic lives here
 */
const CalculatorAPI = {
  /**
   * Calculate DPS for a build
   */
  async calculate(build: Partial<Build>): Promise<CalculationResult> {
    try {
      // Check cache first
      const cacheKey = CalculationEngine.hashBuildParams(build);
      const cached = await db.getCachedCalculation(cacheKey);

      if (cached) {
        console.log('Cache hit for calculation');
        return cached.result;
      }

      // Perform calculation
      const result = CalculationEngine.calculate(build);

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
      throw new Error(`Failed to calculate DPS: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  },

  /**
   * Clear calculation cache
   */
  async clearCache(): Promise<void> {
    try {
      await db.calculationCache.clear();
    } catch (error) {
      console.error('Clear cache error:', error);
      throw new Error('Failed to clear cache');
    }
  }
};

// Expose API to main thread via Comlink
expose(CalculatorAPI);

// Export type for use in frontend
export type CalculatorWorkerAPI = typeof CalculatorAPI;
