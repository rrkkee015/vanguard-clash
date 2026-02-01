// Game resolution
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Depths
export const DEPTH = {
  BACKGROUND: 0,
  GROUND: 10,
  ENTITY: 20,
  PROJECTILE: 30,
  EFFECT: 40,
  UI: 50,
  COMMAND_LINE: 60,
} as const;

// Combat
export const MELEE_RANGE = 60;
export const DEFAULT_ATTACK_COOLDOWN = 1000; // ms
export const PROJECTILE_SPEED = 400;
export const DAMAGE_VARIANCE_MIN = 0.9;
export const DAMAGE_VARIANCE_MAX = 1.1;

// Movement
export const HERO_SPEED = 150;
export const ENEMY_SPEED = 100;
export const ARRIVAL_THRESHOLD = 5;

// Command system
export const TAP_THRESHOLD = 10; // px – under this distance counts as tap
export const COMMAND_LINE_ALPHA = 0.6;

// Health bar
export const HEALTH_BAR_WIDTH = 40;
export const HEALTH_BAR_HEIGHT = 5;
export const HEALTH_BAR_OFFSET_Y = -30;

// Wave
export const WAVE_DELAY = 2000; // ms between waves
export const SPAWN_STAGGER = 500; // ms between enemy spawns

// Hero spawn positions (left side)
export const HERO_POSITIONS = [
  { x: 150, y: 250 },
  { x: 100, y: 370 },
  { x: 150, y: 490 },
  { x: 100, y: 610 },
] as const;

// Enemy spawn area (right side)
export const ENEMY_SPAWN_X = 1350;
export const ENEMY_MIN_Y = 200;
export const ENEMY_MAX_Y = 650;

// UI
export const PORTRAIT_SIZE = 80;
export const SKILL_BUTTON_SIZE = 50;
export const UI_PADDING = 10;

// Colors
export const COLORS = {
  KNIGHT: 0x4488ff,
  CLERIC: 0xffdd44,
  ARCHER: 0x44cc44,
  WIZARD: 0xaa44ff,
  ENEMY: 0xff4444,
  ENEMY_RANGED: 0xff8844,
  BOSS: 0xcc0000,
  HEALTH_BG: 0x333333,
  HEALTH_GREEN: 0x44ff44,
  HEALTH_YELLOW: 0xffff00,
  HEALTH_RED: 0xff2222,
  COMMAND_ATTACK: 0xff0000,
  COMMAND_HEAL: 0x00ff00,
  COMMAND_MOVE: 0xffff00,
  SHIELD: 0x6688ff,
} as const;

// Skill cooldowns (ms)
export const SKILL_COOLDOWNS = {
  SHIELD_BASH: 8000,
  TAUNT: 12000,
  GROUP_HEAL: 10000,
  DIVINE_SHIELD: 15000,
  POWER_SHOT: 6000,
  MULTI_SHOT: 10000,
  FIREBALL: 8000,
  BLIZZARD: 14000,
} as const;

// Status effect durations (ms)
export const STATUS_DURATIONS = {
  STUN: 2000,
  SLOW: 4000,
  SHIELD: 5000,
  TAUNT: 3000,
} as const;
