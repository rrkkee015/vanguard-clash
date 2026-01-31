import { EnemyDef, GoblinDef, GoblinArcherDef, OrcDef, OrcShamanDef, TrollBossDef } from './EnemyDefinitions';

export interface WaveEntry {
  enemy: EnemyDef;
  count: number;
}

export interface WaveDef {
  id: number;
  name: string;
  entries: WaveEntry[];
}

export const WAVES: WaveDef[] = [
  {
    id: 1,
    name: 'Wave 1 - Goblin Scouts',
    entries: [
      { enemy: GoblinDef, count: 4 },
    ],
  },
  {
    id: 2,
    name: 'Wave 2 - Goblin Raiders',
    entries: [
      { enemy: GoblinDef, count: 3 },
      { enemy: GoblinArcherDef, count: 2 },
    ],
  },
  {
    id: 3,
    name: 'Wave 3 - Orc Vanguard',
    entries: [
      { enemy: OrcDef, count: 3 },
      { enemy: GoblinArcherDef, count: 2 },
    ],
  },
  {
    id: 4,
    name: 'Wave 4 - Orc Warband',
    entries: [
      { enemy: OrcDef, count: 2 },
      { enemy: OrcShamanDef, count: 2 },
      { enemy: GoblinDef, count: 3 },
    ],
  },
  {
    id: 5,
    name: 'Wave 5 - Troll Warlord',
    entries: [
      { enemy: TrollBossDef, count: 1 },
      { enemy: OrcDef, count: 2 },
      { enemy: OrcShamanDef, count: 1 },
    ],
  },
];
