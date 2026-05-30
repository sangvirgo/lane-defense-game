import { PlantType, EnemyType } from './types';

export class Renderer {
  static drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number, type: PlantType, time: number, hpRatio: number): void {
    const bob = Math.sin(time * 2) * 2;
    const size = 22;

    switch (type) {
      case PlantType.BasicShooter:
        Renderer.drawShooter(ctx, x, y + bob, size, '#4CAF50', '#2E7D32');
        break;
      case PlantType.DoubleShooter:
        Renderer.drawShooter(ctx, x, y + bob, size, '#2E7D32', '#1B5E20');
        Renderer.drawSmallLeaf(ctx, x - 8, y + bob - 5, 6);
        Renderer.drawSmallLeaf(ctx, x + 8, y + bob - 5, 6);
        break;
      case PlantType.Sunflower:
        Renderer.drawSunflower(ctx, x, y + bob, size, time);
        break;
      case PlantType.WallNut:
        Renderer.drawWallNut(ctx, x, y + bob, size, hpRatio);
        break;
      case PlantType.FreezePlant:
        Renderer.drawFreezePlant(ctx, x, y + bob, size, time);
        break;
      case PlantType.BombPlant:
        Renderer.drawBombPlant(ctx, x, y + bob, size, time);
        break;
      case PlantType.IceShooter:
        Renderer.drawShooter(ctx, x, y + bob, size, '#00BCD4', '#006064');
        Renderer.drawIceCrystal(ctx, x, y + bob - 15, 8);
        break;
      case PlantType.ShieldWall:
        Renderer.drawShieldWall(ctx, x, y + bob, size, hpRatio);
        break;
    }
  }

  private static drawShooter(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color1: string, color2: string): void {
    // Stem
    ctx.fillStyle = '#33691E';
    ctx.fillRect(x - 2, y + 5, 4, 15);
    // Head
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.arc(x, y - 2, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.arc(x, y - 5, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Barrel
    ctx.fillStyle = '#555';
    ctx.fillRect(x + 8, y - 5, 12, 4);
    // Leaves
    Renderer.drawSmallLeaf(ctx, x - 10, y + 2, 7);
    Renderer.drawSmallLeaf(ctx, x + 10, y + 2, 7);
  }

  private static drawSunflower(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Stem
    ctx.fillStyle = '#33691E';
    ctx.fillRect(x - 2, y + 5, 4, 15);
    // Petals
    const petalCount = 8;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + time * 0.5;
      const px = x + Math.cos(angle) * size * 0.5;
      const py = y - 2 + Math.sin(angle) * size * 0.5;
      ctx.fillStyle = '#FFD600';
      ctx.beginPath();
      ctx.ellipse(px, py, 6, 4, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.arc(x, y - 2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 3, y - 4, 2, 0, Math.PI * 2);
    ctx.arc(x + 3, y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    // Smile
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y - 1, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }

  private static drawWallNut(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hpRatio: number): void {
    // Body
    const color = hpRatio > 0.5 ? '#8D6E63' : hpRatio > 0.25 ? '#6D4C41' : '#4E342E';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.7, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shell lines
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, -0.3, 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, Math.PI - 0.3, Math.PI + 0.3);
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 6, y - 4, 3, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    // Mouth (worried when low HP)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (hpRatio > 0.5) {
      ctx.arc(x, y + 4, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    } else {
      ctx.arc(x, y + 10, 5, 1.1 * Math.PI, 1.9 * Math.PI);
    }
    ctx.stroke();
  }

  private static drawFreezePlant(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Stem
    ctx.fillStyle = '#00695C';
    ctx.fillRect(x - 2, y + 5, 4, 15);
    // Body
    ctx.fillStyle = '#29B6F6';
    ctx.beginPath();
    ctx.arc(x, y - 2, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // Snowflake pattern
    ctx.strokeStyle = '#E1F5FE';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time;
      ctx.beginPath();
      ctx.moveTo(x, y - 2);
      ctx.lineTo(x + Math.cos(angle) * 10, y - 2 + Math.sin(angle) * 10);
      ctx.stroke();
    }
    // Eyes
    ctx.fillStyle = '#01579B';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, 2, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawBombPlant(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Stem
    ctx.fillStyle = '#33691E';
    ctx.fillRect(x - 2, y + 5, 4, 10);
    // Body (bomb)
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.65, 0, Math.PI * 2);
    ctx.fill();
    // Fuse
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.65);
    ctx.quadraticCurveTo(x + 8, y - size * 0.9, x + 5, y - size * 1.1);
    ctx.stroke();
    // Spark
    const sparkAlpha = 0.5 + Math.sin(time * 10) * 0.5;
    ctx.globalAlpha = sparkAlpha;
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(x + 5, y - size * 1.1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawShieldWall(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hpRatio: number): void {
    // Shield body
    const color = hpRatio > 0.5 ? '#78909C' : hpRatio > 0.25 ? '#546E7A' : '#37474F';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.8, y - size * 0.5);
    ctx.lineTo(x + size * 0.8, y + size * 0.3);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.8, y + size * 0.3);
    ctx.lineTo(x - size * 0.8, y - size * 0.5);
    ctx.closePath();
    ctx.fill();
    // Border
    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Emblem
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(x - 5, y - 4, 2, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawSmallLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawIceCrystal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.strokeStyle = '#B3E5FC';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
      ctx.stroke();
    }
  }

  static drawEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, type: EnemyType, time: number, slowTimer: number, hitFlash: number = 0, deathAnim: number = 0): void {
    const wobble = Math.sin(time * 5) * 2;
    const size = 18;

    // Death animation
    if (deathAnim > 0) {
      ctx.globalAlpha = deathAnim * 2;
    }

    // Hit flash
    if (hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = 0.7;
    }

    switch (type) {
      case EnemyType.Basic:
        Renderer.drawBasicEnemy(ctx, x, y + wobble, size);
        break;
      case EnemyType.Fast:
        Renderer.drawFastEnemy(ctx, x, y + wobble, size, time);
        break;
      case EnemyType.Tank:
        Renderer.drawTankEnemy(ctx, x, y + wobble, size);
        break;
      case EnemyType.Shield:
        Renderer.drawShieldEnemy(ctx, x, y + wobble, size);
        break;
      case EnemyType.Boss:
        Renderer.drawBossEnemy(ctx, x, y + wobble, size * 1.5, time);
        break;
      case EnemyType.Flying:
        Renderer.drawFlyingEnemy(ctx, x, y + wobble - 10, size, time);
        break;
      case EnemyType.Healer:
        Renderer.drawHealerEnemy(ctx, x, y + wobble, size, time);
        break;
    }

    // Slow effect overlay
    if (slowTimer > 0) {
      ctx.fillStyle = 'rgba(41,182,246,0.3)';
      ctx.beginPath();
      ctx.arc(x, y, size + 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hit flash restore
    if (hitFlash > 0) {
      ctx.restore();
    }

    // Death animation restore
    if (deathAnim > 0) {
      ctx.globalAlpha = 1;
    }
  }

  private static drawBasicEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    // Body
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 5, y - 4, 4, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 6, y - 4, 2, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 5, 6, 0, Math.PI);
    ctx.stroke();
  }

  private static drawFastEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Body (teardrop shape)
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.7, size, 0, 0, Math.PI * 2);
    ctx.fill();
    // Speed lines
    ctx.strokeStyle = 'rgba(255,152,0,0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const ly = y - 8 + i * 8;
      ctx.beginPath();
      ctx.moveTo(x + size + 5, ly);
      ctx.lineTo(x + size + 15 + Math.sin(time * 10 + i) * 5, ly);
      ctx.stroke();
    }
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 3, y - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawTankEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    // Body (square-ish)
    ctx.fillStyle = '#795548';
    ctx.fillRect(x - size, y - size * 0.8, size * 2, size * 1.6);
    // Helmet
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.5, size * 0.9, Math.PI, 0);
    ctx.fill();
    // Eyes (angry)
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(x - 6, y - 2, 4, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 6, y - 2, 2, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    // Angry brows
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 8);
    ctx.lineTo(x - 3, y - 5);
    ctx.moveTo(x + 10, y - 8);
    ctx.lineTo(x + 3, y - 5);
    ctx.stroke();
  }

  private static drawShieldEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    // Body
    ctx.fillStyle = '#607D8B';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // Shield
    ctx.fillStyle = '#455A64';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.8, y - size);
    ctx.lineTo(x + size * 0.3, y - size);
    ctx.lineTo(x + size * 0.3, y + size * 0.5);
    ctx.lineTo(x - size * 0.8, y + size * 0.5);
    ctx.closePath();
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawFlyingEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Body
    ctx.fillStyle = '#E91E63';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.8, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wings
    const wingAngle = Math.sin(time * 8) * 0.5;
    ctx.fillStyle = '#C2185B';
    ctx.beginPath();
    ctx.ellipse(x - size, y - 5, size * 0.7, size * 0.3, wingAngle, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size, y - 5, size * 0.7, size * 0.3, -wingAngle, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawHealerEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Body
    ctx.fillStyle = '#00BCD4';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // Cross symbol
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 2, y - 8, 4, 16);
    ctx.fillRect(x - 8, y - 2, 16, 4);
    // Glow effect
    const glow = 0.3 + Math.sin(time * 3) * 0.2;
    ctx.strokeStyle = `rgba(0,188,212,${glow})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, size + 5, 0, Math.PI * 2);
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawBossEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Body (large)
    ctx.fillStyle = '#9C27B0';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // Horns
    ctx.fillStyle = '#6A1B9A';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.6, y - size * 0.8);
    ctx.lineTo(x - size * 0.3, y - size * 1.4);
    ctx.lineTo(x - size * 0.1, y - size * 0.7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.6, y - size * 0.8);
    ctx.lineTo(x + size * 0.3, y - size * 1.4);
    ctx.lineTo(x + size * 0.1, y - size * 0.7);
    ctx.fill();
    // Eyes (glowing)
    const glow = 0.5 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = `rgba(255,0,0,${glow})`;
    ctx.beginPath();
    ctx.arc(x - 8, y - 5, 6, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF0';
    ctx.beginPath();
    ctx.arc(x - 8, y - 5, 3, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.strokeStyle = '#4A148C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y + 8, 10, 0, Math.PI);
    ctx.stroke();
    // Teeth
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x - 8 + i * 5, y + 8, 3, 4);
    }
  }

  static drawProjectile(ctx: CanvasRenderingContext2D, x: number, y: number, type: PlantType, _time: number): void {
    switch (type) {
      case PlantType.FreezePlant:
      case PlantType.IceShooter:
        // Ice projectile
        ctx.fillStyle = '#B3E5FC';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#E1F5FE';
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case PlantType.BombPlant:
        // Fire projectile
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        // Trail
        ctx.fillStyle = 'rgba(255,87,34,0.3)';
        ctx.beginPath();
        ctx.arc(x - 8, y, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        // Pea projectile
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#81C784';
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, 2, 0, Math.PI * 2);
        ctx.fill();
        // Trail
        ctx.fillStyle = 'rgba(76,175,80,0.2)';
        ctx.beginPath();
        ctx.arc(x - 6, y, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  static drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.4);
    skyGrad.addColorStop(0, '#1a1a3e');
    skyGrad.addColorStop(1, '#2d3a4a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.4);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 20; i++) {
      const sx = (i * 137.5 + time * 2) % width;
      const sy = (i * 73.7) % (height * 0.35);
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + Math.sin(time + i) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Moon
    ctx.fillStyle = '#FFF9C4';
    ctx.beginPath();
    ctx.arc(width - 60, 40, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a3e';
    ctx.beginPath();
    ctx.arc(width - 52, 36, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}
