import Phaser from 'phaser';
import { DEPTH } from '../constants';

export class DamageNumber {
  static show(
    scene: Phaser.Scene,
    x: number, y: number,
    amount: number,
    isHeal: boolean = false,
  ): void {
    const color = isHeal ? '#44ff44' : '#ff4444';
    const prefix = isHeal ? '+' : '';
    const text = scene.add.text(x, y - 20, `${prefix}${Math.round(amount)}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(DEPTH.UI);

    scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }
}
