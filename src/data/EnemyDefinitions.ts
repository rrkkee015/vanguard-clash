import { COLORS, MELEE_RANGE } from '../constants';

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  range: number;
  attackSpeed: number;
  speed: number;
  color: number;
  ai: 'melee-aggro' | 'ranged-aggro' | 'boss';
  isRanged?: boolean;
  width?: number;
  height?: number;
}

export const GoblinDef: EnemyDef = {
  id: 'goblin',
  name: 'Goblin',
  hp: 120,
  attack: 15,
  defense: 3,
  range: MELEE_RANGE,
  attackSpeed: 1000,
  speed: 110,
  color: COLORS.ENEMY,
  ai: 'melee-aggro',
};

export const GoblinArcherDef: EnemyDef = {
  id: 'goblin_archer',
  name: 'Goblin Archer',
  hp: 80,
  attack: 20,
  defense: 2,
  range: 280,
  attackSpeed: 1200,
  speed: 90,
  color: COLORS.ENEMY_RANGED,
  ai: 'ranged-aggro',
  isRanged: true,
};

export const OrcDef: EnemyDef = {
  id: 'orc',
  name: 'Orc',
  hp: 250,
  attack: 25,
  defense: 8,
  range: MELEE_RANGE,
  attackSpeed: 1200,
  speed: 90,
  color: COLORS.ENEMY,
  ai: 'melee-aggro',
  width: 44,
  height: 44,
};

export const OrcShamanDef: EnemyDef = {
  id: 'orc_shaman',
  name: 'Orc Shaman',
  hp: 150,
  attack: 30,
  defense: 5,
  range: 250,
  attackSpeed: 1400,
  speed: 80,
  color: COLORS.ENEMY_RANGED,
  ai: 'ranged-aggro',
  isRanged: true,
};

export const TrollBossDef: EnemyDef = {
  id: 'troll_boss',
  name: 'Troll Warlord',
  hp: 800,
  attack: 40,
  defense: 15,
  range: MELEE_RANGE + 20,
  attackSpeed: 1500,
  speed: 70,
  color: COLORS.BOSS,
  ai: 'boss',
  width: 56,
  height: 56,
};
