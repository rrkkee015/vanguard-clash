import Phaser from 'phaser';
import { COMMAND_LINE_ALPHA, DEPTH, COLORS } from '../constants';

export class CommandLine {
  private graphics: Phaser.GameObjects.Graphics;
  private visible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(DEPTH.COMMAND_LINE);
  }

  show(
    startX: number, startY: number,
    endX: number, endY: number,
    type: 'attack' | 'heal' | 'move',
  ): void {
    this.visible = true;
    const color =
      type === 'attack' ? COLORS.COMMAND_ATTACK :
      type === 'heal' ? COLORS.COMMAND_HEAL :
      COLORS.COMMAND_MOVE;

    this.graphics.clear();
    this.graphics.lineStyle(3, color, COMMAND_LINE_ALPHA);
    this.graphics.beginPath();
    this.graphics.moveTo(startX, startY);
    this.graphics.lineTo(endX, endY);
    this.graphics.strokePath();

    // Draw arrowhead
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowSize = 12;
    this.graphics.fillStyle(color, COMMAND_LINE_ALPHA);
    this.graphics.fillTriangle(
      endX,
      endY,
      endX - arrowSize * Math.cos(angle - 0.4),
      endY - arrowSize * Math.sin(angle - 0.4),
      endX - arrowSize * Math.cos(angle + 0.4),
      endY - arrowSize * Math.sin(angle + 0.4),
    );
  }

  hide(): void {
    if (this.visible) {
      this.graphics.clear();
      this.visible = false;
    }
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
