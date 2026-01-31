import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Simple loading screen
    const title = this.add.text(cx, cy - 40, 'VANGUARD CLASH', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const subtitle = this.add.text(cx, cy + 20, 'Click to Start', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Blink effect
    this.tweens.add({
      targets: subtitle,
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
