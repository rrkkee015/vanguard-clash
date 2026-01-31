import Phaser from 'phaser';
import { HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, COLORS } from '../constants';

export class HealthBar {
  private bar: Phaser.GameObjects.Graphics;
  private width: number;
  private height: number;
  private displayedRatio: number = 1;
  private targetRatio: number = 1;

  constructor(
    scene: Phaser.Scene,
    public parent: Phaser.GameObjects.Container,
    offsetY: number = -30,
    width: number = HEALTH_BAR_WIDTH,
    height: number = HEALTH_BAR_HEIGHT,
  ) {
    this.width = width;
    this.height = height;
    this.bar = scene.add.graphics();
    parent.add(this.bar);
    this.bar.setPosition(-this.width / 2, offsetY);
    this.draw();
  }

  setRatio(ratio: number): void {
    this.targetRatio = Phaser.Math.Clamp(ratio, 0, 1);
  }

  update(_dt: number): void {
    // Smooth transition
    if (Math.abs(this.displayedRatio - this.targetRatio) > 0.001) {
      this.displayedRatio = Phaser.Math.Linear(this.displayedRatio, this.targetRatio, 0.15);
      this.draw();
    }
  }

  private draw(): void {
    this.bar.clear();

    // Background
    this.bar.fillStyle(COLORS.HEALTH_BG, 0.8);
    this.bar.fillRect(0, 0, this.width, this.height);

    // Health fill
    const fillColor =
      this.displayedRatio > 0.6 ? COLORS.HEALTH_GREEN :
      this.displayedRatio > 0.3 ? COLORS.HEALTH_YELLOW :
      COLORS.HEALTH_RED;

    this.bar.fillStyle(fillColor, 1);
    this.bar.fillRect(0, 0, this.width * this.displayedRatio, this.height);
  }

  destroy(): void {
    this.bar.destroy();
  }
}
