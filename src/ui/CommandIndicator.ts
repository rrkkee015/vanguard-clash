import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { Character } from '../entities/Character';
import { DEPTH, COLORS } from '../constants';

/**
 * Draws a curved arrow from a hero to their current target/destination,
 * plus a pulsing focus ring around the targeted entity.
 */
export class CommandIndicator {
  private scene: Phaser.Scene;
  private arrows: Phaser.GameObjects.Graphics;
  private focusRings: Phaser.GameObjects.Graphics;
  private pulsePhase: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.arrows = scene.add.graphics().setDepth(DEPTH.EFFECT);
    this.focusRings = scene.add.graphics().setDepth(DEPTH.EFFECT - 1);
  }

  update(heroes: Hero[], dt: number): void {
    this.arrows.clear();
    this.focusRings.clear();
    this.pulsePhase += dt * 0.004;

    for (const hero of heroes) {
      if (!hero.alive) continue;

      let tx: number | null = null;
      let ty: number | null = null;
      let targetChar: Character | null = null;
      let lineColor: number;

      if (hero.target && hero.target.alive) {
        tx = hero.target.x;
        ty = hero.target.y;
        targetChar = hero.target;

        // Color based on relationship
        const isAlly = hero.target instanceof Hero;
        lineColor = isAlly ? COLORS.COMMAND_HEAL : COLORS.COMMAND_ATTACK;
      } else if (hero.getMoveTarget()) {
        const mt = hero.getMoveTarget()!;
        tx = mt.x;
        ty = mt.y;
        lineColor = COLORS.COMMAND_MOVE;
      } else {
        continue;
      }

      // Draw straight arrow
      this.drawArrow(hero.x, hero.y, tx, ty, lineColor, hero.classDef.color);

      // Draw focus ring on target entity
      if (targetChar) {
        this.drawFocusRing(targetChar.x, targetChar.y, lineColor);
      }
    }
  }

  private drawArrow(
    x1: number, y1: number,
    x2: number, y2: number,
    color: number,
    heroColor: number,
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 20) return;

    // Straight line
    this.arrows.lineStyle(2.5, color, 0.45);
    this.arrows.beginPath();
    this.arrows.moveTo(x1, y1);
    this.arrows.lineTo(x2, y2);
    this.arrows.strokePath();

    // Circle at the end
    this.arrows.fillStyle(color, 0.6);
    this.arrows.fillCircle(x2, y2, 6);
  }

  private drawFocusRing(x: number, y: number, color: number): void {
    const pulse = Math.sin(this.pulsePhase) * 0.15 + 0.45; // 0.3 ~ 0.6
    const radius = 24 + Math.sin(this.pulsePhase * 1.3) * 3;

    // Outer ring
    this.focusRings.lineStyle(2.5, color, pulse);
    this.focusRings.strokeCircle(x, y, radius);

    // Inner glow
    this.focusRings.lineStyle(1.5, 0xffffff, pulse * 0.5);
    this.focusRings.strokeCircle(x, y, radius - 4);
  }

  destroy(): void {
    this.arrows.destroy();
    this.focusRings.destroy();
  }
}
