import type { Build, CalculationResult, GemContribution } from '../../types/builds';
import type { GemId, CharacterStats } from '../../types/gems';
import { getGem } from '../utils/gemData';

export class CalculationEngine {
  /**
   * Main calculation method - calculates total DPS for a build
   */
  static calculate(build: Partial<Build>): CalculationResult {
    const startTime = performance.now();

    if (!build.selectedGems || !build.characterStats || !build.gemRanks || !build.buildOptions) {
      throw new Error('Invalid build configuration');
    }

    const stats = build.characterStats;
    const isStrife = build.buildOptions.useStrife || false;

    // Calculate base DPS from character stats
    const baseDPS = this.calculateBaseDPS(stats);

    // Calculate contributions from each gem
    const gemContributions: Partial<Record<GemId, GemContribution>> = {};
    let totalLegBonus = 0;
    let totalDirectDPS = 0;

    for (const gemId of build.selectedGems) {
      const gem = getGem(gemId);
      if (!gem) continue;

      const rank = build.gemRanks[gemId] || 1;

      // Get legendary bonus (% damage increase)
      const legBonus = gem.getLegBonus(rank, isStrife, stats);

      // Get direct DPS contribution
      const directDPS = gem.getDirectDPS(rank, isStrife, stats);

      // Get description
      const description = gem.getDescription(rank, isStrife, stats);

      gemContributions[gemId] = {
        legBonus,
        directDPS,
        description
      };

      totalLegBonus += legBonus;
      totalDirectDPS += directDPS;
    }

    // Calculate total DPS
    // Formula: (BaseDPS * (1 + LegBonus%/100)) + DirectDPS
    const multiplier = 1 + (totalLegBonus / 100);
    const totalDPS = (baseDPS * multiplier) + totalDirectDPS;

    const endTime = performance.now();

    return {
      totalDPS: Math.round(totalDPS * 100) / 100,
      baseDPS: Math.round(baseDPS * 100) / 100,
      breakdown: {
        gemContributions,
        totalLegBonus: Math.round(totalLegBonus * 100) / 100,
        totalDirectDPS: Math.round(totalDirectDPS * 100) / 100
      },
      metadata: {
        calculatedAt: new Date(),
        calculationTime: Math.round(endTime - startTime)
      }
    };
  }

  /**
   * Calculate base DPS from character stats
   */
  private static calculateBaseDPS(stats: CharacterStats): number {
    // Simple formula: base damage * attack speed
    // Can be enhanced with crit calculations later
    const avgDamage = stats.baseDamage;
    const dps = avgDamage * stats.attackSpeed;
    return dps;
  }

  /**
   * Create a hash of build parameters for caching
   */
  static hashBuildParams(build: Partial<Build>): string {
    const str = JSON.stringify({
      selectedGems: build.selectedGems?.sort(),
      gemRanks: build.gemRanks,
      characterStats: build.characterStats,
      buildOptions: build.buildOptions
    });

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}
