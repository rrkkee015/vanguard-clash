import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { WAVES, WaveDef } from '../data/WaveDefinitions';
import { EnemyDef } from '../data/EnemyDefinitions';
import { ENEMY_SPAWN_X, ENEMY_MIN_Y, ENEMY_MAX_Y, WAVE_DELAY, SPAWN_STAGGER } from '../constants';
import { randomRange } from '../utils/MathUtils';
import { EventBus, Events } from '../utils/EventBus';

export class WaveSystem {
  private scene: Phaser.Scene;
  private currentWaveIndex: number = 0;
  private enemies: Enemy[] = [];
  private spawnQueue: EnemyDef[] = [];
  private spawnTimer: number = 0;
  private waveActive: boolean = false;
  private betweenWaves: boolean = false;
  private betweenWaveTimer: number = 0;
  private onEnemySpawned: (enemy: Enemy) => void;

  constructor(scene: Phaser.Scene, onEnemySpawned: (enemy: Enemy) => void) {
    this.scene = scene;
    this.onEnemySpawned = onEnemySpawned;
  }

  getCurrentWave(): number {
    return this.currentWaveIndex + 1;
  }

  getTotalWaves(): number {
    return WAVES.length;
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  startNextWave(): void {
    if (this.currentWaveIndex >= WAVES.length) {
      EventBus.emit(Events.ALL_WAVES_CLEAR);
      return;
    }

    const wave = WAVES[this.currentWaveIndex];
    this.spawnQueue = [];

    for (const entry of wave.entries) {
      for (let i = 0; i < entry.count; i++) {
        this.spawnQueue.push(entry.enemy);
      }
    }

    this.waveActive = true;
    this.spawnTimer = 0;
    EventBus.emit(Events.WAVE_START, {
      wave: this.currentWaveIndex + 1,
      total: WAVES.length,
      name: wave.name,
    });
  }

  update(dt: number): void {
    // Between waves delay
    if (this.betweenWaves) {
      this.betweenWaveTimer -= dt;
      if (this.betweenWaveTimer <= 0) {
        this.betweenWaves = false;
        this.startNextWave();
      }
      return;
    }

    // Spawn enemies from queue
    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const def = this.spawnQueue.shift()!;
        this.spawnEnemy(def);
        this.spawnTimer = SPAWN_STAGGER;
      }
    }

    // Check wave clear
    if (this.waveActive && this.spawnQueue.length === 0) {
      const allDead = this.enemies.every(e => !e.alive);
      if (allDead) {
        this.waveActive = false;
        this.currentWaveIndex++;
        this.enemies = [];

        if (this.currentWaveIndex >= WAVES.length) {
          EventBus.emit(Events.ALL_WAVES_CLEAR);
        } else {
          EventBus.emit(Events.WAVE_CLEAR, { wave: this.currentWaveIndex });
          this.betweenWaves = true;
          this.betweenWaveTimer = WAVE_DELAY;
        }
      }
    }
  }

  private spawnEnemy(def: EnemyDef): void {
    const y = randomRange(ENEMY_MIN_Y, ENEMY_MAX_Y);
    const targetX = randomRange(900, 1150);
    const enemy = new Enemy(this.scene, ENEMY_SPAWN_X, y, def);
    this.enemies.push(enemy);

    // Entrance animation: slide in from right
    enemy.setAlpha(0);
    this.scene.tweens.add({
      targets: enemy,
      x: targetX,
      alpha: 1,
      duration: 500,
      ease: 'Cubic.easeOut',
    });

    this.onEnemySpawned(enemy);
  }

  clearAll(): void {
    for (const enemy of this.enemies) {
      if (enemy.alive) {
        enemy.die();
      }
    }
    this.enemies = [];
    this.spawnQueue = [];
    this.waveActive = false;
  }
}
