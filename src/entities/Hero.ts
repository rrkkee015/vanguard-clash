import Phaser from 'phaser';
import { Character } from './Character';
import { HeroClassDef } from '../classes/HeroClass';
import { HERO_SPEED } from '../constants';

export class Hero extends Character {
  public classDef: HeroClassDef;
  public heroIndex: number;
  public selected: boolean = false;
  public skillCooldowns: Map<string, number> = new Map();

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    classDef: HeroClassDef,
    heroIndex: number,
  ) {
    super(scene, x, y, 'soldier_idle', classDef.name, {
      hp: classDef.hp,
      attack: classDef.attack,
      defense: classDef.defense,
      range: classDef.range,
      attackSpeed: classDef.attackSpeed,
      speed: classDef.speed || HERO_SPEED,
      isRanged: classDef.isRanged,
    }, 'soldier');

    // Tint by class color to distinguish heroes
    this.sprite.setTint(classDef.color);

    this.classDef = classDef;
    this.heroIndex = heroIndex;

    // Initialize skill cooldowns
    for (const skillId of classDef.skills) {
      this.skillCooldowns.set(skillId, 0);
    }
  }

  isHealer(): boolean {
    return this.classDef.isHealer ?? false;
  }

  commandHeal(target: Character): void {
    this.target = target;
    this.moveTarget = null;
  }

  select(): void {
    this.selected = true;
    this.sprite.setTint(0xffffff); // bright white = selected
  }

  deselect(): void {
    this.selected = false;
    this.sprite.setTint(this.classDef.color); // restore class color
  }

  isSkillReady(skillId: string): boolean {
    return (this.skillCooldowns.get(skillId) ?? 0) <= 0;
  }

  startSkillCooldown(skillId: string, cooldown: number): void {
    this.skillCooldowns.set(skillId, cooldown);
  }

  updateSkillCooldowns(dt: number): void {
    for (const [id, remaining] of this.skillCooldowns) {
      if (remaining > 0) {
        this.skillCooldowns.set(id, Math.max(0, remaining - dt));
      }
    }
  }

  update(time: number, dt: number): void {
    super.update(time, dt);
    if (this.alive) {
      this.updateSkillCooldowns(dt);
    }
  }
}
