import { SkillDef } from '../data/SkillDefinitions';

export class Skill {
  public def: SkillDef;
  public cooldownRemaining: number = 0;

  constructor(def: SkillDef) {
    this.def = def;
  }

  isReady(): boolean {
    return this.cooldownRemaining <= 0;
  }

  startCooldown(): void {
    this.cooldownRemaining = this.def.cooldown;
  }

  updateCooldown(dt: number): void {
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
    }
  }

  getCooldownRatio(): number {
    if (this.def.cooldown <= 0) return 0;
    return this.cooldownRemaining / this.def.cooldown;
  }
}
