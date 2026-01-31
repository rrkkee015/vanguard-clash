import Phaser from 'phaser';

// Typed event bus for cross-scene communication
export const EventBus = new Phaser.Events.EventEmitter();

// Event name constants
export const Events = {
  // Combat events
  HERO_DAMAGED: 'hero-damaged',
  ENEMY_DAMAGED: 'enemy-damaged',
  HERO_DIED: 'hero-died',
  ENEMY_DIED: 'enemy-died',
  HERO_HEALED: 'hero-healed',

  // Command events
  HERO_SELECTED: 'hero-selected',
  HERO_DESELECTED: 'hero-deselected',
  COMMAND_ISSUED: 'command-issued',

  // Wave events
  WAVE_START: 'wave-start',
  WAVE_CLEAR: 'wave-clear',
  ALL_WAVES_CLEAR: 'all-waves-clear',
  ALL_HEROES_DEAD: 'all-heroes-dead',

  // Skill events
  SKILL_USED: 'skill-used',
  SKILL_COOLDOWN_UPDATE: 'skill-cooldown-update',
  SKILL_READY: 'skill-ready',

  // Status effects
  STATUS_APPLIED: 'status-applied',
  STATUS_REMOVED: 'status-removed',

  // UI events
  SELECT_HERO_FOR_SKILL: 'select-hero-for-skill',
  SKILL_BUTTON_PRESSED: 'skill-button-pressed',
} as const;
