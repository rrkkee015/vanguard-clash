import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class DefeatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DefeatScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x3a1a1a);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.text(cx, cy - 80, 'DEFEATED', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '64px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(cx, cy, 'All heroes have fallen...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const restartText = this.add.text(cx, cy + 80, 'Click to Try Again', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.input.once('pointerdown', () => {
      this.scene.start('BattleScene');
    });
  }
}
