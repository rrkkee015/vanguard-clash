import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { Character, StatusEffect } from '../entities/Character';
import { CombatSystem } from './CombatSystem';
import { SkillDefs, SkillDef } from '../data/SkillDefinitions';
import { DamageNumber } from '../ui/DamageNumber';
import { distanceBetween } from '../utils/MathUtils';
import { EventBus, Events } from '../utils/EventBus';

export class SkillSystem {
  private scene: Phaser.Scene;
  private combatSystem: CombatSystem;

  constructor(scene: Phaser.Scene, combatSystem: CombatSystem) {
    this.scene = scene;
    this.combatSystem = combatSystem;
  }

  useSkill(
    hero: Hero,
    skillId: string,
    heroes: Hero[],
    enemies: Enemy[],
  ): boolean {
    const skillDef = SkillDefs[skillId];
    if (!skillDef) return false;
    if (!hero.isSkillReady(skillId)) return false;
    if (!hero.alive) return false;

    let success = false;

    switch (skillId) {
      case 'shield_bash':
        success = this.shieldBash(hero, skillDef, enemies);
        break;
      case 'taunt':
        success = this.taunt(hero, skillDef, enemies);
        break;
      case 'group_heal':
        success = this.groupHeal(hero, skillDef, heroes);
        break;
      case 'divine_shield':
        success = this.divineShield(hero, skillDef, heroes);
        break;
      case 'power_shot':
        success = this.powerShot(hero, skillDef, enemies);
        break;
      case 'multi_shot':
        success = this.multiShot(hero, skillDef, enemies);
        break;
      case 'fireball':
        success = this.fireball(hero, skillDef, enemies);
        break;
      case 'blizzard':
        success = this.blizzard(hero, skillDef, enemies);
        break;
    }

    if (success) {
      hero.startSkillCooldown(skillId, skillDef.cooldown);
      EventBus.emit(Events.SKILL_USED, { hero, skillId, skillDef });
    }

    return success;
  }

  private shieldBash(hero: Hero, skillDef: SkillDef, enemies: Enemy[]): boolean {
    const target = hero.target as Enemy;
    if (!target || !target.alive) {
      // Target nearest enemy
      const nearest = this.getNearestEnemy(hero, enemies);
      if (!nearest) return false;
      hero.target = nearest;
      return this.applySkillToTarget(hero, nearest, skillDef);
    }
    return this.applySkillToTarget(hero, target, skillDef);
  }

  private taunt(hero: Hero, skillDef: SkillDef, enemies: Enemy[]): boolean {
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0) return false;

    // Force nearby enemies to target this hero
    const range = 200;
    let taunted = 0;
    for (const enemy of aliveEnemies) {
      if (distanceBetween(hero.x, hero.y, enemy.x, enemy.y) <= range) {
        enemy.addStatusEffect({
          type: 'taunt',
          remaining: skillDef.statusEffect!.duration,
          source: hero,
        });
        enemy.target = hero;
        taunted++;
      }
    }

    // Visual effect
    this.showSkillEffect(hero.x, hero.y, skillDef.color, 200);
    return taunted > 0;
  }

  private groupHeal(hero: Hero, skillDef: SkillDef, heroes: Hero[]): boolean {
    const aliveHeroes = heroes.filter(h => h.alive);
    if (aliveHeroes.length === 0) return false;

    for (const h of aliveHeroes) {
      const healed = h.heal(skillDef.heal!);
      if (healed > 0) {
        DamageNumber.show(this.scene, h.x, h.y, healed, true);
        EventBus.emit(Events.HERO_HEALED, { target: h, amount: healed });
      }
    }

    this.showSkillEffect(hero.x, hero.y, skillDef.color, 300);
    return true;
  }

  private divineShield(hero: Hero, skillDef: SkillDef, heroes: Hero[]): boolean {
    // Shield the hero with lowest HP ratio
    const aliveHeroes = heroes.filter(h => h.alive);
    if (aliveHeroes.length === 0) return false;

    let weakest = aliveHeroes[0];
    let minRatio = 1;
    for (const h of aliveHeroes) {
      const ratio = h.currentHp / h.maxHp;
      if (ratio < minRatio) {
        minRatio = ratio;
        weakest = h;
      }
    }

    weakest.addStatusEffect({
      type: 'shield',
      remaining: skillDef.statusEffect!.duration,
      value: skillDef.statusEffect!.value,
    });

    // Visual feedback
    this.showShieldEffect(weakest);
    return true;
  }

  private powerShot(hero: Hero, skillDef: SkillDef, enemies: Enemy[]): boolean {
    const target = hero.target as Enemy ?? this.getNearestEnemy(hero, enemies);
    if (!target) return false;

    this.combatSystem.performSkillDamage(hero, target, skillDef.damage!);
    return true;
  }

  private multiShot(hero: Hero, skillDef: SkillDef, enemies: Enemy[]): boolean {
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0) return false;

    const inRange = aliveEnemies.filter(
      e => distanceBetween(hero.x, hero.y, e.x, e.y) <= (skillDef.radius ?? hero.range),
    );
    if (inRange.length === 0) return false;

    for (const enemy of inRange) {
      this.combatSystem.performSkillDamage(hero, enemy, skillDef.damage!);
    }
    return true;
  }

  private fireball(hero: Hero, skillDef: SkillDef, enemies: Enemy[]): boolean {
    const target = hero.target as Enemy ?? this.getNearestEnemy(hero, enemies);
    if (!target) return false;

    // AoE around target
    const aliveEnemies = enemies.filter(e => e.alive);
    const inRadius = aliveEnemies.filter(
      e => distanceBetween(target.x, target.y, e.x, e.y) <= (skillDef.radius ?? 120),
    );

    for (const enemy of inRadius) {
      this.combatSystem.performSkillDamage(hero, enemy, skillDef.damage!);
    }

    this.showSkillEffect(target.x, target.y, skillDef.color, skillDef.radius ?? 120);
    return inRadius.length > 0;
  }

  private blizzard(hero: Hero, skillDef: SkillDef, enemies: Enemy[]): boolean {
    const target = hero.target as Enemy ?? this.getNearestEnemy(hero, enemies);
    if (!target) return false;

    const aliveEnemies = enemies.filter(e => e.alive);
    const inRadius = aliveEnemies.filter(
      e => distanceBetween(target.x, target.y, e.x, e.y) <= (skillDef.radius ?? 150),
    );

    for (const enemy of inRadius) {
      this.combatSystem.performSkillDamage(hero, enemy, skillDef.damage!);
      if (skillDef.statusEffect) {
        enemy.addStatusEffect({
          type: skillDef.statusEffect.type,
          remaining: skillDef.statusEffect.duration,
          value: skillDef.statusEffect.value,
        });
      }
    }

    this.showSkillEffect(target.x, target.y, skillDef.color, skillDef.radius ?? 150);
    return inRadius.length > 0;
  }

  private applySkillToTarget(hero: Hero, target: Enemy, skillDef: SkillDef): boolean {
    if (skillDef.damage) {
      this.combatSystem.performSkillDamage(hero, target, skillDef.damage);
    }
    if (skillDef.statusEffect) {
      target.addStatusEffect({
        type: skillDef.statusEffect.type,
        remaining: skillDef.statusEffect.duration,
        value: skillDef.statusEffect.value,
        source: hero,
      });
    }
    return true;
  }

  private getNearestEnemy(hero: Hero, enemies: Enemy[]): Enemy | null {
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0) return null;

    let nearest = aliveEnemies[0];
    let minDist = Infinity;
    for (const e of aliveEnemies) {
      const dist = distanceBetween(hero.x, hero.y, e.x, e.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = e;
      }
    }
    return nearest;
  }

  private showSkillEffect(x: number, y: number, color: number, radius: number): void {
    const circle = this.scene.add.circle(x, y, 10, color, 0.6);
    this.scene.tweens.add({
      targets: circle,
      radius: radius,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        circle.setRadius(circle.radius);
      },
      onComplete: () => circle.destroy(),
    });
  }

  private showShieldEffect(target: Character): void {
    const shield = this.scene.add.circle(target.x, target.y, 25, 0x6688ff, 0.4);
    this.scene.tweens.add({
      targets: shield,
      alpha: 0.15,
      duration: 500,
      yoyo: true,
      repeat: 4,
      onUpdate: () => {
        shield.setPosition(target.x, target.y);
      },
      onComplete: () => shield.destroy(),
    });
  }
}
