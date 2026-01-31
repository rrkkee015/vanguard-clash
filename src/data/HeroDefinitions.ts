import { HeroClassDef } from '../classes/HeroClass';
import { COLORS, MELEE_RANGE } from '../constants';

export const KnightDef: HeroClassDef = {
  id: 'knight',
  name: 'Knight',
  hp: 500,
  attack: 25,
  defense: 15,
  range: MELEE_RANGE,
  attackSpeed: 1000,
  speed: 140,
  color: COLORS.KNIGHT,
  skills: ['shield_bash', 'taunt'],
  isRanged: false,
};

export const ClericDef: HeroClassDef = {
  id: 'cleric',
  name: 'Cleric',
  hp: 300,
  attack: 30,
  defense: 8,
  range: 200,
  attackSpeed: 1200,
  speed: 120,
  color: COLORS.CLERIC,
  skills: ['group_heal', 'divine_shield'],
  isHealer: true,
  isRanged: true,
};

export const ArcherDef: HeroClassDef = {
  id: 'archer',
  name: 'Archer',
  hp: 350,
  attack: 35,
  defense: 6,
  range: 350,
  attackSpeed: 900,
  speed: 130,
  color: COLORS.ARCHER,
  skills: ['power_shot', 'multi_shot'],
  isRanged: true,
};

export const WizardDef: HeroClassDef = {
  id: 'wizard',
  name: 'Wizard',
  hp: 280,
  attack: 40,
  defense: 5,
  range: 300,
  attackSpeed: 1100,
  speed: 110,
  color: COLORS.WIZARD,
  skills: ['fireball', 'blizzard'],
  isRanged: true,
};

export const ALL_HEROES: HeroClassDef[] = [KnightDef, ClericDef, ArcherDef, WizardDef];
