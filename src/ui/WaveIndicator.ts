import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants';

export class WaveIndicator {
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(GAME_WIDTH / 2, 30, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
  }

  setWave(current: number, total: number): void {
    this.text.setText(`Wave ${current}/${total}`);
  }

  showMessage(msg: string, duration: number = 2000): void {
    this.text.setText(msg);
    this.text.setAlpha(1);
    this.text.scene.tweens.add({
      targets: this.text,
      alpha: 0,
      delay: duration - 500,
      duration: 500,
    });
  }

  destroy(): void {
    this.text.destroy();
  }
}
