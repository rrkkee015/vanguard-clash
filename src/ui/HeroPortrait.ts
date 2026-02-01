import Phaser from 'phaser';
import { PORTRAIT_SIZE } from '../constants';
import { HeroClassDef } from '../classes/HeroClass';

export class HeroPortrait extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private hpBar: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Sprite;
  private heroId: string;
  private classDef: HeroClassDef;
  private selected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, classDef: HeroClassDef) {
    super(scene, x, y);
    this.heroId = classDef.id;
    this.classDef = classDef;

    const size = PORTRAIT_SIZE;

    // Background (dark tone so sprite stands out)
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x222222, 0.9);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.bg.lineStyle(2, 0xffffff, 0.4);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.add(this.bg);

    // Character sprite with idle animation
    this.sprite = scene.add.sprite(0, 0, 'soldier_idle');
    this.sprite.play('soldier_idle_anim');
    this.sprite.setTint(classDef.color);
    this.sprite.setScale(2.0);
    this.add(this.sprite);

    // Clip sprite to portrait bounds using a geometry mask
    const maskShape = new Phaser.GameObjects.Graphics(scene);
    maskShape.fillStyle(0xffffff);
    maskShape.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);
    this.sprite.setMask(maskShape.createGeometryMask());

    // HP bar under portrait
    this.hpBar = scene.add.graphics();
    this.add(this.hpBar);
    this.drawHpBar(1);

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
    this.bg.fillStyle(this.selected ? 0x444444 : 0x222222, 0.9);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.bg.lineStyle(this.selected ? 3 : 2, this.selected ? 0xffff00 : 0xffffff, this.selected ? 1 : 0.4);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);

    // Brighten sprite on select (white tint), restore class color on deselect
    if (this.selected) {
      this.sprite.setTint(0xffffff);
    } else {
      this.sprite.setTint(this.classDef.color);
    }
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
    this.sprite.setAlpha(0.5);
  }

  destroy(fromScene?: boolean): void {
    this.bg.destroy();
    this.hpBar.destroy();
    this.sprite.destroy();
    super.destroy(fromScene);
  }
}
