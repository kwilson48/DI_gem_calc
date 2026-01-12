export interface Gem {
  id: string;
  name: string;
  stars: number;
  category: 'leg' | 'mixed' | 'crit' | 'direct';
  values: Record<number, number[]>; // rank -> [value1, value2]
  getLegBonus: (rank: number, isStrife: boolean, stats: CharacterStats) => number;
  getDirectDPS: (rank: number, isStrife: boolean, stats: CharacterStats) => number;
  getDescription: (rank: number, isStrife: boolean, stats: CharacterStats) => string;
}

export interface CharacterStats {
  baseDamage: number;
  critChance: number;
  critDamage: number;
  attackSpeed: number;
  enemyCount: number;
  currentLifePercent: number;
  primaryPercent: number;
  hasBuffSkill: boolean;
  hasDashSkill: boolean;
  hasVithus: boolean;
  hasFeastingBaron: boolean;
  fightingElites: boolean;
}

export const GEM_IDS = {
  BLOOD_SOAKED_JADE: 'bloodSoakedJade',
  BOTTLED_HOPE: 'bottledHope',
  MAW_OF_THE_DEEP: 'mawOfTheDeep',
  GLOOM_CASK: 'gloomCask',
  BLOOD_FLOE: 'bloodFloe',
  COLOSSUS_ENGINE: 'colossusEngine',
  ROILING_CONSEQUENCE: 'roilingConsequence',
  HAUNT_COIL: 'hauntCoil',
  FERVENT_FANG: 'ferventFang',
  HOWLERS_CALL: 'howlersCall',
  SPITEFUL_BLOOD: 'spitefulBlood',
  CONCENTRATED_WILL: 'concentratedWill',
  GOLDEN_FIRMAMENT: 'goldenFirmament',
  WULFHEORT: 'wulfheort',
  SEEPING_BILE: 'seepingBile',
  FROZEN_HEART: 'frozenHeart',
  PHOENIX_ASHES: 'phoenixAshes',
  BLOODY_REACH: 'bloodyReach',
  ECHOING_SHADE: 'echoingShade',
  CUTTHROATS_GRIN: 'cutthroatsGrin',
  BERSERKERS_EYE: 'berserkersEye',
  CHIP_OF_STONED_FLESH: 'chipOfStonedFlesh'
} as const;

export type GemId = typeof GEM_IDS[keyof typeof GEM_IDS];

export const DEFAULT_CHARACTER_STATS: CharacterStats = {
  baseDamage: 1000,
  critChance: 0,
  critDamage: 0,
  attackSpeed: 1.4,
  enemyCount: 1,
  currentLifePercent: 100,
  primaryPercent: 50,
  hasBuffSkill: false,
  hasDashSkill: false,
  hasVithus: false,
  hasFeastingBaron: false,
  fightingElites: false
};
