import Phaser from 'phaser';
import { createCircleTexture } from '../utils/AnimationHelper';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const frameW = 100;
    const frameH = 100;

    // Soldier spritesheets (used for all 4 heroes)
    this.load.spritesheet('soldier_idle', 'assets/sprites/soldier/idle.png', { frameWidth: frameW, frameHeight: frameH });
    this.load.spritesheet('soldier_walk', 'assets/sprites/soldier/walk.png', { frameWidth: frameW, frameHeight: frameH });
    this.load.spritesheet('soldier_attack', 'assets/sprites/soldier/attack.png', { frameWidth: frameW, frameHeight: frameH });
    this.load.spritesheet('soldier_hurt', 'assets/sprites/soldier/hurt.png', { frameWidth: frameW, frameHeight: frameH });
    this.load.spritesheet('soldier_death', 'assets/sprites/soldier/death.png', { frameWidth: frameW, frameHeight: frameH });

    // Orc spritesheets (used for all enemies)
    this.load.spritesheet('orc_idle', 'assets/sprites/orc/idle.png', { frameWidth: frameW, frameHeight: frameH });
    this.load.spritesheet('orc_walk', 'assets/sprites/orc/walk.png', { frameWidth: frameW, frameHeight: frameH });
    this.load.spritesheet('orc_attack', 'assets/sprites/orc/attack.png', { frameWidth: frameW, frameHeight: frameH });
    this.load.spritesheet('orc_hurt', 'assets/sprites/orc/hurt.png', { frameWidth: frameW, frameHeight: frameH });
    this.load.spritesheet('orc_death', 'assets/sprites/orc/death.png', { frameWidth: frameW, frameHeight: frameH });

    // Arrow projectile
    this.load.image('arrow', 'assets/sprites/arrow/arrow.png');
  }

  create(): void {
    // --- Soldier animations (heroes) ---
    this.anims.create({ key: 'soldier_idle_anim', frames: this.anims.generateFrameNumbers('soldier_idle', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'soldier_walk_anim', frames: this.anims.generateFrameNumbers('soldier_walk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'soldier_attack_anim', frames: this.anims.generateFrameNumbers('soldier_attack', { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
    this.anims.create({ key: 'soldier_hurt_anim', frames: this.anims.generateFrameNumbers('soldier_hurt', { start: 0, end: 3 }), frameRate: 10, repeat: 0 });
    this.anims.create({ key: 'soldier_death_anim', frames: this.anims.generateFrameNumbers('soldier_death', { start: 0, end: 3 }), frameRate: 8, repeat: 0 });

    // --- Orc animations (enemies) ---
    this.anims.create({ key: 'orc_idle_anim', frames: this.anims.generateFrameNumbers('orc_idle', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'orc_walk_anim', frames: this.anims.generateFrameNumbers('orc_walk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'orc_attack_anim', frames: this.anims.generateFrameNumbers('orc_attack', { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
    this.anims.create({ key: 'orc_hurt_anim', frames: this.anims.generateFrameNumbers('orc_hurt', { start: 0, end: 3 }), frameRate: 10, repeat: 0 });
    this.anims.create({ key: 'orc_death_anim', frames: this.anims.generateFrameNumbers('orc_death', { start: 0, end: 3 }), frameRate: 8, repeat: 0 });

    // Projectile textures (keep generated)
    createCircleTexture(this, 'projectile_hero', 5, 0xffffff);
    createCircleTexture(this, 'projectile_enemy', 5, 0xff4444);
    createCircleTexture(this, 'projectile_heal', 5, 0x44ff44);
    createCircleTexture(this, 'projectile', 5, 0xffff00);

    this.scene.start('PreloadScene');
  }
}
