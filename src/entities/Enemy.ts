import Phaser from 'phaser';
import { Character } from './Character';
import { EnemyDef } from '../data/EnemyDefinitions';
import { ENEMY_SPEED } from '../constants';

export class Enemy extends Character {
  public enemyDef: EnemyDef;
  public aiType: 'melee-aggro' | 'ranged-aggro' | 'boss';
  public aiTargetTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    enemyDef: EnemyDef,
  ) {
    super(scene, x, y, 'orc_idle', enemyDef.name, {
      hp: enemyDef.hp,
      attack: enemyDef.attack,
      defense: enemyDef.defense,
      range: enemyDef.range,
      attackSpeed: enemyDef.attackSpeed,
      speed: enemyDef.speed || ENEMY_SPEED,
      isRanged: enemyDef.isRanged,
    }, 'orc');

    this.enemyDef = enemyDef;
    this.aiType = enemyDef.ai;

    // Tint by enemy color
    this.sprite.setTint(enemyDef.color);

    // Boss is larger
    if (enemyDef.id === 'troll_boss') {
      this.sprite.setScale(3);
    }

    // Enemies face left
    this.sprite.setFlipX(true);
  }

  update(time: number, dt: number): void {
    super.update(time, dt);
  }
}
