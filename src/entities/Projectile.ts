import Phaser from 'phaser';
import { Character } from './Character';
import { PROJECTILE_SPEED, DEPTH } from '../constants';
import { distanceBetween, angleBetween } from '../utils/MathUtils';

export class Projectile extends Phaser.GameObjects.Image {
  public target: Character;
  public damage: number;
  public speed: number;
  public isHeal: boolean;
  public onHit?: (target: Character) => void;
  private active_: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    target: Character,
    damage: number,
    textureKey: string = 'projectile',
    isHeal: boolean = false,
    speed: number = PROJECTILE_SPEED,
  ) {
    super(scene, x, y, textureKey);

    this.target = target;
    this.damage = damage;
    this.speed = speed;
    this.isHeal = isHeal;

    this.setDepth(DEPTH.PROJECTILE);
    scene.add.existing(this);
  }

  update(_time: number, dt: number): void {
    if (!this.active_) return;

    if (!this.target || !this.target.alive) {
      this.destroy_();
      return;
    }

    const dist = distanceBetween(this.x, this.y, this.target.x, this.target.y);
    if (dist < 15) {
      // Hit target
      if (this.onHit) {
        this.onHit(this.target);
      }
      this.destroy_();
      return;
    }

    // Move toward target
    const angle = angleBetween(this.x, this.y, this.target.x, this.target.y);
    const step = this.speed * (dt / 1000);
    this.x += Math.cos(angle) * step;
    this.y += Math.sin(angle) * step;
    this.setRotation(angle);
  }

  private destroy_(): void {
    this.active_ = false;
    this.destroy();
  }
}
