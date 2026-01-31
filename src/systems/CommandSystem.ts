import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { distanceBetween } from '../utils/MathUtils';
import { EventBus, Events } from '../utils/EventBus';

export class CommandSystem {
  private scene: Phaser.Scene;
  private heroes: Hero[];
  private enemies: Enemy[];
  private selectedHero: Hero | null = null;

  constructor(scene: Phaser.Scene, heroes: Hero[], enemies: Enemy[]) {
    this.scene = scene;
    this.heroes = heroes;
    this.enemies = enemies;

    this.scene.input.on('pointerup', this.onPointerUp, this);
  }

  getSelectedHero(): Hero | null {
    return this.selectedHero;
  }

  setEnemies(enemies: Enemy[]): void {
    this.enemies = enemies;
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    const x = pointer.x;
    const y = pointer.y;

    const clickedHero = this.getHeroAt(x, y);

    // If a healer is selected and clicked a different ally → heal, not select
    if (clickedHero && this.selectedHero && this.selectedHero.alive
      && this.selectedHero.isHealer() && clickedHero !== this.selectedHero && clickedHero.alive) {
      this.selectedHero.commandHeal(clickedHero);
      EventBus.emit(Events.COMMAND_ISSUED, { hero: this.selectedHero, type: 'heal', target: clickedHero });
      return;
    }

    // Clicked on a hero? → select it
    if (clickedHero) {
      this.selectHero(clickedHero);
      return;
    }

    // No hero selected → nothing to command
    if (!this.selectedHero || !this.selectedHero.alive) return;

    // Clicked on enemy → attack
    const enemy = this.getEnemyAt(x, y);
    if (enemy && enemy.alive) {
      this.selectedHero.commandAttack(enemy);
      EventBus.emit(Events.COMMAND_ISSUED, { hero: this.selectedHero, type: 'attack', target: enemy });
      return;
    }

    // Clicked on empty ground → move
    this.selectedHero.commandMoveTo(x, y);
    EventBus.emit(Events.COMMAND_ISSUED, { hero: this.selectedHero, type: 'move', x, y });
  }

  private selectHero(hero: Hero): void {
    if (this.selectedHero) {
      this.selectedHero.deselect();
      EventBus.emit(Events.HERO_DESELECTED, { hero: this.selectedHero });
    }

    if (this.selectedHero === hero) {
      this.selectedHero = null;
      return;
    }

    this.selectedHero = hero;
    hero.select();
    EventBus.emit(Events.HERO_SELECTED, { hero });
  }

  selectHeroById(heroId: string): void {
    const hero = this.heroes.find(h => h.classDef.id === heroId && h.alive);
    if (hero) {
      this.selectHero(hero);
    }
  }

  private getHeroAt(x: number, y: number): Hero | null {
    for (const hero of this.heroes) {
      if (!hero.alive) continue;
      if (distanceBetween(x, y, hero.x, hero.y) < 30) return hero;
    }
    return null;
  }

  private getEnemyAt(x: number, y: number): Enemy | null {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      if (distanceBetween(x, y, enemy.x, enemy.y) < 30) return enemy;
    }
    return null;
  }

  destroy(): void {
    this.scene.input.off('pointerup', this.onPointerUp, this);
  }
}
