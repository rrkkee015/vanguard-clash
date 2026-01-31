import Phaser from 'phaser';

export function createPlaceholderTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  color: number,
): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(color, 1);
  g.fillRect(0, 0, width, height);

  // Add a border for visibility
  g.lineStyle(2, 0xffffff, 0.5);
  g.strokeRect(1, 1, width - 2, height - 2);

  g.generateTexture(key, width, height);
  g.destroy();
}

export function createCircleTexture(
  scene: Phaser.Scene,
  key: string,
  radius: number,
  color: number,
): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(color, 1);
  g.fillCircle(radius, radius, radius);
  g.generateTexture(key, radius * 2, radius * 2);
  g.destroy();
}

export function flashSprite(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Components.Tint & Phaser.GameObjects.GameObject,
  color: number = 0xffffff,
  duration: number = 100,
): void {
  target.setTint(color);
  scene.time.delayedCall(duration, () => {
    target.clearTint();
  });
}
