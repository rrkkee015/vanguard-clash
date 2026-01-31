import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { distanceBetween, pickRandom } from '../utils/MathUtils';

export class AISystem {
  private bossRetargetInterval: number = 5000; // ms

  update(enemies: Enemy[], heroes: Hero[], dt: number): void {
    const aliveHeroes = heroes.filter(h => h.alive);
    if (aliveHeroes.length === 0) return;

    for (const enemy of enemies) {
      if (!enemy.alive || enemy.isStunned()) continue;

      // Check taunt
      const tauntTarget = enemy.getTauntTarget();
      if (tauntTarget && tauntTarget.alive) {
        enemy.target = tauntTarget;
        continue;
      }

      // If current target is dead, clear it
      if (enemy.target && !enemy.target.alive) {
        enemy.target = null;
      }

      switch (enemy.aiType) {
        case 'melee-aggro':
          this.meleeAggroAI(enemy, aliveHeroes);
          break;
        case 'ranged-aggro':
          this.rangedAggroAI(enemy, aliveHeroes);
          break;
        case 'boss':
          this.bossAI(enemy, aliveHeroes, dt);
          break;
      }
    }
  }

  private meleeAggroAI(enemy: Enemy, heroes: Hero[]): void {
    // Target closest hero
    if (!enemy.target) {
      let closest: Hero | null = null;
      let minDist = Infinity;
      for (const hero of heroes) {
        const dist = distanceBetween(enemy.x, enemy.y, hero.x, hero.y);
        if (dist < minDist) {
          minDist = dist;
          closest = hero;
        }
      }
      enemy.target = closest;
    }
  }

  private rangedAggroAI(enemy: Enemy, heroes: Hero[]): void {
    // Target hero with lowest HP
    if (!enemy.target) {
      let weakest: Hero | null = null;
      let minHp = Infinity;
      for (const hero of heroes) {
        if (hero.currentHp < minHp) {
          minHp = hero.currentHp;
          weakest = hero;
        }
      }
      enemy.target = weakest;
    }
  }

  private bossAI(enemy: Enemy, heroes: Hero[], dt: number): void {
    enemy.aiTargetTimer -= dt;
    if (enemy.aiTargetTimer <= 0 || !enemy.target) {
      enemy.target = pickRandom(heroes);
      enemy.aiTargetTimer = this.bossRetargetInterval;
    }
  }
}
