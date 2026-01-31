import { SKILL_COOLDOWNS, STATUS_DURATIONS } from '../constants';

export type SkillTargetType = 'enemy' | 'ally' | 'self' | 'all-allies' | 'aoe-enemy';

export interface SkillDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  targetType: SkillTargetType;
  damage?: number;
  heal?: number;
  radius?: number; // for AoE
  statusEffect?: {
    type: 'stun' | 'slow' | 'shield' | 'taunt';
    duration: number;
    value?: number; // shield amount or slow factor
  };
  color: number;
}

export const SkillDefs: Record<string, SkillDef> = {
  shield_bash: {
    id: 'shield_bash',
    name: 'Shield Bash',
    description: 'Stuns target enemy for 2s',
    cooldown: SKILL_COOLDOWNS.SHIELD_BASH,
    targetType: 'enemy',
    damage: 40,
    statusEffect: { type: 'stun', duration: STATUS_DURATIONS.STUN },
    color: 0x4488ff,
  },
  taunt: {
    id: 'taunt',
    name: 'Taunt',
    description: 'Forces nearby enemies to target Knight for 3s',
    cooldown: SKILL_COOLDOWNS.TAUNT,
    targetType: 'self',
    statusEffect: { type: 'taunt', duration: STATUS_DURATIONS.TAUNT },
    color: 0xff8800,
  },
  group_heal: {
    id: 'group_heal',
    name: 'Group Heal',
    description: 'Heals all allies for 80 HP',
    cooldown: SKILL_COOLDOWNS.GROUP_HEAL,
    targetType: 'all-allies',
    heal: 80,
    color: 0x44ff44,
  },
  divine_shield: {
    id: 'divine_shield',
    name: 'Divine Shield',
    description: 'Shields target ally for 100 damage for 5s',
    cooldown: SKILL_COOLDOWNS.DIVINE_SHIELD,
    targetType: 'ally',
    statusEffect: { type: 'shield', duration: STATUS_DURATIONS.SHIELD, value: 100 },
    color: 0x6688ff,
  },
  power_shot: {
    id: 'power_shot',
    name: 'Power Shot',
    description: 'Deals 3x damage to target',
    cooldown: SKILL_COOLDOWNS.POWER_SHOT,
    targetType: 'enemy',
    damage: 105, // 35 * 3
    color: 0x44cc44,
  },
  multi_shot: {
    id: 'multi_shot',
    name: 'Multi Shot',
    description: 'Hits all enemies in range for 70% damage',
    cooldown: SKILL_COOLDOWNS.MULTI_SHOT,
    targetType: 'aoe-enemy',
    damage: 25, // 35 * 0.7
    radius: 350,
    color: 0x88ff88,
  },
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    description: 'AoE fire damage in area',
    cooldown: SKILL_COOLDOWNS.FIREBALL,
    targetType: 'aoe-enemy',
    damage: 60,
    radius: 120,
    color: 0xff4400,
  },
  blizzard: {
    id: 'blizzard',
    name: 'Blizzard',
    description: 'Slows and damages enemies in area',
    cooldown: SKILL_COOLDOWNS.BLIZZARD,
    targetType: 'aoe-enemy',
    damage: 30,
    radius: 150,
    statusEffect: { type: 'slow', duration: STATUS_DURATIONS.SLOW, value: 0.5 },
    color: 0x88ccff,
  },
};
