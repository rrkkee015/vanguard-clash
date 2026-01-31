import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { HeroPortrait } from '../ui/HeroPortrait';
import { SkillButton } from '../ui/SkillButton';
import { WaveIndicator } from '../ui/WaveIndicator';
import { SkillDefs } from '../data/SkillDefinitions';
import { ALL_HEROES } from '../data/HeroDefinitions';
import { SkillSystem } from '../systems/SkillSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { CommandSystem } from '../systems/CommandSystem';
import { GAME_WIDTH, GAME_HEIGHT, PORTRAIT_SIZE, SKILL_BUTTON_SIZE, UI_PADDING } from '../constants';
import { EventBus, Events } from '../utils/EventBus';

export class BattleUIScene extends Phaser.Scene {
  private heroes: Hero[] = [];
  private skillSystem!: SkillSystem;
  private waveSystem!: WaveSystem;
  private commandSystem!: CommandSystem;

  private portraits: HeroPortrait[] = [];
  private skillButtons: SkillButton[] = [];
  private waveIndicator!: WaveIndicator;
  private selectedHeroId: string | null = null;

  constructor() {
    super({ key: 'BattleUIScene' });
  }

  init(data: {
    heroes: Hero[];
    skillSystem: SkillSystem;
    waveSystem: WaveSystem;
    commandSystem: CommandSystem;
  }): void {
    this.heroes = data.heroes;
    this.skillSystem = data.skillSystem;
    this.waveSystem = data.waveSystem;
    this.commandSystem = data.commandSystem;
  }

  create(): void {
    // Wave indicator
    this.waveIndicator = new WaveIndicator(this);

    // Hero portraits along the bottom
    this.createPortraits();

    // Setup event listeners
    this.setupEvents();
  }

  private createPortraits(): void {
    const startX = UI_PADDING + PORTRAIT_SIZE / 2;
    const y = GAME_HEIGHT - PORTRAIT_SIZE / 2 - UI_PADDING;

    for (let i = 0; i < ALL_HEROES.length; i++) {
      const classDef = ALL_HEROES[i];
      const x = startX + i * (PORTRAIT_SIZE + UI_PADDING);
      const portrait = new HeroPortrait(this, x, y, classDef);

      portrait.on('pointerdown', () => {
        this.onPortraitTapped(classDef.id);
      });

      this.portraits.push(portrait);
    }
  }

  private onPortraitTapped(heroId: string): void {
    this.commandSystem.selectHeroById(heroId);
    this.selectHero(heroId);
  }

  private selectHero(heroId: string): void {
    // Update portrait selection
    for (const portrait of this.portraits) {
      portrait.setSelected(portrait.getHeroId() === heroId);
    }

    this.selectedHeroId = heroId;

    // Clear old skill buttons
    this.clearSkillButtons();

    // Create skill buttons for selected hero
    const hero = this.heroes.find(h => h.classDef.id === heroId);
    if (!hero || !hero.alive) return;

    const startX = GAME_WIDTH - UI_PADDING - SKILL_BUTTON_SIZE / 2;
    const y = GAME_HEIGHT - SKILL_BUTTON_SIZE / 2 - UI_PADDING;

    for (let i = 0; i < hero.classDef.skills.length; i++) {
      const skillId = hero.classDef.skills[i];
      const skillDef = SkillDefs[skillId];
      if (!skillDef) continue;

      const x = startX - i * (SKILL_BUTTON_SIZE + UI_PADDING);
      const btn = new SkillButton(this, x, y, skillDef);

      btn.on('pointerdown', () => {
        if (btn.getIsReady()) {
          EventBus.emit(Events.SKILL_BUTTON_PRESSED, { heroId, skillId });
          btn.startCooldown();
        }
      });

      this.skillButtons.push(btn);
    }
  }

  private clearSkillButtons(): void {
    for (const btn of this.skillButtons) {
      btn.destroy();
    }
    this.skillButtons = [];
  }

  private tryUseSkillByIndex(index: number): void {
    if (!this.selectedHeroId) return;
    const btn = this.skillButtons[index];
    if (!btn) return;
    if (!btn.getIsReady()) return;

    const heroId = this.selectedHeroId;
    const skillId = btn.getSkillDef().id;
    EventBus.emit(Events.SKILL_BUTTON_PRESSED, { heroId, skillId });
    btn.startCooldown();
  }

  private setupEvents(): void {
    // Keyboard shortcuts: A = left button, S = right button
    // skillButtons are stored right-to-left, so reverse the index
    this.input.keyboard!.on('keydown-A', () => this.tryUseSkillByIndex(this.skillButtons.length - 1));
    this.input.keyboard!.on('keydown-S', () => this.tryUseSkillByIndex(this.skillButtons.length - 2));

    // Hero selection: 1~4 keys
    this.input.keyboard!.on('keydown-ONE', () => this.onPortraitTapped(ALL_HEROES[0].id));
    this.input.keyboard!.on('keydown-TWO', () => this.onPortraitTapped(ALL_HEROES[1].id));
    this.input.keyboard!.on('keydown-THREE', () => this.onPortraitTapped(ALL_HEROES[2].id));
    this.input.keyboard!.on('keydown-FOUR', () => this.onPortraitTapped(ALL_HEROES[3].id));

    EventBus.on(Events.HERO_SELECTED, (data: { hero: Hero }) => {
      this.selectHero(data.hero.classDef.id);
    });

    EventBus.on(Events.HERO_DESELECTED, () => {
      for (const portrait of this.portraits) {
        portrait.setSelected(false);
      }
      this.selectedHeroId = null;
      this.clearSkillButtons();
    });

    EventBus.on(Events.WAVE_START, (data: { wave: number; total: number; name: string }) => {
      this.waveIndicator.setWave(data.wave, data.total);
      this.waveIndicator.showMessage(data.name, 2500);
    });

    EventBus.on(Events.WAVE_CLEAR, () => {
      this.waveIndicator.showMessage('Wave Clear!', 1500);
    });

    EventBus.on(Events.ALL_WAVES_CLEAR, () => {
      this.waveIndicator.showMessage('VICTORY!', 3000);
    });

    EventBus.on(Events.ALL_HEROES_DEAD, () => {
      this.waveIndicator.showMessage('DEFEATED...', 2000);
    });

    EventBus.on(Events.HERO_DIED, (data: { hero: Hero }) => {
      const portrait = this.portraits.find(p => p.getHeroId() === data.hero.classDef.id);
      if (portrait) {
        portrait.setDead();
      }
    });

    EventBus.on(Events.SKILL_USED, (data: { hero: Hero; skillId: string }) => {
      // Update cooldown on corresponding button if it's the selected hero
      if (data.hero.classDef.id === this.selectedHeroId) {
        const btn = this.skillButtons.find(b => b.getSkillDef().id === data.skillId);
        if (btn) {
          btn.startCooldown();
        }
      }
    });
  }

  update(_time: number, delta: number): void {
    const dt = delta;

    // Update hero HP on portraits
    for (let i = 0; i < this.heroes.length; i++) {
      const hero = this.heroes[i];
      if (this.portraits[i]) {
        this.portraits[i].updateHp(hero.currentHp / hero.maxHp);
      }
    }

    // Update skill button cooldowns
    for (const btn of this.skillButtons) {
      btn.updateCooldown(dt);
    }

    // Sync skill cooldowns from hero
    if (this.selectedHeroId) {
      const hero = this.heroes.find(h => h.classDef.id === this.selectedHeroId);
      if (hero && hero.alive) {
        for (const btn of this.skillButtons) {
          const cd = hero.skillCooldowns.get(btn.getSkillDef().id) ?? 0;
          if (cd > 0 && btn.getIsReady()) {
            btn.startCooldown();
          }
        }
      }
    }
  }
}
