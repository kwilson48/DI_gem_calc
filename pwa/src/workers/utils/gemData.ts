import type { Gem, CharacterStats } from '../../types/gems';
import { GEM_IDS } from '../../types/gems';

// Comprehensive gem database extracted from calculator v7.1
export const GEMS: Record<string, Gem> = {
  [GEM_IDS.BLOOD_SOAKED_JADE]: {
    id: GEM_IDS.BLOOD_SOAKED_JADE,
    name: 'Blood-Soaked Jade',
    stars: 5,
    category: 'leg',
    values: {
      1: [8, 0], 2: [10.5, 0], 3: [10.5, 2], 4: [13.5, 2], 5: [13.5, 4],
      6: [17, 4], 7: [17, 6], 8: [20.5, 6], 9: [20.5, 8], 10: [24, 8]
    },
    getLegBonus: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      let [maxDmg] = GEMS[GEM_IDS.BLOOD_SOAKED_JADE].values[rank];
      if (isStrife) maxDmg *= (1/3);
      const lifeRatio = stats.currentLifePercent / 100;
      const minDmg = maxDmg / 2;
      return minDmg + (maxDmg - minDmg) * lifeRatio;
    },
    getDirectDPS: () => 0,
    getDescription: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      const bonus = GEMS[GEM_IDS.BLOOD_SOAKED_JADE].getLegBonus(rank, isStrife, stats);
      return `+${bonus.toFixed(1)}% damage (at ${stats.currentLifePercent}% HP)`;
    }
  },

  [GEM_IDS.BOTTLED_HOPE]: {
    id: GEM_IDS.BOTTLED_HOPE,
    name: 'Bottled Hope',
    stars: 5,
    category: 'leg',
    values: {
      1: [8, 0], 2: [10.5, 0], 3: [10.5, 1.5], 4: [13.5, 1.5], 5: [13.5, 3],
      6: [17, 3], 7: [17, 4.5], 8: [20.5, 4.5], 9: [20.5, 6], 10: [24, 6]
    },
    getLegBonus: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      if (!stats.hasBuffSkill) return 0;
      let [dmg, cdr] = GEMS[GEM_IDS.BOTTLED_HOPE].values[rank];
      if (isStrife) { dmg *= (1/3); cdr *= (1/3); }

      const duration = stats.hasVithus ? 7.8 : 6;
      const uptime = duration / 20;
      let totalBonus = dmg * uptime;

      if (cdr > 0) {
        const cdrDecimal = cdr / 100;
        const cdrMultiplier = (1 / (1 - cdrDecimal)) - 1;
        const skillPortion = 1 - (stats.primaryPercent / 100);
        totalBonus += cdrMultiplier * 100 * skillPortion;
      }

      return totalBonus;
    },
    getDirectDPS: () => 0,
    getDescription: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      if (!stats.hasBuffSkill) return 'Inactive (no buff skill)';
      let [dmg, cdr] = GEMS[GEM_IDS.BOTTLED_HOPE].values[rank];
      if (isStrife) { dmg *= (1/3); cdr *= (1/3); }
      const duration = stats.hasVithus ? 7.8 : 6;
      const uptime = duration / 20;
      const dmgBonus = dmg * uptime;
      if (cdr > 0) {
        return `+${dmgBonus.toFixed(1)}% dmg + ${cdr.toFixed(1)}% CDR`;
      }
      return `+${dmgBonus.toFixed(1)}% damage`;
    }
  },

  [GEM_IDS.HOWLERS_CALL]: {
    id: GEM_IDS.HOWLERS_CALL,
    name: "Howler's Call",
    stars: 5,
    category: 'direct',
    values: {
      1: [150, 0], 2: [180, 0], 3: [180, 12], 4: [220, 12], 5: [220, 24],
      6: [260, 24], 7: [260, 36], 8: [310, 36], 9: [310, 48], 10: [360, 48]
    },
    getLegBonus: () => 0,
    getDirectDPS: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      let [wolfDmg] = GEMS[GEM_IDS.HOWLERS_CALL].values[rank];
      if (isStrife) wolfDmg *= (1/3);
      const flatBonus = isStrife ? 1458 * (1/3) : 1458;
      const damage = stats.baseDamage * (wolfDmg / 100) + flatBonus;
      return (damage * stats.enemyCount) / 20;
    },
    getDescription: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      const directDPS = GEMS[GEM_IDS.HOWLERS_CALL].getDirectDPS(rank, isStrife, stats);
      return `${Math.round(directDPS).toLocaleString()} wolf DPS`;
    }
  },

  [GEM_IDS.SEEPING_BILE]: {
    id: GEM_IDS.SEEPING_BILE,
    name: 'Seeping Bile',
    stars: 5,
    category: 'direct',
    values: {
      1: [25, 0], 2: [30, 0], 3: [30, 6], 4: [35, 6], 5: [35, 12],
      6: [45, 12], 7: [45, 18], 8: [55, 18], 9: [55, 24], 10: [65, 24]
    },
    getLegBonus: () => 0,
    getDirectDPS: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      let [poisonPerSec] = GEMS[GEM_IDS.SEEPING_BILE].values[rank];
      if (isStrife) poisonPerSec *= (1/3);
      const flatBonus = isStrife ? 263 * (1/3) : 263;
      const damagePerSec = stats.baseDamage * (poisonPerSec / 100) + flatBonus;
      const totalDamage = damagePerSec * 6;
      const poisonedTargets = Math.min(stats.enemyCount, 1.5);
      return (totalDamage * poisonedTargets) / 20;
    },
    getDescription: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      const directDPS = GEMS[GEM_IDS.SEEPING_BILE].getDirectDPS(rank, isStrife, stats);
      return `${Math.round(directDPS).toLocaleString()} poison DPS`;
    }
  },

  [GEM_IDS.FERVENT_FANG]: {
    id: GEM_IDS.FERVENT_FANG,
    name: 'Fervent Fang',
    stars: 2,
    category: 'leg',
    values: {
      1: [0.8, 0], 2: [1.05, 0], 3: [1.05, 1.5], 4: [1.35, 1.5], 5: [1.35, 3],
      6: [1.7, 3], 7: [1.7, 4.5], 8: [2.1, 4.5], 9: [2.1, 6], 10: [2.4, 6]
    },
    getLegBonus: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      let [perStack, elite] = GEMS[GEM_IDS.FERVENT_FANG].values[rank];
      if (isStrife) { perStack *= (1/3); elite *= (1/3); }
      const maxStacks = 10;
      let bonus = perStack * maxStacks;
      if (stats.fightingElites) bonus += elite;
      return bonus;
    },
    getDirectDPS: () => 0,
    getDescription: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      const bonus = GEMS[GEM_IDS.FERVENT_FANG].getLegBonus(rank, isStrife, stats);
      return `+${bonus.toFixed(1)}% damage (10 stacks)`;
    }
  },

  [GEM_IDS.BERSERKERS_EYE]: {
    id: GEM_IDS.BERSERKERS_EYE,
    name: "Berserker's Eye",
    stars: 5,
    category: 'leg',
    values: {
      1: [1.5, 0], 2: [2, 0], 3: [2, 2], 4: [2.5, 2], 5: [2.5, 4],
      6: [3, 4], 7: [3, 6], 8: [3.5, 6], 9: [3.5, 8], 10: [4, 8]
    },
    getLegBonus: (rank: number, isStrife: boolean, _stats: CharacterStats) => {
      let [dmgPerStack] = GEMS[GEM_IDS.BERSERKERS_EYE].values[rank];
      if (isStrife) dmgPerStack *= (1/3);
      const maxStacks = 10;
      return dmgPerStack * maxStacks;
    },
    getDirectDPS: () => 0,
    getDescription: (rank: number, isStrife: boolean, stats: CharacterStats) => {
      const bonus = GEMS[GEM_IDS.BERSERKERS_EYE].getLegBonus(rank, isStrife, stats);
      return `+${bonus.toFixed(1)}% damage (10 stacks)`;
    }
  },

  // Add placeholder for remaining gems - these can be added later
  [GEM_IDS.FROZEN_HEART]: {
    id: GEM_IDS.FROZEN_HEART,
    name: 'Frozen Heart',
    stars: 5,
    category: 'leg',
    values: {
      1: [4, 0], 2: [5, 0], 3: [5, 2], 4: [6, 2], 5: [6, 4],
      6: [8, 4], 7: [8, 6], 8: [10, 6], 9: [10, 8], 10: [12, 8]
    },
    getLegBonus: (rank: number, isStrife: boolean) => {
      let [dmg] = GEMS[GEM_IDS.FROZEN_HEART].values[rank];
      if (isStrife) dmg *= (1/3);
      return dmg;
    },
    getDirectDPS: () => 0,
    getDescription: (rank: number, isStrife: boolean) => {
      const bonus = GEMS[GEM_IDS.FROZEN_HEART].getLegBonus(rank, isStrife, {} as CharacterStats);
      return `+${bonus.toFixed(1)}% damage vs chilled`;
    }
  }
};

export function getGem(gemId: string): Gem | undefined {
  return GEMS[gemId];
}

export function getAllGems(): Gem[] {
  return Object.values(GEMS);
}

export function getGemsByType(type: Gem['category']): Gem[] {
  return Object.values(GEMS).filter(gem => gem.category === type);
}

export function getGemsByStars(stars: number): Gem[] {
  return Object.values(GEMS).filter(gem => gem.stars === stars);
}
