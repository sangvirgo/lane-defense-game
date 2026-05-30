import { PlantType, EnemyType } from './types';
import * as C from './Constants';

interface Cloud {
  x: number;
  y: number;
  width: number;
  speed: number;
}

export class Renderer {
  private static clouds: Cloud[] = [];
  private static cloudsInitialized = false;

  private static initClouds(): void {
    if (this.cloudsInitialized) return;
    this.cloudsInitialized = true;
    for (let i = 0; i < C.CLOUD_COUNT; i++) {
      this.clouds.push({
        x: Math.random() * C.CANVAS_WIDTH * 1.5,
        y: 10 + Math.random() * 50,
        width: 40 + Math.random() * 60,
        speed: 8 + Math.random() * 12,
      });
    }
  }

  static drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number, type: PlantType, time: number, hpRatio: number): void {
    const bob = Math.sin(time * 2) * 2;
    const size = 24;

    switch (type) {
      case PlantType.BasicShooter:
        Renderer.drawShooter(ctx, x, y + bob, size, '#4CAF50', '#2E7D32', time);
        break;
      case PlantType.DoubleShooter:
        Renderer.drawShooter(ctx, x, y + bob, size, '#2E7D32', '#1B5E20', time);
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
        Renderer.drawShooter(ctx, x, y + bob, size, '#00BCD4', '#006064', time);
        Renderer.drawIceCrystal(ctx, x, y + bob - 15, 8);
        break;
      case PlantType.ShieldWall:
        Renderer.drawShieldWall(ctx, x, y + bob, size, hpRatio);
        break;
    }
  }

  private static drawShooter(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color1: string, color2: string, time: number): void {
    // Stem
    ctx.fillStyle = '#33691E';
    ctx.fillRect(x - 3, y + 5, 6, 18);
    // Leaves on stem
    Renderer.drawSmallLeaf(ctx, x - 10, y + 10, 8);
    Renderer.drawSmallLeaf(ctx, x + 10, y + 12, 8);
    // Head
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.arc(x, y - 2, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    // Inner circle
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.arc(x, y - 2, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 4, y - 5, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    const lookX = Math.sin(time * 1.5) * 1;
    ctx.beginPath();
    ctx.arc(x - 4 + lookX, y - 5, 1.8, 0, Math.PI * 2);
    ctx.arc(x + 4 + lookX, y - 5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y + 2, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    // Barrel
    ctx.fillStyle = '#555';
    ctx.fillRect(x + 8, y - 6, 14, 5);
    ctx.fillStyle = '#777';
    ctx.fillRect(x + 8, y - 6, 14, 2);
    // Barrel tip
    ctx.fillStyle = '#444';
    ctx.fillRect(x + 20, y - 7, 3, 7);
  }

  private static drawSunflower(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Stem
    ctx.fillStyle = '#33691E';
    ctx.fillRect(x - 3, y + 5, 6, 18);
    Renderer.drawSmallLeaf(ctx, x - 10, y + 12, 7);
    Renderer.drawSmallLeaf(ctx, x + 10, y + 10, 7);
    // Petals
    const petalCount = 10;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + time * 0.5;
      const px = x + Math.cos(angle) * size * 0.5;
      const py = y - 2 + Math.sin(angle) * size * 0.5;
      ctx.fillStyle = i % 2 === 0 ? '#FFD600' : '#FFC107';
      ctx.beginPath();
      ctx.ellipse(px, py, 7, 4.5, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.arc(x, y - 2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Center dots
    ctx.fillStyle = '#5D4037';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 4, y - 2 + Math.sin(a) * 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 5, y - 4, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(x - 5, y - 4, 2, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    // Happy smile
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    // Cheeks
    ctx.fillStyle = 'rgba(255,138,101,0.4)';
    ctx.beginPath();
    ctx.arc(x - 9, y, 3, 0, Math.PI * 2);
    ctx.arc(x + 9, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawWallNut(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hpRatio: number): void {
    // Body
    const color = hpRatio > 0.5 ? '#8D6E63' : hpRatio > 0.25 ? '#6D4C41' : '#4E342E';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.7, size * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shell texture
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, -0.3, 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, Math.PI - 0.3, Math.PI + 0.3);
    ctx.stroke();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 8, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 7, y - 5, 4, 0, Math.PI * 2);
    ctx.arc(x + 7, y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 7, y - 5, 2, 0, Math.PI * 2);
    ctx.arc(x + 7, y - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (hpRatio > 0.5) {
      ctx.arc(x, y + 5, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    } else if (hpRatio > 0.25) {
      ctx.moveTo(x - 5, y + 6);
      ctx.lineTo(x + 5, y + 6);
    } else {
      ctx.arc(x, y + 12, 5, 1.1 * Math.PI, 1.9 * Math.PI);
    }
    ctx.stroke();
  }

  private static drawFreezePlant(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Stem
    ctx.fillStyle = '#00695C';
    ctx.fillRect(x - 3, y + 5, 6, 18);
    // Body
    ctx.fillStyle = '#29B6F6';
    ctx.beginPath();
    ctx.arc(x, y - 2, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.fillStyle = 'rgba(179,229,252,0.5)';
    ctx.beginPath();
    ctx.arc(x, y - 2, size * 0.3, 0, Math.PI * 2);
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
      // Branch tips
      const tipX = x + Math.cos(angle) * 10;
      const tipY = y - 2 + Math.sin(angle) * 10;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + Math.cos(angle + 0.5) * 4, tipY + Math.sin(angle + 0.5) * 4);
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + Math.cos(angle - 0.5) * 4, tipY + Math.sin(angle - 0.5) * 4);
      ctx.stroke();
    }
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#01579B';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawBombPlant(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Stem
    ctx.fillStyle = '#33691E';
    ctx.fillRect(x - 3, y + 5, 6, 12);
    // Body (bomb)
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.65, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    // Fuse
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.65);
    ctx.quadraticCurveTo(x + 8, y - size * 0.9, x + 5, y - size * 1.1);
    ctx.stroke();
    // Spark
    const sparkAlpha = 0.5 + Math.sin(time * 10) * 0.5;
    ctx.globalAlpha = sparkAlpha;
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(x + 5, y - size * 1.1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(x + 5, y - size * 1.1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Angry eyes
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 3, 1.5, 0, Math.PI * 2);
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
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    // Cross on emblem
    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x + 4, y);
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 4);
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 6, y - 6, 3, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(x - 6, y - 6, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawSmallLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Leaf vein
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.6, y);
    ctx.lineTo(x + size * 0.6, y);
    ctx.stroke();
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
      // Small branches
      const mx = x + Math.cos(angle) * size * 0.6;
      const my = y + Math.sin(angle) * size * 0.6;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + Math.cos(angle + 0.8) * 3, my + Math.sin(angle + 0.8) * 3);
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + Math.cos(angle - 0.8) * 3, my + Math.sin(angle - 0.8) * 3);
      ctx.stroke();
    }
  }

  static drawEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, type: EnemyType, time: number, slowTimer: number, hitFlash: number = 0, deathAnim: number = 0): void {
    const wobble = Math.sin(time * 5) * 2;
    const size = 20;

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
        Renderer.drawBasicEnemy(ctx, x, y + wobble, size, time);
        break;
      case EnemyType.Fast:
        Renderer.drawFastEnemy(ctx, x, y + wobble, size, time);
        break;
      case EnemyType.Tank:
        Renderer.drawTankEnemy(ctx, x, y + wobble, size, time);
        break;
      case EnemyType.Shield:
        Renderer.drawShieldEnemy(ctx, x, y + wobble, size, time);
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
      ctx.arc(x, y, size + 3, 0, Math.PI * 2);
      ctx.fill();
      // Ice crystals around
      ctx.strokeStyle = 'rgba(179,229,252,0.6)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const a = time * 2 + i * Math.PI / 2;
        const cx = x + Math.cos(a) * (size + 6);
        const cy = y + Math.sin(a) * (size + 6);
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy);
        ctx.lineTo(cx + 3, cy);
        ctx.moveTo(cx, cy - 3);
        ctx.lineTo(cx, cy + 3);
        ctx.stroke();
      }
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

  private static drawBasicEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Body
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // Darker shade
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.arc(x, y + 3, size, 0, Math.PI);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 6, y - 4, 5, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    const lookX = Math.sin(time * 2) * 1;
    ctx.beginPath();
    ctx.arc(x - 6 + lookX, y - 4, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 6 + lookX, y - 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Angry brows
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x - 3, y - 7);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x + 3, y - 7);
    ctx.stroke();
    // Mouth
    ctx.beginPath();
    ctx.arc(x, y + 7, 6, 0, Math.PI);
    ctx.stroke();
    // Teeth
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 4, y + 7, 2, 3);
    ctx.fillRect(x + 2, y + 7, 2, 3);
  }

  private static drawFastEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Body (teardrop shape)
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.7, size, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stripe
    ctx.fillStyle = '#F57C00';
    ctx.beginPath();
    ctx.ellipse(x, y + 3, size * 0.5, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Speed lines
    ctx.strokeStyle = 'rgba(255,152,0,0.5)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const ly = y - 8 + i * 8;
      const len = 10 + Math.sin(time * 10 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(x + size + 5, ly);
      ctx.lineTo(x + size + 5 + len, ly);
      ctx.stroke();
    }
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 4, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 2, 0, Math.PI * 2);
    ctx.arc(x + 3, y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    // Excited mouth
    ctx.fillStyle = '#E65100';
    ctx.beginPath();
    ctx.arc(x, y + 5, 4, 0, Math.PI);
    ctx.fill();
  }

  private static drawTankEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, _time: number): void {
    // Body (square-ish)
    ctx.fillStyle = '#795548';
    const rr = 4;
    ctx.beginPath();
    ctx.moveTo(x - size + rr, y - size * 0.8);
    ctx.lineTo(x + size - rr, y - size * 0.8);
    ctx.quadraticCurveTo(x + size, y - size * 0.8, x + size, y - size * 0.8 + rr);
    ctx.lineTo(x + size, y + size * 0.8 - rr);
    ctx.quadraticCurveTo(x + size, y + size * 0.8, x + size - rr, y + size * 0.8);
    ctx.lineTo(x - size + rr, y + size * 0.8);
    ctx.quadraticCurveTo(x - size, y + size * 0.8, x - size, y + size * 0.8 - rr);
    ctx.lineTo(x - size, y - size * 0.8 + rr);
    ctx.quadraticCurveTo(x - size, y - size * 0.8, x - size + rr, y - size * 0.8);
    ctx.closePath();
    ctx.fill();
    // Helmet
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.5, size * 0.9, Math.PI, 0);
    ctx.fill();
    // Helmet ridge
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(x - size * 0.8, y - size * 0.55, size * 1.6, 4);
    // Eyes (angry, glowing)
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(x - 7, y - 2, 5, 0, Math.PI * 2);
    ctx.arc(x + 7, y - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - 7, y - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 7, y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Angry brows
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 9);
    ctx.lineTo(x - 3, y - 6);
    ctx.moveTo(x + 12, y - 9);
    ctx.lineTo(x + 3, y - 6);
    ctx.stroke();
    // Mouth
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 8);
    ctx.lineTo(x + 6, y + 8);
    ctx.stroke();
  }

  private static drawShieldEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, _time: number): void {
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
    // Shield border
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Shield rivets
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.arc(x - size * 0.5, y - size * 0.6, 2, 0, Math.PI * 2);
    ctx.arc(x - size * 0.5, y + size * 0.2, 2, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath();
    ctx.arc(x + 4, y - 3, 4, 0, Math.PI * 2);
    ctx.arc(x + 12, y - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x + 4, y - 3, 2, 0, Math.PI * 2);
    ctx.arc(x + 12, y - 3, 2, 0, Math.PI * 2);
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
    // Wing veins
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - size, y - 5);
    ctx.lineTo(x - size * 1.5, y - 10);
    ctx.moveTo(x + size, y - 5);
    ctx.lineTo(x + size * 1.5, y - 10);
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#880E4F';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 2, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    // Fangs
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 4);
    ctx.lineTo(x - 1, y + 8);
    ctx.lineTo(x + 1, y + 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 4);
    ctx.lineTo(x + 3, y + 8);
    ctx.lineTo(x + 5, y + 4);
    ctx.fill();
  }

  private static drawHealerEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Body
    ctx.fillStyle = '#00BCD4';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    const glow = 0.3 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(255,255,255,${glow * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    // Cross symbol
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 2, y - 8, 4, 16);
    ctx.fillRect(x - 8, y - 2, 16, 4);
    // Glow ring
    ctx.strokeStyle = `rgba(0,188,212,${glow})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, size + 5, 0, Math.PI * 2);
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 6, y - 5, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#006064';
    ctx.beginPath();
    ctx.arc(x - 6, y - 5, 2, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    // Kind smile
    ctx.strokeStyle = '#006064';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y + 3, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }

  private static drawBossEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
    // Body (large)
    ctx.fillStyle = '#9C27B0';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // Darker shade
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(x, y + 5, size, 0, Math.PI);
    ctx.fill();
    // Horns
    ctx.fillStyle = '#6A1B9A';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.6, y - size * 0.8);
    ctx.lineTo(x - size * 0.3, y - size * 1.5);
    ctx.lineTo(x - size * 0.1, y - size * 0.7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.6, y - size * 0.8);
    ctx.lineTo(x + size * 0.3, y - size * 1.5);
    ctx.lineTo(x + size * 0.1, y - size * 0.7);
    ctx.fill();
    // Horn tips
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 1.5, 3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 1.5, 3, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (glowing)
    const glow = 0.5 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = `rgba(255,0,0,${glow})`;
    ctx.beginPath();
    ctx.arc(x - 10, y - 5, 7, 0, Math.PI * 2);
    ctx.arc(x + 10, y - 5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF0';
    ctx.beginPath();
    ctx.arc(x - 10, y - 5, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 10, y - 5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - 10, y - 5, 2, 0, Math.PI * 2);
    ctx.arc(x + 10, y - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.strokeStyle = '#4A148C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y + 10, 12, 0, Math.PI);
    ctx.stroke();
    // Teeth
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 5; i++) {
      const tx = x - 10 + i * 5;
      ctx.beginPath();
      ctx.moveTo(tx, y + 10);
      ctx.lineTo(tx + 2, y + 15);
      ctx.lineTo(tx + 4, y + 10);
      ctx.fill();
    }
    // Aura
    ctx.strokeStyle = `rgba(156,39,176,${0.3 + Math.sin(time * 2) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  static drawProjectile(ctx: CanvasRenderingContext2D, x: number, y: number, type: PlantType, time: number): void {
    switch (type) {
      case PlantType.FreezePlant:
      case PlantType.IceShooter:
        // Ice projectile with trail
        ctx.fillStyle = 'rgba(179,229,252,0.3)';
        ctx.beginPath();
        ctx.arc(x - 10, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(179,229,252,0.15)';
        ctx.beginPath();
        ctx.arc(x - 18, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#B3E5FC';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#E1F5FE';
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Sparkle
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        const sa = time * 5;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(sa) * 3, y + Math.sin(sa) * 3);
        ctx.lineTo(x - Math.cos(sa) * 3, y - Math.sin(sa) * 3);
        ctx.stroke();
        break;
      case PlantType.BombPlant:
        // Fire projectile with trail
        ctx.fillStyle = 'rgba(255,87,34,0.2)';
        ctx.beginPath();
        ctx.arc(x - 15, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,87,34,0.1)';
        ctx.beginPath();
        ctx.arc(x - 25, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        // Smoke particles
        ctx.fillStyle = 'rgba(100,100,100,0.2)';
        ctx.beginPath();
        ctx.arc(x - 8, y + Math.sin(time * 8) * 3, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        // Pea projectile with trail
        ctx.fillStyle = 'rgba(76,175,80,0.2)';
        ctx.beginPath();
        ctx.arc(x - 10, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(76,175,80,0.1)';
        ctx.beginPath();
        ctx.arc(x - 18, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#81C784';
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  static drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
    // Blue sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.35);
    skyGrad.addColorStop(0, '#4FC3F7');
    skyGrad.addColorStop(0.5, '#81D4FA');
    skyGrad.addColorStop(1, '#B3E5FC');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.35);

    // Sun with rays
    const sunX = width - 60;
    const sunY = 40;
    // Sun glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 40);
    sunGlow.addColorStop(0, 'rgba(255,235,59,0.8)');
    sunGlow.addColorStop(1, 'rgba(255,235,59,0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
    ctx.fill();
    // Sun rays
    ctx.strokeStyle = 'rgba(255,235,59,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.3;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * 25, sunY + Math.sin(angle) * 25);
      ctx.lineTo(sunX + Math.cos(angle) * 38, sunY + Math.sin(angle) * 38);
      ctx.stroke();
    }
    // Sun body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 16, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    Renderer.initClouds();
    for (const cloud of Renderer.clouds) {
      cloud.x += cloud.speed * (1 / 60); // approximate per-frame
      if (cloud.x > width + cloud.width) {
        cloud.x = -cloud.width;
        cloud.y = 10 + Math.random() * 50;
      }
      Renderer.drawCloud(ctx, cloud.x, cloud.y, cloud.width);
    }

    // Grass/lawn base
    const grassGrad = ctx.createLinearGradient(0, height * 0.25, 0, height);
    grassGrad.addColorStop(0, '#66BB6A');
    grassGrad.addColorStop(0.2, '#4CAF50');
    grassGrad.addColorStop(0.5, '#43A047');
    grassGrad.addColorStop(1, '#2E7D32');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, height * 0.15, width, height * 0.85);

    // Lawn stripes
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * (width / 10), height * 0.15, width / 10, height);
      }
    }

    // Fence on left
    Renderer.drawFence(ctx, height);

    // House wall at top
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, 0, width, height * 0.04);
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(0, height * 0.04, width, 3);
  }

  private static drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, width: number): void {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const h = width * 0.4;
    ctx.beginPath();
    ctx.arc(x, y + h * 0.5, h * 0.5, 0, Math.PI * 2);
    ctx.arc(x + width * 0.3, y + h * 0.2, h * 0.6, 0, Math.PI * 2);
    ctx.arc(x + width * 0.6, y + h * 0.3, h * 0.55, 0, Math.PI * 2);
    ctx.arc(x + width * 0.85, y + h * 0.5, h * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawFence(ctx: CanvasRenderingContext2D, _canvasHeight: number): void {
    const fenceX = C.GRID_OFFSET_X - 12;
    const fenceTop = C.GRID_OFFSET_Y - 10;
    const fenceBottom = C.GRID_OFFSET_Y + C.GRID_ROWS * C.CELL_SIZE + 10;
    const postCount = 6;
    const postSpacing = (fenceBottom - fenceTop) / (postCount - 1);

    // Horizontal rails
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(fenceX - 2, fenceTop + 10, 8, 3);
    ctx.fillRect(fenceX - 2, fenceBottom - 15, 8, 3);
    ctx.fillRect(fenceX - 2, (fenceTop + fenceBottom) / 2 - 2, 8, 3);

    // Vertical posts
    for (let i = 0; i < postCount; i++) {
      const py = fenceTop + i * postSpacing;
      ctx.fillStyle = '#795548';
      ctx.fillRect(fenceX - 4, py, 12, 8);
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(fenceX - 4, py, 12, 3);
      // Post cap
      ctx.fillStyle = '#8D6E63';
      ctx.beginPath();
      ctx.arc(fenceX + 2, py, 6, Math.PI, 0);
      ctx.fill();
    }
  }
}
