import Phaser from 'phaser';
import { PORTRAIT_SIZE } from '../constants';
import { HeroClassDef } from '../classes/HeroClass';

export class HeroPortrait extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private hpBar: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private heroId: string;
  private selected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, classDef: HeroClassDef) {
    super(scene, x, y);
    this.heroId = classDef.id;

    const size = PORTRAIT_SIZE;

    // Background
    this.bg = scene.add.graphics();
    this.bg.fillStyle(classDef.color, 0.9);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.bg.lineStyle(2, 0xffffff, 0.4);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.add(this.bg);

    // HP bar under portrait
    this.hpBar = scene.add.graphics();
    this.add(this.hpBar);
    this.drawHpBar(1);

    // Name
    this.nameText = scene.add.text(0, -5, classDef.name.substring(0, 4), {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.add(this.nameText);

    this.setSize(size, size);
    this.setInteractive();
    scene.add.existing(this);
  }

  getHeroId(): string {
    return this.heroId;
  }

  setSelected(selected: boolean): void {
    this.selected = selected;
    this.bg.clear();
    const size = PORTRAIT_SIZE;
    this.bg.fillStyle(this.selected ? 0xffffff : 0x666666, this.selected ? 0.3 : 0);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.bg.lineStyle(this.selected ? 3 : 2, this.selected ? 0xffff00 : 0xffffff, this.selected ? 1 : 0.4);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
  }

  updateHp(ratio: number): void {
    this.drawHpBar(ratio);
  }

  private drawHpBar(ratio: number): void {
    this.hpBar.clear();
    const size = PORTRAIT_SIZE;
    const barH = 5;
    const y = size / 2 + 2;

    this.hpBar.fillStyle(0x333333, 0.8);
    this.hpBar.fillRect(-size / 2, y, size, barH);

    const color = ratio > 0.6 ? 0x44ff44 : ratio > 0.3 ? 0xffff00 : 0xff2222;
    this.hpBar.fillStyle(color, 1);
    this.hpBar.fillRect(-size / 2, y, size * ratio, barH);
  }

  setDead(): void {
    this.setAlpha(0.3);
    this.nameText.setColor('#888888');
  }

  destroy(fromScene?: boolean): void {
    this.bg.destroy();
    this.hpBar.destroy();
    this.nameText.destroy();
    super.destroy(fromScene);
  }
}
