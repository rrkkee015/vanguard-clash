import Phaser from 'phaser';
import { Character } from '../entities/Character';
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { DamageNumber } from '../ui/DamageNumber';
import { DAMAGE_VARIANCE_MIN, DAMAGE_VARIANCE_MAX } from '../constants';
import { randomRange, distanceBetween } from '../utils/MathUtils';
import { EventBus, Events } from '../utils/EventBus';

export class CombatSystem {
  private scene: Phaser.Scene;
  private projectiles: Projectile[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  calculateDamage(attacker: Character, defender: Character): number {
    const raw = attacker.attack - defender.defense * 0.5;
    const base = Math.max(1, raw);
    return base * randomRange(DAMAGE_VARIANCE_MIN, DAMAGE_VARIANCE_MAX);
  }

  processAutoAttack(attacker: Character, heroes: Hero[], enemies: Enemy[]): void {
    if (!attacker.alive || attacker.isStunned()) return;
    if (!attacker.target || !attacker.target.alive) {
      attacker.target = null;
      return;
    }

    const target = attacker.target;
    const dist = distanceBetween(attacker.x, attacker.y, target.x, target.y);

    // Not in range yet
    if (dist > attacker.range) return;

    // Check attack timer
    attacker.attackTimer -= this.scene.game.loop.delta;
    if (attacker.attackTimer > 0) return;

    // Reset timer
    attacker.attackTimer = attacker.attackSpeed;

    if (attacker instanceof Hero && attacker.isHealer() && target instanceof Hero) {
      // Healer heals allies
      this.performHeal(attacker, target);
    } else if (attacker.isRanged) {
      // Ranged attack - spawn projectile
      this.spawnProjectile(attacker, target);
    } else {
      // Melee attack - instant damage
      this.performMeleeAttack(attacker, target);
    }
  }

  private performMeleeAttack(attacker: Character, target: Character): void {
    const damage = this.calculateDamage(attacker, target);
    const actual = target.takeDamage(damage);

    DamageNumber.show(this.scene, target.x, target.y, actual);

    // Play attack animation
    attacker.playAttackAnim();

    this.emitDamageEvent(attacker, target, actual);

    if (!target.alive) {
      this.handleDeath(target);
    }
  }

  private performHeal(healer: Hero, target: Character): void {
    const healAmount = healer.attack; // For clerics, attack stat = heal amount
    const actual = target.heal(healAmount);

    if (healer.isRanged) {
      // Spawn heal projectile
      const proj = new Projectile(
        this.scene,
        healer.x, healer.y,
        target,
        0,
        'projectile_heal',
        true,
      );
      proj.onHit = (t: Character) => {
        const healed = t.heal(healAmount);
        if (healed > 0) {
          DamageNumber.show(this.scene, t.x, t.y, healed, true);
          EventBus.emit(Events.HERO_HEALED, { target: t, amount: healed });
        }
      };
      this.projectiles.push(proj);
    } else {
      if (actual > 0) {
        DamageNumber.show(this.scene, target.x, target.y, actual, true);
        EventBus.emit(Events.HERO_HEALED, { target, amount: actual });
      }
    }
  }

  private spawnProjectile(attacker: Character, target: Character): void {
    attacker.playAttackAnim();

    const textureKey = attacker instanceof Hero ? 'arrow' : 'projectile_enemy';
    const proj = new Projectile(
      this.scene,
      attacker.x, attacker.y,
      target,
      0,
      textureKey,
    );

    proj.onHit = (t: Character) => {
      const damage = this.calculateDamage(attacker, t);
      const actual = t.takeDamage(damage);
      DamageNumber.show(this.scene, t.x, t.y, actual);
      this.emitDamageEvent(attacker, t, actual);
      if (!t.alive) this.handleDeath(t);
    };

    this.projectiles.push(proj);
  }

  performSkillDamage(attacker: Character, target: Character, damage: number): void {
    const actual = target.takeDamage(damage);
    DamageNumber.show(this.scene, target.x, target.y, actual);
    attacker.playAttackAnim();

    this.emitDamageEvent(attacker, target, actual);
    if (!target.alive) this.handleDeath(target);
  }

  private emitDamageEvent(attacker: Character, target: Character, damage: number): void {
    if (target instanceof Hero) {
      EventBus.emit(Events.HERO_DAMAGED, { hero: target, damage, attacker });
    } else {
      EventBus.emit(Events.ENEMY_DAMAGED, { enemy: target, damage, attacker });
    }
  }

  private handleDeath(character: Character): void {
    if (character instanceof Hero) {
      EventBus.emit(Events.HERO_DIED, { hero: character });
    } else if (character instanceof Enemy) {
      EventBus.emit(Events.ENEMY_DIED, { enemy: character });
    }
  }

  updateProjectiles(time: number, dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      if (!proj.active) {
        this.projectiles.splice(i, 1);
        continue;
      }
      proj.update(time, dt);
    }
  }

  clearProjectiles(): void {
    for (const proj of this.projectiles) {
      if (proj.active) proj.destroy();
    }
    this.projectiles = [];
  }
}
