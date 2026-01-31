import { SkillDefs, SkillDef } from '../data/SkillDefinitions';

export function getSkillDef(id: string): SkillDef | undefined {
  return SkillDefs[id];
}

export function getAllSkillIds(): string[] {
  return Object.keys(SkillDefs);
}
