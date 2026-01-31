import Phaser from 'phaser';
import { HealthBar } from '../ui/HealthBar';
import { DEPTH, ARRIVAL_THRESHOLD, HEALTH_BAR_OFFSET_Y } from '../constants';
import { distanceBetween } from '../utils/MathUtils';

export interface StatusEffect {
  type: 'stun' | 'slow' | 'shield' | 'taunt';
  remaining: number;
  value?: number; // shield HP or slow factor
  source?: Character; // for taunt
}

export type AnimState = 'idle' | 'walk' | 'attack' | 'hurt' | 'death';

export class Character extends Phaser.GameObjects.Container {
  // Stats
  public maxHp: number;
  public currentHp: number;
  public attack: number;
  public defense: number;
  public range: number;
  public attackSpeed: number;
  public speed: number;
  public baseSpeed: number;
  public isRanged: boolean;

  // State
  public alive: boolean = true;
  public target: Character | null = null;
  public attackTimer: number = 0;
  public statusEffects: StatusEffect[] = [];
  public shieldAmount: number = 0;

  // Components
  public sprite: Phaser.GameObjects.Sprite;
  public healthBar: HealthBar;
  protected nameText: Phaser.GameObjects.Text;

  // Animation
  protected animPrefix: string; // 'soldier' or 'orc'
  protected currentAnim: AnimState = 'idle';
  private wasMoving: boolean = false;

  // Movement
  protected moveTarget: { x: number; y: number } | null = null;
  protected isMoving: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    textureKey: string,
    name: string,
    stats: {
      hp: number; attack: number; defense: number;
      range: number; attackSpeed: number; speed: number;
      isRanged?: boolean;
    },
    animPrefix: string = 'soldier',
  ) {
    super(scene, x, y);

    this.maxHp = stats.hp;
    this.currentHp = stats.hp;
    this.attack = stats.attack;
    this.defense = stats.defense;
    this.range = stats.range;
    this.attackSpeed = stats.attackSpeed;
    this.speed = stats.speed;
    this.baseSpeed = stats.speed;
    this.isRanged = stats.isRanged ?? false;
    this.animPrefix = animPrefix;

    // Sprite (now animated)
    this.sprite = scene.add.sprite(0, 0, `${animPrefix}_idle`);
    this.sprite.setScale(2);
    this.add(this.sprite);

    // Play idle animation
    this.playAnim('idle');

    // Name
    this.nameText = scene.add.text(0, -70, name, {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.add(this.nameText);

    // Health bar
    this.healthBar = new HealthBar(scene, this, -55, 60, 6);

    this.setDepth(DEPTH.ENTITY);
    this.setSize(100, 100);

    scene.add.existing(this);
  }

  playAnim(state: AnimState, force: boolean = false): void {
    if (this.currentAnim === state && !force) return;
    // Don't interrupt death
    if (this.currentAnim === 'death') return;
    // Don't interrupt attack/hurt with idle/walk
    if ((this.currentAnim === 'attack' || this.currentAnim === 'hurt')
      && (state === 'idle' || state === 'walk')
      && this.sprite.anims.isPlaying) return;

    this.currentAnim = state;
    const key = `${this.animPrefix}_${state}_anim`;
    this.sprite.play(key, true);
  }

  takeDamage(amount: number): number {
    if (!this.alive) return 0;

    // Shield absorbs damage first
    if (this.shieldAmount > 0) {
      if (this.shieldAmount >= amount) {
        this.shieldAmount -= amount;
        return 0;
      }
      amount -= this.shieldAmount;
      this.shieldAmount = 0;
      this.statusEffects = this.statusEffects.filter(e => e.type !== 'shield');
    }

    this.currentHp = Math.max(0, this.currentHp - amount);
    this.healthBar.setRatio(this.currentHp / this.maxHp);

    if (this.currentHp <= 0) {
      this.die();
    } else {
      this.playAnim('hurt', true);
      // Return to idle after hurt
      this.sprite.once('animationcomplete', () => {
        if (this.alive && this.currentAnim === 'hurt') {
          this.currentAnim = 'idle'; // reset so next playAnim works
          this.updateAnimState();
        }
      });
    }

    return amount;
  }

  heal(amount: number): number {
    if (!this.alive) return 0;
    const before = this.currentHp;
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    this.healthBar.setRatio(this.currentHp / this.maxHp);
    return this.currentHp - before;
  }

  die(): void {
    this.alive = false;
    this.target = null;
    this.moveTarget = null;
    this.currentAnim = 'idle'; // reset to allow death anim
    this.playAnim('death', true);
    this.sprite.once('animationcomplete', () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.setActive(false);
          this.setVisible(false);
        },
      });
    });
  }

  /** Play attack animation, returns to idle/walk when done */
  playAttackAnim(): void {
    this.playAnim('attack', true);
    this.sprite.once('animationcomplete', () => {
      if (this.alive && this.currentAnim === 'attack') {
        this.currentAnim = 'idle'; // reset
        this.updateAnimState();
      }
    });
  }

  isStunned(): boolean {
    return this.statusEffects.some(e => e.type === 'stun');
  }

  getSlowFactor(): number {
    const slow = this.statusEffects.find(e => e.type === 'slow');
    return slow?.value ?? 1;
  }

  getMoveTarget(): { x: number; y: number } | null {
    return this.moveTarget;
  }

  getTauntTarget(): Character | null {
    const taunt = this.statusEffects.find(e => e.type === 'taunt');
    return taunt?.source ?? null;
  }

  addStatusEffect(effect: StatusEffect): void {
    this.statusEffects = this.statusEffects.filter(e => e.type !== effect.type);
    this.statusEffects.push({ ...effect });

    if (effect.type === 'shield') {
      this.shieldAmount = effect.value ?? 0;
    }
    if (effect.type === 'slow') {
      this.speed = this.baseSpeed * (effect.value ?? 0.5);
    }
  }

  updateStatusEffects(dt: number): void {
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      this.statusEffects[i].remaining -= dt;
      if (this.statusEffects[i].remaining <= 0) {
        const removed = this.statusEffects.splice(i, 1)[0];
        if (removed.type === 'slow') {
          this.speed = this.baseSpeed;
        }
        if (removed.type === 'shield') {
          this.shieldAmount = 0;
        }
      }
    }
  }

  commandMoveTo(x: number, y: number): void {
    this.moveTarget = { x, y };
    this.target = null;
    this.isMoving = true;
  }

  commandAttack(target: Character): void {
    this.target = target;
    this.moveTarget = null;
  }

  stopMoving(): void {
    this.moveTarget = null;
    this.isMoving = false;
  }

  updateMovement(dt: number): void {
    if (!this.alive || this.isStunned()) return;

    let moving = false;

    // Move toward target character
    if (this.target && this.target.alive) {
      const dist = distanceBetween(this.x, this.y, this.target.x, this.target.y);
      if (dist > this.range) {
        this.moveToward(this.target.x, this.target.y, dt);
        moving = true;
      }
    } else if (this.moveTarget) {
      // Move toward position
      const dist = distanceBetween(this.x, this.y, this.moveTarget.x, this.moveTarget.y);
      if (dist <= ARRIVAL_THRESHOLD) {
        this.moveTarget = null;
        this.isMoving = false;
      } else {
        this.moveToward(this.moveTarget.x, this.moveTarget.y, dt);
        moving = true;
      }
    }

    // Update walk/idle animation based on movement
    if (moving !== this.wasMoving) {
      this.wasMoving = moving;
      this.updateAnimState();
    }
  }

  protected updateAnimState(): void {
    if (this.currentAnim === 'attack' || this.currentAnim === 'hurt' || this.currentAnim === 'death') return;
    if (this.wasMoving) {
      this.playAnim('walk');
    } else {
      this.playAnim('idle');
    }
  }

  protected moveToward(tx: number, ty: number, dt: number): void {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const effectiveSpeed = this.speed * this.getSlowFactor();
    const step = effectiveSpeed * (dt / 1000);
    const ratio = Math.min(step / dist, 1);

    this.x += dx * ratio;
    this.y += dy * ratio;

    // Flip sprite based on direction
    this.sprite.setFlipX(dx < 0);
  }

  isInRange(other: Character): boolean {
    return distanceBetween(this.x, this.y, other.x, other.y) <= this.range;
  }

  update(_time: number, dt: number): void {
    if (!this.alive) return;
    this.updateStatusEffects(dt);
    this.healthBar.update(dt);
    this.updateMovement(dt);
  }
}
