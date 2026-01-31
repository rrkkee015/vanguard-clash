import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { CombatSystem } from '../systems/CombatSystem';
import { CommandSystem } from '../systems/CommandSystem';
import { AISystem } from '../systems/AISystem';
import { WaveSystem } from '../systems/WaveSystem';
import { SkillSystem } from '../systems/SkillSystem';
import { ALL_HEROES } from '../data/HeroDefinitions';
import { CommandIndicator } from '../ui/CommandIndicator';
import { GAME_WIDTH, GAME_HEIGHT, HERO_POSITIONS, DEPTH } from '../constants';
import { EventBus, Events } from '../utils/EventBus';

export class BattleScene extends Phaser.Scene {
  private heroes: Hero[] = [];
  private combatSystem!: CombatSystem;
  private commandSystem!: CommandSystem;
  private aiSystem!: AISystem;
  private waveSystem!: WaveSystem;
  private skillSystem!: SkillSystem;
  private commandIndicator!: CommandIndicator;
  private battleActive: boolean = false;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2d5a27)
      .setDepth(DEPTH.BACKGROUND);

    // Ground line
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 50, GAME_WIDTH, 100, 0x3d6a37)
      .setDepth(DEPTH.GROUND);

    // Create heroes
    this.createHeroes();

    // Initialize systems
    this.combatSystem = new CombatSystem(this);
    this.commandSystem = new CommandSystem(this, this.heroes, []);
    this.aiSystem = new AISystem();
    this.waveSystem = new WaveSystem(this, (enemy: Enemy) => {
      this.commandSystem.setEnemies(this.waveSystem.getEnemies());
    });
    this.skillSystem = new SkillSystem(this, this.combatSystem);
    this.commandIndicator = new CommandIndicator(this);

    // Set up event listeners
    this.setupEvents();

    // Launch UI scene on top
    this.scene.launch('BattleUIScene', {
      heroes: this.heroes,
      skillSystem: this.skillSystem,
      waveSystem: this.waveSystem,
      commandSystem: this.commandSystem,
    });

    // Start first wave
    this.battleActive = true;
    this.waveSystem.startNextWave();
  }

  private createHeroes(): void {
    for (let i = 0; i < ALL_HEROES.length; i++) {
      const classDef = ALL_HEROES[i];
      const pos = HERO_POSITIONS[i];
      const hero = new Hero(this, -60, pos.y, classDef, i);
      this.heroes.push(hero);

      // Entrance animation: slide in from left
      this.tweens.add({
        targets: hero,
        x: pos.x,
        duration: 600,
        delay: i * 150,
        ease: 'Back.easeOut',
      });
    }
  }

  private setupEvents(): void {
    EventBus.on(Events.ALL_WAVES_CLEAR, this.onVictory, this);
    EventBus.on(Events.HERO_DIED, this.onHeroDied, this);

    EventBus.on(Events.SKILL_BUTTON_PRESSED, (data: { heroId: string; skillId: string }) => {
      const hero = this.heroes.find(h => h.classDef.id === data.heroId && h.alive);
      if (hero) {
        this.skillSystem.useSkill(hero, data.skillId, this.heroes, this.waveSystem.getEnemies());
      }
    });
  }

  private onHeroDied(): void {
    // Screen shake on hero death
    this.cameras.main.shake(200, 0.01);

    const allDead = this.heroes.every(h => !h.alive);
    if (allDead) {
      this.battleActive = false;
      EventBus.emit(Events.ALL_HEROES_DEAD);
      this.time.delayedCall(1000, () => {
        this.cleanup();
        this.scene.start('DefeatScene');
      });
    }
  }

  private onVictory(): void {
    this.battleActive = false;
    this.time.delayedCall(1500, () => {
      this.cleanup();
      this.scene.start('VictoryScene');
    });
  }

  private cleanup(): void {
    EventBus.off(Events.ALL_WAVES_CLEAR, this.onVictory, this);
    EventBus.off(Events.HERO_DIED, this.onHeroDied, this);
    EventBus.removeAllListeners(Events.SKILL_BUTTON_PRESSED);
    this.scene.stop('BattleUIScene');
    this.combatSystem.clearProjectiles();
    this.commandIndicator.destroy();
  }

  update(time: number, delta: number): void {
    if (!this.battleActive) return;

    const dt = delta;
    const enemies = this.waveSystem.getEnemies();

    // Update wave system
    this.waveSystem.update(dt);

    // Update AI
    this.aiSystem.update(enemies, this.heroes, dt);

    // Update all characters
    for (const hero of this.heroes) {
      hero.update(time, dt);
    }
    for (const enemy of enemies) {
      enemy.update(time, dt);
    }

    // Process combat
    for (const hero of this.heroes) {
      if (hero.alive) {
        this.combatSystem.processAutoAttack(hero, this.heroes, enemies);
      }
    }
    for (const enemy of enemies) {
      if (enemy.alive) {
        this.combatSystem.processAutoAttack(enemy, this.heroes, enemies);
      }
    }

    // Update projectiles
    this.combatSystem.updateProjectiles(time, dt);

    // Update command indicators (curved arrows + focus rings)
    this.commandIndicator.update(this.heroes, dt);

    // Clear dead targets
    for (const hero of this.heroes) {
      if (hero.target && !hero.target.alive) {
        hero.target = null;
      }
    }
    for (const enemy of enemies) {
      if (enemy.target && !enemy.target.alive) {
        enemy.target = null;
      }
    }
  }
}
