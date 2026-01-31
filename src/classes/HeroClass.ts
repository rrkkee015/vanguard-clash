export interface HeroClassDef {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  range: number;
  attackSpeed: number; // ms between attacks
  speed: number;
  color: number;
  skills: string[]; // skill IDs
  isHealer?: boolean;
  isRanged?: boolean;
}
