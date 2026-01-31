import Phaser from 'phaser';
import { SKILL_BUTTON_SIZE } from '../constants';
import { SkillDef } from '../data/SkillDefinitions';

export class SkillButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private cooldownOverlay: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private cooldownText: Phaser.GameObjects.Text;
  private skillDef: SkillDef;
  private isReady: boolean = true;
  private cooldownRemaining: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, skillDef: SkillDef) {
    super(scene, x, y);
    this.skillDef = skillDef;

    const size = SKILL_BUTTON_SIZE;

    // Background
    this.bg = scene.add.graphics();
    this.bg.fillStyle(skillDef.color, 0.8);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 6);
    this.bg.lineStyle(2, 0xffffff, 0.6);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 6);
    this.add(this.bg);

    // Cooldown overlay
    this.cooldownOverlay = scene.add.graphics();
    this.add(this.cooldownOverlay);

    // Label
    this.label = scene.add.text(0, -5, skillDef.name.substring(0, 3), {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.add(this.label);

    // Cooldown text
    this.cooldownText = scene.add.text(0, 10, '', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#ffff00',
    }).setOrigin(0.5);
    this.add(this.cooldownText);

    this.setSize(size, size);
    this.setInteractive();
    scene.add.existing(this);
  }

  getSkillDef(): SkillDef {
    return this.skillDef;
  }

  getIsReady(): boolean {
    return this.isReady;
  }

  startCooldown(): void {
    this.isReady = false;
    this.cooldownRemaining = this.skillDef.cooldown;
  }

  updateCooldown(dt: number): void {
    if (this.isReady) return;

    this.cooldownRemaining -= dt;
    if (this.cooldownRemaining <= 0) {
      this.cooldownRemaining = 0;
      this.isReady = true;
      this.cooldownText.setText('');
      this.drawCooldownOverlay(0);
    } else {
      const ratio = this.cooldownRemaining / this.skillDef.cooldown;
      this.cooldownText.setText(`${Math.ceil(this.cooldownRemaining / 1000)}s`);
      this.drawCooldownOverlay(ratio);
    }
  }

  private drawCooldownOverlay(ratio: number): void {
    this.cooldownOverlay.clear();
    if (ratio <= 0) return;

    const size = SKILL_BUTTON_SIZE;
    this.cooldownOverlay.fillStyle(0x000000, 0.6);
    this.cooldownOverlay.fillRect(-size / 2, -size / 2, size, size * ratio);
  }

  destroy(fromScene?: boolean): void {
    this.bg.destroy();
    this.cooldownOverlay.destroy();
    this.label.destroy();
    this.cooldownText.destroy();
    super.destroy(fromScene);
  }
}
